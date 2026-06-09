// components/portfolio/templates/futuristic.jsx
"use client";

const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";

  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

export default function FuturisticTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience)
    ? data.experience
    : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const education = Array.isArray(data?.education)
    ? data.education
    : [];
  const hobbies = Array.isArray(data?.hobbies) ? data.hobbies : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "#030712",
        color: "#f0f9ff",
      }}
    >
      {/* Hero */}
      <div
        className="relative px-6 md:px-8 py-16 text-center overflow-hidden"
        style={{
          borderBottom: "1px solid rgba(14,165,233,0.2)",
        }}
      >
        {/* Background Glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(14,165,233,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight"
            style={{
              color: "#0ea5e9",
              textShadow: "0 0 30px rgba(14,165,233,0.4)",
            }}
          >
            {hero.name || "Your Name"}
          </h1>

          <p
            className="text-lg mb-2"
            style={{ color: "#7dd3fc" }}
          >
            {hero.title || ""}
          </p>

          {hero.tagline && (
            <p
              className="text-sm italic mb-4"
              style={{ color: "rgba(14,165,233,0.7)" }}
            >
              {hero.tagline}
            </p>
          )}

          {hero.summary && (
            <p
              className="text-sm max-w-2xl mx-auto leading-relaxed"
              style={{ color: "#94a3b8" }}
            >
              {hero.summary}
            </p>
          )}

          {/* Contact */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
            {contact.email && (
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "#7dd3fc",
                }}
              >
                {contact.email}
              </span>
            )}

            {contact.phone && (
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "#7dd3fc",
                }}
              >
                {contact.phone}
              </span>
            )}

            {contact.linkedin && (
              <a
                href={safeUrl(contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full underline transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "#0ea5e9",
                }}
              >
                LinkedIn
              </a>
            )}

            {contact.github && (
              <a
                href={safeUrl(contact.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full underline transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "#0ea5e9",
                }}
              >
                GitHub
              </a>
            )}

            {contact.twitter && (
              <a
                href={safeUrl(contact.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full underline transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "#0ea5e9",
                }}
              >
                Twitter
              </a>
            )}

            {contact.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full underline transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "#0ea5e9",
                }}
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto space-y-10">
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#0ea5e9" }}
            >
              Skills
            </h2>

            <div className="space-y-4">
              {skills.map((group, index) => (
                <div key={`skill-${index}`}>
                  <span
                    className="text-xs"
                    style={{ color: "#64748b" }}
                  >
                    {group?.category || "General"}:
                  </span>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Array.isArray(group?.skills)
                      ? group.skills
                      : [group?.skills || ""]).map((skill, idx) => (
                      <span
                        key={`skill-item-${idx}`}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "rgba(14,165,233,0.08)",
                          color: "#7dd3fc",
                          border:
                            "1px solid rgba(14,165,233,0.2)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#0ea5e9" }}
            >
              Experience
            </h2>

            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div
                  key={`exp-${index}`}
                  className="p-5 rounded-xl"
                  style={{
                    background: "#0f172a",
                    border:
                      "1px solid rgba(14,165,233,0.12)",
                  }}
                >
                  <div className="flex justify-between flex-wrap gap-3">
                    <div>
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: "#f0f9ff" }}
                      >
                        {exp?.title || ""}
                      </h3>

                      <p
                        className="text-xs"
                        style={{ color: "#0ea5e9" }}
                      >
                        {exp?.company || ""}
                      </p>
                    </div>

                    <span
                      className="text-xs whitespace-nowrap"
                      style={{ color: "#64748b" }}
                    >
                      {exp?.startDate || ""} —{" "}
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
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#0ea5e9" }}
            >
              Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj, index) => (
                <div
                  key={`proj-${index}`}
                  className="p-5 rounded-xl"
                  style={{
                    background: "#0f172a",
                    border:
                      "1px solid rgba(14,165,233,0.12)",
                  }}
                >
                  <div className="flex justify-between flex-wrap gap-3 mb-2">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "#f0f9ff" }}
                    >
                      {proj?.title || ""}
                    </h3>

                    <div className="flex gap-3">
                      {proj?.github && (
                        <a
                          href={safeUrl(proj.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#0ea5e9" }}
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
                          style={{ color: "#0ea5e9" }}
                        >
                          Live
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(proj?.techStack) &&
                    proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={`tech-${idx}`}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background:
                                "rgba(14,165,233,0.08)",
                              color: "#7dd3fc",
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
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#0ea5e9" }}
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
                      className="text-sm font-semibold"
                      style={{ color: "#f0f9ff" }}
                    >
                      {edu?.degree || ""}
                    </h3>

                    <p
                      className="text-xs"
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
                    {edu?.startDate || ""} —{" "}
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
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#0ea5e9" }}
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
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#f0f9ff" }}
                    >
                      {cert?.title || cert?.name || ""}
                    </p>

                    <p
                      className="text-xs"
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
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#0ea5e9" }}
            >
              Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={`achievement-${index}`}>
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "#f0f9ff" }}
                  >
                    {achievement?.title || ""}
                  </h3>

                  {achievement?.description && (
                    <p
                      className="text-xs mt-1"
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
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "#0ea5e9" }}
            >
              Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "#0f172a",
                    color: "#94a3b8",
                    border: "1px solid #1e293b",
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