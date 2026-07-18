// fetchYouTubeVideos
// fetchVideosForMissingSkills
// formatDuration
// formatViewCount

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const formatDuration = (iso8601) => {
  if (!iso8601) return "";
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatViewCount = (count) => {
  if (!count) return "";
  const n = parseInt(count, 10);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
};

export const fetchYouTubeVideos = async (skill, options = {}) => {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY is not defined");
    return [];
  }

  const { maxResults = 3, order = "relevance" } = options;
  if (!skill?.trim()) return [];
  try {
    const searchQuery = encodeURIComponent(`${skill} complete tutorial`);
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${searchQuery}&type=video&videoDuration=medium&order=${order}&maxResults=${maxResults}&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;

    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    if (!searchRes.ok) {
      console.error(
        "YouTube search failed:",
        searchRes.status,
        searchRes.statusText,
      );
      return [];
    }

    const searchData = await searchRes.json();
    if (searchData.error) {
      console.error("YouTube API error:", searchData.error);
      return [];
    }
    if (!searchData.items?.length) return [];

    const videoIds = searchData.items
      .map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) return [];

    const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailsRes = await fetch(detailsUrl, { next: { revalidate: 86400 } });

    if (!detailsRes.ok) {
      console.error("YouTube details failed:", detailsRes.status);
      return [];
    }

    const detailsData = await detailsRes.json();
    if (detailsData.error) {
      console.error("YouTube details API error:", detailsData.error);
      return [];
    }
    if (!detailsData.items?.length) return [];

    return detailsData.items.map((item) => ({
      videoId: item.id,
      title: item.snippet?.title || "",
      channelName: item.snippet?.channelTitle || "",
      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",
      publishedAt: item.snippet?.publishedAt || "",
      duration: formatDuration(item.contentDetails?.duration),
      viewCount: formatViewCount(item.statistics?.viewCount),
      likeCount: item.statistics?.likeCount ?? null,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      skill,
    }));
  } catch (err) {
    console.error(`fetchYouTubeVideos error for "${skill}":`, err.message);
    return [];
  }
};

export const fetchVideosForMissingSkills = async (
  missingSkills = [],
  options = {},
) => {
  if (!missingSkills.length) return {};

  const { skillsLimit = 5, videosPerSkill = 3 } = options;

  const topSkills = missingSkills.slice(0, skillsLimit);

  const results = await Promise.allSettled(
    topSkills.map((skill) =>
      fetchYouTubeVideos(skill, { maxResults: videosPerSkill }),
    ),
  );

  return topSkills.map((skill, i) => ({
    skill,
    videos: results[i].status === "fulfilled" ? results[i].value : [],
  }));
};
