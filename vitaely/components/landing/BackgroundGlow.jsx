"use client";

import { motion } from "framer-motion";

const AMBIENT_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: 2 + Math.random() * 5,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 8 + Math.random() * 10,
  delay: Math.random() * 6,
  drift: Math.random() > 0.5 ? 1 : -1,
}));

export default function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Main Blue Glow */}
      <motion.div
        className="absolute -top-24 -left-20 h-[700px] w-[700px] rounded-full blur-[140px] opacity-90"
        style={{
          background:
            "radial-gradient(circle, rgba(108,99,255,0.75) 0%, rgba(108,99,255,0.45) 40%, transparent 75%)",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 20, -10, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Cyan Glow */}
      <motion.div
        className="absolute top-12 right-[-8%] h-[760px] w-[760px] rounded-full blur-[170px] opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.55) 0%, rgba(0,229,160,0.22) 45%, transparent 75%)",
        }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, -20, 15, 0],
          scale: [1, 0.95, 1.08, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Electric Blue */}
      <motion.div
        className="absolute bottom-[-10%] left-1/3 h-[650px] w-[650px] rounded-full blur-[150px] opacity-75"
        style={{
          background:
            "radial-gradient(circle, rgba(79,140,255,0.45) 0%, rgba(79,140,255,0.18) 50%, transparent 75%)",
        }}
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -15, 15, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora */}
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(120deg, transparent 20%, rgba(108,99,255,.18) 40%, rgba(0,229,160,.12) 60%, transparent 80%)",
          backgroundSize: "250% 250%",
        }}
        animate={{
          backgroundPosition: [
            "0% 50%",
            "100% 50%",
            "0% 50%",
          ],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* Particles */}
      {AMBIENT_PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: "white",
            boxShadow:
              "0 0 12px rgba(108,99,255,.9),0 0 24px rgba(0,229,160,.7)",
          }}
          animate={{
            y: [0, p.drift * 25, 0],
            x: [0, p.drift * -15, 0],
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Center Spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 32% 48%, rgba(108,99,255,.22), transparent 28%)",
        }}
      />

      {/* Dark Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 55%, rgba(2,6,23,.35) 100%)",
        }}
      />
    </div>
  );
}