"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoverLetter } from "@/hooks/use-cover-letter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Loader2,
  Brain,
  ChevronRight,
  BarChart3,
  Layers,
  Palette,
  ListChecks,
  User,
} from "lucide-react";
import { COVER_LETTER_TONES, DEFAULT_SECTIONS } from "@/constants/cover-letter";
import TemplateSelector from "./template-selector";
import CoverLetterPreviewPanel from "./cover-letter-preview-panel";
import JobAnalysisPanel from "./job-analysis-panel";

export default function CoverLetterGenerator({ initialData = null }) {
  const router = useRouter();
  const {
    formData,
    updateForm,
    coverLetter,
    jobAnalysis,
    isGenerating,
    isAnalyzing,
    analyzeJob,
    generate,
  } = useCoverLetter();

  const [activeTab, setActiveTab] = useState("details");

  const handleGenerate = async () => {
    const result = await generate(initialData?.id || null);
    if (result) router.push(`/ai-cover-letter/${result.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Cover Letter Generator</h1>
              <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.jobTitle || !formData.companyName}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Cover Letter</>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="details" className="gap-1 text-xs">
                  <ChevronRight className="h-3 w-3" />Details
                </TabsTrigger>
                <TabsTrigger value="style" className="gap-1 text-xs">
                  <Palette className="h-3 w-3" />Style
                </TabsTrigger>
                <TabsTrigger value="sections" className="gap-1 text-xs">
                  <ListChecks className="h-3 w-3" />Sections
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-1 text-xs">
                  <Brain className="h-3 w-3" />Analysis
                </TabsTrigger>
              </TabsList>

              {/* Tab: Details */}
              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Your Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="e.g. Jane Doe"
                          value={formData.yourName}
                          onChange={(e) => updateForm("yourName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="e.g. jane@example.com"
                          value={formData.yourEmail}
                          onChange={(e) => updateForm("yourEmail", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          placeholder="e.g. +1 (555) 000-0000"
                          value={formData.yourPhone}
                          onChange={(e) => updateForm("yourPhone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Years of Experience</Label>
                        <Input
                          placeholder="e.g. 5 years"
                          value={formData.yourExperience}
                          onChange={(e) => updateForm("yourExperience", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Key Skills</Label>
                      <Textarea
                        placeholder="e.g. Node.js, React, PostgreSQL, AWS..."
                        rows={2}
                        value={formData.yourSkills}
                        onChange={(e) => updateForm("yourSkills", e.target.value)}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Job Title *</Label>
                        <Input
                          placeholder="e.g. Senior Developer"
                          value={formData.jobTitle}
                          onChange={(e) => updateForm("jobTitle", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Company Name *</Label>
                        <Input
                          placeholder="e.g. Google"
                          value={formData.companyName}
                          onChange={(e) => updateForm("companyName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Job Description</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={analyzeJob}
                          disabled={isAnalyzing || !formData.jobDescription.trim()}
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Brain className="h-3 w-3" />
                          )}
                          Analyze
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Paste the full job description here for best results..."
                        rows={8}
                        value={formData.jobDescription}
                        onChange={(e) => updateForm("jobDescription", e.target.value)}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tone Selector */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Writing Tone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {COVER_LETTER_TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => updateForm("tone", tone.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm ${
                            formData.tone === tone.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className="text-base">{tone.icon}</span>
                          <div>
                            <p className="font-medium text-xs">{tone.label}</p>
                            <p className="text-xs text-muted-foreground">{tone.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Style */}
              <TabsContent value="style" className="space-y-4 mt-4">
                <TemplateSelector
                  selected={formData.template}
                  onSelect={(t) => updateForm("template", t)}
                />
              </TabsContent>

              {/* Tab: Sections */}
              <TabsContent value="sections" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Section Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DEFAULT_SECTIONS.map((section) => (
                      <div key={section.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{section.label}</p>
                          {section.required && (
                            <Badge variant="outline" className="text-xs mt-0.5">Required</Badge>
                          )}
                        </div>
                        <Switch
                          checked={formData.sectionsConfig[section.id] ?? true}
                          disabled={section.required}
                          onCheckedChange={(checked) =>
                            updateForm("sectionsConfig", {
                              ...formData.sectionsConfig,
                              [section.id]: checked,
                            })
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Analysis */}
              <TabsContent value="analysis" className="mt-4">
                <JobAnalysisPanel analysis={jobAnalysis} isAnalyzing={isAnalyzing} />
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CoverLetterPreviewPanel
              formData={formData}
              coverLetter={coverLetter}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}