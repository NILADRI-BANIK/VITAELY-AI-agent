import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function getImpactColor(score) {
  if (score >= 7) return "text-green-600";
  if (score >= 4) return "text-yellow-600";
  return "text-red-600";
}

function getConfidenceColor(confidence) {
  if (confidence >= 80) return "text-green-600";
  if (confidence >= 50) return "text-yellow-600";
  return "text-red-600";
}

export function ImpactScore({ score = 0, confidence, className }) {
  const safeScore = Math.min(10, Math.max(0, Number(score) || 0));
  const filledStars = Math.round(safeScore / 2);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                i < filledStars
                  ? "fill-primary text-primary"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <span className={cn("text-xs font-semibold", getImpactColor(safeScore))}>
          {safeScore.toFixed(1)}/10
        </span>
      </div>

      {confidence != null && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Confidence
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              getConfidenceColor(confidence)
            )}
          >
            {Math.round(confidence)}%
          </span>
        </div>
      )}
    </div>
  );
}