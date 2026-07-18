"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";


// ─────────────────────────────────────────────────────────────────
// safeUrl — shared helper (consistent with all templates)
// ─────────────────────────────────────────────────────────────────
const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

// ADD
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// ─────────────────────────────────────────────────────────────────
// PagesModel3D
// Floating stack of matte-white paper sheets — a calm, productivity
// styled object (not a decorative sculpture). Slow rotation, gentle
// float, soft ambient lighting, occasional subtle page shuffle.
// ─────────────────────────────────────────────────────────────────
function PagesModel3D() {
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

      const width = mountRef.current.clientWidth || 360;
      const height = mountRef.current.clientHeight || 360;

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.background = null;

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(2.4, 1.6, 4.2);
      camera.lookAt(0, 0, 0);

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Group holding the whole stack (rotates + floats together) ──
      const stackGroup = new THREE.Group();
      scene.add(stackGroup);

      // ── Individual paper sheets ──
      const sheetCount = 6;
      const sheetW = 1.5;
      const sheetD = 2.0;
      const sheetH = 0.045;
      const sheets = [];

      for (let i = 0; i < sheetCount; i++) {
        const geo = new THREE.BoxGeometry(sheetW, sheetH, sheetD);
        const shade = 0xffffff - i * 0x030303;
        const mat = new THREE.MeshStandardMaterial({
          color: shade,
          roughness: 0.92,
          metalness: 0.0,
        });
        const sheet = new THREE.Mesh(geo, mat);

        // slight natural offset per sheet, like a loosely stacked pile
        sheet.position.y = i * (sheetH + 0.012);
        sheet.position.x = Math.sin(i * 1.3) * 0.035;
        sheet.position.z = Math.cos(i * 1.7) * 0.035;
        sheet.rotation.y = Math.sin(i * 2.1) * 0.02;

        // thin border line (edges) — soft gray, subtle
        const edgesGeo = new THREE.EdgesGeometry(geo);
        const edgesMat = new THREE.LineBasicMaterial({
          color: 0xd4d4d4,
          transparent: true,
          opacity: 0.5,
        });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        sheet.add(edges);

        stackGroup.add(sheet);
        sheets.push({ mesh: sheet, baseY: sheet.position.y, phase: i * 0.9 });

        geometries.push(geo, edgesGeo);
        materials.push(mat, edgesMat);
      }

      // ── Faint text lines on the very top sheet (suggests content) ──
      const topSheetY = sheets[sheetCount - 1].baseY + sheetH / 2 + 0.001;
      const lineWidths = [0.85, 0.65, 0.75, 0.4];
      lineWidths.forEach((w, i) => {
        const lineGeo = new THREE.PlaneGeometry(w, 0.045);
        const lineMat = new THREE.MeshBasicMaterial({
          color: 0xc9c9c9,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
        });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(-sheetW / 2 + w / 2 + 0.18, topSheetY, -0.55 + i * 0.28);
        stackGroup.add(line);
        geometries.push(lineGeo);
        materials.push(lineMat);
      });

      // ── Soft contact shadow (fake AO) below the stack ──
      const shadowGeo = new THREE.CircleGeometry(1.3, 48);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.06,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.35;
      scene.add(shadow);
      geometries.push(shadowGeo);
      materials.push(shadowMat);

      // ── Lights — soft ambient + gentle top-left directional ──
      const ambient = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 0.55);
      keyLight.position.set(-3, 4, 2);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.25);
      fillLight.position.set(2, -1, -3);
      scene.add(fillLight);

      // ── Mouse — very gentle parallax, no aggressive tracking ──
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

      // ── Animation — slow rotation (~28s/rev), gentle float, occasional shuffle ──
      let t = 0;
      let smoothX = 0;
      let smoothY = 0;

      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.0035;

        smoothX += (mouseX - smoothX) * 0.02;
        smoothY += (mouseY - smoothY) * 0.02;

        // slow continuous rotation, ~28s per revolution
        stackGroup.rotation.y = t * 0.9 + smoothX * 0.12;
        stackGroup.rotation.x = Math.sin(t * 0.3) * 0.035 + smoothY * 0.05;

        // gentle float up/down
        stackGroup.position.y = Math.sin(t * 0.6) * 0.09;

        // individual sheets breathe slightly, like loose paper settling
        sheets.forEach(({ mesh, baseY, phase }) => {
          mesh.position.y = baseY + Math.sin(t * 0.8 + phase) * 0.006;
        });

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

