"use client";

import { Suspense, useRef, useState, useEffect, useMemo, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

/**
 * Model — loads /public/models/mesh.glb and animates it.
 *
 * Tuning props (adjust if the model appears mis-scaled/off-center/
 * facing the wrong way — every .glb export has different units and
 * origin, so these are exposed rather than hardcoded):
 * - scale: uniform scale multiplier
 * - position: [x, y, z] offset to center the head in view
 * - rotationOffset: base Y rotation in radians so the face points
 *   toward camera by default (e.g. Math.PI if it loads facing away)
 *
 * Motion: gentle float + a slow "breathing" scale pulse (subtle,
 * ~2% amplitude) so the head feels alive even with the cursor still,
 * plus mouse-follow rotation eased toward target.
 */
function Model({ scale, position, rotationOffset, mouse }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF("/models/mesh.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = child.material;
        if ("emissive" in mat) {
          mat.emissive = new THREE.Color("#6C63FF");
          mat.emissiveIntensity = 0.18;
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    // gentle float
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.09;

    // slow breathing scale pulse — subtle, reads as "alive" not animated
    const breathe = 1 + Math.sin(t * 0.5) * 0.02;
    groupRef.current.scale.setScalar(scale * breathe);

    // mouse-follow rotation, eased toward target (no click needed —
    // tracked across the whole viewport by MouseTracker)
    const targetY = rotationOffset + mouse.current.x * 0.65;
    const targetX = mouse.current.y * 0.25;
    groupRef.current.rotation.y +=
      (targetY - groupRef.current.rotation.y) * 0.08;
    groupRef.current.rotation.x +=
      (targetX - groupRef.current.rotation.x) * 0.08;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/mesh.glb");

/**
 * Layered lighting — multiple colored point lights plus a rim/key
 * light rig approximate a soft bloom/glow around the head without a
 * full post-processing pipeline (kept lightweight for performance).
 */
function HoloLights() {
  const rimRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (rimRef.current) {
      // slow pulsing rim light intensity — "soft glow pulsing"
      rimRef.current.intensity = 1.1 + Math.sin(t * 0.8) * 0.35;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2.5, 1.5, 3]} intensity={1.4} color="#6C63FF" />
      <pointLight position={[-2.5, -1, 2]} intensity={1.1} color="#00E5A0" />
      <pointLight ref={rimRef} position={[0, 2.2, -2]} intensity={1.1} color="#4cc9ff" />
      <pointLight position={[0, -2, 2.5]} intensity={0.5} color="#6C63FF" />
      <Environment preset="city" />
    </>
  );
}

function MouseTracker({ mouse }) {
  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * ModelErrorBoundary — required because useGLTF throws (via Suspense)
 * on load/parse failure. Suspense alone only covers the loading state,
 * not failure, so a real error boundary catches that and swaps in the
 * graceful fallback instead of leaving a blank canvas.
 */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("HoloFace model failed to load:", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function FallbackGlow() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute h-2/3 w-2/3 rounded-full bg-[radial-gradient(closest-side,rgba(108,99,255,0.35),rgba(0,229,160,0.15),transparent)] blur-2xl" />
      <div className="relative h-24 w-24 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-[#00E5A0] animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Ambient particles + fog haze layered around the canvas (DOM/CSS,
 * not WebGL) — cheap to render, adds the "alive" atmosphere without
 * touching the 3D scene's performance budget.
 */
function AtmosphereLayer() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: (i * 53) % 100,
        top: (i * 37) % 100,
        size: 1.5 + (i % 3),
        duration: 6 + (i % 5),
        delay: (i % 6) * 0.5,
        color: i % 3 === 0 ? "#00E5A0" : "#6C63FF",
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft animated fog/haze */}
      <motion.div
        className="absolute -inset-10 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(108,99,255,0.14), rgba(0,229,160,0.06), transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

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
            boxShadow: `0 0 8px ${p.color}`,
          }}
          animate={{ y: [0, -22, 0], opacity: [0.15, 0.85, 0.15] }}
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

/**
 * HoloFace
 * Renders the real robot-head .glb model on the left side of the Hero
 * with mouse-follow rotation, gentle float, slow "breathing" pulse,
 * layered bloom-style lighting, and an ambient particle/fog atmosphere
 * around the canvas. Falls back to a soft ambient glow (never a blank
 * canvas) if WebGL is unavailable or the model fails to load/parse.
 */
export default function HoloFace({
  className = "",
  scale = 1.4,
  position = [0, 0.3, 0],
  rotationOffset = 0,
}) {
  const mouse = useRef({ x: 0, y: 0 });
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setSupportsWebGL(false);
    } catch {
      setSupportsWebGL(false);
    }
  }, []);

  if (!supportsWebGL) {
    return (
      <div className={`relative cursor-grab ${className}`} aria-hidden="true">
        <AtmosphereLayer />
        <FallbackGlow />
      </div>
    );
  }

  return (
    <div className={`relative cursor-grab ${className}`} aria-hidden="true">
      <AtmosphereLayer />

      {/* central bloom glow behind the canvas */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(108,99,255,0.24),rgba(0,229,160,0.12),transparent)] blur-3xl" />
      </div>

      <ModelErrorBoundary fallback={<FallbackGlow />}>
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <fog attach="fog" args={["#05060A", 4, 9]} />
            <HoloLights />
            <MouseTracker mouse={mouse} />
            <Model
              scale={scale}
              position={position}
              rotationOffset={rotationOffset}
              mouse={mouse}
            />
          </Suspense>
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
}