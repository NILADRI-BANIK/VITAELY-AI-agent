"use client";

import { useState } from "react";
import { ShieldAlert, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EthicsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-52" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function EthicsCard({
  ethicalConsiderations = [],
  loading = false,
  emptyMessage = "No ethical considerations available yet.",
  interactive = true,
}) {
  const [checked, setChecked] = useState({});

  if (loading) {
    return <EthicsSkeleton />;
  }

  const items = Array.isArray(ethicalConsiderations)
    ? ethicalConsiderations
    : typeof ethicalConsiderations === "string" && ethicalConsiderations.trim()
      ? [ethicalConsiderations]
      : [];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <ShieldAlert className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const toggleItem = (index) => {
    if (!interactive) return;
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 shrink-0">
              <ShieldAlert className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Ethical Considerations
            </CardTitle>
          </div>
          {interactive && (
            <Badge variant="outline" className="text-xs">
              {checkedCount}/{items.length} reviewed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {items.map((item, i) => {
            const text = typeof item === "string" ? item : (item.text ?? item.description ?? "");
            const isChecked = Boolean(checked[i]);

            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggleItem(i)}
                  disabled={!interactive}
                  className={`w-full flex items-start gap-2.5 text-left rounded-md px-2 py-1.5 -mx-2 transition-colors ${
                    interactive ? "hover:bg-muted/60 cursor-pointer" : "cursor-default"
                  }`}
                >
                  {interactive ? (
                    isChecked ? (
                      <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    )
                  ) : (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                  )}
                  <span
                    className={`text-sm leading-relaxed ${
                      isChecked ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}