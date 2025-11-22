interface ToolCallShimmerProps {
  message?: string;
}

export function ToolCallShimmer({ message = "Running tool call" }: ToolCallShimmerProps) {
  return (
    <>
      <div
        className="my-2 inline-block bg-linear-to-r from-muted-foreground/20 via-muted-foreground to-muted-foreground/20 bg-clip-text font-medium text-sm text-transparent"
        style={{
          backgroundSize: "200% 100%",
          backgroundPosition: "0 0",
          animation: "shimmer 3s infinite",
        }}
      >
        {message}
      </div>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}
