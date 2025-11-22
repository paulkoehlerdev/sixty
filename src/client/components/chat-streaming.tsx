import "./chat-streaming.indicator.css";

export function StreamingIndicator() {
  return (
    <div className="inline-flex items-center justify-start gap-1.5">
      <div className="h-2 w-2 animate-color-wave-1 rounded-full" />
      <div className="h-2 w-2 animate-color-wave-2 rounded-full" />
      <div className="h-2 w-2 animate-color-wave-3 rounded-full" />
    </div>
  );
}