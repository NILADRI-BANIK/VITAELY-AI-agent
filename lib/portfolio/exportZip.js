"use client";

function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────
// HELPER — safe URL (prevents javascript: injection)
// ─────────────────────────────────────────────
function safeUrl(url) {
  if (!url) return "#";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return url;
  }
  return `https://${url}`;
}

// ─────────────────────────────────────────────
// HELPER — safe filename
// ─────────────────────────────────────────────
function safeFilename(name = "portfolio") {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "portfolio"
  );
}

// ─────────────────────────────────────────────
// HELPER — generate skills HTML block
// ─────────────────────────────────────────────
function buildSkillsHTML(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return "";
  return skills
    .map(
      (group) => `
      <div class="skill-group">
        <span class="skill-category">${escapeHTML(group.category || "")}:</span>
        <span class="skill-list">${
          Array.isArray(group.skills)
            ? group.skills.map((s) => escapeHTML(s)).join(", ")
            : escapeHTML(group.skills || "")
        }</span>
      </div>`,
    )
    .join("");
}

// ─────────────────────────────────────────────
// HELPER — generate experience HTML block
// ─────────────────────────────────────────────
function buildExperienceHTML(experience) {
  if (!Array.isArray(experience) || experience.length === 0) return "";
  return experience
    .map(
      (exp) => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <h3 class="entry-title">${escapeHTML(exp.title || "")}</h3>
            <p class="entry-sub">${escapeHTML(exp.company || exp.organization || "")}</p>
          </div>
          <span class="entry-date">
            ${escapeHTML(exp.startDate || "")} — ${exp.current ? "Present" : escapeHTML(exp.endDate || "")}
          </span>
        </div>
        <p class="entry-desc">${escapeHTML(exp.description || "")}</p>
      </div>`,
    )
    .join("");
}

// ─────────────────────────────────────────────
// HELPER — generate projects HTML block
// ─────────────────────────────────────────────
function buildProjectsHTML(projects) {
  if (!Array.isArray(projects) || projects.length === 0) return "";
  return projects
    .map((proj) => {
      const techStack = Array.isArray(proj.techStack)
        ? proj.techStack
        : typeof proj.techStack === "string"
          ? proj.techStack
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      const techHTML =
        techStack.length > 0
          ? `<div class="tech-stack">${techStack
              .map((t) => `<span class="tech-badge">${escapeHTML(t)}</span>`)
              .join("")}</div>`
          : "";

      const linksHTML = [
        proj.github
          ? `<a href="${safeUrl(proj.github)}"  target="_blank" rel="noopener noreferrer">GitHub</a>`
          : "",
        proj.liveUrl
          ? `<a href="${safeUrl(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">Live Demo</a>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `
      <div class="entry">
        <div class="entry-header">
          <h3 class="entry-title">${escapeHTML(proj.title || "")}</h3>
          ${linksHTML ? `<div class="entry-links">${linksHTML}</div>` : ""}
        </div>
        ${techHTML}
        <p class="entry-desc">${escapeHTML(proj.description || "")}</p>
      </div>`;
    })
    .join("");
}

// ─────────────────────────────────────────────
// HELPER — generate education HTML block
// ─────────────────────────────────────────────
function buildEducationHTML(education) {
  if (!Array.isArray(education) || education.length === 0) return "";
  return education
    .map((edu) => {
      const scoreHTML = edu.score
        ? `<p class="entry-score">${escapeHTML(edu.scoreType || "Score")}: ${escapeHTML(edu.score)}/${escapeHTML(edu.outOf || "")}</p>`
        : "";
      return `
      <div class="entry">
        <div class="entry-header">
          <div>
            <h3 class="entry-title">${escapeHTML(edu.degree || "")}</h3>
            <p class="entry-sub">${escapeHTML(edu.institution || "")}</p>
          </div>
          <span class="entry-date">
            ${escapeHTML(edu.startDate || "")} — ${edu.current ? "Present" : escapeHTML(edu.endDate || "")}
          </span>
        </div>
        ${scoreHTML}
      </div>`;
    })
    .join("");
}

