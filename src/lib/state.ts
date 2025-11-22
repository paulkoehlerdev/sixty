import type { Offer, OfferId } from "./sixt/types.ts";
import { getInitialScratchpad, type UserProfileScratchpad } from "../server/scratchpad";
import { getOfferRecommendations, selectLocation } from "../lib/sixt/api.ts";

export type AgentState = {
  stage: Stage;
  initialOffer: Offer;
  currentOffer: OfferId;
  availableOffers: Record<OfferId, Offer>;

  scratchpad: UserProfileScratchpad;
};

export type Stage = "car_type_upselling" | "insurance_upselling" | "addon_upselling";

export const getInitialState = async (): Promise<AgentState> => {
  const availableOffers = await getAvailableOffers();

  const indexedAvailableOffers: Record<OfferId, Offer> = {};
  for (const availableOffer of availableOffers) {
    indexedAvailableOffers[availableOffer.offer_id] = availableOffer;
  }

  const initialOffer = availableOffers[0]; // TEMP

  return {
    stage: "car_type_upselling",
    initialOffer: initialOffer,
    currentOffer: initialOffer.offer_id,
    scratchpad: getInitialScratchpad(),
    availableOffers: indexedAvailableOffers,
  };
};

const demoLocation = "BRANCH:11"; // Munich Airport
const demoPickupTime = new Date("2025-11-24T10:00:00Z");
const demoReturnTime = new Date("2025-11-27T10:00:00Z");

async function getAvailableOffers(): Promise<Offer[]> {
  const { location_selection_id } = await selectLocation(demoLocation);
  return await getOfferRecommendations({
    pickup_timestamp: demoPickupTime,
    return_timestamp: demoReturnTime,
    pickup_location_selection_id: location_selection_id,
    return_location_selection_id: location_selection_id,
  });
}
