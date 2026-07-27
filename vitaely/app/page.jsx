"use client";

import { Button } from "@/components/ui/button";
import HeroSection from "@/components/Hero";
import { features } from "@/data/features";
import { Card, CardContent } from "@/components/ui/card";
import { howItWorks } from "@/data/howItWorks";
import { testimonial } from "@/data/testimonial";
import Image from "next/image";
import { faqs } from "@/data/faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGsapChapter } from "@/hooks/useGsapChapter";
import FeaturesStory from "@/components/landing/FeaturesStory";

function InteractiveCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- STATS ---------------- */
function StatsChapter() {
  const itemRefs = useRef([]);
  const sectionRef = useGsapChapter(({ timeline }) => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      timeline.fromTo(
        el,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.4 },
        i * 0.15
      );
    });
  });

  const stats = [
    { value: "50+", label: "Industries Covered" },
    { value: "1000+", label: "Interview Questions" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "AI Support" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              className="opacity-0 flex flex-col items-center justify-center space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl py-8 px-4"
            >
              <h3 className="text-4xl font-bold gradient-title-sleep">
                {stat.value}
              </h3>
              <p className="text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
function HowItWorksChapter() {
  const itemRefs = useRef([]);
  const lineRef = useRef(null);
  const sectionRef = useGsapChapter(({ timeline }) => {
    if (lineRef.current) {
      timeline.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6 },
        0
      );
    }
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const dir = i % 2 === 0 ? -30 : 30;
      timeline.fromTo(
        el,
        { autoAlpha: 0, x: dir },
        { autoAlpha: 1, x: 0, duration: 0.45 },
        0.2 + i * 0.12
      );
    });
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mx-auto mb-5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[11px] tracking-[0.2em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />
            PROCESS
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-white/60">
            Four simple steps to accelerate your career growth
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div
            ref={lineRef}
            className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px origin-left bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0"
          />
          {howItWorks.map((item, i) => (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              className="opacity-0 relative flex flex-col items-center text-center space-y-4"
            >
              <div className="icon-glow relative z-10 w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-semibold text-xl text-white">{item.title}</h3>
              <p className="text-white/60">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function TestimonialsChapter() {
  const [activeIndex, setActiveIndex] = useState(0);
  const spotlightRef = useRef(null);
  const intervalRef = useRef(null);
  const isPausedRef = useRef(false);

  const sectionRef = useGsapChapter(({ timeline }) => {
    if (spotlightRef.current) {
      timeline.fromTo(
        spotlightRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0
      );
    }
  });

  // Auto-advance the spotlighted testimonial on an interval, pausing on hover.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setActiveIndex((prev) => (prev + 1) % testimonial.length);
    }, 4500);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Crossfade the spotlight content whenever activeIndex changes.
  useEffect(() => {
    if (!spotlightRef.current) return;
    gsap.fromTo(
      spotlightRef.current,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeIndex]);

  const active = testimonial[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden py-6"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
    >
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-center h-full max-h-screen">
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-flex items-center gap-2 mx-auto mb-3 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[10px] tracking-[0.2em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />
            TESTIMONIALS
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">
            What Our Users Say
          </h2>
        </div>

        {/* spotlighted quote */}
        <div className="w-full max-w-xl mx-auto">
          <Card
            ref={spotlightRef}
            className="glass-card border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_rgba(108,99,255,0.15)]"
          >
            <CardContent className="pt-5 pb-5 px-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative h-12 w-12 flex-shrink-0">
                  <Image
                    width={48}
                    height={48}
                    src={active.image}
                    alt={active.author}
                    className="rounded-full object-cover border-2 border-[#6C63FF]/40 shadow-[0_0_18px_rgba(108,99,255,0.35)]"
                  />
                </div>
                <blockquote className="flex items-start gap-1.5 max-w-md">
                  <span className="text-xl text-[#6C63FF] leading-none flex-shrink-0 mt-0.5">
                    &quot;
                  </span>
                  <p className="text-white/80 text-sm md:text-base italic leading-snug">
                    {active.quote}
                  </p>
                  <span className="text-xl text-[#6C63FF] leading-none flex-shrink-0 self-end">
                    &quot;
                  </span>
                </blockquote>
                <div className="pt-1">
                  <p className="font-semibold text-white text-sm">{active.author}</p>
                  <p className="text-xs text-white/50">{active.role}</p>
                  <p className="text-xs text-[#8B85FF]">{active.company}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* dimmed thumbnail row — click to jump, active one highlighted */}
        <div className="flex items-center justify-center gap-3 flex-wrap mt-5">
          {testimonial.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative h-9 w-9 rounded-full flex-shrink-0 transition-all duration-300"
              style={{
                opacity: i === activeIndex ? 1 : 0.4,
                transform: i === activeIndex ? "scale(1.15)" : "scale(1)",
              }}
              aria-label={`Show testimonial from ${t.author}`}
            >
              <Image
                width={36}
                height={36}
                src={t.image}
                alt={t.author}
                className={`rounded-full object-cover border-2 transition-colors duration-300 ${
                  i === activeIndex
                    ? "border-[#6C63FF] shadow-[0_0_14px_rgba(108,99,255,0.6)]"
                    : "border-white/10"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FaqChapter() {
  const boxRef = useRef(null);
  const sectionRef = useGsapChapter(({ timeline }) => {
    if (!boxRef.current) return;
    timeline.fromTo(
      boxRef.current,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.5 },
      0
    );
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mx-auto mb-5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[11px] tracking-[0.2em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />
            FAQ
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60">
            Find answers to common questions about our platform
          </p>
        </div>

        <div
          ref={boxRef}
          className="opacity-0 max-w-3xl mx-auto flex flex-col gap-3"
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5
                  transition-all duration-300 mb-3 last:mb-0
                  data-[state=open]:border-[#6C63FF]/50 data-[state=open]:bg-white/[0.05]
                  data-[state=open]:shadow-[0_0_30px_rgba(108,99,255,0.18)]"
              >
                <AccordionTrigger
                  className="text-white hover:no-underline hover:text-[#8B85FF] transition-colors duration-300
                    [&>svg]:transition-transform [&>svg]:duration-500 [&[data-state=open]>svg]:rotate-180
                    [&[data-state=open]>svg]:text-[#8B85FF]
                    [&[data-state=open]>svg]:drop-shadow-[0_0_8px_rgba(139,133,255,0.8)]"
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/60">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-[#060B1F] relative">
      <div className="grid-background"></div>
      <div className="grain-overlay" />

      <HeroSection />

      <FeaturesStory features={features} />
      <StatsChapter />
      <HowItWorksChapter />
      <TestimonialsChapter />
      <FaqChapter />

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="relative w-full py-24 overflow-hidden">
        <div className="mx-auto rounded-2xl gradient-sleep relative overflow-hidden">
          <div className="grain-overlay grain-overlay--cta" />
          <div className="pointer-events-none absolute inset-0">
            <div className="particle particle--1" />
            <div className="particle particle--2" />
            <div className="particle particle--3" />
            <div className="particle particle--4" />
            <div className="particle particle--5" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto px-4 py-20"
          >
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[600px] text-white/70 md:text-xl">
              Join thousands of professionals who are advancing their careers
              with AI-powered guidance.
            </p>
            <Link href="/dashboard" passHref>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="secondary" className="h-11 mt-5">
                  Start Your Journey Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}