function NavLink({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#EDECE9" : "transparent",
        border: "none",
        borderRadius: "8px",
        padding: "0.4rem 0.85rem",
        fontSize: "0.85rem",
        fontWeight: active ? 600 : 500,
        color: active ? "#191919" : "#6B7280",
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer",
        transition: "background 200ms ease, color 200ms ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#F0EFEC";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </button>
  );
}

function Card({ children, style = {}, hover = true }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7E5E4",
        borderRadius: "14px",
        padding: "1.5rem",
        boxShadow: hov
          ? "0 4px 14px rgba(0,0,0,0.05)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 250ms ease, box-shadow 250ms ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#9CA3AF",
        marginBottom: "0.6rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: "1.4rem",
        fontWeight: 700,
        color: "#191919",
        marginBottom: "1.2rem",
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </h2>
  );
}

function SkillPill({ skill }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block",
        padding: "0.3rem 0.8rem",
        borderRadius: "999px",
        fontSize: "0.78rem",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        background: "#F3F2EF",
        border: `1px solid ${hov ? "#93C5FD" : "#E7E5E4"}`,
        color: "#374151",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        transition: "border-color 150ms ease",
        cursor: "default",
      }}
    >
      {skill}
    </span>
  );
}

function ContactLink({ label, href }) {
  if (!href || href === "#") return null;
  return (
    <a
      href={href}
      target={href.startsWith("mailto") || href.startsWith("tel") ? undefined : "_blank"}
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.35rem 0.85rem",
        borderRadius: "8px",
        border: "1px solid #E7E5E4",
        background: "#FFFFFF",
        color: "#374151",
        fontSize: "0.78rem",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        textDecoration: "none",
        marginRight: "0.5rem",
        marginBottom: "0.5rem",
        transition: "background 150ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F6F3")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
    >
      {label}
    </a>
  );
}

