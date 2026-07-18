"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  value = "",
  onChange,
  placeholder = "Search by title, keyword, or description...",
}) {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-lg border border-input bg-background pl-9 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {value && value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}