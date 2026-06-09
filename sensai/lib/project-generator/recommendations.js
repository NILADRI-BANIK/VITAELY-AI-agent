import { generateEnhancements, generateDeploymentSuggestions } from "./generator";
import { formatEnhancements, formatDeploymentSuggestions } from "./formatter";

// ─── Get Enhancement Suggestions ─────────────────────────────────────────────
export const getEnhancements = async ({ title, description, techStack, coreFeatures }) => {
  const raw = await generateEnhancements({ title, description, techStack, coreFeatures });
  return formatEnhancements(raw);
};

// ─── Get Deployment Suggestions ───────────────────────────────────────────────
export const getDeploymentSuggestions = async ({ title, techStack, complexity }) => {
  const raw = await generateDeploymentSuggestions({ title, techStack, complexity });
  return formatDeploymentSuggestions(raw);
};

// ─── Get Database Recommendation ─────────────────────────────────────────────
export const getDatabaseRecommendation = ({ techStack, domain, complexity }) => {
  const allTech = [
    ...(techStack?.backend || []),
    ...(techStack?.database || []),
  ].map((t) => t.toLowerCase());

  const dbOptions = [
    {
      name: "PostgreSQL",
      type: "Relational",
      bestFor: ["Full-stack apps", "SaaS", "E-commerce", "Financial apps"],
      withORM: "Prisma",
      hostedOn: ["Neon", "Supabase", "Railway", "Render"],
      recommended: allTech.some((t) =>
        ["postgresql", "postgres", "prisma", "next.js", "nextjs"].includes(t)
      ),
    },
    {
      name: "MongoDB",
      type: "NoSQL Document",
      bestFor: ["Content apps", "Real-time apps", "Flexible schema"],
      withORM: "Mongoose",
      hostedOn: ["MongoDB Atlas", "Railway"],
      recommended: allTech.some((t) =>
        ["mongodb", "mongoose", "express", "node"].includes(t)
      ),
    },
    {
      name: "Firebase Firestore",
      type: "NoSQL Cloud",
      bestFor: ["Mobile apps", "Real-time sync", "Quick prototypes"],
      withORM: "Firebase SDK",
      hostedOn: ["Google Firebase"],
      recommended: allTech.some((t) =>
        ["firebase", "react native", "flutter"].includes(t)
      ),
    },
    {
      name: "Redis",
      type: "In-Memory Cache",
      bestFor: ["Caching", "Sessions", "Real-time leaderboards"],
      withORM: "ioredis",
      hostedOn: ["Upstash", "Railway", "Redis Cloud"],
      recommended:
        complexity === "hard" ||
        allTech.some((t) => ["redis", "cache", "queue"].includes(t)),
    },
    {
      name: "SQLite",
      type: "Embedded Relational",
      bestFor: ["Local apps", "CLI tools", "Small projects"],
      withORM: "Prisma / better-sqlite3",
      hostedOn: ["Local only"],
      recommended: complexity === "easy",
    },
    {
      name: "Supabase",
      type: "PostgreSQL + Realtime",
      bestFor: ["Full-stack apps", "Auth + DB combo", "Open source Firebase alternative"],
      withORM: "Supabase JS SDK",
      hostedOn: ["Supabase Cloud"],
      recommended: allTech.some((t) =>
        ["supabase", "realtime", "socket"].includes(t)
      ),
    },
  ];

  const recommended = dbOptions.filter((db) => db.recommended);
  const others = dbOptions.filter((db) => !db.recommended);

  return {
    recommended: recommended.length > 0 ? recommended[0] : dbOptions[0],
    alternatives: recommended.length > 1
      ? [...recommended.slice(1), ...others].slice(0, 3)
      : others.slice(0, 3),
    all: dbOptions,
  };
};

