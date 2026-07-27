"use client";

import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";

// ── Format file size helper ───────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── FileUpload Component ──────────────────────────────────────────────
export default function FileUpload({ attachments = [], onChange }) {
  const handleRemove = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
        <Paperclip className="w-4 h-4" />
        Attach Files (PDF, DOCX, PPT, Images)
      </label>

      <div className="border border-dashed border-input rounded-lg p-4 bg-muted/20">
        {/* ── Upload Button ── */}
        <UploadButton
          endpoint="emailAttachment"
          onClientUploadComplete={(res) => {
            if (!res || res.length === 0) return;
            const newFiles = res.map((f) => ({
              fileName: f.name,
              fileUrl: f.url,
              fileType: f.type || "",
              fileSize: f.size || 0,
            }));
            onChange([...attachments, ...newFiles]);
            toast.success(`${res.length} file(s) uploaded successfully!`);
          }}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
        />

        {/* ── Uploaded Files List ── */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-input"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-medium truncate">
                    {file.fileName}
                  </span>
                  {file.fileSize > 0 && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({formatFileSize(file.fileSize)})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}