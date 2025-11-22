import { getOfferRecommendations, selectLocation } from "../lib/sixt/api";
import type { Offer } from "../lib/sixt/types.ts";

export type Booking = {
  offer: Offer;
};

const demoLocation = "BRANCH:11"; // Munich Airport
const demoPickupTime = new Date("2025-11-24T10:00:00Z");
const demoReturnTime = new Date("2025-11-27T10:00:00Z");

async function _getBaseBookingInformation(): Promise<Booking> {
  const { location_selection_id } = await selectLocation(demoLocation);

  const offers = await getOfferRecommendations({
    pickup_timestamp: demoPickupTime,
    return_timestamp: demoReturnTime,
    pickup_location_selection_id: location_selection_id,
    return_location_selection_id: location_selection_id,
  });

  const offer = offers[0];

  return {
    offer,
  };
}
