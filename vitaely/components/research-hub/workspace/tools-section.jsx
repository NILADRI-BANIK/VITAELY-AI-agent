"use client";

import {
  Wrench,
  ExternalLink,
  AlertCircle,
  Boxes,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TOOL_CATALOG = [
  {
    name: "PyTorch",
    description: "Deep learning framework for research and production.",
    url: "https://pytorch.org",
    category: "Deep Learning",
    keywords: ["deep learning", "neural network", "vision", "nlp", "transformer", "reinforcement"],
  },
  {
    name: "TensorFlow",
    description: "End-to-end machine learning platform.",
    url: "https://www.tensorflow.org",
    category: "Deep Learning",
    keywords: ["deep learning", "neural network", "machine learning", "keras"],
  },
  {
    name: "Scikit-learn",
    description: "Classical machine learning library for Python.",
    url: "https://scikit-learn.org",
    category: "Machine Learning",
    keywords: ["machine learning", "classification", "regression", "clustering", "statistics"],
  },
  {
    name: "Hugging Face Transformers",
    description: "Pretrained models for NLP, vision, and audio.",
    url: "https://huggingface.co/docs/transformers",
    category: "NLP",
    keywords: ["nlp", "language model", "transformer", "text", "llm", "bert", "gpt"],
  },
  {
    name: "LangChain",
    description: "Framework for building LLM-powered applications.",
    url: "https://www.langchain.com",
    category: "LLM Tooling",
    keywords: ["llm", "language model", "agent", "rag", "prompt", "generative"],
  },
  {
    name: "OpenCV",
    description: "Computer vision and image processing library.",
    url: "https://opencv.org",
    category: "Computer Vision",
    keywords: ["computer vision", "image", "video", "object detection", "cv"],
  },
  {
    name: "Weights & Biases",
    description: "Experiment tracking and model monitoring.",
    url: "https://wandb.ai",
    category: "MLOps",
    keywords: ["experiment", "tracking", "mlops", "training", "monitoring"],
  },
  {
    name: "NetworkX",
    description: "Python library for graph and network analysis.",
    url: "https://networkx.org",
    category: "Graph Analysis",
    keywords: ["graph", "network", "social network", "topology"],
  },
  {
    name: "SciPy",
    description: "Scientific computing library for Python.",
    url: "https://scipy.org",
    category: "Scientific Computing",
    keywords: ["statistics", "signal processing", "optimization", "scientific"],
  },
  {
    name: "R / Tidyverse",
    description: "Statistical computing and data analysis toolkit.",
    url: "https://www.tidyverse.org",
    category: "Statistics",
    keywords: ["statistics", "biostatistics", "epidemiology", "survey", "social science"],
  },
  {
    name: "Biopython",
    description: "Tools for biological computation and bioinformatics.",
    url: "https://biopython.org",
    category: "Bioinformatics",
    keywords: ["biology", "genomics", "bioinformatics", "protein", "dna", "medical"],
  },
  {
    name: "Qiskit",
    description: "Framework for quantum computing research.",
    url: "https://www.ibm.com/quantum/qiskit",
    category: "Quantum Computing",
    keywords: ["quantum", "qubit", "quantum computing"],
  },
  {
    name: "Ray",
    description: "Distributed computing framework for scaling ML workloads.",
    url: "https://www.ray.io",
    category: "Distributed Computing",
    keywords: ["distributed", "scale", "large-scale", "cluster", "parallel"],
  },
  {
    name: "Docker",
    description: "Containerization for reproducible research environments.",
    url: "https://www.docker.com",
    category: "Infrastructure",
    keywords: ["reproducibility", "deployment", "container", "infrastructure"],
  },
  {
    name: "Jupyter",
    description: "Interactive notebooks for exploratory research.",
    url: "https://jupyter.org",
    category: "General",
    keywords: [],
  },
  {
    name: "Zotero",
    description: "Reference and citation management tool.",
    url: "https://www.zotero.org",
    category: "General",
    keywords: [],
  },
];

function buildKeywordText(topic) {
  if (!topic) return "";
  const name = topic.topicName ?? topic.topic ?? topic.title ?? "";
  const keywords = Array.isArray(topic.keywords) ? topic.keywords : [];
  const rationale = topic.rationale ?? "";
  return `${name} ${rationale} ${keywords.join(" ")}`.toLowerCase();
}

function rankTools(topic, limit = 8) {
  const text = buildKeywordText(topic);

  const matched = TOOL_CATALOG.filter((tool) =>
    tool.keywords.some((kw) => text.includes(kw)),
  );

  const generalTools = TOOL_CATALOG.filter(
    (tool) => tool.keywords.length === 0,
  );

  const combined = [...matched, ...generalTools];
  const seen = new Set();
  const deduped = [];
  for (const tool of combined) {
    if (seen.has(tool.name)) continue;
    seen.add(tool.name);
    deduped.push(tool);
  }

  if (deduped.length < limit) {
    for (const tool of TOOL_CATALOG) {
      if (deduped.length >= limit) break;
      if (seen.has(tool.name)) continue;
      seen.add(tool.name);
      deduped.push(tool);
    }
  }

  return deduped.slice(0, limit);
}

function ToolCard({ tool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="w-full border border-border hover:border-primary/40 transition-colors h-full">
        <CardContent className="pt-5 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-md bg-primary/10 shrink-0">
              <Boxes className="w-4 h-4 text-primary" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
              {tool.category}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {tool.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {tool.description}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary pt-1">
            <ExternalLink className="w-3 h-3" />
            Official Website
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function ToolsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-5 flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ToolsSection({
  topic = null,
  loading = false,
  error = null,
  limit = 8,
}) {
  if (loading) return <ToolsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load tools
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const tools = rankTools(topic, limit);

  if (!tools.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Wrench className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No tools available for this topic yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{tools.length}</span>{" "}
        recommended tool{tools.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
    </div>
  );
}