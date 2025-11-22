"use client";

import type { Product } from "@/lib/sixt/types";
import { ProductCard } from "./ProductCard";

interface ProductsUIProps {
  products: Product[];
  selectedProductIds?: string[];
  onProductToggle?: (productId: string) => void;
  popularProductChargeCodes?: string[];
}

export function ProductsUI({
  products,
  selectedProductIds = [],
  onProductToggle,
  popularProductChargeCodes = [],
}: ProductsUIProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
      {products.map((product) => (
        <ProductCard
          key={product.charge_code}
          product={product}
          isSelected={selectedProductIds.includes(product.charge_code) || product.is_selected}
          onToggle={onProductToggle || (() => {})}
          isPopular={popularProductChargeCodes.includes(product.charge_code)}
        />
      ))}
    </div>
  );
}
