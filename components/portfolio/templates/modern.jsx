// components/portfolio/templates/modern.jsx
"use client";

const safeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export default function ModernTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience)
    ? data.experience
    : [];
  const education = Array.isArray(data?.education)
    ? data.education
    : [];
  const projects = Array.isArray(data?.projects)
    ? data.projects
    : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];
  const hobbies = Array.isArray(data?.hobbies)
    ? data.hobbies
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];

  const safeUrl = (url) => {
    if (!url) return "#";

    try {
      const formatted =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      const parsed = new URL(formatted);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "#";
      }

      return parsed.href;
    } catch {
      return "#";
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <div className="bg-blue-600 text-white px-6 md:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 break-words">
          {safeText(hero.name) || "Your Name"}
        </h1>

        <p className="text-blue-100 text-lg mb-4 break-words">
          {safeText(hero.title)}
        </p>

        {hero.tagline && (
          <p className="text-blue-200 text-sm italic mb-3 break-words">
            {safeText(hero.tagline)}
          </p>
        )}

        <p className="text-blue-50 text-sm max-w-2xl leading-relaxed whitespace-pre-line break-words">
          {safeText(hero.summary)}
        </p>

        <div className="flex flex-wrap gap-4 mt-6 text-sm text-blue-100 break-all">
          {contact.email && (
            <span>{safeText(contact.email)}</span>
          )}

          {contact.phone && (
            <span>{safeText(contact.phone)}</span>
          )}

          {contact.linkedin && (
            <a
              href={safeUrl(contact.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          )}

          {contact.github && (
            <a
              href={safeUrl(contact.github)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              GitHub
            </a>
          )}

          {contact.twitter && (
            <a
              href={safeUrl(contact.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Twitter
            </a>
          )}

          {contact.portfolioUrl && (
            <a
              href={safeUrl(contact.portfolioUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="px-4 md:px-8 py-8 space-y-10">
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Skills
            </h2>

            <div className="space-y-3">
              {skills.map((group, i) => (
                <div
                  key={`skill-${i}`}
                  className="break-words"
                >
                  <span className="font-semibold text-sm text-gray-700">
                    {safeText(group?.category)}:
                  </span>{" "}
                  <span className="text-sm text-gray-600">
                    {Array.isArray(group?.skills)
                      ? group.skills
                          .map((skill) => safeText(skill))
                          .join(", ")
                      : safeText(group?.skills)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Experience
            </h2>

            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={`exp-${i}`}>
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 break-words">
                        {safeText(exp?.title)}
                      </h3>

                      <p className="text-blue-600 text-sm break-words">
                        {safeText(exp?.company)}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {safeText(exp?.startDate)} —{" "}
                      {exp?.current
                        ? "Present"
                        : safeText(exp?.endDate)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-line break-words">
                    {safeText(exp?.description)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Projects
            </h2>

            <div className="space-y-5">
              {projects.map((proj, i) => (
                <div key={`proj-${i}`}>
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <h3 className="font-semibold text-gray-800 break-words">
                      {safeText(proj?.title)}
                    </h3>

                    <div className="flex gap-3 flex-wrap">
                      {proj?.github && (
                        <a
                          href={safeUrl(proj.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          GitHub
                        </a>
                      )}

                      {proj?.liveUrl && (
                        <a
                          href={safeUrl(proj.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          Live
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(proj?.techStack) &&
                    proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {proj.techStack.map((tech, j) => (
                          <span
                            key={`tech-${j}`}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                          >
                            {safeText(tech)}
                          </span>
                        ))}
                      </div>
                    )}

                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-line break-words">
                    {safeText(proj?.description)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Education
            </h2>

            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={`edu-${i}`}>
                  <div className="flex justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 break-words">
                        {safeText(edu?.degree)}
                      </h3>

                      <p className="text-sm text-gray-600 break-words">
                        {safeText(edu?.institution)}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {safeText(edu?.startDate)} —{" "}
                      {edu?.current
                        ? "Present"
                        : safeText(edu?.endDate)}
                    </span>
                  </div>

                  {edu?.score && (
                    <p className="text-xs text-gray-500 mt-1">
                      {safeText(edu?.scoreType) || "Score"}:{" "}
                      {safeText(edu?.score)}
                      {edu?.outOf
                        ? `/${safeText(edu?.outOf)}`
                        : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Certifications
            </h2>

            <div className="space-y-3">
              {certifications.map((cert, i) => (
                <div
                  key={`cert-${i}`}
                  className="flex justify-between gap-4 flex-wrap"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-sm text-gray-800 break-words">
                      {safeText(cert?.title || cert?.name)}
                    </span>

                    {(cert?.issuer || cert?.organization) && (
                      <span className="text-sm text-gray-500 ml-2 break-words">
                        —{" "}
                        {safeText(
                          cert?.issuer || cert?.organization
                        )}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {safeText(cert?.date || cert?.issueDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Achievements
            </h2>

            <div className="space-y-3">
              {achievements.map((ach, i) => (
                <div key={`ach-${i}`}>
                  <p className="font-medium text-sm text-gray-800 break-words">
                    {safeText(ach?.title)}
                  </p>

                  <p className="text-sm text-gray-500 whitespace-pre-line break-words">
                    {safeText(ach?.description)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-blue-600 border-b border-blue-200 pb-2 mb-4">
              Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, i) => (
                <span
                  key={`hobby-${i}`}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full break-words"
                >
                  {safeText(hobby)}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}