"use client";

import { cn } from "@/lib/utils";
import { TEMPLATE_LIST } from "./templates";

/**
 * TemplateSelector
 *
 * Displays an 8-card grid of template thumbnails.
 * Each card uses CSS to visually represent the template's layout —
 * no full render, so it stays fast even inside a panel.
 *
 * Props:
 *   selected  – currently selected template id (string)
 *   onSelect  – (templateId: string) => void
 */
export default function TemplateSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATE_LIST.map((template) => {
          const isSelected = selected === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={cn(
                "group relative flex flex-col items-start gap-0 rounded-lg border-2 p-0 text-left transition-all duration-200 overflow-hidden",
                "hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : "border-border"
              )}
              aria-label={`Select ${template.name} template`}
            >
              {/* ── CSS THUMBNAIL ── */}
              <TemplateThumbnail template={template} />

              {/* ── LABEL ── */}
              <div className="w-full px-3 py-2 bg-background">
                <p
                  className={cn(
                    "text-[11.5px] font-semibold leading-tight truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {template.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {template.category}
                </p>
              </div>

              {/* ── SELECTED BADGE ── */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary shadow">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="w-3 h-3"
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

      {/* Selected template info */}
      {selected && (() => {
        const t = TEMPLATE_LIST.find((t) => t.id === selected);
        return t ? (
          <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
            {t.description}
          </p>
        ) : null;
      })()}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   CSS thumbnail — visually represents each template's
   layout without rendering the full A4 component.
   Height: 110px, width: 100%.
───────────────────────────────────────────────────────── */
function TemplateThumbnail({ template }) {
  const { preview, id } = template;

  const THUMB_STYLE = {
    width: "100%",
    height: "112px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    flexShrink: 0,
  };

  /* Line helper */
  const line = (top, left, width, height, color, opacity = 1) => ({
    position: "absolute",
    top,
    left,
    width,
    height,
    backgroundColor: color,
    opacity,
    borderRadius: "2px",
  });

  switch (id) {
    /* ── Modern Professional ── blue sidebar + white content */
    case "modern-professional":
      return (
        <div style={THUMB_STYLE}>
          {/* Sidebar */}
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "34%", background: preview.sidebar }} />
          {/* Avatar circle */}
          <div style={{ position: "absolute", top: "14px", left: "7%", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.5)" }} />
          {/* Name lines */}
          <div style={line("36px", "5%", "26%", "3px", "rgba(255,255,255,0.7)")} />
          <div style={line("43px", "5%", "20%", "2px", "rgba(255,255,255,0.35)")} />
          {/* Contact lines */}
          <div style={line("58px", "5%", "22%", "2px", "rgba(255,255,255,0.25)")} />
          <div style={line("63px", "5%", "18%", "2px", "rgba(255,255,255,0.2)")} />
          <div style={line("68px", "5%", "20%", "2px", "rgba(255,255,255,0.2)")} />
          {/* Content accent bar */}
          <div style={line("16px", "37%", "14%", "3px", preview.accent, 0.9)} />
          {/* Content lines */}
          <div style={line("28px", "37%", "54%", "2.5px", "#1f2937", 0.75)} />
          <div style={line("34px", "37%", "40%", "2px", "#9ca3af", 0.5)} />
          {/* Recipient block */}
          <div style={{ position: "absolute", top: "44px", left: "37%", width: "58%", height: "14px", backgroundColor: "#eff6ff", borderLeft: `3px solid ${preview.accent}` }} />
          {/* Body lines */}
          {[56, 62, 68, 74, 80, 86].map((t) => (
            <div key={t} style={line(`${t}px`, "37%", `${48 + Math.sin(t) * 8}%`, "1.5px", "#374151", 0.35)} />
          ))}
          {/* Signature */}
          <div style={line("98px", "37%", "30%", "3px", preview.accent, 0.6)} />
        </div>
      );

    /* ── Executive Elite ── dark header + gold accent + white body */
    case "executive-elite":
      return (
        <div style={{ ...THUMB_STYLE, backgroundColor: preview.content }}>
          {/* Dark header */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30px", backgroundColor: preview.sidebar }} />
          {/* Gold bottom bar on header */}
          <div style={line("29px", 0, "100%", "2.5px", preview.accent)} />
          {/* Header text lines */}
          <div style={line("10px", "8%", "28%", "2px", "rgba(255,255,255,0.55)")} />
          <div style={line("10px", "60%", "30%", "3px", "rgba(255,255,255,0.9)")} />
          <div style={line("17px", "60%", "22%", "1.5px", preview.accent)} />
          {/* Body lines */}
          <div style={line("40px", "8%", "40%", "2px", "#374151", 0.7)} />
          <div style={line("46px", "8%", "28%", "1.5px", "#9ca3af", 0.5)} />
          {/* Gold diamond separator */}
          <div style={{ position: "absolute", top: "56px", left: "8%", width: "8%", height: "1px", backgroundColor: "#e5dfc8" }} />
          <div style={{ position: "absolute", top: "53px", left: "16%", width: "6px", height: "6px", backgroundColor: preview.accent, transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", top: "56px", left: "20%", width: "72%", height: "1px", backgroundColor: "#e5dfc8" }} />
          {/* Body text lines */}
          {[66, 72, 78, 84, 90].map((t) => (
            <div key={t} style={line(`${t}px`, "8%", `${74 + Math.cos(t) * 6}%`, "1.5px", "#374151", 0.3)} />
          ))}
          {/* Footer */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "14px", backgroundColor: preview.sidebar, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div style={{ width: "20%", height: "1.5px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "1px" }} />
            <div style={{ width: "6px", height: "6px", backgroundColor: preview.accent, borderRadius: "50%" }} />
            <div style={{ width: "20%", height: "1.5px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "1px" }} />
          </div>
        </div>
      );

    /* ── Tech Cyber ── dark bg + neon accents */
    case "tech-cyber":
      return (
        <div style={{ ...THUMB_STYLE, backgroundColor: preview.content }}>
          {/* Header bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "24px", backgroundColor: "#021428", borderBottom: `2px solid ${preview.accent}` }} />
          {/* Header text */}
          <div style={line("9px", "6%", "18%", "2px", preview.accent, 0.8)} />
          <div style={line("9px", "60%", "28%", "2.5px", "#ffffff", 0.8)} />
          <div style={line("16px", "60%", "20%", "1.5px", preview.accent, 0.5)} />
          {/* Sidebar */}
          <div style={{ position: "absolute", top: "26px", left: 0, bottom: 0, width: "28%", backgroundColor: preview.sidebar, borderRight: `1px solid #1a2540` }} />
          {/* Sidebar dots + lines */}
          <div style={{ position: "absolute", top: "32px", left: "4%", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: preview.accent }} />
          <div style={line("33px", "12%", "14%", "1.5px", preview.accent, 0.6)} />
          {[42, 48, 54, 60, 66].map((t) => (
            <div key={t} style={line(`${t}px`, "4%", "20%", "1.5px", "rgba(255,255,255,0.25)")} />
          ))}
          {/* Recipient block */}
          <div style={{ position: "absolute", top: "30px", left: "30%", width: "66%", height: "18px", backgroundColor: "#0d1224", borderLeft: `3px solid ${preview.accent}`, border: `1px solid #1a2540`, borderLeft: `3px solid ${preview.accent}` }} />
          {/* Content lines */}
          {[52, 58, 64, 70, 76, 82, 88].map((t) => (
            <div key={t} style={line(`${t}px`, "30%", `${54 + Math.sin(t) * 6}%`, "1.5px", "rgba(255,255,255,0.22)")} />
          ))}
          {/* Signature */}
          <div style={line("98px", "30%", "28%", "2.5px", preview.accent, 0.7)} />
          {/* Status dot */}
          <div style={{ position: "absolute", bottom: "8px", left: "4%", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
        </div>
      );

    /* ── Creative Designer ── gradient header */
    case "creative-designer":
      return (
        <div style={{ ...THUMB_STYLE, backgroundColor: preview.content }}>
          {/* Gradient header */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "42px", background: preview.sidebar }} />
          {/* Decorative circle */}
          <div style={{ position: "absolute", top: "-12px", right: "-10px", width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
          {/* Header name */}
          <div style={line("12px", "6%", "50%", "4px", "rgba(255,255,255,0.9)")} />
          <div style={line("20px", "6%", "30%", "2px", "rgba(255,255,255,0.6)")} />
          {/* Contact strip */}
          <div style={{ position: "absolute", top: "42px", left: 0, right: 0, height: "14px", backgroundColor: `${TEMPLATE_LIST.find(t => t.id === "creative-designer")?.defaultColors.primary}15` }} />
          <div style={{ position: "absolute", top: "56px", left: 0, bottom: 0, width: "6px", background: preview.sidebar }} />
          {/* Content lines */}
          {[62, 68, 74, 80, 86, 92].map((t) => (
            <div key={t} style={line(`${t}px`, "10%", `${68 + Math.sin(t) * 8}%`, "1.5px", "#374151", 0.3)} />
          ))}
          {/* Signature gradient text */}
          <div style={{ position: "absolute", bottom: "10px", left: "10%", width: "32%", height: "4px", background: preview.sidebar, borderRadius: "2px", opacity: 0.7 }} />
        </div>
      );

    /* ── Startup Founder ── amber bar top */
    case "startup-founder":
      return (
        <div style={{ ...THUMB_STYLE, backgroundColor: preview.content }}>
          {/* Amber top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "18px", background: preview.sidebar }} />
          {/* Bar text */}
          <div style={line("7px", "6%", "20%", "2px", "rgba(255,255,255,0.8)")} />
          <div style={line("7px", "66%", "26%", "2px", "rgba(255,255,255,0.6)")} />
          {/* Left amber accent */}
          <div style={{ position: "absolute", top: "18px", left: 0, bottom: 0, width: "4px", background: preview.sidebar }} />
          {/* Big name */}
          <div style={line("26px", "7%", "52%", "5px", "#111827", 0.8)} />
          <div style={line("35px", "7%", "36%", "2px", "#9ca3af", 0.6)} />
          {/* Pills */}
          <div style={{ position: "absolute", top: "44px", left: "7%", width: "20%", height: "8px", backgroundColor: `${preview.accent}20`, border: `1px solid ${preview.accent}40`, borderRadius: "20px" }} />
          <div style={{ position: "absolute", top: "44px", left: "30%", width: "18%", height: "8px", backgroundColor: `${preview.accent}20`, border: `1px solid ${preview.accent}40`, borderRadius: "20px" }} />
          {/* Recipient block */}
          <div style={{ position: "absolute", top: "60px", left: "7%", width: "58%", height: "20px", backgroundColor: "#fffbeb", border: `1px solid ${preview.accent}30`, borderRadius: "6px" }} />
          {/* Content lines */}
          {[86, 92, 98].map((t) => (
            <div key={t} style={line(`${t}px`, "7%", `${72 + Math.sin(t) * 5}%`, "1.5px", "#374151", 0.3)} />
          ))}
        </div>
      );

    /* ── Scandinavian ── minimal */
    case "scandinavian":
      return (
        <div style={{ ...THUMB_STYLE, backgroundColor: preview.content }}>
          {/* Large thin name */}
          <div style={line("18px", "8%", "62%", "4px", "#111111", 0.7)} />
          {/* Horizontal rule */}
          <div style={line("30px", "8%", "84%", "1px", "#111111", 0.9)} />
          {/* Subtitle */}
          <div style={line("36px", "8%", "36%", "1.5px", "#9ca3af", 0.7)} />
          {/* Two columns divider */}
          <div style={{ position: "absolute", top: "46px", left: "28%", bottom: "18px", width: "1px", backgroundColor: "#f3f4f6" }} />
          {/* Left col */}
          {[50, 58, 66, 74, 82].map((t) => (
            <div key={t} style={line(`${t}px`, "8%", "16%", "1.5px", "#9ca3af", 0.45)} />
          ))}
          {/* Right col content */}
          {[50, 56, 62, 68, 74, 80, 86, 92, 98].map((t) => (
            <div key={t} style={line(`${t}px`, "32%", `${56 + Math.sin(t) * 8}%`, "1.5px", "#1f2937", 0.28)} />
          ))}
          {/* Bottom rule */}
          <div style={line("106px", "8%", "84%", "1px", "#e5e7eb", 1)} />
        </div>
      );

    /* ── Glassmorphism Premium ── dark purple */
    case "glassmorphism-premium":
      return (
        <div style={{ ...THUMB_STYLE, background: preview.sidebar }}>
          {/* Orb glow */}
          <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)" }} />
          {/* Header */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "32px", backgroundColor: "rgba(124,58,237,0.4)", borderBottom: "1px solid rgba(167,139,250,0.2)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent 0%, ${preview.accent} 40%, #a78bfa 70%, transparent 100%)` }} />
          {/* Name */}
          <div style={line("12px", "6%", "40%", "4px", "rgba(255,255,255,0.85)")} />
          <div style={line("20px", "6%", "26%", "2px", "rgba(167,139,250,0.6)")} />
          {/* Sidebar glass */}
          <div style={{ position: "absolute", top: "36px", left: "6%", width: "26%", bottom: "10px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "6px" }} />
          {/* Sidebar lines */}
          {[46, 54, 62, 70, 78].map((t) => (
            <div key={t} style={line(`${t}px`, "8%", "22%", "1.5px", "rgba(255,255,255,0.22)")} />
          ))}
          {/* Content glass */}
          <div style={{ position: "absolute", top: "36px", left: "35%", width: "59%", bottom: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(167,139,250,0.18)", borderRadius: "6px" }} />
          {/* Content lines */}
          {[46, 54, 62, 70, 78, 86, 94].map((t) => (
            <div key={t} style={line(`${t}px`, "37%", `${46 + Math.sin(t) * 7}%`, "1.5px", "rgba(255,255,255,0.2)")} />
          ))}
          {/* Signature */}
          <div style={line("98px", "37%", "30%", "3px", "rgba(255,255,255,0.5)")} />
        </div>
      );

    /* ── Neo Brutalism ── yellow + black borders */
    case "neo-brutalism":
      return (
        <div style={{ ...THUMB_STYLE, backgroundColor: "#fafaf9" }}>
          {/* Header box */}
          <div style={{ position: "absolute", top: "8px", left: "6%", right: "6%", height: "24px", backgroundColor: preview.sidebar, border: "2px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a" }} />
          <div style={line("15px", "10%", "40%", "3px", "#0a0a0a", 0.75)} />
          <div style={{ position: "absolute", top: "9px", right: "8%", width: "16%", height: "22px", backgroundColor: "#0a0a0a" }} />
          {/* Two column boxes */}
          <div style={{ position: "absolute", top: "40px", left: "6%", width: "42%", height: "28px", backgroundColor: "#ffffff", border: "2px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a" }} />
          <div style={{ position: "absolute", top: "40px", right: "6%", width: "42%", height: "28px", backgroundColor: "#ffffff", border: "2px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a" }} />
          {[46, 52, 58].map((t) => (
            <div key={t} style={line(`${t}px`, "8%", "36%", "1.5px", "#0a0a0a", 0.25)} />
          ))}
          {[46, 52, 58].map((t) => (
            <div key={t} style={line(`${t}px`, "54%", "36%", "1.5px", "#0a0a0a", 0.25)} />
          ))}
          {/* Letter box */}
          <div style={{ position: "absolute", top: "76px", left: "6%", right: "6%", height: "28px", backgroundColor: "#ffffff", border: "2px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a" }} />
          {[82, 88, 94].map((t) => (
            <div key={t} style={line(`${t}px`, "9%", `${66 + Math.cos(t) * 5}%`, "1.5px", "#0a0a0a", 0.2)} />
          ))}
          {/* Signature row */}
          <div style={{ position: "absolute", bottom: "6px", left: "6%", width: "58%", height: "18px", backgroundColor: preview.sidebar, border: "2px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a" }} />
          <div style={{ position: "absolute", bottom: "6px", right: "6%", width: "28%", height: "18px", backgroundColor: "#ffffff", border: "2px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a" }} />
        </div>
      );

    default:
      return <div style={THUMB_STYLE} />;
  }
}