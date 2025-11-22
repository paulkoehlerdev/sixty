import type { Tool, ToolSet } from "ai";
import { z } from "zod";
import type { AgentState } from "../types/state";
import { sixtTools } from "./tools/sixt";

export const getAvailableToolsForState = (_state: AgentState): ToolSet => {
  return {
    exampleTool,
    ...sixtTools,
  };
};

const exampleTool = {
  description: "Example tool description".trim(),
  inputSchema: z.object({ query: z.string().describe("Some query") }),
  execute: async ({ query }, { toolCallId }) => {
    return "Example tool output";
  },
} satisfies Tool<{ query: string }, unknown>;
