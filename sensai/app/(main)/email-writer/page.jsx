"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Loader2,
  Copy,
  CheckCheck,
  Clock,
  Eye,
  Calendar,
  Sparkles,
  ChevronDown,
  User,
  Building2,
  Briefcase,
  Zap,
  PenLine,
  Send,
  Paperclip,
  Download,
  AtSign,
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
import { getEmailHistory } from "@/actions/email";
import FileUpload from "@/components/email-writer/file-upload";

// ── Constants ─────────────────────────────────────────────────────────
const TONES = [
  "Professional",
  "Formal",
  "Friendly",
  "Casual",
  "Polite",
  "Confident",
  "Persuasive",
  "Apologetic",
];

const LENGTHS = ["Short", "Medium", "Long"];

const PURPOSES = [
  "Internship Request",
  "Job Application",
  "Leave Application",
  "HR Follow-up",
  "Scholarship Request",
  "Recommendation Request",
  "Networking",
  "Thank You Note",
  "Apology Email",
  "Project Proposal",
  "Other",
];

// ── Main Page ─────────────────────────────────────────────────────────
export default function EmailWriterPage() {
  // Form state
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [purpose, setPurpose] = useState("Job Application");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [skills, setSkills] = useState("");
  const [signature, setSignature] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");

  // Upload state
  const [attachments, setAttachments] = useState([]); // { fileName, fileUrl, fileType, fileSize }

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Fetch History ───────────────────────────────────────────────────
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const records = await getEmailHistory();
      setHistory(records);
    } catch (err) {
      console.error("Failed to fetch email history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ── Sync editable email when generated ─────────────────────────────
  useEffect(() => {
    setEditableEmail(generatedEmail);
  }, [generatedEmail]);

  // ── Helpers ─────────────────────────────────────────────────────────
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopy = async () => {
    if (!editableEmail) return;
    await navigator.clipboard.writeText(editableEmail);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // ── Generate ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please write what kind of email you want to generate.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setGeneratedEmail("");
    setEditableEmail("");

    try {
      const res = await fetch("/api/email-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          tone,
          length,
          purpose,
          recipientName,
          companyName,
          jobRole,
          skills,
          signature,
          receiverEmail,
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate email.");
      }

      setGeneratedEmail(data.generatedEmail);
      toast.success("Email generated successfully!");
      fetchHistory();
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Send Email ───────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!receiverEmail.trim()) {
      toast.error("Please enter receiver email address.");
      return;
    }
    if (!editableEmail.trim()) {
      toast.error("Please generate an email first.");
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch("/api/email-writer/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverEmail,
          emailContent: editableEmail,
          attachments,
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email.");
      }

      toast.success("Email sent successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">AI Email Writer</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate professional emails instantly using AI. Just describe what
          you need and let the AI do the rest.
        </p>
      </div>

      {/* ── Form Card ── */}
      <Card className="mb-6 border-2">
        <CardContent className="pt-6 space-y-5">
          {/* Prompt */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              What email do you want to write?{" "}
              <span className="text-destructive">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a professional internship request email for a frontend developer role at Google..."
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Purpose + Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Email Purpose
              </label>
              <div className="relative">
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Tone</label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Email Length
            </label>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLength(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-150
                    ${
                      length === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input text-muted-foreground hover:border-primary/50"
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Customization Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Recipient Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. HR Manager"
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Job Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Frontend Developer Intern"
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Skills</label>
              <div className="relative">
                <Zap className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React.js, Next.js, Node.js"
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Custom Signature
            </label>
            <div className="relative">
              <PenLine className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Receiver Email */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Receiver Email Address
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                placeholder="e.g. hr@google.com"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* File Upload */}
          <FileUpload
  attachments={attachments}
  onChange={setAttachments}
/>

          {/* Error */}
          {errorMsg && (
            <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Email...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Generated Email Output (Editable) ── */}
      {generatedEmail && (
        <Card className="mb-6 border-2 border-primary/30">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">
                  Generated Email{" "}
                  <span className="text-muted-foreground font-normal">
                    (editable)
                  </span>
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Editable Textarea */}
            <textarea
              value={editableEmail}
              onChange={(e) => setEditableEmail(e.target.value)}
              rows={14}
              className="w-full rounded-xl border border-input bg-muted/40 px-4 py-3 text-sm font-sans leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <div className="flex gap-3">
              {/* Regenerate */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate
              </Button>

              {/* Send Email */}
              <Button
                onClick={handleSendEmail}
                disabled={isSending || !receiverEmail.trim()}
                className="flex-1 gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>

            {!receiverEmail.trim() && (
              <p className="text-xs text-muted-foreground text-center">
                Enter receiver email above to enable sending
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── History Section ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent Emails</h2>
        </div>

        {isLoadingHistory ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No emails generated yet</p>
              <p className="text-xs text-muted-foreground">
                Fill the form above and generate your first AI email.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <Card
                key={record.id}
                className="border-2 hover:border-primary/40 transition-all duration-200 cursor-pointer group"
                onClick={() => handleViewRecord(record)}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {record.purpose}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {record.tone}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {record.length}
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {formatDate(record.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-sm">
                          {record.generatedEmail?.slice(0, 80)}...
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                      <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  <Mail className="w-4 h-4 text-primary" />
                  {selectedRecord.purpose}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {selectedRecord.tone}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {selectedRecord.length}
                  </span>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedRecord.createdAt)}
                  </p>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Meta info */}
                {(selectedRecord.companyName ||
                  selectedRecord.jobRole ||
                  selectedRecord.recipientName ||
                  selectedRecord.receiverEmail) && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRecord.recipientName && (
                      <div className="bg-muted/40 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          Recipient
                        </p>
                        <p className="text-sm font-medium">
                          {selectedRecord.recipientName}
                        </p>
                      </div>
                    )}
                    {selectedRecord.receiverEmail && (
                      <div className="bg-muted/40 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">Sent To</p>
                        <p className="text-sm font-medium">
                          {selectedRecord.receiverEmail}
                        </p>
                      </div>
                    )}
                    {selectedRecord.companyName && (
                      <div className="bg-muted/40 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">Company</p>
                        <p className="text-sm font-medium">
                          {selectedRecord.companyName}
                        </p>
                      </div>
                    )}
                    {selectedRecord.jobRole && (
                      <div className="bg-muted/40 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          Job Role
                        </p>
                        <p className="text-sm font-medium">
                          {selectedRecord.jobRole}
                        </p>
                      </div>
                    )}
                    {selectedRecord.skills && (
                      <div className="bg-muted/40 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">Skills</p>
                        <p className="text-sm font-medium">
                          {selectedRecord.skills}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments in Modal */}
                {selectedRecord.attachments?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-primary" />
                      Attachments
                    </p>
                    <div className="space-y-2">
                      {selectedRecord.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 border border-input"
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

                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Email */}
                <Card className="border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">
                        Generated Email
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            selectedRecord.generatedEmail,
                          );
                          toast.success("Copied to clipboard!");
                        }}
                        className="gap-1.5 h-7 text-xs"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                    </div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedRecord.generatedEmail}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
