"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────
// safeUrl — shared helper (consistent with all templates)
// ─────────────────────────────────────────────────────────────────
const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

// ─────────────────────────────────────────────────────────────────
// AuroraSphereModel3D
// Floating translucent energy sphere with internal flowing aurora
// light (green/cyan/purple), orbiting glow rings, soft particles.
// Slow rotation + gentle levitation + breathing glow.
// ─────────────────────────────────────────────────────────────────
function AuroraSphereModel3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let cleanupListeners = null;
    let geometries = [];
    let materials = [];

    async function init() {
      let THREE;
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (!mounted || !mountRef.current) return;

      const width = mountRef.current.clientWidth || 380;
      const height = mountRef.current.clientHeight || 380;

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Outer glass shell ──
      const outerGeo = new THREE.SphereGeometry(1.55, 48, 48);
      const outerMat = new THREE.MeshPhysicalMaterial({
        color: 0xd8f3ff,
        transparent: true,
        opacity: 0.1,
        roughness: 0.05,
        metalness: 0.0,
        side: THREE.FrontSide,
      });
      const outerSphere = new THREE.Mesh(outerGeo, outerMat);
      scene.add(outerSphere);

      // ── Inner flowing aurora core (layered translucent spheres) ──
      const coreColors = [0x4ade80, 0x22d3ee, 0x8b5cf6];
      const coreLayers = coreColors.map((color, i) => {
        const geo = new THREE.SphereGeometry(1.0 - i * 0.18, 32, 32);
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        geometries.push(geo);
        materials.push(mat);
        return mesh;
      });

      // ── Distorted inner light wisps (torus knots for flowing ribbons) ──
      const wispDefs = [
        { color: 0x4ade80, scale: 0.85, speed: 0.4 },
        { color: 0x22d3ee, scale: 0.65, speed: -0.3 },
        { color: 0xec4899, scale: 0.5, speed: 0.5 },
      ];
      const wisps = wispDefs.map(({ color, scale }) => {
        const geo = new THREE.TorusKnotGeometry(scale * 0.7, 0.05, 100, 12, 2, 3);
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.35,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        geometries.push(geo);
        materials.push(mat);
        return mesh;
      });

      // ── Orbiting glow rings ──
      const ringDefs = [
        { r: 2.1, tiltX: 0.5, tiltZ: 0.0, color: 0x4ade80, opacity: 0.4, speed: 0.2 },
        { r: 2.4, tiltX: 1.15, tiltZ: 0.5, color: 0x22d3ee, opacity: 0.32, speed: -0.15 },
        { r: 2.25, tiltX: 0.75, tiltZ: 1.3, color: 0x8b5cf6, opacity: 0.28, speed: 0.25 },
      ];
      const rings = ringDefs.map(({ r, tiltX, tiltZ, color, opacity }) => {
        const geo = new THREE.TorusGeometry(r, 0.012, 8, 120);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = tiltX;
        mesh.rotation.z = tiltZ;
        scene.add(mesh);
        geometries.push(geo);
        materials.push(mat);
        return { mesh, baseTiltX: tiltX, baseTiltZ: tiltZ };
      });

      // ── Ambient drifting particles ──
      const pCount = 220;
      const pPos = new Float32Array(pCount * 3);
      const pColors = new Float32Array(pCount * 3);
      const palette = [
        [0.29, 0.87, 0.5], // green
        [0.13, 0.83, 0.93], // cyan
        [0.55, 0.36, 0.96], // purple
        [0.93, 0.28, 0.6], // pink
      ];
      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rad = 2.6 + Math.random() * 2.0;
        pPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = rad * Math.cos(phi);
        const c = palette[Math.floor(Math.random() * palette.length)];
        pColors[i * 3] = c[0];
        pColors[i * 3 + 1] = c[1];
        pColors[i * 3 + 2] = c[2];
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);
      geometries.push(pGeo);
      materials.push(pMat);

      geometries.push(outerGeo);
      materials.push(outerMat);

      // ── Lights — soft, never harsh ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));

      const greenLight = new THREE.PointLight(0x4ade80, 2.5, 8);
      greenLight.position.set(2, 2, 3);
      scene.add(greenLight);

      const cyanLight = new THREE.PointLight(0x22d3ee, 2, 7);
      cyanLight.position.set(-2, -1, 2);
      scene.add(cyanLight);

      const purpleLight = new THREE.PointLight(0x8b5cf6, 1.5, 6);
      purpleLight.position.set(0, -2, -2);
      scene.add(purpleLight);

      // ── Mouse tracking — gentle parallax ──
      let mouseX = 0;
      let mouseY = 0;
      const onMouse = (e) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      mountRef.current.addEventListener("mousemove", onMouse);

      const onResize = () => {
        if (!mountRef.current || !mounted) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      const handleVisibility = () => {
        if (document.hidden) {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        } else {
          animate();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      cleanupListeners = () => {
        mountRef.current?.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", handleVisibility);
      };

      // ── Animation ──
      let t = 0;
      let smoothX = 0;
      let smoothY = 0;

      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.005;

        smoothX += (mouseX - smoothX) * 0.03;
        smoothY += (mouseY - smoothY) * 0.03;

        // slow rotation + gentle levitation of whole sphere assembly
        outerSphere.rotation.y = t * 0.15 + smoothX * 0.2;
        outerSphere.position.y = Math.sin(t * 0.5) * 0.15;

        coreLayers.forEach((mesh, i) => {
          mesh.rotation.y = -t * (0.2 + i * 0.08) + smoothX * 0.15;
          mesh.rotation.x = Math.sin(t * 0.3 + i) * 0.15 + smoothY * 0.1;
          mesh.position.y = outerSphere.position.y;
          // breathing glow
          mesh.material.opacity = 0.12 + Math.sin(t * 0.8 + i * 2) * 0.06;
        });

        wisps.forEach((wisp, i) => {
          wisp.rotation.x = t * wispDefs[i].speed;
          wisp.rotation.y = t * wispDefs[i].speed * 0.7;
          wisp.position.y = outerSphere.position.y;
        });

        rings.forEach(({ mesh, baseTiltX, baseTiltZ }, i) => {
          mesh.rotation.y = t * ringDefs[i].speed;
          mesh.rotation.x = baseTiltX + smoothY * 0.1;
          mesh.rotation.z = baseTiltZ + smoothX * 0.1;
          mesh.position.y = outerSphere.position.y;
        });

        // gentle particle drift
        particles.rotation.y = t * 0.02;
        particles.position.y = outerSphere.position.y * 0.5;

        // soft light breathing pulse
        greenLight.intensity = 2.2 + Math.sin(t * 1.2) * 0.6;
        cyanLight.intensity = 1.8 + Math.cos(t * 1.0) * 0.5;
        purpleLight.intensity = 1.3 + Math.sin(t * 0.8 + 1) * 0.4;

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
        geometries.forEach((g) => g?.dispose?.());
        materials.forEach((m) => m?.dispose?.());
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

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function GlassCard({ children, style = {}, hover = true }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${hov ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.14)"}`,
        borderRadius: "20px",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        padding: "1.5rem",
        transition: "border-color 250ms ease, transform 250ms ease, box-shadow 250ms ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov
          ? "0 16px 48px rgba(74,222,128,0.12), 0 0 0 1px rgba(255,255,255,0.08)"
          : "0 8px 32px rgba(0,0,0,0.25)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function GradientText({ children, gradient = "linear-gradient(135deg,#4ade80,#22d3ee,#8b5cf6)" }) {
  return (
    <span
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <h2
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
          fontWeight: 800,
          margin: "0 0 0.35rem",
          letterSpacing: "-0.02em",
        }}
      >
        <GradientText>{children}</GradientText>
      </h2>
      {sub && (
        <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

function NavPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(74,222,128,0.22), rgba(34,211,238,0.15))"
          : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: active ? "#D8F3FF" : "#94A3B8",
        fontFamily: "'Manrope', sans-serif",
        fontSize: "0.82rem",
        fontWeight: active ? 700 : 500,
        padding: "0.5rem 1.2rem",
        borderRadius: "999px",
        cursor: "pointer",
        transition: "all 220ms ease",
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </button>
  );
}

function SkillPill({ skill, index }) {
  const colors = ["#4ade80", "#22d3ee", "#8b5cf6", "#ec4899", "#60a5fa"];
  const c = colors[index % colors.length];
  return (
    <span
      style={{
        display: "inline-block",
        background: `${c}18`,
        border: `1px solid ${c}40`,
        color: "#E2E8F0",
        fontSize: "0.78rem",
        fontWeight: 500,
        padding: "0.35rem 0.9rem",
        borderRadius: "999px",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        transition: "all 200ms ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${c}30`;
        e.currentTarget.style.borderColor = `${c}70`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${c}18`;
        e.currentTarget.style.borderColor = `${c}40`;
      }}
    >
      {skill}
    </span>
  );
}

function ContactChip({ icon, label, href }) {
  if (!href || href === "#") return null;
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "rgba(216,243,255,0.06)",
        border: "1px solid rgba(216,243,255,0.18)",
        color: "#D8F3FF",
        fontSize: "0.78rem",
        fontWeight: 500,
        padding: "0.35rem 0.9rem",
        borderRadius: "999px",
        textDecoration: "none",
        marginRight: "0.5rem",
        marginBottom: "0.5rem",
        transition: "all 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(216,243,255,0.14)";
        e.currentTarget.style.borderColor = "rgba(216,243,255,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(216,243,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(216,243,255,0.18)";
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function TimelineEntry({ heading, sub, period, description, bullets = [], extra, isLast }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "0.3rem" }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4ade80, #22d3ee)",
            boxShadow: "0 0 10px rgba(74,222,128,0.6)",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "1px",
              flex: 1,
              minHeight: "42px",
              background: "linear-gradient(to bottom, rgba(74,222,128,0.3), transparent)",
              marginTop: "4px",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: "1.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F1F5F9", fontFamily: "'Manrope', sans-serif" }}>
            {heading}
          </span>
          {period && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#4ade80",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.25)",
                padding: "0.15rem 0.65rem",
                borderRadius: "999px",
                whiteSpace: "nowrap",
              }}
            >
              {period}
            </span>
          )}
        </div>
        {sub && (
          <p style={{ fontSize: "0.82rem", color: "#22d3ee", fontWeight: 500, marginBottom: "0.4rem" }}>
            {sub}
          </p>
        )}
        {extra && (
          <p style={{ fontSize: "0.76rem", color: "#94A3B8", marginBottom: "0.35rem" }}>{extra}</p>
        )}
        {description && (
          <p style={{ fontSize: "0.82rem", color: "#CBD5E1", lineHeight: 1.75 }}>{description}</p>
        )}
        {bullets.length > 0 && (
          <ul style={{ margin: "0.5rem 0 0 1.1rem", padding: 0 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "0.2rem" }}>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ proj }) {
  return (
    <GlassCard style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F1F5F9", margin: 0, fontFamily: "'Manrope', sans-serif" }}>
          {proj?.title || "Project"}
        </h3>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {proj?.github && (
            <a
              href={safeUrl(proj.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#CBD5E1",
                textDecoration: "none",
                padding: "0.2rem 0.6rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
              }}
            >
              GitHub
            </a>
          )}
          {proj?.liveUrl && (
            <a
              href={safeUrl(proj.liveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#4ade80",
                textDecoration: "none",
                padding: "0.2rem 0.6rem",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: "999px",
              }}
            >
              Live
            </a>
          )}
        </div>
      </div>

      {proj?.description && (
        <p style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.7, marginBottom: "0.8rem" }}>
          {proj.description}
        </p>
      )}

      {Array.isArray(proj?.techStack) && proj.techStack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {proj.techStack.map((tech, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                padding: "0.18rem 0.55rem",
                borderRadius: "999px",
                background: "rgba(34,211,238,0.1)",
                color: "#22d3ee",
                border: "1px solid rgba(34,211,238,0.25)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────────────────────────
export default function AuroraTemplate({ data = {} }) {
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
  const hobbies = Array.isArray(data?.hobbies) ? data.hobbies : [];

  const totalSkills = skillGroups.reduce(
    (acc, g) => acc + (Array.isArray(g?.skills) ? g.skills.length : 0),
    0,
  );

  const tabs = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "education", label: "Education" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #050816 0%, #0B1020 40%, #111827 70%, #1A2340 100%)",
        color: "#F1F5F9",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #050816; }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.25); border-radius: 999px; }

        @keyframes aur-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aur-drift1 {
          0%, 100% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 0.35; }
          50%      { transform: translate(60px,-40px) scale(1.15) rotate(8deg); opacity: 0.5; }
        }
        @keyframes aur-drift2 {
          0%, 100% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 0.28; }
          50%      { transform: translate(-50px,30px) scale(1.1) rotate(-6deg); opacity: 0.42; }
        }
        @keyframes aur-drift3 {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.2; }
          50%      { transform: translate(30px,50px) scale(1.08); opacity: 0.32; }
        }
        @keyframes aur-twinkle {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.6; }
        }

        .aur-fade { animation: aur-fadeUp 500ms ease both; }

        .aur-ribbon-1 {
          position: fixed; z-index: 0; pointer-events: none;
          width: 60vw; height: 60vw; max-width: 700px; max-height: 700px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(74,222,128,0.18) 0%, transparent 65%);
          top: -15%; left: -10%;
          filter: blur(50px);
          animation: aur-drift1 22s ease-in-out infinite;
        }
        .aur-ribbon-2 {
          position: fixed; z-index: 0; pointer-events: none;
          width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(34,211,238,0.15) 0%, transparent 65%);
          bottom: -10%; right: -5%;
          filter: blur(50px);
          animation: aur-drift2 28s ease-in-out infinite;
        }
        .aur-ribbon-3 {
          position: fixed; z-index: 0; pointer-events: none;
          width: 40vw; height: 40vw; max-width: 500px; max-height: 500px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 65%);
          top: 40%; left: 30%;
          filter: blur(60px);
          animation: aur-drift3 34s ease-in-out infinite;
        }
        .aur-stars {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 20%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.4) 0%, transparent 100%);
          animation: aur-twinkle 5s ease-in-out infinite;
        }

        .aur-hero-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2.5rem;
          align-items: center;
        }
        @media (max-width: 960px) {
          .aur-hero-grid { grid-template-columns: 1fr; }
          .aur-model-panel { height: 280px !important; }
        }
        .aur-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.1rem;
        }
        @media (max-width: 640px) {
          .aur-projects-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Ambient aurora background */}
      <div className="aur-stars" />
      <div className="aur-ribbon-1" />
      <div className="aur-ribbon-2" />
      <div className="aur-ribbon-3" />

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "5rem 6vw 3rem",
        }}
      >
        <div className="aur-hero-grid aur-fade" style={{ maxWidth: "1300px", margin: "0 auto", width: "100%" }}>
          {/* Left */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: "999px",
                padding: "0.3rem 0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 8px rgba(74,222,128,0.8)",
                }}
              />
              <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Portfolio
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                margin: "0 0 0.6rem",
              }}
            >
              <GradientText gradient="linear-gradient(135deg, #F1F5F9 0%, #D8F3FF 40%, #4ade80 100%)">
                {name}
              </GradientText>
            </h1>

            <div style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)", fontWeight: 500, color: "#94A3B8", marginBottom: "1.4rem" }}>
              {title}
            </div>

            {summary && (
              <p style={{ fontSize: "0.9rem", lineHeight: 1.85, color: "#CBD5E1", maxWidth: "540px", marginBottom: "1.8rem" }}>
                {summary}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {email && <ContactChip icon="✉" label={email} href={`mailto:${email}`} />}
              {phone && <ContactChip icon="☎" label={phone} href="" />}
              {github && <ContactChip icon="⌥" label="GitHub" href={safeUrl(github)} />}
              {linkedin && <ContactChip icon="in" label="LinkedIn" href={safeUrl(linkedin)} />}
              {twitter && <ContactChip icon="𝕏" label="Twitter" href={safeUrl(twitter)} />}
              {website && <ContactChip icon="↗" label="Website" href={safeUrl(website)} />}
              {leetcode && <ContactChip icon="⌘" label="LeetCode" href={safeUrl(leetcode)} />}
              {hackerrank && <ContactChip icon="✦" label="HackerRank" href={safeUrl(hackerrank)} />}
            </div>
          </div>

          {/* Right — 3D Aurora sphere */}
          <div className="aur-model-panel" style={{ height: "440px", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(74,222,128,0.25) 0%, transparent 70%)",
                filter: "blur(35px)",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
              <AuroraSphereModel3D />
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "0 6vw 6rem" }}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "2.5rem",
            padding: "0.5rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "999px",
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => (
            <NavPill key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        {/* ── ABOUT ── */}
        {activeTab === "about" && (
          <div className="aur-fade">
            {skillGroups.length > 0 && (
              <div style={{ marginBottom: "2.2rem" }}>
                <SectionTitle sub="Technologies and tools I work with">Skills</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {skillGroups.map((group, gi) => (
                    <GlassCard key={gi}>
                      {group?.category && (
                        <p
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#4ade80",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: "0.6rem",
                          }}
                        >
                          {group.category}
                        </p>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {(Array.isArray(group?.skills) ? group.skills : []).map((skill, si) => (
                          <SkillPill key={si} skill={skill} index={si} />
                        ))}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div style={{ marginBottom: "2.2rem" }}>
                <SectionTitle sub="Recognitions and milestones">Achievements</SectionTitle>
                <div className="aur-projects-grid">
                  {achievements.map((ach, i) => (
                    <GlassCard key={i}>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "0.35rem" }}>
                        ✦ {ach?.title || ""}
                      </p>
                      {ach?.description && (
                        <p style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.7 }}>{ach.description}</p>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {hobbies.length > 0 && (
              <div>
                <SectionTitle sub="What I enjoy outside of work">Interests</SectionTitle>
                <GlassCard>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {hobbies.map((h, i) => (
                      <SkillPill key={i} skill={h} index={i} />
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {skillGroups.length === 0 && achievements.length === 0 && hobbies.length === 0 && (
              <GlassCard>
                <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>Nothing added yet.</p>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeTab === "experience" && (
          <div className="aur-fade">
            <SectionTitle sub="Where I've worked and what I've built">Experience</SectionTitle>
            <GlassCard style={{ marginBottom: "2rem" }}>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={exp?.company || ""}
                    period={exp?.startDate ? `${exp.startDate} — ${exp?.current ? "Present" : exp?.endDate || ""}` : undefined}
                    description={exp?.description}
                    isLast={i === experience.length - 1}
                  />
                ))
              ) : (
                <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>No experience added yet.</p>
              )}
            </GlassCard>

            {certifications.length > 0 && (
              <>
                <SectionTitle sub="Professional credentials">Certifications</SectionTitle>
                <div className="aur-projects-grid">
                  {certifications.map((cert, i) => (
                    <GlassCard key={i}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "0.3rem" }}>
                        {cert?.title || cert?.name || ""}
                      </p>
                      {(cert?.issuer || cert?.organization) && (
                        <p style={{ fontSize: "0.76rem", color: "#22d3ee", fontWeight: 500 }}>
                          {cert.issuer || cert.organization}
                          {(cert?.date || cert?.issueDate) && (
                            <span style={{ color: "#64748B" }}> · {cert.date || cert.issueDate}</span>
                          )}
                        </p>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PROJECTS ── */}
        {activeTab === "projects" && (
          <div className="aur-fade">
            <SectionTitle sub="Things I've designed, built and shipped">Projects</SectionTitle>
            {projects.length > 0 ? (
              <div className="aur-projects-grid">
                {projects.map((proj, i) => (
                  <ProjectCard key={i} proj={proj} />
                ))}
              </div>
            ) : (
              <GlassCard>
                <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>No projects added yet.</p>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── EDUCATION ── */}
        {activeTab === "education" && (
          <div className="aur-fade">
            <SectionTitle sub="Academic background">Education</SectionTitle>
            <GlassCard style={{ marginBottom: "2rem" }}>
              {education.length > 0 ? (
                education.map((edu, i) => (
                  <TimelineEntry
                    key={i}
                    heading={edu?.degree || "Degree"}
                    sub={edu?.institution || ""}
                    period={edu?.startDate ? `${edu.startDate} — ${edu?.current ? "Present" : edu?.endDate || ""}` : undefined}
                    extra={edu?.score ? `${edu?.scoreType || "Score"}: ${edu.score}${edu?.outOf ? `/${edu.outOf}` : ""}` : undefined}
                    description={edu?.description}
                    isLast={i === education.length - 1}
                  />
                ))
              ) : (
                <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>No education added yet.</p>
              )}
            </GlassCard>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "1.5rem 6vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          background: "rgba(5,8,22,0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
          <GradientText>{name}</GradientText>
        </span>
        <span style={{ fontSize: "0.65rem", color: "rgba(216,243,255,0.25)", letterSpacing: "0.1em" }}>
          AURORA GRADIENT · THREE.JS
        </span>
      </footer>
    </div>
  );
}