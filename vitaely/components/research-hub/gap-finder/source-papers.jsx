import { FileText, ExternalLink, Quote } from "lucide-react";

export function SourcePapers({ papers = [] }) {
  if (!Array.isArray(papers) || papers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No supporting papers found.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {papers.map((paper, i) => (
        <a
          key={paper.paperId ?? i}
          href={paper.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2.5 rounded-lg border border-border p-3 hover:border-primary/40 transition-colors"
        >
          <div className="p-1.5 rounded-md bg-primary/10 shrink-0 mt-0.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
              {paper.title ?? "Untitled"}
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-muted-foreground">
              {Array.isArray(paper.authors) && paper.authors.length > 0 && (
                <span className="line-clamp-1">
                  {paper.authors.slice(0, 3).join(", ")}
                  {paper.authors.length > 3 ? " et al." : ""}
                </span>
              )}
              {paper.year && <span>{paper.year}</span>}
              {typeof paper.citationCount === "number" && (
                <span className="flex items-center gap-1">
                  <Quote className="w-3 h-3" />
                  {paper.citationCount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {paper.url && (
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
          )}
        </a>
      ))}
    </div>
  );
}