"use client";

import { useState } from "react";
import {
  Youtube,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { markViewedVideo } from "@/actions/research-hub/topic-workspace";

function formatPublishedDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function VideoCard({ video, topicId }) {
  const publishedText = formatPublishedDate(video.publishedAt);

  function handleClick() {
    if (!video.url) return;
    if (topicId) {
      markViewedVideo(topicId, video).catch(() => {});
    }
    window.open(video.url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!video.url}
      className="w-full text-left"
    >
      <Card className="w-full border border-border hover:border-primary/40 transition-colors overflow-hidden">
        <div className="relative w-full aspect-video bg-muted">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Youtube className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {video.duration && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
              {video.duration}
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
            <PlayCircle className="w-10 h-10 text-white" />
          </div>
        </div>
        <CardContent className="pt-3 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {video.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {video.channelName}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {video.viewCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {video.viewCount}
              </span>
            )}
            {publishedText && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {publishedText}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function YoutubeSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="w-full overflow-hidden">
          <Skeleton className="w-full aspect-video rounded-none" />
          <CardContent className="pt-3 flex flex-col gap-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function YoutubeSection({
  videos = [],
  loading = false,
  error = null,
  topicId = null,
}) {
  if (loading) return <YoutubeSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load learning videos
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Youtube className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No learning videos found for this topic yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{videos.length}</span>{" "}
        video{videos.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, i) => (
          <VideoCard
            key={video.videoId ?? i}
            video={video}
            topicId={topicId}
          />
        ))}
      </div>
    </div>
  );
}