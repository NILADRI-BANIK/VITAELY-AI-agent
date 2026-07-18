"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Three.js 3D Model — unchanged from fixed version
// ─────────────────────────────────────────────
function TerminalModel3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let cleanupListeners = null;

    async function init() {
      let THREE;
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (!mounted || !mountRef.current) return;

      const width = mountRef.current.clientWidth || 340;
      const height = mountRef.current.clientHeight || 340;

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.5);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const globeGeo = new THREE.SphereGeometry(1.5, 18, 12);
      const globeMat = new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      scene.add(globe);

      const innerGeo = new THREE.SphereGeometry(1.46, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.85,
      });
      scene.add(new THREE.Mesh(innerGeo, innerMat));

      const ringGroup = new THREE.Group();
      scene.add(ringGroup);

      [-0.8, 0, 0.8].forEach((y, i) => {
        const r = Math.sqrt(1.5 * 1.5 - y * y);
        const rg = new THREE.TorusGeometry(r, 0.008, 6, 80);
        const rm = new THREE.MeshBasicMaterial({
          color: 0x00ff41,
          transparent: true,
          opacity: i === 1 ? 0.5 : 0.25,
        });
        const ring = new THREE.Mesh(rg, rm);
        ring.position.y = y;
        ring.rotation.x = Math.PI / 2;
        ringGroup.add(ring);
      });

      for (let i = 0; i < 6; i++) {
        const mg = new THREE.TorusGeometry(1.5, 0.006, 6, 80);
        const mm = new THREE.MeshBasicMaterial({
          color: 0x00ff41,
          transparent: true,
          opacity: 0.18,
        });
        const meridian = new THREE.Mesh(mg, mm);
        meridian.rotation.y = (i * Math.PI) / 6;
        ringGroup.add(meridian);
      }

      const nodeGroup = new THREE.Group();
      scene.add(nodeGroup);

      const nodeData = [
        {
          r: 2.1,
          speed: 0.5,
          color: 0x00ff41,
          size: 0.07,
          phase: 0,
          tiltX: 0.3,
          tiltZ: 0,
        },
        {
          r: 2.45,
          speed: -0.35,
          color: 0x00ffaa,
          size: 0.055,
          phase: Math.PI * 0.7,
          tiltX: 1.1,
          tiltZ: 0.4,
        },
        {
          r: 2.0,
          speed: 0.65,
          color: 0x39ff14,
          size: 0.065,
          phase: Math.PI * 1.4,
          tiltX: 0.6,
          tiltZ: 1.2,
        },
        {
          r: 2.3,
          speed: -0.45,
          color: 0x00ff41,
          size: 0.05,
          phase: Math.PI * 0.3,
          tiltX: 1.5,
          tiltZ: 0.7,
        },
      ];

      const nodeMeshes = [];
      nodeData.forEach(({ r, color, size, tiltX, tiltZ }) => {
        const orbitGeo = new THREE.TorusGeometry(r, 0.005, 6, 100);
        const orbitMat = new THREE.MeshBasicMaterial({
          color: 0x00ff41,
          transparent: true,
          opacity: 0.1,
        });
        const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
        orbitMesh.rotation.x = tiltX;
        orbitMesh.rotation.z = tiltZ;
        scene.add(orbitMesh);
        const ng = new THREE.SphereGeometry(size, 8, 8);
        const nm = new THREE.MeshBasicMaterial({ color });
        const node = new THREE.Mesh(ng, nm);
        nodeGroup.add(node);
        nodeMeshes.push(node);
      });

      const beamGeo = new THREE.TorusGeometry(1.52, 0.04, 4, 80);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.6,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.rotation.x = Math.PI / 2;
      scene.add(beam);

      const pCount = 200;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 8;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x00ff41,
        size: 0.025,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      scene.add(new THREE.AmbientLight(0x00ff41, 0.3));
      const greenLight = new THREE.PointLight(0x00ff41, 2.5, 8);
      greenLight.position.set(2, 2, 3);
      scene.add(greenLight);

      let mouseX = 0;
      let mouseY = 0;
      const onMouse = (e) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
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

      let t = 0;
      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.008;

        globe.rotation.y += (mouseX * 0.4 - globe.rotation.y) * 0.04;
        globe.rotation.x += (mouseY * 0.25 - globe.rotation.x) * 0.04;
        ringGroup.rotation.y = globe.rotation.y;
        ringGroup.rotation.x = globe.rotation.x;

        nodeMeshes.forEach((node, i) => {
          const d = nodeData[i];
          const angle = t * d.speed + d.phase;
          const cosT = Math.cos(d.tiltX);
          const sinT = Math.sin(d.tiltX);
          const cosZ = Math.cos(d.tiltZ);
          const sinZ = Math.sin(d.tiltZ);
          const x0 = Math.cos(angle) * d.r;
          const y0 = Math.sin(angle) * d.r;
          node.position.x = x0 * cosZ - y0 * sinT * sinZ;
          node.position.y = x0 * sinZ + y0 * cosT;
          node.position.z = y0 * sinT;
        });

        beam.position.y = Math.sin(t * 0.6) * 1.4;
        const beamScale =
          Math.sqrt(
            Math.max(0.01, 1.5 * 1.5 - beam.position.y * beam.position.y),
          ) / 1.5;
        beam.scale.set(beamScale, beamScale, 1);
        beamMat.opacity = 0.4 + Math.abs(Math.sin(t * 0.6)) * 0.5;

        particles.rotation.y = t * 0.04;
        const pp = pGeo.attributes.position;
        for (let i = 0; i < pCount; i++) {
          pp.array[i * 3 + 1] -= 0.012;
          if (pp.array[i * 3 + 1] < -4) pp.array[i * 3 + 1] = 4;
        }
        pp.needsUpdate = true;

        greenLight.intensity = 2.5 + Math.sin(t * 2) * 0.6;
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
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
    />
  );
}

