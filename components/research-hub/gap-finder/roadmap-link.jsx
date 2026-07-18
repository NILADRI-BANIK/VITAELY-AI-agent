"use client";

import { useRouter } from "next/navigation";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RoadmapLink({ gap, topicId }) {
  const router = useRouter();

  function handleClick() {
    const title = gap?.gap ?? gap?.title ?? gap?.gapTitle ?? "";
    const params = new URLSearchParams();
    if (title) params.set("topic", title);
    if (topicId) params.set("topicId", topicId);

    router.push(`/research-hub/roadmap-generator?${params.toString()}`);
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <Map className="w-3.5 h-3.5 mr-1.5" />
      Generate Roadmap
    </Button>
  );
}