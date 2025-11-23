import "./card.css";
import type React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "normal" | "ai" | "success";
  bg?: "card" | "muted";
}

export function Card({ className, variant, bg = "card", ...props }: CardProps) {
  // AI variant: animated gradient border (orange/primary colors)
  if (variant === "ai") {
    return (
      <div
        className={cn("gradient-card-wrapper relative z-0 rounded-2xl p-[2px]", className)}
        style={
          {
            "--gradient-start": "var(--ai-gradient-start)",
            "--gradient-end": "var(--ai-gradient-end)",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "relative z-10 overflow-hidden rounded-2xl bg-card text-card-foreground",
            bg === "muted" && "bg-muted",
          )}
          {...props}
        />
      </div>
    );
  }

  // Success variant: static green gradient border (no animation)
  if (variant === "success") {
    return (
      <div
        className={cn("relative z-0 rounded-2xl p-[2px]", className)}
        style={
          {
            background: "linear-gradient(135deg, var(--success-gradient-start), var(--success-gradient-end))",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "relative z-10 overflow-hidden rounded-2xl bg-card text-card-foreground",
            bg === "muted" && "bg-muted",
          )}
          {...props}
        />
      </div>
    );
  }

  // Normal card
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card text-card-foreground",
        bg === "muted" && "bg-muted",
        className,
      )}
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
