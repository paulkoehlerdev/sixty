import { getOfferRecommendations, selectLocation } from "../lib/sixt/api.ts";
import type { UserProfileScratchpad } from "../server/scratchpad.ts";
import type { Booking, Location, Offer, OfferId } from "./sixt/types.ts";

export type AgentState = {
  stage: Stage;
  scratchpad: UserProfileScratchpad;
  offer_matrix_id: string;

  initialOffer?: Offer;
  pickupLocation?: Location;
  returnLocation?: Location;
  availableOffers?: Record<OfferId, Offer>;

  booking?: Booking;

  answerSuggestions?: string[];
  suggestionsMessageID?: string;
};

export type Stage = "car_type_upselling" | "insurance_upselling" | "addon_upselling" | "completed";

const demoLocation = "BRANCH:11"; // Munich Airport
const demoPickupTime = new Date("2026-07-10T10:00:00Z");
const demoReturnTime = new Date("2026-07-12T10:00:00Z");

export async function getAvailableOffers(
  offerMatrixId: string,
): Promise<{ offers: Offer[]; pickupLocation: Location; returnLocation: Location }> {
  const { location_selection_id, selected_location } = await selectLocation(demoLocation);
  const res = {
    offers: await getOfferRecommendations(
      {
        pickup_timestamp: demoPickupTime,
        return_timestamp: demoReturnTime,
        pickup_location_selection_id: location_selection_id,
        return_location_selection_id: location_selection_id,
      },
      offerMatrixId,
    ),
    pickupLocation: selected_location,
    returnLocation: selected_location,
  };

  // remove "Glücksauto"
  res.offers = res.offers.filter((o) => o.car_info.title !== "Glücksauto");
  return res;
}
