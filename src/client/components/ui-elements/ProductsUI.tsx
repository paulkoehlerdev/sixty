"use client";

import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/sixt/types";
import { ProductCard } from "./ProductCard";

interface ProductsUIProps {
  products: Product[];
  selectedProductIds?: string[];
  onProductToggle?: (productId: string) => void;
  popularProductId?: string;
}

export function ProductsUI({ products, selectedProductIds = [], onProductToggle, popularProductId }: ProductsUIProps) {
  return (
    <div className="bg-background px-5 py-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-foreground text-xl">Verfügbare Extras</h2>
          <Badge variant="secondary" className="px-2 py-0.5 text-xs">
            {selectedProductIds.length} ausgewählt
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard
              key={product.charge_code}
              product={product}
              isSelected={selectedProductIds.includes(product.charge_code) || product.is_selected}
              onToggle={onProductToggle || (() => {})}
              isPopular={product.charge_code === popularProductId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
