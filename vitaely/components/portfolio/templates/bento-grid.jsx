"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float, Environment } from "@react-three/drei";
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Award,
  GraduationCap,
  Briefcase,
  Sparkles,
  Twitter,
  Code2,
} from "lucide-react";

// ─────────────────────────────────────────────
// safeUrl helper (consistent with other templates)
// ─────────────────────────────────────────────
const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

// ─────────────────────────────────────────────
// 3D MODEL — Floating Modular Cube Cluster
// ─────────────────────────────────────────────
function Cube({ position, size = 0.6, color, glass = false, speed = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    ref.current.rotation.y = t * 0.15;
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.15;
  });

  return (
    <RoundedBox ref={ref} args={[size, size, size]} radius={0.08} smoothness={4} position={position}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.15}
        roughness={0.25}
        transmission={glass ? 0.85 : 0}
        thickness={glass ? 1.2 : 0}
        transparent={glass}
        opacity={glass ? 0.75 : 1}
        clearcoat={0.6}
        clearcoatRoughness={0.2}
      />
    </RoundedBox>
  );
}

function CubeCluster({ mouseX, mouseY }) {
  const group = useRef();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y += (mouseX.get() * 0.4 - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (mouseY.get() * 0.2 - group.current.rotation.x) * 0.05;
  });

  const cubes = [
    { position: [0, 0, 0], size: 0.6, color: "#ffffff", glass: false, speed: 0.6 },
    { position: [0.75, 0.35, -0.2], size: 0.34, color: "#3B82F6", glass: true, speed: 1 },
    { position: [-0.65, -0.2, 0.25], size: 0.38, color: "#6366F1", glass: false, speed: 0.8 },
    { position: [0.25, -0.7, 0.15], size: 0.26, color: "#22D3EE", glass: true, speed: 1.2 },
    { position: [-0.55, 0.6, -0.15], size: 0.24, color: "#A78BFA", glass: true, speed: 0.9 },
  ];

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        {cubes.map((c, i) => (
          <Cube key={i} {...c} />
        ))}
      </Float>
    </group>
  );
}

function BentoScene() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <directionalLight position={[-3, -2, -4]} intensity={0.4} color="#6366F1" />
      <Suspense fallback={null}>
        <CubeCluster mouseX={smoothX} mouseY={smoothY} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

