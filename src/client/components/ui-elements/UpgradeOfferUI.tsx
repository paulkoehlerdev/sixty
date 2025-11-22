import { Button } from "@/components/ui/button.tsx";
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
      <Card variant="success">
        <CarOfferCardContent offer={offer} baseOffer={baseOffer} showPrice={true} />

        <div className="p-3">
          <Button className="w-full p-2">Upgrade</Button>
        </div>
      </Card>
    </div>
  );
}
