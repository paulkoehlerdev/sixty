import { Briefcase, Gauge, Users } from "lucide-react";
import { PriceDisplay } from "@/client/components/ui-elements/PriceDisplay.tsx";
import { Badge } from "@/components/ui/badge";
import type { Offer } from "@/lib/sixt/types";
import { CarCardHeader, VehicleImageDisplay } from "./CarCard";

interface UpgradeCardProps {
  offer: Offer;
  baseOffer?: Offer;
  showPrice?: boolean;
}

export function CarOfferCardContent({ offer, baseOffer, showPrice = false }: UpgradeCardProps) {
  const { car_info } = offer;

  // Get the best image URL (prefer frontview from v2, fallback to regular images)
  const getImageUrl = () => {
    const frontviewImage = car_info.vehicle_images_v2?.find((img) => img.key === "frontview");
    if (frontviewImage?.images?.[0]?.large_url) {
      return frontviewImage.images[0].large_url;
    }
    return car_info.vehicle_images?.[0]?.large_url || "/placeholder.svg";
  };

  // Get transmission type display text
  const getTransmissionType = () => {
    if (car_info.transmission_type_v2?.includes("MANUAL")) {
      return "Manual";
    }
    if (car_info.transmission_type_v2?.includes("AUTOMATIC")) {
      return "Automatic";
    }
    return null;
  };

  // Build badges
  const badges = (
    <>
      {car_info.mileage_formatted && (
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5" />
          {car_info.mileage_formatted}
        </Badge>
      )}
      <Badge variant="secondary" className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" />
        {car_info.passengers_count}
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-1.5">
        <Briefcase className="h-3.5 w-3.5" />
        {car_info.bags_count}
      </Badge>
      {getTransmissionType() && <Badge variant="secondary">{getTransmissionType()}</Badge>}
    </>
  );

  return (
    <>
      <CarCardHeader title={car_info.title} subline={car_info.subline} badges={badges} />

      {/* Vehicle Image */}
      <div className="relative w-full px-5">
        <VehicleImageDisplay src={getImageUrl()} alt={car_info.title} />
      </div>

      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
        {/* Promo Label */}
        {offer.promo_label && <Badge className="bg-primary text-primary-foreground">{offer.promo_label}</Badge>}

        {/* Price difference */}
        {showPrice && <PriceDisplay price={offer.price_per_day} comparisonPrice={baseOffer?.price_per_day} />}
      </div>
    </>
  );
}
