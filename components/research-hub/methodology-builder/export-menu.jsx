"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Loader2,
  Check,
  ChevronDown,
  FileText,
  FileJson,
  FileSpreadsheet,
  Presentation,
  BookMarked,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  exportMethodology,
  exportMethodologyMultiple,
  getSupportedExportFormats,
} from "@/actions/research-hub/methodology-export";

const FORMAT_ICONS = {
  pdf: FileText,
  docx: FileText,
  pptx: Presentation,
  json: FileJson,
  md: FileText,
  bibtex: BookMarked,
  ris: FileSpreadsheet,
};

export default function ExportMenu({
  methodologyId = null,
  methodologyData = null,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [formats, setFormats] = useState([]);
  const [loadingFormats, setLoadingFormats] = useState(true);
  const [selectedFormats, setSelectedFormats] = useState([]);

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const menuRef = useRef(null);

  const fetchFormats = useCallback(async () => {
    setLoadingFormats(true);
    try {
      const res = await getSupportedExportFormats();
      if (res.success) {
        setFormats(res.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingFormats(false);
    }
  }, []);

  useEffect(() => {
    fetchFormats();
  }, [fetchFormats]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFormat = (id) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const allFormatIds = formats.map((f) => f.id);
  const allSelected =
    allFormatIds.length > 0 &&
    allFormatIds.every((id) => selectedFormats.includes(id));

  const handleToggleSelectAll = () => {
    setSelectedFormats(allSelected ? [] : allFormatIds);
  };

  const canExport = Boolean(methodologyId || methodologyData);

  const handleExportSingle = async (formatId) => {
    if (!canExport) {
      setError("Nothing to export yet. Generate a methodology first.");
      return;
    }
    setError(null);
    setExporting(true);
    setResults(null);

    try {
      const res = await exportMethodology({
        methodologyId,
        methodologyData,
        format: formatId,
      });
      if (!res.success) throw new Error(res.error || "Export failed");
      setResults([{ format: formatId, success: true, url: res.data.url }]);
      if (typeof window !== "undefined") {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err.message || "Failed to export methodology.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportMultiple = async (formatsOverride = null) => {
    const formatsToExport = formatsOverride ?? selectedFormats;

    if (!canExport) {
      setError("Nothing to export yet. Generate a methodology first.");
      return;
    }
    if (formatsToExport.length === 0) {
      setError("Select at least one format to export.");
      return;
    }

    setError(null);
    setExporting(true);
    setResults(null);

    try {
      const res = await exportMethodologyMultiple({
        methodologyId,
        methodologyData,
        formats: formatsToExport,
      });
      if (!res.success) throw new Error(res.error || "Export failed");
      const resultList = res.data.results || [];
      setResults(resultList);

      if (typeof window !== "undefined") {
        resultList
          .filter((r) => r.success && r.url)
          .forEach((r) => {
            window.open(r.url, "_blank", "noopener,noreferrer");
          });
      }
    } catch (err) {
      setError(err.message || "Failed to export methodology.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = () => {
    setSelectedFormats(allFormatIds);
    handleExportMultiple(allFormatIds);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        disabled={disabled || loadingFormats}
      >
        <Download className="w-3.5 h-3.5 mr-1.5" />
        Export
        <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Export as
            </p>
            {!loadingFormats && formats.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs text-primary hover:underline"
              >
                {allSelected ? "Clear Selection" : "Select All"}
              </button>
            )}
          </div>

          {loadingFormats ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading formats...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 mb-3">
              {formats.map((f) => {
                const Icon = FORMAT_ICONS[f.id] || FileText;
                return (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors"
                  >
                    <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(f.id)}
                        onChange={() => toggleFormat(f.id)}
                        className="w-3.5 h-3.5 accent-primary shrink-0"
                      />
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {f.label}
                      </span>
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs shrink-0"
                      disabled={exporting || !canExport}
                      onClick={() => handleExportSingle(f.id)}
                    >
                      Quick
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-1.5 text-destructive text-xs bg-destructive/10 px-2.5 py-2 rounded-md mb-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {results && (
            <div className="flex flex-col gap-1 mb-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs px-2 py-1"
                >
                  <span className="flex items-center gap-1.5">
                    {r.success ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    )}
                    <span className="uppercase font-medium">{r.format}</span>
                  </span>
                  {r.success ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-destructive">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border flex-wrap">
            {selectedFormats.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedFormats.length} selected
              </Badge>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportAll}
                disabled={exporting || !canExport || allFormatIds.length === 0}
              >
                Export All
              </Button>
              <Button
                size="sm"
                onClick={() => handleExportMultiple()}
                disabled={exporting || !canExport || selectedFormats.length === 0}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}