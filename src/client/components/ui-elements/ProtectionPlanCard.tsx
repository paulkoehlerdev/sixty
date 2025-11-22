import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessCheckmark } from "@/components/ui/success-checkmark";
import type { Package } from "@/lib/sixt/types";
import { cn } from "@/lib/utils";
import { FeatureIcon } from "../shared/FeatureIcon";
import { PriceDisplay } from "./PriceDisplay";

interface ProtectionPlanCardProps {
  package: Package;
  onSelect?: (packageId: string) => void;
  className?: string;
  variant?: "normal" | "ai";
}

export function ProtectionPlanCard({ package: pkg, onSelect, className, variant = "normal" }: ProtectionPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isSuccess = pkg.is_selected;

  useEffect(() => {
    // Reset loading state when selection is successful
    if (isSuccess && isLoading) {
      setIsLoading(false);
    }
  }, [isSuccess, isLoading]);

  const handleClick = () => {
    if (isSuccess || isLoading) {
      return;
    }
    setIsLoading(true);
    onSelect?.(pkg.id);
  };

  // Extract features from the package description
  const features = pkg.description.additional_info.line_item_info || [];

  return (
    <Card
      variant={isSuccess ? "success" : variant}
      className={cn(
        "relative transition-all",
        !isSuccess && "border dark:border",
        !isSuccess && !isLoading && "cursor-pointer hover:border-primary",
        variant === "ai" && !isSuccess && "hover:border-none",
        isLoading && "opacity-75",
        className,
      )}
      onClick={handleClick}
    >
      {/* Success Checkmark */}
      {isSuccess && <SuccessCheckmark className="absolute top-4 right-4 z-10" size="md" />}

      {/* Loading/Radio button */}
      {!isSuccess && (
        <div className="absolute top-4 right-4 z-10">
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-all",
                "border-muted-foreground bg-transparent opacity-50",
              )}
            />
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Title, Stars, and Discount */}
        <div className="flex items-center justify-between pr-10">
          <CardTitle className="font-bold text-base text-card-foreground">{pkg.description.name}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= pkg.stars ? "fill-foreground" : "fill-none text-muted-foreground opacity-50",
                  )}
                />
              ))}
            </div>

            {/* Discount Badge */}
            {pkg.discount_percent > 0 && (
              <Badge className="border-none bg-orange-500 text-white">-{pkg.discount_percent}%</Badge>
            )}
          </div>
        </div>

        {/* Deductible and Price */}
        <div className="mt-3 flex items-center justify-between">
          <p className="font-medium text-card-foreground text-sm">{pkg.deductible_text}</p>
          <PriceDisplay price={pkg.actual_total_price} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 rounded-b-2xl bg-background p-4">
        {features.map((feature) => (
          <div key={feature.ref_id} className="group/feature flex items-start gap-3">
            <FeatureIcon
              included={feature.display_category === "DISPLAY_CATEGORY_INCLUDED"}
              className="mt-0.5 transition-opacity group-hover/feature:opacity-100"
            />
            <span className="text-card-foreground text-sm">{feature.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
