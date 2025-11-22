import type { Offer } from "@/lib/sixt/types";
import { CarOfferCard } from "../CarOfferCard.tsx";
import { Button } from "@/components/ui/button.tsx";

interface UpgradeOfferUIProps {
  offer: Offer;
}

export function UpgradeOfferUI({ offer }: UpgradeOfferUIProps) {
  return <div>
    <h2 className="mb-4 font-bold text-foreground text-lg">Recommended Upgrade</h2>
    <CarOfferCard offer={offer} variant="ai" />
    <Button className="w-full mt-2 p-2">Upgrade</Button>
    </div>;
}
