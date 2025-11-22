import rawOffers from "../../raw_data/offers_1.json";
import type { CarOffer } from "../lib/offers";
import { getInitialScratchpad, type UserProfileScratchpad } from "../server/scratchpad";

export type CurrentStageUiSTate = {
  stage: "car_type_upselling";
  currentOffer: CarOffer;
};

export type AgentState = {
  uiState: CurrentStageUiSTate;
  scratchpad: UserProfileScratchpad;
};

export type UpsellingStage = "car_type_upselling" | "insurance_upselling" | "addon_upselling";

export const getInitialState = (): AgentState => ({
  uiState: {
    stage: "car_type_upselling",
    currentOffer: rawOffers.offers[0],
  },
  scratchpad: getInitialScratchpad(),
});
