import { Briefcase, Gauge, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CarOffer } from "../types/offers";
import { CarCard, CarCardFeatures, CarCardHeader, VehicleImageDisplay } from "./CarCard";

interface UpgradeCardProps {
  offer: CarOffer;
  variant?: "normal" | "ai";
}

export function UpgradeCard({ offer, variant = "normal" }: UpgradeCardProps) {
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
      <CarCard variant={variant}>
        <CarCardHeader title={car_info.title} subline={car_info.subline} badges={badges} />

        {/* Vehicle Image */}
        <div className="relative w-full">
          <VehicleImageDisplay src={getImageUrl()} alt={car_info.title} />
        </div>

        {/* Features Section */}
        {car_info.offer_highlighted_features && car_info.offer_highlighted_features.length > 0 && (
          <CarCardFeatures features={car_info.offer_highlighted_features} offerId={offer.offer_id} />
        )}

        {/* Promo Label */}
        {offer.promo_label && (
          <div className="absolute top-4 right-4 z-30">
            <Badge className="bg-primary text-primary-foreground">{offer.promo_label}</Badge>
          </div>
        )}
      </CarCard>
  );
}
