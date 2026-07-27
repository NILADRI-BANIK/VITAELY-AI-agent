"use client";

import Link from "next/link";
import {
  BookOpen,
  Lightbulb,
  AlertCircle,
  FileText,
  BookMarked,
  Database,
  FlaskConical,
  Map,
  PenLine,
  Wrench,
  Quote,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    href: "/research-hub/domain-explorer",
    icon: BookOpen,
    title: "Domain Explorer",
    description: "Explore academic domains and subfields with publication stats.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    href: "/research-hub/topic-recommender",
    icon: Lightbulb,
    title: "Topic Recommender",
    description: "Get AI-recommended research topics based on your skills and interests.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    href: "/research-hub/gap-finder",
    icon: AlertCircle,
    title: "Gap Finder",
    description: "Discover research gaps and open problems worth pursuing.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    href: "/research-hub/paper-recommender",
    icon: FileText,
    title: "Paper Recommender",
    description: "Find the latest, most-cited, and open-access papers on any topic.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    href: "/research-hub/literature-review",
    icon: BookMarked,
    title: "Literature Review Assistant",
    description: "Generate a structured literature review from real papers.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    href: "/research-hub/dataset-center",
    icon: Database,
    title: "Dataset Discovery Center",
    description: "Search datasets across Kaggle, Hugging Face, and Zenodo.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    href: "/research-hub/methodology-builder",
    icon: FlaskConical,
    title: "Methodology Builder",
    description: "Build a rigorous research methodology tailored to your study.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    href: "/research-hub/roadmap-generator",
    icon: Map,
    title: "Roadmap Generator",
    description: "Generate a phased research roadmap with milestones and timelines.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    href: "/research-hub/writing-assistant",
    icon: PenLine,
    title: "Academic Writing Assistant",
    description: "Improve grammar, tone, and structure of your academic writing.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    href: "/research-hub/tools-hub",
    icon: Wrench,
    title: "AI Research Tools Hub",
    description: "Browse a curated directory of AI-powered research tools.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    href: "/research-hub/journal-finder",
    icon: Quote,
    title: "Journal & Conference Finder",
    description: "Find journals and conferences to submit and publish your work.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <Link href={feature.href} className="block h-full">
      <Card className="flex flex-col h-full border border-border hover:border-primary/40 transition-colors group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className={`p-2.5 rounded-md ${feature.bg} shrink-0`}>
              <Icon className={`w-5 h-5 ${feature.color}`} />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <CardTitle className="text-base font-semibold leading-snug mt-2">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ResearchHubPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Research Hub</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          An AI-powered academic research suite — explore domains, find gaps,
          recommend papers, build methodologies, and generate roadmaps, all in
          one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.href} feature={feature} />
        ))}
      </div>
    </div>
  );
}