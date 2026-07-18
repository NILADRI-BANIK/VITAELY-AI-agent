import { cn } from "@/lib/utils";

const DIFFICULTY_STYLES = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const DIFFICULTY_LABELS = {
  low: "Easy",
  medium: "Medium",
  high: "Hard",
};

export function DifficultyBadge({ difficulty, className }) {
  const key = ["low", "medium", "high"].includes(difficulty) ? difficulty : "medium";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        DIFFICULTY_STYLES[key],
        className
      )}
    >
      {DIFFICULTY_LABELS[key]}
    </span>
  );
}