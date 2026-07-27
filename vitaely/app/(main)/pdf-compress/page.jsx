"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
  FileArchive,
  TrendingDown,
  Clock,
  Trash2,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLastCompressionRecords } from "@/actions/compress";

// ── Format bytes ──────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Format date ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, highlight }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-xl border-2 gap-1"
      style={{
        borderColor: highlight ? `${highlight}40` : undefined,
        backgroundColor: highlight ? `${highlight}08` : undefined,
      }}
    >
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span
        className="text-xl font-black"
        style={{ color: highlight || undefined }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}

// ── History Record Row ────────────────────────────────────────────────
function RecordRow({ record, onDownload }) {
  const saved = record.savedPercentage?.toFixed(1) || "0";
  const color =
    parseFloat(saved) >= 50
      ? "#22c55e"
      : parseFloat(saved) >= 25
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/40 hover:bg-muted/40 transition-all duration-200 group cursor-pointer"
      onClick={() => onDownload(record)}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{record.fileName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatBytes(record.originalSize)}
          </span>
          <span className="text-xs text-muted-foreground">→</span>
          <span className="text-xs font-medium text-green-600">
            {formatBytes(record.compressedSize)}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(record.createdAt)}
          </span>
        </div>
      </div>

      {/* Saved Badge */}
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        -{saved}%
      </span>

      {/* Download icon on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Download className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PdfCompressPage() {
  const [file, setFile] = useState(null);
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("KB");
  const [status, setStatus] = useState("idle"); // idle | compressing | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [sessionBlobs, setSessionBlobs] = useState({}); // store blobs by record index
  const fileInputRef = useRef(null);

  // ── Load history records ──────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res = await getLastCompressionRecords();
      if (res.success) setRecords(res.records);
    } catch {
      // silently fail
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ── File handling ─────────────────────────────────────────────────
  const handleFileSelect = (selected) => {
    setErrorMsg("");
    setResult(null);
    setStatus("idle");
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF files are supported.");
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setErrorMsg("File must be under 20MB.");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  // ── Target size in bytes ──────────────────────────────────────────
  const getTargetBytes = () => {
    const val = parseFloat(targetValue);
    if (!val || val <= 0) return null;
    return targetUnit === "KB"
      ? Math.round(val * 1024)
      : Math.round(val * 1024 * 1024);
  };

  // ── Compress ──────────────────────────────────────────────────────
  const handleCompress = async () => {
    if (!file) return;

    const targetBytes = getTargetBytes();

    // Validate target size
    if (targetBytes !== null) {
      if (targetBytes >= file.size) {
        setErrorMsg(
          "Target size must be smaller than the original file size."
        );
        return;
      }
      if (targetBytes < 10 * 1024) {
        setErrorMsg("Target size must be at least 10 KB.");
        return;
      }
    }

    setStatus("compressing");
    setErrorMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (targetBytes) {
      formData.append("targetSize", targetBytes.toString());
    }

    try {
      const res = await fetch("/api/pdf-compress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Compression failed");
      }

      // Read stats from response headers
      const originalSize = parseInt(
        res.headers.get("x-original-size") || file.size
      );
      const compressedSize = parseInt(
        res.headers.get("x-compressed-size") || "0"
      );
      const savedPercent = parseFloat(
        res.headers.get("x-saved-percentage") || "0"
      );
      const achievedTarget = res.headers.get("x-achieved-target") === "true";

      // Store blob for download (DO NOT auto download)
      const blob = await res.blob();
      const outputName = file.name.replace(/\.pdf$/i, "_compressed.pdf");

      // Store blob in session memory with timestamp key
      const blobKey = `session_${Date.now()}`;
      setSessionBlobs((prev) => ({ ...prev, [blobKey]: blob }));

      setResult({
        blob,
        blobKey,
        outputName,
        originalSize,
        compressedSize: compressedSize || blob.size,
        savedPercent,
        targetBytes,
        achievedTarget,
      });
      setStatus("done");
      toast.success("Compression complete!");

      // Refresh records list
      await loadRecords();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Compression failed");
    }
  };

  // ── Download current result ───────────────────────────────────────
  const handleDownloadResult = () => {
    if (!result?.blob) return;
    triggerDownload(result.blob, result.outputName);
    toast.success("Downloading...");
  };

  // ── Download from history (session only) ─────────────────────────
  const handleRecordDownload = (record) => {
    // Check if we have blob in session memory
    const sessionKey = Object.keys(sessionBlobs).find((k) =>
      k.startsWith("session_")
    );
    if (sessionKey && sessionBlobs[sessionKey]) {
      const outputName = record.fileName.replace(/\.pdf$/i, "_compressed.pdf");
      triggerDownload(sessionBlobs[sessionKey], outputName);
      toast.success(`Downloading ${record.fileName}...`);
    } else {
      toast.info(
        "This file was compressed in a previous session. Please re-upload to download again."
      );
    }
  };

  // ── Trigger browser download ──────────────────────────────────────
  const triggerDownload = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ── Reset ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setFile(null);
    setTargetValue("");
    setTargetUnit("KB");
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isCompressing = status === "compressing";

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <FileArchive className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">PDF Compressor</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Upload your PDF, set a target size, and download the optimized file.
        </p>
      </div>

      {/* ── Upload + Target ── */}
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
                ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25"}
                ${!file ? "cursor-pointer hover:border-primary hover:bg-primary/5" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              {!file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your PDF here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF only — max 20MB
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
                      <p className="font-medium truncate max-w-[260px]">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Original size:{" "}
                        <span className="font-semibold text-foreground">
                          {formatBytes(file.size)}
                        </span>
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

            {/* Target Size Input */}
            {file && (
              <div>
                <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-primary" />
                  Target Size
                  <span className="text-muted-foreground font-normal text-xs">
                    (optional — leave empty for maximum compression)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={
                      targetUnit === "KB"
                        ? `e.g. ${Math.round(file.size / 1024 / 2)}`
                        : `e.g. ${(file.size / 1024 / 1024 / 2).toFixed(1)}`
                    }
                    min="10"
                    step="1"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <select
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
                {targetValue && getTargetBytes() && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Target:{" "}
                    <span className="font-medium text-primary">
                      {formatBytes(getTargetBytes())}
                    </span>
                    {" · "}
                    Reduction needed:{" "}
                    <span className="font-medium">
                      {Math.round(
                        ((file.size - getTargetBytes()) / file.size) * 100
                      )}
                      %
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Compress Button */}
            <Button
              onClick={handleCompress}
              disabled={!file || isCompressing}
              className="w-full"
              size="lg"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compressing PDF...
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4 mr-2" />
                  Compress PDF
                  {targetValue && getTargetBytes() && (
                    <span className="ml-2 text-xs opacity-70">
                      → {targetValue} {targetUnit}
                    </span>
                  )}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Results ── */}
      {status === "done" && result && (
        <div className="space-y-5 mb-8">
          {/* Success / Warning Banner */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              result.targetBytes && !result.achievedTarget
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-green-500/10 border-green-500/20"
            }`}
          >
            {result.targetBytes && !result.achievedTarget ? (
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  result.targetBytes && !result.achievedTarget
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {result.targetBytes && !result.achievedTarget
                  ? "Compressed as much as possible"
                  : "Compression Complete!"}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.targetBytes && !result.achievedTarget
                  ? `Could not reach ${formatBytes(result.targetBytes)} — achieved ${formatBytes(result.compressedSize)} instead`
                  : result.outputName}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Original"
              value={formatBytes(result.originalSize)}
              sub="before"
            />
            <StatCard
              label="Compressed"
              value={formatBytes(result.compressedSize)}
              sub="after"
              highlight="#22c55e"
            />
            <StatCard
              label="Saved"
              value={`${result.savedPercent.toFixed(1)}%`}
              sub="reduced"
              highlight="#3b82f6"
            />
          </div>

          {/* Visual Bar */}
          <Card className="border-2">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span>Original size</span>
                <span>Compressed size</span>
              </div>
              <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-full rounded-full bg-red-400" />
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-green-500 transition-all duration-700"
                  style={{ width: `${100 - result.savedPercent}%` }}
                />
              </div>

              {/* Target marker */}
              {result.targetBytes && (
                <div className="relative h-2 mt-1">
                  <div
                    className="absolute top-0 w-0.5 h-3 bg-primary rounded-full"
                    style={{
                      left: `${(result.targetBytes / result.originalSize) * 100}%`,
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Compressed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-xs text-muted-foreground">Removed</span>
                </div>
                {result.targetBytes && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-0.5 h-3 bg-primary rounded-full" />
                    <span className="text-xs text-muted-foreground">Target</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-600">
                    {result.savedPercent.toFixed(1)}% smaller
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Button — Manual only */}
          <Button
            onClick={handleDownloadResult}
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Compressed PDF
            <span className="ml-2 text-xs opacity-70">
              ({formatBytes(result.compressedSize)})
            </span>
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Compress Another PDF
          </Button>
        </div>
      )}

      {/* ── History Records ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Recent Compressions</h2>
          <span className="text-xs text-muted-foreground ml-auto">
            Click a record to download
          </span>
        </div>

        {loadingRecords ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading history...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center border-2 border-dashed rounded-xl">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <FileArchive className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No compression history yet.
              <br />
              Compress your first PDF above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                onDownload={handleRecordDownload}
              />
            ))}
            <p className="text-xs text-muted-foreground text-center pt-2">
              ℹ️ Files from previous sessions must be re-uploaded to download again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}