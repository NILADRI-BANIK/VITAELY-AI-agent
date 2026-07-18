const GITHUB_BASE_URL = "https://api.github.com";

const githubFetch = async (endpoint, params = {}) => {
  const url = new URL(`${GITHUB_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const searchRepositories = async (query, options = {}) => {
  try {
    const data = await githubFetch("search/repositories", {
      q: query,
      sort: options.sort || "stars",
      order: options.order || "desc",
      per_page: options.limit || 6,
    });
    return data.items || [];
  } catch (error) {
    console.error("searchRepositories error:", error.message);
    return [];
  }
};

export const fetchProjectSuggestionsForSkill = async (skill, options = {}) => {
  try {
    const query = `${skill} beginner project tutorial`;
    const repos = await searchRepositories(query, {
      sort: "stars",
      limit: options.limit || 5,
    });

    return repos.map((repo) => ({
      title: repo.name,
      description: repo.description || "No description available",
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      topics: repo.topics || [],
    }));
  } catch (error) {
    console.error("fetchProjectSuggestionsForSkill error:", error.message);
    return [];
  }
};

export const fetchTrendingRepositories = async (language, options = {}) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const since = date.toISOString().split("T")[0];

    const query = language
      ? `language:${language} created:>${since}`
      : `created:>${since} stars:>50`;

    const repos = await searchRepositories(query, {
      sort: "stars",
      limit: options.limit || 6,
    });

    return repos.map((repo) => ({
      title: repo.name,
      description: repo.description || "No description available",
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      topics: repo.topics || [],
    }));
  } catch (error) {
    console.error("fetchTrendingRepositories error:", error.message);
    return [];
  }
};

export const fetchProjectsBySkills = async (skills = [], options = {}) => {
  try {
    if (!skills.length) return [];

    const topSkills = skills.slice(0, 3).join("+");
    const query = `${topSkills} project`;

    const repos = await searchRepositories(query, {
      sort: "stars",
      limit: options.limit || 6,
    });

    return repos.map((repo) => ({
      title: repo.name,
      description: repo.description || "No description available",
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      topics: repo.topics || [],
    }));
  } catch (error) {
    console.error("fetchProjectsBySkills error:", error.message);
    return [];
  }
};

export const fetchRepositoryTopics = async (owner, repo) => {
  try {
    const data = await githubFetch(`repos/${owner}/${repo}/topics`);
    return data.names || [];
  } catch (error) {
    console.error("fetchRepositoryTopics error:", error.message);
    return [];
  }
};