import type { AgentState } from "@/types/state";
import { CurrentBookingUI } from "./CurrentBookingUI";

interface UIElementContainerProps {
  uiState: AgentState["uiState"];
}

export function UIElementContainer({ uiState }: UIElementContainerProps) {
  if (!uiState) {
    return null;
  }

  if (uiState.stage === "car_type_upselling" && uiState.currentOffer) {
    return <CurrentBookingUI booking={uiState.currentOffer} />;
  }

  return null;
}
