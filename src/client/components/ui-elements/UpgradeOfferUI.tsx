import { Check } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils.ts";
import { CarOfferCardContent } from "../CarOfferCard.tsx";

interface UpgradeOfferUIProps {
  offer: Offer;
  baseOffer: Offer | undefined;
  onUpgrade: () => void;
  className?: string;
  aiTextInput: {
    header: string;
    text: string;
  }[];
}

export function UpgradeOfferUI({ offer, baseOffer, className, aiTextInput, onUpgrade }: UpgradeOfferUIProps) {
  return (
    <div className={cn(className)}>
      <Card variant="ai">
        <CarOfferCardContent offer={offer} baseOffer={baseOffer} showPrice={true} />

        <div className="my-3 grid grid-cols-[auto_1fr] gap-y-3 px-5">
          {aiTextInput.map((input) => (
            <>
              <div className="w-10">
                <Check />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-bold">{input.header}</p>
                <p className="text-muted-foreground text-sm">{input.text}</p>
              </div>
            </>
          ))}
        </div>

        <div className="p-3">
          <Button className="w-full p-2" onClick={() => onUpgrade()}>
            Upgrade
          </Button>
        </div>
      </Card>
    </div>
  );
}
