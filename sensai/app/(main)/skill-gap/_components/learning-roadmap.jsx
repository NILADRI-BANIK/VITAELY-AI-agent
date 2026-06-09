"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Clock, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const StepStatus = ({ index, total }) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 ${
          isFirst
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-background text-muted-foreground"
        }`}
      >
        {index + 1}
      </div>
      {!isLast && (
        <div className="mt-1 h-full w-0.5 bg-muted-foreground/20 min-h-[20px]" />
      )}
    </div>
  );
};

const ResourceLink = ({ resource }) => {
  const isUrl =
    typeof resource === "string" &&
    (resource.startsWith("http://") || resource.startsWith("https://"));

  if (isUrl) {
    return (
      <a
        href={resource}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        {resource.length > 50 ? `${resource.slice(0, 50)}...` : resource}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <BookOpen className="h-3 w-3 shrink-0" />
      <span>{resource}</span>
    </div>
  );
};

const LearningRoadmap = ({ roadmap = [], targetRole = "" }) => {
  const totalDuration = useMemo(() => {
    if (!roadmap.length) return null;
    const last = roadmap[roadmap.length - 1];
    return last?.duration || null;
  }, [roadmap]);

  if (!roadmap.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-medium">Learning Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No roadmap data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-medium">Learning Roadmap</CardTitle>
            {targetRole && (
              <CardDescription>
                Step-by-step path to become a{" "}
                <span className="font-medium text-foreground">{targetRole}</span>
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">
              {roadmap.length} steps
            </Badge>
            {totalDuration && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                {totalDuration}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {roadmap.map((step, index) => (
            <AccordionItem
              key={`step-${index}`}
              value={`step-${index}`}
              className="border rounded-lg px-1 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="hover:no-underline px-3 py-3">
                <div className="flex items-center gap-3 text-left w-full pr-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 ${
                      index === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 text-muted-foreground"
                    }`}
                  >
                    {step.step ?? index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {step.title || `Step ${index + 1}`}
                    </p>
                    {step.duration && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.duration}
                      </p>
                    )}
                  </div>

                  {index === 0 && (
                    <Badge className="text-xs shrink-0 hidden sm:inline-flex">
                      Start here
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-3 pb-4">
                <div className="ml-10 space-y-3">
                  {step.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  )}

                  {Array.isArray(step.resources) && step.resources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Resources
                      </p>
                      <div className="space-y-1.5 pl-2 border-l-2 border-muted">
                        {step.resources.map((resource, rIndex) => (
                          <ResourceLink
                            key={`resource-${index}-${rIndex}`}
                            resource={resource}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {index < roadmap.length - 1 ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Circle className="h-3 w-3" />
                        <span>Not started</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Final step</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default LearningRoadmap;