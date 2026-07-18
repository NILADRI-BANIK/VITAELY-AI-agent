import { getAllResumes } from "@/actions/resume";  // ← CHANGED: getResume → getAllResumes
import ResumeList from "./_components/resume-list"; // ← NEW LINE 1: import ResumeList component

export default async function ResumePage() {
  const resumes = await getAllResumes();  // ← CHANGED: fetch all resumes not just one

  return (
    <div className="container mx-auto py-6">
      {/* ← CHANGED: show ResumeList instead of ResumeBuilder directly */}
      <ResumeList initialResumes={resumes} />
    </div>
  );
}