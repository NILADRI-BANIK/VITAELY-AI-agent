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
// Three.js — Digital Grid World + Light Cycle
// Original stylized data-bike (not a licensed asset):
// streamlined body, glowing wheel rings, red energy
// strips, floating HUD ring, scrolling grid floor.
// ─────────────────────────────────────────────
function LightCycle3D() {
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
      scene.fog = new THREE.FogExp2(0x050505, 0.055);

      const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
      camera.position.set(2.6, 1.4, 4.6);
      camera.lookAt(0, 0.3, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const rig = new THREE.Group();
      scene.add(rig);

      // ── Scrolling digital grid floor ──
      const gridGroup = new THREE.Group();
      gridGroup.position.y = -0.62;
      gridGroup.rotation.x = -Math.PI / 2;
      scene.add(gridGroup);

      const gridCols = 26;
      const gridRows = 26;
      const gridSize = 22;
      const vMat = new THREE.LineBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.28 });
      mats.push(vMat);
      for (let i = 0; i <= gridCols; i++) {
        const x = -gridSize / 2 + (i / gridCols) * gridSize;
        const g = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, -gridSize / 2, 0),
          new THREE.Vector3(x, gridSize / 2, 0),
        ]);
        geos.push(g);
        gridGroup.add(new THREE.Line(g, vMat));
      }
      const hMat = new THREE.LineBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.2 });
      mats.push(hMat);
      for (let i = 0; i <= gridRows; i++) {
        const y = -gridSize / 2 + (i / gridRows) * gridSize;
        const g = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-gridSize / 2, y, 0),
          new THREE.Vector3(gridSize / 2, y, 0),
        ]);
        geos.push(g);
        gridGroup.add(new THREE.Line(g, hMat));
      }

      // ── Bike group ──
      const bike = new THREE.Group();
      rig.add(bike);

      // main body (streamlined, low profile)
      const bodyGeo = new THREE.CapsuleGeometry(0.24, 1.5, 6, 12);
      geos.push(bodyGeo);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0e0e0e,
        metalness: 0.9,
        roughness: 0.25,
      });
      mats.push(bodyMat);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.32;
      bike.add(body);

      // canopy / cockpit
      const canopyGeo = new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
      geos.push(canopyGeo);
      const canopyMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.85,
      });
      mats.push(canopyMat);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(-0.15, 0.55, 0);
      canopy.rotation.x = Math.PI;
      bike.add(canopy);

      // energy strip down the spine
      const stripGeo = new THREE.BoxGeometry(1.45, 0.03, 0.05);
      geos.push(stripGeo);
      const stripMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      mats.push(stripMat);
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(0, 0.5, 0.18);
      bike.add(strip);
      const strip2 = strip.clone();
      strip2.position.z = -0.18;
      bike.add(strip2);

      // wheel rings (front + rear), glowing red interior
      const makeWheel = (x) => {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(x, 0, 0);

        const tireGeo = new THREE.TorusGeometry(0.42, 0.07, 12, 32);
        geos.push(tireGeo);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.7, roughness: 0.4 });
        mats.push(tireMat);
        const tire = new THREE.Mesh(tireGeo, tireMat);
        wheelGroup.add(tire);

        const glowGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 32);
        geos.push(glowGeo);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
        mats.push(glowMat);
        const glow = new THREE.Mesh(glowGeo, glowMat);
        wheelGroup.add(glow);

        const hubGeo = new THREE.CircleGeometry(0.16, 16);
        geos.push(hubGeo);
        const hubMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        mats.push(hubMat);
        const hub = new THREE.Mesh(hubGeo, hubMat);
        wheelGroup.add(hub);

        return wheelGroup;
      };
      const frontWheel = makeWheel(0.75);
      const rearWheel = makeWheel(-0.75);
      bike.add(frontWheel);
      bike.add(rearWheel);

      bike.position.y = 0.05;
      bike.rotation.y = Math.PI / 5;

      // ── Floating HUD ring above bike ──
      const hudGeo = new THREE.RingGeometry(0.62, 0.66, 48);
      geos.push(hudGeo);
      const hudMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      mats.push(hudMat);
      const hud = new THREE.Mesh(hudGeo, hudMat);
      hud.position.set(0, 1.5, 0);
      hud.rotation.x = Math.PI / 2.3;
      rig.add(hud);

      const hud2Geo = new THREE.RingGeometry(0.42, 0.44, 48);
      geos.push(hud2Geo);
      const hud2Mat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      mats.push(hud2Mat);
      const hud2 = new THREE.Mesh(hud2Geo, hud2Mat);
      hud2.position.set(0, 1.5, 0);
      hud2.rotation.x = Math.PI / 2.3;
      rig.add(hud2);

      // ── Light streak trail behind the bike ──
      const trailGeo = new THREE.PlaneGeometry(0.06, 2.4);
      geos.push(trailGeo);
      const trailMat = new THREE.MeshBasicMaterial({
        color: 0xff3b30,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      mats.push(trailMat);
      const trail = new THREE.Mesh(trailGeo, trailMat);
      trail.rotation.x = -Math.PI / 2;
      trail.position.set(-2.1, -0.6, 0);
      trail.rotation.z = Math.PI / 5;
      rig.add(trail);

      // ── Floating particles ──
      const dustCount = 130;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 8;
        dustPos[i * 3 + 1] = Math.random() * 2.6 - 0.5;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      geos.push(dustGeo);
      const dustMat = new THREE.PointsMaterial({
        color: 0xff3b30,
        size: 0.018,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      mats.push(dustMat);
      const dust = new THREE.Points(dustGeo, dustMat);
      scene.add(dust);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x0c0c0c, 1.1));
      const redLight = new THREE.PointLight(0xff3b30, 3, 12);
      redLight.position.set(1, 1.5, 1.5);
      scene.add(redLight);
      const whiteLight = new THREE.PointLight(0xf8fafc, 1, 10);
      whiteLight.position.set(-2, 2, -1);
      scene.add(whiteLight);
      const underGlow = new THREE.PointLight(0xff3b30, 1.6, 6);
      underGlow.position.set(0, -0.4, 0);
      scene.add(underGlow);

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

        rig.rotation.y = t * 0.1 + smx * 0.18;
        bike.position.y = 0.05 + Math.sin(t * 0.8) * 0.045;
        bike.rotation.z = Math.sin(t * 0.6) * 0.02;

        frontWheel.rotation.x += 0.12;
        rearWheel.rotation.x += 0.12;

        hud.rotation.z += 0.004;
        hud2.rotation.z -= 0.006;

        redLight.intensity = 3 + Math.sin(t * 2) * 0.6;

        gridGroup.position.z = (t * 1.4) % (gridSize / gridRows);

        dust.rotation.y = t * 0.02;
        const dp = dustGeo.attributes.position;
        for (let i = 0; i < dustCount; i++) {
          dp.array[i * 3] -= 0.01;
          if (dp.array[i * 3] < -4) dp.array[i * 3] = 4;
        }
        dp.needsUpdate = true;

        camera.position.y = 1.4 + smy * 0.12;
        camera.lookAt(0, 0.3, 0);

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

function NeonText({ children, color = "#FF3B30", size = "1rem", weight = 700 }) {
  return (
    <span
      style={{
        color,
        fontWeight: weight,
        fontSize: size,
        textShadow: `0 0 8px ${color}, 0 0 22px ${color}77`,
        fontFamily: "'Orbitron', sans-serif",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </span>
  );
}

function GlassPanel({ children, style = {}, glow = "#FF3B30" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(10,10,10,0.7)",
        border: `1px solid ${hov ? glow : "rgba(255,255,255,0.08)"}`,
        borderRadius: "18px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: hov
          ? `0 12px 34px rgba(0,0,0,0.55), 0 0 26px ${glow}33`
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
        background: active ? "rgba(255,59,48,0.16)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "#FF3B30" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "6px",
        color: active ? "#FF5A52" : "#9CA3AF",
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "0.64rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "0.5rem 1.1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 14px rgba(255,59,48,0.3)" : "none",
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
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(1.1rem, 2.4vw, 1.55rem)",
          fontWeight: 700,
          color: "#F8FAFC",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textShadow: "0 0 16px rgba(255,59,48,0.4)",
          margin: "0 0 0.4rem",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "2px",
          width: "56px",
          background: "linear-gradient(90deg,#FF3B30,transparent)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function EnergyBar({ label, value = 80 }) {
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
        <span style={{ fontSize: "0.78rem", color: "#D1D5DB", fontFamily: "'Inter', sans-serif" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#FF5A52", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            borderRadius: "3px",
            background: "linear-gradient(90deg, #FF3B30, #FF5A52)",
            boxShadow: "0 0 10px rgba(255,59,48,0.7)",
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
        background: hov ? "rgba(255,59,48,0.14)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "#FF3B30" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "4px",
        color: hov ? "#FF5A52" : "#D1D5DB",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.74rem",
        fontWeight: 500,
        padding: "0.3rem 0.75rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.15s ease",
        textShadow: hov ? "0 0 8px #FF3B30" : "none",
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
        background: "rgba(255,59,48,0.08)",
        border: "1px solid rgba(255,59,48,0.32)",
        borderRadius: "6px",
        color: "#FF5A52",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.4rem 1rem",
        textDecoration: "none",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,59,48,0.2)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(255,59,48,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,59,48,0.08)";
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
          <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#F8FAFC", fontFamily: "'Orbitron', sans-serif" }}>
            {heading}
          </div>
          {sub && (
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#FF5A52", fontFamily: "'Inter', sans-serif", marginTop: "0.15rem" }}>
              {sub}
            </div>
          )}
        </div>
        {period && (
          <span
            style={{
              background: "rgba(255,59,48,0.1)",
              border: "1px solid rgba(255,59,48,0.32)",
              color: "#FF5A52",
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
        <div style={{ fontSize: "0.74rem", color: "#9CA3AF", marginBottom: "0.35rem", fontFamily: "'JetBrains Mono', monospace" }}>
          {extra}
        </div>
      )}
      {description && (
        <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#B8BCC4", margin: 0, fontFamily: "'Inter', sans-serif" }}>
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
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F8FAFC", fontFamily: "'Orbitron', sans-serif" }}>
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
                color: "#D1D5DB",
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
                background: "rgba(255,59,48,0.16)",
                border: "1px solid rgba(255,59,48,0.4)",
                color: "#FF5A52",
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
        <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#B8BCC4", margin: "0 0 0.8rem", fontFamily: "'Inter', sans-serif" }}>
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
                color: "#9CA3AF",
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
// data shape matches notion-style.jsx / retro-wave.jsx / gotham-dark.jsx:
//   data.hero: { name, title, summary/tagline }
//   data.contact: { email, phone, linkedin, github, twitter, portfolioUrl, leetcode, hackerrank }
//   data.skills: [{ category, skills: [] }]
//   data.experience / education / projects / certifications / achievements
// ─────────────────────────────────────────────
export default function TronLegacyTemplate({ data = {} }) {
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
    { id: "about", label: "Profile" },
    { id: "experience", label: "Runtime" },
    { id: "projects", label: "Builds" },
    { id: "education", label: "Archive" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#050505",
        minHeight: "100vh",
        color: "#D1D5DB",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #FF3B3055; border-radius: 2px; }

        @keyframes ta-fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ta-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        @keyframes ta-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes ta-drift {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-16px,12px); }
        }
        .ta-page { animation: ta-fade-up 0.55s ease both; }
        .ta-tab  { animation: ta-fade-up 0.32s ease both; }
      `}</style>

      {/* Ambient grid + glow background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,#0f0f0f 0%,#050505 62%)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,59,48,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,59,48,0.05) 1px, transparent 1px)",
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
            background: "radial-gradient(circle,rgba(255,59,48,0.06) 0%,transparent 65%)",
            filter: "blur(55px)",
            animation: "ta-drift 20s ease-in-out infinite",
          }}
        />
      </div>

      <div className="ta-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(5,5,5,0.85)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,59,48,0.18)",
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
              style={{
                width: "8px",
                height: "8px",
                background: "#FF3B30",
                display: "inline-block",
                boxShadow: "0 0 10px #FF3B30",
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
            <LightCycle3D />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "55%",
              height: "100%",
              zIndex: 1,
              background: "linear-gradient(to right, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.55) 72%, rgba(5,5,5,0.96) 100%)",
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
              opacity: 0.25,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "40%",
                background: "linear-gradient(to bottom, transparent, rgba(255,59,48,0.25), transparent)",
                animation: "ta-scan 6s linear infinite",
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
                background: "rgba(255,59,48,0.08)",
                border: "1px solid rgba(255,59,48,0.32)",
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
                  background: "#FF3B30",
                  boxShadow: "0 0 8px #FF3B30",
                  display: "inline-block",
                  animation: "ta-pulse 2.2s ease-in-out infinite",
                }}
              />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#FF5A52", fontWeight: 700, letterSpacing: "0.16em" }}>
                GRID CONNECTION ACTIVE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(2.1rem, 5.2vw, 3.8rem)",
                fontWeight: 800,
                color: "#F8FAFC",
                letterSpacing: "-0.005em",
                lineHeight: 1.08,
                margin: "0 0 0.6rem",
                textShadow: "0 0 24px rgba(255,59,48,0.45)",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(0.76rem, 1.6vw, 0.98rem)",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                color: "#FF5A52",
              }}
            >
              {title}
            </div>

            {summary && (
              <p
                style={{
                  fontSize: "0.94rem",
                  lineHeight: 1.85,
                  color: "#9CA3AF",
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
          {/* PROFILE / ABOUT */}
          {activeTab === "about" && (
            <div className="ta-tab">
              <SectionHeading>Profile</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
                <div>
                  {skillGroups.length > 0 && (
                    <GlassPanel style={{ marginBottom: "1.2rem" }}>
                      <div
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: "#FF3B30",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Skill Modules
                      </div>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.9rem" }}>
                          {group?.category && (
                            <div style={{ fontSize: "0.74rem", color: "#9CA3AF", marginBottom: "0.4rem", fontFamily: "'JetBrains Mono', monospace" }}>
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
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: "#FF3B30",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Achievements
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
                          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#F8FAFC", fontFamily: "'Orbitron', sans-serif" }}>
                            {ach?.title || ""}
                          </div>
                          {ach?.description && (
                            <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginTop: "0.25rem", fontFamily: "'Inter', sans-serif" }}>
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlassPanel>
                  )}

                  {skillGroups.length === 0 && achievements.length === 0 && (
                    <GlassPanel>
                      <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>Nothing added here yet.</p>
                    </GlassPanel>
                  )}
                </div>

                <GlassPanel>
                  <div
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      color: "#FF3B30",
                      textTransform: "uppercase",
                      marginBottom: "1.1rem",
                    }}
                  >
                    System Status
                  </div>
                  <EnergyBar label="Skills" value={Math.min(totalSkills * 4, 100)} />
                  <EnergyBar label="Projects" value={Math.min(projects.length * 12, 100)} />
                  <EnergyBar label="Experience" value={Math.min(experience.length * 20, 100)} />
                  <EnergyBar label="Certifications" value={Math.min(certifications.length * 15, 100)} />
                </GlassPanel>
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="ta-tab">
              <SectionHeading>Runtime History</SectionHeading>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={`${exp?.company || ""}${exp?.location ? ` · ${exp.location}` : ""}`}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "ACTIVE" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                  />
                ))
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>No runtime history logged yet.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <div className="ta-tab">
              <SectionHeading>Builds</SectionHeading>
              {projects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
                  {projects.map((proj, i) => (
                    <ProjectCard key={i} proj={proj} />
                  ))}
                </div>
              ) : (
                <GlassPanel>
                  <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>No builds compiled yet.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <div className="ta-tab">
              <SectionHeading>Archive</SectionHeading>
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
                  <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>No records archived yet.</p>
                </GlassPanel>
              )}

              {certifications.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <SectionHeading>Certifications</SectionHeading>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
                    {certifications.map((cert, i) => (
                      <GlassPanel key={i}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#F8FAFC", marginBottom: "0.25rem", fontFamily: "'Orbitron', sans-serif" }}>
                          {cert?.title || cert?.name || ""}
                        </div>
                        {(cert?.issuer || cert?.organization) && (
                          <div style={{ fontSize: "0.76rem", color: "#FF5A52", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
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
            borderTop: "1px solid rgba(255,59,48,0.14)",
            background: "rgba(5,5,5,0.92)",
            padding: "1.2rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <NeonText size="0.78rem">{name.toUpperCase()}</NeonText>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "rgba(255,59,48,0.4)", letterSpacing: "0.16em" }}>
            GRID RUNTIME · SECURE CHANNEL
          </span>
        </footer>
      </div>
    </div>
  );
}