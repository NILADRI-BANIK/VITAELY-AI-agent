import ClassicTemplate from "./classic";
import ModernTemplate from "./modern";
import MinimalTemplate from "./minimal";
import ProfessionalTemplate from "./professional";
import CreativeTemplate from "./creative";
import ExecutiveTemplate from "./executive";
import TechTemplate from "./tech";
import ElegantTemplate from "./elegant";
import BoldTemplate from "./bold";
import CleanTemplate from "./clean";
import AtsTemplate from "./ats";
import CorporateTemplate from "./corporate";
import CompactTemplate from "./compact";
import SleekTemplate from "./sleek";
import PremiumTemplate from "./premium";
import GradientTemplate from "./gradient";
import MatrixTemplate from "./matrix";
import StartupTemplate from "./startup";
import NeonTemplate from "./neon";
import TimelineTemplate from "./timeline";
import MonoTemplate from "./mono";
import ZenTemplate from "./zen";
import ShadowTemplate from "./shadow";
import GraphiteTemplate from "./graphite";
import FusionTemplate from "./fusion";
import OrbitTemplate from "./orbit";
import CrystalTemplate from "./crystal";
import VelocityTemplate from "./velocity";
import VectorTemplate from "./vector";
import ApexTemplate from "./apex";
import SummitTemplate from "./summit";
import HorizonTemplate from "./horizon";
import NovaTemplate from "./nova";
import PixelTemplate from "./pixel";
import MetroTemplate from "./metro";
import AvatarTemplate from "./avatar";
import ProfilexTemplate from "./profilex";
import VisionTemplate from "./vision";
import RoyaleTemplate from "./royale";
import EliteTemplate from "./elite";
import CyberTemplate from "./cyber";
import GalaxyTemplate from "./galaxy";
import InfinityTemplate from "./infinity";
import PulseTemplate from "./pulse";
import TitanTemplate from "./titan";
import PrismTemplate from "./prism";
import VertexTemplate from "./vertex";
import QuantumTemplate from "./quantum";
import LuxeTemplate from "./luxe";
import AuraTemplate from "./aura";
import TintTemplate from "./tint";

// ✅ All 10 templates exported
export const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  elegant: ElegantTemplate,
  bold: BoldTemplate,
  clean: CleanTemplate,
  ats: AtsTemplate,
  corporate: CorporateTemplate,
  compact: CompactTemplate,
  sleek: SleekTemplate,
  premium: PremiumTemplate,
  gradient: GradientTemplate,
  matrix: MatrixTemplate,
  startup: StartupTemplate,
  neon: NeonTemplate,
  timeline: TimelineTemplate,
  mono: MonoTemplate,
  zen: ZenTemplate,
  shadow: ShadowTemplate,
  graphite: GraphiteTemplate,
  fusion: FusionTemplate,
  orbit: OrbitTemplate,
  crystal: CrystalTemplate,
  velocity: VelocityTemplate,
  vector: VectorTemplate,
  apex: ApexTemplate,
  summit: SummitTemplate,
  horizon: HorizonTemplate,
  nova: NovaTemplate,
  pixel: PixelTemplate,
  metro: MetroTemplate,
  avatar: AvatarTemplate,
  profilex: ProfilexTemplate,
  vision: VisionTemplate,
  royale: RoyaleTemplate,
  elite: EliteTemplate,
  cyber: CyberTemplate,
  galaxy: GalaxyTemplate,
  infinity: InfinityTemplate,
  pulse: PulseTemplate,
  titan: TitanTemplate,
  prism: PrismTemplate,
  vertex: VertexTemplate,
  quantum: QuantumTemplate,
  luxe: LuxeTemplate,
  aura: AuraTemplate,
  tint: TintTemplate,
};

