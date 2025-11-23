import { openai } from "@ai-sdk/openai";
import { type Connection, routeAgentRequest, type WSMessage } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  type StreamTextOnFinishCallback,
  stepCountIs,
  streamText,
  type ToolSet,
  StepResult,
} from "ai";
import { v4 as uuidv4 } from "uuid";
import type { ControlMessage } from "../lib/messages.ts";
import { getBookingForOffer } from "../lib/sixt/api.ts";
import type { Offer, OfferId } from "../lib/sixt/types.ts";
import { type AgentState, getAvailableOffers } from "../lib/state";
import { getInitialScratchpad } from "./scratchpad.ts";
import { getSystemPromptForState } from "./system";
import { getAvailableToolsForState } from "./tools";
import { AnswerSuggestionsAgent } from "./suggestions-agent";

const model = openai("gpt-4.1-mini");

export class SixtyAgent extends AIChatAgent<Env, AgentState> {
  initialState = {
    stage: "car_type_upselling",
    scratchpad: getInitialScratchpad(),
    offer_matrix_id: uuidv4(),
  } satisfies AgentState;

  constructor(ctx: never, env: Env) {
    super(ctx, env);

    const fetch = async () => {
      // fetch offers from Sixt
      const { offers, pickupLocation, returnLocation } = await getAvailableOffers(this.state.offer_matrix_id);

      const availableOffers: Record<OfferId, Offer> = {};
      for (const offer of offers) {
        availableOffers[offer.offer_id] = offer;
      }

      // select one of the first 4 offers
      const initialOffer = offers.slice(0, 4).sort(() => Math.random() - 0.5)[0];
      // remove the initial offer from the available offers
      delete availableOffers[initialOffer.offer_id];

      const updatedScratchpad = {
        ...this.state.scratchpad,
        travelDetails: {
          ...this.state.scratchpad.travelDetails,
          duration: initialOffer.calculated_rental_days,
          pickupLocation: pickupLocation.branch.title,
          travelDates: {
            departure: initialOffer.pickup_datetime.value,
            return: initialOffer.return_datetime.value,
          },
        },
      };

      this.setState({
        ...this.state,
        initialOffer,
        availableOffers,
        pickupLocation,
        returnLocation,
        scratchpad: updatedScratchpad,
      });

      if (this.messages.length === 0) {
        await this.saveMessages([
          {
            id: uuidv4(),
            role: "user",
            metadata: "hidden",
            parts: [
              {
                type: "text",
                text: `
                  Hey! I'm close and want to pick up my car soon. Is everything ready?
                `,
              },
            ],
          },
        ]);
      }
    };

    if (this.state.initialOffer === undefined) {
      fetch();
    }
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: {
      abortSignal: AbortSignal | undefined;
    },
  ): Promise<Response | undefined> {
    const tools = getAvailableToolsForState(this.state, (newState) => this.setState(newState));

    const prompt = await getSystemPromptForState(this.state);

    const result = streamText({
      system: prompt,
      messages: convertToModelMessages(this.messages),
      model,
      tools: tools,
      onFinish: async (result) => {
        // Call the original onFinish callback
        if (onFinish) {
          await onFinish(result);
        }

        // After assistant message completes, trigger suggestions agent
        await this.generateAnswerSuggestions(result);
      },
      abortSignal: options?.abortSignal,
      stopWhen: [stepCountIs(5)],
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    });
  }

  async generateAnswerSuggestions(result: StepResult<ToolSet>): Promise<void> {
    // Get the last assistant message
    const lastUserMessage = [...this.messages].reverse().find((msg) => msg.role === "user");

    if (!lastUserMessage) {
      console.warn("No user message found in the chat history");
      return;
    }

    // Get the suggestions agent from env
    // Access env through the agent's internal property (AIChatAgent should expose env)
    const env = (this as unknown as { env: Env }).env;
    if (!env?.AnswerSuggestionsAgent) {
      console.warn("AnswerSuggestionsAgent not available in env");
      return;
    }

    const suggestionsAgentId = env.AnswerSuggestionsAgent.idFromName(this.name);
    const suggestionsAgent = env.AnswerSuggestionsAgent.get(suggestionsAgentId) as AnswerSuggestionsAgent;

    const messages = [
      ...this.messages,
      { id: uuidv4(), role: "assistant", parts: [{ type: "text", text: result.text }] },
    ];

    // Generate suggestions
    const suggestions = await suggestionsAgent.generateSuggestions(messages);

    // Update state with suggestions
    if (suggestions && suggestions.length > 0) {
      this.setState({
        ...this.state,
        answerSuggestions: suggestions,
        suggestionsMessageID: lastUserMessage.id,
      });
    } else {
      // Clear suggestions if none were generated
      this.setState({
        ...this.state,
        answerSuggestions: undefined,
        suggestionsMessageID: lastUserMessage.id,
      });
    }
  }

