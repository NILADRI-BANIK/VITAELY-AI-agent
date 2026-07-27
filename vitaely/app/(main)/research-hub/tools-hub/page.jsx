"use client";

import { Wrench } from "lucide-react";
import ToolsGrid from "@/components/research-hub/tools-grid";

const TOOLS = [
  {
    id: "elicit",
    name: "Elicit",
    description:
      "AI research assistant that finds papers, extracts key data, and summarizes findings across studies.",
    url: "https://elicit.com",
    category: "Literature Search",
    tags: ["papers", "summarization", "extraction"],
    free: true,
    badge: "Popular",
  },
  {
    id: "scite",
    name: "scite.ai",
    description:
      "Shows how papers have been cited, including whether citations support or contrast findings.",
    url: "https://scite.ai",
    category: "Literature Search",
    tags: ["citations", "verification"],
    free: false,
  },
  {
    id: "connected-papers",
    name: "Connected Papers",
    description:
      "Visual graph tool to explore academic papers relevant to your research field.",
    url: "https://www.connectedpapers.com",
    category: "Literature Search",
    tags: ["visualization", "discovery"],
    free: true,
  },
  {
    id: "semantic-scholar",
    name: "Semantic Scholar",
    description:
      "AI-powered academic search engine with citation graphs and influential paper detection.",
    url: "https://www.semanticscholar.org",
    category: "Literature Search",
    tags: ["search", "citations"],
    free: true,
  },
  {
    id: "consensus",
    name: "Consensus",
    description:
      "AI search engine that extracts and synthesizes findings directly from research papers.",
    url: "https://consensus.app",
    category: "Literature Search",
    tags: ["synthesis", "evidence"],
    free: true,
  },
  {
    id: "zotero",
    name: "Zotero",
    description:
      "Free reference manager to collect, organize, cite, and share research sources.",
    url: "https://www.zotero.org",
    category: "Citation & Reference",
    tags: ["citations", "bibliography"],
    free: true,
  },
  {
    id: "mendeley",
    name: "Mendeley",
    description:
      "Reference manager and academic social network for organizing research and collaboration.",
    url: "https://www.mendeley.com",
    category: "Citation & Reference",
    tags: ["citations", "collaboration"],
    free: true,
  },
  {
    id: "grammarly",
    name: "Grammarly",
    description:
      "AI writing assistant for grammar, clarity, and tone, with an academic writing mode.",
    url: "https://www.grammarly.com",
    category: "Writing & Editing",
    tags: ["grammar", "editing"],
    free: true,
  },
  {
    id: "quillbot",
    name: "QuillBot",
    description:
      "AI paraphrasing and grammar tool with a dedicated academic summarizer.",
    url: "https://quillbot.com",
    category: "Writing & Editing",
    tags: ["paraphrasing", "summarizer"],
    free: true,
  },
  {
    id: "overleaf",
    name: "Overleaf",
    description:
      "Online collaborative LaTeX editor for writing and formatting academic papers.",
    url: "https://www.overleaf.com",
    category: "Writing & Editing",
    tags: ["latex", "collaboration"],
    free: true,
  },
  {
    id: "researchgate",
    name: "ResearchGate",
    description:
      "Academic social network for sharing papers, asking questions, and finding collaborators.",
    url: "https://www.researchgate.net",
    category: "Collaboration & Networking",
    tags: ["networking", "sharing"],
    free: true,
  },
  {
    id: "academia-edu",
    name: "Academia.edu",
    description:
      "Platform for sharing research papers and tracking readership analytics.",
    url: "https://www.academia.edu",
    category: "Collaboration & Networking",
    tags: ["sharing", "analytics"],
    free: true,
  },
  {
    id: "google-scholar",
    name: "Google Scholar",
    description:
      "Free search engine for scholarly literature across disciplines and sources.",
    url: "https://scholar.google.com",
    category: "Literature Search",
    tags: ["search", "citations"],
    free: true,
    badge: "Essential",
  },
  {
    id: "scispace",
    name: "SciSpace (Typeset)",
    description:
      "AI research workspace for paper formatting, literature review, and Q&A on PDFs.",
    url: "https://typeset.io",
    category: "Writing & Editing",
    tags: ["formatting", "qa"],
    free: false,
  },
  {
    id: "kaggle",
    name: "Kaggle",
    description:
      "Platform for datasets, notebooks, and competitions for data science research.",
    url: "https://www.kaggle.com",
    category: "Data & Datasets",
    tags: ["datasets", "notebooks"],
    free: true,
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description:
      "Hub for datasets, models, and spaces for machine learning research.",
    url: "https://huggingface.co",
    category: "Data & Datasets",
    tags: ["datasets", "models"],
    free: true,
  },
  {
    id: "colab",
    name: "Google Colab",
    description:
      "Free cloud-based Jupyter notebook environment with GPU access for research computation.",
    url: "https://colab.research.google.com",
    category: "Data & Datasets",
    tags: ["notebooks", "compute"],
    free: true,
  },
  {
    id: "miro",
    name: "Miro",
    description:
      "Collaborative whiteboard for mapping out research plans, literature maps, and methodologies.",
    url: "https://miro.com",
    category: "Planning & Organization",
    tags: ["whiteboard", "planning"],
    free: true,
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "All-in-one workspace for organizing research notes, references, and project timelines.",
    url: "https://www.notion.so",
    category: "Planning & Organization",
    tags: ["notes", "organization"],
    free: true,
  },
  {
    id: "trello",
    name: "Trello",
    description:
      "Kanban-style board for tracking research tasks, milestones, and deadlines.",
    url: "https://trello.com",
    category: "Planning & Organization",
    tags: ["tasks", "kanban"],
    free: true,
  },
];

export default function ToolsHubPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 mb-4">
          <Wrench className="w-7 h-7 text-cyan-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">AI Research Tools Hub</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A curated directory of AI-powered tools for literature search,
          writing, citation management, and research planning.
        </p>
      </div>

      <ToolsGrid tools={TOOLS} loading={false} error={null} />
    </div>
  );
}
