"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Save,
  Globe,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Link,
  Code2,
  Award,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Trophy,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createPortfolio,
  updatePortfolio,
  getPortfolioById,
  improvePortfolioSummary,
  improvePortfolioDescription,
  categorizePortfolioSkills,
} from "@/actions/portfolio";
import ResumeUploader from "@/components/portfolio/ResumeUploader";
import { PORTFOLIO_TEMPLATE_LIST } from "@/components/portfolio/templates/index";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i,
);

// ─────────────────────────────────────────────
// HELPER — empty entry objects
// ─────────────────────────────────────────────
const emptyExperience = () => ({
  id: crypto.randomUUID(),
  title: "",
  organization: "",
  location: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  current: false,
  description: "",
});

const emptyEducation = () => ({
  id: crypto.randomUUID(),
  degree: "",
  institution: "",
  university: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  current: false,
  scoreType: "CGPA",
  score: "",
  outOf: "4.0",
  description: "",
});

const emptyProject = () => ({
  id: crypto.randomUUID(),
  title: "",
  techStack: "",
  organization: "",
  github: "",
  liveUrl: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  current: false,
  description: "",
});

const emptyCertification = () => ({
  id: crypto.randomUUID(),
  name: "",
  organization: "",
  issueDate: "",
  credentialUrl: "",
});

const emptyAchievement = () => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
});

const updateArrayItem = (setter, index, key, value) => {
  setter((prev) => {
    const copy = [...prev];
    copy[index] = { ...copy[index], [key]: value };
    return copy;
  });
};

