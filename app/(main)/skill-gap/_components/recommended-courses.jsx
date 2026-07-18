"use client";

import { useState, useMemo } from "react";
import {
  ExternalLink,
  BookOpen,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DIFFICULTY_STYLES = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const INITIAL_VISIBLE = 6;

function CourseCard({ course }) {
  const difficultyStyle =
    DIFFICULTY_STYLES[course.difficulty] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

  function handleOpen() {
    if (course.url) window.open(course.url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="group flex flex-col hover:shadow-md transition-shadow duration-200 border border-border">
      <CardContent className="flex flex-col flex-1 gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {course.provider || "Online Platform"}
            </p>
          </div>
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>

        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-xs px-2 py-0.5 border-0 ${difficultyStyle}`}>
            {course.difficulty || "All Levels"}
          </Badge>

          {course.duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {course.duration}
            </span>
          )}

          {course.rating && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {Number(course.rating).toFixed(1)}
            </span>
          )}
        </div>

        {Array.isArray(course.skills) && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
            {course.skills.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{course.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* ✅ aria-label correctly applied here inside CourseCard scope */}
        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-full text-xs h-8"
          onClick={handleOpen}
          disabled={!course.url}
          aria-label={`Open ${course.title}`}
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          View Course
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
      <BookOpen className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
      <p className="text-sm text-muted-foreground">
        No courses available for this analysis.
      </p>
    </div>
  );
}

export default function RecommendedCourses({ courses = [] }) {
  const [showAll, setShowAll] = useState(false);

  const displayedCourses = useMemo(
    () => (showAll ? courses : courses.slice(0, INITIAL_VISIBLE)),
    [showAll, courses]
  );

  const hiddenCount = useMemo(
    () => Math.max(0, courses.length - INITIAL_VISIBLE),
    [courses]
  );

  function toggleShowAll() {
    setShowAll((prev) => !prev);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Recommended Courses
          </CardTitle>
          {courses.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.length === 0 ? (
            <EmptyState />
          ) : (
            displayedCourses.map((course, index) => (
              <CourseCard
                key={course.id ?? `${course.title}-${index}`}
                course={course}
              />
            ))
          )}
        </div>

        {/* ✅ Show More/Less button correctly uses toggleShowAll — no course scope here */}
        {hiddenCount > 0 && (
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowAll}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show {hiddenCount} More
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}