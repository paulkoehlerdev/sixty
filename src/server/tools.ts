import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import { mapOfferToChatCarOffer } from "../lib/chat/models";
import { getBookingForOffer } from "../lib/sixt/api";
import type { AgentState } from "../lib/state";
import { createUpdateScratchpadTool } from "./scratchpad";
import { cleanOfferForPrompt, getSubPromptForState } from "./system";

export const getAvailableToolsForState = (state: AgentState, setState: (state: AgentState) => void): ToolSet => {
  const tools: ToolSet = {
    showAnswerSuggestions,
    updateScratchpad: createUpdateScratchpadTool(
      () => state.scratchpad,
      (newScratchpad) => {
        state.scratchpad = newScratchpad;
      },
    ),
    endChat: endChat(state, setState),
  };

  if (state.stage === "car_type_upselling") {
    tools.showCarTypeUpsellOffer = showCarTypeUpsellOffer;
    tools.abortCarTypeUpsell = abortCarTypeUpsell(state, setState);
    tools.getAvailableCarUpgrades = getAvailableCarUpgrades(state);
  }

  if (state.stage === "insurance_upselling") {
    tools.showProtectionPackages = showProtectionPackages(state, setState);
    tools.abortProtectionUpselling = abortProtectionUpselling(state, setState);
  }

  if (state.stage === "addon_upselling") {
    tools.showProducts = showProducts(state, setState);
    tools.abortAddonUpselling = abortAddonUpselling(state, setState);
  }

  return tools;
};

export type CarUpsellOfferToolInput = {
  offerId: string;
  header_priority0: string;
  text_priority0: string;
  header_priority1: string;
  text_priority1: string;
  header_priority2: string;
  text_priority2: string;
};

export type ProtectionPackagesToolInput = {
  packageIds: string[];
  bestValuePackageId?: string;
};

export type ProductsToolInput = {
  productChargeCodes: string[];
};

const showCarTypeUpsellOffer = {
  description: `
    Show an car type upselling offer to the user.
    Please provide information about the Upsell: Why should the user upgrade? What benefits will they get?
    **CRITICAL: The header and text fields MUST be based ONLY on the specific offer with the offerId you are passing in this tool call. Do NOT mix information from other offers.**
    You should combine the information into 3 prioritized points with a short header and a longer description (text) for each point.
    The text should focus on the specific things that are different from the current offer.
    The priority is descending, 0 is the most important.
    (Use header_priority0, text_priority0, header_priority1, text_priority1, header_priority2, text_priority2)
  `.trim(),
  inputSchema: z.object({
    offerId: z.string().describe("Offer ID of the upselling car offer"),
    header_priority0: z.string().max(40).describe("The header for the priority 0 upgrade reason. (max 40 chars)"),
    text_priority0: z.string().max(100).describe("The text for the priority 0 upgrade reason.  (max 100 chars)"),
    header_priority1: z.string().max(40).describe("The header for the priority 1 upgrade reason. (max 40 chars)"),
    text_priority1: z.string().max(100).describe("The text for the priority 0 upgrade reason.  (max 100 chars)"),
    header_priority2: z.string().max(40).describe("The header for the priority 2 upgrade reason. (max 40 chars)"),
    text_priority2: z.string().max(100).describe("The text for the priority 0 upgrade reason. (max 100 chars)"),
  }),
  execute: async () => {
    return "Showing the upselling car offer to the user.";
  },
} satisfies Tool<CarUpsellOfferToolInput, string>;

export type AnswerSuggestionsToolInput = {
  answers: string[];
};

const showAnswerSuggestions = {
  description: `
    Show the user answers to choose from.
    We need you to provide a list of 4 suggestions for the user to choose from.
    This is important for a quick conversation and to allow you to get more targeted answers.
    The max length for each answer is 50 characters.
    The options are presented to the user and he will be able to send them back to you.
  `.trim(),
  inputSchema: z.object({
    answers: z.array(z.string()).max(4).min(2).describe("The prefilled user's answers to your message questions"),
  }),
  execute: async () => {
    return "";
  },
} satisfies Tool<AnswerSuggestionsToolInput, string>;