// ─────────────────────────────────────────────
// HELPER — generate certifications HTML block
// ─────────────────────────────────────────────
function buildCertificationsHTML(certifications) {
  if (!Array.isArray(certifications) || certifications.length === 0) return "";
  return certifications
    .map(
      (cert) => `
      <div class="cert-item">
        <span class="cert-name">${escapeHTML(cert.title || cert.name || "")}</span>
        <span class="cert-org">— ${escapeHTML(cert.issuer || cert.organization || "")}</span>
        <span class="cert-date">${escapeHTML(cert.date || cert.issueDate || "")}</span>
      </div>`,
    )
    .join("");
}

// ─────────────────────────────────────────────
// HELPER — generate achievements HTML block
// ─────────────────────────────────────────────
function buildAchievementsHTML(achievements) {
  if (!Array.isArray(achievements) || achievements.length === 0) return "";
  return achievements
    .map(
      (ach) => `
      <div class="achievement-item">
        <p class="achievement-title">${escapeHTML(ach.title || "")}</p>
        <p class="achievement-desc">${escapeHTML(ach.description || "")}</p>
      </div>`,
    )
    .join("");
}

// ─────────────────────────────────────────────
// HELPER — generate hobbies HTML block
// ─────────────────────────────────────────────
function buildHobbiesHTML(hobbies) {
  if (!Array.isArray(hobbies) || hobbies.length === 0) return "";
  return hobbies
    .map((h) => `<span class="hobby-tag">${escapeHTML(String(h || ""))}</span>`)
    .join("");
}

// ─────────────────────────────────────────────
// MAIN — generate full portfolio HTML string
// ─────────────────────────────────────────────
/**
 * Generates a complete standalone HTML portfolio file
 * @param {Object} portfolio     - Portfolio DB record
 * @param {Object} generatedData - AI generated portfolio JSON
 * @returns {string}             - Complete HTML string
 */
