import ModernTemplate from "./modern";
import MinimalTemplate from "./minimal";
import GlassmorphismTemplate from "./glassmorphism";
import Developer3DTemplate from "./developer-3d";
import FuturisticTemplate from "./futuristic";
import CorporateTemplate from "./corporate";
import StartupTemplate from "./startup";
import CyberpunkTemplate from "./cyberpunk";
import NeoBrutalismTemplate from "./neo-brutalism";
import SaasDashboardTemplate from "./saas-dashboard";
import AiGradientTemplate from "./ai-gradient";
import TerminalProTemplate from "./terminal-pro";
import AppleLiquidTemplate from "./apple-liquid";
import NotionStyleTemplate from "./notion-style";
import DiscordDarkTemplate from "./discord-dark";
import AuroraTemplate from "./aurora";
import RetroWaveTemplate from "./retro-wave";
import BentoGridTemplate from "./bento-grid";
import GothamDarkTemplate from "./gotham-dark";
import TronLegacyTemplate from "./tron-ares";
import GameOfThronesTemplate from "./game-of-thrones";
import MusicStudioTemplate from "./music-studio";
import DevilInfernoTemplate from "./devil-inferno";
import AngelicHeavenTemplate from "./angelic-heaven";

// ← already present, line ~15

// ─────────────────────────────────────────────
// TEMPLATE MAP — id → component
// Used by preview page to render correct template
// ─────────────────────────────────────────────
export const PORTFOLIO_TEMPLATES = Object.freeze({
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  glassmorphism: GlassmorphismTemplate,
  developer3d: Developer3DTemplate,
  futuristic: FuturisticTemplate,
  corporate: CorporateTemplate,
  startup: StartupTemplate,
  cyberpunk: CyberpunkTemplate,
  neobrutalism: NeoBrutalismTemplate,
  saasdashboard: SaasDashboardTemplate,
  aigradient: AiGradientTemplate,
  terminalpro: TerminalProTemplate,
  appleliquid: AppleLiquidTemplate,
  notionstyle: NotionStyleTemplate,
  discorddark: DiscordDarkTemplate,
  aurora: AuroraTemplate,
  retrowave: RetroWaveTemplate,
  bentogrid: BentoGridTemplate,
  gothamdark: GothamDarkTemplate,
  tronlegacy: TronLegacyTemplate,
  gameofthrones: GameOfThronesTemplate,
  musicstudio: MusicStudioTemplate,
  devilinferno: DevilInfernoTemplate,
  angelicheaven: AngelicHeavenTemplate,
});

