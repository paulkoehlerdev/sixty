export type Positon = {
  latitude: number;
  longitude: number;
};

export type Branch = {
  id: string;
  location_id: string;
  title: string;
  description: string;
  type: string;
  position: Positon;
  formatted_address: string;
  locality: string;
  has_24h_pickup: boolean;
  has_24h_return: boolean;
  is_24h_branch: boolean;
  fastlane_type: string;
  vehicle_types: string[];
  vehicle_types_condensed: string[];
  directions: {
    type: string;
    text: string;
    title: string;
  }[];
  country_code: string;
  out_of_hours: {
    pickup: {
      policy: "OUT_OF_HOURS_POLICY_NOT_ALLOWED" | "OUT_OF_HOURS_POLICY_ALLOWED" | string;
      information: string;
    };
    return: {
      policy: "OUT_OF_HOURS_POLICY_NOT_ALLOWED" | "OUT_OF_HOURS_POLICY_ALLOWED" | string;
      information: string;
    };
  };
  timezone_id: string;
  is_e_vehicle_available: boolean;
  is_meet_greet_branch: boolean;
  meet_greet_note: string;
  is_flight_number_mandatory: boolean;
  requires_residence_country: boolean;
  country_del_col_type: string;
  country_name: string;
  branch_del_type: string;
  branch_col_type: string;
  branch_operational_type: string;
};

export type Location = {
  location_id: string;
  title: string;
  description: string;
  type: string;
  is_sixt_branch: boolean;
  position: Positon;
  formatted_address: string;
  branch: Branch;
  city: string;
  state: string;
  country_name: string;
  country_code: string;
  subtitle: string;
  title_v2: string;
  branches_count: number;
};

export type Image = {
  small_url: string;
  medium_url: string;
  large_url: string;
};

export type CarInfo = {
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
  vehicle_images: Image[];
  vehicle_images_v2: {
    key: string;
    images: Image[];
  }[];
  transmission_type: string;
  transmission_type_v2: string;
  driver_requirements: {
    minimum_age: number;
    young_driver: number;
    license_min_years: number;
    license_category: string;
  };
  navigation_included: boolean;
  is_electric: boolean;
  charging_cable: string;
  is_luxury: boolean;
  doors_count: number;
  subline_transmission_type_ab: string;
  is_hybrid: boolean;
};

export type Price = {
  currency: string;
  amount: number;
  value: number;
};

export type PriceBreakdown = {
  gross: Price;
  net: Price;
  tax: Price;
  display_amount: Price;
  price_unit: "PRICE_UNIT_PER_DAY" | "PRICE_UNIT_RENTAL" | string;
  display_suffix: string;
  tracking_net: Price;
};

export type Distance = {
  distance: string;
  distance_unit: string;
};

export type MileagePlan = {
  plan_number: string;
  is_selected: boolean;
  is_unlimited: boolean;
  distance: Distance;
  total_amount: PriceBreakdown;
  base_amount: PriceBreakdown;
  extra_mileage_amount: PriceBreakdown | undefined;
  total_price_difference: Price;
  total_price_difference_display_suffix: string;
  total_price_difference_per_day: Price;
  total_price_difference_per_day_display_suffix: string;
  additional_info_v2: {
    title: string;
    subtitle: string;
  };
  offer_list_price_difference_per_day: Price;
  offer_list_price_difference_per_day_display_suffix: string;
};

export type OfferId = string;

export type Offer = {
  offer_id: OfferId;
  car_info: CarInfo;
  rate_code: string;
  deposit: Price;
  price_total: PriceBreakdown;
  price_per_day: PriceBreakdown;
  promo_label: string;
  mileage_included_formatted: string;
  sort_order: number;
  pickup_datetime: { value: string };
  return_datetime: { value: string };
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
  presentation_attributes_v3: PresentationAttribute[];
  is_young_driver_fee_applied: boolean;
  distance_to_original_location: Distance;
  has_premium_location_fee: true;
  rental_points_price: {
    points: number;
    gross: Price;
  };
};

export type PresentationAttribute = {
  id:
    | "numberOfPassengers"
    | "bags"
    | "largeBags"
    | "transmissionTypeV2"
    | "doors"
    | "minDriverAge"
    | "fullChargeDistance"
    | "chargingCableIncluded";
  name: string;
  value: string;
};

export type SelectedLocation = {
  location_selection_id: string;
  selected_location: Location;
};

export type SearchRequest = {
  pickup_timestamp: Date;
  return_timestamp: Date;
  pickup_location_selection_id: string;
  return_location_selection_id: string;
};

export type AddOnDescription = {
  id: string;
  category: string;
  name: string;
  description: string;
  tags: unknown[];
  more_information_lines: string[];
  group_id: string;
  more_information_lines_v2: string[];
  additional_info: {
    name: string;
    description: string;
    icon: {
      id: string;
      url: string;
    };
    line_item_info: {
      name: string;
      description: string;
      display_category: "DISPLAY_CATEGORY_INCLUDED" | "DISPLAY_CATEGORY_EXCLUDED" | string;
      display_group: "DISPLAY_GROUP_NON_COLLAPSIBLE" | string;
      ref_id: string;
    }[];
    description_long: string;
    promo_label: string;
  };
};

export type Package = {
  id: string;
  description: AddOnDescription;
  actual_price: PriceBreakdown;
  discount_percent: number;
  quantity: number;
  max_quantity: number;
  damage_excess: Price;
  theft_excess: Price;
  actual_total_price: PriceBreakdown;
  deductible_text: string;
  stars: number;
  is_selected: boolean;
  discount_text: string;
  top_pick_text: string;
};

export type Product = {
  charge_code: string;
  internal_name: string;
  quantity: number;
  actual_price: PriceBreakdown;
  discount_percent: number;
  is_protection: boolean;
  is_physical: boolean;
  max_quantity: number;
  description: AddOnDescription;
  category: string;
  deductible_text: string;
  is_mandatory: boolean;
  is_selected: boolean;
  is_included_in_package: boolean;
  is_disabled: boolean;
  is_selected_by_user: boolean;
  damage_excess?: Price;
  theft_excess?: Price;
};

export type AddOns = {
  packages: Package[];
  products: Product[];
};

export type Booking = {
  offer_v2: Offer;
  available_add_ons_v2: AddOns;
  offer_list_price_per_day: PriceBreakdown;
};
