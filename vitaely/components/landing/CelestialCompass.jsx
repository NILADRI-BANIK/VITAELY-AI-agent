"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * CelestialCompass
 * Reusable animated background: a large layered astrolabe/compass motif
 * (ancient-tech / celestial-navigation feel), built entirely from CSS
 * transforms + Framer Motion — no canvas, no heavy rendering.
 *
 * Layers (back to front):
 *  - radial depth gradient (fades the whole thing into the section bg)
 *  - outer ring: runic tick marks, rotates clockwise, very slow
 *  - middle ring: runic tick marks (different count/offset), rotates
 *    counter-clockwise, slightly faster
 *  - inner ring: finer tick marks, rotates clockwise, slower still
 *  - small orbiting dots around the center, independent of ring rotation
 *  - drifting light particles, random slow float
 *
 * Palette: black / dark navy / silver / white / soft blue + violet glow
 * — no orange/bronze, per spec. Intentionally faint (low opacity, blur)
 * so it reads as atmosphere behind foreground content, not a focal
 * illustration. Purely decorative: aria-hidden, no pointer events.
 *
 * Usage:
 *   <div className="relative">
 *     <CelestialCompass />
 *     ...foreground content (cards etc), given a higher z-index...
 *   </div>
 */
export default function CelestialCompass({ className = "" }) {
  const outerTicks = useMemo(() => Array.from({ length: 24 }), []);
  const middleTicks = useMemo(() => Array.from({ length: 18 }), []);
  const innerTicks = useMemo(() => Array.from({ length: 12 }), []);

  const orbitDots = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        angle: (360 / 6) * i,
        radius: 30 + (i % 3) * 6,
        duration: 10 + i * 2,
        color: i % 2 === 0 ? "#8B85FF" : "#4cc9ff",
      })),
    []
  );

  const floatParticles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        left: (i * 41) % 100,
        top: (i * 29) % 100,
        size: 1 + (i % 3),
        duration: 8 + (i % 6),
        delay: (i % 5) * 0.6,
        color: i % 3 === 0 ? "#4cc9ff" : i % 3 === 1 ? "#8B85FF" : "#C9CDE8",
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* radial depth gradient — compass fades into the section background
          rather than being fully visible/sharp-edged */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,14,39,0) 0%, rgba(10,14,39,0.55) 62%, rgba(6,11,31,0.92) 100%)",
        }}
      />

      {/* compass stack — sized larger than its container so ring edges
          bleed off into the fade above rather than showing hard clipping */}
      <div className="relative" style={{ width: "170%", height: "170%" }}>
        {/* Outer ring — clockwise, very slow */}
        <motion.div
          className="absolute inset-[6%] rounded-full"
          style={{
            border: "1px solid rgba(148,163,255,0.14)",
            boxShadow:
              "0 0 40px rgba(108,99,255,0.06), inset 0 0 60px rgba(76,201,255,0.04)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
        >
          {outerTicks.map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 origin-[50%_50vw]"
              style={{
                transform: `translateX(-50%) rotate(${(360 / outerTicks.length) * i}deg)`,
                width: 2,
                height: 14,
                background:
                  "linear-gradient(to bottom, rgba(201,205,232,0.35), transparent)",
              }}
            />
          ))}
        </motion.div>

        {/* Middle ring — counter-clockwise, a bit faster */}
        <motion.div
          className="absolute inset-[18%] rounded-full"
          style={{
            border: "1px solid rgba(139,133,255,0.16)",
            boxShadow:
              "0 0 30px rgba(139,133,255,0.07), inset 0 0 40px rgba(108,99,255,0.05)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
        >
          {middleTicks.map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 origin-[50%_50vw]"
              style={{
                transform: `translateX(-50%) rotate(${(360 / middleTicks.length) * i}deg)`,
                width: 2,
                height: 10,
                background:
                  "linear-gradient(to bottom, rgba(139,133,255,0.4), transparent)",
              }}
            />
          ))}
        </motion.div>

        {/* Inner ring — clockwise, slower, finer ticks */}
        <motion.div
          className="absolute inset-[32%] rounded-full"
          style={{
            border: "1px solid rgba(76,201,255,0.18)",
            boxShadow:
              "0 0 24px rgba(76,201,255,0.08), inset 0 0 28px rgba(76,201,255,0.05)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        >
          {innerTicks.map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-0 origin-[50%_50vw]"
              style={{
                transform: `translateX(-50%) rotate(${(360 / innerTicks.length) * i}deg)`,
                width: 1.5,
                height: 7,
                background:
                  "linear-gradient(to bottom, rgba(76,201,255,0.45), transparent)",
              }}
            />
          ))}
        </motion.div>

        {/* small orbiting dots around the center — independent of the
            three rings above, own slow drift paths */}
        {orbitDots.map((d, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 3,
              height: 3,
              background: d.color,
              boxShadow: `0 0 6px ${d.color}`,
              marginLeft: -1.5,
              marginTop: -1.5,
            }}
            animate={{
              x: [
                `${d.radius * Math.cos((d.angle * Math.PI) / 180)}%`,
                `${d.radius * Math.cos(((d.angle + 120) * Math.PI) / 180)}%`,
                `${d.radius * Math.cos(((d.angle + 240) * Math.PI) / 180)}%`,
                `${d.radius * Math.cos((d.angle * Math.PI) / 180)}%`,
              ],
              y: [
                `${d.radius * Math.sin((d.angle * Math.PI) / 180)}%`,
                `${d.radius * Math.sin(((d.angle + 120) * Math.PI) / 180)}%`,
                `${d.radius * Math.sin(((d.angle + 240) * Math.PI) / 180)}%`,
                `${d.radius * Math.sin((d.angle * Math.PI) / 180)}%`,
              ],
            }}
            transition={{ duration: d.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* central soft glow core */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "18%",
            height: "18%",
            background:
              "radial-gradient(closest-side, rgba(108,99,255,0.18), rgba(76,201,255,0.08), transparent)",
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* drifting light particles — random slow float, independent layer */}
      {floatParticles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 5px ${p.color}`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.1, 0.6, 0.1] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}