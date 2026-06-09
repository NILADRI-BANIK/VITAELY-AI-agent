"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PORTFOLIO_TEMPLATE_LIST } from "@/components/portfolio/templates/index";

// ─────────────────────────────────────────────
// MINI PREVIEW CARD
// ─────────────────────────────────────────────
function TemplatePreview({ color }) {
  return (
    <div
      className="w-full h-36 rounded-lg overflow-hidden relative"
      style={{ backgroundColor: color }}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 h-10 flex items-center px-3 gap-2"
        style={{ backgroundColor: `${color}dd` }}
      >
        <div className="w-6 h-6 rounded-full bg-white/30" />
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-16 rounded-full bg-white/70" />
          <div className="h-1 w-10 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Body lines */}
      <div className="absolute top-12 left-3 right-3 space-y-1.5">
        <div className="h-1.5 rounded-full bg-white/50 w-full" />
        <div className="h-1.5 rounded-full bg-white/35 w-4/5" />
        <div className="h-1.5 rounded-full bg-white/35 w-3/5" />
        <div className="h-1 rounded-full bg-white/20 w-full mt-2" />
        <div className="h-1 rounded-full bg-white/20 w-11/12" />
        <div className="h-1 rounded-full bg-white/20 w-4/5" />
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-5"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function TemplatesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  const handleSelect = (templateId) => {
    setSelected(templateId);
  };

  const handleUseTemplate = () => {
    if (!selected) return;
    router.push(`/portfolio-generator/create?template=${selected}`);
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl px-4">
      {/* ── Header ── */}
      <div className="mb-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-2"
          onClick={() => router.push("/portfolio-generator")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Template</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select a portfolio template that matches your style. You can
            customize colors, fonts, and content after selecting.
          </p>
        </div>
      </div>

      {/* ── Template Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        {PORTFOLIO_TEMPLATE_LIST.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelect(template.id)}
            className={`
              cursor-pointer rounded-xl border-2 overflow-hidden
              transition-all duration-200 hover:shadow-lg group
              ${
                selected === template.id
                  ? "border-primary shadow-lg scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:scale-[1.01]"
              }
            `}
          >
            {/* Preview */}
            <div className="relative">
              <TemplatePreview color={template.color} />

              {/* Selected overlay */}
              {selected === template.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-t-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 bg-background">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p
                  className={`text-sm font-semibold ${selected === template.id ? "text-primary" : ""}`}
                >
                  {template.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {template.description}
              </p>
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="sticky bottom-6 flex justify-center">
        <div className="bg-background border-2 rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4">
          {selected ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: PORTFOLIO_TEMPLATE_LIST.find(
                      (t) => t.id === selected,
                    )?.color,
                  }}
                />
                <div>
                  <p className="text-sm font-semibold">
                    {
                      PORTFOLIO_TEMPLATE_LIST.find((t) => t.id === selected)
                        ?.name
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Selected</p>
                </div>
              </div>
              <Button onClick={handleUseTemplate} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Use This Template
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a template to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