// ─────────────────────────────────────────────
// TEMPLATE LIST — metadata for template selector
// Used by templates/page.jsx selector UI
// ─────────────────────────────────────────────
export const PORTFOLIO_TEMPLATE_LIST = Object.freeze([
  {
    id: "modern",
    name: "Modern",
    description:
      "Clean contemporary design with bold typography and accent colors.",
    color: "#2563eb",
    tags: ["Popular", "Clean"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Ultra-clean layout with maximum whitespace and subtle details.",
    color: "#6b7280",
    tags: ["Simple", "ATS-Friendly"],
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description:
      "Frosted glass effect with depth, blur, and modern UI aesthetics.",
    color: "#7c3aed",
    tags: ["Trendy", "Creative"],
  },
  {
    id: "developer3d",
    name: "3D Developer",
    description:
      "Interactive 3D elements with floating icons and particle effects.",
    color: "#059669",
    tags: ["3D", "Interactive"],
  },
  {
    id: "futuristic",
    name: "AI Futuristic",
    description: "Futuristic neon glow design with holographic UI elements.",
    color: "#0ea5e9",
    tags: ["AI Theme", "Neon"],
  },
  {
    id: "corporate",
    name: "Corporate",
    description:
      "Professional corporate layout for business and enterprise roles.",
    color: "#1e3a5f",
    tags: ["Professional", "Formal"],
  },
  {
    id: "startup",
    name: "Startup Founder",
    description: "Bold vibrant design for entrepreneurs and startup culture.",
    color: "#db2777",
    tags: ["Bold", "Vibrant"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description:
      "Dark neon cyberpunk aesthetic with glitch effects and grid lines.",
    color: "#7c3aed",
    tags: ["Dark", "Neon"],
  },
  {
    id: "neobrutalism",
    name: "Neo Brutalism",
    description:
      "Bold borders, raw typography, and brutalist design aesthetics.",
    color: "#f97316",
    tags: ["Bold", "Trending"],
  },
  {
    id: "saasdashboard",
    name: "SaaS Dashboard UI",
    description:
      "Clean dashboard-style layout inspired by modern SaaS products.",
    color: "#6366f1",
    tags: ["Dashboard", "Modern"],
  },
  {
    id: "aigradient",
    name: "AI Gradient Modern",
    description: "Smooth AI-inspired gradients with a sleek modern feel.",
    color: "#8b5cf6",
    tags: ["AI Theme", "Gradient"],
  },
  {
    id: "terminalpro",
    name: "Terminal Pro",
    description:
      "Hacker-style terminal UI with monospace fonts and CLI aesthetics.",
    color: "#22c55e",
    tags: ["Terminal", "Dev"],
  },
  {
    id: "appleliquid",
    name: "Apple Liquid Glass",
    description:
      "Apple-inspired liquid glass morphism with soft translucent layers.",
    color: "#0ea5e9",
    tags: ["Apple", "Glassmorphism"],
  },
  {
    id: "notionstyle",
    name: "Notion Style Minimal",
    description:
      "Clean Notion-inspired minimal layout with structured content blocks.",
    color: "#404040",
    tags: ["Minimal", "Clean"],
  },
  {
    id: "discorddark",
    name: "Discord Dark UI",
    description:
      "Discord-inspired dark sidebar layout with channel-style sections.",
    color: "#5865f2",
    tags: ["Dark", "Gaming"],
  },
  {
    id: "aurora",
    name: "Aurora Gradient",
    description:
      "Northern lights inspired aurora gradients with glowing effects.",
    color: "#06b6d4",
    tags: ["Colorful", "Gradient"],
  },
  {
    id: "retrowave",
    name: "Retro Wave",
    description:
      "80s synthwave aesthetic with neon grids and retro typography.",
    color: "#ec4899",
    tags: ["Retro", "Neon"],
  },
  {
    id: "bentogrid",
    name: "Bento Grid Portfolio",
    description: "Trendy bento box grid layout with modular content cards.",
    color: "#f59e0b",
    tags: ["Bento", "Trending"],
  },
  {
    id: "gothamdark",
    name: "Gotham Dark",
    description:
      "Batman-inspired luxury dark interface with cinematic lighting and premium aesthetics.",
    color: "#111827",
    tags: ["Dark", "Luxury"],
  },
  {
    id: "tronlegacy",
    name: "Tron Legacy",
    description:
      "Futuristic neon cyber interface inspired by digital grid worlds and glowing HUD visuals.",
    color: "#FF3B30",
    tags: ["Sci-Fi", "Neon"],
  },
  {
  id: "gameofthrones",
  name: "Game of Thrones",
  description:
    "Epic medieval fantasy design inspired by noble houses, castles, dragons, and cinematic storytelling.",
  color: "#4B5563",
  tags: ["Fantasy", "Medieval"],
},
{
  id: "musicstudio",
  name: "Music Studio",
  description:
    "Premium music-inspired portfolio with immersive album visuals, vinyl aesthetics, equalizer animations, and concert lighting.",
  color: "#7C3AED",
  tags: ["Music", "Creative"],
},
{
  id: "devilinferno",
  name: "Devil Inferno",
  description:
    "Dark infernal aesthetic with volcanic landscapes, demonic architecture, fiery lighting, molten lava effects, and cinematic fantasy visuals.",
  color: "#8B0000",
  tags: ["Dark", "Fantasy"],
},
{
  id: "angelicheaven",
  name: "Angelic Heaven",
  description:
    "Celestial-inspired luxury design with heavenly clouds, radiant golden light, divine architecture, elegant glass effects, and serene cinematic visuals.",
  color: "#F8FAFC",
  tags: ["Light", "Luxury"],
},
]);

// ─────────────────────────────────────────────
// DEFAULT TEMPLATE
// ─────────────────────────────────────────────
export const DEFAULT_PORTFOLIO_TEMPLATE = "modern";

// ─────────────────────────────────────────────
// HELPER — get component by id safely
// ─────────────────────────────────────────────
export function getTemplateComponent(templateId) {
  if (!templateId || typeof templateId !== "string") {
    return ModernTemplate;
  }

  return PORTFOLIO_TEMPLATES[templateId] || ModernTemplate;
}

// ─────────────────────────────────────────────
// HELPER — get metadata by id safely
// ─────────────────────────────────────────────
export function getTemplateMetadata(templateId) {
  if (!templateId || typeof templateId !== "string") {
    return PORTFOLIO_TEMPLATE_LIST[0];
  }

  return (
    PORTFOLIO_TEMPLATE_LIST.find((template) => template.id === templateId) ||
    PORTFOLIO_TEMPLATE_LIST[0]
  );
}