// ─────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cardHover = {
  rest: { scale: 1, boxShadow: "0 4px 24px rgba(15,23,42,0.06)" },
  hover: {
    scale: 1.01,
    boxShadow: "0 12px 40px rgba(59,130,246,0.16)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// ─────────────────────────────────────────────
// SHARED BENTO CARD WRAPPER
// overflow-hidden added so absolutely-positioned decorative
// elements (like the 3D cube overlay) never bleed into
// neighboring grid cells.
// ─────────────────────────────────────────────
function BentoCard({ className = "", accent = "blue", children, i = 0, span = "", id }) {
  const accents = {
    blue: "hover:border-blue-300",
    purple: "hover:border-purple-300",
    emerald: "hover:border-emerald-300",
    orange: "hover:border-orange-300",
    pink: "hover:border-pink-300",
    indigo: "hover:border-indigo-300",
  };

  return (
    <motion.div
      id={id}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      whileHover="hover"
      animate="rest"
      className={`min-w-0 ${span}`}
    >
      <motion.div
        variants={cardHover}
        className={`relative overflow-hidden bg-white border border-slate-200/70 rounded-[22px] p-6 md:p-8 h-full transition-colors duration-300 ${accents[accent]} ${className}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function CountUp({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const num = parseInt(value, 10) || 0;
          const duration = 900;
          const startTime = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setDisplay(Math.floor(progress * num));
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(num);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, started]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
      {display}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN TEMPLATE
// data shape matches notion-style.jsx / retro-wave.jsx:
//   data.hero: { name, title, summary/tagline }
//   data.contact: { email, phone, linkedin, github, twitter, portfolioUrl, leetcode, hackerrank }
//   data.skills: [{ category, skills: [] }]
//   data.experience: [{ title, company, location, startDate, endDate, current, description }]
//   data.education: [{ degree, institution, startDate, endDate, current, score, scoreType, outOf, description }]
//   data.projects: [{ title, description, techStack, liveUrl, github }]
//   data.certifications: [{ title/name, issuer/organization, date/issueDate }]
//   data.achievements: [{ title, description }]
// ─────────────────────────────────────────────
export default function BentoGridTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const name = hero.name || "Your Name";
  const title = hero.title || "Your Title";
  const bio = hero.summary || hero.tagline || "I build clean, modular, and thoughtful digital products.";

  const email = contact.email || "";
  const phone = contact.phone || "";
  const linkedin = contact.linkedin || "";
  const github = contact.github || "";
  const twitter = contact.twitter || "";
  const website = contact.portfolioUrl || "";

  const skillGroups = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const certifications = Array.isArray(data?.certifications) ? data.certifications : [];
  const achievements = Array.isArray(data?.achievements) ? data.achievements : [];

  const totalSkills = skillGroups.reduce(
    (acc, g) => acc + (Array.isArray(g?.skills) ? g.skills.length : 0),
    0,
  );

  const accentPalette = ["blue", "purple", "emerald", "orange", "pink", "indigo"];
  const getAccent = (i) => accentPalette[i % accentPalette.length];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
        {/* ── GRID ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 md:gap-6 auto-rows-min">
          {/* HERO — large tile w/ 3D model, contained via overflow-hidden on BentoCard */}
          <BentoCard i={0} accent="blue" span="md:col-span-4 md:row-span-2">
            {/* decorative 3D layer — behind text, clipped to this card only */}
            <div className="pointer-events-none absolute -right-10 -top-10 w-64 h-64 opacity-70 hidden sm:block z-0">
              <BentoScene />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <Sparkles size={12} /> Available for work
                </span>
                <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] break-words">
                  {name}
                </h1>
                <p className="mt-2 text-lg md:text-xl text-slate-500 font-medium">{title}</p>
                <p className="mt-4 text-slate-600 leading-relaxed max-w-md">{bio}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {projects.length > 0 && (
                  <a
                    href="#projects"
                    className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
                  >
                    View Work
                  </a>
                )}
                <a
                  href="#contact"
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-sm font-semibold hover:border-slate-400 transition-colors"
                >
                  Contact
                </a>
                <div className="flex items-center gap-2 ml-auto">
                  {github && (
                    <a
                      href={safeUrl(github)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <Github size={17} />
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={safeUrl(linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <Linkedin size={17} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* IDENTITY tile */}
          <BentoCard i={1} accent="indigo" span="md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-slate-400 text-xl font-bold">{name?.[0] || "?"}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Role</p>
                <p className="font-semibold text-slate-800 mt-0.5 truncate">{title}</p>
              </div>
            </div>
          </BentoCard>

          {/* STATS small tiles */}
          {[
            { label: "Skills", value: totalSkills, accent: "blue" },
            { label: "Projects", value: projects.length, accent: "purple" },
          ].map((s, idx) => (
            <BentoCard key={s.label} i={2 + idx} accent={s.accent} span="md:col-span-1">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                {s.label}
              </p>
              <CountUp value={s.value} suffix="+" />
            </BentoCard>
          ))}

          {/* SKILLS — medium tile */}
          <BentoCard i={4} accent="emerald" span="md:col-span-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Skills
            </p>
            {skillGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skillGroups.map((group, gi) => (
                  <div key={gi} className="bg-emerald-50/60 rounded-2xl p-4 min-w-0">
                    {group?.category && (
                      <p className="text-sm font-semibold text-emerald-700 mb-2 truncate">
                        {group.category}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(group?.skills) ? group.skills : []).map((s, si) => (
                        <span
                          key={si}
                          className="text-xs font-medium bg-white text-slate-600 px-2.5 py-1 rounded-full border border-emerald-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No skills added yet.</p>
            )}
          </BentoCard>

          {/* EDUCATION tile */}
          <BentoCard i={5} accent="indigo" span="md:col-span-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
              <GraduationCap size={13} /> Education
            </p>
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((ed, idx) => (
                  <div key={idx} className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {ed?.degree || "Degree"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{ed?.institution || ""}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ed?.startDate
                        ? `${ed.startDate} – ${ed?.current ? "Present" : ed?.endDate || ""}`
                        : ""}
                      {ed?.score ? ` · ${ed?.scoreType || "Score"} ${ed.score}${ed?.outOf ? `/${ed.outOf}` : ""}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No education added yet.</p>
            )}
          </BentoCard>

          {/* FEATURED PROJECT — large tile */}
          {projects[0] && (
            <BentoCard i={6} accent="blue" span="md:col-span-4" id="projects">
              <div className="flex items-center justify-between mb-4 gap-2">
                <p className="text-xs uppercase tracking-wider text-blue-500 font-semibold">
                  Featured Project
                </p>
              </div>
              <h3 className="text-xl font-bold text-slate-900 break-words">
                {projects[0].title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {projects[0].description}
              </p>
              {Array.isArray(projects[0].techStack) && projects[0].techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {projects[0].techStack.map((t, ti) => (
                    <span
                      key={ti}
                      className="text-xs font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-5">
                {projects[0].github && (
                  <a
                    href={safeUrl(projects[0].github)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
                  >
                    <Github size={15} /> Code
                  </a>
                )}
                {projects[0].liveUrl && (
                  <a
                    href={safeUrl(projects[0].liveUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink size={15} /> Live Demo
                  </a>
                )}
              </div>
            </BentoCard>
          )}

          {/* OTHER PROJECTS — medium tiles */}
          {projects.slice(1, 3).map((p, idx) => (
            <BentoCard key={p?.title || idx} i={7 + idx} accent="pink" span="md:col-span-2">
              <h3 className="font-bold text-slate-900 break-words">{p?.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-3">{p?.description}</p>
              {Array.isArray(p?.techStack) && p.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.techStack.slice(0, 4).map((t, ti) => (
                    <span
                      key={ti}
                      className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-3">
                {p?.github && (
                  <a
                    href={safeUrl(p.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold flex items-center gap-1 text-slate-600 hover:text-slate-900"
                  >
                    <Github size={13} /> Code
                  </a>
                )}
                {p?.liveUrl && (
                  <a
                    href={safeUrl(p.liveUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold flex items-center gap-1 text-pink-600 hover:text-pink-700"
                  >
                    <ExternalLink size={13} /> Demo
                  </a>
                )}
              </div>
            </BentoCard>
          ))}

          {/* remaining projects, if any beyond the first 3 */}
          {projects.slice(3).map((p, idx) => (
            <BentoCard key={p?.title || `extra-${idx}`} i={9 + idx} accent="orange" span="md:col-span-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Code2 size={13} className="text-orange-500 flex-shrink-0" />
                <h3 className="font-bold text-slate-900 break-words">{p?.title}</h3>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{p?.description}</p>
            </BentoCard>
          ))}

          {/* EXPERIENCE — medium tile */}
          <BentoCard i={12} accent="purple" span="md:col-span-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
              <Briefcase size={13} /> Experience
            </p>
            {experience.length > 0 ? (
              <div className="space-y-5">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-purple-100 min-w-0">
                    <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-purple-400" />
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {exp?.title || "Role"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{exp?.company || ""}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {exp?.startDate
                        ? `${exp.startDate} – ${exp?.current ? "Present" : exp?.endDate || ""}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No experience added yet.</p>
            )}
          </BentoCard>

          {/* CERTIFICATIONS / ACHIEVEMENTS tile */}
          <BentoCard i={13} accent="orange" span="md:col-span-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
              <Award size={13} /> Achievements
            </p>
            {achievements.length > 0 || certifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {achievements.map((a, idx) => (
                  <span
                    key={`ach-${idx}`}
                    className="text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100"
                  >
                    {a?.title || ""}
                  </span>
                ))}
                {certifications.map((c, idx) => (
                  <span
                    key={`cert-${idx}`}
                    className="text-xs font-medium bg-orange-50/60 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100"
                  >
                    {c?.title || c?.name || ""}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No achievements added yet.</p>
            )}
          </BentoCard>

          {/* CONTACT — full-width tile */}
          <BentoCard i={14} accent="blue" span="md:col-span-6" id="contact">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Let&apos;s Connect
            </p>
            <div className="flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full transition-colors"
                >
                  <Mail size={15} /> {email}
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full transition-colors"
                >
                  <Phone size={15} /> {phone}
                </a>
              )}
              {website && (
                <a
                  href={safeUrl(website)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full transition-colors"
                >
                  <Globe size={15} /> Website
                </a>
              )}
              {github && (
                <a
                  href={safeUrl(github)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full transition-colors"
                >
                  <Github size={15} /> GitHub
                </a>
              )}
              {linkedin && (
                <a
                  href={safeUrl(linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full transition-colors"
                >
                  <Linkedin size={15} /> LinkedIn
                </a>
              )}
              {twitter && (
                <a
                  href={safeUrl(twitter)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full transition-colors"
                >
                  <Twitter size={15} /> Twitter
                </a>
              )}
              {!email && !phone && !website && !github && !linkedin && !twitter && (
                <p className="text-sm text-slate-400">No contact information added yet.</p>
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}