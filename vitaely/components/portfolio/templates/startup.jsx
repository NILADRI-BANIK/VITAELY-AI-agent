// D:\SENSAI\sensai\components\portfolio\templates\startup.jsx

"use client";

export default function StartupTemplate({ data = {} }) {
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

  const safeUrl = (url) => {
    if (!url || typeof url !== "string") return "#";

    return url.startsWith("http://") ||
      url.startsWith("https://")
      ? url
      : `https://${url}`;
  };

  const allSkills = skills.flatMap((group) => {
    if (!group) return [];

    if (Array.isArray(group.skills)) {
      return group.skills.filter(Boolean);
    }

    return group.skills ? [group.skills] : [];
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden px-6 py-14 md:px-10 md:py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, #db2777 0%, #9333ea 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-10"
          style={{ background: "#ffffff" }}
        />

        <div
          className="absolute bottom-0 left-0 h-56 w-56 rounded-full opacity-10"
          style={{ background: "#ffffff" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl">
          <div
            className="mb-5 inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
            }}
          >
            🚀 Open to opportunities
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            {hero.name || "Your Name"}
          </h1>

          {hero.title && (
            <p className="mt-3 text-xl text-pink-100 md:text-2xl">
              {hero.title}
            </p>
          )}

          {hero.tagline && (
            <p className="mt-3 italic text-pink-200">
              {hero.tagline}
            </p>
          )}

          {hero.summary && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-pink-50 md:text-base">
              {hero.summary}
            </p>
          )}

          {/* Contact Links */}
          <div className="mt-8 flex flex-wrap gap-3">
            {contact.email && (
              <span
                className="rounded-full px-4 py-2 text-xs md:text-sm"
                style={{
                  background: "rgba(255,255,255,0.18)",
                }}
              >
                {contact.email}
              </span>
            )}

            {contact.phone && (
              <span
                className="rounded-full px-4 py-2 text-xs md:text-sm"
                style={{
                  background: "rgba(255,255,255,0.18)",
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
                className="rounded-full px-4 py-2 text-xs underline transition-opacity hover:opacity-80 md:text-sm"
                style={{
                  background: "rgba(255,255,255,0.18)",
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
                className="rounded-full px-4 py-2 text-xs underline transition-opacity hover:opacity-80 md:text-sm"
                style={{
                  background: "rgba(255,255,255,0.18)",
                }}
              >
                GitHub
              </a>
            )}

            {contact.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-4 py-2 text-xs underline transition-opacity hover:opacity-80 md:text-sm"
                style={{
                  background: "rgba(255,255,255,0.18)",
                }}
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-8">
        {/* Skills */}
        {allSkills.length > 0 && (
          <section>
            <h2
              className="mb-5 text-2xl font-black"
              style={{ color: "#db2777" }}
            >
              ⚡ Skills
            </h2>

            <div className="flex flex-wrap gap-3">
              {allSkills.map((skill, index) => (
                <span
                  key={`skill-${index}`}
                  className="rounded-full border px-4 py-2 text-sm font-medium"
                  style={{
                    background: "#fdf2f8",
                    color: "#be185d",
                    borderColor: "#fbcfe8",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2
              className="mb-5 text-2xl font-black"
              style={{ color: "#db2777" }}
            >
              💼 Experience
            </h2>

            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div
                  key={`experience-${index}`}
                  className="rounded-3xl border p-5 shadow-sm"
                  style={{
                    background: "#fdf2f8",
                    borderColor: "#fbcfe8",
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        {exp?.title || "Role"}
                      </h3>

                      <p
                        className="text-sm font-medium"
                        style={{ color: "#db2777" }}
                      >
                        {exp?.company || ""}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500">
                      {exp?.startDate || ""}
                      {exp?.startDate && " — "}
                      {exp?.current
                        ? "Present"
                        : exp?.endDate || ""}
                    </span>
                  </div>

                  {exp?.description && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-700">
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
              className="mb-5 text-2xl font-black"
              style={{ color: "#db2777" }}
            >
              🚀 Projects
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {projects.map((project, index) => (
                <div
                  key={`project-${index}`}
                  className="rounded-3xl border p-5 shadow-sm transition-transform hover:-translate-y-1"
                  style={{
                    background: "#fdf2f8",
                    borderColor: "#fbcfe8",
                  }}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg font-bold">
                      {project?.title || "Project"}
                    </h3>

                    <div className="flex gap-3">
                      {project?.github && (
                        <a
                          href={safeUrl(project.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#db2777" }}
                        >
                          GitHub
                        </a>
                      )}

                      {project?.liveUrl && (
                        <a
                          href={safeUrl(project.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#db2777" }}
                        >
                          Live
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
                            className="rounded-full px-2 py-1 text-xs"
                            style={{
                              background: "#fbcfe8",
                              color: "#9d174d",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {project?.description && (
                    <p className="text-sm leading-relaxed text-gray-700">
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
              className="mb-5 text-2xl font-black"
              style={{ color: "#db2777" }}
            >
              🎓 Education
            </h2>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={`education-${index}`}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4"
                  style={{
                    borderColor: "#fbcfe8",
                    background: "#fff",
                  }}
                >
                  <div>
                    <h3 className="text-sm font-bold md:text-base">
                      {edu?.degree || ""}
                    </h3>

                    <p className="text-xs text-gray-500 md:text-sm">
                      {edu?.institution || ""}
                    </p>

                    {edu?.score && (
                      <p className="mt-1 text-xs text-gray-400">
                        {edu?.scoreType || "Score"}: {edu.score}
                        {edu?.outOf ? ` / ${edu.outOf}` : ""}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-gray-400">
                    {edu?.startDate || ""}
                    {edu?.startDate && " — "}
                    {edu?.current
                      ? "Present"
                      : edu?.endDate || ""}
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
              className="mb-5 text-2xl font-black"
              style={{ color: "#db2777" }}
            >
              🏆 Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={`achievement-${index}`}
                  className="rounded-2xl border p-4"
                  style={{
                    background: "#fdf2f8",
                    borderColor: "#fbcfe8",
                  }}
                >
                  <h3 className="font-bold">
                    {achievement?.title || ""}
                  </h3>

                  {achievement?.description && (
                    <p className="mt-2 text-sm text-gray-700">
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
              className="mb-5 text-2xl font-black"
              style={{ color: "#db2777" }}
            >
              ❤️ Interests
            </h2>

            <div className="flex flex-wrap gap-3">
              {hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="rounded-full px-4 py-2 text-sm"
                  style={{
                    background: "#fdf2f8",
                    color: "#be185d",
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