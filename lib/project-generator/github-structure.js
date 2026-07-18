/**
 * @fileoverview GitHub Structure Guide Generator
 * @module lib/project-generator/github-structure
 *
 * Pure JavaScript utility — no external APIs, no AI SDK.
 * Generates intelligent folder structures, .gitignore entries,
 * branch strategies, commit conventions, and recommended files
 * based on the project's tech stack, difficulty, and features.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Lookup Maps
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical stack identifiers mapped to lowercase detection keywords */
const STACK_KEYWORDS = {
  nextjs: ["next.js", "nextjs", "next js", "next"],
  react: ["react", "react.js", "reactjs", "cra", "vite"],
  mern: ["mern", "mongo", "mongoose"],
  pern: ["pern", "postgresql", "postgres", "pg"],
  node: ["node", "node.js", "nodejs", "express", "fastify", "koa"],
  django: ["django", "drf", "django rest"],
  python: ["python", "flask", "fastapi"],
  vue: ["vue", "nuxt", "vuejs"],
  angular: ["angular", "ng"],
  svelte: ["svelte", "sveltekit"],
  mobile: ["react native", "expo", "flutter"],
  docker: ["docker", "kubernetes", "k8s"],
  graphql: ["graphql", "apollo"],
  prisma: ["prisma"],
  mongodb: ["mongodb", "mongo", "mongoose"],
  postgres: ["postgresql", "postgres", "pg", "supabase"],
  mysql: ["mysql", "mariadb"],
  redis: ["redis"],
  typescript: ["typescript", "ts"],
  tailwind: ["tailwind", "tailwindcss"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Detect stacks from a techStack array
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises and detects which canonical stacks are present
 * in the project's techStack array.
 *
 * @param {string[]} techStack - Array of technology names
 * @returns {Set<string>} Set of detected canonical stack keys
 */
function detectStacks(techStack) {
  const detected = new Set();

  if (!Array.isArray(techStack) || techStack.length === 0) {
    detected.add("generic");
    return detected;
  }

  const normalised = techStack.map((t) =>
    typeof t === "string" ? t.toLowerCase().trim() : "",
  );

  for (const [stack, keywords] of Object.entries(STACK_KEYWORDS)) {
    if (keywords.some((kw) => normalised.some((t) => t.includes(kw)))) {
      detected.add(stack);
    }
  }

  // Derive composite stacks
  const hasMongo = detected.has("mongodb") || detected.has("mern");
  const hasPostgres = detected.has("postgres") || detected.has("pern");
  const hasNode =
    detected.has("node") || detected.has("mern") || detected.has("pern");
  const hasReact =
    detected.has("react") || detected.has("mern") || detected.has("pern");

  if (hasMongo && hasNode && hasReact) detected.add("mern");
  if (hasPostgres && hasNode && hasReact) detected.add("pern");

  if (detected.size === 0) detected.add("generic");

  return detected;
}

// ─────────────────────────────────────────────────────────────────────────────
// Folder Structure Templates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the folder structure string for a Next.js project.
 *
 * @param {object} opts
 * @param {boolean} opts.hasAuth
 * @param {boolean} opts.hasPrisma
 * @param {boolean} opts.hasDocker
 * @param {boolean} opts.isTypeScript
 * @returns {string}
 */
function getNextjsStructure({ hasAuth, hasPrisma, hasDocker, isTypeScript }) {
  const ext = isTypeScript ? "ts" : "js";
  const lines = [
    `${hasDocker ? "├── docker-compose.yml\n" : ""}├── public/`,
    "│   ├── fonts/",
    "│   └── images/",
    "├── src/",
    "│   ├── app/",
    "│   │   ├── (auth)/",
    hasAuth ? "│   │   │   ├── login/" : null,
    hasAuth ? "│   │   │   └── register/" : null,
    "│   │   ├── (dashboard)/",
    "│   │   │   └── page." + ext + "x",
    "│   │   ├── api/",
    "│   │   │   └── [...route]/",
    "│   │   │       └── route." + ext,
    "│   │   ├── globals.css",
    "│   │   ├── layout." + ext + "x",
    "│   │   └── page." + ext + "x",
    "│   ├── components/",
    "│   │   ├── ui/",
    "│   │   └── shared/",
    "│   ├── hooks/",
    "│   ├── lib/",
    "│   │   └── utils." + ext,
    hasPrisma ? "│   ├── prisma/" : null,
    hasPrisma ? "│   │   └── schema.prisma" : null,
    "│   ├── types/",
    "│   └── constants/",
    "├── .env.local",
    "├── .env.example",
    "├── .gitignore",
    "├── next.config.js",
    "├── package.json",
    isTypeScript ? "├── tsconfig.json" : null,
    "└── README.md",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Returns the folder structure string for a MERN stack project.
 *
 * @param {object} opts
 * @param {boolean} opts.hasDocker
 * @param {boolean} opts.isTypeScript
 * @returns {string}
 */
function getMernStructure({ hasDocker, isTypeScript }) {
  const ext = isTypeScript ? "ts" : "js";
  const lines = [
    hasDocker ? "├── docker-compose.yml" : null,
    "├── client/                    # React frontend",
    "│   ├── public/",
    "│   └── src/",
    "│       ├── assets/",
    "│       ├── components/",
    "│       │   ├── common/",
    "│       │   └── layout/",
    "│       ├── context/",
    "│       ├── hooks/",
    "│       ├── pages/",
    "│       ├── services/",
    "│       ├── utils/",
    "│       ├── App." + ext + "x",
    "│       └── main." + ext + "x",
    "│       ├── .env",
    "│       └── package.json",
    "├── server/                    # Express + MongoDB backend",
    "│   ├── config/",
    "│   │   └── db." + ext,
    "│   ├── controllers/",
    "│   ├── middleware/",
    "│   │   ├── auth." + ext,
    "│   │   └── errorHandler." + ext,
    "│   ├── models/",
    "│   ├── routes/",
    "│   ├── utils/",
    "│   ├── .env",
    "│   ├── package.json",
    "│   └── server." + ext,
    "├── .gitignore",
    "├── .env.example",
    "└── README.md",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Returns the folder structure string for a PERN stack project.
 *
 * @param {object} opts
 * @param {boolean} opts.hasPrisma
 * @param {boolean} opts.hasDocker
 * @param {boolean} opts.isTypeScript
 * @returns {string}
 */
function getPernStructure({ hasPrisma, hasDocker, isTypeScript }) {
  const ext = isTypeScript ? "ts" : "js";
  const lines = [
    hasDocker ? "├── docker-compose.yml" : null,
    "├── client/                    # React frontend",
    "│   ├── public/",
    "│   └── src/",
    "│       ├── components/",
    "│       ├── hooks/",
    "│       ├── pages/",
    "│       ├── services/",
    "│       ├── utils/",
    "│       └── App." + ext + "x",
    "├── server/                    # Node + Express + PostgreSQL",
    "│   ├── config/",
    "│   │   └── database." + ext,
    "│   ├── controllers/",
    "│   ├── middleware/",
    "│   ├── models/",
    hasPrisma ? "│   ├── prisma/" : null,
    hasPrisma ? "│   │   ├── schema.prisma" : null,
    hasPrisma ? "│   │   └── migrations/" : null,
    !hasPrisma ? "│   ├── migrations/" : null,
    "│   ├── routes/",
    "│   ├── utils/",
    "│   └── server." + ext,
    "├── .env.example",
    "├── .gitignore",
    "└── README.md",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Returns the folder structure string for a plain React (Vite/CRA) project.
 *
 * @param {object} opts
 * @param {boolean} opts.isTypeScript
 * @returns {string}
 */
function getReactStructure({ isTypeScript }) {
  const ext = isTypeScript ? "ts" : "js";
  return [
    "├── public/",
    "│   └── vite.svg",
    "├── src/",
    "│   ├── assets/",
    "│   ├── components/",
    "│   │   ├── ui/",
    "│   │   └── layout/",
    "│   ├── context/",
    "│   ├── hooks/",
    "│   ├── pages/",
    "│   ├── services/",
    "│   │   └── api." + ext,
    "│   ├── store/",
    "│   ├── utils/",
    "│   ├── App." + ext + "x",
    "│   ├── main." + ext + "x",
    "│   └── index.css",
    "├── .env",
    "├── .env.example",
    "├── .gitignore",
    "├── index.html",
    "├── package.json",
    isTypeScript ? "├── tsconfig.json" : null,
    "└── README.md",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Returns the folder structure string for a Node / Express-only API project.
 *
 * @param {object} opts
 * @param {boolean} opts.hasPrisma
 * @param {boolean} opts.hasDocker
 * @param {boolean} opts.isTypeScript
 * @returns {string}
 */
function getNodeStructure({ hasPrisma, hasDocker, isTypeScript }) {
  const ext = isTypeScript ? "ts" : "js";
  const lines = [
    hasDocker ? "├── docker-compose.yml" : null,
    "├── src/",
    "│   ├── config/",
    "│   │   ├── database." + ext,
    "│   │   └── env." + ext,
    "│   ├── controllers/",
    "│   ├── middleware/",
    "│   │   ├── auth." + ext,
    "│   │   ├── errorHandler." + ext,
    "│   │   └── rateLimiter." + ext,
    "│   ├── models/",
    hasPrisma ? "│   ├── prisma/" : null,
    hasPrisma ? "│   │   ├── schema.prisma" : null,
    hasPrisma ? "│   │   └── migrations/" : null,
    "│   ├── routes/",
    "│   │   └── index." + ext,
    "│   ├── services/",
    "│   ├── utils/",
    "│   │   ├── logger." + ext,
    "│   │   └── validators." + ext,
    "│   └── app." + ext,
    "├── tests/",
    "│   ├── unit/",
    "│   └── integration/",
    "├── .env",
    "├── .env.example",
    "├── .gitignore",
    "├── package.json",
    isTypeScript ? "├── tsconfig.json" : null,
    "└── README.md",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Returns the folder structure string for a Django project.
 *
 * @param {object} opts
 * @param {boolean} opts.hasDocker
 * @returns {string}
 */
function getDjangoStructure({ hasDocker }) {
  const lines = [
    hasDocker ? "├── docker-compose.yml" : null,
    hasDocker ? "├── Dockerfile" : null,
    "├── manage.py",
    "├── requirements.txt",
    "├── requirements-dev.txt",
    "├── config/",
    "│   ├── settings/",
    "│   │   ├── base.py",
    "│   │   ├── development.py",
    "│   │   └── production.py",
    "│   ├── urls.py",
    "│   └── wsgi.py",
    "├── apps/",
    "│   ├── users/",
    "│   │   ├── migrations/",
    "│   │   ├── models.py",
    "│   │   ├── serializers.py",
    "│   │   ├── urls.py",
    "│   │   └── views.py",
    "│   └── core/",
    "│       └── models.py",
    "├── static/",
    "├── media/",
    "├── templates/",
    "├── tests/",
    "├── .env",
    "├── .env.example",
    "├── .gitignore",
    "└── README.md",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Returns the folder structure string for a generic Python project.
 *
 * @param {object} opts
 * @param {boolean} opts.hasDocker
 * @returns {string}
 */
function getPythonStructure({ hasDocker }) {
  const lines = [
    hasDocker ? "├── docker-compose.yml" : null,
    hasDocker ? "├── Dockerfile" : null,
    "├── src/",
    "│   ├── __init__.py",
    "│   ├── main.py",
    "│   ├── config.py",
    "│   ├── models/",
    "│   ├── routes/",
    "│   ├── services/",
    "│   └── utils/",
    "├── tests/",
    "│   ├── __init__.py",
    "│   ├── unit/",
    "│   └── integration/",
    "├── docs/",
    "├── scripts/",
    "├── .env",
    "├── .env.example",
    "├── .gitignore",
    "├── pyproject.toml",
    "├── requirements.txt",
    "└── README.md",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Returns a safe generic folder structure.
 *
 * @returns {string}
 */
function getGenericStructure() {
  return [
    "├── src/",
    "│   ├── components/",
    "│   ├── utils/",
    "│   ├── services/",
    "│   └── index.js",
    "├── tests/",
    "├── docs/",
    "├── scripts/",
    "├── .env.example",
    "├── .gitignore",
    "├── package.json",
    "└── README.md",
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// .gitignore Entries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a de-duplicated list of .gitignore entries for the detected stacks.
 *
 * @param {Set<string>} stacks
 * @returns {string[]}
 */
function buildGitignoreEntries(stacks) {
  const base = [
    ".env",
    ".env.local",
    ".env.*.local",
    ".env.production",
    ".DS_Store",
    "Thumbs.db",
    "*.log",
    "*.tmp",
    "*.swp",
    ".idea/",
    ".vscode/",
    "*.iml",
  ];

  const byStack = {
    nextjs: [".next/", "out/", "build/", ".vercel", "next-env.d.ts"],
    react: ["node_modules/", "build/", "dist/", ".cache/", "coverage/"],
    node: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
    ],
    mern: ["node_modules/", "dist/", "build/", "coverage/"],
    pern: ["node_modules/", "dist/", "build/", "coverage/"],
    django: [
      "__pycache__/",
      "*.pyc",
      "*.pyo",
      "*.pyd",
      ".Python",
      "env/",
      "venv/",
      ".venv/",
      "*.egg-info/",
      "dist/",
      "build/",
      "*.sqlite3",
      "media/",
    ],
    python: [
      "__pycache__/",
      "*.pyc",
      "*.pyo",
      ".Python",
      "venv/",
      ".venv/",
      "*.egg-info/",
      "dist/",
      "build/",
    ],
    prisma: ["prisma/migrations/*.db"],
    mongodb: [],
    postgres: ["*.sql.backup"],
    docker: [".docker/"],
    typescript: ["*.js.map", "*.d.ts.map"],
    vue: ["node_modules/", "dist/", ".nuxt/", ".output/"],
    angular: ["node_modules/", "dist/", ".angular/"],
    svelte: ["node_modules/", ".svelte-kit/", "build/"],
    mobile: ["node_modules/", ".expo/", "ios/build/", "android/build/"],
  };

  const collected = new Set(base);

  for (const stack of stacks) {
    const entries = byStack[stack];
    if (entries) {
      entries.forEach((e) => collected.add(e));
    }
  }

  // Always add node_modules if any JS stack is present
  if (
    stacks.has("nextjs") ||
    stacks.has("react") ||
    stacks.has("node") ||
    stacks.has("mern") ||
    stacks.has("pern") ||
    stacks.has("vue") ||
    stacks.has("angular") ||
    stacks.has("svelte") ||
    stacks.has("mobile")
  ) {
    collected.add("node_modules/");
  }

  return [...collected].sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Branch Strategy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a Git branching strategy tailored to the project's difficulty.
 *
 * @param {string} difficulty - "beginner" | "intermediate" | "advanced"
 * @returns {Array<{name: string, purpose: string}>}
 */
function buildBranchStrategy(difficulty) {
  const level = (difficulty || "").toLowerCase();

  const base = [
    {
      name: "main",
      purpose:
        "Production-ready code. Only merge via pull request after full review and testing.",
    },
    {
      name: "develop",
      purpose:
        "Integration branch. All feature branches merge here first before reaching main.",
    },
  ];

  const intermediate = [
    ...base,
    {
      name: "feature/<feature-name>",
      purpose:
        "Short-lived branches for individual features or user stories, branched from develop.",
    },
    {
      name: "bugfix/<issue-id>",
      purpose:
        "Fixes for bugs found in develop. Merged back into develop when resolved.",
    },
    {
      name: "release/<version>",
      purpose:
        "Stabilisation branch created from develop when preparing a new release.",
    },
  ];

  const advanced = [
    ...intermediate,
    {
      name: "hotfix/<issue-id>",
      purpose:
        "Critical production fixes branched directly from main. Merged into both main and develop.",
    },
    {
      name: "chore/<task-name>",
      purpose:
        "Non-functional changes: dependency updates, tooling, CI/CD config tweaks.",
    },
    {
      name: "docs/<topic>",
      purpose:
        "Documentation-only changes that do not affect application logic.",
    },
  ];

  if (level === "advanced") return advanced;
  if (level === "intermediate") return intermediate;
  // beginner or default
  return base;
}

// ─────────────────────────────────────────────────────────────────────────────
// Commit Conventions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a list of conventional commit convention examples.
 *
 * @param {Set<string>} stacks
 * @returns {string[]}
 */
function buildCommitConventions(stacks) {
  const universal = [
    "feat: add user authentication with JWT",
    "fix: resolve null pointer in login handler",
    "docs: update README with setup instructions",
    "style: format code with Prettier",
    "refactor: extract validation logic into helper",
    "test: add unit tests for auth middleware",
    "chore: upgrade dependencies to latest versions",
    "perf: optimise database query with indexing",
    "ci: add GitHub Actions workflow for tests",
    "build: configure Webpack for production build",
  ];

  const extra = [];

  if (stacks.has("nextjs") || stacks.has("react") || stacks.has("vue")) {
    extra.push(
      "feat(ui): add responsive navbar component",
      "fix(ui): correct mobile layout overflow issue",
    );
  }

  if (stacks.has("node") || stacks.has("mern") || stacks.has("pern")) {
    extra.push(
      "feat(api): add paginated /users endpoint",
      "fix(api): handle 404 for missing resource",
    );
  }

  if (stacks.has("django") || stacks.has("python")) {
    extra.push(
      "feat(models): add UserProfile model with signals",
      "fix(views): handle exception in post serializer",
    );
  }

  if (stacks.has("prisma") || stacks.has("postgres") || stacks.has("mongodb")) {
    extra.push("chore(db): add migration for new schema changes");
  }

  return [...universal, ...extra];
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended Files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the list of recommended repository files for the project.
 *
 * @param {Set<string>} stacks
 * @param {string} difficulty
 * @param {string[]} coreFeatures
 * @returns {Array<{name: string, purpose: string}>}
 */
function buildRecommendedFiles(stacks, difficulty, coreFeatures) {
  const level = (difficulty || "").toLowerCase();
  const featuresText = Array.isArray(coreFeatures)
    ? coreFeatures.join(" ").toLowerCase()
    : "";

  const files = [
    {
      name: "README.md",
      purpose:
        "Project overview, tech stack, local setup steps, environment variables, and contribution guide.",
    },
    {
      name: ".env.example",
      purpose:
        "Template for all required environment variables with placeholder values. Never commit real secrets.",
    },
    {
      name: ".gitignore",
      purpose:
        "Excludes build artifacts, secrets, dependencies, and OS-specific files from version control.",
    },
    {
      name: "LICENSE",
      purpose:
        "Defines how others may use, copy, or distribute this project. MIT is a common open-source choice.",
    },
  ];

  // Intermediate+
  if (level === "intermediate" || level === "advanced") {
    files.push(
      {
        name: "CONTRIBUTING.md",
        purpose:
          "Guidelines for contributors: branching strategy, PR checklist, code style, and review process.",
      },
      {
        name: "CHANGELOG.md",
        purpose:
          "Chronological list of notable changes per version following the Keep a Changelog format.",
      },
    );
  }

  // Advanced
  if (level === "advanced") {
    files.push({
      name: "SECURITY.md",
      purpose:
        "Responsible disclosure policy and instructions for reporting security vulnerabilities.",
    });
  }

  // Docker
  if (stacks.has("docker") || stacks.has("node") || level === "advanced") {
    files.push(
      {
        name: "docker-compose.yml",
        purpose:
          "Defines multi-container services (app, database, cache) for local development.",
      },
      {
        name: "Dockerfile",
        purpose:
          "Container image definition for building and running the application in any environment.",
      },
    );
  }

  // CI
  if (level === "intermediate" || level === "advanced") {
    files.push({
      name: ".github/workflows/ci.yml",
      purpose:
        "GitHub Actions pipeline: lint, test, and build on every push and pull request.",
    });
  }

  // Prisma
  if (stacks.has("prisma")) {
    files.push({
      name: "prisma/schema.prisma",
      purpose:
        "Prisma schema defining data models, relations, and the database connector.",
    });
  }

  // API / auth features
  if (
    featuresText.includes("api") ||
    featuresText.includes("auth") ||
    stacks.has("node") ||
    stacks.has("nextjs")
  ) {
    files.push({
      name: "docs/API.md",
      purpose:
        "API reference documenting all endpoints, request/response shapes, and authentication.",
    });
  }

  // Linting / formatting
  if (
    stacks.has("nextjs") ||
    stacks.has("react") ||
    stacks.has("node") ||
    stacks.has("typescript")
  ) {
    files.push(
      {
        name: ".eslintrc.json",
        purpose:
          "ESLint configuration to enforce consistent code style and catch common errors.",
      },
      {
        name: ".prettierrc",
        purpose:
          "Prettier configuration for automatic, opinionated code formatting.",
      },
    );
  }

  // TypeScript
  if (stacks.has("typescript")) {
    files.push({
      name: "tsconfig.json",
      purpose:
        "TypeScript compiler options: strict mode, module resolution, and path aliases.",
    });
  }

  // Python testing
  if (stacks.has("django") || stacks.has("python")) {
    files.push({
      name: "pytest.ini",
      purpose:
        "Pytest configuration for test discovery, markers, and reporting.",
    });
  }

  return files;
}

// ─────────────────────────────────────────────────────────────────────────────
// Folder Structure Dispatcher
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Selects and builds the appropriate folder structure string.
 *
 * @param {Set<string>} stacks
 * @param {object} opts
 * @param {boolean} opts.hasAuth
 * @param {boolean} opts.hasPrisma
 * @param {boolean} opts.hasDocker
 * @param {boolean} opts.isTypeScript
 * @returns {string}
 */
function buildFolderStructure(
  stacks,
  { hasAuth, hasPrisma, hasDocker, isTypeScript },
) {
  if (stacks.has("nextjs")) {
    return getNextjsStructure({ hasAuth, hasPrisma, hasDocker, isTypeScript });
  }

  if (stacks.has("mern")) {
    return getMernStructure({ hasDocker, isTypeScript });
  }

  if (stacks.has("pern")) {
    return getPernStructure({ hasPrisma, hasDocker, isTypeScript });
  }

  if (stacks.has("django")) {
    return getDjangoStructure({ hasDocker });
  }

  if (stacks.has("python")) {
    return getPythonStructure({ hasDocker });
  }

  if (stacks.has("react") || stacks.has("vue") || stacks.has("svelte")) {
    return getReactStructure({ isTypeScript });
  }

  if (stacks.has("node")) {
    return getNodeStructure({ hasPrisma, hasDocker, isTypeScript });
  }

  return getGenericStructure();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Exported Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a complete GitHub structure guide for a software project.
 *
 * This is a pure utility — no external API calls, no AI SDK dependency.
 *
 * @async
 * @param {object} project - Project metadata
 * @param {string}   [project.title]         - Project title
 * @param {string}   [project.description]   - Project description
 * @param {string[]} [project.techStack]     - Array of technologies
 * @param {string[]} [project.coreFeatures]  - Array of core feature descriptions
 * @param {string}   [project.difficulty]    - "beginner" | "intermediate" | "advanced"
 *
 * @returns {Promise<{
 *   folderStructure:   string,
 *   gitignoreEntries:  string[],
 *   branches:          Array<{name: string, purpose: string}>,
 *   commitConventions: string[],
 *   recommendedFiles:  Array<{name: string, purpose: string}>
 * }>}
 *
 * @throws {Error} Only if called with a completely invalid argument type;
 *                 missing/partial inputs are handled gracefully.
 */
export async function getGithubStructureGuide(project) {
  try {
    // ── Safely destructure with defaults ──────────────────────────────────────
    const {
      description = "",
      techStack = [],
      coreFeatures = [],
      difficulty = "intermediate",
    } = project && typeof project === "object" ? project : {};
    // ── Detect stacks ─────────────────────────────────────────────────────────
    const stacks = detectStacks(techStack);

    // ── Derive boolean flags ──────────────────────────────────────────────────
    const allText = [...techStack, description, ...coreFeatures]
      .join(" ")
      .toLowerCase();

    const hasAuth =
      allText.includes("auth") ||
      allText.includes("login") ||
      allText.includes("jwt") ||
      allText.includes("clerk") ||
      allText.includes("oauth");

    const hasPrisma = stacks.has("prisma");

    const hasDocker =
      stacks.has("docker") ||
      allText.includes("docker") ||
      allText.includes("container") ||
      allText.includes("kubernetes") ||
      difficulty === "advanced";

    const isTypeScript =
      stacks.has("typescript") ||
      allText.includes("typescript") ||
      allText.includes(" ts ");

    const structureOpts = { hasAuth, hasPrisma, hasDocker, isTypeScript };

    // ── Build each section ────────────────────────────────────────────────────
    const folderStructure = buildFolderStructure(stacks, structureOpts);
    const gitignoreEntries = buildGitignoreEntries(stacks);
    const branches = buildBranchStrategy(difficulty);
    const commitConventions = buildCommitConventions(stacks);
    const recommendedFiles = buildRecommendedFiles(
      stacks,
      difficulty,
      coreFeatures,
    );

    return {
      folderStructure,
      gitignoreEntries,
      branches,
      commitConventions,
      recommendedFiles,
    };
  } catch (error) {
    // Return safe defaults so the UI never crashes
    console.error("[getGithubStructureGuide] Error:", error?.message ?? error);

    return {
      folderStructure: getGenericStructure(),
      gitignoreEntries: [
        ".env",
        ".env.local",
        ".DS_Store",
        "node_modules/",
        "dist/",
        "build/",
        "*.log",
      ],
      branches: [
        {
          name: "main",
          purpose:
            "Production-ready code. Merge only via reviewed pull requests.",
        },
        {
          name: "develop",
          purpose: "Integration branch. All features merge here before main.",
        },
      ],
      commitConventions: [
        "feat: add new feature",
        "fix: resolve bug",
        "docs: update documentation",
        "chore: maintenance task",
      ],
      recommendedFiles: [
        {
          name: "README.md",
          purpose: "Project overview and setup instructions.",
        },
        {
          name: ".env.example",
          purpose: "Template for required environment variables.",
        },
        { name: "LICENSE", purpose: "Open-source licence for the project." },
      ],
    };
  }
}
