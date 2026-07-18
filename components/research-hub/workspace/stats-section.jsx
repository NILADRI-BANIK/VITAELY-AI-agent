import {
  FileText,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  Percent,
  Sparkles,
  Gauge,
  Swords,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatTile({ icon: Icon, label, value, hint }) {
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
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  );
}

function ScoreRow({ icon: Icon, label, value, colorClass }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {label}
      </div>
      <div className="flex items-center gap-2 w-1/2">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
          {value}
        </span>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StatsSection({ stats, topic, loading, error }) {
  if (loading) return <StatsSkeleton />;

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-sm font-medium text-destructive">
            {typeof error === "string" ? error : "Failed to load statistics."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPapers = stats?.totalPapers ?? null;
  const papersThisYear = stats?.papersThisYear ?? null;
  const currentYear = stats?.currentYear ?? new Date().getFullYear();
  const avgCitationVelocity = stats?.avgCitationVelocity ?? null;
  const openAccessPercentage = stats?.openAccessPercentage ?? null;

  const trendScore = topic?.trendScore ?? null;
  const noveltyScore = topic?.noveltyScore ?? null;
  const feasibilityScore = topic?.feasibilityScore ?? null;
  const competitionLevel = topic?.competitionLevel ?? null;

  const TrendIcon =
    trendScore == null
      ? Minus
      : trendScore >= 60
        ? TrendingUp
        : trendScore <= 35
          ? TrendingDown
          : Minus;

  const hasScores =
    trendScore != null || noveltyScore != null || feasibilityScore != null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={FileText}
          label="Total Papers"
          value={totalPapers != null ? totalPapers.toLocaleString() : "—"}
        />
        <StatTile
          icon={CalendarDays}
          label={`Papers in ${currentYear}`}
          value={papersThisYear != null ? papersThisYear.toLocaleString() : "—"}
        />
        <StatTile
          icon={BarChart3}
          label="Avg Citation Velocity"
          value={
            avgCitationVelocity != null
              ? Math.round(avgCitationVelocity).toLocaleString()
              : "—"
          }
          hint={avgCitationVelocity != null ? "citations / year" : null}
        />
        <StatTile
          icon={Percent}
          label="Open Access"
          value={
            openAccessPercentage != null
              ? `${Math.round(openAccessPercentage)}%`
              : "—"
          }
        />
      </div>

      {(hasScores || competitionLevel) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              Research Viability
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <ScoreRow
              icon={TrendIcon}
              label="Trend Score"
              value={trendScore}
              colorClass="bg-blue-500"
            />
            <ScoreRow
              icon={Sparkles}
              label="Novelty Score"
              value={noveltyScore}
              colorClass="bg-green-500"
            />
            <ScoreRow
              icon={Gauge}
              label="Feasibility Score"
              value={feasibilityScore}
              colorClass="bg-yellow-500"
            />
            {competitionLevel && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Swords className="w-4 h-4 text-muted-foreground" />
                  Competition Level
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">
                  {competitionLevel}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {totalPapers == null &&
        papersThisYear == null &&
        avgCitationVelocity == null &&
        openAccessPercentage == null &&
        !hasScores &&
        !competitionLevel && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-sm text-muted-foreground">
                No statistics available for this topic yet.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
