"use client";

import { useEffect, useRef, useState } from "react";
import { saveConversionRecord, getConversionHistory } from "@/actions/pdf-to-word";
import { FileText, Upload, Download, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import * as pdfjsLib from "pdfjs-dist";

export default function PdfToWordPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const fileInputRef = useRef(null);

  // Set worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }, []);

  // Load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const records = await getConversionHistory();
        setHistory(records);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setIsConverted(false);
      setError(null);
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setIsConverted(false);
      setError(null);
    } else {
      setError("Please drop a valid PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = content.items.map((item) => item.str).join(" ");
      pages.push(lines);
    }

    return pages;
  };

  const buildDocx = (pages, fileName) => {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        text: fileName.replace(".pdf", ""),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      })
    );

    pages.forEach((pageText, index) => {
      // Page label
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Page ${index + 1}`,
              bold: true,
              size: 22,
              color: "888888",
            }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      // Split into paragraphs by double space or newlines
      const paragraphs = pageText
        .split(/\s{3,}/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (paragraphs.length === 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: pageText.trim(), size: 24 })],
            spacing: { after: 200 },
          })
        );
      } else {
        paragraphs.forEach((para) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: para, size: 24 })],
              spacing: { after: 200 },
            })
          );
        });
      }
    });

    return new Document({
      sections: [{ properties: {}, children }],
    });
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);

    try {
      // Extract text
      const pages = await extractTextFromPdf(file);

      // Build docx
      const doc = buildDocx(pages, file.name);
      const blob = await Packer.toBlob(doc);

      // Download
      const outputName = file.name.replace(/\.pdf$/i, ".docx");
      saveAs(blob, outputName);

      setIsConverted(true);

      // Save to DB
      await saveConversionRecord({
        fileName: file.name,
        fileSize: file.size,
        status: "success",
      });

      // Refresh history
      const updatedHistory = await getConversionHistory();
      setHistory(updatedHistory);
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Conversion failed. Please try again with a text-based PDF.");

      // Save failed record
      try {
        await saveConversionRecord({
          fileName: file.name,
          fileSize: file.size,
          status: "failed",
        });
      } catch (_) {}
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">PDF to Word Converter</h1>
          <p className="text-muted-foreground text-sm">
            Convert your PDF files to editable Word documents instantly — no server needed.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 
            ${isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary hover:bg-muted/40"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          {file ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-foreground">Drag & drop your PDF here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={!file || isConverting}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
            ${!file || isConverting
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Converting...
            </>
          ) : isConverted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Converted Successfully
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Convert & Download
            </>
          )}
        </button>

        {/* History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Clock className="w-5 h-5 text-primary" />
            Conversion History
          </div>

          {isLoadingHistory ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No conversions yet.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{record.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(record.fileSize)} · {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full 
                      ${record.status === "success"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-destructive/10 text-destructive"
                      }`}
                  >
                    {record.status === "success" ? "Success" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}