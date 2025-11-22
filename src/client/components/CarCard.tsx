import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Vehicle image component with spotlight effect
export function VehicleImageDisplay({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={cn("relative h-44 w-full", className)}
      style={{
        backgroundImage: `url(${src || "/placeholder.svg"})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 100%",
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
}

export function CarCardHeader({ title, subline, badges }: CarCardHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="mb-1 font-black text-lg uppercase leading-none tracking-tight">{title}</CardTitle>
      <CardDescription className="mb-3 font-semibold text-xs">{subline}</CardDescription>
      <div className="flex flex-wrap items-center gap-2">{badges}</div>
    </CardHeader>
  );
}

// Car card features section
interface CarCardFeaturesProps {
  features: string[];
  offerId: string;
  className?: string;
}

export function CarCardFeatures({ features, offerId, className }: CarCardFeaturesProps) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <CardContent
      className={cn("relative z-20 space-y-4 bg-linear-to-t from-card to-transparent px-5 pt-2 pb-6", className)}
    >
      {features.map((feature: string, idx: number) => {
        const [title, ...descParts] = feature.includes(":") ? feature.split(":") : [feature, ""];
        const desc = descParts.join(":").trim();

        return (
          <div key={`feature-${offerId}-${idx}`} className="group/feature flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-card-foreground opacity-70 transition-opacity group-hover/feature:opacity-100" />
            <div>
              <h4 className="font-bold text-[13px] text-card-foreground leading-tight">{title.trim()}</h4>
              {desc && <p className="mt-0.5 font-medium text-[12px] text-muted-foreground leading-relaxed">{desc}</p>}
            </div>
          </div>
        );
      })}
    </CardContent>
  );
}

// Main car card component
interface CarCardProps {
  children: React.ReactNode;
  variant?: "normal" | "ai";
  className?: string;
}

export function CarCard({ children, variant = "normal" }: CarCardProps) {
  return (
      <Card variant={variant}>
        {children}
      </Card>
  );
}