// ─────────────────────────────────────────────
// HELPER — section label
// ─────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPER — date select row
// ─────────────────────────────────────────────
function DateSelect({
  monthValue,
  yearValue,
  onMonthChange,
  onYearChange,
  label,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={monthValue}
          onChange={(e) => onMonthChange(e.target.value)}
          className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={yearValue}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-24 h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function PortfolioForm({
  portfolioId = null,
  defaultTemplate = null,
}) {
  const router = useRouter();

  // ── Form state ──────────────────────────────
  const [portfolioTitle, setPortfolioTitle] = useState("My Portfolio");
  const [selectedTemplate, setSelectedTemplate] = useState(
    defaultTemplate || "modern",
  );
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Basic Info
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);

  // Contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [hackerrank, setHackerrank] = useState("");
  const [codeforces, setCodeforces] = useState("");

  // Skills & Hobbies
  const [skillsRaw, setSkillsRaw] = useState("");
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [hobbiesRaw, setHobbiesRaw] = useState("");

  // Dynamic sections
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(!!portfolioId);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentId, setCurrentId] = useState(portfolioId);

  // Improving description per-entry
  const [improvingIdx, setImprovingIdx] = useState({ type: null, index: null });

  // ── Load existing portfolio ──────────────────
  useEffect(() => {
    if (!portfolioId) return;

    (async () => {
      try {
        const portfolio = await getPortfolioById(portfolioId);
        if (!portfolio) return;

        setPortfolioTitle(portfolio.title || "My Portfolio");
        setSelectedTemplate(portfolio.templateId || "modern");
        setProfileImage(portfolio.profileImage || null);
        setFullName(portfolio.fullName || "");
        setProfessionalTitle(portfolio.professionalTitle || "");
        setSummary(portfolio.summary || "");
        setEmail(portfolio.email || "");
        setPhone(portfolio.phone || "");
        setAddress(portfolio.address || "");
        setLinkedin(portfolio.linkedin || "");
        setGithub(portfolio.github || "");
        setTwitter(portfolio.twitter || "");
        setPortfolioUrl(portfolio.portfolioUrl || "");
        setLeetcode(portfolio.leetcode || "");
        setHackerrank(portfolio.hackerrank || "");
        setCodeforces(portfolio.codeforces || "");
        setSkillsRaw(
          Array.isArray(portfolio.skills)
            ? portfolio.skills
                .map((s) => (typeof s === "string" ? s : s?.category || ""))
                .filter(Boolean)
                .join(", ")
            : "",
        );
        setHobbiesRaw(
          Array.isArray(portfolio.hobbies) ? portfolio.hobbies.join(", ") : "",
        );

        setExperience(
          Array.isArray(portfolio.experience)
            ? portfolio.experience.map((item) => ({
                ...item,
                id: item.id || crypto.randomUUID(),
              }))
            : [],
        );
        setEducation(
          Array.isArray(portfolio.education)
            ? portfolio.education.map((item) => ({
                ...item,
                id: item.id || crypto.randomUUID(),
              }))
            : [],
        );
        setProjects(
          Array.isArray(portfolio.projects)
            ? portfolio.projects.map((item) => ({
                ...item,
                id: item.id || crypto.randomUUID(),
              }))
            : [],
        );
        setCertifications(
          Array.isArray(portfolio.certifications)
            ? portfolio.certifications.map((item) => ({
                ...item,
                id: item.id || crypto.randomUUID(),
              }))
            : [],
        );
        setAchievements(
          Array.isArray(portfolio.achievements)
            ? portfolio.achievements.map((item) => ({
                ...item,
                id: item.id || crypto.randomUUID(),
              }))
            : [],
        );
      } catch (err) {
        toast.error("Failed to load portfolio.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [portfolioId]);

  // ── Resume parse → autofill ──────────────────
  const handleParsed = (data) => {
    if (!data) return;
    setFullName(data.basicInfo?.fullName || "");
    setProfessionalTitle(data.basicInfo?.professionalTitle || "");
    setSummary(data.basicInfo?.summary || "");
    setEmail(data.contact?.email || "");
    setPhone(data.contact?.phone || "");
    setAddress(data.contact?.address || "");
    setLinkedin(data.contact?.linkedin || "");
    setGithub(data.contact?.github || "");
    setTwitter(data.contact?.twitter || "");
    setPortfolioUrl(data.contact?.portfolioUrl || "");
    setLeetcode(data.contact?.leetcode || "");
    setHackerrank(data.contact?.hackerrank || "");
    setCodeforces(data.contact?.codeforces || "");

    if (Array.isArray(data.skills) && data.skills.length > 0) {
      const flat = data.skills.flatMap((s) =>
        Array.isArray(s.skills) ? s.skills : [s],
      );
      setSkillsRaw(flat.join(", "));
    }

    setHobbiesRaw(Array.isArray(data.hobbies) ? data.hobbies.join(", ") : "");
    setExperience(
      Array.isArray(data.experience)
        ? data.experience.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }))
        : [],
    );
    setEducation(
      Array.isArray(data.education)
        ? data.education.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }))
        : [],
    );
    setProjects(
      Array.isArray(data.projects)
        ? data.projects.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }))
        : [],
    );
    setCertifications(
      Array.isArray(data.certifications)
        ? data.certifications.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }))
        : [],
    );
    setAchievements(
      Array.isArray(data.achievements)
        ? data.achievements.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }))
        : [],
    );

    if (
      data.basicInfo?.fullName &&
      (portfolioTitle === "My Portfolio" || !portfolioTitle)
    ) {
      setPortfolioTitle(`${data.basicInfo.fullName}'s Portfolio`);
    }
  };

  // ── Profile image upload ─────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfileImage(data.url);
      toast.success("Profile image uploaded!");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── AI — improve summary ─────────────────────
  const handleImproveSummary = async () => {
    if (!summary.trim()) {
      toast.error("Please enter a summary first.");
      return;
    }
    setIsImprovingSummary(true);
    try {
      const improved = await improvePortfolioSummary(summary);
      setSummary(improved);
      toast.success("Summary improved!");
    } catch (err) {
      toast.error(err.message || "Failed to improve summary.");
    } finally {
      setIsImprovingSummary(false);
    }
  };

  // ── AI — categorize skills ───────────────────
  const handleCategorizeSkills = async () => {
    if (!skillsRaw.trim()) {
      toast.error("Please enter skills first.");
      return;
    }
    setIsCategorizing(true);
    try {
      const categorized = await categorizePortfolioSkills(skillsRaw);
      const flat = categorized.flatMap((group) => group.skills || []);
      setSkillsRaw(flat.join(", "));
      toast.success("Skills categorized and updated!");
    } catch (err) {
      toast.error(err.message || "Failed to categorize skills.");
    } finally {
      setIsCategorizing(false);
    }
  };

  // ── AI — improve description ─────────────────
  const handleImproveDescription = async (type, index, current, setter) => {
    if (!current.trim()) {
      toast.error("Please enter a description first.");
      return;
    }
    setImprovingIdx({ type, index });
    try {
      const improved = await improvePortfolioDescription(current, type);
      setter((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], description: improved };
        return copy;
      });
      toast.success("Description improved!");
    } catch (err) {
      toast.error(err.message || "Failed to improve description.");
    } finally {
      setImprovingIdx({ type: null, index: null });
    }
  };

  // ── Build form data object ───────────────────
  const buildFormData = () => ({
    title: portfolioTitle,
    templateId: selectedTemplate,
    profileImage,
    fullName,
    professionalTitle,
    summary,
    email,
    phone,
    address,
    linkedin,
    github,
    twitter,
    portfolioUrl,
    leetcode,
    hackerrank,
    codeforces,
    skills: skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    hobbies: hobbiesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experience,
    education,
    projects,
    certifications,
    achievements,
  });

  // ── Save portfolio ───────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    setIsSaving(true);
    try {
      const data = buildFormData();
      if (currentId) {
        await updatePortfolio(currentId, data);
        toast.success("Portfolio updated!");
      } else {
        const created = await createPortfolio(data);
        setCurrentId(created.id);
        toast.success("Portfolio saved!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save portfolio.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save + Generate ──────────────────────────
  const handleGenerate = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    setIsGenerating(true);
    try {
      let id = currentId;
      const data = buildFormData();

      if (!id) {
        const created = await createPortfolio(data);
        id = created.id;
        setCurrentId(id);
      } else {
        await updatePortfolio(id, data);
      }

      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: id, formData: data }),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error("Invalid server response.");
      }
      if (!res.ok) throw new Error(result?.error || "Generation failed.");

      toast.success("Portfolio generated!");
      router.push(`/portfolio-generator/preview/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to generate portfolio.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Loading state ────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/portfolio-generator")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <Input
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              placeholder="Portfolio Title"
              className="max-w-xs font-semibold"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isGenerating}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button onClick={handleGenerate} disabled={isSaving || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Portfolio
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── SECTION 1 — Resume Upload ── */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <ResumeUploader onParsed={handleParsed} />
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">
            Or fill manually
          </span>
        </div>
      </div>

      {/* ── SECTION 2 — Basic Info ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-5">
          <SectionHeader icon={User} title="Basic Information" />

          {/* Profile Picture */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/40">
            <div className="relative flex-shrink-0">
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setProfileImage(null)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
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
                size="sm"
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

          {/* Name + Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Professional Title</label>
              <Input
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Full Stack Developer"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Professional Summary
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleImproveSummary}
                disabled={isImprovingSummary || !summary.trim()}
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
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a compelling professional summary..."
              className="h-28 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 3 — Contact ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <SectionHeader icon={Mail} title="Contact Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Email",
                value: email,
                setter: setEmail,
                placeholder: "your@email.com",
                icon: Mail,
                type: "email",
              },
              {
                label: "Phone",
                value: phone,
                setter: setPhone,
                placeholder: "+1 234 567 8900",
                icon: Phone,
                type: "tel",
              },
              {
                label: "Address",
                value: address,
                setter: setAddress,
                placeholder: "City, Country",
                icon: MapPin,
                type: "text",
              },
              {
                label: "LinkedIn URL",
                value: linkedin,
                setter: setLinkedin,
                placeholder: "https://linkedin.com/in/...",
                icon: Linkedin,
                type: "url",
              },
              {
                label: "GitHub URL",
                value: github,
                setter: setGithub,
                placeholder: "https://github.com/...",
                icon: Github,
                type: "url",
              },
              {
                label: "Twitter/X",
                value: twitter,
                setter: setTwitter,
                placeholder: "https://twitter.com/...",
                icon: Twitter,
                type: "url",
              },
              {
                label: "Portfolio URL",
                value: portfolioUrl,
                setter: setPortfolioUrl,
                placeholder: "https://yoursite.com",
                icon: Globe,
                type: "url",
              },
              {
                label: "LeetCode",
                value: leetcode,
                setter: setLeetcode,
                placeholder: "https://leetcode.com/...",
                icon: Code2,
                type: "url",
              },
              {
                label: "HackerRank",
                value: hackerrank,
                setter: setHackerrank,
                placeholder: "https://hackerrank.com/...",
                icon: Award,
                type: "url",
              },
              {
                label: "Codeforces",
                value: codeforces,
                setter: setCodeforces,
                placeholder: "https://codeforces.com/...",
                icon: Link,
                type: "url",
              },
            ].map(({ label, value, setter, placeholder, icon: Icon, type }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="pl-9"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 4 — Skills ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-3">
          <SectionHeader icon={Code2} title="Skills">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCategorizeSkills}
              disabled={isCategorizing || !skillsRaw.trim()}
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
          </SectionHeader>
          <Textarea
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            placeholder="React, Node.js, Python, MongoDB, Tailwind CSS..."
            className="h-24 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Enter skills separated by commas. Click{" "}
            <span className="font-medium">Auto Categorize</span> to group them
            automatically.
          </p>
        </CardContent>
      </Card>

      {/* ── SECTION 5 — Hobbies ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-3">
          <SectionHeader icon={Heart} title="Hobbies / Interests" />
          <Input
            value={hobbiesRaw}
            onChange={(e) => setHobbiesRaw(e.target.value)}
            placeholder="Coding, Gaming, Photography, Reading..."
          />
          <p className="text-xs text-muted-foreground">
            Enter hobbies separated by commas.
          </p>
        </CardContent>
      </Card>

      {/* ── SECTION 6 — Work Experience ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <SectionHeader icon={Briefcase} title="Work Experience" />

          {experience.map((exp, i) => (
            <Card key={exp.id} className="border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {exp.title || "Experience"}{" "}
                    {exp.organization ? `@ ${exp.organization}` : ""}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() =>
                      setExperience((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      Title/Position
                    </label>
                    <Input
                      value={exp.title}
                      onChange={(e) =>
                        setExperience((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], title: e.target.value };
                          return c;
                        })
                      }
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Organization</label>
                    <Input
                      value={exp.organization}
                      onChange={(e) =>
                        setExperience((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], organization: e.target.value };
                          return c;
                        })
                      }
                      placeholder="Google"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Location</label>
                    <Input
                      value={exp.location}
                      onChange={(e) =>
                        setExperience((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], location: e.target.value };
                          return c;
                        })
                      }
                      placeholder="New York, USA"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id={`exp-current-${i}`}
                      checked={exp.current || false}
                      onChange={(e) =>
                        setExperience((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], current: e.target.checked };
                          return c;
                        })
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor={`exp-current-${i}`} className="text-sm">
                      Current Experience
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DateSelect
                    label="Start Date"
                    monthValue={exp.startMonth || ""}
                    yearValue={exp.startYear || ""}
                    onMonthChange={(v) =>
                      setExperience((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], startMonth: v };
                        return c;
                      })
                    }
                    onYearChange={(v) =>
                      setExperience((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], startYear: v };
                        return c;
                      })
                    }
                  />
                  {!exp.current && (
                    <DateSelect
                      label="End Date"
                      monthValue={exp.endMonth || ""}
                      yearValue={exp.endYear || ""}
                      onMonthChange={(v) =>
                        setExperience((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], endMonth: v };
                          return c;
                        })
                      }
                      onYearChange={(v) =>
                        setExperience((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], endYear: v };
                          return c;
                        })
                      }
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Description</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={
                        improvingIdx.type === "experience" &&
                        improvingIdx.index === i
                      }
                      onClick={() =>
                        handleImproveDescription(
                          "experience",
                          i,
                          exp.description || "",
                          setExperience,
                        )
                      }
                    >
                      {improvingIdx.type === "experience" &&
                      improvingIdx.index === i ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Improve with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) =>
                      setExperience((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], description: e.target.value };
                        return c;
                      })
                    }
                    placeholder="Describe your responsibilities and achievements..."
                    className="h-24 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setExperience((prev) => [...prev, emptyExperience()])
            }
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </CardContent>
      </Card>

      {/* ── SECTION 7 — Education ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <SectionHeader icon={GraduationCap} title="Education" />

          {education.map((edu, i) => (
            <Card key={edu.id} className="border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {edu.degree || "Education"}{" "}
                    {edu.institution ? `@ ${edu.institution}` : ""}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() =>
                      setEducation((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Degree</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], degree: e.target.value };
                          return c;
                        })
                      }
                      placeholder="B.Tech Computer Science"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Institution</label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], institution: e.target.value };
                          return c;
                        })
                      }
                      placeholder="MIT"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">University</label>
                    <Input
                      value={edu.university}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], university: e.target.value };
                          return c;
                        })
                      }
                      placeholder="Parent University (if different)"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id={`edu-current-${i}`}
                      checked={edu.current || false}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], current: e.target.checked };
                          return c;
                        })
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor={`edu-current-${i}`} className="text-sm">
                      Currently Studying
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DateSelect
                    label="Start Date"
                    monthValue={edu.startMonth || ""}
                    yearValue={edu.startYear || ""}
                    onMonthChange={(v) =>
                      setEducation((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], startMonth: v };
                        return c;
                      })
                    }
                    onYearChange={(v) =>
                      setEducation((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], startYear: v };
                        return c;
                      })
                    }
                  />
                  {!edu.current && (
                    <DateSelect
                      label="End Date"
                      monthValue={edu.endMonth || ""}
                      yearValue={edu.endYear || ""}
                      onMonthChange={(v) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], endMonth: v };
                          return c;
                        })
                      }
                      onYearChange={(v) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], endYear: v };
                          return c;
                        })
                      }
                    />
                  )}
                </div>
                {/* Score */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Score Type</label>
                    <select
                      value={edu.scoreType || "CGPA"}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], scoreType: e.target.value };
                          return c;
                        })
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="CGPA">CGPA</option>
                      <option value="Percentage">Percentage</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      {edu.scoreType === "Percentage" ? "Marks (%)" : "CGPA"}
                    </label>
                    <Input
                      value={edu.score || ""}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], score: e.target.value };
                          return c;
                        })
                      }
                      placeholder={
                        edu.scoreType === "Percentage" ? "85" : "3.8"
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Out Of</label>
                    <Input
                      value={edu.outOf || ""}
                      onChange={(e) =>
                        setEducation((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], outOf: e.target.value };
                          return c;
                        })
                      }
                      placeholder="4.0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Description</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={
                        improvingIdx.type === "education" &&
                        improvingIdx.index === i
                      }
                      onClick={() =>
                        handleImproveDescription(
                          "education",
                          i,
                          edu.description || "",
                          setEducation,
                        )
                      }
                    >
                      {improvingIdx.type === "education" &&
                      improvingIdx.index === i ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Improve with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={edu.description || ""}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], description: e.target.value };
                        return c;
                      })
                    }
                    placeholder="Describe your studies, achievements..."
                    className="h-20 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setEducation((prev) => [...prev, emptyEducation()])}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardContent>
      </Card>

      {/* ── SECTION 8 — Projects ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <SectionHeader icon={FolderGit2} title="Projects" />

          {projects.map((proj, i) => (
            <Card key={proj.id} className="border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {proj.title || "Project"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() =>
                      setProjects((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Project Title</label>
                    <Input
                      value={proj.title}
                      onChange={(e) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], title: e.target.value };
                          return c;
                        })
                      }
                      placeholder="AI Portfolio Generator"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      Organization (optional)
                    </label>
                    <Input
                      value={proj.organization}
                      onChange={(e) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], organization: e.target.value };
                          return c;
                        })
                      }
                      placeholder="Company / College"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Tech Stack</label>
                    <Input
                      value={proj.techStack}
                      onChange={(e) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], techStack: e.target.value };
                          return c;
                        })
                      }
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id={`proj-current-${i}`}
                      checked={proj.current || false}
                      onChange={(e) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], current: e.target.checked };
                          return c;
                        })
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor={`proj-current-${i}`} className="text-sm">
                      Ongoing Project
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">GitHub Link</label>
                    <Input
                      value={proj.github}
                      onChange={(e) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], github: e.target.value };
                          return c;
                        })
                      }
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Live Demo URL</label>
                    <Input
                      value={proj.liveUrl}
                      onChange={(e) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], liveUrl: e.target.value };
                          return c;
                        })
                      }
                      placeholder="https://yourproject.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DateSelect
                    label="Start Date"
                    monthValue={proj.startMonth || ""}
                    yearValue={proj.startYear || ""}
                    onMonthChange={(v) =>
                      setProjects((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], startMonth: v };
                        return c;
                      })
                    }
                    onYearChange={(v) =>
                      setProjects((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], startYear: v };
                        return c;
                      })
                    }
                  />
                  {!proj.current && (
                    <DateSelect
                      label="End Date"
                      monthValue={proj.endMonth || ""}
                      yearValue={proj.endYear || ""}
                      onMonthChange={(v) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], endMonth: v };
                          return c;
                        })
                      }
                      onYearChange={(v) =>
                        setProjects((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], endYear: v };
                          return c;
                        })
                      }
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Description</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={
                        improvingIdx.type === "project" &&
                        improvingIdx.index === i
                      }
                      onClick={() =>
                        handleImproveDescription(
                          "project",
                          i,
                          proj.description || "",
                          setProjects,
                        )
                      }
                    >
                      {improvingIdx.type === "project" &&
                      improvingIdx.index === i ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Improve with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={proj.description || ""}
                    onChange={(e) =>
                      setProjects((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], description: e.target.value };
                        return c;
                      })
                    }
                    placeholder="Describe what the project does and your role..."
                    className="h-24 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setProjects((prev) => [...prev, emptyProject()])}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </CardContent>
      </Card>

      {/* ── SECTION 9 — Certifications ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <SectionHeader icon={Award} title="Certifications" />

          {certifications.map((cert, i) => (
            <Card key={cert.id} className="border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {cert.name || "Certification"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() =>
                      setCertifications((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      Certificate Name
                    </label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        setCertifications((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], name: e.target.value };
                          return c;
                        })
                      }
                      placeholder="AWS Certified Developer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      Issuing Organization
                    </label>
                    <Input
                      value={cert.organization}
                      onChange={(e) =>
                        setCertifications((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], organization: e.target.value };
                          return c;
                        })
                      }
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Issue Date</label>
                    <Input
                      type="month"
                      value={cert.issueDate}
                      onChange={(e) =>
                        setCertifications((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], issueDate: e.target.value };
                          return c;
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      Credential URL
                    </label>
                    <Input
                      value={cert.credentialUrl}
                      onChange={(e) =>
                        setCertifications((prev) => {
                          const c = [...prev];
                          c[i] = { ...c[i], credentialUrl: e.target.value };
                          return c;
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setCertifications((prev) => [...prev, emptyCertification()])
            }
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
        </CardContent>
      </Card>

      {/* ── SECTION 10 — Achievements ── */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
          <SectionHeader icon={Trophy} title="Achievements" />

          {achievements.map((ach, i) => (
            <Card key={ach.id} className="border bg-muted/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {ach.title || "Achievement"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() =>
                      setAchievements((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Title</label>
                  <Input
                    value={ach.title}
                    onChange={(e) =>
                      setAchievements((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], title: e.target.value };
                        return c;
                      })
                    }
                    placeholder="Hackathon Winner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Description</label>
                  <Textarea
                    value={ach.description}
                    onChange={(e) =>
                      setAchievements((prev) => {
                        const c = [...prev];
                        c[i] = { ...c[i], description: e.target.value };
                        return c;
                      })
                    }
                    placeholder="Describe your achievement..."
                    className="h-20 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setAchievements((prev) => [...prev, emptyAchievement()])
            }
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Achievement
          </Button>
        </CardContent>
      </Card>

      {/* ── SECTION 11 — Template Selection ── */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <SectionHeader icon={Globe} title="Choose Template" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PORTFOLIO_TEMPLATE_LIST.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                  selectedTemplate === tmpl.id
                    ? "border-primary shadow-md scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  style={{
                    backgroundColor: tmpl.color,
                    height: "50px",
                    borderRadius: "6px",
                  }}
                  className="mb-2 flex items-center justify-center relative overflow-hidden"
                >
                  <div className="flex flex-col gap-1 w-2/3">
                    {[60, 80, 70, 90].map((w, idx) => (
                      <div
                        key={idx}
                        style={{
                          height: "3px",
                          width: `${w}%`,
                          backgroundColor: "rgba(255,255,255,0.7)",
                          borderRadius: "2px",
                          margin: "0 auto",
                        }}
                      />
                    ))}
                  </div>
                  {selectedTemplate === tmpl.id && (
                    <div
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-xs font-bold"
                      style={{ color: tmpl.color }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <p
                  className={`text-xs font-medium text-center truncate ${selectedTemplate === tmpl.id ? "text-primary" : ""}`}
                >
                  {tmpl.name}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom Generate Button ── */}
      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSave}
          disabled={isSaving || isGenerating}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>
        <Button
          className="flex-1"
          onClick={handleGenerate}
          disabled={isSaving || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Portfolio
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
