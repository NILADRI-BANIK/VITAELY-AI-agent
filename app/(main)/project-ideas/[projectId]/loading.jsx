import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Back Button Skeleton ── */}
      <Skeleton className="h-8 w-24 rounded-md" />

      {/* ── Project Card Skeleton ── */}
      <div className="border rounded-xl p-6 space-y-5 bg-card">

        {/* ── Title Row ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-7 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>

        {/* ── Score Row ── */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
          <Skeleton className="h-8 w-8 rounded-md ml-auto" />
        </div>

        {/* ── Separator ── */}
        <Skeleton className="h-px w-full rounded" />

        {/* ── Description ── */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>

        {/* ── Tech Stack ── */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* ── Core Features ── */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded" />
          <div className="space-y-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full rounded" />
            ))}
          </div>
        </div>

        {/* ── Learning Outcomes ── */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* ── Target Users + Problem Solved ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>

        {/* ── Accordion Sections ── */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="border rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── GitHub Structure Guide Skeleton ── */}
      <div className="border rounded-xl p-5 space-y-4 bg-card">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-44 rounded-md" />
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

    </div>
  );
}