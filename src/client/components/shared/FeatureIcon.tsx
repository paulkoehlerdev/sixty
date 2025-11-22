import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureIconProps {
  included: boolean;
  className?: string;
}

export function FeatureIcon({ included, className }: FeatureIconProps) {
  if (included) {
    return <Check className={cn("h-4 w-4 shrink-0u text-muted-foreground", className)} />;
  }
  return <X className={cn("h-4 w-4 shrink-0 text-muted-foreground", className)} />;
}
