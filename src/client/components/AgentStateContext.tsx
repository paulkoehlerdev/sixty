import { createContext, useContext } from "react";
import type { OfferId } from "@/lib/sixt/types.ts";
import type { AgentState } from "@/lib/state.ts";

export const AgentStateContext = createContext<{
  agentState: AgentState | null;
  acceptUpgradeOffer: (offerId: OfferId) => void;
}>({ agentState: null, acceptUpgradeOffer: () => {} });

export const useAgentState = () => {
  return useContext(AgentStateContext);
};
