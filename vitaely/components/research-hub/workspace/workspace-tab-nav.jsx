"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Youtube,
  BookOpen,
  Network,
  BarChart3,
  Database,
  Wrench,
  Search,
  StickyNote,
} from "lucide-react";

const TABS = [
  { key: "", label: "Overview", icon: LayoutDashboard },
  { key: "papers", label: "Papers", icon: FileText },
  { key: "videos", label: "Videos", icon: Youtube },
  { key: "tutorials", label: "Tutorials", icon: BookOpen },
  { key: "similar", label: "Similar Topics", icon: Network },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "datasets", label: "Datasets", icon: Database },
  { key: "tools", label: "Tools", icon: Wrench },
  { key: "gaps", label: "Gap Preview", icon: Search },
  { key: "notes", label: "Notes", icon: StickyNote },
];

export default function WorkspaceTabNav({ topicId }) {
  const pathname = usePathname();
  const basePath = `/research-hub/topic-recommender/${topicId}`;

  return (
    <div className="border-b border-border overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max pb-px">
        {TABS.map((tab) => {
          const href = tab.key ? `${basePath}/${tab.key}` : basePath;
          const isActive =
            tab.key === "" ? pathname === basePath : pathname.startsWith(href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key || "overview"}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}