"use client";

import { useState } from "react";
import {
  FileText,
  Users,
  Calendar,
  Quote,
  ExternalLink,
  AlertCircle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ─── SourceBadges ─────────────────────────────────────────────────────────────

const SOURCE_LABELS = {
  openalex: "OpenAlex",
  "semantic-scholar": "Semantic Scholar",
  arxiv: "arXiv",
  crossref: "Crossref",
  core: "CORE",
};

function SourceBadges({ sources = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
          {SOURCE_LABELS[s] ?? s}
        </Badge>
      ))}
    </div>
  );
}

// ─── PaperCard ────────────────────────────────────────────────────────────────

function PaperCard({ paper }) {
  const [expanded, setExpanded] = useState(false);

  const authors = Array.isArray(paper.authors) ? paper.authors : [];
  const visibleAuthors = authors.slice(0, 3).join(", ");
  const extraAuthors = authors.length > 3 ? authors.length - 3 : 0;

  return (
    <Card className="flex flex-col h-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-semibold leading-snug line-clamp-3">
            {paper.title}
          </p>
        </div>

        {authors.length > 0 && (
          <div className="flex items-start gap-1.5 mt-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground line-clamp-1">
              {visibleAuthors}
              {extraAuthors > 0 && ` +${extraAuthors} more`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-2">
          {paper.year && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {paper.year}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Quote className="w-3 h-3" />
            {(paper.citationCount ?? 0).toLocaleString()} citations
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {paper.openAccess ? (
              <>
                <Unlock className="w-3 h-3" /> Open access
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Restricted
              </>
            )}
          </span>
        </div>

        {paper.journal && (
          <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
            {paper.journal}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {paper.abstract && (
          <div>
            <p
              className={`text-xs text-muted-foreground ${
                expanded ? "" : "line-clamp-3"
              }`}
            >
              {paper.abstract}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Read abstract
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <SourceBadges sources={paper.sources} />
          {paper.url && (
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── PaperGrid ────────────────────────────────────────────────────────────────

function PaperGrid({ papers, emptyMessage }) {
  if (!Array.isArray(papers) || papers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {papers.map((paper, i) => (
        <PaperCard key={`${paper.doi ?? paper.title}-${i}`} paper={paper} />
      ))}
    </div>
  );
}

// ─── TopicPapersSkeleton ────────────────────────────────────────────────────

function TopicPapersSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-3 w-1/2 mt-2" />
            <Skeleton className="h-3 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-full mt-2 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── TopicPapers ────────────────────────────────────────────────────────────

export default function TopicPapers({
  data = null,
  loading = false,
  error = null,
}) {
  if (loading) {
    return <TopicPapersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load papers
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!data || !Array.isArray(data.papers) || data.papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No papers found for this topic.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{data.topic}</h2>
        <span className="text-xs text-muted-foreground">
          {data.totalCount} papers found
        </span>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({data.papers.length})</TabsTrigger>
          <TabsTrigger value="latest">
            Latest ({data.latest?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="highlyCited">
            Highly Cited ({data.highlyCited?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="openAccess">
            Open Access ({data.openAccess?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="surveys">
            Surveys ({data.surveys?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <PaperGrid papers={data.papers} emptyMessage="No papers found." />
        </TabsContent>
        <TabsContent value="latest" className="mt-4">
          <PaperGrid
            papers={data.latest}
            emptyMessage="No recent papers found."
          />
        </TabsContent>
        <TabsContent value="highlyCited" className="mt-4">
          <PaperGrid
            papers={data.highlyCited}
            emptyMessage="No highly cited papers found."
          />
        </TabsContent>
        <TabsContent value="openAccess" className="mt-4">
          <PaperGrid
            papers={data.openAccess}
            emptyMessage="No open access papers found."
          />
        </TabsContent>
        <TabsContent value="surveys" className="mt-4">
          <PaperGrid
            papers={data.surveys}
            emptyMessage="No survey or review papers found."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}