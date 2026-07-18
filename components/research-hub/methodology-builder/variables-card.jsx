"use client";

import { ArrowRight, ArrowLeftRight, Shield, GitBranch, Variable } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VARIABLE_GROUPS = [
  {
    key: "independent",
    label: "Independent Variables",
    description: "Variables manipulated or presumed to cause change",
    icon: ArrowRight,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "dependent",
    label: "Dependent Variables",
    description: "Outcomes being measured",
    icon: Variable,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    key: "moderator",
    label: "Moderator Variables",
    description: "Affects strength/direction of the relationship",
    icon: ArrowLeftRight,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    key: "mediator",
    label: "Mediator Variables",
    description: "Explains the mechanism between variables",
    icon: GitBranch,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    key: "control",
    label: "Control Variables",
    description: "Held constant to isolate the effect",
    icon: Shield,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
];

function VariablesSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function VariablesCard({
  variables = null,
  loading = false,
  emptyMessage = "No variable mapping available yet.",
}) {
  if (loading) {
    return <VariablesSkeleton />;
  }

  const hasAny =
    variables &&
    VARIABLE_GROUPS.some(
      (g) => Array.isArray(variables[g.key]) && variables[g.key].length > 0,
    );

  if (!hasAny) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Variable className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <Variable className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Variable Mapping</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {VARIABLE_GROUPS.map((group) => {
          const items = Array.isArray(variables[group.key]) ? variables[group.key] : [];
          if (items.length === 0) return null;

          const Icon = group.icon;

          return (
            <div
              key={group.key}
              className="flex flex-col gap-1.5 pb-4 border-b border-border last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${group.bg} shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${group.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{group.label}</p>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-8">
                {items.map((v, i) => (
                  <Badge key={`${group.key}-${v}-${i}`} variant="secondary" className="text-xs">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}