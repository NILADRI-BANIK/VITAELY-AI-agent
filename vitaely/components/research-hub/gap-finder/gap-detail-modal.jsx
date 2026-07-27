"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  BookmarkCheck,
  Tag,
  FileText,
  Lightbulb,
  StickyNote,
  BarChart3,
  Loader2,
  Save,
  AlertCircle,
  TrendingUp,
  Copy,
  Check,
  Clock,
  Database,
} from "lucide-react";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";
import { ImpactScore } from "@/components/research-hub/gap-finder/impact-score";
import { SourcePapers } from "@/components/research-hub/gap-finder/source-papers";

const TYPE_CONFIG = {
  gap: { label: "Research Gap", icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
  open_problem: { label: "Open Problem", icon: Lightbulb, color: "text-purple-500", bg: "bg-purple-500/10" },
  trending: { label: "Trending Topic", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
};

function getTypeConfig(type) {
  return (
    TYPE_CONFIG[type?.toLowerCase()] ?? {
      label: type ?? "Research Gap",
      icon: AlertCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    }
  );
}

function MiniTimeline({ timeline = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No publication trend data available.
      </p>
    );
  }

  const maxCount = Math.max(...timeline.map((t) => t.count ?? 0), 1);

  return (
    <div className="flex items-end gap-1.5 h-24">
      {timeline.map((t) => (
        <div
          key={t.year}
          className="flex flex-col items-center gap-1 flex-1 min-w-0"
        >
          <div
            className="w-full bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
            style={{
              height: `${Math.max(4, (t.count / maxCount) * 64)}px`,
            }}
            title={`${t.year}: ${t.count} papers`}
          />
          <span className="text-[9px] text-muted-foreground">{t.year}</span>
        </div>
      ))}
    </div>
  );
}

function NotesEditor({ gap, notes, onSaveNotes, savingNotes }) {
  const [notesDraft, setNotesDraft] = useState(notes);
  const notesChanged = notesDraft !== notes;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <StickyNote className="w-3.5 h-3.5" />
        Personal Notes
      </span>
      <textarea
        value={notesDraft}
        onChange={(e) => setNotesDraft(e.target.value)}
        placeholder="Add your notes about this gap..."
        rows={4}
        maxLength={2000}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">
          {notesDraft.length}/2000
        </span>
        {onSaveNotes && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSaveNotes(gap, notesDraft)}
            disabled={!notesChanged || savingNotes}
          >
            {savingNotes ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save Notes
          </Button>
        )}
      </div>
    </div>
  );
}

export function GapDetailModal({
  gap,
  open,
  onOpenChange,
  isSaved = false,
  saving = false,
  onSave,
  timeline = [],
  timelineLoading = false,
  notes = "",
  onSaveNotes,
  savingNotes = false,
}) {
  const [copied, setCopied] = useState(false);

  if (!gap) return null;

  const gapKey = String(gap.id ?? gap.gapTitle ?? gap.gap ?? gap.title ?? "");

  const title = gap.gap ?? gap.title ?? gap.gapTitle ?? "Untitled Gap";
  const type = gap.type ?? null;
  const description = gap.description ?? gap.summary ?? null;
  const opportunity = gap.opportunity ?? gap.why ?? null;
  const keywords = Array.isArray(gap.keywords) ? gap.keywords : [];
  const domain = gap.domain ?? null;
  const difficulty = gap.difficulty ?? "medium";
  const impactScore = gap.impactScore ?? 0;
  const confidence = gap.confidence;
  const supportingPapers = Array.isArray(gap.supportingPapers)
    ? gap.supportingPapers
    : [];
  const paperCount = gap.totalPaperCount ?? null;
  const openAlexCount = gap.openAlexCount ?? null;
  const semanticCount = gap.semanticCount ?? null;
  const lastUpdated = gap.updatedAt ?? gap.createdAt ?? null;

  const config = getTypeConfig(type);
  const Icon = config.icon;

  async function handleCopyGap() {
    const text = [
      `Gap: ${title}`,
      description ? `Description: ${description}` : null,
      opportunity ? `Opportunity: ${opportunity}` : null,
      keywords.length > 0 ? `Keywords: ${keywords.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0">
              <DialogHeader className="px-6 pt-6 shrink-0">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-md ${config.bg} shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base leading-snug">
                {title}
              </DialogTitle>
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <DifficultyBadge difficulty={difficulty} />
                {domain && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {domain}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6">
          <div className="flex flex-col gap-5 py-4">
            <ImpactScore score={impactScore} confidence={confidence} />

            {description && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {opportunity && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Research Opportunity
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {opportunity}
                </p>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, i) => (
                    <span
                      key={`kw-${kw}-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Research Activity Timeline
              </span>
              <MiniTimeline timeline={timeline} loading={timelineLoading} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Supporting Papers
                {paperCount != null && (
                  <span className="normal-case font-normal">
                    ({paperCount.toLocaleString?.() ?? paperCount} total found)
                  </span>
                )}
              </span>
              {(openAlexCount != null || semanticCount != null) && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Database className="w-3 h-3" />
                  OpenAlex: {openAlexCount ?? 0} · Semantic Scholar: {semanticCount ?? 0}
                </span>
              )}
              {lastUpdated && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Last updated {new Date(lastUpdated).toLocaleDateString()}
                </span>
              )}
              <SourcePapers papers={supportingPapers} />
            </div>

            <NotesEditor
              key={gapKey}
              gap={gap}
              notes={notes}
              onSaveNotes={onSaveNotes}
              savingNotes={savingNotes}
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={handleCopyGap}>
            {copied ? (
              <Check className="w-4 h-4 mr-1.5 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 mr-1.5" />
            )}
            {copied ? "Copied" : "Copy Gap"}
          </Button>
          {onSave && (
            <Button
              variant={isSaved ? "outline" : "default"}
              onClick={() => onSave(gap)}
              disabled={saving || isSaved}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 mr-1.5" />
              ) : (
                <Bookmark className="w-4 h-4 mr-1.5" />
              )}
              {isSaved ? "Saved" : "Save Gap"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}