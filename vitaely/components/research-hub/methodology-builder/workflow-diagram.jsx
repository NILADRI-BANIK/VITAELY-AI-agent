"use client";

import {
  Lightbulb,
  BookOpen,
  Search,
  FlaskConical,
  Database,
  BarChart2,
  ShieldCheck,
  Award,
  Rocket,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_STEPS = [
  { key: "problem", label: "Problem Statement", icon: Lightbulb, color: "text-orange-500", bg: "bg-orange-500/10" },
  { key: "literature", label: "Literature Review", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "gap", label: "Gap Identification", icon: Search, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "methodology", label: "Methodology Design", icon: FlaskConical, color: "text-teal-500", bg: "bg-teal-500/10" },
  { key: "collection", label: "Data Collection", icon: Database, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "analysis", label: "Data Analysis", icon: BarChart2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { key: "validation", label: "Validation", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
  { key: "findings", label: "Findings", icon: Award, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  { key: "future", label: "Future Work", icon: Rocket, color: "text-pink-500", bg: "bg-pink-500/10" },
];

function WorkflowSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-32 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkflowDiagram({
  steps = null,
  activeStep = null,
  loading = false,
}) {
  if (loading) {
    return <WorkflowSkeleton />;
  }

  const resolvedSteps = Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_STEPS;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <FlaskConical className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Research Workflow</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="hidden md:flex items-center flex-wrap gap-y-4">
          {resolvedSteps.map((step, i) => {
            const Icon = step.icon ?? FlaskConical;
            const isActive = activeStep ? activeStep === step.key : false;
            const isLast = i === resolvedSteps.length - 1;

            return (
              <div key={step.key ?? i} className="flex items-center">
                <div
                  className={`flex flex-col items-center gap-1.5 w-28 text-center rounded-lg px-2 py-3 border transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className={`p-2 rounded-full ${step.bg ?? "bg-primary/10"} shrink-0`}>
                    <Icon className={`w-4 h-4 ${step.color ?? "text-primary"}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground leading-tight">
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex md:hidden flex-col items-center gap-2">
          {resolvedSteps.map((step, i) => {
            const Icon = step.icon ?? FlaskConical;
            const isActive = activeStep ? activeStep === step.key : false;
            const isLast = i === resolvedSteps.length - 1;

            return (
              <div key={step.key ?? i} className="flex flex-col items-center">
                <div
                  className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 border transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className={`p-2 rounded-full ${step.bg ?? "bg-primary/10"} shrink-0`}>
                    <Icon className={`w-4 h-4 ${step.color ?? "text-primary"}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                </div>
                {!isLast && (
                  <ArrowDown className="w-4 h-4 text-muted-foreground shrink-0 my-1" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}