// ─────────────────────────────────────────────
// Sub-components — unchanged
// ─────────────────────────────────────────────

function TermLine({ prompt = "$", command, output, color = "#00ff41" }) {
  return (
    <div style={{ marginBottom: "0.15rem" }}>
      {command !== undefined && (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
          <span
            style={{ color: "#00ff41", fontWeight: 700, fontSize: "0.82rem" }}
          >
            {prompt}
          </span>
          <span style={{ color, fontSize: "0.82rem" }}>{command}</span>
        </div>
      )}
      {output !== undefined && (
        <div
          style={{
            color: "#4ade80",
            fontSize: "0.78rem",
            paddingLeft: "1.2rem",
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          {output}
        </div>
      )}
    </div>
  );
}

function TermBlock({ title, children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.7)",
        border: "1px solid #00ff4133",
        borderRadius: "8px",
        marginBottom: "1.2rem",
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(0,255,65,0.06)",
        ...style,
      }}
    >
      <div
        style={{
          background: "rgba(0,255,65,0.07)",
          borderBottom: "1px solid #00ff4133",
          padding: "0.4rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.3rem" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: c,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        <span
          style={{
            color: "#00ff41",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            opacity: 0.7,
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "1rem 1.2rem" }}>{children}</div>
    </div>
  );
}

function Cursor() {
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setVis((v) => !v), 530);
    return () => clearInterval(iv);
  }, []);
  return (
    <span
      style={{
        display: "inline-block",
        width: "8px",
        height: "14px",
        background: "#00ff41",
        verticalAlign: "middle",
        marginLeft: "2px",
        opacity: vis ? 1 : 0,
        transition: "opacity 0.1s",
      }}
    />
  );
}

function SkillTag({ skill }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block",
        background: hov ? "rgba(0,255,65,0.18)" : "rgba(0,255,65,0.07)",
        border: `1px solid ${hov ? "#00ff4177" : "#00ff4133"}`,
        color: hov ? "#00ff41" : "#4ade80",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.72rem",
        fontWeight: 500,
        padding: "0.22rem 0.65rem",
        borderRadius: "4px",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.15s",
        letterSpacing: "0.03em",
      }}
    >
      {skill}
    </span>
  );
}

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: active ? "#00ff41" : "#166534",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.78rem",
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        padding: "0.3rem 0",
        letterSpacing: "0.04em",
        borderBottom: active ? "1px solid #00ff41" : "1px solid transparent",
        transition: "all 0.15s",
        marginRight: "1.5rem",
      }}
    >
      {active ? "> " : "  "}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// Main Template
