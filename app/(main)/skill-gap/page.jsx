import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import SkillGapAnalyzer from "./_components/skill-gap-analyzer";

// SkillGapPage

export default async function SkillGapPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userData = {
    id: user.id,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.emailAddresses?.[0]?.emailAddress ?? null,
    imageUrl: user.imageUrl ?? null,
  };

  return (
    <main className="w-full">
      <SkillGapAnalyzer user={userData} />
    </main>
  );
}