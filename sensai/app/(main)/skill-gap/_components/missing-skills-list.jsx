"use client";

import { useState, useMemo } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MissingSkillsList = ({ missingSkills = [], targetRole = "" }) => {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      missingSkills.filter((skill) =>
        skill.toLowerCase().includes(normalizedSearch),
      ),
    [missingSkills, normalizedSearch],
  );

  if (!missingSkills.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Missing Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-2 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No missing skills detected. You are well-qualified!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Missing Skills
            </CardTitle>
            {targetRole && (
              <CardDescription>
                Skills required for{" "}
                <span className="font-medium text-foreground">
                  {targetRole}
                </span>{" "}
                that you need to learn
              </CardDescription>
            )}
          </div>
          <Badge variant="destructive" className="text-xs shrink-0">
            {missingSkills.length} missing
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {missingSkills.length > 6 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search missing skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        )}

        {filtered.length === 0 && search ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skills match &quot;{search}&quot;
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="secondary"
                className="text-sm px-3 py-1 cursor-default hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {search && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {missingSkills.length} skills
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MissingSkillsList;
