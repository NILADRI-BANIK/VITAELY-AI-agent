"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import HoloFace from "@/components/landing/HoloFace";
import FloatingLetters from "@/components/landing/FloatingLetters";

/**
 * Hero
 * Left: holographic AI head (HoloFace) — raised and vertically centered
 *       so it's fully visible with no cropping on first load.
 * Right: VITAELY falling-letter wordmark, heading, description, CTAs.
 * ~80vh section height, layered animated background (gradient mesh +
 * grid + fog glow), subtle parallax drift on scroll for depth.
 */
const HeroSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // subtle parallax — background drifts slower than foreground content
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const headParallaxY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[80vh] pt-20 md:pt-24 pb-8 md:pb-10 overflow-hidden bg-[#060B1F] flex items-center"
    >
      {/* layered animated background */}
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0 -z-20">
        {/* animated gradient mesh */}
        <motion.div
          className="absolute left-[18%] top-[12%] h-[700px] w-[700px] -translate-x-1/2 rounded-full"
style={{
  background: "radial-gradient(circle, rgba(108,99,255,0.55) 0%, rgba(108,99,255,0.18) 45%, transparent 80%)"
}}          animate={{ x: [0, 40, -20, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full"
style={{
  background: "radial-gradient(circle, rgba(0,229,160,0.35) 0%, rgba(0,229,160,0.12) 45%, transparent 80%)"
}}          animate={{ x: [0, -30, 15, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* soft animated haze band across the middle */}
        <motion.div
          className="absolute left-0 right-0 top-1/2 h-64 -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(108,99,255,0.06), rgba(0,229,160,0.05), transparent)",
            filter: "blur(30px)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="container mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] items-center gap-8 lg:gap-6">
          {/* LEFT — holographic AI head, raised + fully visible */}
          <motion.div
            style={{ y: headParallaxY }}
            initial={{ opacity: 0, x: -40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 flex justify-center lg:justify-start"
          >
            <HoloFace
              className="w-full h-[360px] sm:h-[400px] md:h-[440px] lg:h-[480px]"
              scale={1.35}
              position={[0, 0.15, 0]}
              rotationOffset={0}
            />
          </motion.div>

          {/* RIGHT — wordmark, heading, description, CTAs */}
          <div className="order-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
            <FloatingLetters />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight text-white max-w-lg"
            >
              AI Career Coach for Professional Success
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg text-white/60 md:text-lg"
            >
              Build resumes, optimize ATS scores, prepare for interviews,
              create portfolios, and accelerate your career with AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-1"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-8 h-12 bg-gradient-to-r from-[#6C63FF] to-[#5a52e0] hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(108,99,255,0.35)]"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="https://github.com/NILADRI-BANIK/VITAELY-AI-agent">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 h-12 border-white/15 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06]"
                >
                  <PlayCircle className="mr-2 h-4 w-4" /> Get demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;