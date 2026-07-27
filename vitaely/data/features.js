import {
  FileText,
  BrainCircuit,
  FileArchive,
  FileOutput,
  Globe,
  TrendingUp,
  Lightbulb,
  Mail,
  BookOpen,
} from "lucide-react";

export const features = [
  {
    icon: <FileText className="w-10 h-10 mb-4 text-primary" />,
    title: "PDF to Word Converter",
    description:
      "Convert your PDF documents to Word instantly and save your conversion history.",
    href: "/pdf-to-word",
  },
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "ATS Score Checker",
    description:
      "Check your resume ATS score instantly and get AI-powered feedback to improve it.",
    href: "/ats-score",
  },
  {
    icon: <FileArchive className="w-10 h-10 mb-4 text-primary" />,
    title: "PDF Compressor",
    description:
      "Compress your PDF files instantly, reduce file size and download optimized PDF.",
    href: "/pdf-compress",
  },
  {
    icon: <Globe className="w-10 h-10 mb-4 text-primary" />,
    title: "Portfolio Website Generator",
    description:
      "Generate a stunning personal portfolio website instantly using AI from your resume data.",
    href: "/portfolio-generator",
  },
  {
    icon: <FileOutput className="w-10 h-10 mb-4 text-primary" />,
    title: "Word to PDF Converter",
    description:
      "Convert your Word documents to PDF instantly and save your conversion history.",
    href: "/word-to-pdf",
  },
  {
    icon: <TrendingUp className="w-10 h-10 mb-4 text-primary" />,
    title: "Skill Gap Analyzer",
    description:
      "Identify missing skills for your dream job and get a personalized learning roadmap.",
    href: "/skill-gap",
  },
  {
    icon: <Lightbulb className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Project Idea Generator",
    description:
      "Get personalized project ideas based on your skills, experience, and career goals.",
    href: "/project-ideas",
  },
  {
    icon: <Mail className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Email Writer",
    description:
      "Write professional job application emails, follow-ups, and thank you notes using AI.",
    href: "/email-writer",
  },
  {
    icon: <BookOpen className="w-10 h-10 mb-4 text-primary" />,
    title: "Research & Publication Hub",
    description:
      "Discover research topics, find papers, analyze gaps, and get step-by-step guidance to publish your research.",
    href: "/research-hub",
  },
];
