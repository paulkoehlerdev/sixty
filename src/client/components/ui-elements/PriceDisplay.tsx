import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import type { PriceBreakdown } from "@/lib/sixt/types.ts";
import { cn } from "@/lib/utils.ts";

const priceDisplayVariants = cva("font-bold", {
  variants: {
    size: {
      xl: "",
      sm: "",
    },
  },
  defaultVariants: {
    size: "xl",
  },
});

const priceDisplayMainTextVariants = cva("", {
  variants: {
    size: {
      xl: "text-xl",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    size: "xl",
  },
});

const priceDisplayDecimalVariants = cva("", {
  variants: {
    size: {
      xl: "text-base",
      sm: "text-[10px]",
    },
  },
  defaultVariants: {
    size: "xl",
  },
});

export type PriceDisplayProps = {
  price: PriceBreakdown;
  comparisonPrice?: PriceBreakdown;
  displaySuffix?: boolean;
} & ComponentProps<"p"> &
  VariantProps<typeof priceDisplayVariants>;

export function PriceDisplay({
  price,
  comparisonPrice,
  displaySuffix = true,
  className,
  size,
  ...props
}: PriceDisplayProps) {
  let value = price.display_amount.value;

  if (comparisonPrice) {
    value = price.display_amount.value - comparisonPrice.display_amount.value;
  }

  const [left, right] = Math.abs(value).toFixed(2).split(".");
  return (
    <p className={cn(priceDisplayVariants({ size }), className)} {...props}>
      <span className={priceDisplayMainTextVariants({ size })}>
        {comparisonPrice && <>{value > 0 ? "+" : "-"}</>}
        {left}
      </span>
      <span className={priceDisplayDecimalVariants({ size })}>
        ,{right} € {displaySuffix && price.display_suffix}
      </span>
    </p>
  );
}
