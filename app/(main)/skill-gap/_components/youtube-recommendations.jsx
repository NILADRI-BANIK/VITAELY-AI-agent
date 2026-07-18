"use client";

import { useState } from "react";
import {
  Youtube,
  Play,
  Eye,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// getSkillColor
// VideoCard
// SkillSection
// YoutubeRecommendations

const SKILL_COLORS = [
  {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
];

const getSkillColor = (index) => SKILL_COLORS[index % SKILL_COLORS.length];

function VideoCard({ video }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-slate-100 bg-white overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
        {video.thumbnail && !imgError ? (
          <img
            src={video.thumbnail}
            alt={video.title || "YouTube video thumbnail"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <Youtube className="w-10 h-10 text-red-500 opacity-60" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            <Play className="w-5 h-5 text-red-600 ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
          {video.title}
        </h4>

        <p className="text-[11px] text-slate-500 font-medium truncate">
          {video.channelName}
        </p>

        <div className="flex items-center gap-3 mt-auto pt-1">
          {video.viewCount && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Eye className="w-3 h-3" />
              {video.viewCount}
            </span>
          )}
          {video.likeCount !== null && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <ThumbsUp className="w-3 h-3" />
              {Number(video.likeCount).toLocaleString()}
            </span>
          )}
          <ExternalLink className="w-3 h-3 text-slate-300 ml-auto group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </a>
  );
}

function SkillSection({ skillData, index, isExpanded, onToggle }) {
  const { skill, videos } = skillData;
  const color = getSkillColor(index);

  if (!videos?.length) return null;

  return (
    <div className={`rounded-xl border ${color.border} overflow-hidden`}>
      {/* Skill header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 ${color.bg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
          <span className={`text-sm font-bold ${color.text} truncate`}>
            {skill}
          </span>
          <Badge
            className={`text-[10px] px-2 py-0.5 rounded-full border-0 flex-shrink-0 ${color.badge}`}
          >
            {videos.length} video{videos.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className={`w-4 h-4 flex-shrink-0 ${color.text}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 flex-shrink-0 ${color.text}`} />
        )}
      </button>

      {/* Video grid */}
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map((video, i) => (
              <VideoCard key={video.videoId || `${skill}-${i}`} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function YoutubeRecommendations({ youtubeVideos = [] }) {
  const [expandedSkill, setExpandedSkill] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const validData = youtubeVideos.filter(
    (item) =>
      item?.skill && Array.isArray(item?.videos) && item.videos.length > 0,
  );

  if (!validData.length) return null;

  const INITIAL_SHOW = 3;
  const visible = showAll ? validData : validData.slice(0, INITIAL_SHOW);
  const hasMore = validData.length > INITIAL_SHOW;

  const totalVideos = validData.reduce(
    (sum, item) => sum + item.videos.length,
    0,
  );

  const toggleSkill = (i) => setExpandedSkill(expandedSkill === i ? null : i);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
            <Youtube className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              YouTube Tutorials
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated videos for your missing skills
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs border-red-200 text-red-600 bg-red-50"
          >
            {validData.length} skill{validData.length !== 1 ? "s" : ""}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs border-slate-200 text-slate-500"
          >
            {totalVideos} video{totalVideos !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Skill sections */}
      <div className="space-y-3">
        {visible.map((skillData, i) => (
          <SkillSection
            key={`${skillData.skill}-${i}`}
            skillData={skillData}
            index={i}
            isExpanded={expandedSkill === i}
            onToggle={() => toggleSkill(i)}
          />
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1.5" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1.5" />
                Show {validData.length - INITIAL_SHOW} More Skills
              </>
            )}
          </Button>
        </div>
      )}

      {/* Footer note */}
      <p className="text-[11px] text-slate-400 text-center pt-1">
        Videos sourced from YouTube · Click any card to watch
      </p>
    </div>
  );
}