  async onMessage(connection: Connection, message: WSMessage): Promise<void> {
    const controlMessage = JSON.parse(message as string) as ControlMessage;
    switch (controlMessage?.controlMessageType) {
      case "ACCEPT_UPGRADE":
        await this.acceptUpgrade(controlMessage.offerId);
        break;

      case "SELECT_PROTECTION_PACKAGE":
        await this.selectProtectionPackage(controlMessage.packageId);
        break;

      case "TOGGLE_PRODUCT":
        await this.toggleProduct(controlMessage.productChargeCode);
        break;

      case "REVERT_TO_INITIAL_OFFER":
        await this.revertToInitialOffer();
        break;

      case "PROCESS_PAYMENT":
        await this.processPayment(controlMessage.paymentMethod);
        break;

      case "UNLOCK_CAR":
        await this.unlockCar();
        break;

      default:
        // no control message, thus call super function so that onChatMessage is invoked
        await super.onMessage(connection, message);
    }
  }

  async acceptUpgrade(offerId: OfferId) {
    if (this.state.booking || this.state.stage !== "car_type_upselling") {
      return;
    }

    const booking = await getBookingForOffer(offerId, this.state.offer_matrix_id);

    this.setState({ ...this.state, stage: "insurance_upselling", booking });

    await this.saveMessages([
      ...this.messages,
      {
        id: uuidv4(),
        role: "user",
        metadata: "hidden",
        parts: [
          {
            type: "text",
            text: `I upgraded to the offer with offer_id ${offerId}.`,
          },
        ],
      },
    ]);
  }

  async selectProtectionPackage(packageId: string) {
    if (!this.state.booking) {
      return;
    }

    // Find the selected package to get its name
    const selectedPackage = this.state.booking.available_add_ons_v2.packages.find((pkg) => pkg.id === packageId);

    // Set is_selected to true for the selected package
    const updatedPackages = this.state.booking.available_add_ons_v2.packages.map((pkg) =>
      pkg.id === packageId ? { ...pkg, is_selected: true } : { ...pkg, is_selected: false },
    );

    const updatedBooking = {
      ...this.state.booking,
      available_add_ons_v2: {
        ...this.state.booking.available_add_ons_v2,
        packages: updatedPackages,
      },
    };

    this.setState({ ...this.state, stage: "addon_upselling", booking: updatedBooking });

    await this.saveMessages([
      ...this.messages,
      {
        id: uuidv4(),
        role: "user",
        metadata: "hidden",
        parts: [
          {
            type: "text",
            text: `I upgraded to the protection package "${selectedPackage?.description.name || packageId}" with package_id ${packageId}.`,
          },
        ],
      },
    ]);
  }

  async toggleProduct(productChargeCode: string) {
    if (!this.state.booking) {
      return;
    }

    // Find the product to get its name and current selection state
    const product = this.state.booking.available_add_ons_v2.products.find((p) => p.charge_code === productChargeCode);

    if (!product) {
      return;
    }

    // Toggle is_selected for the product
    const updatedProducts = this.state.booking.available_add_ons_v2.products.map((p) =>
      p.charge_code === productChargeCode ? { ...p, is_selected: !p.is_selected } : p,
    );

    const updatedBooking = {
      ...this.state.booking,
      available_add_ons_v2: {
        ...this.state.booking.available_add_ons_v2,
        products: updatedProducts,
      },
    };

    this.setState({ ...this.state, booking: updatedBooking });
  }

  async revertToInitialOffer() {
    if (!this.state.booking || !this.state.initialOffer) {
      return;
    }

    // Delete the booking and revert to initial offer
    // Fetch booking for the initial offer to get available add-ons
    const booking = await getBookingForOffer(this.state.initialOffer.offer_id, this.state.offer_matrix_id);

    this.setState({
      ...this.state,
      booking,
      stage: "completed",
      paymentCompleted: false,
      carUnlocked: false,
    });

    await this.saveMessages([
      ...this.messages,
      {
        id: uuidv4(),
        role: "user",
        metadata: "hidden",
        parts: [
          {
            type: "text",
            text: "I decided to cancel the upgrade and keep my original booking.",
          },
        ],
      },
    ]);
  }

  async processPayment(paymentMethod: "apple" | "google" | "card") {
    if (!this.state.booking) {
      return;
    }

    // Mark the booking as paid and complete
    this.setState({
      ...this.state,
      stage: "completed",
      paymentCompleted: true,
      carUnlocked: false,
    });
  }

  async unlockCar() {
    // Mark the car as unlocked
    this.setState({
      ...this.state,
      carUnlocked: true,
    });
  }
}

export { AnswerSuggestionsAgent } from "./suggestions-agent";

export default {
  async fetch(request: Request, env: Env) {
    return (await routeAgentRequest(request, env)) || new Response("Not found", { status: 404 });
  },
};
