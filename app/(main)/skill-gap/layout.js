export const metadata = {
  title: "Skill Gap Analyzer | SensAI",
  description:
    "Analyze your skill gaps for any role and get a personalized AI-powered learning roadmap.",
  openGraph: {
    title: "Skill Gap Analyzer | SensAI",
    description:
      "Analyze your skill gaps for any role and get a personalized AI-powered learning roadmap.",
    type: "website",
  },
};

// SkillGapLayout

export default function SkillGapLayout({ children }) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}