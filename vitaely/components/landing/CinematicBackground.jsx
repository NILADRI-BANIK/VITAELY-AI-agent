"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * CinematicBackground
 * A layered, continuously-animating background for the Hero, built
 * entirely from CSS/SVG/Framer Motion (no WebGL) so it stays cheap
 * to render alongside the R3F head canvas. Layers, back to front:
 *
 * 1. Base navy/indigo gradient wash
 * 2. Aurora gradient blobs (slow drift)
 * 3. Mesh gradient overlay
 * 4. Volumetric light beams (conic gradient, rotating slowly)
 * 5. Neural network line lattice (subtle, animated opacity)
 * 6. Floating particles
 * 7. Soft moving light streaks
 * 8. Noise texture (SVG turbulence, static but breaks up banding)
 * 9. Vignette
 *
 * Layers 2–7 respond to mouse position (very subtle parallax) via a
 * single shared spring so the whole scene feels cohesive rather than
 * having each layer track the cursor independently.
 */
export default function CinematicBackground({ className = "" }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parallaxX = useSpring(rawX, { stiffness: 30, damping: 20 });
  const parallaxY = useSpring(rawY, { stiffness: 30, damping: 20 });

  const auroraShiftX = useTransform(parallaxX, [-1, 1], [-24, 24]);
  const auroraShiftY = useTransform(parallaxY, [-1, 1], [-16, 16]);
  const beamShiftX = useTransform(parallaxX, [-1, 1], [-10, 10]);
  const particleShiftX = useTransform(parallaxX, [-1, 1], [-8, 8]);
  const particleShiftY = useTransform(parallaxY, [-1, 1], [-8, 8]);

  useEffect(() => {
    const handleMove = (e) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        left: (i * 29) % 100,
        top: (i * 47) % 100,
        size: 1 + (i % 3),
        duration: 7 + (i % 6),
        delay: (i % 8) * 0.5,
        color: i % 4 === 0 ? "#4cc9ff" : i % 3 === 0 ? "#00E5A0" : "#6C63FF",
      })),
    []
  );

  const neuralNodes = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        x: (i * 137) % 1000,
        y: (i * 251) % 600,
      })),
    []
  );

  const neuralEdges = useMemo(() => {
    const edges = [];
    for (let a = 0; a < neuralNodes.length; a++) {
      let connections = 0;
      for (let b = a + 1; b < neuralNodes.length && connections < 2; b++) {
        const dx = neuralNodes[a].x - neuralNodes[b].x;
        const dy = neuralNodes[a].y - neuralNodes[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < 260) {
          edges.push([a, b]);
          connections++;
        }
      }
    }
    return edges;
  }, [neuralNodes]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* 1. base navy/indigo wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #05060F 0%, #0A0B1F 35%, #0E1030 60%, #090A1A 100%)",
        }}
      />

      {/* 2. aurora gradient blobs */}
      <motion.div
        style={{ x: auroraShiftX, y: auroraShiftY }}
        className="absolute inset-0"
      >
        <motion.div
          className="absolute -left-20 top-[-10%] h-[560px] w-[720px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.28), transparent)" }}
          animate={{ x: [0, 50, -20, 0], y: [0, 30, -20, 0], scale: [1, 1.08, 0.97, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-10%] top-[10%] h-[480px] w-[560px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(108,99,255,0.22), transparent)" }}
          animate={{ x: [0, -40, 20, 0], y: [0, -25, 15, 0], scale: [1, 0.95, 1.06, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[20%] bottom-[-15%] h-[500px] w-[640px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(76,201,255,0.14), transparent)" }}
          animate={{ x: [0, 30, -35, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* 3. mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-60 mix-blend-screen"
        style={{
          background:
            "radial-gradient(at 15% 25%, rgba(99,102,241,0.16) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(0,229,160,0.10) 0px, transparent 45%), radial-gradient(at 70% 80%, rgba(76,201,255,0.12) 0px, transparent 50%), radial-gradient(at 20% 85%, rgba(147,51,234,0.14) 0px, transparent 50%)",
        }}
      />

      {/* 4. volumetric light beams — slow rotating conic gradient */}
      <motion.div
        style={{ x: beamShiftX }}
        className="absolute inset-0 opacity-[0.14]"
      >
        <motion.div
          className="absolute left-1/2 top-[-20%] h-[140%] w-[140%] -translate-x-1/2"
          style={{
            background:
              "conic-gradient(from 200deg at 50% 0%, transparent, rgba(108,99,255,0.5), transparent 25%, transparent 75%, rgba(76,201,255,0.35), transparent)",
          }}
          animate={{ rotate: [0, 8, -4, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* 5. neural network lattice */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.12]"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {neuralEdges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={neuralNodes[a].x} y1={neuralNodes[a].y}
            x2={neuralNodes[b].x} y2={neuralNodes[b].y}
            stroke="#6C63FF"
            strokeWidth="1"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
        {neuralNodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="2" fill={i % 3 === 0 ? "#00E5A0" : "#4cc9ff"} />
        ))}
      </svg>

      {/* 6. floating particles */}
      <motion.div style={{ x: particleShiftX, y: particleShiftY }} className="absolute inset-0">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* 7. soft moving light streaks */}
      <motion.div
        className="absolute left-[-20%] top-[30%] h-px w-[70%]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(76,201,255,0.5), transparent)" }}
        animate={{ x: ["0%", "160%"], opacity: [0, 0.8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
      />
      <motion.div
        className="absolute left-[-20%] top-[65%] h-px w-[50%]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.4), transparent)" }}
        animate={{ x: ["0%", "220%"], opacity: [0, 0.6, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", repeatDelay: 5, delay: 2 }}
      />

      {/* 8. noise texture overlay */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
        <filter id="heroNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroNoise)" />
      </svg>

      {/* 9. vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(5,6,15,0.55) 85%, rgba(5,6,15,0.9) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 160px 60px rgba(5,6,15,0.8)" }}
      />
    </div>
  );
}