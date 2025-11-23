import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { Booking, Offer } from "@/lib/sixt/types";
import { cn } from "@/lib/utils.ts";
import { CarOfferCardContent } from "../CarOfferCard.tsx";

interface UpgradeOfferUIProps {
  offer: Offer;
  baseOffer: Offer | undefined;
  booking: Booking | undefined;
  onUpgrade: () => void;
  className?: string;
  aiTextInput: {
    header: string;
    text: string;
  }[];
}

export function UpgradeOfferUI({ offer, baseOffer, booking, className, aiTextInput, onUpgrade }: UpgradeOfferUIProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isSuccess = booking?.offer_v2?.offer_id === offer.offer_id;
  const canUpgrade = !isSuccess && !booking;

  useEffect(() => {
    // Reset loading state when booking changes and matches
    if (isSuccess && isLoading) {
      setIsLoading(false);
    }
  }, [isSuccess, isLoading]);

  const handleUpgrade = () => {
    setIsLoading(true);
    onUpgrade();
  };

  return (
    <div className={cn(className, "relative")}>
      <Card
        variant={isSuccess ? "success" : canUpgrade ? "ai" : "normal"}
        className={cn("dark:border-none", !canUpgrade && !isSuccess && "opacity-50")}
      >
        <CarOfferCardContent offer={offer} baseOffer={baseOffer} showPrice={true} isSuccess={isSuccess} />

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

        {canUpgrade && (
          <div className="p-3">
            <Button className="w-full p-2" onClick={handleUpgrade} disabled={isLoading}>
              {isLoading ? (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative mr-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="h-4 w-4 text-primary-foreground" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary-foreground/20"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <span>Loading...</span>
                </motion.div>
              ) : (
                "Upgrade"
              )}
            </Button>
          </div>
        )}

        {(isSuccess || !canUpgrade) && <div className="h-2" />}
      </Card>
    </div>
  );
}