//
// UPDATED: prop changed from { portfolio } → { data }
// to match the standard used by all other templates
// (glassmorphism, modern, minimal, etc.)
// ─────────────────────────────────────────────

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHANGE 1 — safeUrl helper (NEW — added to match glassmorphism)
// Previously: inline ternary spread across contact links
// Now: single reusable helper consistent with all other templates
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHANGE 2 — export prop renamed { portfolio } → { data }
// All other templates in the system use { data }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function TerminalProTemplate({ data = {} }) {
  const [activeTab, setActiveTab] = useState("whoami");
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState([]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHANGE 3 — data destructuring rewritten to match system schema
  //
  // OLD (flat portfolio prop):
  //   const name  = portfolio?.name ?? "Your Name";
  //   const email = portfolio?.email ?? "";
  //   const skills = portfolio?.skills ?? [];          ← was string[]
  //   const projects = portfolio?.projects ?? [];      ← used .name / .technologies
  //
  // NEW (nested data prop, same shape as glassmorphism):
  //   const name  = data?.hero?.name ?? "Your Name";
  //   const email = data?.contact?.email ?? "";
  //   const skills = data?.skills ?? [];               ← now [{ category, skills[] }]
  //   const projects = data?.projects ?? [];           ← now uses .title / .techStack
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const name = hero.name || "Your Name";
  const title = hero.title || "Your Title";
  const summary = hero.summary || hero.tagline || "";

  const email = contact.email || "";
  const phone = contact.phone || "";
  const location = contact.location || "";
  const linkedin = contact.linkedin || "";
  const github = contact.github || "";
  const website = contact.portfolioUrl || contact.website || "";

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHANGE 4 — all array fields now read from data (not portfolio)
  // Shape of each array now matches glassmorphism / system schema
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const skillGroups = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];
  const hobbies = Array.isArray(data?.hobbies) ? data.hobbies : [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHANGE 5 — boot useEffect dependency updated
  // OLD: depends on [portfolio, name, title]
  // NEW: depends on [data, name, title]
  //      guard changed from !portfolio → !data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const timeouts = [];
    const lines = [
      { t: 0, text: "Initializing portfolio.sh ...", color: "#00ff41" },
      { t: 300, text: `Loading profile: ${name}`, color: "#4ade80" },
      { t: 600, text: `Role: ${title}`, color: "#4ade80" },
      { t: 900, text: "Mounting filesystem ... done", color: "#166534" },
      { t: 1100, text: "Connecting to 3D renderer ... done", color: "#166534" },
      { t: 1350, text: "Ready.", color: "#00ff41" },
    ];

    lines.forEach(({ t, text, color }) => {
      const id = setTimeout(
        () => setBootLines((prev) => [...prev, { text, color }]),
        t,
      );
      timeouts.push(id);
    });

    const bootId = setTimeout(() => setBooted(true), 1600);
    timeouts.push(bootId);

    return () => timeouts.forEach(clearTimeout);
  }, [data, name, title]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHANGE 6 — guard updated
  // OLD: if (!portfolio) return null;
  // NEW: if (!data) return null;
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!data) return null;

  const tabs = [
    { id: "whoami", label: "whoami" },
    { id: "experience", label: "ls ./work" },
    { id: "projects", label: "ls ./projects" },
    { id: "education", label: "cat ./education" },
  ];

  const pillC = [
    "#00ff41",
    "#00ffaa",
    "#39ff14",
    "#7fff00",
    "#adff2f",
    "#00fa9a",
  ];
  const getC = (i) => pillC[i % pillC.length];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHANGE 7 — skills stats counter
  // OLD: skills.length  (skills was string[])
  // NEW: total count across all skill groups
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const totalSkills = skillGroups.reduce(
    (acc, group) =>
      acc + (Array.isArray(group?.skills) ? group.skills.length : 0),
    0,
  );

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: "#020c02",
        minHeight: "100vh",
        color: "#00ff41",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020c02; }
        ::-webkit-scrollbar-thumb { background: #00ff4144; border-radius: 2px; }
        @keyframes tpFlicker {
          0%,100% { opacity:1 } 92% { opacity:1 } 93% { opacity:0.85 }
          94% { opacity:1 }     96% { opacity:0.9 } 97% { opacity:1 }
        }
        @keyframes tpFadeIn {
          from { opacity:0; transform:translateY(8px) }
          to   { opacity:1; transform:translateY(0)   }
        }
        .tp-hero-grid {
          display: grid; grid-template-columns: 1fr 360px;
          gap: 2rem; padding: 2.5rem 2.5rem 1.5rem;
          align-items: center; max-width: 1280px; margin: 0 auto;
        }
        @media (max-width: 900px) {
          .tp-hero-grid { grid-template-columns: 1fr; }
          .tp-model-panel { height: 260px !important; }
        }
        .tp-content-grid {
          display: grid; grid-template-columns: 1fr 280px;
          gap: 1.5rem; align-items: start;
        }
        @media (max-width: 900px) { .tp-content-grid { grid-template-columns: 1fr; } }
        .tp-projects-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem;
        }
        @media (max-width: 600px) { .tp-projects-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* CRT scanlines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)",
          backgroundSize: "100% 3px",
          animation: "tpFlicker 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(0,255,65,0.04) 0%, transparent 65%)",
        }}
      />

      {/* Boot screen */}
      {!booted && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#020c02",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "3rem",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              color: "#166534",
              letterSpacing: "0.1em",
              marginBottom: "1.5rem",
            }}
          >
            PORTFOLIO OS v2.4.1 — TERMINAL PRO
          </div>
          {bootLines.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.color,
                fontSize: "0.82rem",
                lineHeight: 1.8,
                animation: "tpFadeIn 0.2s ease both",
              }}
            >
              {line.text}
              {i === bootLines.length - 1 && <Cursor />}
            </div>
          ))}
        </div>
      )}

      {/* Main layout */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: booted ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            borderBottom: "1px solid #00ff4122",
            padding: "0.5rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                color: "#166534",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
              }}
            >
              portfolio@terminal:~
            </span>
          </div>
          <span
            style={{
              color: "#00ff4155",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
            }}
          >
            TERMINAL PRO · {name.toUpperCase()}
          </span>
        </div>

        {/* Hero */}
        <div className="tp-hero-grid">
          <div>
            <TermBlock title="bash — 80×24">
              <TermLine
                prompt="root@portfolio:~$"
                command="./boot-profile.sh"
              />
              <div style={{ marginTop: "0.4rem", marginBottom: "0.8rem" }}>
                <div
                  style={{
                    color: "#00ff41",
                    fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    marginBottom: "0.3rem",
                  }}
                >
                  {name}
                  <Cursor />
                </div>
                <div
                  style={{
                    color: "#4ade80",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    marginBottom: "0.8rem",
                    opacity: 0.8,
                  }}
                >
                  {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      CHANGE 8 — removed "// " comment prefix before title
                      OLD: // {title}
                      NEW: {title}  (cleaner; comment style was cosmetic noise)
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                  {title}
                </div>
              </div>

              {summary && (
                <>
                  <TermLine prompt="#" command="summary" color="#166534" />
                  <div
                    style={{
                      color: "#4ade80",
                      fontSize: "0.78rem",
                      lineHeight: 1.8,
                      paddingLeft: "1.2rem",
                      marginBottom: "0.8rem",
                      opacity: 0.75,
                      maxWidth: "560px",
                    }}
                  >
                    {summary}
                  </div>
                </>
              )}

              <TermLine prompt="#" command="contact --all" color="#166534" />
              <div style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
                {email && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#4ade80",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ color: "#166534" }}>email: </span>
                    <a
                      href={`mailto:${email}`}
                      style={{ color: "#00ff41", textDecoration: "none" }}
                    >
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#4ade80",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ color: "#166534" }}>phone: </span>
                    {phone}
                  </div>
                )}
                {location && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#4ade80",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ color: "#166534" }}>location: </span>
                    {location}
                  </div>
                )}
                {github && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#4ade80",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ color: "#166534" }}>github: </span>
                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        CHANGE 9 — safeUrl() replaces inline ternary on all links
                        OLD: href={github.startsWith("http") ? github : `https://${github}`}
                        NEW: href={safeUrl(github)}
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    <a
                      href={safeUrl(github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#00ff41", textDecoration: "none" }}
                    >
                      {github}
                    </a>
                  </div>
                )}
                {linkedin && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#4ade80",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ color: "#166534" }}>linkedin: </span>
                    <a
                      href={safeUrl(linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#00ff41", textDecoration: "none" }}
                    >
                      {linkedin}
                    </a>
                  </div>
                )}
                {website && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#4ade80",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ color: "#166534" }}>website: </span>
                    <a
                      href={safeUrl(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#00ff41", textDecoration: "none" }}
                    >
                      {website}
                    </a>
                  </div>
                )}
              </div>
            </TermBlock>
          </div>

          {/* 3D model panel — unchanged */}
          <div
            className="tp-model-panel"
            style={{
              height: "360px",
              position: "relative",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid #00ff4122",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {[
              {
                top: 0,
                left: 0,
                borderTop: "2px solid #00ff41",
                borderLeft: "2px solid #00ff41",
              },
              {
                top: 0,
                right: 0,
                borderTop: "2px solid #00ff41",
                borderRight: "2px solid #00ff41",
              },
              {
                bottom: 0,
                left: 0,
                borderBottom: "2px solid #00ff41",
                borderLeft: "2px solid #00ff41",
              },
              {
                bottom: 0,
                right: 0,
                borderBottom: "2px solid #00ff41",
                borderRight: "2px solid #00ff41",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "14px",
                  height: "14px",
                  zIndex: 2,
                  opacity: 0.7,
                  ...s,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                top: "0.5rem",
                left: "1rem",
                fontSize: "0.6rem",
                color: "#00ff4177",
                letterSpacing: "0.12em",
                zIndex: 3,
              }}
            >
              SYS.3D_RENDER
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "0.5rem",
                right: "1rem",
                fontSize: "0.58rem",
                color: "#00ff4155",
                letterSpacing: "0.1em",
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#00ff41",
                  display: "inline-block",
                  boxShadow: "0 0 4px #00ff41",
                }}
              />
              ONLINE
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(0,255,65,0.025) 0px, rgba(0,255,65,0.025) 1px, transparent 1px, transparent 4px)",
                backgroundSize: "100% 4px",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                zIndex: 0,
              }}
            >
              <TerminalModel3D />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{
            padding: "0 2.5rem",
            borderBottom: "1px solid #00ff4118",
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <TermLine prompt="guest@portfolio:~$" command="navigate --section" />
          <div
            style={{
              paddingLeft: "1.2rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.8rem",
            }}
          >
            {tabs.map((tab) => (
              <NavBtn
                key={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "2rem 2.5rem 4rem",
          }}
        >
          {/* ── WHOAMI ── */}
          {activeTab === "whoami" && (
            <div className="tp-content-grid">
              <div>
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CHANGE 10 — Skills rendering rewritten for grouped schema
                    OLD: skills was string[] → rendered flat <SkillTag> per string
                         skills.map((skill, i) => <SkillTag key={i} skill={skill} />)
                    NEW: skills is [{ category, skills[] }] → renders category header
                         then individual tags per skill within each group
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {skillGroups.length > 0 && (
                  <TermBlock title="skills.json">
                    <TermLine
                      prompt="$"
                      command={`cat skills.json | grep -c '.'`}
                    />
                    <div
                      style={{
                        paddingLeft: "1.2rem",
                        color: "#4ade80",
                        fontSize: "0.75rem",
                        marginBottom: "0.8rem",
                      }}
                    >
                      {totalSkills} skills found across {skillGroups.length}{" "}
                      categories
                    </div>
                    <TermLine prompt="$" command="jq '.skills[]'" />
                    <div style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.8rem" }}>
                          {group?.category && (
                            <div
                              style={{
                                color: "#166534",
                                fontSize: "0.7rem",
                                marginBottom: "0.3rem",
                                letterSpacing: "0.05em",
                              }}
                            >
                              # {group.category}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {(Array.isArray(group?.skills)
                              ? group.skills
                              : []
                            ).map((skill, si) => (
                              <SkillTag key={si} skill={skill} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TermBlock>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CHANGE 11 — certifications field keys updated
                    OLD: cert.name || cert.title  /  cert.year || cert.date
                    NEW: cert.title || cert.name  /  cert.issuer || cert.organization
                         cert.date || cert.issueDate
                    (matches glassmorphism schema exactly)
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {certifications.length > 0 && (
                  <TermBlock title="certifications.txt">
                    <TermLine prompt="$" command="cat certifications.txt" />
                    <div style={{ paddingLeft: "1.2rem", marginTop: "0.4rem" }}>
                      {certifications.map((cert, i) => (
                        <div
                          key={i}
                          style={{
                            borderBottom: "1px solid #00ff4112",
                            paddingBottom: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              color: "#00ff41",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            [{String(i + 1).padStart(2, "0")}]{" "}
                            {cert.title || cert.name}
                          </div>
                          {(cert.issuer || cert.organization) && (
                            <div
                              style={{
                                color: "#166534",
                                fontSize: "0.72rem",
                                paddingLeft: "1.4rem",
                              }}
                            >
                              issuer: {cert.issuer || cert.organization}
                              {cert.date || cert.issueDate
                                ? `  date: ${cert.date || cert.issueDate}`
                                : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TermBlock>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CHANGE 12 — Achievements section (NEW)
                    OLD: not present in terminal-pro at all
                    NEW: added to match system schema (glassmorphism has it)
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {achievements.length > 0 && (
                  <TermBlock title="achievements.log">
                    <TermLine prompt="$" command="cat achievements.log" />
                    <div style={{ paddingLeft: "1.2rem", marginTop: "0.4rem" }}>
                      {achievements.map((ach, i) => (
                        <div
                          key={i}
                          style={{
                            borderBottom: "1px solid #00ff4112",
                            paddingBottom: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              color: "#00ff41",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            ✦ {ach.title}
                          </div>
                          {ach.description && (
                            <div
                              style={{
                                color: "#4ade80",
                                fontSize: "0.72rem",
                                paddingLeft: "1.4rem",
                                lineHeight: 1.6,
                                opacity: 0.8,
                              }}
                            >
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TermBlock>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CHANGE 13 — Hobbies/Interests section (NEW)
                    OLD: not present in terminal-pro at all
                    NEW: added to match system schema (glassmorphism has it)
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {hobbies.length > 0 && (
                  <TermBlock title="interests.txt">
                    <TermLine prompt="$" command="cat interests.txt" />
                    <div
                      style={{
                        paddingLeft: "1.2rem",
                        marginTop: "0.4rem",
                        display: "flex",
                        flexWrap: "wrap",
                      }}
                    >
                      {hobbies.map((hobby, i) => (
                        <SkillTag key={i} skill={hobby} />
                      ))}
                    </div>
                  </TermBlock>
                )}
              </div>

              {/* Sidebar stats */}
              <div>
                <TermBlock title="stats.sh">
                  <TermLine prompt="$" command="./stats.sh --verbose" />
                  <div style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        CHANGE 14 — stats updated to use totalSkills and new fields
                        OLD: { k: "skills", v: skills.length }  ← skills was string[]
                        NEW: { k: "skills", v: totalSkills }    ← counted across groups
                             Added achievements and hobbies rows
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    {[
                      { k: "skills", v: totalSkills },
                      { k: "projects", v: projects.length },
                      { k: "experience", v: experience.length },
                      { k: "education", v: education.length },
                      { k: "certs", v: certifications.length },
                      { k: "achievements", v: achievements.length },
                      { k: "hobbies", v: hobbies.length },
                    ].map(({ k, v }) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.75rem",
                          marginBottom: "0.3rem",
                          borderBottom: "1px solid #00ff4110",
                          paddingBottom: "0.3rem",
                        }}
                      >
                        <span style={{ color: "#166534" }}>{k}:</span>
                        <span style={{ color: "#00ff41", fontWeight: 700 }}>
                          {String(v).padStart(3, "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                </TermBlock>

                <TermBlock title="uptime.log">
                  <div style={{ paddingLeft: "0.2rem" }}>
                    <div
                      style={{
                        color: "#166534",
                        fontSize: "0.7rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      system status
                    </div>
                    {[
                      { label: "STATUS", val: "ACTIVE", ok: true },
                      { label: "MODE", val: "PORTFOLIO", ok: true },
                      { label: "3D", val: "ENABLED", ok: true },
                    ].map(({ label, val, ok }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.7rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ color: "#166534" }}>{label}</span>
                        <span style={{ color: ok ? "#00ff41" : "#ff5555" }}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </TermBlock>
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {activeTab === "experience" && (
            <TermBlock title="work-history.log">
              <TermLine prompt="$" command={`ls -la ./work | wc -l`} />
              <div
                style={{
                  paddingLeft: "1.2rem",
                  color: "#4ade80",
                  fontSize: "0.75rem",
                  marginBottom: "0.8rem",
                }}
              >
                {experience.length} records found
              </div>
              <TermLine prompt="$" command="cat work-history.log" />
              <div style={{ paddingLeft: "1.2rem", marginTop: "0.6rem" }}>
                {experience.length > 0 ? (
                  experience.map((exp, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: "2px solid #00ff4133",
                        paddingLeft: "1rem",
                        marginBottom: "1.5rem",
                        paddingBottom: "1rem",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "-5px",
                          top: "0.3rem",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#00ff41",
                          boxShadow: "0 0 6px #00ff41",
                        }}
                      />
                      <div
                        style={{
                          color: "#00ff41",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          marginBottom: "0.15rem",
                        }}
                      >
                        [{String(i + 1).padStart(2, "0")}]{" "}
                        {exp.title || exp.role}
                      </div>
                      <div
                        style={{
                          color: "#4ade80",
                          fontSize: "0.75rem",
                          marginBottom: "0.1rem",
                        }}
                      >
                        <span style={{ color: "#166534" }}>company: </span>
                        {exp.company}
                        {exp.location && (
                          <span style={{ color: "#166534" }}>
                            {" "}
                            · loc: {exp.location}
                          </span>
                        )}
                      </div>
                      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          CHANGE 15 — experience end date uses .current flag
                          OLD: exp.endDate || exp.end  (no current flag support)
                          NEW: exp.current ? "present" : exp.endDate || exp.end
                          (matches glassmorphism schema)
                      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                      <div
                        style={{
                          color: "#166534",
                          fontSize: "0.7rem",
                          marginBottom: "0.5rem",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        period: {exp.startDate || exp.start} →{" "}
                        {exp.current
                          ? "present"
                          : exp.endDate || exp.end || "present"}
                      </div>
                      {exp.description && (
                        <div
                          style={{
                            color: "#4ade80",
                            fontSize: "0.75rem",
                            lineHeight: 1.75,
                            opacity: 0.8,
                            marginBottom: "0.5rem",
                          }}
                        >
                          {exp.description}
                        </div>
                      )}
                      {Array.isArray(exp.responsibilities) &&
                        exp.responsibilities.length > 0 && (
                          <div>
                            {exp.responsibilities.map((r, ri) => (
                              <div
                                key={ri}
                                style={{
                                  color: "#166534",
                                  fontSize: "0.72rem",
                                  lineHeight: 1.7,
                                }}
                              >
                                + {r}
                              </div>
                            ))}
                          </div>
                        )}
                      {Array.isArray(exp.achievements) &&
                        exp.achievements.length > 0 && (
                          <div>
                            {exp.achievements.map((a, ai) => (
                              <div
                                key={ai}
                                style={{
                                  color: "#166534",
                                  fontSize: "0.72rem",
                                  lineHeight: 1.7,
                                }}
                              >
                                ✓ {a}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#166534", fontSize: "0.8rem" }}>
                    {" "}
                    no records found
                  </div>
                )}
              </div>
            </TermBlock>
          )}

          {/* ── PROJECTS ── */}
          {activeTab === "projects" && (
            <div>
              <TermLine
                prompt="$"
                command={`find ./projects -maxdepth 1 -type d`}
              />
              <div
                style={{
                  paddingLeft: "1.2rem",
                  color: "#4ade80",
                  fontSize: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                {projects.length} directories found
              </div>
              {projects.length > 0 ? (
                <div className="tp-projects-grid">
                  {projects.map((proj, i) => (
                    <TermBlock
                      key={i}
                      title={`./projects/${(proj.title || proj.name || "project").toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div>
                        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            CHANGE 16 — project field keys updated
                            OLD: proj.name || proj.title  /  proj.technologies || proj.tech
                                 proj.liveUrl || proj.demo  /  proj.githubUrl || proj.github
                            NEW: proj.title || proj.name   /  proj.techStack  (primary)
                                 proj.liveUrl               /  proj.github
                            (matches glassmorphism schema exactly)
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                        <div
                          style={{
                            color: "#00ff41",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            marginBottom: "0.4rem",
                          }}
                        >
                          {proj.title || proj.name}
                        </div>
                        {proj.description && (
                          <div
                            style={{
                              color: "#4ade80",
                              fontSize: "0.75rem",
                              lineHeight: 1.75,
                              marginBottom: "0.6rem",
                              opacity: 0.8,
                            }}
                          >
                            {proj.description}
                          </div>
                        )}
                        {Array.isArray(proj.techStack) &&
                          proj.techStack.length > 0 && (
                            <div style={{ marginBottom: "0.6rem" }}>
                              <div
                                style={{
                                  color: "#166534",
                                  fontSize: "0.68rem",
                                  marginBottom: "0.3rem",
                                }}
                              >
                                $ npm ls --depth=0
                              </div>
                              <div style={{ paddingLeft: "1rem" }}>
                                {proj.techStack.map((tech, ti) => (
                                  <span
                                    key={ti}
                                    style={{
                                      display: "inline-block",
                                      color: getC(ti),
                                      fontSize: "0.7rem",
                                      marginRight: "0.5rem",
                                      marginBottom: "0.2rem",
                                    }}
                                  >
                                    ├─ {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.8rem",
                            marginTop: "0.4rem",
                          }}
                        >
                          {proj.liveUrl && (
                            <a
                              href={safeUrl(proj.liveUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#00ff41",
                                fontSize: "0.7rem",
                                textDecoration: "none",
                                fontWeight: 600,
                              }}
                            >
                              → open live
                            </a>
                          )}
                          {proj.github && (
                            <a
                              href={safeUrl(proj.github)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#4ade80",
                                fontSize: "0.7rem",
                                textDecoration: "none",
                              }}
                            >
                              → git clone
                            </a>
                          )}
                        </div>
                      </div>
                    </TermBlock>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#166534", fontSize: "0.8rem" }}>
                  {" "}
                  no projects found
                </div>
              )}
            </div>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === "education" && (
            <TermBlock title="education.md">
              <TermLine prompt="$" command="cat education.md" />
              <div style={{ paddingLeft: "1.2rem", marginTop: "0.6rem" }}>
                {education.length > 0 ? (
                  education.map((edu, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: "2px solid #00ff4133",
                        paddingLeft: "1rem",
                        marginBottom: "1.4rem",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "-5px",
                          top: "0.3rem",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#00ff41",
                          boxShadow: "0 0 6px #00ff41",
                        }}
                      />
                      <div
                        style={{
                          color: "#00ff41",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          marginBottom: "0.15rem",
                        }}
                      >
                        ## {edu.degree || edu.field}
                      </div>
                      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          CHANGE 17 — education institution field updated
                          OLD: edu.school || edu.institution
                          NEW: edu.institution || edu.school
                          (institution is primary key in system schema)
                      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                      <div
                        style={{
                          color: "#4ade80",
                          fontSize: "0.75rem",
                          marginBottom: "0.1rem",
                        }}
                      >
                        <span style={{ color: "#166534" }}>institution: </span>
                        {edu.institution || edu.school}
                      </div>
                      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          CHANGE 18 — education end date uses .current flag
                          OLD: no current flag support
                          NEW: edu.current ? "Present" : edu.endDate
                               Also renders score/GPA from system schema
                      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                      <div
                        style={{
                          color: "#166534",
                          fontSize: "0.7rem",
                          marginBottom: "0.3rem",
                        }}
                      >
                        period: {edu.startDate || edu.start}
                        {edu.current
                          ? " → Present"
                          : edu.endDate || edu.end
                            ? ` → ${edu.endDate || edu.end}`
                            : ""}
                        {edu.gpa ? `  |  gpa: ${edu.gpa}` : ""}
                        {edu.score
                          ? `  |  score: ${edu.score}${edu.outOf ? `/${edu.outOf}` : ""}`
                          : ""}
                      </div>
                      {edu.description && (
                        <div
                          style={{
                            color: "#4ade80",
                            fontSize: "0.75rem",
                            lineHeight: 1.75,
                            opacity: 0.75,
                          }}
                        >
                          {edu.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#166534", fontSize: "0.8rem" }}>
                    {" "}
                    no records found
                  </div>
                )}

                {certifications.length > 0 && (
                  <div style={{ marginTop: "1.2rem" }}>
                    <TermLine prompt="$" command="ls ./certifications/" />
                    <div style={{ paddingLeft: "1.2rem", marginTop: "0.4rem" }}>
                      {certifications.map((cert, i) => (
                        <div key={i} style={{ marginBottom: "0.4rem" }}>
                          <span
                            style={{ color: "#166534", fontSize: "0.72rem" }}
                          >
                            drwxr-xr-x{" "}
                          </span>
                          <span
                            style={{
                              color: "#00ff41",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {cert.title || cert.name}
                          </span>
                          {(cert.issuer || cert.organization) && (
                            <span
                              style={{ color: "#166534", fontSize: "0.7rem" }}
                            >
                              {" "}
                              ({cert.issuer || cert.organization}
                              {cert.date || cert.issueDate
                                ? `, ${cert.date || cert.issueDate}`
                                : ""}
                              )
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TermBlock>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #00ff4118",
            padding: "0.8rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <span
            style={{
              color: "#166534",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
            }}
          >
            [portfolio@terminal ~]${" "}
            <span style={{ color: "#00ff41" }}>exit 0</span>
          </span>
          <span
            style={{
              color: "#00ff4133",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
            }}
          >
            TERMINAL PRO · THREE.JS · {name.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
