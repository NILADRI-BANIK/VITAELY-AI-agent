"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  FolderOpen,
  Copy,
  Check,
  Loader2,
  GitBranch,
  GitCommit,
  FileText,
  Shield,
  RotateCcw,
} from "lucide-react";
import { generateGithubStructureGuideAction } from "@/actions/project-generator";

// ─── Copy Button ───────────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-7 text-xs gap-1"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title }) => (
  <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
    <Icon className="w-3.5 h-3.5 text-primary" />
    {title}
  </p>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GithubStructureGuide({ project }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── handleGenerate ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!project?.id || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateGithubStructureGuideAction(project.id);
      if (result.success && result.data) {
        setGuide(result.data);
      } else {
        setError(result.error || "Failed to generate GitHub structure guide");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl bg-card p-5 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold">GitHub Structure Guide</h2>
            {project?.title && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {project.title}
              </p>
            )}
          </div>
        </div>
        {guide && (
          <Badge variant="secondary" className="text-xs">
            Generated
          </Badge>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* ── Generate Button ── */}
      {!guide && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading || !project?.id}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          {loading
            ? "Generating GitHub Structure..."
            : "Generate GitHub Structure"}
        </Button>
      )}

      {/* ── Guide Content ── */}
      {guide && (
        <div className="space-y-5">
          {/* ── Folder Structure ── */}
          {guide.folderStructure && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <SectionHeader icon={FolderOpen} title="Folder Structure" />
                <CopyButton text={guide.folderStructure} />
              </div>
              <pre className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 overflow-x-auto whitespace-pre font-mono leading-relaxed">
                {guide.folderStructure}
              </pre>
            </div>
          )}

          {/* ── .gitignore Entries ── */}
          {guide.gitignoreEntries?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Shield} title=".gitignore Entries" />
                <CopyButton text={guide.gitignoreEntries.join("\n")} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {guide.gitignoreEntries.map((entry) => (
                  <span
                    key={entry}
                    className="text-xs font-mono bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-md"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Branch Strategy ── */}
          {guide.branches?.length > 0 && (
            <div className="space-y-2">
              <SectionHeader icon={GitBranch} title="Branch Strategy" />
              <div className="space-y-1.5">
                {guide.branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-start gap-3 border rounded-lg px-3 py-2"
                  >
                    <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
                      {branch.name}
                    </code>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {branch.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Commit Conventions ── */}
          {guide.commitConventions?.length > 0 && (
            <div className="space-y-2">
              <SectionHeader icon={GitCommit} title="Commit Conventions" />
              <div className="space-y-1">
                {guide.commitConventions.map((convention) => (
                  <p
                    key={convention}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span className="text-primary mt-0.5 shrink-0">›</span>
                    <code className="font-mono">{convention}</code>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ── Recommended Files ── */}
          {guide.recommendedFiles?.length > 0 && (
            <div className="space-y-2">
              <SectionHeader icon={FileText} title="Recommended Files" />
              <div className="space-y-1.5">
                {guide.recommendedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-start gap-3 bg-muted/30 rounded-lg px-3 py-2"
                  >
                    <code className="text-xs font-mono text-primary shrink-0">
                      {file.name}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      {file.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Regenerate ── */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
            {loading ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      )}
    </div>
  );
}
