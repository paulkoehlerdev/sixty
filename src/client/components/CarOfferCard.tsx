import { BatteryFullIcon, Briefcase, CogIcon, PercentCircleIcon, UserIcon } from "lucide-react";
import { match } from "ts-pattern";
import { PriceDisplay } from "@/client/components/ui-elements/PriceDisplay.tsx";
import { Badge } from "@/components/ui/badge";
import { SuccessCheckmark } from "@/components/ui/success-checkmark.tsx";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils.ts";
import { CarCardHeader, VehicleImageDisplay } from "./CarCard";

interface UpgradeCardProps {
  offer: Offer;
  baseOffer?: Offer;
  showPrice?: boolean;
  isSuccess?: boolean;
}

export function CarOfferCardContent({ offer, baseOffer, showPrice = false, isSuccess = false }: UpgradeCardProps) {
  const { car_info } = offer;

  // Get the best image URL (prefer frontview from v2, fallback to regular images)
  const getImageUrl = () => {
    const frontviewImage = car_info.vehicle_images_v2?.find((img) => img.key === "frontview");
    if (frontviewImage?.images?.[0]?.large_url) {
      return frontviewImage.images[0].large_url;
    }
    return car_info.vehicle_images?.[0]?.large_url || "/placeholder.svg";
  };

  const badges = offer.presentation_attributes_v3
    .filter(
      (attribute) =>
        attribute.id === "bags" ||
        attribute.id === "numberOfPassengers" ||
        attribute.id === "transmissionTypeV2" ||
        attribute.id === "fullChargeDistance" ||
        attribute.id === "minDriverAge" ||
        attribute.id === "chargingCableIncluded",
    )
    .map((attribute) => (
      <Badge variant="secondary" className="flex items-center gap-1.5" key={attribute.id}>
        {match(attribute.id)
          .with("bags", () => <Briefcase className="h-3.5 w-3.5" />)
          .with("numberOfPassengers", () => <UserIcon className="h-3.5 w-3.5" />)
          .with("transmissionTypeV2", () => <CogIcon className="h-3.5 w-3.5" />)
          .with("fullChargeDistance", () => <BatteryFullIcon className="h-3.5 w-3.5" />)
          .with("minDriverAge", () => <div>Required driver age:</div>)
          .with("chargingCableIncluded", () => <></>)
          .otherwise(() => (
            <div>{attribute.name}</div>
          ))}
        {attribute.value}
      </Badge>
    ));

  if (offer.promo_label) {
    badges.push(
      <Badge
        variant="secondary"
        className={cn("flex items-center gap-1.5", !isSuccess && "border-primary text-primary")}
      >
        <PercentCircleIcon className="h-3.5 w-3.5" />
        {offer.promo_label}
      </Badge>,
    );
  }

  return (
    <>
      <CarCardHeader
        title={car_info.title}
        subline={car_info.subline}
        badges={badges}
        titleBadges={[
          showPrice && <PriceDisplay price={offer.price_per_day} comparisonPrice={baseOffer?.price_per_day} />,
          isSuccess && <SuccessCheckmark size="md" />,
        ]}
      />

      <div className="relative w-full px-5">
        <VehicleImageDisplay src={getImageUrl()} alt={car_info.title} />
      </div>
    </>
  );
}
