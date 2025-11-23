import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import { mapOfferToChatCarOffer } from "../lib/chat/models";
import { getBookingForOffer } from "../lib/sixt/api";
import type { AgentState } from "../lib/state";
import { createUpdateScratchpadTool } from "./scratchpad";
import { cleanOfferForPrompt, getSubPromptForState } from "./system";

export const getAvailableToolsForState = (state: AgentState, setState: (state: AgentState) => void): ToolSet => {
  const tools: ToolSet = {
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
    tools.addProtectionPackage = addProtectionPackage(state, setState);
    tools.abortProtectionUpselling = abortProtectionUpselling(state, setState);
  }

  if (state.stage === "addon_upselling") {
    tools.showProducts = showProducts(state, setState);
    tools.addProduct = addProduct(state, setState);
    tools.abortAddonUpselling = abortAddonUpselling(state, setState);
  }

  return tools;
};

export type CarUpsellOfferToolInput = {
  offers: {
    offerId: string;
    header_priority0: string;
    text_priority0: string;
    header_priority1: string;
    text_priority1: string;
    header_priority2: string;
    text_priority2: string;
  }[];
};

export type ProtectionPackagesToolInput = {
  packageIds: string[];
  bestValuePackageId?: string;
};

export type ProductsToolInput = {
  productChargeCodes: string[];
};

export type AddProtectionPackageToolInput = {
  packageId: string;
};

export type AddProductToolInput = {
  productChargeCodes: string[];
};

const showCarTypeUpsellOffer = {
  description: `
    Show car type upselling offers to the user. You can show 1-3 offers at once (maximum 3).
    For each offer, provide specific information about that particular upgrade: Why should the user upgrade to THIS car? What benefits will they get?
    **IMPORTANT: Each offer must have its own tailored headers and texts. Do NOT use generic text - be specific to each car's features.**
    For each offer, combine the information into 3 prioritized points with a short header and a longer description (text) for each point.
    The priority is descending, 0 is the most important.
    (Use header_priority0, text_priority0, header_priority1, text_priority1, header_priority2, text_priority2)
  `.trim(),
  inputSchema: z.object({
    offers: z
      .array(
        z.object({
          offerId: z.string().describe("Offer ID of the car upgrade"),
          header_priority0: z
            .string()
            .max(40)
            .describe("The header for the priority 0 upgrade reason for THIS specific car. (max 40 chars)"),
          text_priority0: z
            .string()
            .max(100)
            .describe("The text for the priority 0 upgrade reason for THIS specific car. (max 100 chars)"),
          header_priority1: z
            .string()
            .max(40)
            .describe("The header for the priority 1 upgrade reason for THIS specific car. (max 40 chars)"),
          text_priority1: z
            .string()
            .max(100)
            .describe("The text for the priority 1 upgrade reason for THIS specific car. (max 100 chars)"),
          header_priority2: z
            .string()
            .max(40)
            .describe("The header for the priority 2 upgrade reason for THIS specific car. (max 40 chars)"),
          text_priority2: z
            .string()
            .max(100)
            .describe("The text for the priority 2 upgrade reason for THIS specific car. (max 100 chars)"),
        }),
      )
      .min(1)
      .max(3)
      .describe(
        "Array of 1-3 car upgrade offers to show. Each offer needs its own specific headers and texts. If showing multiple, they will be displayed in a horizontal scroll.",
      ),
  }),
  execute: async () => {
    return `
      Showing the upselling car offers to the user. 
      The user can now press the upgrade button. 
      You will be notified when the upgrade is complete.
    `.trim();
  },
} satisfies Tool<CarUpsellOfferToolInput, string>;

export type AnswerSuggestionsToolInput = {
  answers: string[];
};

const _showAnswerSuggestions = {
  description: `
    Show the user answers to choose from.
    We need you to provide a list of up to 3 suggestions for the user to choose from.
    This is important for a quick conversation and to allow you to get more targeted answers.
    The max length for each answer is 50 characters.
    The options are presented to the user and he will be able to send them back to you.
  `.trim(),
  inputSchema: z.object({
    answers: z.array(z.string()).max(3).min(2).describe("The prefilled user's answers to your message questions"),
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

const addProtectionPackage = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "Add/select a protection package for the user's booking. Use this tool when the user explicitly wants to add a specific protection package to their booking. This will add the selected protection package to the booking.".trim(),
    inputSchema: z.object({
      packageId: z.string().describe("The ID of the protection package to add to the booking"),
    }),
    execute: async ({ packageId }: { packageId: string }) => {
      if (!state.booking) {
        return "Cannot add protection package: no booking available.";
      }

      // Set is_selected to true for the selected package
      const updatedPackages = state.booking.available_add_ons_v2.packages.map((pkg) =>
        pkg.id === packageId ? { ...pkg, is_selected: true } : { ...pkg, is_selected: false },
      );

      const updatedBooking = {
        ...state.booking,
        available_add_ons_v2: {
          ...state.booking.available_add_ons_v2,
          packages: updatedPackages,
        },
      };

      setState({ ...state, stage: "addon_upselling", booking: updatedBooking });
      return `Displaying 1 protection package(s) to the user with package ${packageId} highlighted as best value.`;
    },
  } satisfies Tool<AddProtectionPackageToolInput, string>;
};

const addProduct = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "Add one or more addon products to the user's booking. ONLY use this tool when the user explicitly has given permission to add products. This will add the selected products to the booking.".trim(),
    inputSchema: z.object({
      productChargeCodes: z
        .array(z.string())
        .min(1)
        .describe("Array of charge codes of the addon products to add to the booking"),
    }),
    execute: async ({ productChargeCodes }: { productChargeCodes: string[] }) => {
      if (!state.booking) {
        return "Cannot add products: no booking available.";
      }

      // Add the products (set is_selected to true for all specified products)
      const updatedProducts = state.booking.available_add_ons_v2.products.map((product) =>
        productChargeCodes.includes(product.charge_code) ? { ...product, is_selected: true } : product,
      );

      const updatedBooking = {
        ...state.booking,
        available_add_ons_v2: {
          ...state.booking.available_add_ons_v2,
          products: updatedProducts,
        },
      };

      setState({ ...state, booking: updatedBooking });

      const addedProducts = updatedProducts.filter(
        (product) => productChargeCodes.includes(product.charge_code) && product.is_selected,
      );
      const productNames = addedProducts.map((p) => p.description.name || p.charge_code).join(", ");
      const count = addedProducts.length;
      return `Successfully added ${count} addon product${count === 1 ? "" : "s"} "${productNames}" to the booking.`;
    },
  } satisfies Tool<AddProductToolInput, string>;
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
