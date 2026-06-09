"use client";

const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";

  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

export default function GlassmorphismTemplate({ data = {} }) {
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
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];

  const glass =
    "backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl";

  return (
    <div
      className="min-h-screen font-sans relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%)",
      }}
    >
      {/* Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl pointer-events-none" />

      <div className="relative z-10 px-4 md:px-8 py-12 max-w-5xl mx-auto space-y-6">
        {/* Hero */}
        <div className={`${glass} p-8 text-white`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {hero.name || "Your Name"}
          </h1>

          <p className="text-purple-200 text-lg mb-2">
            {hero.title || ""}
          </p>

          {hero.tagline && (
            <p className="text-purple-300 text-sm italic mb-4">
              {hero.tagline}
            </p>
          )}

          {hero.summary && (
            <p className="text-white/80 text-sm leading-relaxed max-w-3xl">
              {hero.summary}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6 text-xs">
            {contact.email && (
              <span className="bg-white/10 px-3 py-1 rounded-full">
                {contact.email}
              </span>
            )}

            {contact.phone && (
              <span className="bg-white/10 px-3 py-1 rounded-full">
                {contact.phone}
              </span>
            )}

            {contact.linkedin && (
              <a
                href={safeUrl(contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 px-3 py-1 rounded-full underline hover:bg-white/20 transition"
              >
                LinkedIn
              </a>
            )}

            {contact.github && (
              <a
                href={safeUrl(contact.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 px-3 py-1 rounded-full underline hover:bg-white/20 transition"
              >
                GitHub
              </a>
            )}

            {contact.twitter && (
              <a
                href={safeUrl(contact.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 px-3 py-1 rounded-full underline hover:bg-white/20 transition"
              >
                Twitter
              </a>
            )}

            {contact.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 px-3 py-1 rounded-full underline hover:bg-white/20 transition"
              >
                Portfolio
              </a>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-5 text-purple-200 uppercase tracking-wider">
              Skills
            </h2>

            <div className="space-y-4">
              {skills.map((group, index) => (
                <div
                  key={`skill-${index}`}
                  className="flex flex-wrap gap-3 items-start"
                >
                  <span className="text-sm font-semibold text-purple-300 min-w-[100px]">
                    {group?.category || "General"}:
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(group?.skills)
                      ? group.skills
                      : [group?.skills || ""]).map((skill, idx) => (
                      <span
                        key={`skill-item-${idx}`}
                        className="text-xs px-3 py-1 bg-white/15 rounded-full text-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-5 text-purple-200 uppercase tracking-wider">
              Experience
            </h2>

            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div
                  key={`exp-${index}`}
                  className="border-l-2 border-purple-300/40 pl-4"
                >
                  <div className="flex justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold">
                        {exp?.title || ""}
                      </h3>

                      <p className="text-purple-200 text-sm">
                        {exp?.company || ""}
                      </p>
                    </div>

                    <span className="text-xs text-purple-300 whitespace-nowrap">
                      {exp?.startDate || ""} —{" "}
                      {exp?.current
                        ? "Present"
                        : exp?.endDate || ""}
                    </span>
                  </div>

                  {exp?.description && (
                    <p className="text-white/70 text-sm mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-5 text-purple-200 uppercase tracking-wider">
              Projects
            </h2>

            <div className="space-y-5">
              {projects.map((proj, index) => (
                <div
                  key={`proj-${index}`}
                  className="bg-white/5 rounded-xl p-5 border border-white/10"
                >
                  <div className="flex justify-between flex-wrap gap-3">
                    <h3 className="font-semibold">
                      {proj?.title || ""}
                    </h3>

                    <div className="flex gap-3">
                      {proj?.github && (
                        <a
                          href={safeUrl(proj.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-200 underline"
                        >
                          GitHub
                        </a>
                      )}

                      {proj?.liveUrl && (
                        <a
                          href={safeUrl(proj.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-200 underline"
                        >
                          Live
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(proj?.techStack) &&
                    proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={`tech-${idx}`}
                            className="text-xs px-2 py-1 bg-white/10 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {proj?.description && (
                    <p className="text-white/70 text-sm mt-3 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-5 text-purple-200 uppercase tracking-wider">
              Education
            </h2>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={`edu-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <h3 className="font-semibold text-sm">
                      {edu?.degree || ""}
                    </h3>

                    <p className="text-purple-200 text-xs">
                      {edu?.institution || ""}
                    </p>

                    {edu?.score && (
                      <p className="text-xs text-white/60 mt-1">
                        {edu?.scoreType || "Score"}: {edu.score}
                        {edu?.outOf ? `/${edu.outOf}` : ""}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-purple-300 whitespace-nowrap">
                    {edu?.startDate || ""} —{" "}
                    {edu?.current
                      ? "Present"
                      : edu?.endDate || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-5 text-purple-200 uppercase tracking-wider">
              Certifications
            </h2>

            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div
                  key={`cert-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {cert?.title || cert?.name || ""}
                    </p>

                    <p className="text-xs text-purple-200">
                      {cert?.issuer || cert?.organization || ""}
                    </p>
                  </div>

                  <span className="text-xs text-purple-300 whitespace-nowrap">
                    {cert?.date || cert?.issueDate || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-5 text-purple-200 uppercase tracking-wider">
              Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={`achievement-${index}`}>
                  <h3 className="font-medium text-sm">
                    {achievement?.title || ""}
                  </h3>

                  {achievement?.description && (
                    <p className="text-white/70 text-sm mt-1">
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <div className={`${glass} p-6 text-white`}>
            <h2 className="text-lg font-semibold mb-4 text-purple-200 uppercase tracking-wider">
              Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="text-sm px-3 py-1 bg-white/10 rounded-full"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}