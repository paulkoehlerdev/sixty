import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils.ts";
import { CarOfferCardContent } from "../CarOfferCard.tsx";
import { Check } from "lucide-react";

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
      <Card variant="success">
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
          <Button className="w-full p-2" onClick={() => onUpgrade()}>
            Upgrade
          </Button>
        </div>
      </Card>
    </div>
  );
}
