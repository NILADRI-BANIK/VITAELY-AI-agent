// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;

        // ← NEW LINES: show score only for Education entries
        const scoreLine =
          type === "Education" && entry.marks
            ? `\n${entry.scoreType}: ${entry.marks}${entry.outOf ? ` / ${entry.outOf}` : ""}${entry.scoreType === "Percentage" ? "%" : ""}`
            : "";

        return `### ${entry.title} @ ${entry.organization}\n${dateRange}${scoreLine}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}