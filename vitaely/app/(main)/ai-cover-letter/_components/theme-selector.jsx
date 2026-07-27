"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

const THEMES = [
  {
    id: "default",
    label: "Default",
    description: "Template's original colors",
    colors: ["#2563eb", "#ffffff", "#1f2937"],
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Deep blues and teals",
    colors: ["#0891b2", "#ecfeff", "#164e63"],
  },
  {
    id: "forest",
    label: "Forest",
    description: "Greens and earth tones",
    colors: ["#16a34a", "#f0fdf4", "#14532d"],
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm oranges and reds",
    colors: ["#ea580c", "#fff7ed", "#7c2d12"],
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Dark and sophisticated",
    colors: ["#7c3aed", "#1e1b4b", "#c4b5fd"],
  },
  {
    id: "rose",
    label: "Rose",
    description: "Soft pinks and magentas",
    colors: ["#e11d48", "#fff1f2", "#881337"],
  },
  {
    id: "slate",
    label: "Slate",
    description: "Professional grays",
    colors: ["#475569", "#f8fafc", "#0f172a"],
  },
  {
    id: "amber",
    label: "Amber",
    description: "Golden and warm",
    colors: ["#d97706", "#fffbeb", "#78350f"],
  },
];

export default function ThemeSelector({ selected, onSelect }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Color Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => {
            const isSelected = selected === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelect(theme.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150",
                  "hover:border-primary/60 hover:bg-muted/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
                )}
                aria-label={`Select ${theme.label} theme`}
              >
                {/* Color swatches */}
                <div className="flex gap-0.5 shrink-0">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="rounded-full border border-black/10"
                      style={{
                        backgroundColor: color,
                        width: i === 0 ? "14px" : "10px",
                        height: i === 0 ? "14px" : "10px",
                        marginTop: i === 0 ? "0px" : "2px",
                      }}
                    />
                  ))}
                </div>

                {/* Label */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {theme.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {theme.description}
                  </p>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div className="ml-auto shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-primary">
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="w-2.5 h-2.5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selected && selected !== "default" && (
          <p className="text-[11px] text-muted-foreground mt-3 px-1">
            Theme overrides the template&apos;s default color scheme. Select{" "}
            <strong>Default</strong> to restore original colors.
          </p>
        )}
      </CardContent>
    </Card>
  );
}