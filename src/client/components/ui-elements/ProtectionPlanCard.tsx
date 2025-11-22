import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FeatureIcon } from "../shared/FeatureIcon";

export interface ProtectionPlanFeature {
  id: string;
  name: string;
  included: boolean;
}

export interface ProtectionPlan {
  id: string;
  title: string;
  rating: number; // 0-3 stars
  deductible: string;
  deductibleColor?: "default" | "red" | "green";
  discount?: string;
  features: ProtectionPlanFeature[];
  isSelected?: boolean;
}

// Re-export default plans for convenience
export { defaultProtectionPlans } from "./defaultProtectionPlans";

interface ProtectionPlanCardProps {
  plan: ProtectionPlan;
  onSelect?: (planId: string) => void;
  className?: string;
  variant?: "normal" | "ai";
}

export function ProtectionPlanCard({ plan, onSelect, className, variant = "normal" }: ProtectionPlanCardProps) {
  const handleClick = () => {
    onSelect?.(plan.id);
  };

  return (
    <Card
      variant={variant}
      className={cn(
        "relative cursor-pointer border transition-all hover:scale-[1.02]",
        variant === "ai" && "border-none",
        plan.isSelected && "ring-2 ring-primary",
        className,
      )}
      onClick={handleClick}
    >
      {/* Radio button */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-all",
            plan.isSelected ? "border-primary bg-primary" : "border-muted-foreground bg-transparent opacity-50",
          )}
        >
          {plan.isSelected && <div className="h-full w-full scale-50 rounded-full bg-white" />}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between pr-8">
          <CardTitle className="font-bold text-base text-card-foreground">{plan.title}</CardTitle>
        </div>

        {/* Star Rating */}
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= plan.rating ? "fill-foreground" : "fill-none text-muted-foreground opacity-50",
              )}
            />
          ))}
        </div>

        {/* Discount Badge */}
        {plan.discount && (
          <div className="mt-2">
            <Badge className="border-none bg-orange-500 text-white">{plan.discount}</Badge>
          </div>
        )}

        {/* Deductible */}
        <div className="mt-3">
          <p
            className={cn(
              "font-medium text-sm",
              plan.deductibleColor === "red" && "text-red-500",
              plan.deductibleColor === "green" && "text-green-500",
              !plan.deductibleColor && "text-card-foreground",
            )}
          >
            Deductible: {plan.deductible}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 rounded-b-2xl bg-background p-4">
        {plan.features.map((feature) => (
          <div key={feature.id} className="group/feature flex items-start gap-3">
            <FeatureIcon
              included={feature.included}
              className="mt-0.5 transition-opacity group-hover/feature:opacity-100"
            />
            <span className="text-card-foreground text-sm">{feature.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
