"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileOutput,
  Upload,
  X,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getConversionHistory } from "@/actions/pdf-to-word";

const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  CONVERTING: "converting",
  DONE: "done",
  ERROR: "error",
};

export default function PdfToWordClient() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [docxBlob, setDocxBlob] = useState(null);
  const [docxFileName, setDocxFileName] = useState("");
  const [history, setHistory] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getConversionHistory()
      .then((records) => {
        setHistory(
          records.slice(0, 5).map((r) => ({
            id: r.id,
            name: r.fileName,
            size: r.fileSize,
            convertedAt: new Date(r.createdAt).toLocaleDateString(),
            blob: null,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (selectedFile) => {
    setErrorMsg("");
    setDocxBlob(null);
    setStatus(STATUS.IDLE);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only .pdf files are supported.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg("File size must be under 20MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus(STATUS.UPLOADING);
    setErrorMsg("");
    setDocxBlob(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus(STATUS.CONVERTING);

      const res = await fetch("/api/pdf-to-word", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Conversion failed");
      }

      const blob = await res.blob();
      const outputName = file.name.replace(/\.pdf$/i, ".docx");

      setDocxBlob(blob);
      setDocxFileName(outputName);
      setStatus(STATUS.DONE);

      setHistory((prev) => [
        {
          id: Date.now(),
          name: outputName,
          size: file.size,
          convertedAt: new Date().toLocaleDateString(),
          blob,
        },
        ...prev.filter((_, i) => i < 4),
      ]);

      toast.success("Converted successfully!");
    } catch (err) {
      setStatus(STATUS.ERROR);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Conversion failed");
    }
  };

  const handleDownload = (blob, name) => {
    if (!blob) {
      toast.error("This file is no longer available. Please convert again.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFile(null);
    setStatus(STATUS.IDLE);
    setErrorMsg("");
    setDocxBlob(null);
    setDocxFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isLoading = status === STATUS.UPLOADING || status === STATUS.CONVERTING;

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-20 left-6 z-40 flex items-center gap-2 text-sm font-medium bg-background border border-border shadow-sm px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:shadow-md hover:border-primary/40 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <FileOutput className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">PDF to Word Converter</h1>
        <p className="text-muted-foreground">
          Upload a <span className="font-medium text-foreground">.pdf</span>{" "}
          file and convert it to Word instantly.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mb-6 border-2">
        <CardContent className="pt-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
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
                  <p className="font-medium">Drop your .pdf file here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse — max 20MB
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

          {errorMsg && (
            <div className="mt-4 flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Button
              onClick={handleConvert}
              disabled={!file || isLoading || status === STATUS.DONE}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {status === STATUS.UPLOADING ? "Uploading..." : "Converting..."}
                </>
              ) : status === STATUS.DONE ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Converted!
                </>
              ) : (
                <>
                  <FileOutput className="w-4 h-4 mr-2" />
                  Convert to Word
                </>
              )}
            </Button>

            {status === STATUS.DONE && (
              <Button
                onClick={() => handleDownload(docxBlob, docxFileName)}
                size="lg"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download DOCX
              </Button>
            )}
          </div>

          {status === STATUS.DONE && (
            <button
              onClick={handleReset}
              className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Convert another file →
            </button>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Conversions
          </h2>
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <Card key={item.id} className="border">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[240px]">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(item.size)} · {item.convertedAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(item.blob, item.name)}
                    disabled={!item.blob}
                    title={!item.blob ? "File no longer available" : "Download"}
                  >
                    <Download className={`w-4 h-4 ${!item.blob ? "opacity-30" : ""}`} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
