"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = [
  { char: "V", label: "Vision", desc: "Clarity on the career you're building toward" },
  { char: "I", label: "Interview", desc: "AI-powered mock interview preparation" },
  { char: "T", label: "Talent", desc: "Skill gap analysis and growth roadmap" },
  { char: "A", label: "ATS", desc: "Resume scoring against real ATS logic" },
  { char: "E", label: "Experience", desc: "AI-generated portfolio to showcase your work" },
  { char: "L", label: "Learning", desc: "Project ideas tailored to your goals" },
  { char: "Y", label: "You", desc: "Every tool, personalized around your career" },
];

/**
 * FloatingLetters
 * VITAELY wordmark: each letter appears high above, falls, rotates
 * slightly, bounces, and snaps into place with a glow. Once fully
 * landed: a soft pulse across the whole word, tiny particles orbit
 * continuously around the letters, and a shimmer sweeps across the
 * text every few seconds. Each letter reveals a tooltip on hover.
 * Purely presentational — no navigation/routing.
 */
export default function FloatingLetters({ className = "" }) {
  const [hovered, setHovered] = useState(null);

  const dropDuration = 0.7;
  const staggerGap = 0.12;
  const totalDropTime = dropDuration + LETTERS.length * staggerGap;

  // small orbiting particles per letter, seeded once
  const orbitParticles = useMemo(
    () =>
      LETTERS.map((_, i) =>
        Array.from({ length: 2 }).map((__, p) => ({
          radius: 22 + p * 8,
          duration: 4 + ((i + p) % 3),
          delay: (i * 0.3 + p * 0.6) % 2,
          color: (i + p) % 2 === 0 ? "#00E5A0" : "#4cc9ff",
        }))
      ),
    []
  );

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {LETTERS.map(({ char, label, desc }, i) => (
        <motion.span
          key={i}
          initial={{ y: -160, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{
            delay: i * staggerGap,
            duration: dropDuration,
            type: "spring",
            stiffness: 260,
            damping: 13,
          }}
          className="relative inline-block"
        >
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{
              delay: totalDropTime + i * 0.05,
              duration: 3 + (i % 3) * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((cur) => (cur === i ? null : cur))}
            className="relative inline-block font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white cursor-default transition-transform duration-200 hover:scale-110"
            style={{
              textShadow:
                hovered === i
                  ? "0 0 28px rgba(0,229,160,0.85), 0 0 50px rgba(108,99,255,0.5)"
                  : "0 0 20px rgba(108,99,255,0.6), 0 0 40px rgba(0,229,160,0.25)",
            }}
          >
            {char}

            {/* orbiting particles, active once landed */}
            {orbitParticles[i].map((p, pi) => (
              <motion.span
                key={pi}
                className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  x: [
                    0,
                    p.radius,
                    0,
                    -p.radius,
                    0,
                  ],
                  y: [
                    -p.radius * 0.6,
                    0,
                    p.radius * 0.6,
                    0,
                    -p.radius * 0.6,
                  ],
                }}
                transition={{
                  delay: totalDropTime + p.delay,
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            <AnimatePresence>
              {hovered === i && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full z-30 w-max max-w-[200px] rounded-xl border border-white/10 bg-[#0D1017]/95 backdrop-blur-md px-4 py-2.5 text-left shadow-2xl"
                >
                  <p className="text-xs font-sans font-semibold text-[#00E5A0] tracking-wide">
                    {label}
                  </p>
                  <p className="mt-1 text-[11px] font-sans font-normal leading-snug text-white/60">
                    {desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.span>
        </motion.span>
      ))}

      {/* soft pulse once the full word has landed */}
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0, 0.5, 0], scale: [1, 1.15, 1.3] }}
        transition={{ delay: totalDropTime, duration: 1.1, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-6 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(0,229,160,0.35), transparent)" }}
      />

      {/* periodic shimmer sweep across the whole word */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ mixBlendMode: "screen" }}
      >
        <motion.span
          className="absolute top-0 h-full w-1/3 -skew-x-12"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
          initial={{ left: "-40%" }}
          animate={{ left: "140%" }}
          transition={{
            delay: totalDropTime + 0.8,
            duration: 1.4,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />
      </motion.span>
    </div>
  );
}