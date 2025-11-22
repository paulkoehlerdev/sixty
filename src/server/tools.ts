import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import type { AgentState } from "../lib/state";
import { createUpdateScratchpadTool } from "./scratchpad";

export const getAvailableToolsForState = (state: AgentState): ToolSet => {
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
