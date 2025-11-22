import { createContext, useContext } from "react";
import type { OfferId } from "@/lib/sixt/types.ts";
import type { AgentState } from "@/lib/state.ts";

export const AgentStateContext = createContext<{
  agentState: AgentState | null;
  acceptUpgradeOffer: (offerId: OfferId) => void;
  selectProtectionPackage: (packageId: string) => void;
}>({ agentState: null, acceptUpgradeOffer: () => {}, selectProtectionPackage: () => {} });

export const useAgentState = () => {
  return useContext(AgentStateContext);
};
