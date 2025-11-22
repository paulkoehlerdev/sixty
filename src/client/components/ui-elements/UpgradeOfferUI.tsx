import { Card } from "@/components/ui/card.tsx";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils.ts";
import { CarOfferCardContent } from "../CarOfferCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Check } from "lucide-react";

interface UpgradeOfferUIProps {
  offer: Offer;
  baseOffer: Offer | undefined;
  className?: string;
  aiTextInput: {
    header: string;
    text: string;
  }[];
}

export function UpgradeOfferUI({ offer, baseOffer, className, aiTextInput }: UpgradeOfferUIProps) {
  return (
    <div className={cn(className)}>
      <Card variant="ai">
        <CarOfferCardContent offer={offer} baseOffer={baseOffer} showPrice={true} />

        <div className="my-3 grid grid-cols-[auto_1fr] px-5 gap-y-3">
          {aiTextInput.map((input) => (
            <>
              <div className="w-10">
                <Check></Check>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-bold">{input.header}</p>
                <p className="text-sm text-muted-foreground">{input.text}</p>
              </div>
            </>
          ))}
        </div>

        <div className="p-3">
          <Button className="w-full p-2">Upgrade</Button>
        </div>
      </Card>
    </div>
  );
}
