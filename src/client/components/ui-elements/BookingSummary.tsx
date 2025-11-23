import { CheckCircle2, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product, Package as ProtectionPackage } from "@/lib/sixt/types";
import type { AgentState } from "@/lib/state";
import { useAgentState } from "../AgentStateContext";
import { CarOfferCardContent } from "../CarOfferCard";
import { PriceDisplay } from "./PriceDisplay";

interface BookingSummaryProps {
  state: AgentState;
}

export function BookingSummary({ state }: BookingSummaryProps) {
  const { unlockCar } = useAgentState();
  // Use booking if available, otherwise use initialOffer
  const offer = state.booking?.offer_v2 ?? state.initialOffer;
  const addOns = state.booking?.available_add_ons_v2;

  if (!offer) {
    return null;
  }

  // Get selected protection package
  const selectedPackage = addOns?.packages.find((pkg: ProtectionPackage) => pkg.is_selected);

  // Get selected and included products
  const selectedProducts = addOns?.products.filter(
    (product: Product) => product.is_selected || product.is_mandatory || product.is_included_in_package,
  );

  return (
    <Card variant="normal" className="dark:border-none">
      <CardHeader className="pb-0">
        <CardTitle className="font-bold text-[#ff5000] text-lg">Booking Summary</CardTitle>
      </CardHeader>

      <CarOfferCardContent offer={offer} />

      <CardContent className="space-y-4">
        {selectedPackage && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 font-semibold text-muted-foreground text-sm">
              <Shield className="h-4 w-4" />
              Protection Package
            </h3>
            <div className="rounded-lg border-2 border-green-500/30 bg-green-50/50 p-3 dark:bg-green-950/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{selectedPackage.description.name}</p>
                  <p className="mt-1 text-muted-foreground text-xs">{selectedPackage.deductible_text}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Add-ons Section */}
        {selectedProducts && selectedProducts.length > 0 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 font-semibold text-muted-foreground text-sm">
              <Package className="h-4 w-4" />
              Add-ons
            </h3>
            <div className="space-y-1.5">
              {selectedProducts.map((product: Product) => (
                <div
                  key={product.charge_code}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{product.description.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
          <span className="text-muted-foreground text-sm">Total Price</span>
          <PriceDisplay price={offer.price_total} displaySuffix={false} />
        </div>

        <Button className="w-full" onClick={unlockCar}>
          Unlock Car
        </Button>
      </CardContent>
    </Card>
  );
}
