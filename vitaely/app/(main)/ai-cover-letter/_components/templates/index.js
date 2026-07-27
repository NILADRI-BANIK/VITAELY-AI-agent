import ModernProfessional from "./modern-professional";
import ExecutiveElite from "./executive-elite";
import TechCyber from "./tech-cyber";
import CreativeDesigner from "./creative-designer";
import StartupFounder from "./startup-founder";
import Scandinavian from "./scandinavian";
import GlassmorphismPremium from "./glassmorphism-premium";
import NeoBrutalism from "./neo-brutalism";

/**
 * TEMPLATES registry
 * Key = template id used in DB / state
 * Each entry has: id, name, description, category, tags, defaultColors, previewMeta, component
 */
export const TEMPLATES = {
  "modern-professional": {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean two-column layout with gradient sidebar and minimal white content area.",
    category: "Professional",
    tags: ["corporate", "clean", "sidebar", "blue"],
    defaultColors: {
      primary: "#2563eb",
      accent: "#1e3a8a",
      background: "#ffffff",
      text: "#374151",
    },
    // Used for CSS thumbnail in TemplateSelector
    preview: {
      sidebar: "linear-gradient(170deg, #2563eb 0%, #1e3a8a 55%, #0f2060 100%)",
      content: "#ffffff",
      accent: "#2563eb",
    },
    component: ModernProfessional,
  },

  "executive-elite": {
    id: "executive-elite",
    name: "Executive Elite",
    description: "Prestigious dark navy header with gold accents and elegant serif typography.",
    category: "Executive",
    tags: ["luxury", "serif", "dark", "gold", "classic"],
    defaultColors: {
      primary: "#0f1f3d",
      accent: "#c9a84c",
      background: "#faf9f7",
      text: "#2c2c2c",
    },
    preview: {
      sidebar: "#0f1f3d",
      content: "#faf9f7",
      accent: "#c9a84c",
    },
    component: ExecutiveElite,
  },

  "tech-cyber": {
    id: "tech-cyber",
    name: "Tech Cyber",
    description: "Dark terminal aesthetic with neon cyan accents — built for developers.",
    category: "Tech",
    tags: ["dark", "developer", "neon", "cyber", "terminal"],
    defaultColors: {
      primary: "#00e5ff",
      accent: "#0a0e1a",
      background: "#0a0e1a",
      text: "rgba(255,255,255,0.82)",
    },
    preview: {
      sidebar: "#0d1224",
      content: "#0a0e1a",
      accent: "#00e5ff",
    },
    component: TechCyber,
  },

  "creative-designer": {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Vibrant gradient header with asymmetric layout — perfect for creatives.",
    category: "Creative",
    tags: ["colorful", "gradient", "bold", "creative", "designer"],
    defaultColors: {
      primary: "#6366f1",
      accent: "#ec4899",
      background: "#ffffff",
      text: "#374151",
    },
    preview: {
      sidebar: "linear-gradient(135deg, #6366f1 0%, #ec4899 55%, #f97316 100%)",
      content: "#ffffff",
      accent: "#6366f1",
    },
    component: CreativeDesigner,
  },

  "startup-founder": {
    id: "startup-founder",
    name: "Startup Founder",
    description: "Bold amber top bar with pill-style contact tags and clean white body.",
    category: "Startup",
    tags: ["modern", "startup", "amber", "clean", "bold"],
    defaultColors: {
      primary: "#f59e0b",
      accent: "#d97706",
      background: "#ffffff",
      text: "#374151",
    },
    preview: {
      sidebar: "linear-gradient(90deg, #f59e0b, #d97706)",
      content: "#ffffff",
      accent: "#f59e0b",
    },
    component: StartupFounder,
  },

  "scandinavian": {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Ultra-minimal Nordic design — generous whitespace, thin rules, pure elegance.",
    category: "Minimal",
    tags: ["minimal", "nordic", "clean", "serif", "whitespace"],
    defaultColors: {
      primary: "#111111",
      accent: "#6b7280",
      background: "#ffffff",
      text: "#1f2937",
    },
    preview: {
      sidebar: "#111111",
      content: "#ffffff",
      accent: "#111111",
    },
    component: Scandinavian,
  },

  "glassmorphism-premium": {
    id: "glassmorphism-premium",
    name: "Glassmorphism Premium",
    description: "Deep violet gradient background with frosted glass panels — premium & modern.",
    category: "Premium",
    tags: ["glass", "purple", "dark", "premium", "gradient"],
    defaultColors: {
      primary: "#7c3aed",
      accent: "#a78bfa",
      background: "#0f0c29",
      text: "rgba(255,255,255,0.82)",
    },
    preview: {
      sidebar: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a1040 100%)",
      content: "rgba(255,255,255,0.06)",
      accent: "#7c3aed",
    },
    component: GlassmorphismPremium,
  },

  "neo-brutalism": {
    id: "neo-brutalism",
    name: "Neo Brutalism",
    description: "Bold black borders, offset box shadows, yellow accents — raw and striking.",
    category: "Bold",
    tags: ["bold", "brutalism", "yellow", "borders", "raw"],
    defaultColors: {
      primary: "#facc15",
      accent: "#0a0a0a",
      background: "#fafaf9",
      text: "#0a0a0a",
    },
    preview: {
      sidebar: "#facc15",
      content: "#ffffff",
      accent: "#0a0a0a",
    },
    component: NeoBrutalism,
  },
};

/** Ordered array of all templates — use for rendering lists/grids */
export const TEMPLATE_LIST = [
  TEMPLATES["modern-professional"],
  TEMPLATES["executive-elite"],
  TEMPLATES["tech-cyber"],
  TEMPLATES["creative-designer"],
  TEMPLATES["startup-founder"],
  TEMPLATES["scandinavian"],
  TEMPLATES["glassmorphism-premium"],
  TEMPLATES["neo-brutalism"],
];

/** Helper: resolve a template component by id, fallback to modern-professional */
export function getTemplate(id) {
  return TEMPLATES[id] ?? TEMPLATES["modern-professional"];
}

/** Helper: resolve just the component, ready to render */
export function getTemplateComponent(id) {
  return getTemplate(id).component;
}