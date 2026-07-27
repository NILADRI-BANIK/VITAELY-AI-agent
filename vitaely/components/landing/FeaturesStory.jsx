"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useGsapChapter } from "@/hooks/useGsapChapter";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import CelestialCompass from "@/components/landing/CelestialCompass";

/* ------------------------------------------------------------------
   FeaturesStory
   - First 4 items: asymmetric label + paragraph pairs, alternating
     left/right, each with a thin connector line into the center,
     revealed one at a time as the section is scrolled through.
   - Remaining items: arranged in a circular ring below, with a center
     label and a connecting circular guide line, each node fading/
     scaling in in sequence. A CelestialCompass background (three
     independently rotating runic rings + orbiting/floating particles)
     sits as a deeper decorative layer behind this ring — the existing
     thin glowing guide-circle is unchanged and renders on top of it.
   All animation is GSAP timeline tweens on refs — no React state
   changes during scroll, so no re-render cost / lag.
------------------------------------------------------------------ */
export default function FeaturesStory({ features }) {
  const noteItems = features.slice(0, 4);
  const ringItems = features.slice(4);

  const noteRefs = useRef([]);
  const lineRefs = useRef([]);
  const shimmerRefs = useRef([]);
  const ringRefs = useRef([]);
  const ringCenterRef = useRef(null);
  const notesContainerRef = useRef(null);
  const emblemDiscRef = useRef(null);
  const ringSpinRef = useRef(null);
  const guideCircleRef = useRef(null);
  const ringWrapperRef = useRef(null);
  const compassParallaxRef = useRef(null);
  const [hoveredRingIndex, setHoveredRingIndex] = useState(null);

  const sectionRef = useGsapChapter(({ timeline }) => {
    noteItems.forEach((_, i) => {
      const el = noteRefs.current[i];
      const line = lineRefs.current[i];
      if (!el) return;
      const dir = i % 2 === 0 ? -24 : 24;
      timeline.fromTo(
        el,
        { autoAlpha: 0, x: dir, y: 16 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.5 },
        i * 0.12
      );
      if (line) {
        timeline.fromTo(
          line,
          { scaleY: 0, opacity: 0 },
          {
            scaleY: 1,
            opacity: 0.4,
            duration: 0.4,
            onComplete: () => {
              const dot = shimmerRefs.current[i];
              if (!dot) return;
              if (dot.dataset.shimmerActive === "true") return;
              dot.dataset.shimmerActive = "true";
              gsap.fromTo(
                dot,
                { top: "0%", opacity: 0 },
                {
                  top: "100%",
                  opacity: 1,
                  duration: 1.4,
                  ease: "power1.inOut",
                  repeat: -1,
                  repeatDelay: 0.6,
                }
              );
            },
            onReverseComplete: () => {
              const dot = shimmerRefs.current[i];
              if (!dot) return;
              gsap.killTweensOf(dot);
              dot.dataset.shimmerActive = "false";
              gsap.set(dot, { opacity: 0, top: "0%" });
            },
          },
          i * 0.12 + 0.1
        );
      }
    });

    if (ringCenterRef.current) {
      timeline.fromTo(
        ringCenterRef.current,
        { autoAlpha: 0, scale: 0.85 },
        { autoAlpha: 1, scale: 1, duration: 0.4 },
        0.55
      );
    }

    ringItems.forEach((_, i) => {
      const el = ringRefs.current[i];
      if (!el) return;
      timeline.fromTo(
        el,
        { autoAlpha: 0, scale: 0.7 },
        { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.6)" },
        0.62 + i * 0.08
      );
    });

    // Subtle parallax on the compass background + card ring as the
    // section scrolls through its pin — compass drifts a little more
    // than the cards, giving depth. The compass's own ring rotations
    // (inside CelestialCompass) keep running independently throughout;
    // this only adds a position offset on top of that.
    if (compassParallaxRef.current) {
      timeline.fromTo(
        compassParallaxRef.current,
        { y: 20 },
        { y: -20, duration: 1, ease: "none" },
        0
      );
    }
    if (ringWrapperRef.current) {
      timeline.fromTo(
        ringWrapperRef.current,
        { y: 8 },
        { y: -8, duration: 1, ease: "none" },
        0
      );
    }
  });

  const ringRadius = 220;

  useEffect(() => {
    const container = notesContainerRef.current;
    const emblem = emblemDiscRef.current;
    if (!container || !emblem) return;

    const spinEmblem = gsap.quickTo(emblem, "rotation", {
      duration: 0.6,
      ease: "power3.out",
    });

    const lineSpins = lineRefs.current.map((line) =>
      line ? gsap.quickTo(line, "rotation", { duration: 0.2, ease: "power3.out" }) : null
    );

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const clamped = Math.min(1, Math.max(0, relX));
      spinEmblem(clamped * 360);
      lineSpins.forEach((spin) => {
        if (spin) spin((clamped - 0.5) * 12);
      });
    };

    const handleMouseLeave = () => {
      spinEmblem(0);
      lineSpins.forEach((spin) => spin && spin(0));
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const ring = ringSpinRef.current;
    if (!ring) return;

    const spin = gsap.to(ring, {
      rotation: 360,
      duration: 90,
      repeat: -1,
      ease: "none",
      transformOrigin: "50% 50%",
    });

    const pause = () => spin.pause();
    const resume = () => spin.resume();

    const wrapper = ring.parentElement;
    wrapper?.addEventListener("mouseenter", pause);
    wrapper?.addEventListener("mouseleave", resume);

    return () => {
      spin.kill();
      wrapper?.removeEventListener("mouseenter", pause);
      wrapper?.removeEventListener("mouseleave", resume);
    };
  }, []);

  useEffect(() => {
    const glow = guideCircleRef.current;
    if (!glow) return;

    const pulse = gsap.to(glow, {
      opacity: 0.5,
      duration: 2.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => pulse.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden py-24"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mx-auto mb-5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[11px] tracking-[0.2em] text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />
          FEATURES
        </div>
        <h2 className="text-3xl font-bold tracking-tighter text-white">
          Powerful Features for Your Career Growth
        </h2>
      </div>

      {/* ---- Notes layout (first 4) ---- */}
      <div
        ref={notesContainerRef}
        className="relative w-full max-w-6xl mx-auto min-h-[460px] mb-20 px-4 md:px-10"
      >
        <div
          ref={ringCenterRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 z-10"
        >
          <div
            ref={emblemDiscRef}
            className="w-24 h-24 rounded-full bg-[#0A0E27] flex items-center justify-center relative"
            style={{
              boxShadow:
                "0 0 30px 10px rgba(108,99,255,0.35), 0 0 70px 25px rgba(108,99,255,0.18), 0 0 120px 45px rgba(108,99,255,0.08)",
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 200 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0 0 8px rgba(244,235,208,0.85))",
              }}
            >
              <path
                d="M96 70 C70 55 40 45 4 40 C34 55 55 62 70 78 C55 76 30 70 8 62 C36 82 60 88 90 92 Z"
                fill="#F4EBD0"
              />
              <path
                d="M104 70 C130 55 160 45 196 40 C166 55 145 62 130 78 C145 76 170 70 192 62 C164 82 140 88 110 92 Z"
                fill="#F4EBD0"
              />
              <path
                d="M100 30 L106 55 L100 75 L106 100 L100 130 L94 100 L100 75 L94 55 Z"
                fill="#F4EBD0"
              />
            </svg>
          </div>
        </div>

        {noteItems.map((feature, i) => {
          const side = i % 2 === 0 ? "left" : "right";
          const topPct = 8 + Math.floor(i / 2) * 48;
          return (
            <div key={i}>
              <div
                ref={(el) => (lineRefs.current[i] = el)}
                className={`hidden md:block absolute top-0 h-24 w-px origin-top opacity-0 ${
                  side === "left" ? "left-[38%]" : "right-[38%]"
                }`}
                style={{
                  top: `${topPct + 6}%`,
                  background:
                    "linear-gradient(to bottom, rgba(108,99,255,0.7), rgba(108,99,255,0.1))",
                  boxShadow: "0 0 8px rgba(108,99,255,0.6)",
                }}
              >
                <span
                  ref={(el) => (shimmerRefs.current[i] = el)}
                  className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full opacity-0"
                  style={{
                    background: "#F4EBD0",
                    boxShadow:
                      "0 0 6px 2px rgba(244,235,208,0.9), 0 0 14px 4px rgba(108,99,255,0.7)",
                  }}
                />
              </div>
              <div
                ref={(el) => (noteRefs.current[i] = el)}
                className={`absolute w-[85%] sm:w-[70%] md:w-[34%] px-2 opacity-0 box-border ${
                  side === "left"
                    ? "left-0 text-left"
                    : "right-0 text-right md:text-right"
                }`}
                style={{ top: `${topPct}%` }}
              >
                <Link href={feature.href || "#"} className="group inline-block w-full">
                  <p
                    className={`text-[11px] tracking-[0.15em] uppercase text-[#8B85FF] mb-2 flex items-center gap-2 flex-wrap group-hover:text-[#6C63FF] transition-colors ${
                      side === "right" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {side === "left" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] flex-shrink-0" />
                    )}
                    <span className="break-words">{feature.title}</span>
                    {side === "right" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] flex-shrink-0" />
                    )}
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed break-words">
                    {feature.description}
                  </p>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Ring layout (remaining features) ---- */}
      {ringItems.length > 0 && (
        <div
          className="relative mx-auto hidden md:block"
          style={{ width: ringRadius * 2 + 200, height: ringRadius * 2 + 200 }}
        >
          {/* Celestial compass — deep background layer, behind the
              existing guide circle. Sized larger than this wrapper
              internally so it reads as a big atmospheric backdrop
              rather than being boxed in. */}
          <div ref={compassParallaxRef} className="absolute inset-0" style={{ zIndex: 0 }}>
            <CelestialCompass />
          </div>

          <div ref={ringWrapperRef} className="absolute inset-0" style={{ zIndex: 1 }}>
            {/* guide circle — stays static (doesn't spin); base ring plus a
                separate glow layer that slowly breathes in/out. Unchanged
                from before, just now rendering above the compass layer. */}
            <div className="absolute inset-0 rounded-full border border-[#6C63FF]/30" />
            <div
              ref={guideCircleRef}
              className="absolute inset-0 rounded-full pointer-events-none opacity-100"
              style={{
                boxShadow:
                  "0 0 14px 3px rgba(108,99,255,0.35), 0 0 28px 6px rgba(108,99,255,0.18)",
              }}
            />

            {/* center — "Explore More" by default, swaps to the hovered
                feature's title/description with a fade+slide transition */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 w-56 pointer-events-none">
              <AnimatePresence mode="wait">
                {hoveredRingIndex === null ? (
                  <motion.p
                    key="default"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="text-2xl font-serif text-[#F4EBD0]"
                  >
                    Explore More
                  </motion.p>
                ) : (
                  <motion.div
                    key={hoveredRingIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-lg font-serif text-[#F4EBD0] mb-1.5">
                      {ringItems[hoveredRingIndex]?.title}
                    </p>
                    <p className="text-xs text-white/60 leading-snug">
                      {ringItems[hoveredRingIndex]?.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={ringSpinRef} className="absolute inset-0">
              {ringItems.map((feature, i) => {
                const angle = (360 / ringItems.length) * i - 90;
                const rad = (angle * Math.PI) / 180;
                const x = ringRadius * Math.cos(rad);
                const y = ringRadius * Math.sin(rad);
                const isHovered = hoveredRingIndex === i;
                return (
                  <div
                    key={i}
                    ref={(el) => (ringRefs.current[i] = el)}
                    className="absolute left-1/2 top-1/2 opacity-0"
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                    }}
                  >
                    {/* gentle independent float, separate from orbit position */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3.5 + (i % 3) * 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                      className="relative"
                      onMouseEnter={() => setHoveredRingIndex(i)}
                      onMouseLeave={() =>
                        setHoveredRingIndex((cur) => (cur === i ? null : cur))
                      }
                    >
                      <Link href={feature.href || "#"}>
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate: 4,
                            y: -8,
                          }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                          className="relative flex items-center justify-center rounded-full border cursor-pointer"
                          style={{
                            width: 80,
                            height: 80,
                            background: "rgba(255,255,255,0.05)",
                            backdropFilter: "blur(10px)",
                            borderColor: isHovered
                              ? "rgba(139,133,255,0.6)"
                              : "rgba(255,255,255,0.15)",
                            boxShadow: isHovered
                              ? "0 0 28px 6px rgba(108,99,255,0.45), 0 12px 24px -8px rgba(0,0,0,0.5)"
                              : "0 0 14px 2px rgba(108,99,255,0.15)",
                            transition: "border-color 0.3s, box-shadow 0.3s",
                          }}
                        >
                          <div className="text-white/85 [&_svg]:h-6 [&_svg]:w-6">
                            {feature.icon}
                          </div>
                        </motion.div>
                      </Link>

                      {/* No floating tooltip — description shows only in
                          the center label (see center block above), to
                          avoid duplicate/overlapping text near the icon. */}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* mobile fallback: simple stacked list, no ring/notes positioning */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto md:hidden mt-6">
        {features.map((feature, i) => (
          <Link href={feature.href || "#"} key={i}>
            <Card className="glass-card border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <CardContent className="py-5">
                <div className="icon-glow mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/10">
                  {feature.icon}
                </div>
                <h4 className="text-base font-semibold text-white mb-1">
                  {feature.title}
                </h4>
                <p className="text-sm text-white/60">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}