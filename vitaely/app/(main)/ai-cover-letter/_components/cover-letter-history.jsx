"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Search, FileText, Plus, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCoverLetterHistory } from "@/actions/cover-letter-history";
import CoverLetterActions from "./cover-letter-actions";

export default function CoverLetterHistory({ initialData = [] }) {
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState(initialData);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const data = await getCoverLetterHistory({ search, sortBy });
          setCoverLetters(data);
        } catch {
          // silently fail
        }
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search cover letters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SortAsc className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Searching...
        </p>
      )}

      {!isPending && coverLetters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-muted/60">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">No cover letters found</p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Generate your first cover letter to get started"}
            </p>
          </div>
          {!search && (
            <Button onClick={() => router.push("/ai-cover-letter/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Cover Letter
            </Button>
          )}
        </div>
      )}

      {coverLetters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coverLetters.map((cl) => {
            const templateLabel = (
              cl.template ?? cl.selectedTemplate ?? "modern-professional"
            ).replace(/-/g, " ");

            return (
              <Card key={cl.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug line-clamp-2 flex-1">
                      {cl.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0 capitalize"
                    >
                      {templateLabel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {cl.content}
                  </p>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {formatDistanceToNow(new Date(cl.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                  <CoverLetterActions coverLetter={cl} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}