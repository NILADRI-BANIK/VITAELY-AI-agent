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
// Three.js — Floating Vinyl Record + Cassette Tape
// Original stylized objects (not licensed assets):
// spinning vinyl disc with grooves, a floating
// cassette tape, neon light bars, and a
// starfield of magenta/cyan sparkle particles.
// ─────────────────────────────────────────────
function VinylScene3D() {
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
      scene.fog = new THREE.FogExp2(0x0a0016, 0.05);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.6, 4.6);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const rig = new THREE.Group();
      scene.add(rig);

      // ── Vinyl record ──
      const vinylGroup = new THREE.Group();
      rig.add(vinylGroup);

      const discGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.05, 64);
      geos.push(discGeo);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x0d0d10,
        metalness: 0.7,
        roughness: 0.35,
      });
      mats.push(discMat);
      const disc = new THREE.Mesh(discGeo, discMat);
      vinylGroup.add(disc);

      // groove rings
      for (let i = 0; i < 10; i++) {
        const r = 0.35 + i * 0.075;
        const grooveGeo = new THREE.TorusGeometry(r, 0.004, 4, 64);
        geos.push(grooveGeo);
        const grooveMat = new THREE.MeshBasicMaterial({
          color: 0x2a2a33,
          transparent: true,
          opacity: 0.6,
        });
        mats.push(grooveMat);
        const groove = new THREE.Mesh(grooveGeo, grooveMat);
        groove.rotation.x = Math.PI / 2;
        vinylGroup.add(groove);
      }

      // label center — magenta/cyan gradient feel via two rings
      const labelGeo = new THREE.CircleGeometry(0.34, 40);
      geos.push(labelGeo);
      const labelMat = new THREE.MeshBasicMaterial({ color: 0xff2ec4 });
      mats.push(labelMat);
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.rotation.x = -Math.PI / 2;
      label.position.y = 0.026;
      vinylGroup.add(label);

      const labelRingGeo = new THREE.TorusGeometry(0.34, 0.012, 8, 48);
      geos.push(labelRingGeo);
      const labelRingMat = new THREE.MeshBasicMaterial({ color: 0x22e5ff });
      mats.push(labelRingMat);
      const labelRing = new THREE.Mesh(labelRingGeo, labelRingMat);
      labelRing.rotation.x = Math.PI / 2;
      labelRing.position.y = 0.027;
      vinylGroup.add(labelRing);

      const spindleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16);
      geos.push(spindleGeo);
      const spindleMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
      mats.push(spindleMat);
      const spindle = new THREE.Mesh(spindleGeo, spindleMat);
      vinylGroup.add(spindle);

      vinylGroup.rotation.x = Math.PI / 2.4;
      vinylGroup.position.set(-0.5, 0.1, 0);

      // ── Floating cassette tape ──
      const cassette = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(0.9, 0.55, 0.12);
      geos.push(bodyGeo);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1a0b2e,
        metalness: 0.4,
        roughness: 0.5,
      });
      mats.push(bodyMat);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      cassette.add(body);

      const windowGeo = new THREE.PlaneGeometry(0.55, 0.22);
      geos.push(windowGeo);
      const windowMat = new THREE.MeshBasicMaterial({
        color: 0x22e5ff,
        transparent: true,
        opacity: 0.28,
      });
      mats.push(windowMat);
      const windowPane = new THREE.Mesh(windowGeo, windowMat);
      windowPane.position.set(0, 0.02, 0.061);
      cassette.add(windowPane);

      const reelGeoC = new THREE.TorusGeometry(0.08, 0.018, 8, 24);
      geos.push(reelGeoC);
      const reelMatC = new THREE.MeshBasicMaterial({ color: 0xff2ec4 });
      mats.push(reelMatC);
      const reelL = new THREE.Mesh(reelGeoC, reelMatC);
      reelL.position.set(-0.18, 0.02, 0.062);
      cassette.add(reelL);
      const reelR = reelL.clone();
      reelR.position.x = 0.18;
      cassette.add(reelR);

      cassette.position.set(1.1, -0.55, 0.3);
      cassette.rotation.set(0.15, 0.5, -0.1);
      rig.add(cassette);

      // ── Neon equalizer bars floating below ──
      const barGroup = new THREE.Group();
      const barCount = 9;
      const barMeshes = [];
      for (let i = 0; i < barCount; i++) {
        const bGeo = new THREE.BoxGeometry(0.09, 0.4, 0.09);
        geos.push(bGeo);
        const hue = i % 2 === 0 ? 0xff2ec4 : 0x22e5ff;
        const bMat = new THREE.MeshBasicMaterial({ color: hue });
        mats.push(bMat);
        const bar = new THREE.Mesh(bGeo, bMat);
        bar.position.set(-1.1 + i * 0.28, -1.35, -0.4);
        barGroup.add(bar);
        barMeshes.push(bar);
      }
      rig.add(barGroup);

      // ── Sparkle particles (magenta/cyan starfield) ──
      const starCount = 160;
      const starPos = new Float32Array(starCount * 3);
      const starCol = new Float32Array(starCount * 3);
      const colorA = new THREE.Color(0xff2ec4);
      const colorB = new THREE.Color(0x22e5ff);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 9;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
        const c = Math.random() > 0.5 ? colorA : colorB;
        starCol[i * 3] = c.r;
        starCol[i * 3 + 1] = c.g;
        starCol[i * 3 + 2] = c.b;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
      geos.push(starGeo);
      const starMat = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      });
      mats.push(starMat);
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // ── Retro sun / horizon glow disc behind everything ──
      const sunGeo = new THREE.CircleGeometry(1.6, 48);
      geos.push(sunGeo);
      const sunMat = new THREE.MeshBasicMaterial({
        color: 0xff2ec4,
        transparent: true,
        opacity: 0.12,
      });
      mats.push(sunMat);
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.set(0, 0.2, -2.6);
      scene.add(sun);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x1a0b2e, 1.2));
      const magentaLight = new THREE.PointLight(0xff2ec4, 3, 10);
      magentaLight.position.set(-1.5, 1.5, 1.5);
      scene.add(magentaLight);
      const cyanLight = new THREE.PointLight(0x22e5ff, 2.4, 10);
      cyanLight.position.set(1.5, -1, 1.5);
      scene.add(cyanLight);

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
        t += 0.008;

        smx += (mx - smx) * 0.02;
        smy += (my - smy) * 0.02;

        // vinyl spin
        vinylGroup.rotation.z += 0.018;

        // cassette gentle float + rotate
        cassette.position.y = -0.55 + Math.sin(t * 1.1) * 0.08;
        cassette.rotation.y += 0.004;
        reelL.rotation.z -= 0.05;
        reelR.rotation.z -= 0.05;

        // equalizer bars pulse like music
        barMeshes.forEach((bar, i) => {
          const s = 0.5 + Math.abs(Math.sin(t * 3 + i * 0.7)) * 1.6;
          bar.scale.y = s;
          bar.position.y = -1.35 + (s - 1) * 0.2;
        });

        // stars slow drift
        stars.rotation.y = t * 0.015;

        magentaLight.intensity = 3 + Math.sin(t * 2.4) * 0.7;
        cyanLight.intensity = 2.4 + Math.cos(t * 2.1) * 0.6;

        rig.rotation.y = smx * 0.22;
        camera.position.y = 0.6 + smy * 0.15;
        camera.lookAt(0, 0, 0);

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

