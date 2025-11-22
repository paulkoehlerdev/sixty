import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import type { AgentState } from "../types/state";
import { createUpdateScratchpadTool } from "./scratchpad";
import { sixtTools } from "./tools/sixt";

export const getAvailableToolsForState = (state: AgentState, setState: (newState: AgentState) => void): ToolSet => {
  if (!state) {
    return {};
  }

  return {
    updateScratchpad: createUpdateScratchpadTool(
      () => state.scratchpad,
      (newScratchpad) => {
        state.scratchpad = newScratchpad;
      },
    ),
    transitionToCarTypeUpselling: createTransitionToCarTypeUpsellingTool(state, setState),
    ...sixtTools,
  };
};

const createTransitionToCarTypeUpsellingTool = (state: AgentState, setState: (newState: AgentState) => void) =>
  ({
    description:
      "Transition to the car type upselling state with the most like offer to show the user leading to a successful conversion.".trim(),
    inputSchema: z.object({ offerId: z.string().describe("Offer id of the upselling car offer") }),
    execute: async () => {
      setState({
        ...state,
        uiState: {
          stage: "welcome",
          currentOffer: state.uiState.currentOffer,
          upsellingOffer: undefined, // TODO
        },
      });

      return "Transitioned to car upselling stage";
    },
  }) satisfies Tool<{ offerId: string }, string>;
