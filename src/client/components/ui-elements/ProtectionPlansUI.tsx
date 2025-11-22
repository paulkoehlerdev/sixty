import type { Package } from "@/lib/sixt/types";
import { ProtectionPlanCard } from "./ProtectionPlanCard";

interface ProtectionPlansUIProps {
  packages: Package[];
  onPackageSelect?: (packageId: string) => void;
  bestValuePackageId?: string;
}

export function ProtectionPlansUI({ packages, onPackageSelect, bestValuePackageId }: ProtectionPlansUIProps) {
  return (
    <div className="bg-background px-5 py-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 font-bold text-foreground text-xl">Protection Plans</h2>
        <div className="grid grid-cols-1 gap-4">
          {packages.map((pkg) => (
            <ProtectionPlanCard
              key={pkg.id}
              package={pkg}
              onSelect={onPackageSelect}
              variant={pkg.id === bestValuePackageId ? "ai" : "normal"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
