export const COVER_LETTER_TEMPLATES = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean layout with a colored header accent. Best for most industries.",
    preview: "bg-gradient-to-r from-blue-600 to-blue-400",
    category: "universal",
    popular: true,
  },
  {
    id: "corporate-executive",
    name: "Corporate Executive",
    description: "Formal structure with elegant typography for senior roles.",
    preview: "bg-gradient-to-r from-gray-800 to-gray-600",
    category: "corporate",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Ultra-minimal, whitespace-focused. Let your words shine.",
    preview: "bg-white border-2 border-gray-200",
    category: "minimal",
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Bold typography and creative layout for design roles.",
    preview: "bg-gradient-to-r from-purple-600 to-pink-500",
    category: "creative",
  },
  {
    id: "tech-developer",
    name: "Tech Developer",
    description: "Dark-themed, code-inspired layout for engineering roles.",
    preview: "bg-gradient-to-r from-gray-900 to-slate-700",
    category: "tech",
  },
  {
    id: "startup-style",
    name: "Startup Style",
    description: "Dynamic, energetic layout perfect for startup environments.",
    preview: "bg-gradient-to-r from-orange-500 to-amber-400",
    category: "startup",
  },
  {
    id: "ats-optimized",
    name: "ATS Optimized",
    description: "Plain formatting that passes all ATS systems perfectly.",
    preview: "bg-white border-2 border-green-400",
    category: "ats",
    badge: "ATS Safe",
  },
  {
    id: "academic-style",
    name: "Academic Style",
    description: "Traditional format for academic and research positions.",
    preview: "bg-gradient-to-r from-green-700 to-emerald-500",
    category: "academic",
  },
];

export const COVER_LETTER_THEMES = [
  { id: "light", name: "Light", bg: "bg-white", text: "text-gray-900", border: "border-gray-200" },
  { id: "dark", name: "Dark", bg: "bg-gray-950", text: "text-gray-50", border: "border-gray-700" },
  { id: "modern-blue", name: "Modern Blue", bg: "bg-blue-950", text: "text-blue-50", border: "border-blue-700" },
  { id: "corporate-gray", name: "Corporate Gray", bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-300" },
  { id: "professional-green", name: "Professional Green", bg: "bg-emerald-950", text: "text-emerald-50", border: "border-emerald-700" },
  { id: "elegant-black", name: "Elegant Black", bg: "bg-black", text: "text-white", border: "border-zinc-700" },
];

export const COVER_LETTER_TONES = [
  { id: "professional", label: "Professional", icon: "💼", description: "Formal and polished" },
  { id: "friendly", label: "Friendly", icon: "🤝", description: "Warm and approachable" },
  { id: "confident", label: "Confident", icon: "⚡", description: "Bold and assertive" },
  { id: "formal", label: "Formal", icon: "🎩", description: "Traditional structure" },
  { id: "executive", label: "Executive", icon: "👔", description: "Leadership-focused" },
  { id: "technical", label: "Technical", icon: "⚙️", description: "Detail-oriented" },
  { id: "creative", label: "Creative", icon: "🎨", description: "Innovative and unique" },
  { id: "enthusiastic", label: "Enthusiastic", icon: "🚀", description: "Energetic and passionate" },
];

export const DEFAULT_SECTIONS = [
  { id: "introduction", label: "Introduction", required: true },
  { id: "experience", label: "Experience Highlights", required: false },
  { id: "skills", label: "Key Skills", required: false },
  { id: "achievements", label: "Achievements", required: false },
  { id: "companyAlignment", label: "Company Alignment", required: false },
  { id: "closing", label: "Closing Statement", required: true },
];

export const DEFAULT_SECTIONS_CONFIG = {
  introduction: true,
  experience: true,
  skills: true,
  achievements: true,
  companyAlignment: true,
  closing: true,
};

export const DEFAULT_SECTION_ORDER = [
  "introduction",
  "experience",
  "skills",
  "achievements",
  "companyAlignment",
  "closing",
];