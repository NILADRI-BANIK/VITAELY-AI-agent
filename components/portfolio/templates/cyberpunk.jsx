// D:\SENSAI\sensai\components\portfolio\templates\cyberpunk.jsx

"use client";

export default function CyberpunkTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const hobbies = Array.isArray(data?.hobbies) ? data.hobbies : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];

  const safeUrl = (url) => {
    if (!url || typeof url !== "string") return "#";

    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden font-mono"
      style={{
        background: "#0d0d0d",
        color: "#e2e8f0",
      }}
    >
      {/* Scanline Effect */}
      <div
        className="pointer-events-none fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          zIndex: 0,
        }}
      />

      {/* Glow Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "radial-gradient(circle at top center, #7c3aed55 0%, transparent 70%)",
        }}
      />

      {/* Hero Section */}
      <section
        className="relative border-b px-6 py-14 text-center md:px-10"
        style={{
          borderColor: "#7c3aed",
        }}
      >
        <div className="relative z-10">
          <div
            className="mb-4 inline-block border px-4 py-1 text-xs font-bold tracking-widest"
            style={{
              borderColor: "#7c3aed",
              color: "#a78bfa",
              background: "#7c3aed11",
            }}
          >
            SYS://PORTFOLIO
          </div>

          <h1
            className="text-4xl font-extrabold uppercase tracking-wide md:text-6xl"
            style={{
              color: "#c4b5fd",
              textShadow: "0 0 20px rgba(124,58,237,0.7), 2px 2px 0 #4c1d95",
            }}
          >
            {hero.name || "YOUR_NAME"}
          </h1>

          <p
            className="mt-3 text-lg md:text-xl"
            style={{
              color: "#8b5cf6",
            }}
          >
            &gt; {hero.title || "ROLE"}
          </p>

          {hero.tagline && (
            <p
              className="mt-3 text-sm italic"
              style={{
                color: "#6d28d9",
              }}
            >
              {hero.tagline}
            </p>
          )}

          {hero.summary && (
            <p
              className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed md:text-base"
              style={{
                color: "#94a3b8",
              }}
            >
              {hero.summary}
            </p>
          )}

          {/* Contact */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
            {contact.email && (
              <span
                className="border px-3 py-2"
                style={{
                  borderColor: "#7c3aed44",
                  color: "#c4b5fd",
                  background: "#111111",
                }}
              >
                {contact.email}
              </span>
            )}

            {contact.phone && (
              <span
                className="border px-3 py-2"
                style={{
                  borderColor: "#7c3aed44",
                  color: "#c4b5fd",
                  background: "#111111",
                }}
              >
                {contact.phone}
              </span>
            )}

            {contact.github && (
              <a
                href={safeUrl(contact.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-3 py-2 underline transition-opacity hover:opacity-80"
                style={{
                  borderColor: "#7c3aed44",
                  color: "#c4b5fd",
                  background: "#111111",
                }}
              >
                GitHub
              </a>
            )}

            {contact.linkedin && (
              <a
                href={safeUrl(contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-3 py-2 underline transition-opacity hover:opacity-80"
                style={{
                  borderColor: "#7c3aed44",
                  color: "#c4b5fd",
                  background: "#111111",
                }}
              >
                LinkedIn
              </a>
            )}

            {contact.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-3 py-2 underline transition-opacity hover:opacity-80"
                style={{
                  borderColor: "#7c3aed44",
                  color: "#c4b5fd",
                  background: "#111111",
                }}
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-8">
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2
              className="mb-5 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#8b5cf6" }}
            >
              [SKILL_MATRIX]
            </h2>

            <div className="space-y-4">
              {skills.map((group, index) => (
                <div key={`skill-${index}`}>
                  <p
                    className="mb-2 text-xs uppercase"
                    style={{
                      color: "#6d28d9",
                    }}
                  >
                    {group?.category || "Skills"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(group?.skills)
                      ? group.skills
                      : [group?.skills || ""]
                    )
                      .filter(Boolean)
                      .map((skill, skillIndex) => (
                        <span
                          key={`skill-item-${skillIndex}`}
                          className="border px-3 py-1 text-xs"
                          style={{
                            background: "#7c3aed15",
                            color: "#c4b5fd",
                            borderColor: "#7c3aed44",
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
              className="mb-5 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#8b5cf6" }}
            >
              [WORK_LOG]
            </h2>

            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div
                  key={`experience-${index}`}
                  className="border p-5"
                  style={{
                    background: "#111111",
                    borderColor: "#7c3aed33",
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{
                          color: "#f5f3ff",
                        }}
                      >
                        {exp?.title || "Role"}
                      </h3>

                      <p
                        className="text-sm"
                        style={{
                          color: "#8b5cf6",
                        }}
                      >
                        {exp?.company || ""}
                      </p>
                    </div>

                    <span
                      className="text-xs uppercase"
                      style={{
                        color: "#6d28d9",
                      }}
                    >
                      {exp?.startDate || ""}
                      {exp?.startDate && " — "}
                      {exp?.current ? "PRESENT" : exp?.endDate || ""}
                    </span>
                  </div>

                  {exp?.description && (
                    <p
                      className="mt-3 text-sm leading-relaxed"
                      style={{
                        color: "#94a3b8",
                      }}
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
              className="mb-5 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#8b5cf6" }}
            >
              [PROJECT_ARCHIVE]
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {projects.map((project, index) => (
                <div
                  key={`project-${index}`}
                  className="border p-5 transition-all hover:-translate-y-1"
                  style={{
                    background: "#111111",
                    borderColor: "#7c3aed33",
                  }}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <h3
                      className="text-lg font-bold"
                      style={{
                        color: "#f5f3ff",
                      }}
                    >
                      {project?.title || "Project"}
                    </h3>

                    <div className="flex gap-3">
                      {project?.github && (
                        <a
                          href={safeUrl(project.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{
                            color: "#8b5cf6",
                          }}
                        >
                          SRC
                        </a>
                      )}

                      {project?.liveUrl && (
                        <a
                          href={safeUrl(project.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{
                            color: "#8b5cf6",
                          }}
                        >
                          LIVE
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(project?.techStack) &&
                    project.techStack.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {project.techStack.map((tech, techIndex) => (
                          <span
                            key={`tech-${techIndex}`}
                            className="px-2 py-1 text-xs"
                            style={{
                              background: "#7c3aed22",
                              color: "#c4b5fd",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {project?.description && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {project.description}
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
              className="mb-5 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#8b5cf6" }}
            >
              [EDUCATION_LOG]
            </h2>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={`education-${index}`}
                  className="flex flex-wrap items-start justify-between gap-3 border p-4"
                  style={{
                    background: "#111111",
                    borderColor: "#7c3aed33",
                  }}
                >
                  <div>
                    <h3
                      className="text-sm font-bold md:text-base"
                      style={{
                        color: "#f5f3ff",
                      }}
                    >
                      {edu?.degree || ""}
                    </h3>

                    <p
                      className="text-xs"
                      style={{
                        color: "#6d28d9",
                      }}
                    >
                      {edu?.institution || ""}
                    </p>

                    {edu?.score && (
                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        {edu?.scoreType || "Score"}: {edu.score}
                        {edu?.outOf ? ` / ${edu.outOf}` : ""}
                      </p>
                    )}
                  </div>

                  <span
                    className="text-xs uppercase"
                    style={{
                      color: "#6d28d9",
                    }}
                  >
                    {edu?.startDate || ""}
                    {edu?.startDate && " — "}
                    {edu?.current ? "PRESENT" : edu?.endDate || ""}
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
              className="mb-5 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#8b5cf6" }}
            >
              [ACHIEVEMENTS]
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={`achievement-${index}`}
                  className="border p-4"
                  style={{
                    background: "#111111",
                    borderColor: "#7c3aed33",
                  }}
                >
                  <h3
                    className="font-bold"
                    style={{
                      color: "#f5f3ff",
                    }}
                  >
                    {achievement?.title || ""}
                  </h3>

                  {achievement?.description && (
                    <p
                      className="mt-2 text-sm"
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {hobbies.length > 0 && (
          <section>
            <h2
              className="mb-5 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#8b5cf6" }}
            >
              [INTERESTS]
            </h2>

            <div className="flex flex-wrap gap-3">
              {hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="border px-3 py-2 text-xs"
                  style={{
                    background: "#111111",
                    color: "#c4b5fd",
                    borderColor: "#7c3aed33",
                  }}
                >
                  {hobby}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
