import { cn } from "../../lib/utils";

export function SuggestionChipArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>;
}

interface SuggestionChipProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  suggestion: string;
  className?: string;
}

export function SuggestionChip({ suggestion, className, ...props }: SuggestionChipProps) {
  return (
    <div className="shrinkwrap mx-2.5 my-1.5 max-w-[90%] cursor-pointer text-pretty rounded-xl">
      {/* biome-ignore lint/a11y/useSemanticElements: OK in this case, as nothing will be "moved around" */}
      <div
        role="button"
        type="button"
        tabIndex={0}
        className={cn(
          "shrinkwrap-target text-sm",
          "before:-mx-2.5 before:-my-1.5 before:translate-y-px before:rounded-lg before:border-[1.25px] before:border-transparent before:bg-[linear-gradient(var(--suggestion-chip-bg),var(--suggestion-chip-bg)),linear-gradient(var(--ai-gradient-start),var(--ai-gradient-end))] before:[background-clip:padding-box,border-box] before:[background-origin:border-box]",
          className,
        )}
        {...props}
      >
        {suggestion}
      </div>
    </div>
  );
}
