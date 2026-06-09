
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectIdeasLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-6xl">

        {/* ── Page Header Skeleton ── */}
        <div className="text-center mb-10 space-y-3">
          <Skeleton className="h-10 w-72 mx-auto rounded-lg" />
          <Skeleton className="h-5 w-96 mx-auto rounded-md" />
        </div>

 {/* ── Tabs Skeleton ── */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Form Skeleton (left panel) ── */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-6 space-y-5 bg-card">
              <Skeleton className="h-6 w-40 rounded-md" />

              {/* Skill Input */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              </div>

              {/* Domain Selector */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Complexity */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Project Count */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Generate Button */}
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </div>

          {/* ── Project Cards Skeleton (right panel) ── */}
          <div className="lg:col-span-2 space-y-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border rounded-xl p-6 space-y-4 bg-card"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-6 w-16 rounded-full" />
                  ))}
                </div>

              {/* Scores Row */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                  {[1, 2, 3].map((k) => (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-3 w-8 rounded" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 4].map((l) => (
                    <Skeleton key={l} className="h-9 w-20 rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}