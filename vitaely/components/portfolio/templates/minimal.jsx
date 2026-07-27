"use client";

const safeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export default function MinimalTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const skills = Array.isArray(data?.skills)
    ? data.skills
    : [];

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

  const hobbies = Array.isArray(data?.hobbies)
    ? data.hobbies
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
    <div className="min-h-screen bg-white font-sans px-6 md:px-12 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-wide break-words">
          {safeText(hero.name) || "Your Name"}
        </h1>

        <p className="text-gray-500 mt-1 break-words">
          {safeText(hero.title)}
        </p>

        {hero.tagline && (
          <p className="text-gray-400 text-sm italic mt-1 break-words">
            {safeText(hero.tagline)}
          </p>
        )}

        <div className="flex gap-4 mt-3 text-xs text-gray-400 flex-wrap break-all">
          {contact.email && (
            <span>{safeText(contact.email)}</span>
          )}

          {contact.phone && (
            <span>{safeText(contact.phone)}</span>
          )}

          {contact.github && (
            <a
              href={safeUrl(contact.github)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
            >
              GitHub
            </a>
          )}

          {contact.linkedin && (
            <a
              href={safeUrl(contact.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
            >
              LinkedIn
            </a>
          )}

          {contact.twitter && (
            <a
              href={safeUrl(contact.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
            >
              Twitter
            </a>
          )}

          {contact.portfolioUrl && (
            <a
              href={safeUrl(contact.portfolioUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
            >
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {hero.summary && (
        <p className="text-sm text-gray-600 mb-8 leading-relaxed whitespace-pre-line break-words">
          {safeText(hero.summary)}
        </p>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Experience
          </h2>

          {experience.map((exp, i) => (
            <div
              key={`exp-${i}`}
              className="mb-5"
            >
              <div className="flex justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <span className="font-medium text-gray-800 break-words">
                    {safeText(exp?.title)}
                  </span>

                  {exp?.company && (
                    <span className="text-gray-500 ml-2 break-words">
                      · {safeText(exp?.company)}
                    </span>
                  )}
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {safeText(exp?.startDate)} —{" "}
                  {exp?.current
                    ? "Present"
                    : safeText(exp?.endDate)}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line break-words">
                {safeText(exp?.description)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Projects
          </h2>

          {projects.map((proj, i) => (
            <div
              key={`proj-${i}`}
              className="mb-5"
            >
              <div className="flex justify-between gap-4 flex-wrap">
                <span className="font-medium text-gray-800 break-words">
                  {safeText(proj?.title)}
                </span>

                <div className="flex gap-3 flex-wrap">
                  {proj?.github && (
                    <a
                      href={safeUrl(proj.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
                    >
                      GitHub
                    </a>
                  )}

                  {proj?.liveUrl && (
                    <a
                      href={safeUrl(proj.liveUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
                    >
                      Live
                    </a>
                  )}
                </div>
              </div>

              {Array.isArray(proj?.techStack) &&
                proj.techStack.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1 break-words">
                    {proj.techStack
                      .map((tech) => safeText(tech))
                      .join(" · ")}
                  </p>
                )}

              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line break-words">
                {safeText(proj?.description)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Skills
          </h2>

          {skills.map((group, i) => (
            <p
              key={`skill-${i}`}
              className="text-sm text-gray-600 mb-2 break-words"
            >
              <span className="font-medium text-gray-700">
                {safeText(group?.category)}:
              </span>{" "}
              {Array.isArray(group?.skills)
                ? group.skills
                    .map((skill) => safeText(skill))
                    .join(", ")
                : safeText(group?.skills)}
            </p>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Education
          </h2>

          {education.map((edu, i) => (
            <div
              key={`edu-${i}`}
              className="mb-4 flex justify-between gap-4 flex-wrap"
            >
              <div className="min-w-0">
                <span className="font-medium text-gray-800 break-words">
                  {safeText(edu?.degree)}
                </span>

                {edu?.institution && (
                  <span className="text-gray-500 text-sm ml-2 break-words">
                    · {safeText(edu?.institution)}
                  </span>
                )}

                {edu?.score && (
                  <p className="text-xs text-gray-400 mt-1">
                    {safeText(edu?.scoreType) || "Score"}:{" "}
                    {safeText(edu?.score)}
                    {edu?.outOf
                      ? `/${safeText(edu?.outOf)}`
                      : ""}
                  </p>
                )}
              </div>

              <span className="text-xs text-gray-400 whitespace-nowrap">
                {safeText(edu?.startDate)} —{" "}
                {edu?.current
                  ? "Present"
                  : safeText(edu?.endDate)}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Certifications
          </h2>

          {certifications.map((cert, i) => (
            <div
              key={`cert-${i}`}
              className="mb-3 flex justify-between gap-4 flex-wrap"
            >
              <div className="min-w-0">
                <span className="text-sm text-gray-700 break-words">
                  {safeText(cert?.title || cert?.name)}
                </span>

                {(cert?.issuer || cert?.organization) && (
                  <span className="text-gray-400 ml-1 break-words">
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
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Achievements
          </h2>

          {achievements.map((ach, i) => (
            <div
              key={`ach-${i}`}
              className="mb-3"
            >
              <span className="text-sm font-medium text-gray-700 break-words">
                {safeText(ach?.title)}
              </span>

              <p className="text-xs text-gray-400 whitespace-pre-line break-words">
                {safeText(ach?.description)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Interests */}
      {hobbies.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Interests
          </h2>

          <p className="text-sm text-gray-500 break-words">
            {hobbies
              .map((hobby) => safeText(hobby))
              .join(" · ")}
          </p>
        </section>
      )}
    </div>
  );
}