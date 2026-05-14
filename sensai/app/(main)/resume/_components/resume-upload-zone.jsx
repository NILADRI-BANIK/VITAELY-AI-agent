"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Loader2,
  X,
  CloudUpload,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResumeUploadZone({ onParsed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // ── Send file to /api/parse-resume and return parsed data ──────
  const processFile = useCallback(
    async (file) => {
      setError(null);

      // ── Client-side validation before hitting the API ──────────
      if (!file) return;

      const isPDF =
        file.type === "application/pdf" ||
        file.name?.toLowerCase().endsWith(".pdf");

      if (!isPDF) {
        setError("Only PDF files are supported.");
        toast.error("Only PDF files are supported.");
        return;
      }

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        setError("File size must be less than 10MB.");
        toast.error("File size must be less than 10MB.");
        return;
      }

      setUploadedFileName(file.name);
      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          // ← Use error message from API if available
          throw new Error(result.error || "Failed to parse resume.");
        }

        if (!result.success || !result.data) {
          throw new Error("Invalid response from server.");
        }

        // ── Pass parsed data up to resume-builder ─────────────────
        onParsed(result.data);
        toast.success("Resume imported! All fields have been filled.");
      } catch (err) {
        console.error("Resume parse error:", err);
        const message =
          err.message || "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
        setUploadedFileName(null);
      } finally {
        setIsProcessing(false);
        // ← Reset file input so same file can be re-uploaded if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onParsed],
  );

  // ── Drag events ────────────────────────────────────────────────
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // ← Only set false if leaving the drop zone entirely, not a child
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  // ── File input change ──────────────────────────────────────────
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  // ── Clear state ────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setUploadedFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-3">
      {/* Section heading */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Import Existing Resume</h3>
        {uploadedFileName && !isProcessing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground h-7 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          border-2 border-dashed rounded-lg
          p-8 cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
          }
          ${isProcessing ? "cursor-not-allowed opacity-70" : ""}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        {/* Content inside drop zone */}
        {isProcessing ? (
          // ── Processing state ─────────────────────────────────────
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div>
              <p className="text-sm font-medium">Parsing your resume...</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI is extracting your information
              </p>
            </div>
          </div>
        ) : uploadedFileName ? (
          // ── Success state ─────────────────────────────────────────
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">
                Successfully imported!
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                {uploadedFileName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to upload a different file
              </p>
            </div>
          </div>
        ) : (
          // ── Default / drag state ──────────────────────────────────
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                transition-colors duration-200
                ${isDragging ? "bg-primary/10" : "bg-muted"}
              `}
            >
              <CloudUpload
                className={`h-6 w-6 transition-colors duration-200 ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging
                  ? "Drop your resume here"
                  : "Drag & drop your resume"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF only · Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Helper text */}
      {!error && !uploadedFileName && (
        <p className="text-xs text-muted-foreground">
          Upload your existing resume PDF and AI will automatically fill all
          form fields for you.
        </p>
      )}
    </div>
  );
}
