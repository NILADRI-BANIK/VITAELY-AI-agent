"use client";

import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { groupSkillsByPriority } from "@/lib/skill-gap-utils";

const PRIORITY_CONFIG = {
  high: {
    label: "High Priority",
    description: "Learn these first — most in-demand for your target role",
    icon: AlertTriangle,
    badgeClass: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    headerClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-200 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  medium: {
    label: "Medium Priority",
    description: "Important skills to learn after high priority ones",
    icon: ArrowRight,
    badgeClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    headerClass: "text-yellow-600 dark:text-yellow-400",
    borderClass: "border-yellow-200 dark:border-yellow-800",
    dotClass: "bg-yellow-500",
  },
  low: {
    label: "Low Priority",
    description: "Nice to have — learn these after mastering the essentials",
    icon: Minus,
    badgeClass: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    headerClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
};

const PrioritySection = ({ priority, skills }) => {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  if (!skills.length) return null;

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${config.borderClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.headerClass}`} />
          <span className={`text-sm font-semibold ${config.headerClass}`}>
            {config.label}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {skills.length} {skills.length === 1 ? "skill" : "skills"}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">{config.description}</p>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${config.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const PrioritySkills = ({ prioritySkills = {} }) => {
const grouped = useMemo(() => {
  if (Array.isArray(prioritySkills)) {
    return groupSkillsByPriority(prioritySkills);
  }
  return {
    high: prioritySkills?.high || [],
    medium: prioritySkills?.medium || [],
    low: prioritySkills?.low || [],
  };
}, [prioritySkills]);

  const totalCount = useMemo(
    () => grouped.high.length + grouped.medium.length + grouped.low.length,
    [grouped]
  );

  if (!grouped.high.length && !grouped.medium.length && !grouped.low.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-medium">Priority Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No priority skills data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Priority Skills</CardTitle>
            <CardDescription>
              Focus on these skills in order of priority
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {totalCount} total
          </Badge>
        </div>

        <div className="flex items-center gap-4 pt-2">
          {Object.entries(grouped).map(([priority, skills]) =>
            skills.length > 0 ? (
              <div key={priority} className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${PRIORITY_CONFIG[priority].dotClass}`}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {priority}: {skills.length}
                </span>
              </div>
            ) : null
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <PrioritySection priority="high" skills={grouped.high} />
        <PrioritySection priority="medium" skills={grouped.medium} />
        <PrioritySection priority="low" skills={grouped.low} />
      </CardContent>
    </Card>
  );
};

export default PrioritySkills;