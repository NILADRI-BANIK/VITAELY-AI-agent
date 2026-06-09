"use client";

const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";

  const trimmed = url.trim();

  if (!trimmed) return "#";

  return trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

export default function Developer3DTemplate({ data = {} }) {
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
  const hobbies = Array.isArray(data?.hobbies)
    ? data.hobbies
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];

  return (
    <div
      className="min-h-screen font-mono"
      style={{
        background: "#0a0a0f",
        color: "#e2e8f0",
      }}
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 py-16 md:px-10"
        style={{
          background:
            "linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #059669 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div
            className="inline-block rounded-full border px-3 py-1 text-xs mb-5"
            style={{
              background: "rgba(5,150,105,0.12)",
              color: "#34d399",
              borderColor: "rgba(5,150,105,0.25)",
            }}
          >
            &lt;developer /&gt;
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold mb-3 break-words"
            style={{ color: "#34d399" }}
          >
            {hero?.name || "Your Name"}
          </h1>

          {hero?.title && (
            <p
              className="text-lg mb-2"
              style={{ color: "#94a3b8" }}
            >
              {hero.title}
            </p>
          )}

          {hero?.tagline && (
            <p
              className="text-sm italic mb-4"
              style={{ color: "#64748b" }}
            >
              {hero.tagline}
            </p>
          )}

          {hero?.summary && (
            <p
              className="text-sm leading-relaxed max-w-2xl mx-auto"
              style={{ color: "#94a3b8" }}
            >
              {hero.summary}
            </p>
          )}

          {/* Contact */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
            {contact?.email && (
              <span
                className="px-3 py-1 rounded-md"
                style={{
                  background: "#1e293b",
                  color: "#94a3b8",
                }}
              >
                {contact.email}
              </span>
            )}

            {contact?.phone && (
              <span
                className="px-3 py-1 rounded-md"
                style={{
                  background: "#1e293b",
                  color: "#94a3b8",
                }}
              >
                {contact.phone}
              </span>
            )}

            {contact?.github && (
              <a
                href={safeUrl(contact.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                GitHub
              </a>
            )}

            {contact?.linkedin && (
              <a
                href={safeUrl(contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                LinkedIn
              </a>
            )}

            {contact?.twitter && (
              <a
                href={safeUrl(contact.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                Twitter
              </a>
            )}

            {contact?.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-10">
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Skills
            </h2>

            <div className="space-y-4">
              {skills.map((group, index) => {
                const skillItems = Array.isArray(group?.skills)
                  ? group.skills
                  : group?.skills
                    ? [group.skills]
                    : [];

                return (
                  <div key={`skill-${index}`}>
                    <p
                      className="text-xs mb-2"
                      style={{ color: "#64748b" }}
                    >
                      {group?.category || "General"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {skillItems.map((skill, skillIndex) => (
                        <span
                          key={`skill-item-${skillIndex}`}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: "rgba(5,150,105,0.12)",
                            color: "#34d399",
                            border:
                              "1px solid rgba(5,150,105,0.25)",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Experience
            </h2>

            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div
                  key={`exp-${index}`}
                  className="rounded-lg p-5"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e293b",
                  }}
                >
                  <div className="flex justify-between flex-wrap gap-3">
                    <div>
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "#e2e8f0" }}
                      >
                        {exp?.title || "Role"}
                      </h3>

                      <p
                        className="text-xs mt-1"
                        style={{ color: "#34d399" }}
                      >
                        {exp?.company || ""}
                      </p>
                    </div>

                    <span
                      className="text-xs whitespace-nowrap"
                      style={{ color: "#64748b" }}
                    >
                      {exp?.startDate || ""}
                      {(exp?.startDate || exp?.endDate) && " — "}
                      {exp?.current
                        ? "Present"
                        : exp?.endDate || ""}
                    </span>
                  </div>

                  {exp?.description && (
                    <p
                      className="text-sm mt-3 leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj, index) => (
                <div
                  key={`proj-${index}`}
                  className="rounded-lg p-5"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e293b",
                  }}
                >
                  <div className="flex justify-between flex-wrap gap-3 mb-3">
                    <h3
                      className="font-bold text-sm"
                      style={{ color: "#e2e8f0" }}
                    >
                      {proj?.title || "Project"}
                    </h3>

                    <div className="flex gap-3">
                      {proj?.github && (
                        <a
                          href={safeUrl(proj.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#34d399" }}
                        >
                          GitHub
                        </a>
                      )}

                      {proj?.liveUrl && (
                        <a
                          href={safeUrl(proj.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#34d399" }}
                        >
                          Live
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(proj?.techStack) &&
                    proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {proj.techStack.map((tech, techIndex) => (
                          <span
                            key={`tech-${techIndex}`}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: "#1e293b",
                              color: "#94a3b8",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {proj?.description && (
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#94a3b8" }}
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
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Education
            </h2>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={`edu-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      {edu?.degree || ""}
                    </h3>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      {edu?.institution || ""}
                    </p>

                    {edu?.score && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {edu?.scoreType || "Score"}:{" "}
                        {edu.score}
                        {edu?.outOf ? `/${edu.outOf}` : ""}
                      </p>
                    )}
                  </div>

                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: "#64748b" }}
                  >
                    {edu?.startDate || ""}
                    {(edu?.startDate || edu?.endDate) && " — "}
                    {edu?.current
                      ? "Present"
                      : edu?.endDate || ""}
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
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Certifications
            </h2>

            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div
                  key={`cert-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#e2e8f0" }}
                    >
                      {cert?.title || cert?.name || ""}
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      {cert?.issuer ||
                        cert?.organization ||
                        ""}
                    </p>
                  </div>

                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: "#64748b" }}
                  >
                    {cert?.date || cert?.issueDate || ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={`achievement-${index}`}
                  className="rounded-lg p-4"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e293b",
                  }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {achievement?.title || ""}
                  </h3>

                  {achievement?.description && (
                    <p
                      className="text-xs mt-2 leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "#34d399" }}
            >
              # Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="text-xs px-3 py-1 rounded"
                  style={{
                    background: "#1e293b",
                    color: "#94a3b8",
                  }}
                >
                  {hobby}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}