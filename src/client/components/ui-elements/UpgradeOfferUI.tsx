import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { Offer } from "@/lib/sixt/types";
import { CarOfferCardContent } from "../CarOfferCard.tsx";
import { cn } from "@/lib/utils.ts";

interface UpgradeOfferUIProps {
  offer: Offer;
  className?: string;
}

export function UpgradeOfferUI({ offer, className }: UpgradeOfferUIProps) {
  return (
    <div className={cn(className)}>
      <h2 className="mb-4 font-bold text-foreground text-lg">Recommended Upgrade</h2>
      <Card variant="ai">
        <CarOfferCardContent offer={offer} />
      </Card>
      <Button className="mt-2 w-full p-2">Upgrade</Button>
    </div>
  );
}
