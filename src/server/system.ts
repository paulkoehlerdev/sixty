import type { AgentState } from "../types/state";

export const getSystemPromptForState = (_state: AgentState): string => {
  return `You are 'Sixty', a helpful assistant. The current date and time is ${new Date(Date.now()).toISOString()}.`;
};