export function generatePortfolioHTML(portfolio, generatedData) {
  const hero = generatedData?.hero || {};
  const contact = generatedData?.contact || {};
  const skills = Array.isArray(generatedData?.skills)
    ? generatedData.skills
    : [];
  const experience = Array.isArray(generatedData?.experience)
    ? generatedData.experience
    : [];
  const education = Array.isArray(generatedData?.education)
    ? generatedData.education
    : [];
  const projects = Array.isArray(generatedData?.projects)
    ? generatedData.projects
    : [];
  const certifications = Array.isArray(generatedData?.certifications)
    ? generatedData.certifications
    : [];
  const achievements = Array.isArray(generatedData?.achievements)
    ? generatedData.achievements
    : [];
  const hobbies = Array.isArray(generatedData?.hobbies)
    ? generatedData.hobbies
    : [];

  const skillsHTML = buildSkillsHTML(skills);
  const experienceHTML = buildExperienceHTML(experience);
  const projectsHTML = buildProjectsHTML(projects);
  const educationHTML = buildEducationHTML(education);
  const certificationsHTML = buildCertificationsHTML(certifications);
  const achievementsHTML = buildAchievementsHTML(achievements);
  const hobbiesHTML = buildHobbiesHTML(hobbies);

  const contactLinks = [
    contact.email ? `<span>${escapeHTML(contact.email)}</span>` : "",
    contact.phone ? `<span>${escapeHTML(contact.phone)}</span>` : "",
    contact.linkedin
      ? `<a href="${safeUrl(contact.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
      : "",
    contact.github
      ? `<a href="${safeUrl(contact.github)}"   target="_blank" rel="noopener noreferrer">GitHub</a>`
      : "",
    contact.twitter
      ? `<a href="${safeUrl(contact.twitter)}"  target="_blank" rel="noopener noreferrer">Twitter</a>`
      : "",
    contact.portfolioUrl
      ? `<a href="${safeUrl(contact.portfolioUrl)}" target="_blank" rel="noopener noreferrer">Portfolio</a>`
      : "",
    contact.leetcode
      ? `<a href="${safeUrl(contact.leetcode)}"    target="_blank" rel="noopener noreferrer">LeetCode</a>`
      : "",
    contact.hackerrank
      ? `<a href="${safeUrl(contact.hackerrank)}"  target="_blank" rel="noopener noreferrer">HackerRank</a>`
      : "",
  ]
    .filter(Boolean)
    .join("\n      ");

  const buildSection = (title, innerHTML) =>
    innerHTML.trim()
      ? `<section><h2 class="section-title">${escapeHTML(title)}</h2>${innerHTML}</section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHTML(hero.summary || `Portfolio of ${hero.name || ""}`).slice(0, 160)}" />
  <title>${escapeHTML(hero.name || "Portfolio")} — Portfolio</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 60px 48px;
    }
    .hero h1       { font-size: 2.5rem; font-weight: 800; margin-bottom: 8px; }
    .hero .tagline { font-size: 1rem; color: #bfdbfe; font-style: italic; margin-bottom: 8px; }
    .hero .title   { font-size: 1.125rem; color: #bfdbfe; margin-bottom: 16px; }
    .hero .summary { font-size: 0.9rem; color: #dbeafe; max-width: 680px; line-height: 1.7; }
    .hero .contact { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 24px; font-size: 0.85rem; color: #bfdbfe; }
    .hero .contact a { color: #bfdbfe; text-decoration: underline; }
    .hero .contact a:hover { color: #ffffff; }

    /* ── Main ── */
    .main { max-width: 960px; margin: 0 auto; padding: 48px 24px; }

    /* ── Section ── */
    section { margin-bottom: 40px; }
    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #2563eb;
      border-bottom: 2px solid #dbeafe;
      padding-bottom: 8px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── Entry ── */
    .entry { margin-bottom: 20px; }
    .entry-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .entry-title  { font-size: 1rem; font-weight: 600; color: #1e293b; }
    .entry-sub    { font-size: 0.875rem; color: #2563eb; margin-top: 2px; }
    .entry-date   { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
    .entry-desc   { font-size: 0.875rem; color: #475569; margin-top: 8px; line-height: 1.65; }
    .entry-score  { font-size: 0.75rem; color: #64748b; margin-top: 4px; }
    .entry-links  { display: flex; gap: 12px; flex-wrap: wrap; }
    .entry-links a { font-size: 0.8rem; color: #2563eb; text-decoration: underline; }
    .entry-links a:hover { color: #1d4ed8; }

    /* ── Tech badges ── */
    .tech-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .tech-badge {
      font-size: 0.7rem;
      padding: 2px 10px;
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 999px;
      font-weight: 500;
    }

    /* ── Skills ── */
    .skill-group    { margin-bottom: 8px; font-size: 0.875rem; }
    .skill-category { font-weight: 600; color: #374151; }
    .skill-list     { color: #6b7280; margin-left: 4px; }

    /* ── Certifications ── */
    .cert-item { display: flex; gap: 8px; align-items: baseline; font-size: 0.875rem; margin-bottom: 8px; flex-wrap: wrap; }
    .cert-name { font-weight: 600; color: #1e293b; }
    .cert-org  { color: #64748b; }
    .cert-date { color: #94a3b8; font-size: 0.75rem; margin-left: auto; }

    /* ── Achievements ── */
    .achievement-item       { margin-bottom: 10px; }
    .achievement-title      { font-weight: 600; font-size: 0.9rem; color: #1e293b; }
    .achievement-desc       { font-size: 0.85rem; color: #475569; margin-top: 2px; }

    /* ── Hobbies ── */
    .hobbies   { display: flex; flex-wrap: wrap; gap: 8px; }
    .hobby-tag { font-size: 0.875rem; padding: 4px 14px; background: #f1f5f9; color: #475569; border-radius: 999px; }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .hero          { padding: 40px 20px; }
      .hero h1       { font-size: 1.75rem; }
      .main          { padding: 32px 16px; }
      .entry-header  { flex-direction: column; }
      .cert-date     { margin-left: 0; }
    }
  </style>
</head>
<body>

  <div class="hero">
    <h1>${escapeHTML(hero.name || "Your Name")}</h1>
    ${hero.tagline ? `<p class="tagline">${escapeHTML(hero.tagline)}</p>` : ""}
    <p class="title">${escapeHTML(hero.title || "")}</p>
    <p class="summary">${escapeHTML(hero.summary || "")}</p>
    <div class="contact">
      ${contactLinks}
    </div>
  </div>

  <div class="main">
    ${buildSection("Skills", skillsHTML)}
    ${buildSection("Experience", experienceHTML)}
    ${buildSection("Projects", projectsHTML)}
    ${buildSection("Education", educationHTML)}
    ${buildSection("Certifications", certificationsHTML)}
    ${buildSection("Achievements", achievementsHTML)}
    ${hobbiesHTML.trim() ? `<section><h2 class="section-title">Interests</h2><div class="hobbies">${hobbiesHTML}</div></section>` : ""}
  </div>

</body>
</html>`;
}

// ─────────────────────────────────────────────
// MAIN — generate README.md string
// ─────────────────────────────────────────────
/**
 * Generates a README.md for the portfolio ZIP
 * @param {Object} portfolio - Portfolio DB record
 * @returns {string}         - README markdown string
 */
export function generateReadme(portfolio) {
  const name = portfolio?.fullName || "Portfolio";
  const title = portfolio?.professionalTitle || "";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `# ${name} — Portfolio Website
${title ? `\n**${title}**\n` : ""}
## 🚀 Getting Started

This is a static portfolio website generated by **SENSAI AI Portfolio Generator**.

### Option 1 — Open directly in browser
Just open \`index.html\` in any modern browser. No server needed.

### Option 2 — Serve locally

\`\`\`bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
\`\`\`

Then visit: **http://localhost:8000**

## 📁 Files

| File | Description |
|------|-------------|
| \`index.html\` | Complete portfolio website — open in any browser |
| \`README.md\`  | This file — setup instructions |

## 🌐 Free Hosting Options

| Platform | Instructions |
|----------|--------------|
| [GitHub Pages](https://pages.github.com) | Push to GitHub repo → enable Pages in settings |
| [Netlify](https://netlify.com) | Drag & drop this ZIP at netlify.com/drop |
| [Vercel](https://vercel.com) | Import from GitHub → auto deploys |

## ✨ Generated By

[SENSAI](https://sensai.app) — AI-powered career tools

---
*Generated on ${date}*
`;
}

// ─────────────────────────────────────────────
// MAIN EXPORT — create and download ZIP
// Client-side only (uses browser APIs)
// ─────────────────────────────────────────────
/**
 * Generates portfolio ZIP and triggers browser download
 * @param {Object} portfolio     - Portfolio DB record
 * @param {Object} generatedData - AI generated portfolio JSON
 * @returns {Promise<void>}
 */
export async function downloadPortfolioZip(portfolio, generatedData) {
  if (!portfolio) throw new Error("Portfolio data is required.");
  if (!generatedData) throw new Error("Generated portfolio data is required.");

  // Dynamic imports — only loaded when called (avoids SSR issues)
  const JSZip = (await import("jszip")).default;
  const { saveAs } = await import("file-saver");

  const zip = new JSZip();

  // Add index.html
  const html = generatePortfolioHTML(portfolio, generatedData);
  zip.file("index.html", html);

  // Add README.md
  zip.file("README.md", generateReadme(portfolio));

  // Generate ZIP blob
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Safe filename
  const filename = `${safeFilename(portfolio.fullName)}-portfolio.zip`;

  saveAs(blob, filename);
}

// ─────────────────────────────────────────────
// EXPORT — download HTML only (no ZIP)
// Client-side only
// ─────────────────────────────────────────────
/**
 * Generates portfolio HTML and triggers browser download as .html file
 * @param {Object} portfolio     - Portfolio DB record
 * @param {Object} generatedData - AI generated portfolio JSON
 */
export function downloadPortfolioHTML(portfolio, generatedData) {
  if (!portfolio) throw new Error("Portfolio data is required.");
  if (!generatedData) throw new Error("Generated portfolio data is required.");

  const html = generatePortfolioHTML(portfolio, generatedData);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const filename = `${safeFilename(portfolio.fullName)}-portfolio.html`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
