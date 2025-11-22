// TypeScript types for Sixt Offer API

export interface Amount {
  currency_code: string;
  value: number;
}

export interface PriceDetail {
  gross: Amount;
  net: Amount;
  tax: Amount;
  display_amount: Amount;
  price_unit: string;
  display_suffix: string;
  tracking_net: Amount;
}

export interface VehicleImage {
  small_url: string;
  medium_url: string;
  large_url: string;
}

export interface VehicleImageV2 {
  key: string;
  images: VehicleImage[];
}

export interface DriverRequirements {
  minimum_age: number;
  young_driver: number;
  license_min_years: number;
  license_category: string;
}

export interface CarInfo {
  product_type: string;
  group_type: string;
  guaranteed_model: boolean;
  title: string;
  subtitle: string;
  subtitle_prefix: string;
  body_style: string;
  subline: string;
  mileage_formatted: string;
  mileage_units_formatted: string;
  car_age_formatted: string;
  popularity: string;
  rating: number;
  bags_count: number;
  small_bags_count: number;
  large_bags_count: number;
  passengers_count: number;
  minimum_driver_age: number;
  acriss_codes: string;
  example_make_model: string[];
  vehicle_images: VehicleImage[];
  vehicle_images_v2: VehicleImageV2[];
  transmission_type: string;
  transmission_type_v2: string;
  driver_requirements: DriverRequirements;
  navigation_included: boolean;
  is_electric: boolean;
  charging_cable: string;
  is_luxury: boolean;
  doors_count: number;
  subline_transmission_type_ab: string;
  is_hybrid: boolean;
  offer_highlighted_features?: string[];
}

export interface Distance {
  distance: string;
  distance_unit: string;
}

export interface MileagePlan {
  plan_number: string;
  is_selected: boolean;
  is_unlimited: boolean;
  distance: Distance;
  total_amount: PriceDetail;
  base_amount: PriceDetail;
  extra_mileage_amount?: PriceDetail;
  total_price_difference: Amount;
  total_price_difference_display_suffix: string;
  total_price_difference_per_day: Amount;
  total_price_difference_per_day_display_suffix: string;
  additional_info_v2: {
    title: string;
    subtitle: string;
  };
  offer_list_price_difference_per_day: Amount;
  offer_list_price_difference_per_day_display_suffix: string;
}

export interface PresentationAttribute {
  id: string;
  name: string;
  value: string;
}

export interface DateTime {
  value: string;
}

export interface CarOffer {
  offer_matrix_id: string;
  offer_id: string;
  car_info: CarInfo;
  rate_code: string;
  deposit: Amount;
  price_total: PriceDetail;
  price_per_day: PriceDetail;
  promo_label?: string;
  mileage_included_formatted: string;
  sort_order: number;
  pickup_datetime: DateTime;
  return_datetime: DateTime;
  pickup_branch_id: string;
  return_branch_id: string;
  calculated_rental_days: number;
  calculated_rental_hours: number;
  pickup_distance: string;
  return_distance: string;
  offer_availability_status: string;
  offer_bundle: string;
  mileage_plans: MileagePlan[];
  expires_at: string;
  offer_acriss_code: string;
  is_retail_offer: boolean;
  presentation_attributes: PresentationAttribute[];
  presentation_attributes_v2: PresentationAttribute[];
  presentation_attributes_v3: PresentationAttribute[];
  is_young_driver_fee_applied: boolean;
  distance_to_original_location: Distance;
  yield_steering_id: string;
  yield_availability_id: string;
  yield_correlation_id: string;
  offer_highlighted_features?: string[];
  has_premium_location_fee: boolean;
  rental_points_price?: {
    gross: Amount;
    points: number;
  };
}

export interface OffersResponse {
  offers: CarOffer[];
}
