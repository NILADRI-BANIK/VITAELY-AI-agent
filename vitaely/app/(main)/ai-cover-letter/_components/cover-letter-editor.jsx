"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateCoverLetter } from "@/actions/cover-letter";
import CoverLetterDownload from "./cover-letter-download";
import CoverLetterPreview from "./cover-letter-preview";

const TEMPLATES = [
  { value: "modern-professional", label: "Modern Professional" },
  { value: "executive-elite", label: "Executive Elite" },
  { value: "glassmorphism-premium", label: "Glassmorphism Premium" },
  { value: "startup-founder", label: "Startup Founder" },
  { value: "creative-designer", label: "Creative Designer" },
  { value: "tech-cyber", label: "Tech Cyber" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "neo-brutalism", label: "Neo Brutalism" },
];

export default function CoverLetterEditor({ coverLetter }) {
  const router = useRouter();

  const savedFormData =
    typeof coverLetter.formData === "object" && coverLetter.formData !== null
      ? coverLetter.formData
      : {};

  const [title, setTitle] = useState(coverLetter.title);
  const [content, setContent] = useState(coverLetter.content);
  const [selectedTemplate, setSelectedTemplate] = useState(
    coverLetter.template ?? "modern-professional"
  );

  const [yourName, setYourName] = useState(savedFormData.yourName ?? "");
  const [yourEmail, setYourEmail] = useState(savedFormData.yourEmail ?? "");
  const [yourPhone, setYourPhone] = useState(savedFormData.yourPhone ?? "");
  const [yourSkills, setYourSkills] = useState(savedFormData.yourSkills ?? "");
  const [yourExperience, setYourExperience] = useState(
    savedFormData.yourExperience ?? ""
  );
  const [companyName, setCompanyName] = useState(savedFormData.companyName ?? "");
  const [jobTitle, setJobTitle] = useState(savedFormData.jobTitle ?? "");

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const previewRef = useRef(null);

  const latestRef = useRef({});
  useEffect(() => {
    latestRef.current = {
      title,
      content,
      selectedTemplate,
      yourName,
      yourEmail,
      yourPhone,
      yourSkills,
      yourExperience,
      companyName,
      jobTitle,
    };
  }, [
    title,
    content,
    selectedTemplate,
    yourName,
    yourEmail,
    yourPhone,
    yourSkills,
    yourExperience,
    companyName,
    jobTitle,
  ]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveStatus("saving");
    try {
      const current = latestRef.current;
      await updateCoverLetter(coverLetter.id, {
        title: current.title,
        content: current.content,
        selectedTemplate: current.selectedTemplate,
        yourName: current.yourName,
        yourEmail: current.yourEmail,
        yourPhone: current.yourPhone,
        yourSkills: current.yourSkills,
        yourExperience: current.yourExperience,
        companyName: current.companyName,
        jobTitle: current.jobTitle,
      });
      setSaveStatus("saved");
      toast.success("Cover letter saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("idle");
      toast.error("Failed to save cover letter");
    } finally {
      setSaving(false);
    }
  }, [coverLetter.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const changed =
        title !== coverLetter.title ||
        content !== coverLetter.content ||
        selectedTemplate !== (coverLetter.template ?? "modern-professional") ||
        yourName !== (savedFormData.yourName ?? "") ||
        yourEmail !== (savedFormData.yourEmail ?? "") ||
        yourPhone !== (savedFormData.yourPhone ?? "") ||
        yourSkills !== (savedFormData.yourSkills ?? "") ||
        yourExperience !== (savedFormData.yourExperience ?? "") ||
        companyName !== (savedFormData.companyName ?? "") ||
        jobTitle !== (savedFormData.jobTitle ?? "");

      if (changed) handleSave();
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    content,
    selectedTemplate,
    yourName,
    yourEmail,
    yourPhone,
    yourSkills,
    yourExperience,
    companyName,
    jobTitle,
  ]);

  const coverLetterForPreview = {
    ...coverLetter,
    title,
    content,
    template: selectedTemplate,
    selectedTemplate,
    companyName,
    position: jobTitle,
    senderName: yourName,
    senderEmail: yourEmail,
    senderPhone: yourPhone,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/ai-cover-letter")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {saveStatus === "saved" && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </div>
          )}
          {saveStatus === "saving" && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Saving...
            </p>
          )}
          <CoverLetterDownload coverLetter={coverLetterForPreview} />
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Asymmetric grid — editor narrower, preview wider */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
        {/* ── Editor Panel ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="yourName">Full Name</Label>
                  <Input
                    id="yourName"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yourEmail">Email</Label>
                  <Input
                    id="yourEmail"
                    type="email"
                    value={yourEmail}
                    onChange={(e) => setYourEmail(e.target.value)}
                    placeholder="e.g. jane@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="yourPhone">Phone</Label>
                  <Input
                    id="yourPhone"
                    value={yourPhone}
                    onChange={(e) => setYourPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yourExperience">Experience</Label>
                  <Input
                    id="yourExperience"
                    value={yourExperience}
                    onChange={(e) => setYourExperience(e.target.value)}
                    placeholder="e.g. 5 years"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourSkills">Key Skills</Label>
                <Textarea
                  id="yourSkills"
                  value={yourSkills}
                  onChange={(e) => setYourSkills(e.target.value)}
                  rows={2}
                  className="resize-none"
                  placeholder="e.g. Node.js, React, PostgreSQL, AWS..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cover Letter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cover Letter Title"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Position</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="resize-none font-mono text-sm"
                  placeholder="Cover letter content..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Preview Panel — sticky, full A4 visible without scrolling ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Preview</CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {selectedTemplate.replace(/-/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center bg-muted/30 rounded-md p-2 overflow-hidden">
              <CoverLetterPreview
                ref={previewRef}
                letter={coverLetterForPreview}
                scale={0.78}
                className="shadow-md rounded-sm ring-1 ring-border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}