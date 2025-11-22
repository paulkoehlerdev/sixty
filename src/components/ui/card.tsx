import "./card.css";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "normal" | "ai";
}

export function Card({ className, variant, ...props }: CardProps) {
  if (variant === "ai") {
    // AI variant: wrapper renders the border, inner div is the actual card
    return (
      <div className={cn("ai-card-wrapper", className)}>
        <div className={cn("ai-card-inner", "relative z-10 rounded-2xl bg-card text-card-foreground")} {...props} />
      </div>
    );
  }

  // Normal card
  return (
    <div
      className={cn("relative rounded-2xl border bg-card text-card-foreground dark:border-none", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
