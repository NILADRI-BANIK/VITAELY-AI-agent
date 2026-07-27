"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Tag,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Clock,
  Eye,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Score Ring ────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "Average" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Background ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/20"
          />
          {/* Score ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-black"
            style={{ color, fontFamily: "'Georgia', serif" }}
          >
            {score}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            / 100
          </span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${color}18`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Keyword Badge ─────────────────────────────────────────────────────
function KeywordBadge({ word, type }) {
  const styles =
    type === "found"
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : "bg-red-500/10 text-red-500 border-red-500/20";
  return (
    <span
      className={`text-xs px-2 py-1 rounded-md border font-medium ${styles}`}
    >
      {type === "missing" && "− "}
      {type === "found" && "+ "}
      {word}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function ATSScorePage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch("/api/ats/history");
      const data = await res.json();
      if (res.ok) setHistory(data.records || []);
    } catch (err) {
      console.error("Failed to fetch ATS history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (selected) => {
    setErrorMsg("");
    setResult(null);
    setStatus("idle");
    if (!selected) return;

    const name = selected.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setErrorMsg("Only PDF or DOCX files are supported.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg("File must be under 5MB.");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus("analyzing");
    setErrorMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (jobDescription.trim()) {
      formData.append("jobDescription", jobDescription.trim());
    }

    try {
      const res = await fetch("/api/resume/analyze-ats", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      setStatus("done");
      toast.success("ATS analysis complete!");
      fetchHistory();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Analysis failed");
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isAnalyzing = status === "analyzing";
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getScoreColor = (score) =>
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const getScoreLabel = (score) =>
    score >= 75 ? "Excellent" : score >= 50 ? "Average" : "Needs Work";

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <BarChart3 className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">ATS Score Checker</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Upload your resume and get an instant AI-powered ATS compatibility
          score with detailed feedback and improvement tips.
        </p>
      </div>

      {/* ── Upload + Job Description ── */}
      {status !== "done" && (
        <Card className="mb-6 border-2">
          <CardContent className="pt-6 space-y-5">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
                ${
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-muted-foreground/25"
                }
                ${!file ? "cursor-pointer hover:border-primary hover:bg-primary/5" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              {!file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF or DOCX — max 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-[300px]">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {/* Job Description (optional) */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Job Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional — improves accuracy)
                </span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get a more accurate ATS score and tailored keyword suggestions..."
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze ATS Score
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Results ── */}
      {status === "done" && result && (
        <div className="space-y-5">
          {/* Score + Feedback Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Score Ring Card */}
            <Card className="border-2 flex items-center justify-center py-8">
              <ScoreRing score={result.atsScore} />
            </Card>

            {/* Feedback Card */}
            <Card className="border-2 md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">
                    Overall Feedback
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.feedback}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Keywords Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Found Keywords */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-sm">Keywords Found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords?.map((kw, i) => (
                    <KeywordBadge key={i} word={kw} type="found" />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-sm">
                    Missing Keywords
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords?.map((kw, i) => (
                    <KeywordBadge key={i} word={kw} type="missing" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-sm">
                  Improvement Suggestions
                </span>
              </div>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analyze Another Button */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Analyze Another Resume
          </Button>
        </div>
      )}
      {/* ── ATS History Section ── */}
      <div className="mt-10 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent ATS Checks</h2>
        </div>

        {isLoadingHistory ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No ATS checks yet</p>
              <p className="text-xs text-muted-foreground">
                Upload a resume above to get your first ATS score.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((record) => {
              const color = getScoreColor(record.atsScore);
              const label = getScoreLabel(record.atsScore);
              return (
                <Card
                  key={record.id}
                  className="border-2 hover:border-primary/40 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleViewRecord(record)}
                >
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {record.resumeTitle || "Untitled Resume"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {formatDate(record.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p
                            className="text-lg font-black"
                            style={{ color }}
                          >
                            {record.atsScore}
                            <span className="text-xs font-normal text-muted-foreground">
                              /100
                            </span>
                          </p>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${color}18`,
                              color,
                              border: `1px solid ${color}40`,
                            }}
                          >
                            {label}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── History Detail Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4 text-primary" />
                  {selectedRecord.resumeTitle || "Untitled Resume"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(selectedRecord.createdAt)}
                </p>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Score */}
                <div className="flex justify-center py-4">
                  <ScoreRing score={selectedRecord.atsScore} />
                </div>

                {/* Feedback */}
                <Card className="border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Overall Feedback</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedRecord.feedback}
                    </p>
                  </CardContent>
                </Card>

                {/* Keywords Found */}
                {selectedRecord.keywords?.length > 0 && (
                  <Card className="border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold">Keywords Found</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecord.keywords.map((kw, i) => (
                          <KeywordBadge key={i} word={kw} type="found" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {selectedRecord.suggestions?.length > 0 && (
                  <Card className="border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold">Improvement Suggestions</span>
                      </div>
                      <div className="space-y-2">
                        {selectedRecord.suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/40"
                          >
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ChevronRight className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {s}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}