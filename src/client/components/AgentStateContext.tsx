import { createContext, useContext } from "react";
import type { OfferId } from "@/lib/sixt/types.ts";
import type { AgentState } from "@/lib/state.ts";

export const AgentStateContext = createContext<{
  agentState: AgentState | null;
  acceptUpgradeOffer: (offerId: OfferId) => void;
  selectProtectionPackage: (packageId: string) => void;
  toggleProduct: (productChargeCode: string) => void;
  unlockCar: () => void;
  revertToInitialOffer: () => void;
  processPayment: (paymentMethod: "apple" | "google" | "card") => Promise<void>;
}>({
  agentState: null,
  acceptUpgradeOffer: () => {},
  selectProtectionPackage: () => {},
  toggleProduct: () => {},
  unlockCar: () => {},
  revertToInitialOffer: () => {},
  processPayment: async () => {},
});

export const useAgentState = () => {
  return useContext(AgentStateContext);
};