function TimelineItem({ heading, sub, period, description, bullets = [], extra, isLast }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "0.3rem",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#D4D4D4",
            border: "1px solid #BFBFBF",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "1px",
              flex: 1,
              minHeight: "40px",
              background: "#E7E5E4",
              marginTop: "4px",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: "1.6rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.3rem",
            marginBottom: "0.2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#191919",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {heading}
          </span>
          {period && (
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                color: "#6B7280",
                background: "#F3F2EF",
                padding: "0.15rem 0.6rem",
                borderRadius: "999px",
                whiteSpace: "nowrap",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {period}
            </span>
          )}
        </div>
        {sub && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "#2563EB",
              fontWeight: 500,
              marginBottom: "0.4rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {sub}
          </p>
        )}
        {extra && (
          <p
            style={{
              fontSize: "0.76rem",
              color: "#6B7280",
              marginBottom: "0.35rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {extra}
          </p>
        )}
        {description && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "#4B5563",
              lineHeight: 1.75,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {description}
          </p>
        )}
        {bullets.length > 0 && (
          <ul style={{ margin: "0.5rem 0 0 1.1rem", padding: 0 }}>
            {bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  fontSize: "0.8rem",
                  color: "#4B5563",
                  lineHeight: 1.7,
                  marginBottom: "0.2rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
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
    <Card style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.5rem",
          marginBottom: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#191919",
            fontFamily: "'Inter', sans-serif",
            margin: 0,
          }}
        >
          {proj?.title || "Project"}
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {proj?.github && (
            <a
              href={safeUrl(proj.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#374151",
                textDecoration: "none",
                padding: "0.2rem 0.6rem",
                border: "1px solid #E7E5E4",
                borderRadius: "999px",
                fontFamily: "'Inter', sans-serif",
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
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#2563EB",
                textDecoration: "none",
                padding: "0.2rem 0.6rem",
                border: "1px solid #DBEAFE",
                background: "#EFF6FF",
                borderRadius: "999px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Live
            </a>
          )}
        </div>
      </div>

      {proj?.description && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "#4B5563",
            lineHeight: 1.7,
            marginBottom: "0.8rem",
            fontFamily: "'Inter', sans-serif",
          }}
        >
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
                background: "#F3F2EF",
                color: "#52525B",
                border: "1px solid #E7E5E4",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────────────────────────
export default function NotionStyleTemplate({ data = {} }) {
  const [activeTab, setActiveTab] = useState("about");
  const isClient = useIsClient();
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
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];
  const hobbies = Array.isArray(data?.hobbies) ? data.hobbies : [];

  const totalSkills = skillGroups.reduce(
    (acc, g) => acc + (Array.isArray(g?.skills) ? g.skills.length : 0),
    0,
  );

  const tabs = [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        background: "#FAFAF9",
        color: "#191919",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E7E5E4; border-radius: 999px; }

        @keyframes ns-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ns-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ns-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(20px, -15px) scale(1.05); }
        }

        .ns-page {
          animation: ns-fade 300ms ease both;
        }
        .ns-fade-up {
          animation: ns-fadeUp 250ms ease both;
        }

        .ns-blob-1 {
          position: fixed;
          z-index: 0;
          pointer-events: none;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%);
          top: -100px;
          right: -80px;
          animation: ns-blob 26s ease-in-out infinite;
        }
        .ns-blob-2 {
          position: fixed;
          z-index: 0;
          pointer-events: none;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(82,82,91,0.03) 0%, transparent 70%);
          bottom: -100px;
          left: -60px;
          animation: ns-blob 32s ease-in-out infinite reverse;
        }

        .ns-hero-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 900px) {
          .ns-hero-grid { grid-template-columns: 1fr; }
          .ns-model-panel { height: 240px !important; }
        }
        .ns-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .ns-projects-grid { grid-template-columns: 1fr; }
        }
        .ns-two-col {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.2rem;
          align-items: start;
        }
        @media (max-width: 800px) {
          .ns-two-col { grid-template-columns: 1fr; }
        }

        .ns-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: 1px solid #E7E5E4;
          background: #FFFFFF;
          color: #191919;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 150ms ease;
          text-decoration: none;
        }
        .ns-btn:hover { background: #F3F2EF; }
      `}</style>

      {/* Faint ambient blobs — barely visible */}
      <div className="ns-blob-1" />
      <div className="ns-blob-2" />

 {isClient && (
  <div className="ns-page" style={{ position: "relative", zIndex: 1 }}>
          {/* ── Sticky Notion-like top nav ── */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              background: "rgba(250,250,249,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderBottom: "1px solid #E7E5E4",
              padding: "0.75rem 2rem",
            }}
          >
            <div
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.6rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#191919",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {name}
              </span>
              <nav style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.id}
                    label={tab.label}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* ── Main content ── */}
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "3rem 2rem 5rem",
            }}
          >
            {/* ── Hero ── */}
            <div className="ns-hero-grid ns-fade-up" style={{ marginBottom: "3rem" }}>
              <div>
                <h1
                  style={{
                    fontSize: "clamp(2rem, 4vw, 2.9rem)",
                    fontWeight: 700,
                    color: "#191919",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                    marginBottom: "0.5rem",
                  }}
                >
                  {name}
                </h1>
                <p
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#52525B",
                    marginBottom: "1.1rem",
                  }}
                >
                  {title}
                </p>
                {summary && (
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: "#4B5563",
                      lineHeight: 1.8,
                      maxWidth: "560px",
                      marginBottom: "1.3rem",
                    }}
                  >
                    {summary}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {email && (
                    <a href={`mailto:${email}`} className="ns-btn">
                      Email
                    </a>
                  )}
                  {github && (
                    <a
                      href={safeUrl(github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ns-btn"
                    >
                      GitHub
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={safeUrl(linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ns-btn"
                    >
                      LinkedIn
                    </a>
                  )}
                  {website && (
                    <a
                      href={safeUrl(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ns-btn"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>

              {/* 3D floating pages model */}
              <div
                className="ns-model-panel"
                style={{
                  height: "300px",
                  position: "relative",
                }}
              >
                <Card
                  hover={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: 0,
                    overflow: "hidden",
                    background: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0.8rem",
                      left: "1rem",
                      fontSize: "0.62rem",
                      color: "#9CA3AF",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      zIndex: 2,
                    }}
                  >
                    Workspace
                  </div>
                  <div style={{ width: "100%", height: "100%" }}>
                    <PagesModel3D />
                  </div>
                </Card>
              </div>
            </div>

            {/* ── ABOUT ── */}
            {activeTab === "about" && (
              <div className="ns-fade-up">
                <SectionTitle>About</SectionTitle>
                <div className="ns-two-col">
                  <div>
                    {hobbies.length > 0 && (
                      <Card style={{ marginBottom: "1rem" }}>
                        <SectionLabel>Interests</SectionLabel>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {hobbies.map((h, i) => (
                            <SkillPill key={i} skill={h} />
                          ))}
                        </div>
                      </Card>
                    )}
                    {achievements.length > 0 && (
                      <Card>
                        <SectionLabel>Achievements</SectionLabel>
                        {achievements.map((ach, i) => (
                          <div
                            key={i}
                            style={{
                              marginBottom:
                                i < achievements.length - 1 ? "0.9rem" : 0,
                              paddingBottom:
                                i < achievements.length - 1 ? "0.9rem" : 0,
                              borderBottom:
                                i < achievements.length - 1
                                  ? "1px solid #E7E5E4"
                                  : "none",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "0.86rem",
                                fontWeight: 700,
                                color: "#191919",
                                marginBottom: "0.2rem",
                              }}
                            >
                              {ach?.title || ""}
                            </p>
                            {ach?.description && (
                              <p
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#4B5563",
                                  lineHeight: 1.7,
                                }}
                              >
                                {ach.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </Card>
                    )}
                    {hobbies.length === 0 && achievements.length === 0 && (
                      <Card>
                        <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                          Nothing added here yet.
                        </p>
                      </Card>
                    )}
                  </div>

                  <div>
                    <Card>
                      <SectionLabel>Overview</SectionLabel>
                      {[
                        { label: "Skills", val: totalSkills },
                        { label: "Projects", val: projects.length },
                        { label: "Experience", val: experience.length },
                        { label: "Education", val: education.length },
                        { label: "Certifications", val: certifications.length },
                      ].map(({ label, val }) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.45rem 0",
                            borderBottom: "1px solid #F3F2EF",
                            fontSize: "0.8rem",
                          }}
                        >
                          <span style={{ color: "#6B7280" }}>{label}</span>
                          <span style={{ fontWeight: 700, color: "#191919" }}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROJECTS ── */}
            {activeTab === "projects" && (
              <div className="ns-fade-up">
                <SectionTitle>Projects</SectionTitle>
                {projects.length > 0 ? (
                  <div className="ns-projects-grid">
                    {projects.map((proj, i) => (
                      <ProjectCard key={i} proj={proj} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                      No projects added yet.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {activeTab === "experience" && (
              <div className="ns-fade-up">
                <SectionTitle>Experience</SectionTitle>
                <Card style={{ marginBottom: "1.5rem" }}>
                  {experience.length > 0 ? (
                    experience.map((exp, i) => (
                      <TimelineItem
                        key={i}
                        heading={exp?.title || "Role"}
                        sub={exp?.company || ""}
                        period={
                          exp?.startDate
                            ? `${exp.startDate} — ${
                                exp?.current ? "Present" : exp?.endDate || ""
                              }`
                            : undefined
                        }
                        description={exp?.description}
                        isLast={i === experience.length - 1}
                      />
                    ))
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                      No experience added yet.
                    </p>
                  )}
                </Card>

                <SectionTitle>Education</SectionTitle>
                <Card>
                  {education.length > 0 ? (
                    education.map((edu, i) => (
                      <TimelineItem
                        key={i}
                        heading={edu?.degree || "Degree"}
                        sub={edu?.institution || ""}
                        period={
                          edu?.startDate
                            ? `${edu.startDate} — ${
                                edu?.current ? "Present" : edu?.endDate || ""
                              }`
                            : undefined
                        }
                        extra={
                          edu?.score
                            ? `${edu?.scoreType || "Score"}: ${edu.score}${
                                edu?.outOf ? `/${edu.outOf}` : ""
                              }`
                            : undefined
                        }
                        description={edu?.description}
                        isLast={i === education.length - 1}
                      />
                    ))
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                      No education added yet.
                    </p>
                  )}
                </Card>

                {certifications.length > 0 && (
                  <>
                    <div style={{ marginTop: "1.5rem" }}>
                      <SectionTitle>Certifications</SectionTitle>
                    </div>
                    <Card>
                      {certifications.map((cert, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "0.4rem",
                            padding: "0.6rem 0",
                            borderBottom:
                              i < certifications.length - 1
                                ? "1px solid #F3F2EF"
                                : "none",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#191919",
                              }}
                            >
                              {cert?.title || cert?.name || ""}
                            </span>
                            {(cert?.issuer || cert?.organization) && (
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#6B7280",
                                  marginLeft: "0.4rem",
                                }}
                              >
                                — {cert.issuer || cert.organization}
                              </span>
                            )}
                          </div>
                          {(cert?.date || cert?.issueDate) && (
                            <span
                              style={{ fontSize: "0.75rem", color: "#9CA3AF" }}
                            >
                              {cert.date || cert.issueDate}
                            </span>
                          )}
                        </div>
                      ))}
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* ── SKILLS ── */}
            {activeTab === "skills" && (
              <div className="ns-fade-up">
                <SectionTitle>Skills</SectionTitle>
                {skillGroups.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {skillGroups.map((group, gi) => (
                      <Card key={gi}>
                        {group?.category && (
                          <SectionLabel>{group.category}</SectionLabel>
                        )}
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {(Array.isArray(group?.skills)
                            ? group.skills
                            : []
                          ).map((skill, si) => (
                            <SkillPill key={si} skill={skill} />
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                      No skills added yet.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* ── CONTACT ── */}
            {activeTab === "contact" && (
              <div className="ns-fade-up">
                <SectionTitle>Contact</SectionTitle>
                <Card>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <ContactLink label={email} href={email ? `mailto:${email}` : ""} />
                    <ContactLink label={phone} href={phone ? `tel:${phone}` : ""} />
                    <ContactLink label="GitHub" href={github ? safeUrl(github) : ""} />
                    <ContactLink
                      label="LinkedIn"
                      href={linkedin ? safeUrl(linkedin) : ""}
                    />
                    <ContactLink
                      label="Twitter"
                      href={twitter ? safeUrl(twitter) : ""}
                    />
                    <ContactLink
                      label="Portfolio"
                      href={website ? safeUrl(website) : ""}
                    />
                    <ContactLink
                      label="LeetCode"
                      href={leetcode ? safeUrl(leetcode) : ""}
                    />
                    <ContactLink
                      label="HackerRank"
                      href={hackerrank ? safeUrl(hackerrank) : ""}
                    />
                  </div>
                  {!email &&
                    !phone &&
                    !github &&
                    !linkedin &&
                    !twitter &&
                    !website &&
                    !leetcode &&
                    !hackerrank && (
                      <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                        No contact information added yet.
                      </p>
                    )}
                </Card>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              borderTop: "1px solid #E7E5E4",
              background: "#FFFFFF",
              padding: "1rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{name}</span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#D4D4D4",
                letterSpacing: "0.05em",
              }}
            >
              NOTION STYLE · THREE.JS
            </span>
          </div>
        </div>
      )}
    </div>
  );
}