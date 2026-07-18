const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_COUNTRY = "in";

if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
  console.warn(
    "ADZUNA_APP_ID or ADZUNA_APP_KEY is not defined in environment variables",
  );
}

const buildAdzunaUrl = (endpoint, params = {}) => {
  const url = new URL(`${ADZUNA_BASE_URL}/${ADZUNA_COUNTRY}/${endpoint}`);
  url.searchParams.set("app_id", process.env.ADZUNA_APP_ID);
  url.searchParams.set("app_key", process.env.ADZUNA_APP_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

export const fetchJobListings = async (role, options = {}) => {
  try {
    const url = buildAdzunaUrl("search/1", {
      what: role,
      results_per_page: options.limit || 10,
      sort_by: "relevance",
    });
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Adzuna API error: ${response.status}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("fetchJobListings error:", error.message);
    return [];
  }
};

export const extractSkillsFromListings = (listings) => {
  try {
    const skillKeywords = [
      "javascript",
      "typescript",
      "python",
      "java",
      "react",
      "nextjs",
      "nodejs",
      "express",
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "gcp",
      "git",
      "github",
      "graphql",
      "rest",
      "api",
      "html",
      "css",
      "tailwind",
      "figma",
      "machine learning",
      "deep learning",
      "tensorflow",
      "pytorch",
      "sql",
      "nosql",
      "linux",
      "ci/cd",
      "agile",
      "scrum",
      "c++",
      "c#",
      "golang",
      "rust",
      "swift",
      "kotlin",
      "flutter",
    ];

    const skillCount = {};
    listings.forEach((listing) => {
      const text =
        `${listing.title || ""} ${listing.description || ""}`.toLowerCase();
      skillKeywords.forEach((skill) => {
        if (text.includes(skill)) {
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        }
      });
    });

    return Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([skill]) => skill);
  } catch (error) {
    console.error("extractSkillsFromListings error:", error.message);
    return [];
  }
};

export const fetchRequiredSkillsForRole = async (role) => {
  try {
    const listings = await fetchJobListings(role, { limit: 20 });
    if (!listings.length) return [];
    return extractSkillsFromListings(listings);
  } catch (error) {
    console.error("fetchRequiredSkillsForRole error:", error.message);
    return [];
  }
};

export const fetchJobSalaryData = async (role) => {
  try {
    const url = buildAdzunaUrl("histogram", {
      what: role,
    });
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Adzuna salary API error: ${response.status}`);
    const data = await response.json();
    return data.histogram || {};
  } catch (error) {
    console.error("fetchJobSalaryData error:", error.message);
    return {};
  }
};

export const fetchJobCount = async (role) => {
  try {
    const url = buildAdzunaUrl("search/1", {
      what: role,
      results_per_page: 1,
    });
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Adzuna job count error: ${response.status}`);
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error("fetchJobCount error:", error.message);
    return 0;
  }
};
