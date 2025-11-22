import type { AgentState } from "../types/state";

export const getSystemPromptForState = (_state: AgentState): string => {
  return "You are 'Sixty', a helpful assistant.";
};
