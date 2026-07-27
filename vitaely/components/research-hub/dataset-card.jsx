"use client";

import { useState, useRef, useEffect } from "react";
import {
  Database,
  Download,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  HardDrive,
  Tag,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── DatasetCardSkeleton ──────────────────────────────────────────────────────

function DatasetCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-3 w-5/6" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2 mt-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-16 rounded-full" />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── DatasetCard ──────────────────────────────────────────────────────────────

export default function DatasetCard({ dataset, onSave, savedIds }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);
  const id = dataset.id ?? dataset.doi ?? dataset.name ?? null;
  const isSaved =
    id && savedIds instanceof Set ? savedIds.has(String(id)) : false;

  const name = dataset.name ?? dataset.title ?? "Untitled Dataset";
  const description = dataset.description ?? dataset.summary ?? null;
  const source = dataset.source ?? dataset.platform ?? null;
  const size = dataset.size ?? dataset.fileSize ?? dataset.file_size ?? null;
  const format =
    dataset.format ?? dataset.fileFormat ?? dataset.file_format ?? null;
  const license = dataset.license ?? null;
  const downloadUrl =
    dataset.downloadUrl ??
    dataset.download_url ??
    dataset.downloadLink ??
    dataset.download_link ??
    null;
  const externalUrl =
    dataset.url ??
    dataset.homepage ??
    dataset.externalUrl ??
    dataset.external_url ??
    null;
  const tags = Array.isArray(dataset.tags) ? dataset.tags : [];
  const keywords = Array.isArray(dataset.keywords) ? dataset.keywords : [];
  const allTags = [...new Set([...tags, ...keywords])];
  const year =
    dataset.year ??
    (typeof dataset.createdAt === "string"
      ? dataset.createdAt.slice(0, 4)
      : null);
  const rowCount =
    dataset.rowCount ?? dataset.row_count ?? dataset.samples ?? null;
  const columnCount =
    dataset.columnCount ?? dataset.column_count ?? dataset.features ?? null;
  const author =
    dataset.author ??
    dataset.owner ??
    dataset.creator ??
    dataset.uploader ??
    null;
  const downloads =
    dataset.downloads ??
    dataset.downloadCount ??
    dataset.download_count ??
    null;
  const taskType = dataset.taskType ?? dataset.task ?? dataset.type ?? null;

  const sourceConfig = {
    kaggle: {
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    huggingface: {
      badge: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    zenodo: {
      badge: "bg-green-500/10 text-green-600 border-green-500/20",
    },
  };

  const sourceLower = source?.toLowerCase() ?? "";
  const badgeStyle =
    sourceConfig[sourceLower]?.badge ??
    "bg-primary/10 text-primary border-primary/20";

  const hasMore =
    allTags.length > 0 ||
    rowCount != null ||
    columnCount != null ||
    taskType != null ||
    license != null;

  async function handleCopy() {
    const text = [
      `Dataset: ${name}`,
      description ? `Description: ${description}` : null,
      source ? `Source: ${source}` : null,
      size ? `Size: ${size}` : null,
      format ? `Format: ${format}` : null,
      license ? `License: ${license}` : null,
      rowCount != null
        ? `Rows: ${typeof rowCount === "number" ? rowCount.toLocaleString() : rowCount}`
        : null,
      columnCount != null
        ? `Columns: ${typeof columnCount === "number" ? columnCount.toLocaleString() : columnCount}`
        : null,
      allTags.length > 0 ? `Tags: ${allTags.join(", ")}` : null,
      downloadUrl ? `Download: ${downloadUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Card className="flex flex-col h-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                {name}
              </CardTitle>
              {author && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Users className="w-3 h-3 shrink-0" />
                  <span className="truncate">{author}</span>
                </p>
              )}
            </div>
          </div>
          {source && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 capitalize ${badgeStyle}`}
            >
              {source}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-2">
          {size && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {size}
            </span>
          )}
          {format && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {format}
            </span>
          )}
          {year && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {year}
            </span>
          )}
          {downloads != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Download className="w-3 h-3" />
              {typeof downloads === "number"
                ? downloads.toLocaleString()
                : downloads}{" "}
              downloads
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {expanded && (
          <>
            <div className="flex flex-wrap gap-3">
              {rowCount != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Rows
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {typeof rowCount === "number" ? rowCount.toLocaleString() : rowCount}
                  </span>
                </div>
              )}
              {columnCount != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Columns
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {typeof columnCount === "number" ? columnCount.toLocaleString() : columnCount}
                  </span>
                </div>
              )}
              {taskType && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Task
                  </span>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {taskType}
                  </span>
                </div>
              )}
              {license && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    License
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {license}
                  </span>
                </div>
              )}
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2">
          {downloadUrl ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-3 h-3 mr-1" />
                Download
              </a>
            </Button>
          ) : externalUrl ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Dataset
              </a>
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              No Link Available
            </Button>
          )}

          {downloadUrl && externalUrl && (
            <Button size="sm" variant="outline" asChild className="px-2">
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}

          {hasMore && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded((p) => !p)}
              className="px-2"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="px-2"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          {onSave && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSave?.(dataset)}
              className="px-2"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { DatasetCardSkeleton };
