"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileCode2,
  Loader2,
  Globe,
  CheckCircle,
  FileText,
  Package,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPortfolioById } from "@/actions/portfolio";
import {
  downloadPortfolioZip,
  downloadPortfolioHTML,
} from "@/lib/portfolio/exportZip";

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ExportPage() {
  const router = useRouter();
  const params = useParams();
  const portfolioId = params?.id;

  const [portfolio, setPortfolio] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingHTML, setIsDownloadingHTML] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const timeoutRef = useRef(null);

  // ── Load portfolio ───────────────────────────
  useEffect(() => {
    if (!portfolioId) return;

    let mounted = true;

    const load = async () => {
      try {
        const data = await getPortfolioById(portfolioId);

        if (!mounted) return;

        if (!data) {
          toast.error("Portfolio not found.");
          router.push("/portfolio-generator");
          return;
        }

        if (!data.generatedData) {
          toast.error("Portfolio not generated yet. Please generate it first.");
          router.push(`/portfolio-generator/create?id=${portfolioId}`);
          return;
        }

        setPortfolio(data);
        setGeneratedData(data.generatedData);
      } catch (err) {
        console.error(err);
        if (mounted) {
          toast.error("Failed to load portfolio.");
          router.push("/portfolio-generator");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [portfolioId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Download ZIP ─────────────────────────────
  const handleDownloadZip = useCallback(async () => {
    if (!portfolio || !generatedData) return;

    setIsDownloading(true);

    try {
      await downloadPortfolioZip(portfolio, generatedData);

      setDownloadDone(true);
      toast.success("Portfolio ZIP downloaded!");

      timeoutRef.current = setTimeout(() => setDownloadDone(false), 4000);
    } catch (err) {
      console.error("ZIP download error:", err);
      toast.error("Failed to download ZIP. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [portfolio, generatedData]);

  // ── Download HTML only ───────────────────────
  const handleDownloadHTML = useCallback(async () => {
    if (!portfolio || !generatedData) return;

    setIsDownloadingHTML(true);

    try {
      downloadPortfolioHTML(portfolio, generatedData);
      toast.success("HTML file downloaded!");
    } catch (err) {
      console.error("HTML download error:", err);
      toast.error("Failed to download HTML.");
    } finally {
      setIsDownloadingHTML(false);
    }
  }, [portfolio, generatedData]);

  // ── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-6 max-w-3xl px-4">
      {/* ── Header ── */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-2"
          onClick={() =>
            router.push(`/portfolio-generator/preview/${portfolioId}`)
          }
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Preview
        </Button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Export Portfolio</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Download your complete portfolio as a ZIP file or standalone HTML.
            Ready to host anywhere.
          </p>
        </div>
      </div>

      {/* ── Portfolio Info ── */}
      <Card className="border-2 mb-6">
        <CardContent className="py-4 px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {portfolio?.title || "My Portfolio"}
              </p>
              <p className="text-sm text-muted-foreground">
                {portfolio?.fullName || ""}
                {portfolio?.professionalTitle
                  ? ` · ${portfolio.professionalTitle}`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {portfolio?.templateId || "modern"} template
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── What's included ── */}
      <Card className="border-2 mb-6">
        <CardContent className="pt-5 pb-5 px-6">
          <h3 className="text-sm font-semibold mb-3">
            What&apos;s included in the ZIP
          </h3>
          <div className="space-y-2">
            {[
              {
                icon: FileText,
                label: "index.html",
                desc: "Complete portfolio website — open in any browser",
              },
              {
                icon: FileCode2,
                label: "README.md",
                desc: "Instructions to run and host your portfolio",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40"
              >
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Download Options ── */}
      <div className="space-y-3 mb-8">
        {/* ZIP Download */}
        <Card
          className={`border-2 transition-all ${downloadDone ? "border-green-500" : "border-primary"}`}
        >
          <CardContent className="py-5 px-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Download ZIP</p>
                  <p className="text-xs text-muted-foreground">
                    HTML + README — ready to host
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDownloadZip}
                disabled={isDownloading || isDownloadingHTML}
                className="gap-2 min-w-32"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : downloadDone ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download ZIP
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HTML Only */}
        <Card className="border-2">
          <CardContent className="py-5 px-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Download HTML Only</p>
                  <p className="text-xs text-muted-foreground">
                    Single file — open directly in browser
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleDownloadHTML}
                disabled={isDownloading || isDownloadingHTML}
                className="gap-2 min-w-32"
              >
                {isDownloadingHTML ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <FileCode2 className="w-4 h-4" />
                    Download HTML
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-2 border-dashed">
          <CardContent className="py-5 px-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Preview Portfolio</p>
                  <p className="text-xs text-muted-foreground">
                    See how it looks before downloading
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`/portfolio-generator/preview/${portfolioId}`)
                }
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Hosting Tips ── */}
      <Card className="border-2 bg-muted/20">
        <CardContent className="py-5 px-6">
          <h3 className="text-sm font-semibold mb-3">
            🚀 Where to host your portfolio (free)
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              {
                name: "GitHub Pages",
                url: "https://pages.github.com",
                desc: "Free hosting from GitHub — upload index.html",
              },
              {
                name: "Netlify",
                url: "https://netlify.com",
                desc: "Drag & drop your ZIP — live in seconds",
              },
              {
                name: "Vercel",
                url: "https://vercel.com",
                desc: "Deploy with one click from GitHub",
              },
            ].map(({ name, url, desc }) => (
              <div key={name} className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-28">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {name}
                  </a>
                </span>
                <span>— {desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
