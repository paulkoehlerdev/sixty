import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessCheckmarkProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function SuccessCheckmark({ className, size = "md", ...props }: SuccessCheckmarkProps) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-full", sizeClasses[size], className)}
      style={{
        background: "linear-gradient(135deg, var(--success-gradient-start), var(--success-gradient-end))",
      }}
      {...props}
    >
      <Check className={cn("text-white", iconSizeClasses[size])} />
    </div>
  );
}
