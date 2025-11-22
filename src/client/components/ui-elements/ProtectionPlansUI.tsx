import type { Package } from "@/lib/sixt/types";
import { ProtectionPlanCard } from "./ProtectionPlanCard";

interface ProtectionPlansUIProps {
  packages: Package[];
  onPackageSelect?: (packageId: string) => void;
  bestValuePackageId?: string;
}

export function ProtectionPlansUI({ packages, onPackageSelect, bestValuePackageId }: ProtectionPlansUIProps) {
  return (
    <div className="my-4 grid grid-cols-1 gap-4">
      {packages.map((pkg) => (
        <ProtectionPlanCard
          key={pkg.id}
          package={pkg}
          onSelect={onPackageSelect}
          variant={pkg.id === bestValuePackageId ? "ai" : "normal"}
        />
      ))}
    </div>
  );
}
