"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Edit,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Share2,
  FileCode2,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPortfolioById } from "@/actions/portfolio";
import { PORTFOLIO_TEMPLATES } from "@/components/portfolio/templates/index";

const VIEWPORTS = [
  {
    id: "desktop",
    label: "Desktop",
    icon: Monitor,
    width: "100%",
  },
  {
    id: "tablet",
    label: "Tablet",
    icon: Tablet,
    width: "768px",
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    width: "390px",
  },
];

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();

  const portfolioId = params?.id;

  const [portfolio, setPortfolio] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [viewport, setViewport] = useState("desktop");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // ─────────────────────────────────────────────
  // LOAD PORTFOLIO
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!portfolioId) return;

    let mounted = true;

    const loadPortfolio = async () => {
      try {
        const data = await getPortfolioById(portfolioId);

        if (!mounted) return;

        if (!data) {
          toast.error("Portfolio not found.");
          router.push("/portfolio-generator");
          return;
        }

        setPortfolio(data);
        setGeneratedData(data.generatedData || null);
      } catch (err) {
        console.error(err);

        if (mounted) {
          toast.error("Failed to load portfolio.");
          router.push("/portfolio-generator");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPortfolio();

    return () => {
      mounted = false;
    };
  }, [portfolioId, router]);

  // ─────────────────────────────────────────────
  // REGENERATE
  // ─────────────────────────────────────────────

  const handleRegenerate = async () => {
    if (!portfolio) return;

    setIsRegenerating(true);

    try {
      const formData = {
        fullName: portfolio.fullName,
        templateId: portfolio.templateId,
        professionalTitle: portfolio.professionalTitle,
        summary: portfolio.summary,

        email: portfolio.email,
        phone: portfolio.phone,

        linkedin: portfolio.linkedin,
        github: portfolio.github,
        twitter: portfolio.twitter,
        address: portfolio.address,
        codeforces: portfolio.codeforces,
        hackerrank: portfolio.hackerrank,
        leetcode: portfolio.leetcode,
        portfolioUrl: portfolio.portfolioUrl,

        skills: portfolio.skills,
        hobbies: portfolio.hobbies,

        experience: portfolio.experience,
        education: portfolio.education,

        projects: portfolio.projects,
        certifications: portfolio.certifications,
        achievements: portfolio.achievements,
      };

      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId,
          formData,
        }),
      });

      let result;

      try {
        result = await res.json();
      } catch {
        throw new Error("Invalid server response.");
      }

      if (!res.ok) {
        throw new Error(result?.error || "Regeneration failed.");
      }
      if (!result?.data || typeof result.data !== "object") {
        throw new Error("Invalid generated portfolio data.");
      }

      setGeneratedData(result.data);

      toast.success("Portfolio regenerated!");
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Failed to regenerate.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // NO GENERATED DATA
  // ─────────────────────────────────────────────

  if (!generatedData) {
    return (
      <div className="container mx-auto py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-muted-foreground" />
        </div>

        <h2 className="text-xl font-semibold mb-2">
          Portfolio Not Generated Yet
        </h2>

        <p className="text-muted-foreground mb-6">
          Go back and click &quot;Generate Portfolio&quot; to create your
          portfolio.
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/portfolio-generator")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>

          <Button
            onClick={() =>
              router.push(`/portfolio-generator/create?id=${portfolioId}`)
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit & Generate
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // TEMPLATE SELECTION
  // ─────────────────────────────────────────────

  const templateId = portfolio?.templateId || "modern";

  const TemplateComponent =
    PORTFOLIO_TEMPLATES[templateId] || PORTFOLIO_TEMPLATES["modern"];

  const currentViewport = VIEWPORTS.find((v) => v.id === viewport);

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/portfolio-generator")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold truncate max-w-xs">
                {portfolio?.fullName || "Portfolio Preview"}
              </p>

              <p className="text-xs text-muted-foreground capitalize">
                {templateId} template
              </p>
            </div>
          </div>

          {/* Center */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {VIEWPORTS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewport(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewport === id
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />

                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="gap-1.5"
            >
              {isRegenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}

              <span className="hidden sm:inline">Regenerate</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!portfolioId) return;

                router.push(`/portfolio-generator/create?id=${portfolioId}`);
              }}
              className="gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />

              <span className="hidden sm:inline">Edit</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (!portfolioId) return;

                router.push(`/portfolio-generator/export/${portfolioId}`);
              }}
              className="gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />

              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center overflow-x-auto">
          <div
            className="transition-all duration-300 bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              width: currentViewport?.width || "100%",
              maxWidth: "100%",
            }}
          >
            <TemplateComponent data={generatedData} />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="border-2 max-w-2xl mx-auto">
          <CardContent className="py-4 px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  {portfolio?.fullName || "Your Portfolio"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {portfolio?.professionalTitle || ""} · {templateId} template
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);

                      toast.success("Link copied!");
                    } catch (err) {
                      console.error(err);

                      toast.error("Failed to copy link.");
                    }
                  }}
                  className="gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    if (!portfolioId) return;

                    router.push(`/portfolio-generator/export/${portfolioId}`);
                  }}
                  className="gap-1.5"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  Download ZIP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
