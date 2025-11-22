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
    inputSchema: z.void(),
    execute: async () => {
      setState({ ...state, stage: "insurance_upselling" });
      return "Showing the upselling car offer to the user.";
    },
  } satisfies Tool<void, string>;
};
