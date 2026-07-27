"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Pins `sectionRef` and runs `build(ctx)` once to register GSAP tweens
 * against a ScrollTrigger-driven timeline. Everything is animated by
 * GSAP setting styles directly on the DOM — no React re-renders during
 * scroll, which is what was causing the lag before.
 *
 * `build` receives { timeline, section } and should populate the timeline
 * with .to()/.from() calls targeting elements inside `section` (use refs
 * or data-attributes / querySelector scoped to `section`).
 */
export function useGsapChapter(build, { disabled = false } = {}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (disabled) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=100%",
            pin: true,
            pinSpacing: true,
            scrub: 1,
          },
        });
        build?.({ timeline: tl, section });
      }, section);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [disabled]);

  return sectionRef;
}