// D:\SENSAI\sensai\components\portfolio\templates\corporate.jsx

"use client";

export default function CorporateTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience)
    ? data.experience
    : [];
  const projects = Array.isArray(data?.projects)
    ? data.projects
    : [];
  const education = Array.isArray(data?.education)
    ? data.education
    : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];

  const safeUrl = (url) => {
    if (!url || typeof url !== "string") return "#";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `https://${url}`;
  };

  const formatDateRange = (start, end, current) => {
    const startValue = start || "Start";
    const endValue = current ? "Present" : end || "End";

    return `${startValue} — ${endValue}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Accent Bar */}
      <div
        style={{
          background: "#1e3a5f",
          height: "6px",
        }}
      />

      {/* Hero Section */}
      <div
        className="px-6 md:px-10 py-10"
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          {/* Left */}
          <div className="flex-1">
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "#1e3a5f" }}
            >
              {hero.name || "Your Name"}
            </h1>

            {hero.title && (
              <p
                className="text-lg mt-2"
                style={{ color: "#475569" }}
              >
                {hero.title}
              </p>
            )}

            {hero.tagline && (
              <p
                className="text-sm italic mt-2"
                style={{ color: "#94a3b8" }}
              >
                {hero.tagline}
              </p>
            )}

            {hero.summary && (
              <p
                className="text-sm mt-4 max-w-2xl leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {hero.summary}
              </p>
            )}
          </div>

          {/* Right */}
          <div
            className="text-sm space-y-2 md:text-right"
            style={{
              color: "#475569",
              minWidth: "220px",
            }}
          >
            {contact.email && <p>{contact.email}</p>}

            {contact.phone && <p>{contact.phone}</p>}

            {contact.location && <p>{contact.location}</p>}

            {contact.linkedin && (
              <a
                href={safeUrl(contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="block underline break-all"
                style={{ color: "#1e3a5f" }}
              >
                LinkedIn
              </a>
            )}

            {contact.github && (
              <a
                href={safeUrl(contact.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="block underline break-all"
                style={{ color: "#1e3a5f" }}
              >
                GitHub
              </a>
            )}

            {contact.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="block underline break-all"
                style={{ color: "#1e3a5f" }}
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 space-y-10">
        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-5 pb-2"
              style={{
                color: "#1e3a5f",
                borderBottom: "2px solid #1e3a5f",
              }}
            >
              Professional Experience
            </h2>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={`exp-${index}`}>
                  <div className="flex justify-between flex-wrap gap-3">
                    <div>
                      <h3
                        className="font-semibold text-base"
                        style={{ color: "#1e293b" }}
                      >
                        {exp.title || "Role"}
                      </h3>

                      {exp.company && (
                        <p
                          className="text-sm"
                          style={{ color: "#1e3a5f" }}
                        >
                          {exp.company}
                        </p>
                      )}
                    </div>

                    <span
                      className="text-xs whitespace-nowrap"
                      style={{ color: "#94a3b8" }}
                    >
                      {formatDateRange(
                        exp.startDate,
                        exp.endDate,
                        exp.current
                      )}
                    </span>
                  </div>

                  {exp.description && (
                    <p
                      className="text-sm mt-2 leading-relaxed"
                      style={{ color: "#475569" }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-5 pb-2"
              style={{
                color: "#1e3a5f",
                borderBottom: "2px solid #1e3a5f",
              }}
            >
              Core Competencies
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((group, index) => (
                <div
                  key={`skill-${index}`}
                  className="text-sm"
                >
                  <span
                    className="font-semibold"
                    style={{ color: "#1e293b" }}
                  >
                    {group.category || "Skills"}:
                  </span>{" "}
                  <span style={{ color: "#475569" }}>
                    {Array.isArray(group.skills)
                      ? group.skills.join(", ")
                      : group.skills || ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-5 pb-2"
              style={{
                color: "#1e3a5f",
                borderBottom: "2px solid #1e3a5f",
              }}
            >
              Key Projects
            </h2>

            <div className="space-y-5">
              {projects.map((proj, index) => (
                <div key={`proj-${index}`}>
                  <div className="flex justify-between flex-wrap gap-3">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "#1e293b" }}
                    >
                      {proj.title || "Project"}
                    </h3>

                    <div className="flex gap-3">
                      {proj.github && (
                        <a
                          href={safeUrl(proj.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#1e3a5f" }}
                        >
                          GitHub
                        </a>
                      )}

                      {proj.liveUrl && (
                        <a
                          href={safeUrl(proj.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#1e3a5f" }}
                        >
                          Live
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(proj.techStack) &&
                    proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {proj.techStack.map((tech, techIndex) => (
                          <span
                            key={`tech-${techIndex}`}
                            className="text-xs px-2 py-1 rounded-md"
                            style={{
                              background: "#e2e8f0",
                              color: "#334155",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {proj.description && (
                    <p
                      className="text-sm mt-2 leading-relaxed"
                      style={{ color: "#475569" }}
                    >
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-5 pb-2"
              style={{
                color: "#1e3a5f",
                borderBottom: "2px solid #1e3a5f",
              }}
            >
              Education
            </h2>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={`edu-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "#1e293b" }}
                    >
                      {edu.degree || "Degree"}
                    </h3>

                    {edu.institution && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#64748b" }}
                      >
                        {edu.institution}
                      </p>
                    )}

                    {edu.score && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {edu.scoreType || "Score"}:{" "}
                        {edu.score}
                        {edu.outOf ? ` / ${edu.outOf}` : ""}
                      </p>
                    )}
                  </div>

                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: "#94a3b8" }}
                  >
                    {formatDateRange(
                      edu.startDate,
                      edu.endDate,
                      edu.current
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-5 pb-2"
              style={{
                color: "#1e3a5f",
                borderBottom: "2px solid #1e3a5f",
              }}
            >
              Certifications
            </h2>

            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div
                  key={`cert-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#1e293b" }}
                    >
                      {cert.title || cert.name || "Certification"}
                    </span>

                    {(cert.issuer || cert.organization) && (
                      <span
                        className="text-sm ml-2"
                        style={{
                          color: "#94a3b8",
                          fontWeight: 400,
                        }}
                      >
                        —{" "}
                        {cert.issuer ||
                          cert.organization}
                      </span>
                    )}
                  </div>

                  {(cert.date || cert.issueDate) && (
                    <span
                      className="text-xs"
                      style={{ color: "#94a3b8" }}
                    >
                      {cert.date || cert.issueDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-5 pb-2"
              style={{
                color: "#1e3a5f",
                borderBottom: "2px solid #1e3a5f",
              }}
            >
              Achievements
            </h2>

            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={`achievement-${index}`}>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "#1e293b" }}
                  >
                    {achievement.title || "Achievement"}
                  </h3>

                  {achievement.description && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: "#64748b" }}
                    >
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}