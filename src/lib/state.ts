import type { Offer, OfferId } from "./sixt/types.ts";
import { getOfferRecommendations, selectLocation } from "../lib/sixt/api.ts";
import type { UserProfileScratchpad } from "../server/scratchpad.ts";

export type AgentState = {
  stage: Stage;
  scratchpad: UserProfileScratchpad;

  initialOffer?: Offer;
  currentOffer?: OfferId;
  availableOffers?: Record<OfferId, Offer>;
};

export type Stage = "car_type_upselling" | "insurance_upselling" | "addon_upselling";

const demoLocation = "BRANCH:11"; // Munich Airport
const demoPickupTime = new Date("2025-11-24T10:00:00Z");
const demoReturnTime = new Date("2025-11-27T10:00:00Z");

export async function getAvailableOffers(): Promise<Offer[]> {
  const { location_selection_id } = await selectLocation(demoLocation);
  return await getOfferRecommendations({
    pickup_timestamp: demoPickupTime,
    return_timestamp: demoReturnTime,
    pickup_location_selection_id: location_selection_id,
    return_location_selection_id: location_selection_id,
  });
}
