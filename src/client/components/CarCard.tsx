import type React from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Vehicle image component with spotlight effect
export function VehicleImageDisplay({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={cn("relative h-50 w-full", className)}
      style={{
        backgroundImage: `url(${src || "/placeholder.svg"})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 65%",
        backgroundRepeat: "no-repeat",
      }}
      role="img"
      aria-label={alt}
    >
      {/* Spotlight/Shadow Effect */}
      <div className="pointer-events-none absolute inset-0 scale-125 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_70%)] opacity-80 mix-blend-screen" />
    </div>
  );
}

// Car card header with title, subline, and badges
interface CarCardHeaderProps {
  title: string;
  subline: string;
  badges: React.ReactNode;
  titleBadges?: React.ReactNode[];
}

export function CarCardHeader({ title, subline, badges, titleBadges }: CarCardHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="mb-1 flex w-full items-center justify-between gap-2">
        <CardTitle className="font-black text-lg uppercase leading-none tracking-tight">{title}</CardTitle>

        <div className="flex gap-4">{titleBadges}</div>
      </div>
      <CardDescription className="mb-3 font-semibold text-xs">{subline}</CardDescription>
      <div className="flex flex-wrap items-center gap-2">{badges}</div>
    </CardHeader>
  );
}
