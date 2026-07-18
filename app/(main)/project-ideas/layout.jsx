export const metadata = {
  title: "AI Project Idea Generator | SensAI",
  description:
    "Generate personalized software project ideas based on your skills, experience level, and career goals. Get roadmaps, tech stack recommendations, and resume impact scores.",
  keywords: [
    "AI project ideas",
    "project idea generator",
    "software projects",
    "developer projects",
    "career projects",
    "resume projects",
    "SensAI",
  ],
  openGraph: {
    title: "AI Project Idea Generator | SensAI",
    description:
      "Generate personalized software project ideas based on your skills and career goals.",
    type: "website",
    images: ["/og-project-generator.png"],
  },
  alternates: {
    canonical: "/project-ideas",
  },
};

export default function ProjectIdeasLayout({ children }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
