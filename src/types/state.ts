import { getOfferRecommendations, selectLocation } from "@/server/sixt/api.ts";
import type { Offer } from "@/server/sixt/types.ts";
import { getInitialScratchpad, type UserProfileScratchpad } from "../server/scratchpad";

export type CurrentStageUiSTate = {
  stage: UpsellingStage;
  currentOffer: Offer;
};

export type AgentState = {
  uiState: CurrentStageUiSTate;
  scratchpad: UserProfileScratchpad;
};

export type UpsellingStage = "car_type_upselling" | "insurance_upselling" | "addon_upselling";

export const getInitialState = async (): Promise<AgentState> => ({
  uiState: {
    stage: "car_type_upselling",
    currentOffer: await getBaseBookingInformation(),
  },
  scratchpad: getInitialScratchpad(),
});

const demoLocation = "BRANCH:11"; // Munich Airport
const demoPickupTime = new Date("2025-11-24T10:00:00Z");
const demoReturnTime = new Date("2025-11-27T10:00:00Z");

async function getBaseBookingInformation(): Promise<Offer> {
  const { location_selection_id } = await selectLocation(demoLocation);

  const offers = await getOfferRecommendations({
    pickup_timestamp: demoPickupTime,
    return_timestamp: demoReturnTime,
    pickup_location_selection_id: location_selection_id,
    return_location_selection_id: location_selection_id,
  });

  return offers[0];
}
