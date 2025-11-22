import type { AgentState } from "@/server";
import { CurrentBookingUI } from "./CurrentBookingUI";
import { UpgradeOfferUI } from "./UpgradeOfferUI";

interface UIElementContainerProps {
  uiState: AgentState["uiState"];
}

export function UIElementContainer({ uiState }: UIElementContainerProps) {
  if (!uiState) {
    return null;
  }

  if (uiState.uiMode === "current" && uiState.booking) {
    return <CurrentBookingUI booking={uiState.booking} />;
  }

  if (uiState.uiMode === "upgrade" && uiState.offer) {
    return <UpgradeOfferUI offer={uiState.offer} />;
  }

  return null;
}
