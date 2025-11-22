import { openai } from "@ai-sdk/openai";
import { type Connection, routeAgentRequest, type WSMessage } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  hasToolCall,
  type StreamTextOnFinishCallback,
  stepCountIs,
  streamText,
  type ToolSet,
} from "ai";
import { v4 as uuidv4 } from "uuid";
import type { ControlMessage } from "../lib/messages.ts";
import { getBookingForOffer } from "../lib/sixt/api.ts";
import type { Offer, OfferId } from "../lib/sixt/types.ts";
import { type AgentState, getAvailableOffers } from "../lib/state";
import { getInitialScratchpad } from "./scratchpad.ts";
import { getSystemPromptForState } from "./system";
import { getAvailableToolsForState } from "./tools";

const model = openai("gpt-4.1-mini");

export class SixtyAgent extends AIChatAgent<Env, AgentState> {
  initialState = {
    stage: "car_type_upselling",
    scratchpad: getInitialScratchpad(),
    offer_matrix_id: uuidv4(),
  } satisfies AgentState;

  constructor(ctx: never, env: Env) {
    super(ctx, env);

    (async () => {
      // fetch offers from Sixt
      const { offers, pickupLocation, returnLocation } = await getAvailableOffers(this.state.offer_matrix_id);

      const availableOffers: Record<OfferId, Offer> = {};
      for (const offer of offers) {
        availableOffers[offer.offer_id] = offer;
      }

      const initialOffer = offers.reverse().pop(); // TEMP

      this.setState({ ...this.state, initialOffer, availableOffers, pickupLocation, returnLocation });

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
    })();
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: {
      abortSignal: AbortSignal | undefined;
    },
  ): Promise<Response | undefined> {
    const tools = getAvailableToolsForState(this.state, this.setState);

    const result = streamText({
      system: await getSystemPromptForState(this.state),
      messages: convertToModelMessages(this.messages),
      model,
      tools: tools,
      onFinish,
      abortSignal: options?.abortSignal,
      stopWhen: [hasToolCall("showAnswerSuggestions"), stepCountIs(5)],
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    });
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
            text: `I accept the suggested upgrade to the offer with offer_id ${offerId}.`,
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
            text: `I select the protection package "${selectedPackage?.description.name || packageId}" with package_id ${packageId}.`,
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
}

export default {
  async fetch(request: Request, env: Env) {
    return (await routeAgentRequest(request, env)) || new Response("Not found", { status: 404 });
  },
};
