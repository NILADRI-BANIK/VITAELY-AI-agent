import Link from "next/link";
import {
  FileText,
  Youtube,
  Database,
  BookOpen,
  ExternalLink,
  TrendingUp,
  Users,
  Percent,
  CalendarDays,
  Network,
  Search,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, icon: Icon, viewAllHref, children, empty }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {empty}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function PaperPreviewRow({ paper }) {
  return (
    <a
      href={paper.url || paper.paperUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0 group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {paper.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {Array.isArray(paper.authors)
            ? paper.authors.slice(0, 2).join(", ")
            : ""}
          {paper.authors?.length > 2 ? " et al." : ""}
          {paper.year ? ` • ${paper.year}` : ""}
          {paper.source ? ` • ${paper.source}` : ""}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
    </a>
  );
}

function VideoPreviewRow({ video }) {
  return (
    <a
      href={video.url || video.videoUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 group"
    >
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-20 h-12 object-cover rounded-md shrink-0"
        />
      ) : (
        <div className="w-20 h-12 rounded-md bg-muted shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {video.channelName}
          {video.duration ? ` • ${video.duration}` : ""}
        </p>
      </div>
    </a>
  );
}

function DatasetPreviewRow({ dataset }) {
  return (
    <a
      href={dataset.url || dataset.datasetUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0 group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
          {dataset.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dataset.source}
          {dataset.license ? ` • ${dataset.license}` : ""}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </a>
  );
}

function SimilarTopicChip({ topic }) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
      {topic.name}
    </span>
  );
}

function ShortcutButton({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="flex-1 min-w-[160px]">
      <Button variant="outline" className="w-full justify-start" size="sm">
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </Button>
    </Link>
  );
}

export default async function TopicWorkspacePage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="pt-10 pb-10 text-center">
          <p className="text-sm font-medium text-destructive">
            {result.error || "Failed to load workspace data"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = result.data;
  const papers = data?.papers?.papers ?? [];
  const videos = data?.videos ?? [];
  const datasets = data?.datasets ?? [];
  const similarTopics = data?.similarTopics ?? [];
  const stats = data?.stats ?? {};

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FileText}
          label="Total Papers"
          value={
            stats.totalPapers != null ? stats.totalPapers.toLocaleString() : "—"
          }
        />
        <StatCard
          icon={CalendarDays}
          label="Papers This Year"
          value={
            stats.papersThisYear != null
              ? stats.papersThisYear.toLocaleString()
              : "—"
          }
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Citation Velocity"
          value={
            stats.avgCitationVelocity != null
              ? Math.round(stats.avgCitationVelocity).toLocaleString()
              : "—"
          }
        />
        <StatCard
          icon={Percent}
          label="Open Access"
          value={
            stats.openAccessPercentage != null
              ? `${Math.round(stats.openAccessPercentage)}%`
              : "—"
          }
        />
      </div>

      <SectionCard
        title="Research Papers"
        icon={FileText}
        viewAllHref={`/research-hub/topic-recommender/${topicId}/papers`}
        empty={
          papers.length === 0 ? "No papers found for this topic yet." : null
        }
      >
        {papers.slice(0, 5).map((paper, i) => (
          <PaperPreviewRow key={paper.id ?? paper.doi ?? i} paper={paper} />
        ))}
      </SectionCard>

      <SectionCard
        title="YouTube Learning Videos"
        icon={Youtube}
        viewAllHref={`/research-hub/topic-recommender/${topicId}/videos`}
        empty={
          videos.length === 0 ? "No videos found for this topic yet." : null
        }
      >
        {videos.slice(0, 3).map((video, i) => (
          <VideoPreviewRow key={video.videoId ?? i} video={video} />
        ))}
      </SectionCard>

      <SectionCard
        title="Available Datasets"
        icon={Database}
        viewAllHref={`/research-hub/topic-recommender/${topicId}/datasets`}
        empty={
          datasets.length === 0
            ? "No public datasets found for this topic."
            : null
        }
      >
        {datasets.slice(0, 5).map((dataset, i) => (
          <DatasetPreviewRow key={dataset.id ?? i} dataset={dataset} />
        ))}
      </SectionCard>

      <SectionCard
        title="Trending Similar Topics"
        icon={Network}
        viewAllHref={`/research-hub/topic-recommender/${topicId}/similar`}
        empty={
          similarTopics.length === 0 ? "No similar topics found yet." : null
        }
      >
        <div className="flex flex-wrap gap-2">
          {similarTopics.slice(0, 8).map((topic, i) => (
            <SimilarTopicChip key={topic.id ?? i} topic={topic} />
          ))}
        </div>
      </SectionCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Continue Your Research
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ShortcutButton
            href={`/research-hub/gap-finder?topicId=${topicId}`}
            icon={Search}
            label="Analyze Research Gaps"
          />
          <ShortcutButton
            href={`/research-hub/methodology-builder?topicId=${topicId}`}
            icon={Wrench}
            label="Generate Methodology"
          />
          <ShortcutButton
            href={`/research-hub/literature-review?topicId=${topicId}`}
            icon={BookOpen}
            label="Generate Literature Review"
          />
          <ShortcutButton
            href={`/research-hub/roadmap-generator?topicId=${topicId}`}
            icon={Users}
            label="Generate Research Roadmap"
          />
        </CardContent>
      </Card>
    </div>
  );
}
