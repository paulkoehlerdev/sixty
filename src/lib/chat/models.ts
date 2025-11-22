import type { Branch, CarInfo, Distance, Image, MileagePlan, Offer, Positon, Price } from "../sixt/types.ts";

type ChatBranch = {
  location_id: string;
  title: string;
  description: string;
  type: string;
  position: Positon;
  formatted_address: string;
  locality: string;
  vehicle_types_condensed: string[];
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
};

function mapApiBranchToChatBranch(b: Branch): ChatBranch {
  return {
    location_id: b.location_id,
    title: b.title,
    description: b.description,
    type: b.type,
    position: b.position,
    formatted_address: b.formatted_address,
    locality: b.locality,
    vehicle_types_condensed: b.vehicle_types,
    country_code: b.country_code,
    out_of_hours: b.out_of_hours,
    timezone_id: b.timezone_id,
    is_e_vehicle_available: b.is_e_vehicle_available,
  };
}

type ChatMileagePlan = {
  is_unlimited: boolean;
  distance: Distance;
  total_amount: Price;
  extra_mileage_amount: Price | undefined;
  total_price_difference: Price;
  total_price_difference_per_day: Price;
  additional_info_v2: {
    title: string;
    subtitle: string;
  };
};

function mapMileagePlanToChatMileagePlan(mp: MileagePlan): ChatMileagePlan {
  return {
    is_unlimited: mp.is_unlimited,
    distance: mp.distance,
    total_amount: mp.total_amount.display_amount,
    extra_mileage_amount: mp.extra_mileage_amount === undefined ? undefined : mp.extra_mileage_amount.display_amount,
    total_price_difference: mp.total_price_difference,
    total_price_difference_per_day: mp.total_price_difference_per_day,
    additional_info_v2: mp.additional_info_v2,
  };
}

type ChatCarInfo = {
  product_type: string;
  group_type: string;
  guaranteed_model: boolean;
  title: string;
  subtitle: string;
  subtitle_prefix: string;
  popularity: string;
  rating: number;
  bags_count: number;
  small_bags_count: number;
  large_bags_count: number;
  passengers_count: number;
  minimum_driver_age: number;
  example_make_model: string[];
  vehicle_images_v2: {
    key: string;
    images: Image[];
  }[];
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
  is_hybrid: boolean;
};

function mapCarInfoToChatCarInfo(c: CarInfo): ChatCarInfo {
  return {
    product_type: c.product_type,
    group_type: c.group_type,
    guaranteed_model: c.guaranteed_model,
    title: c.title,
    subtitle: c.subtitle,
    subtitle_prefix: c.subtitle_prefix,
    popularity: c.popularity,
    rating: c.rating,
    bags_count: c.bags_count,
    small_bags_count: c.small_bags_count,
    large_bags_count: c.large_bags_count,
    passengers_count: c.passengers_count,
    minimum_driver_age: c.minimum_driver_age,
    example_make_model: c.example_make_model,
    vehicle_images_v2: c.vehicle_images_v2,
    transmission_type_v2: c.transmission_type_v2,
    driver_requirements: c.driver_requirements,
    navigation_included: c.navigation_included,
    is_electric: c.is_electric,
    charging_cable: c.charging_cable,
    is_luxury: c.is_luxury,
    doors_count: c.doors_count,
    is_hybrid: c.is_hybrid,
  };
}

type ChatCarOffer = {
  offer_id: string;
  price_total: Price;
  price_per_day: Price;
  mileage_plans: ChatMileagePlan[];
  car_info: ChatCarInfo;
};

export function mapOfferToChatCarOffer(o?: Offer): ChatCarOffer | undefined {
  if (!o) {
    return undefined;
  }

  return {
    offer_id: o.offer_id,
    price_total: o.price_total.display_amount,
    price_per_day: o.price_per_day.display_amount,
    mileage_plans: o.mileage_plans.map(mapMileagePlanToChatMileagePlan),
    car_info: mapCarInfoToChatCarInfo(o.car_info),
  };
}
