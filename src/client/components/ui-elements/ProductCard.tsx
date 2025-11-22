"use client";

import { Baby, Car, Fuel, Globe, Navigation, Sparkles, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Product } from "@/lib/sixt/types";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PriceDisplay";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggle: (productId: string) => void;
  isPopular?: boolean;
  className?: string;
}

// Icon mapping based on product category/internal name
const getIconForProduct = (product: Product) => {
  const name = product.internal_name.toLowerCase();
  const _category = product.description.category.toLowerCase();

  if (name.includes("driver") || name.includes("fahrer")) {
    return Users;
  }
  if (name.includes("navigation") || name.includes("gps")) {
    return Navigation;
  }
  if (name.includes("fuel") || name.includes("tank") || name.includes("betankung")) {
    return Fuel;
  }
  if (name.includes("abroad") || name.includes("ausland") || name.includes("cross")) {
    return Globe;
  }
  if (name.includes("baby") || name.includes("child") || name.includes("kind") || name.includes("seat")) {
    return Baby;
  }

  // Default icon
  return Car;
};

export function ProductCard({ product, isSelected, onToggle, isPopular = false, className }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const Icon = getIconForProduct(product);
  const currentSelected = isSelected || product.is_selected;
  const prevSelectedRef = useRef(currentSelected);

  useEffect(() => {
    // Reset loading state when selection state changes
    if (prevSelectedRef.current !== currentSelected) {
      setIsLoading(false);
      prevSelectedRef.current = currentSelected;
    }
  });

  const handleToggle = () => {
    if (!product.is_disabled && !product.is_mandatory && !isLoading) {
      setIsLoading(true);
      onToggle(product.charge_code);
    }
  };

  return (
    <Card
      variant={currentSelected ? "ai" : undefined}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        product.is_disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <Badge className="border-none bg-gradient-to-r from-primary to-primary/80 px-1.5 py-0 text-[10px] text-primary-foreground shadow-md">
            <Sparkles className="mr-1 h-2.5 w-2.5" />
            Beliebt
          </Badge>
        </div>
      )}

      {product.discount_percent > 0 && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <Badge className="border-none bg-orange-500 px-1.5 py-0 text-[10px] text-white">
            -{product.discount_percent}%
          </Badge>
        </div>
      )}

      <div className="p-2">
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div className={cn("shrink-0 rounded-lg bg-muted p-2 transition-all duration-300")}>
            <Icon className="h-4 w-4" />
          </div>

          {/* Title and Description */}
          <div className="min-w-0 flex-1">
            <h3 className="text-balance font-semibold text-sm leading-tight">{product.description.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs leading-snug">
              {product.description.description}
            </p>
          </div>

          {/* Price */}
          <div className="shrink-0 text-right">
            <PriceDisplay price={product.actual_price} />
          </div>

          {/* Toggle Switch */}
          <div className="shrink-0">
            <Switch checked={currentSelected || product.is_mandatory} onCheckedChange={handleToggle} />
          </div>
        </div>
      </div>
    </Card>
  );
}
