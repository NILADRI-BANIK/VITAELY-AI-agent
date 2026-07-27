"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// safeUrl helper (consistent with other templates)
// ─────────────────────────────────────────────
const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

// ─────────────────────────────────────────────
// Three.js — Floating Infernal Rock + Ember Particles
// Original stylized objects (not licensed assets):
// a jagged obsidian shard hovering above cracked
// magma, glowing ember veins, rising spark
// particles, and a pulsing core light.
// ─────────────────────────────────────────────
function InfernoScene3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const geos = [];
    const mats = [];
    let cleanupListeners = null;

    async function init() {
      let THREE;
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (!mounted || !mountRef.current) return;

      const width = mountRef.current.clientWidth || 520;
      const height = mountRef.current.clientHeight || 520;

      const scene = new THREE.Scene();
      scene.background = null;
      scene.fog = new THREE.FogExp2(0x0a0403, 0.06);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.7, 4.8);
      camera.lookAt(0, 0.1, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const rig = new THREE.Group();
      scene.add(rig);

      // ── Jagged obsidian shard (icosahedron, distorted) ──
      const shardGeo = new THREE.IcosahedronGeometry(1.05, 1);
      geos.push(shardGeo);
      // manually jitter vertices for a jagged crystalline look
      const posAttr = shardGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = posAttr.getZ(i);
        const jitter = 1 + (Math.random() - 0.5) * 0.28;
        posAttr.setXYZ(i, vx * jitter, vy * jitter, vz * jitter);
      }
      shardGeo.computeVertexNormals();

      const shardMat = new THREE.MeshStandardMaterial({
        color: 0x120404,
        metalness: 0.75,
        roughness: 0.3,
        flatShading: true,
      });
      mats.push(shardMat);
      const shard = new THREE.Mesh(shardGeo, shardMat);
      shard.scale.set(1, 1.15, 1);
      shard.position.set(-0.3, 0.3, 0);
      rig.add(shard);

      // glowing crack veins on the shard (wireframe overlay)
      const veinGeo = new THREE.IcosahedronGeometry(1.06, 1);
      geos.push(veinGeo);
      const veinMat = new THREE.MeshBasicMaterial({
        color: 0xff4b1f,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      mats.push(veinMat);
      const veins = new THREE.Mesh(veinGeo, veinMat);
      veins.scale.copy(shard.scale);
      veins.position.copy(shard.position);
      rig.add(veins);

      // ── Cracked magma floor disc ──
      const floorGeo = new THREE.CircleGeometry(2.6, 48);
      geos.push(floorGeo);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1a0603,
        metalness: 0.2,
        roughness: 0.9,
      });
      mats.push(floorMat);
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.15;
      rig.add(floor);

      // magma cracks — glowing rings pulsing under the shard
      const crackRings = [];
      for (let i = 0; i < 3; i++) {
        const r = 0.5 + i * 0.35;
        const crackGeo = new THREE.RingGeometry(r, r + 0.02, 48);
        geos.push(crackGeo);
        const crackMat = new THREE.MeshBasicMaterial({
          color: 0xff5a1f,
          transparent: true,
          opacity: 0.4 - i * 0.1,
          side: THREE.DoubleSide,
        });
        mats.push(crackMat);
        const ring = new THREE.Mesh(crackGeo, crackMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -1.14;
        rig.add(ring);
        crackRings.push(ring);
      }

      // ── Rising ember particles ──
      const emberCount = 180;
      const emberPos = new Float32Array(emberCount * 3);
      const emberSpeed = new Float32Array(emberCount);
      for (let i = 0; i < emberCount; i++) {
        emberPos[i * 3] = (Math.random() - 0.5) * 5;
        emberPos[i * 3 + 1] = Math.random() * 3 - 1.2;
        emberPos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
        emberSpeed[i] = 0.004 + Math.random() * 0.01;
      }
      const emberGeo = new THREE.BufferGeometry();
      emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
      geos.push(emberGeo);
      const emberMat = new THREE.PointsMaterial({
        color: 0xff6a2a,
        size: 0.028,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      });
      mats.push(emberMat);
      const embers = new THREE.Points(emberGeo, emberMat);
      scene.add(embers);

      // secondary dimmer smoke-like ember layer
      const smokeCount = 60;
      const smokePos = new Float32Array(smokeCount * 3);
      for (let i = 0; i < smokeCount; i++) {
        smokePos[i * 3] = (Math.random() - 0.5) * 6;
        smokePos[i * 3 + 1] = Math.random() * 3 - 1;
        smokePos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      }
      const smokeGeo = new THREE.BufferGeometry();
      smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
      geos.push(smokeGeo);
      const smokeMat = new THREE.PointsMaterial({
        color: 0x8b1a0a,
        size: 0.05,
        transparent: true,
        opacity: 0.3,
        sizeAttenuation: true,
      });
      mats.push(smokeMat);
      const smoke = new THREE.Points(smokeGeo, smokeMat);
      scene.add(smoke);

      // ── Floating horn-like spikes flanking the shard ──
      const makeSpike = (x, z, scale) => {
        const spikeGeo = new THREE.ConeGeometry(0.09, 0.6, 6);
        geos.push(spikeGeo);
        const spikeMat = new THREE.MeshStandardMaterial({
          color: 0x1a0806,
          metalness: 0.6,
          roughness: 0.4,
        });
        mats.push(spikeMat);
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.position.set(x, -0.2, z);
        spike.rotation.z = (Math.random() - 0.5) * 0.6;
        spike.scale.setScalar(scale);
        return spike;
      };
      const spike1 = makeSpike(-1.6, -0.4, 1.1);
      const spike2 = makeSpike(1.5, 0.2, 0.85);
      const spike3 = makeSpike(0.9, -0.9, 0.6);
      rig.add(spike1, spike2, spike3);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x230a05, 1.1));
      const coreLight = new THREE.PointLight(0xff4b1f, 4, 10);
      coreLight.position.set(0, -0.4, 0.8);
      scene.add(coreLight);
      const rimLight = new THREE.PointLight(0xff8a3d, 1.6, 10);
      rimLight.position.set(-2, 1.6, 1.5);
      scene.add(rimLight);
      const backLight = new THREE.PointLight(0x8b1a0a, 1.2, 12);
      backLight.position.set(2, 1, -2);
      scene.add(backLight);

      // ── Mouse parallax ──
      let mx = 0,
        my = 0,
        smx = 0,
        smy = 0;
      const onMouse = (e) => {
        if (!mountRef.current) return;
        const r = mountRef.current.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = -((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouse);

      const onResize = () => {
        if (!mountRef.current || !mounted) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      cleanupListeners = () => {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", onResize);
      };

      // ── Animate ──
      let t = 0;
      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.007;

        smx += (mx - smx) * 0.02;
        smy += (my - smy) * 0.02;

        // shard slow rotation + float
        shard.rotation.y += 0.0035;
        shard.rotation.x = Math.sin(t * 0.5) * 0.06;
        shard.position.y = 0.3 + Math.sin(t * 0.9) * 0.09;
        veins.rotation.copy(shard.rotation);
        veins.position.y = shard.position.y;

        // magma crack rings pulse
        crackRings.forEach((ring, i) => {
          const pulse = 0.3 + Math.abs(Math.sin(t * 1.6 + i * 0.8)) * 0.3;
          ring.material.opacity = pulse - i * 0.08;
        });

        // embers rise and reset
        const ep = emberGeo.attributes.position;
        for (let i = 0; i < emberCount; i++) {
          ep.array[i * 3 + 1] += emberSpeed[i];
          ep.array[i * 3] += Math.sin(t * 2 + i) * 0.0009;
          if (ep.array[i * 3 + 1] > 2) {
            ep.array[i * 3 + 1] = -1.2;
          }
        }
        ep.needsUpdate = true;

        smoke.rotation.y = t * 0.02;

        coreLight.intensity = 4 + Math.sin(t * 2.6) * 1.1;
        rimLight.intensity = 1.6 + Math.cos(t * 1.8) * 0.4;

        rig.rotation.y = smx * 0.2;
        camera.position.y = 0.7 + smy * 0.14;
        camera.lookAt(0, 0.1, 0);

        renderer.render(scene, camera);
      }
      animate();
    }
    init();

    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (cleanupListeners) cleanupListeners();
      if (rendererRef.current) {
        if (
          mountRef.current &&
          rendererRef.current.domElement &&
          mountRef.current.contains(rendererRef.current.domElement)
        ) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        geos.forEach((g) => g?.dispose?.());
        mats.forEach((m) => m?.dispose?.());
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", cursor: "default" }}
    />
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function NeonText({ children, color = "#FF4B1F", size = "1rem", weight = 700 }) {
  return (
    <span
      style={{
        color,
        fontWeight: weight,
        fontSize: size,
        textShadow: `0 0 8px ${color}, 0 0 22px ${color}77`,
        fontFamily: "'Cinzel', serif",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function GlassPanel({ children, style = {}, glow = "#FF4B1F" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(20,6,4,0.72)",
        border: `1px solid ${hov ? glow : "rgba(255,255,255,0.07)"}`,
        borderRadius: "14px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: hov
          ? `0 12px 34px rgba(0,0,0,0.6), 0 0 26px ${glow}33`
          : "0 6px 20px rgba(0,0,0,0.45)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.3s ease",
        padding: "1.5rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(255,75,31,0.16)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "#FF4B1F" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "6px",
        color: active ? "#FF8352" : "#B8968A",
        fontFamily: "'Cinzel', serif",
        fontSize: "0.62rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.5rem 1.1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 14px rgba(255,75,31,0.3)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function SectionHeading({ children }) {
  return (
    <div style={{ marginBottom: "1.8rem" }}>
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.1rem, 2.4vw, 1.55rem)",
          fontWeight: 700,
          color: "#FDF1EA",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          textShadow: "0 0 16px rgba(255,75,31,0.45)",
          margin: "0 0 0.4rem",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "2px",
          width: "56px",
          background: "linear-gradient(90deg,#FF4B1F,#8B0000,transparent)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function EmberBar({ label, value = 80 }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setW(value), 100);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "0.78rem", color: "#DCC2B5", fontFamily: "'Inter', sans-serif" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#FF8352", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            borderRadius: "3px",
            background: "linear-gradient(90deg, #8B0000, #FF4B1F)",
            boxShadow: "0 0 10px rgba(255,75,31,0.7)",
            transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}

function SkillChip({ skill }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block",
        background: hov ? "rgba(255,75,31,0.14)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "#FF4B1F" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "4px",
        color: hov ? "#FF8352" : "#DCC2B5",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.74rem",
        fontWeight: 500,
        padding: "0.3rem 0.75rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.15s ease",
        textShadow: hov ? "0 0 8px #FF4B1F" : "none",
      }}
    >
      {skill}
    </span>
  );
}

function ContactChip({ icon, label, href }) {
  const isLink = href && href !== "#";
  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "rgba(255,75,31,0.08)",
        border: "1px solid rgba(255,75,31,0.32)",
        borderRadius: "6px",
        color: "#FF8352",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.4rem 1rem",
        textDecoration: "none",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,75,31,0.2)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(255,75,31,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,75,31,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
  if (isLink) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto") ? undefined : "_blank"}
        rel="noopener noreferrer"
        style={{ textDecoration: "none", marginRight: "0.5rem", marginBottom: "0.5rem", display: "inline-block" }}
      >
        {inner}
      </a>
    );
  }
  return (
    <span style={{ marginRight: "0.5rem", marginBottom: "0.5rem", display: "inline-block" }}>
      {inner}
    </span>
  );
}

function TimelineEntry({ heading, sub, period, description, extra }) {
  return (
    <GlassPanel style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#FDF1EA", fontFamily: "'Cinzel', serif" }}>
            {heading}
          </div>
          {sub && (
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#FF8352", fontFamily: "'Inter', sans-serif", marginTop: "0.15rem" }}>
              {sub}
            </div>
          )}
        </div>
        {period && (
          <span
            style={{
              background: "rgba(255,75,31,0.1)",
              border: "1px solid rgba(255,75,31,0.32)",
              color: "#FF8352",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.62rem",
              fontWeight: 700,
              padding: "0.25rem 0.7rem",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
            }}
          >
            {period}
          </span>
        )}
      </div>
      {extra && (
        <div style={{ fontSize: "0.74rem", color: "#9C8074", marginBottom: "0.35rem", fontFamily: "'JetBrains Mono', monospace" }}>
          {extra}
        </div>
      )}
      {description && (
        <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#CBB2A6", margin: 0, fontFamily: "'Inter', sans-serif" }}>
          {description}
        </p>
      )}
    </GlassPanel>
  );
}

function ProjectCard({ proj }) {
  return (
    <GlassPanel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FDF1EA", fontFamily: "'Cinzel', serif" }}>
          {proj?.title || "Project"}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
          {proj?.github && (
            <a
              href={safeUrl(proj.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#DCC2B5",
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.18rem 0.55rem",
                borderRadius: "4px",
                textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.03em",
              }}
            >
              CODE
            </a>
          )}
          {proj?.liveUrl && (
            <a
              href={safeUrl(proj.liveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,75,31,0.16)",
                border: "1px solid rgba(255,75,31,0.4)",
                color: "#FF8352",
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.18rem 0.55rem",
                borderRadius: "4px",
                textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.03em",
              }}
            >
              LIVE
            </a>
          )}
        </div>
      </div>
      {proj?.description && (
        <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#CBB2A6", margin: "0 0 0.8rem", fontFamily: "'Inter', sans-serif" }}>
          {proj.description}
        </p>
      )}
      {Array.isArray(proj?.techStack) && proj.techStack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {proj.techStack.map((tech, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.66rem",
                fontWeight: 600,
                padding: "0.18rem 0.55rem",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.04)",
                color: "#9C8074",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

// ─────────────────────────────────────────────
// Main Template
// data shape matches notion-style.jsx / retro-wave.jsx / gotham-dark.jsx / tron-ares.jsx / music-studio.jsx:
//   data.hero: { name, title, summary/tagline }
//   data.contact: { email, phone, linkedin, github, twitter, portfolioUrl, leetcode, hackerrank }
//   data.skills: [{ category, skills: [] }]
//   data.experience / education / projects / certifications / achievements
// ─────────────────────────────────────────────
export default function DevilInfernoTemplate({ data = {} }) {
  const [activeTab, setActiveTab] = useState("about");

  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const name = hero.name || "Your Name";
  const title = hero.title || "Your Title";
  const summary = hero.summary || hero.tagline || "";

  const email = contact.email || "";
  const phone = contact.phone || "";
  const linkedin = contact.linkedin || "";
  const github = contact.github || "";
  const twitter = contact.twitter || "";
  const website = contact.portfolioUrl || "";
  const leetcode = contact.leetcode || "";
  const hackerrank = contact.hackerrank || "";

  const skillGroups = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const certifications = Array.isArray(data?.certifications) ? data.certifications : [];
  const achievements = Array.isArray(data?.achievements) ? data.achievements : [];

  const totalSkills = skillGroups.reduce(
    (acc, g) => acc + (Array.isArray(g?.skills) ? g.skills.length : 0),
    0,
  );

  const tabs = [
    { id: "about", label: "The Pact" },
    { id: "experience", label: "Damned Trials" },
    { id: "projects", label: "Forged Works" },
    { id: "education", label: "Ancient Scrolls" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0a0403",
        minHeight: "100vh",
        color: "#DCC2B5",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0403; }
        ::-webkit-scrollbar-thumb { background: #FF4B1F55; border-radius: 2px; }

        @keyframes di-fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes di-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }
        @keyframes di-flicker {
          0%, 100% { opacity: 1; }
          8%  { opacity: 0.82; }
          16% { opacity: 1; }
          24% { opacity: 0.7; }
          32% { opacity: 1; }
          60% { opacity: 0.9; }
        }
        @keyframes di-drift {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-16px,12px); }
        }
        @keyframes di-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .di-page { animation: di-fade-up 0.55s ease both; }
        .di-tab  { animation: di-fade-up 0.32s ease both; }
        .di-flicker { animation: di-flicker 4.5s ease-in-out infinite; }
      `}</style>

      {/* Ambient infernal glow background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,#1a0805 0%,#0a0403 62%)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,75,31,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 50% 20%, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 20%, black 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-8%",
            right: "-8%",
            width: "48vw",
            height: "48vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(255,75,31,0.08) 0%,transparent 65%)",
            filter: "blur(55px)",
            animation: "di-drift 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-8%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(139,0,0,0.1) 0%,transparent 65%)",
            filter: "blur(55px)",
            animation: "di-drift 24s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="di-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(10,4,3,0.87)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,75,31,0.2)",
            padding: "0.85rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.6rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              className="di-flicker"
              style={{
                width: "8px",
                height: "8px",
                background: "#FF4B1F",
                display: "inline-block",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                boxShadow: "0 0 10px #FF4B1F",
              }}
            />
            <NeonText size="0.8rem">{name.toUpperCase()}</NeonText>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <TabButton key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          style={{
            position: "relative",
            minHeight: "90vh",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* 3D model — left side */}
          <div style={{ position: "absolute", left: 0, top: 0, width: "55%", height: "100%", zIndex: 0 }}>
            <InfernoScene3D />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "55%",
              height: "100%",
              zIndex: 1,
              background: "linear-gradient(to right, rgba(10,4,3,0.05) 0%, rgba(10,4,3,0.55) 72%, rgba(10,4,3,0.97) 100%)",
            }}
          />
          {/* scan-line sweep overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              overflow: "hidden",
              pointerEvents: "none",
              opacity: 0.22,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "40%",
                background: "linear-gradient(to bottom, transparent, rgba(255,75,31,0.22), transparent)",
                animation: "di-scan 6.5s linear infinite",
              }}
            />
          </div>

          {/* text — right side */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              marginLeft: "auto",
              width: "48%",
              minWidth: "320px",
              padding: "4rem 2.5rem 4rem 1.5rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,75,31,0.08)",
                border: "1px solid rgba(255,75,31,0.32)",
                borderRadius: "4px",
                padding: "0.28rem 0.9rem",
                marginBottom: "1.3rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#FF4B1F",
                  boxShadow: "0 0 8px #FF4B1F",
                  display: "inline-block",
                  animation: "di-pulse 2.2s ease-in-out infinite",
                }}
              />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#FF8352", fontWeight: 700, letterSpacing: "0.16em" }}>
                FORGED IN FLAME
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2.1rem, 5.2vw, 3.8rem)",
                fontWeight: 800,
                color: "#FDF1EA",
                letterSpacing: "0.01em",
                lineHeight: 1.1,
                margin: "0 0 0.6rem",
                textShadow: "0 0 24px rgba(255,75,31,0.5)",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(0.76rem, 1.6vw, 0.98rem)",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                color: "#FF6A3D",
              }}
            >
              {title}
            </div>

            {summary && (
              <p
                style={{
                  fontSize: "0.94rem",
                  lineHeight: 1.85,
                  color: "#B8968A",
                  maxWidth: "460px",
                  marginBottom: "2rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                }}
              >
                {summary}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {email && <ContactChip icon="✉" label="Email" href={`mailto:${email}`} />}
              {phone && <ContactChip icon="☎" label={phone} href="" />}
              {github && <ContactChip icon="⌥" label="GitHub" href={safeUrl(github)} />}
              {linkedin && <ContactChip icon="⊞" label="LinkedIn" href={safeUrl(linkedin)} />}
              {twitter && <ContactChip icon="𝕏" label="Twitter" href={safeUrl(twitter)} />}
              {website && <ContactChip icon="↗" label="Website" href={safeUrl(website)} />}
              {leetcode && <ContactChip icon="⌘" label="LeetCode" href={safeUrl(leetcode)} />}
              {hackerrank && <ContactChip icon="✦" label="HackerRank" href={safeUrl(hackerrank)} />}
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2.5rem 6rem" }}>
          {/* THE PACT / ABOUT */}
          {activeTab === "about" && (
            <div className="di-tab">
              <SectionHeading>The Pact</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
                <div>
                  {skillGroups.length > 0 && (
                    <GlassPanel style={{ marginBottom: "1.2rem" }}>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: "#FF4B1F",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Infernal Powers
                      </div>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.9rem" }}>
                          {group?.category && (
                            <div style={{ fontSize: "0.74rem", color: "#9C8074", marginBottom: "0.4rem", fontFamily: "'JetBrains Mono', monospace" }}>
                              {group.category}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {(Array.isArray(group?.skills) ? group.skills : []).map((skill, si) => (
                              <SkillChip key={si} skill={skill} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </GlassPanel>
                  )}

                  {achievements.length > 0 && (
                    <GlassPanel>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: "#FF4B1F",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Conquests
                      </div>
                      {achievements.map((ach, i) => (
                        <div
                          key={i}
                          style={{
                            borderBottom: i < achievements.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            paddingBottom: "0.7rem",
                            marginBottom: "0.7rem",
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#FDF1EA", fontFamily: "'Cinzel', serif" }}>
                            {ach?.title || ""}
                          </div>
                          {ach?.description && (
                            <div style={{ fontSize: "0.78rem", color: "#9C8074", marginTop: "0.25rem", fontFamily: "'Inter', sans-serif" }}>
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlassPanel>
                  )}

                  {skillGroups.length === 0 && achievements.length === 0 && (
                    <GlassPanel>
                      <p style={{ fontSize: "0.85rem", color: "#6B5348" }}>Nothing added here yet.</p>
                    </GlassPanel>
                  )}
                </div>

                <GlassPanel>
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      color: "#FF4B1F",
                      textTransform: "uppercase",
                      marginBottom: "1.1rem",
                    }}
                  >
                    Soul Ledger
                  </div>
                  <EmberBar label="Skills" value={Math.min(totalSkills * 4, 100)} />
                  <EmberBar label="Projects" value={Math.min(projects.length * 12, 100)} />
                  <EmberBar label="Experience" value={Math.min(experience.length * 20, 100)} />
                  <EmberBar label="Certifications" value={Math.min(certifications.length * 15, 100)} />
                </GlassPanel>
              </div>
            </div>
          )}

          {/* DAMNED TRIALS / EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="di-tab">
              <SectionHeading>Damned Trials</SectionHeading>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={`${exp?.company || ""}${exp?.location ? ` · ${exp.location}` : ""}`}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "ETERNAL" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                  />
                ))
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B5348" }}>No trials endured yet.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {/* FORGED WORKS / PROJECTS */}
          {activeTab === "projects" && (
            <div className="di-tab">
              <SectionHeading>Forged Works</SectionHeading>
              {projects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
                  {projects.map((proj, i) => (
                    <ProjectCard key={i} proj={proj} />
                  ))}
                </div>
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B5348" }}>No works forged yet.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {/* ANCIENT SCROLLS / EDUCATION */}
          {activeTab === "education" && (
            <div className="di-tab">
              <SectionHeading>Ancient Scrolls</SectionHeading>
              {education.length > 0 ? (
                education.map((edu, i) => (
                  <TimelineEntry
                    key={i}
                    heading={edu?.degree || "Degree"}
                    sub={edu?.institution || ""}
                    period={
                      edu?.startDate
                        ? `${edu.startDate} → ${edu?.current ? "Present" : edu?.endDate || ""}`
                        : undefined
                    }
                    extra={
                      edu?.score
                        ? `${edu?.scoreType || "Score"}: ${edu.score}${edu?.outOf ? `/${edu.outOf}` : ""}`
                        : undefined
                    }
                    description={edu?.description}
                  />
                ))
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B5348" }}>No scrolls archived yet.</p>
                </GlassPanel>
              )}

              {certifications.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <SectionHeading>Certifications</SectionHeading>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
                    {certifications.map((cert, i) => (
                      <GlassPanel key={i}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#FDF1EA", marginBottom: "0.25rem", fontFamily: "'Cinzel', serif" }}>
                          {cert?.title || cert?.name || ""}
                        </div>
                        {(cert?.issuer || cert?.organization) && (
                          <div style={{ fontSize: "0.76rem", color: "#FF8352", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                            {cert.issuer || cert.organization}
                            {(cert?.date || cert?.issueDate) && ` · ${cert.date || cert.issueDate}`}
                          </div>
                        )}
                      </GlassPanel>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,75,31,0.16)",
            background: "rgba(10,4,3,0.94)",
            padding: "1.2rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <NeonText size="0.78rem">{name.toUpperCase()}</NeonText>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "rgba(255,75,31,0.45)", letterSpacing: "0.16em" }}>
            SEALED IN BLOOD AND FIRE
          </span>
        </footer>
      </div>
    </div>
  );
}