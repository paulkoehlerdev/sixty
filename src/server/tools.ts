import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import type { AgentState } from "../types/state";
import { createUpdateScratchpadTool } from "./scratchpad";
import { sixtTools } from "./tools/sixt";

export const getAvailableToolsForState = (state: AgentState): ToolSet => {
  return {
    updateScratchpad: createUpdateScratchpadTool(
      () => state.scratchpad,
      (newScratchpad) => {
        state.scratchpad = newScratchpad;
      },
    ),
    exampleTool,
    ...sixtTools,
  };
};

const exampleTool = {
  description: "Example tool description".trim(),
  inputSchema: z.object({ query: z.string().describe("Some query") }),
  execute: async () => {
    return "Example tool output";
  },
} satisfies Tool<{ query: string }, unknown>;
