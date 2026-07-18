"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Upload,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  createResume,
  updateResume,
  categorizeSkills,
  improveSummaryWithAI,
} from "@/actions/resume";
import EntryForm from "./entry-form";
import TemplateSelector from "./template-selector";
import { templates } from "./templates/index";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import ResumeUploadZone from "./resume-upload-zone";
// ── ADDED: marked for markdown → HTML conversion ─────────────────
import { marked } from "marked";

export default function ResumeBuilder({
  initialContent,
  initialImage,
  initialTemplate,
  initialFormData,
  initialTitle,
  resumeId,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);

  const [profileImage, setProfileImage] = useState(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [selectedTemplate, setSelectedTemplate] = useState(
    initialTemplate || "classic",
  );

  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);

  const [resumeTitle, setResumeTitle] = useState(
    initialTitle || "Untitled Resume",
  );

  const [currentResumeId, setCurrentResumeId] = useState(resumeId || null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        name: "",
        email: "",
        mobile: "",
        linkedin: "",
        twitter: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isCreating,
    fn: createResumeFn,
    data: createResult,
    error: createError,
  } = useFetch(createResume);

  const {
    loading: isUpdating,
    fn: updateResumeFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateResume);

  const isSaving = isCreating || isUpdating;

  const formValues = watch();

  useEffect(() => {
    if (initialFormData) {
      reset({
        contactInfo: initialFormData.contactInfo || {
          name: "",
          email: "",
          mobile: "",
          linkedin: "",
          twitter: "",
        },
        summary: initialFormData.summary || "",
        skills: initialFormData.skills || "",
        experience: initialFormData.experience || [],
        education: initialFormData.education || [],
        projects: initialFormData.projects || [],
      });
    }
  }, [initialFormData]);

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab, profileImage, selectedTemplate]);

  useEffect(() => {
    if (createResult && !isCreating) {
      setCurrentResumeId(createResult.id);
      toast.success("Resume created successfully!");
    }
    if (createError) {
      toast.error(createError.message || "Failed to create resume");
    }
  }, [createResult, createError, isCreating]);

  useEffect(() => {
    if (updateResult && !isUpdating) {
      toast.success("Resume updated successfully!");
    }
    if (updateError) {
      toast.error(updateError.message || "Failed to update resume");
    }
  }, [updateResult, updateError, isUpdating]);

  const handleParsedResume = (parsedData) => {
    if (!parsedData) return;

    const resetData = {
      contactInfo: {
        name: parsedData.contactInfo?.name || "",
        email: parsedData.contactInfo?.email || "",
        mobile: parsedData.contactInfo?.mobile || "",
        linkedin: parsedData.contactInfo?.linkedin || "",
        twitter: parsedData.contactInfo?.twitter || "",
      },
      summary: parsedData.summary || "",
      skills: parsedData.skills || "",
      experience: Array.isArray(parsedData.experience)
        ? parsedData.experience
        : [],
      education: Array.isArray(parsedData.education)
        ? parsedData.education
        : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
    };

    reset(resetData);

    if (
      parsedData.contactInfo?.name &&
      (resumeTitle === "Untitled Resume" || !resumeTitle)
    ) {
      setResumeTitle(`${parsedData.contactInfo.name} Resume`);
    }

    setActiveTab("edit");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setProfileImage(data.url);
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Profile image removed");
  };

  const handleCategorizeSkills = async () => {
    const rawSkills = formValues.skills;
    if (!rawSkills?.trim()) {
      toast.error("Please enter some skills first");
      return;
    }

    setIsCategorizing(true);
    try {
      const categorized = await categorizeSkills(rawSkills);
      setValue("skills", categorized);
      toast.success("Skills categorized successfully!");
    } catch (error) {
      console.error("Categorize error:", error);
      toast.error("Failed to categorize skills");
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleImproveSummary = async () => {
    const currentSummary = formValues.summary;
    if (!currentSummary?.trim()) {
      toast.error("Please enter a summary first");
      return;
    }

    setIsImprovingSummary(true);
    try {
      const improved = await improveSummaryWithAI(currentSummary);
      setValue("summary", improved);
      toast.success("Summary improved successfully!");
    } catch (error) {
      console.error("Improve summary error:", error);
      toast.error("Failed to improve summary");
    } finally {
      setIsImprovingSummary(false);
    }
  };

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`[LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`[Twitter](${contactInfo.twitter})`);

    const imageMarkdown = profileImage
      ? `<div align="center"><img src="${profileImage}" width="100" height="100" style="border-radius:50%;object-fit:cover;border:2px solid #000;" /></div>\n\n`
      : "";

    const displayName = contactInfo.name || user?.fullName || "";

    return parts.length > 0
      ? `${imageMarkdown}## <div align="center">${displayName}</div>\n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : `${imageMarkdown}## <div align="center">${displayName}</div>`;
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  // ── ADDED: strips the header block (image + name + contact) from
  // the full markdown so templates don't render it twice.
  // Splits by "## " headings, drops the first block (header),
  // keeps everything from the first real section onward.
  const getBodyOnlyMarkdown = () => {
    const full = previewContent || "";
    // Find the index of "## Professional Summary" (or any real section)
    // Everything before it is the header block — drop it
    const realSectionMatch = full.search(/\n## (?!.*<div)/);
    if (realSectionMatch === -1) return full;
    return full.slice(realSectionMatch).trim();
  };

  // ── ADDED: converts body-only markdown to HTML for templates
  const getBodyHTML = () => {
    const bodyMarkdown = getBodyOnlyMarkdown();
    if (!bodyMarkdown.trim()) return "";
    return marked(bodyMarkdown, { breaks: true });
  };

  const SelectedTemplateComponent =
    templates[selectedTemplate] || templates["classic"];

  // ── UPDATED: content is now parsed HTML (not raw markdown),
  // header section excluded to prevent double rendering
  const getTemplateProps = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(contactInfo.email);
    if (contactInfo.mobile) parts.push(contactInfo.mobile);
    if (contactInfo.linkedin) parts.push(`LinkedIn: ${contactInfo.linkedin}`);
    if (contactInfo.twitter) parts.push(`Twitter: ${contactInfo.twitter}`);

    return {
      content: getBodyHTML(), // ← HTML only, no header, no raw ##
      profileImage: profileImage,
      userName: contactInfo.name || user?.fullName || "",
      contactInfo: parts.join(" | "),
    };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const isTemplatePDF = activeTab === "template";
      const elementId = isTemplatePDF
        ? "resume-pdf-template"
        : "resume-pdf-source";

      const element = document.getElementById(elementId);

      if (!element) {
        toast.error("Resume content not found");
        return;
      }

      let html;

      if (isTemplatePDF) {
        // TEMPLATE PATH — template is fully self-styled, only minimal reset
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8"/>
              <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #ffffff; }
                .anchor { display: none !important; }
                a.anchor { display: none !important; }
                h1::before, h2::before, h3::before {
                  display: none !important;
                  content: none !important;
                }
              </style>
            </head>
            <body>${element.innerHTML}</body>
          </html>
        `;
      } else {
        // SOURCE PATH — Classic CSS applied here
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8"/>
              <style>
                .anchor { display: none !important; }
                a.anchor { display: none !important; }
                h1 .octicon-link,
                h2 .octicon-link,
                h3 .octicon-link,
                h4 .octicon-link { display: none !important; }
                h1::before, h2::before, h3::before {
                  display: none !important;
                  content: none !important;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #000000;
                  background: #ffffff;
                  margin: 0;
                  padding: 20px 40px;
                }
                img {
                  width: 100px;
                  height: 100px;
                  border-radius: 50%;
                  object-fit: cover;
                  display: block;
                  margin: 0 auto 10px auto;
                  border: 2px solid #000000;
                }
                h1 { font-size: 20px; font-weight: bold; margin-bottom: 6px; text-align: center; }
                h2 { font-size: 17px; font-weight: bold; border-bottom: 1px solid #000000; padding-bottom: 4px; margin-top: 16px; margin-bottom: 6px; }
                h3 { font-size: 14px; font-weight: bold; margin-top: 12px; margin-bottom: 4px; }
                p { margin: 4px 0 8px 0; word-wrap: break-word; overflow-wrap: break-word; }
                strong, b { font-weight: bold; display: inline; }
                ul, ol { padding-left: 20px; margin: 4px 0 8px 0; }
                li { margin-bottom: 2px; }
                a { color: #000000; text-decoration: underline; }
                hr { border: none; border-top: 1px solid #000000; margin: 8px 0; }
                div[align="center"] { text-align: center; }
              </style>
            </head>
            <body>${element.innerHTML}</body>
          </html>
        `;
      }

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeTitle || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async () => {
    try {
      const latestContent = getCombinedContent();
      setPreviewContent(latestContent);

      const formattedContent = latestContent.replace(/\n\s*\n/g, "\n\n").trim();

      if (currentResumeId) {
        await updateResumeFn(
          currentResumeId,
          formattedContent,
          profileImage,
          selectedTemplate,
          formValues,
          resumeTitle,
        );
      } else {
        await createResumeFn(
          formattedContent,
          profileImage,
          selectedTemplate,
          formValues,
          resumeTitle,
        );
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div
      data-color-mode="light"
      className="space-y-4 relative w-full"
      style={{ isolation: "isolate" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button type="button" variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="font-bold gradient-title text-5xl md:text-6xl">
            Resume Builder
          </h1>
        </div>
        <div className="space-x-2">
          <Button
            variant="destructive"
            type="button"
            onClick={() => onSubmit()}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {currentResumeId ? "Update" : "Save"}
              </>
            )}
          </Button>
          <Button type="button" onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={resumeTitle}
          onChange={(e) => setResumeTitle(e.target.value)}
          placeholder="Resume Title (e.g. Software Engineer Resume)"
          className="max-w-sm"
        />
        <span className="text-xs text-muted-foreground">
          {currentResumeId ? "Editing existing resume" : "New resume"}
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Source</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>

        {/* Form Tab */}
        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <ResumeUploadZone onParsed={handleParsedResume} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or fill manually
                </span>
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Picture</h3>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="relative">
                  {profileImage ? (
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {profileImage ? "Change Photo" : "Upload Photo"}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    {...register("contactInfo.name")}
                    type="text"
                    placeholder="John Doe"
                  />
                  {errors.contactInfo?.name && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Professional Summary</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleImproveSummary}
                  disabled={isImprovingSummary || !formValues.summary?.trim()}
                >
                  {isImprovingSummary ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </>
                  )}
                </Button>
              </div>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Skills</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCategorizeSkills}
                  disabled={isCategorizing || !formValues.skills?.trim()}
                >
                  {isCategorizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Categorizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Auto Categorize
                    </>
                  )}
                </Button>
              </div>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills (e.g. Excel, SQL, Problem Solving) then click Auto Categorize..."
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Enter your skills separated by commas, then click
                <span className="font-medium"> Auto Categorize </span>
                to let AI group them automatically.
              </p>
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        {/* Source Tab */}
        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-1" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>

          {/* Hidden element used ONLY for Source tab PDF generation */}
          <div
            style={{
              position: "fixed",
              top: "-9999px",
              left: 0,
              width: "794px",
              height: 0,
              overflow: "hidden",
              pointerEvents: "none",
              visibility: "hidden",
            }}
          >
            <div
              id="resume-pdf-source"
              style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                fontFamily: "Arial, sans-serif",
                fontSize: "13px",
                lineHeight: "1.6",
                width: "794px",
                boxSizing: "border-box",
              }}
            >
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  whiteSpace: "normal",
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  display: "block",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </TabsContent>

        {/* Template Tab */}
        <TabsContent value="template">
          <div className="space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <SelectedTemplateComponent {...getTemplateProps()} />
              </div>
            </div>

            {/* Hidden element used ONLY for Template tab PDF generation */}
            <div
              style={{
                position: "fixed",
                top: "-9999px",
                left: 0,
                width: "794px",
                height: 0,
                overflow: "hidden",
                pointerEvents: "none",
                visibility: "hidden",
              }}
            >
              <div id="resume-pdf-template">
                <SelectedTemplateComponent {...getTemplateProps()} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