function NeonText({ children, color = "#FF2EC4", size = "1rem", weight = 700 }) {
  return (
    <span
      style={{
        color,
        fontWeight: weight,
        fontSize: size,
        textShadow: `0 0 8px ${color}, 0 0 22px ${color}77`,
        fontFamily: "'Audiowide', 'Orbitron', sans-serif",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function GlassPanel({ children, style = {}, glow = "#FF2EC4" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(20,8,36,0.65)",
        border: `1px solid ${hov ? glow : "rgba(255,255,255,0.08)"}`,
        borderRadius: "16px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: hov
          ? `0 12px 34px rgba(0,0,0,0.55), 0 0 26px ${glow}33`
          : "0 6px 20px rgba(0,0,0,0.4)",
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
        background: active ? "rgba(255,46,196,0.16)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "#FF2EC4" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "6px",
        color: active ? "#FF6FDA" : "#B8AECF",
        fontFamily: "'Audiowide', sans-serif",
        fontSize: "0.62rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.5rem 1.1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 14px rgba(255,46,196,0.3)" : "none",
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
          fontFamily: "'Audiowide', sans-serif",
          fontSize: "clamp(1.1rem, 2.4vw, 1.55rem)",
          fontWeight: 700,
          color: "#F8F5FF",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textShadow: "0 0 16px rgba(255,46,196,0.4)",
          margin: "0 0 0.4rem",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "2px",
          width: "56px",
          background: "linear-gradient(90deg,#FF2EC4,#22E5FF,transparent)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function EqualizerBar({ label, value = 80 }) {
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
        <span style={{ fontSize: "0.78rem", color: "#D7CFE8", fontFamily: "'Inter', sans-serif" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#FF6FDA", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            borderRadius: "3px",
            background: "linear-gradient(90deg, #FF2EC4, #22E5FF)",
            boxShadow: "0 0 10px rgba(255,46,196,0.7)",
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
        background: hov ? "rgba(255,46,196,0.14)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "#FF2EC4" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "4px",
        color: hov ? "#FF6FDA" : "#D7CFE8",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.74rem",
        fontWeight: 500,
        padding: "0.3rem 0.75rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.15s ease",
        textShadow: hov ? "0 0 8px #FF2EC4" : "none",
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
        background: "rgba(255,46,196,0.08)",
        border: "1px solid rgba(255,46,196,0.32)",
        borderRadius: "6px",
        color: "#FF6FDA",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.4rem 1rem",
        textDecoration: "none",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,46,196,0.2)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(255,46,196,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,46,196,0.08)";
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
          <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#F8F5FF", fontFamily: "'Audiowide', sans-serif" }}>
            {heading}
          </div>
          {sub && (
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#FF6FDA", fontFamily: "'Inter', sans-serif", marginTop: "0.15rem" }}>
              {sub}
            </div>
          )}
        </div>
        {period && (
          <span
            style={{
              background: "rgba(255,46,196,0.1)",
              border: "1px solid rgba(255,46,196,0.32)",
              color: "#FF6FDA",
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
        <div style={{ fontSize: "0.74rem", color: "#9E93B5", marginBottom: "0.35rem", fontFamily: "'JetBrains Mono', monospace" }}>
          {extra}
        </div>
      )}
      {description && (
        <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#C6BCDB", margin: 0, fontFamily: "'Inter', sans-serif" }}>
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
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F8F5FF", fontFamily: "'Audiowide', sans-serif" }}>
          {proj?.title || "Track"}
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
                color: "#D7CFE8",
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
                background: "rgba(255,46,196,0.16)",
                border: "1px solid rgba(255,46,196,0.4)",
                color: "#FF6FDA",
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
        <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#C6BCDB", margin: "0 0 0.8rem", fontFamily: "'Inter', sans-serif" }}>
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
                color: "#9E93B5",
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
// data shape matches notion-style.jsx / retro-wave.jsx / gotham-dark.jsx / tron-ares.jsx:
//   data.hero: { name, title, summary/tagline }
//   data.contact: { email, phone, linkedin, github, twitter, portfolioUrl, leetcode, hackerrank }
//   data.skills: [{ category, skills: [] }]
//   data.experience / education / projects / certifications / achievements
// ─────────────────────────────────────────────
export default function MusicStudioTemplate({ data = {} }) {
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
    { id: "about", label: "Liner Notes" },
    { id: "experience", label: "Tour History" },
    { id: "projects", label: "Tracklist" },
    { id: "education", label: "Studio Log" },
  ];

  // static equalizer bar heights for the header decoration
  const eqBars = [0.4, 0.7, 0.5, 0.9, 0.35, 0.8, 0.55, 0.65, 0.45];

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0a0016",
        minHeight: "100vh",
        color: "#D7CFE8",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0016; }
        ::-webkit-scrollbar-thumb { background: #FF2EC455; border-radius: 2px; }

        @keyframes ms-fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ms-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }
        @keyframes ms-eq {
          0%,100% { transform: scaleY(0.4); }
          50%      { transform: scaleY(1); }
        }
        @keyframes ms-drift {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-16px,12px); }
        }
        @keyframes ms-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .ms-page { animation: ms-fade-up 0.55s ease both; }
        .ms-tab  { animation: ms-fade-up 0.32s ease both; }
        .ms-eqbar { animation: ms-eq 1s ease-in-out infinite; transform-origin: bottom; }
      `}</style>

      {/* Ambient synthwave grid + glow background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,#160a2e 0%,#0a0016 62%)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,46,196,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,229,255,0.05) 1px, transparent 1px)",
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
            background: "radial-gradient(circle,rgba(255,46,196,0.07) 0%,transparent 65%)",
            filter: "blur(55px)",
            animation: "ms-drift 20s ease-in-out infinite",
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
            background: "radial-gradient(circle,rgba(34,229,255,0.06) 0%,transparent 65%)",
            filter: "blur(55px)",
            animation: "ms-drift 24s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="ms-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(10,0,22,0.85)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,46,196,0.18)",
            padding: "0.85rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.6rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
              {eqBars.slice(0, 4).map((h, i) => (
                <span
                  key={i}
                  className="ms-eqbar"
                  style={{
                    width: "3px",
                    height: "14px",
                    background: i % 2 === 0 ? "#FF2EC4" : "#22E5FF",
                    boxShadow: `0 0 6px ${i % 2 === 0 ? "#FF2EC4" : "#22E5FF"}`,
                    borderRadius: "1px",
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
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
            <VinylScene3D />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "55%",
              height: "100%",
              zIndex: 1,
              background: "linear-gradient(to right, rgba(10,0,22,0.05) 0%, rgba(10,0,22,0.55) 72%, rgba(10,0,22,0.96) 100%)",
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
                background: "linear-gradient(to bottom, transparent, rgba(255,46,196,0.25), transparent)",
                animation: "ms-scan 6s linear infinite",
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
                background: "rgba(255,46,196,0.08)",
                border: "1px solid rgba(255,46,196,0.32)",
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
                  background: "#FF2EC4",
                  boxShadow: "0 0 8px #FF2EC4",
                  display: "inline-block",
                  animation: "ms-pulse 2.2s ease-in-out infinite",
                }}
              />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#FF6FDA", fontWeight: 700, letterSpacing: "0.16em" }}>
                NOW PLAYING · LIVE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Audiowide', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.6rem)",
                fontWeight: 700,
                color: "#F8F5FF",
                letterSpacing: "-0.005em",
                lineHeight: 1.1,
                margin: "0 0 0.6rem",
                textShadow: "0 0 24px rgba(255,46,196,0.45)",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                fontFamily: "'Audiowide', sans-serif",
                fontSize: "clamp(0.74rem, 1.5vw, 0.94rem)",
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                color: "#22E5FF",
                textShadow: "0 0 12px rgba(34,229,255,0.5)",
              }}
            >
              {title}
            </div>

            {summary && (
              <p
                style={{
                  fontSize: "0.94rem",
                  lineHeight: 1.85,
                  color: "#B8AECF",
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
          {/* LINER NOTES / ABOUT */}
          {activeTab === "about" && (
            <div className="ms-tab">
              <SectionHeading>Liner Notes</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
                <div>
                  {skillGroups.length > 0 && (
                    <GlassPanel style={{ marginBottom: "1.2rem" }}>
                      <div
                        style={{
                          fontFamily: "'Audiowide', sans-serif",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          color: "#FF2EC4",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Instruments &amp; Skills
                      </div>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.9rem" }}>
                          {group?.category && (
                            <div style={{ fontSize: "0.74rem", color: "#9E93B5", marginBottom: "0.4rem", fontFamily: "'JetBrains Mono', monospace" }}>
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
                          fontFamily: "'Audiowide', sans-serif",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          color: "#FF2EC4",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Awards &amp; Achievements
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
                          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#F8F5FF", fontFamily: "'Audiowide', sans-serif" }}>
                            {ach?.title || ""}
                          </div>
                          {ach?.description && (
                            <div style={{ fontSize: "0.78rem", color: "#9E93B5", marginTop: "0.25rem", fontFamily: "'Inter', sans-serif" }}>
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlassPanel>
                  )}

                  {skillGroups.length === 0 && achievements.length === 0 && (
                    <GlassPanel>
                      <p style={{ fontSize: "0.85rem", color: "#6B6280" }}>Nothing added here yet.</p>
                    </GlassPanel>
                  )}
                </div>

                <GlassPanel>
                  <div
                    style={{
                      fontFamily: "'Audiowide', sans-serif",
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: "#FF2EC4",
                      textTransform: "uppercase",
                      marginBottom: "1.1rem",
                    }}
                  >
                    Mix Levels
                  </div>
                  <EqualizerBar label="Skills" value={Math.min(totalSkills * 4, 100)} />
                  <EqualizerBar label="Projects" value={Math.min(projects.length * 12, 100)} />
                  <EqualizerBar label="Experience" value={Math.min(experience.length * 20, 100)} />
                  <EqualizerBar label="Certifications" value={Math.min(certifications.length * 15, 100)} />
                </GlassPanel>
              </div>
            </div>
          )}

          {/* TOUR HISTORY / EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="ms-tab">
              <SectionHeading>Tour History</SectionHeading>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={`${exp?.company || ""}${exp?.location ? ` · ${exp.location}` : ""}`}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "ON TOUR" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                  />
                ))
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B6280" }}>No tour dates logged yet.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {/* TRACKLIST / PROJECTS */}
          {activeTab === "projects" && (
            <div className="ms-tab">
              <SectionHeading>Tracklist</SectionHeading>
              {projects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
                  {projects.map((proj, i) => (
                    <ProjectCard key={i} proj={proj} />
                  ))}
                </div>
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B6280" }}>No tracks released yet.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {/* STUDIO LOG / EDUCATION */}
          {activeTab === "education" && (
            <div className="ms-tab">
              <SectionHeading>Studio Log</SectionHeading>
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
                  <p style={{ fontSize: "0.85rem", color: "#6B6280" }}>No records archived yet.</p>
                </GlassPanel>
              )}

              {certifications.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <SectionHeading>Certifications</SectionHeading>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
                    {certifications.map((cert, i) => (
                      <GlassPanel key={i}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#F8F5FF", marginBottom: "0.25rem", fontFamily: "'Audiowide', sans-serif" }}>
                          {cert?.title || cert?.name || ""}
                        </div>
                        {(cert?.issuer || cert?.organization) && (
                          <div style={{ fontSize: "0.76rem", color: "#FF6FDA", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
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
            borderTop: "1px solid rgba(255,46,196,0.14)",
            background: "rgba(10,0,22,0.92)",
            padding: "1.2rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <NeonText size="0.78rem">{name.toUpperCase()}</NeonText>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "rgba(255,46,196,0.4)", letterSpacing: "0.16em" }}>
            STUDIO SESSION · SIDE A
          </span>
        </footer>
      </div>
    </div>
  );
}