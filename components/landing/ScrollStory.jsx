"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Edit this array to change the narrative — each entry is one pinned "chapter"
const STORY_CHAPTERS = [
  {
    id: "chaos",
    eyebrow: "The Problem",
    heading: "Your career story is scattered.",
    body: "Resumes in one folder, cover letters in another, interview prep nowhere. Every application starts from zero.",
  },
  {
    id: "signal",
    eyebrow: "The Shift",
    heading: "One AI that actually knows your work.",
    body: "VITAEELY reads your history once and carries it everywhere — resumes, cover letters, portfolios, interview answers.",
  },
  {
    id: "build",
    eyebrow: "The Engine",
    heading: "It builds while you focus.",
    body: "ATS scoring, skill-gap analysis, project ideas, research tools — all generated from the same understanding of you.",
  },
  {
    id: "arrive",
    eyebrow: "The Result",
    heading: "Applications that sound like you, at scale.",
    body: "Less time formatting. More time getting picked.",
  },
];

export default function ScrollStory() {
  const containerRef = useRef(null);
  const panelRefs = useRef([]);
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelRefs.current.filter(Boolean);
      const total = panels.length;

      // Pin the container while chapters cycle through
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${total * 100}%`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      });

      panels.forEach((panel, i) => {
        gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 40 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${total * 100}%`,
          scrub: 1,
        },
      });

      panels.forEach((panel, i) => {
        if (i > 0) {
          tl.to(panels[i - 1], { autoAlpha: 0, y: -40, duration: 0.4 }, i);
          tl.fromTo(
            panel,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.4 },
            i - 0.1
          );
        }
      });

      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${total * 100}%`,
            scrub: true,
          },
        });
      }

      return () => st.kill();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black text-white"
    >
      {/* progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div
          ref={progressRef}
          className="h-full origin-left scale-x-0 bg-gradient-to-r from-violet-500 to-cyan-400"
        />
      </div>

      <div className="relative h-full w-full max-w-3xl mx-auto flex items-center px-6">
        {STORY_CHAPTERS.map((chapter, i) => (
          <div
            key={chapter.id}
            ref={(el) => (panelRefs.current[i] = el)}
            className="absolute inset-0 flex flex-col justify-center px-6"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-violet-400 mb-4">
              {chapter.eyebrow}
            </span>
            <h2 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
              {chapter.heading}
            </h2>
            <p className="text-lg text-white/70 max-w-xl">{chapter.body}</p>
          </div>
        ))}
      </div>

      {/* chapter index dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {STORY_CHAPTERS.map((c) => (
          <span key={c.id} className="w-1.5 h-1.5 rounded-full bg-white/30" />
        ))}
      </div>
    </section>
  );
}