import { defaultProtectionPlans } from "./defaultProtectionPlans";
import type { ProtectionPlan } from "./ProtectionPlanCard";
import { ProtectionPlanCard } from "./ProtectionPlanCard";

interface ProtectionPlansUIProps {
  plans?: ProtectionPlan[];
  selectedPlanId?: string;
  onPlanSelect?: (planId: string) => void;
}

export function ProtectionPlansUI({
  plans = defaultProtectionPlans,
  selectedPlanId,
  onPlanSelect,
}: ProtectionPlansUIProps) {
  const plansWithSelection = plans.map((plan) => ({
    ...plan,
    isSelected: plan.id === selectedPlanId,
  }));

  return (
    <div className="bg-background px-5 py-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 font-bold text-foreground text-xl">Protection Plans</h2>
        <div className="grid grid-cols-1 gap-4">
          {plansWithSelection.map((plan) => (
            <ProtectionPlanCard key={plan.id} plan={plan} onSelect={onPlanSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}