// ✅ Template metadata for template-selector.jsx preview cards
export const templateList = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional resume layout with clean typography",
    color: "#1a1a1a",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with sidebar and accent colors",
    color: "#2563eb",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple with maximum white space",
    color: "#6b7280",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Formal layout ideal for corporate roles",
    color: "#0f172a",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design for creative industry professionals",
    color: "#7c3aed",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sophisticated layout for senior level positions",
    color: "#b45309",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Developer-focused layout with monospace accents",
    color: "#059669",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined design with serif typography",
    color: "#9f1239",
  },
  {
    id: "bold",
    name: "Bold",
    description: "High impact design with strong visual hierarchy",
    color: "#dc2626",
  },
  {
    id: "clean",
    name: "Clean",
    description: "Crisp layout with subtle borders and spacing",
    color: "#0369a1",
  },
  {
    id: "ats",
    name: "ATS",
    description: "ATS-friendly clean format",
    color: "#374151",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional corporate style",
    color: "#1e3a5f",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Space-efficient compact layout",
    color: "#4b5563",
  },
  {
    id: "sleek",
    name: "Sleek",
    description: "Modern sleek minimalist design",
    color: "#0ea5e9",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Premium high-end design",
    color: "#92400e",
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Eye-catching gradient design",
    color: "#6d28d9",
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Tech-inspired matrix style",
    color: "#065f46",
  },
  {
    id: "startup",
    name: "Startup",
    description: "Modern startup culture design",
    color: "#db2777",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Bold neon accent design",
    color: "#7c3aed",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Visual timeline layout",
    color: "#0f766e",
  },
  {
    id: "mono",
    name: "Mono",
    description: "Black & white monochrome typewriter style",
    color: "#111111",
  },
  {
    id: "zen",
    name: "Zen",
    description: "Ultra-minimal calm whitespace design",
    color: "#a8a29e",
  },
  {
    id: "shadow",
    name: "Shadow",
    description: "Dark moody design with subtle shadows",
    color: "#1c1917",
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Industrial full grey palette design",
    color: "#4b5563",
  },
  {
    id: "fusion",
    name: "Fusion",
    description: "Two-column blended contrasting layout",
    color: "#334155",
  },
  {
    id: "orbit",
    name: "Orbit",
    description: "Circular markers with curved dividers",
    color: "#1d4ed8",
  },
  {
    id: "crystal",
    name: "Crystal",
    description: "Icy light blue glass-like clean design",
    color: "#7dd3fc",
  },
  {
    id: "velocity",
    name: "Velocity",
    description: "Diagonal slanted speed-inspired layout",
    color: "#f97316",
  },
  {
    id: "vector",
    name: "Vector",
    description: "Sharp geometric angular divider layout",
    color: "#6366f1",
  },
  {
    id: "apex",
    name: "Apex",
    description: "Bold top-heavy inverted pyramid layout",
    color: "#be123c",
  },
  {
    id: "summit",
    name: "Summit",
    description: "Bold top bar tapering downward design",
    color: "#15803d",
  },
  {
    id: "horizon",
    name: "Horizon",
    description: "Wide horizontal ruled landscape feel",
    color: "#0369a1",
  },
  {
    id: "nova",
    name: "Nova",
    description: "Bright white with starburst pop accents",
    color: "#eab308",
  },
  {
    id: "pixel",
    name: "Pixel",
    description: "Grid-based pixel 8-bit inspired layout",
    color: "#7c3aed",
  },
  {
    id: "metro",
    name: "Metro",
    description: "Flat UI tile Windows Metro inspired",
    color: "#0284c7",
  },
  {
    id: "avatar",
    name: "Avatar",
    description: "Large circular centered profile image",
    color: "#0f766e",
  },
  {
    id: "profilex",
    name: "Profilex",
    description: "Full left sidebar with image and skills",
    color: "#7c3aed",
  },
  {
    id: "vision",
    name: "Vision",
    description: "Image top-right bold left-aligned name",
    color: "#0ea5e9",
  },
  {
    id: "royale",
    name: "Royale",
    description: "Regal navy gold coat-of-arms serif design",
    color: "#1e3a5f",
  },
  {
    id: "elite",
    name: "Elite",
    description: "Dark charcoal platinum ultra-premium feel",
    color: "#27272a",
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Dark neon green terminal aesthetic",
    color: "#065f46",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Deep space purple star-dot accents",
    color: "#3b0764",
  },
  {
    id: "infinity",
    name: "Infinity",
    description: "Looping gradient header with image",
    color: "#6d28d9",
  },
  {
    id: "pulse",
    name: "Pulse",
    description: "Heartbeat line accent clean health style",
    color: "#e11d48",
  },
  {
    id: "titan",
    name: "Titan",
    description: "Massive bold industrial steel tones",
    color: "#292524",
  },
  {
    id: "prism",
    name: "Prism",
    description: "Rainbow prism triangle colorful header",
    color: "#db2777",
  },
  {
    id: "vertex",
    name: "Vertex",
    description: "Sharp geometric triangle cropped image",
    color: "#4338ca",
  },
  {
    id: "quantum",
    name: "Quantum",
    description: "Atomic dot pattern sci-fi blue design",
    color: "#1e40af",
  },
  {
    id: "luxe",
    name: "Luxe",
    description: "Champagne rose gold editorial fashion",
    color: "#9f6c40",
  },
  {
    id: "aura",
    name: "Aura",
    description: "Soft pastel glow dreamy gradient image",
    color: "#c084fc",
  },
  {
    id: "tint",
    name: "Tint",
    description: "Academic institute style with icon contact bar",
    color: "#3b6bc7",
  },
];

// ✅ Default template
export const defaultTemplate = "classic";