const abortCarTypeUpsell = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "Transition to the next stage of upselling. You should only use this if you are sure you won't be able to upsell the user!".trim(),
    inputSchema: z.object({}),
    execute: async () => {
      // Fetch booking for the initial offer (the user's current car) to get available add-ons
      if (!state.initialOffer) {
        return "Error: No initial offer available";
      }

      const booking = await getBookingForOffer(state.initialOffer.offer_id, state.offer_matrix_id);
      const newState = { ...state, stage: "insurance_upselling" as const, booking };
      setState(newState);

      // Return the workflow for the next stage
      const nextStagePrompt = getSubPromptForState(newState);
      return `Moving to protection package upselling.\n\n${nextStagePrompt}`;
    },
  } satisfies Tool<Record<string, never>, string>;
};

const getAvailableCarUpgrades = (state: AgentState) => {
  return {
    description:
      "Get the list of available car upgrades for the user. **IMPORTANT: You MUST call this tool immediately at the start of car type upselling to see what upgrade options are available.** This returns both the user's current car and all available upgrade options with prices and specifications.".trim(),
    inputSchema: z.object({}),
    execute: async () => {
      const availableOffers = Object.values(state.availableOffers ?? {})
        .map(mapOfferToChatCarOffer)
        .map(cleanOfferForPrompt)
        .filter((o) => o !== undefined);

      const currentOffer = cleanOfferForPrompt(mapOfferToChatCarOffer(state.initialOffer));

      return JSON.stringify({
        current_car: currentOffer,
        available_upgrades: availableOffers,
      });
    },
  } satisfies Tool<Record<string, never>, string>;
};

const showProtectionPackages = (state: AgentState, _setState: (state: AgentState) => void) => {
  return {
    description:
      "Display protection packages to the user. You can specify which package IDs to show and optionally highlight one as the best value (with AI styling).".trim(),
    inputSchema: z.object({
      packageIds: z.array(z.string()).describe("Array of package IDs to display to the user"),
      bestValuePackageId: z
        .string()
        .optional()
        .describe("Optional package ID to highlight as 'Best Value' with AI styling"),
    }),
    execute: async ({ packageIds, bestValuePackageId }: { packageIds: string[]; bestValuePackageId?: string }) => {
      const availablePackages = state.booking?.available_add_ons_v2.packages || [];
      const packagesToShow = availablePackages.filter((pkg) => packageIds.includes(pkg.id));

      return `Displaying ${packagesToShow.length} protection package(s) to the user${bestValuePackageId ? ` with package ${bestValuePackageId} highlighted as best value` : ""}.`;
    },
  } satisfies Tool<{ packageIds: string[]; bestValuePackageId?: string }, string>;
};

const showProducts = (state: AgentState, _setState: (state: AgentState) => void) => {
  return {
    description: "Display addon products to the user. You can specify which product charge codes to show.".trim(),
    inputSchema: z.object({
      productChargeCodes: z.array(z.string()).describe("Array of product charge codes to display to the user"),
    }),
    execute: async ({ productChargeCodes }: { productChargeCodes: string[] }) => {
      if (!state.booking) {
        return "Cannot display products: no booking available.";
      }

      const availableProducts = state.booking.available_add_ons_v2.products || [];
      const productsToShow = availableProducts.filter((product) => productChargeCodes.includes(product.charge_code));

      return `Displaying ${productsToShow.length} addon product(s) to the user.`;
    },
  } satisfies Tool<{ productChargeCodes: string[] }, string>;
};

const abortProtectionUpselling = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "Transition to the addon upselling stage. You should only use this if you are sure you won't be able to upsell protection packages to the user!".trim(),
    inputSchema: z.object({}),
    execute: async () => {
      const newState = { ...state, stage: "addon_upselling" as const };
      setState(newState);

      // Return the workflow for the next stage
      const nextStagePrompt = getSubPromptForState(newState);
      return `Moving to addon upselling.\n\n${nextStagePrompt}`;
    },
  } satisfies Tool<Record<string, never>, string>;
};

const abortAddonUpselling = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "Transition to the completed stage without any addon products. You should only use this if you are sure you won't be able to upsell addon products to the user!".trim(),
    inputSchema: z.object({}),
    execute: async () => {
      setState({ ...state, stage: "completed" });
      return "Booking completed! Showing the final booking summary to the user.";
    },
  } satisfies Tool<Record<string, never>, string>;
};

const endChat = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "End the chat and show the final booking summary to the user. Use this tool when the user wants to end the conversation OR when you determine the upsell process is complete (all stages finished or user is satisfied). After calling this tool, you should write a short thank you message to the user.".trim(),
    inputSchema: z.object({}),
    execute: async () => {
      setState({ ...state, stage: "completed" });
      return "Chat ended! Showing the final booking summary to the user.";
    },
  } satisfies Tool<Record<string, never>, string>;
};
