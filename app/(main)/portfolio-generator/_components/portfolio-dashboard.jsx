"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  Loader2,
  Trash2,
  Eye,
  Copy,
  Calendar,
  MoreVertical,
  FileCode2,
  Sparkles,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePortfolio, duplicatePortfolio } from "@/actions/portfolio";

// ── Helpers ───────────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status) {
  const map = {
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-muted-foreground/20",
    },
    generated: {
      label: "Generated",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    published: {
      label: "Published",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
  };
  return map[status] || map.draft;
}

// ── Template Label ─────────────────────────────────────────────────────
function getTemplateLabel(templateId) {
  const map = {
    modern: "Modern",
    minimal: "Minimal",
    glassmorphism: "Glassmorphism",
    developer3d: "3D Developer",
    futuristic: "AI Futuristic",
    corporate: "Corporate",
    startup: "Startup Founder",
    cyberpunk: "Cyberpunk",
  };
  return map[templateId] || templateId;
}

// ── Portfolio Card ─────────────────────────────────────────────────────
function PortfolioCard({ portfolio, onDelete, onDuplicate }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const statusBadge = getStatusBadge(portfolio.status);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePortfolio(portfolio.id);
      toast.success("Portfolio deleted.");
      onDelete(portfolio.id);
    } catch (err) {
      toast.error(err.message || "Failed to delete portfolio.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const copy = await duplicatePortfolio(portfolio.id);
      toast.success("Portfolio duplicated.");
      onDuplicate(copy);
    } catch (err) {
      toast.error(err.message || "Failed to duplicate portfolio.");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <>
      <Card className="border-2 hover:border-primary/40 transition-all duration-200 group">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between gap-4">
            {/* Left — Icon + Info */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar / Profile Image */}
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {portfolio.profileImage ? (
                  <img
                    src={portfolio.profileImage}
                    alt={portfolio.fullName || "Portfolio"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Globe className="w-5 h-5 text-primary" />
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate">
                    {portfolio.title}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {portfolio.fullName || "No name set"} ·{" "}
                  {getTemplateLabel(portfolio.templateId)}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {formatDate(portfolio.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Preview — only if generated */}
              {portfolio.status === "generated" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() =>
                    router.push(`/portfolio-generator/preview/${portfolio.id}`)
                  }
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </Button>
              )}

              {/* Edit */}
              <Button
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() =>
                  router.push(`/portfolio-generator/create?id=${portfolio.id}`)
                }
              >
                <Sparkles className="w-3.5 h-3.5" />
                Edit
              </Button>

              {/* More Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={isDuplicating}
                  >
                    {isDuplicating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreVertical className="w-4 h-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>

                  {portfolio.status === "generated" && (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/portfolio-generator/export/${portfolio.id}`,
                        )
                      }
                    >
                      <FileCode2 className="w-4 h-4 mr-2" />
                      Export ZIP
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Portfolio</DialogTitle>
            <DialogDescription asChild>
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  &quot;{portfolio.title}&quot;
                </span>
                ? This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────
export default function PortfolioDashboard({ initialPortfolios }) {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState(initialPortfolios || []);

  const handleDelete = (deletedId) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleDuplicate = (newPortfolio) => {
    setPortfolios((prev) => [newPortfolio, ...prev]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Globe className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Portfolio Generator</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate stunning portfolio websites instantly using AI. Upload your
          resume or fill in your details to get started.
        </p>
      </div>

      {/* ── Create New Button ── */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => router.push("/portfolio-generator/create")}
          className="gap-2"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          Create New Portfolio
        </Button>
      </div>

      {/* ── Portfolio List ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Portfolios</h2>
          {portfolios.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {portfolios.length}
            </span>
          )}
        </div>

        {portfolios.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Globe className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No portfolios yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first AI-powered portfolio website in minutes.
                </p>
              </div>
              <Button
                onClick={() => router.push("/portfolio-generator/create")}
                className="gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Portfolio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
