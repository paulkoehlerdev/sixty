import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const handleClick = () => {
    onSelect?.(pkg.id);
  };

  // Extract features from the package description
  const features = pkg.description.additional_info.line_item_info || [];

  return (
    <Card
      variant={variant}
      className={cn("relative cursor-pointer border transition-all hover:border-primary dark:border", 
        variant === "ai" && "hover:border-none",
        className)}
      onClick={handleClick}
    >
      {/* Radio button */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-all",
            pkg.is_selected ? "border-primary bg-primary" : "border-muted-foreground bg-transparent opacity-50",
          )}
        >
          {pkg.is_selected && <div className="h-full w-full scale-50 rounded-full bg-white" />}
        </div>
      </div>

      <CardHeader className="pb-3">
        {/* Title, Stars, and Discount */}
        <div className="flex items-center justify-between pr-8">
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
