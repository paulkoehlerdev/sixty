import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import type { AgentState } from "../lib/state";
import { createUpdateScratchpadTool } from "./scratchpad";

export const getAvailableToolsForState = (state: AgentState, setState: (state: AgentState) => void): ToolSet => {
  const tools: ToolSet = {
    updateScratchpad: createUpdateScratchpadTool(
      () => state.scratchpad,
      (newScratchpad) => {
        state.scratchpad = newScratchpad;
      },
    ),
  };

  if (state.stage === "car_type_upselling") {
    tools.showCarTypeUpsellOffer = showCarTypeUpsellOffer;
    tools.abortCarTypeUpsell = abortCarTypeUpsell(state, setState);
  }

  if (state.stage === "insurance_upselling") {
    tools.showProtectionPackages = showProtectionPackages(state, setState);
  }

  if (state.stage === "addon_upselling") {
    tools.showProducts = showProducts(state, setState);
  }

  return tools;
};

const showCarTypeUpsellOffer = {
  description: "Show an car type upselling offer to the user.".trim(),
  inputSchema: z.object({ offerId: z.string().describe("Offer ID of the upselling car offer") }),
  execute: async () => {
    return "Showing the upselling car offer to the user.";
  },
} satisfies Tool<{ offerId: string }, string>;

const abortCarTypeUpsell = (state: AgentState, setState: (state: AgentState) => void) => {
  return {
    description:
      "Transition to the next stage of upselling. You should only use this if you are sure you won't be able to upsell the user!".trim(),
    inputSchema: z.object({}),
    execute: async () => {
      setState({ ...state, stage: "insurance_upselling" });
      return "Showing the upselling car offer to the user.";
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
    description:
      "Display addon products to the user. You can specify which product charge codes to show and optionally highlight one as popular.".trim(),
    inputSchema: z.object({
      productChargeCodes: z.array(z.string()).describe("Array of product charge codes to display to the user"),
      popularProductChargeCode: z
        .string()
        .optional()
        .describe("Optional product charge code to highlight as 'Popular'"),
    }),
    execute: async ({
      productChargeCodes,
      popularProductChargeCode,
    }: {
      productChargeCodes: string[];
      popularProductChargeCode?: string;
    }) => {
      const availableProducts = state.booking?.available_add_ons_v2.products || [];
      const productsToShow = availableProducts.filter((product) => productChargeCodes.includes(product.charge_code));

      return `Displaying ${productsToShow.length} addon product(s) to the user${popularProductChargeCode ? ` with product ${popularProductChargeCode} highlighted as popular` : ""}.`;
    },
  } satisfies Tool<{ productChargeCodes: string[]; popularProductChargeCode?: string }, string>;
};
