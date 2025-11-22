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

type CarUpsellOffer = {
  offerId: string;
  header_priority0: string;
  text_priority0: string;
  header_priority1: string;
  text_priority1: string;
  header_priority2: string;
  text_priority2: string;
};

const showCarTypeUpsellOffer = {
  description: `
    Show an car type upselling offer to the user.
    Please provide information about the Upsell: Why should the user upgrade? What benefits will they get?
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
} satisfies Tool<CarUpsellOffer, string>;

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
