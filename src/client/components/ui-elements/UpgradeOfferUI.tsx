import { Card } from "@/components/ui/card.tsx";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils.ts";
import { CarOfferCardContent } from "../CarOfferCard.tsx";

interface UpgradeOfferUIProps {
  offer: Offer;
  baseOffer: Offer | undefined;
  className?: string;
}

export function UpgradeOfferUI({ offer, baseOffer, className }: UpgradeOfferUIProps) {
  return (
    <div className={cn(className)}>
      <h2 className="mb-4 font-bold text-foreground text-lg">Recommended Upgrade</h2>
      <Card variant="ai">
        <CarOfferCardContent offer={offer} baseOffer={baseOffer} />
      </Card>
    </div>
  );
}
