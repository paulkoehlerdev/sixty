import type { CarOffer } from "../../../lib/offers";
import { CarOfferCard } from "../CarOfferCard.tsx";

interface UpgradeOfferUIProps {
  offer: CarOffer;
}

export function UpgradeOfferUI({ offer }: UpgradeOfferUIProps) {
  return (
    <div className="bg-background px-5 py-4">
      <div className="mx-auto max-w-md">
        <h2 className="mb-4 font-bold text-foreground text-lg">AI Recommended Upgrade</h2>
        <CarOfferCard offer={offer} variant="ai" />
      </div>
    </div>
  );
}
