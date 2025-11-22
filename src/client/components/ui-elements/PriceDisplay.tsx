import type { PriceBreakdown } from "@/lib/sixt/types.ts";

export type PriceDisplayProps = { price: PriceBreakdown; comparisonPrice?: PriceBreakdown };

export function PriceDisplay({ price, comparisonPrice }: PriceDisplayProps) {
  let value = price.display_amount.value;

  if (comparisonPrice) {
    value = price.display_amount.value - comparisonPrice.display_amount.value;
  }

  const [left, right] = value.toFixed(2).split(".");
  return (
    <p className="font-bold">
      <span className="text-xl">
        {comparisonPrice && <>{value > 0 ? "+" : "-"}</>}
        {left}
      </span>
      <span className="text-sm">
        ,{right} € {price.display_suffix}
      </span>
    </p>
  );
}
