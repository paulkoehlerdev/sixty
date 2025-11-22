import { v4 as uuidv4 } from "uuid";
import type { Booking, Location, Offer, SearchRequest, SelectedLocation } from "./types.ts";

const baseUrl = "https://grpc-prod.orange.sixt.com";

async function doGrpcRequest<T>(method: string, body: any): Promise<T> {
  const response = await fetch(`${baseUrl}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T;
}

export async function getSuggestedLocations(query: string) {
  const suggestedLocations = await doGrpcRequest<{
    suggestions: {
      location: Location;
    }[];
  }>("com.sixt.service.rent_booking.api.SearchService/SuggestLocations", {
    query: query,
    auto_complete_session_id: uuidv4(),
    vehicle_type: "1",
    user_profile_id: "",
    location_purpose: 1,
    include_fastlane: null,
  });

  return suggestedLocations.suggestions
    .map((suggestion) => suggestion.location)
    .filter((location) => location.branch !== undefined);
}

export function selectLocation(branch_location_id: string): Promise<SelectedLocation> {
  return doGrpcRequest<SelectedLocation>("com.sixt.service.rent_booking.api.SearchService/SelectLocation", {
    user_profile_id: "",
    location_purpose: 1,
    vehicle_type: 1,
    auto_complete_session_id: uuidv4(),
    location_id: branch_location_id,
    include_fastlane: null,
  });
}

export async function getOfferRecommendations(req: SearchRequest): Promise<Offer[]> {
  const response = await doGrpcRequest<{
    offers: Offer[];
  }>("com.sixt.service.rent_booking.api.BookingService/GetOfferRecommendationsV2", {
    offer_matrix_id: uuidv4(),
    currency: "EUR",
    trip_spec: {
      pickup_datetime: { value: `${req.pickup_timestamp.toISOString().substring(0, 16)}:00` },
      pickup_location_selection_id: req.pickup_location_selection_id,
      return_location_selection_id: req.return_location_selection_id,
      point_of_sale: "DE",
      return_datetime: { value: `${req.return_timestamp.toISOString().substring(0, 16)}:00` },
      vehicle_type: 10,
      user_profile_id: "",
      corporate_customer_number: "",
      sim_card_country_code: "DE",
      device_location_country_code: "DE",
      campaign: "",
    },
    enable_b2b_fallback: true,
    company_id: "1",
  });
  return response.offers ?? [];
}

export async function getBookingForOffer(offer_id: string): Promise<Booking> {
  const response = await doGrpcRequest<{
    booking: Booking;
  }>("com.sixt.service.rent_booking.api.BookingService/GetBookingForOffer", {
    booking_id: uuidv4(),
    offer_matrix_id: uuidv4(),
    offer_id: offer_id,
    currency: "EUR",
    feature_flags: [],
  });
  return response.booking;
}