// ─── Get Tech Stack Recommendation ────────────────────────────────────────────
export const getTechStackRecommendation = ({ domain, experienceLevel, complexity }) => {
  const stacks = {
    "web-development": {
      beginner: {
        frontend: ["React", "Tailwind CSS"],
        backend: ["Node.js", "Express"],
        database: ["MongoDB"],
        deployment: ["Vercel", "Render"],
      },
      intermediate: {
        frontend: ["Next.js", "Tailwind CSS", "Shadcn UI"],
        backend: ["Next.js API Routes", "Prisma"],
        database: ["PostgreSQL (Neon)"],
        deployment: ["Vercel", "Railway"],
      },
      advanced: {
        frontend: ["Next.js", "TypeScript", "Tailwind CSS"],
        backend: ["Next.js", "tRPC", "Prisma", "Redis"],
        database: ["PostgreSQL", "Redis"],
        deployment: ["Vercel", "AWS", "Docker"],
      },
    },
    "artificial-intelligence": {
      beginner: {
        frontend: ["React", "Tailwind CSS"],
        backend: ["Node.js", "OpenAI API"],
        database: ["MongoDB"],
        deployment: ["Vercel", "Render"],
      },
      intermediate: {
        frontend: ["Next.js", "Tailwind CSS"],
        backend: ["Next.js", "Gemini API", "LangChain"],
        database: ["PostgreSQL (Neon)", "Pinecone"],
        deployment: ["Vercel", "Railway"],
      },
      advanced: {
        frontend: ["Next.js", "TypeScript"],
        backend: ["Python (FastAPI)", "LangChain", "OpenAI", "Hugging Face"],
        database: ["PostgreSQL", "Pinecone", "Redis"],
        deployment: ["AWS", "GCP", "Docker", "Kubernetes"],
      },
    },
    "mobile-development": {
      beginner: {
        frontend: ["React Native (Expo)"],
        backend: ["Firebase"],
        database: ["Firestore"],
        deployment: ["Expo Go", "App Store"],
      },
      intermediate: {
        frontend: ["React Native", "NativeWind"],
        backend: ["Node.js", "Express"],
        database: ["PostgreSQL", "Firebase"],
        deployment: ["Expo EAS", "App Store", "Play Store"],
      },
      advanced: {
        frontend: ["Flutter", "Dart"],
        backend: ["Node.js", "GraphQL"],
        database: ["PostgreSQL", "Redis"],
        deployment: ["App Store", "Play Store", "CI/CD"],
      },
    },
    "data-science": {
      beginner: {
        frontend: ["Streamlit"],
        backend: ["Python", "Pandas"],
        database: ["CSV / SQLite"],
        deployment: ["Streamlit Cloud", "Render"],
      },
      intermediate: {
        frontend: ["Streamlit", "Plotly Dash"],
        backend: ["Python", "Scikit-learn", "Pandas"],
        database: ["PostgreSQL", "MongoDB"],
        deployment: ["Render", "Heroku"],
      },
      advanced: {
        frontend: ["React", "D3.js"],
        backend: ["Python (FastAPI)", "TensorFlow", "PyTorch"],
        database: ["PostgreSQL", "Redis", "Elasticsearch"],
        deployment: ["AWS SageMaker", "GCP Vertex AI", "Docker"],
      },
    },
  };

  const domainStacks = stacks[domain] || stacks["web-development"];
  const levelStack = domainStacks[experienceLevel] || domainStacks["intermediate"];

  return levelStack;
};

// ─── Get API Recommendations ──────────────────────────────────────────────────
export const getAPIRecommendations = ({ domain, coreFeatures = [], techStack }) => {
  const allFeatures = coreFeatures.map((f) => f.toLowerCase()).join(" ");

  const apis = [
    {
      name: "Gemini API",
      provider: "Google",
      use: "AI text generation, chat, analysis",
      freetier: true,
      recommended: domain === "artificial-intelligence" || allFeatures.includes("ai"),
    },
    {
      name: "OpenAI API",
      provider: "OpenAI",
      use: "GPT models, embeddings, image generation",
      freetier: false,
      recommended: domain === "artificial-intelligence" || allFeatures.includes("ai"),
    },
    {
      name: "Clerk",
      provider: "Clerk",
      use: "Authentication, user management",
      freetier: true,
      recommended: allFeatures.includes("auth") || allFeatures.includes("login"),
    },
    {
      name: "Stripe API",
      provider: "Stripe",
      use: "Payments, subscriptions",
      freetier: true,
      recommended:
        allFeatures.includes("payment") ||
        allFeatures.includes("subscription") ||
        domain === "fintech",
    },
    {
      name: "Cloudinary",
      provider: "Cloudinary",
      use: "Image and video upload, optimization",
      freetier: true,
      recommended:
        allFeatures.includes("image") ||
        allFeatures.includes("upload") ||
        allFeatures.includes("media"),
    },
    {
      name: "Twilio",
      provider: "Twilio",
      use: "SMS, email, voice notifications",
      freetier: true,
      recommended:
        allFeatures.includes("notification") ||
        allFeatures.includes("sms") ||
        allFeatures.includes("email"),
    },
    {
      name: "Socket.io",
      provider: "Open Source",
      use: "Real-time bidirectional communication",
      freetier: true,
      recommended:
        allFeatures.includes("real-time") ||
        allFeatures.includes("chat") ||
        allFeatures.includes("live"),
    },
    {
      name: "Resend",
      provider: "Resend",
      use: "Transactional email sending",
      freetier: true,
      recommended:
        allFeatures.includes("email") || allFeatures.includes("notification"),
    },
    {
      name: "Google Maps API",
      provider: "Google",
      use: "Maps, geolocation, directions",
      freetier: true,
      recommended:
        allFeatures.includes("map") ||
        allFeatures.includes("location") ||
        allFeatures.includes("address"),
    },
    {
      name: "UploadThing",
      provider: "UploadThing",
      use: "File uploads for Next.js apps",
      freetier: true,
      recommended:
        allFeatures.includes("upload") ||
        allFeatures.includes("file") ||
        allFeatures.includes("resume"),
    },
  ];

  return {
    recommended: apis.filter((api) => api.recommended),
    all: apis,
  };
};