import { getOfferRecommendations, selectLocation } from "../lib/sixt/api.ts";
import type { UserProfileScratchpad } from "../server/scratchpad.ts";
import type { Booking, Location, Offer, OfferId, SelectedLocation } from "./sixt/types.ts";

export type AgentState = {
  stage: Stage;
  scratchpad: UserProfileScratchpad;
  offer_matrix_id: string;

  initialOffer?: Offer;
  pickupLocation?: Location;
  returnLocation?: Location;
  availableOffers?: Record<OfferId, Offer>;

  booking?: Booking;
};

export type Stage = "car_type_upselling" | "insurance_upselling" | "addon_upselling";

const demoLocation = "BRANCH:11"; // Munich Airport
const demoPickupTime = new Date("2025-11-24T10:00:00Z");
const demoReturnTime = new Date("2025-11-27T10:00:00Z");

export async function getAvailableOffers(
  offerMatrixId: string,
): Promise<{ offers: Offer[]; pickupLocation: Location; returnLocation: Location }> {
  const { location_selection_id, selected_location } = await selectLocation(demoLocation);
  return {
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
}
