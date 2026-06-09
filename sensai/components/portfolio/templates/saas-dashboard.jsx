"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Three.js 3D Model — Floating Torus Knot
// Dashboard-style glowing analytical 3D object
// ─────────────────────────────────────────────
function DashboardModel3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      let THREE;
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (!mounted || !mountRef.current) return;

      const width = mountRef.current.clientWidth || 280;
      const height = mountRef.current.clientHeight || 280;

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.background = null;

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 5);

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Main Torus Knot ──
      const torusGeo = new THREE.TorusKnotGeometry(1.0, 0.32, 128, 20, 2, 3);
      const torusMat = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        emissive: 0x312e81,
        shininess: 120,
        specular: 0xa5b4fc,
      });
      const torusKnot = new THREE.Mesh(torusGeo, torusMat);
      scene.add(torusKnot);

      // ── Wireframe overlay on torus ──
      const wireGeo = new THREE.TorusKnotGeometry(1.02, 0.33, 64, 12, 2, 3);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      const wireKnot = new THREE.Mesh(wireGeo, wireMat);
      scene.add(wireKnot);

      // ── Orbiting data spheres ──
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      const sphereData = [
        { color: 0x22d3ee, size: 0.12, r: 1.9, speed: 0.8, phase: 0 },
        { color: 0x34d399, size: 0.09, r: 2.2, speed: -0.6, phase: Math.PI * 0.66 },
        { color: 0xf472b6, size: 0.11, r: 2.0, speed: 1.1, phase: Math.PI * 1.33 },
        { color: 0xfbbf24, size: 0.08, r: 2.4, speed: -0.9, phase: Math.PI * 0.33 },
        { color: 0xa78bfa, size: 0.10, r: 1.8, speed: 0.7, phase: Math.PI * 1.0 },
      ];

      const orbitSpheres = sphereData.map(({ color, size, r, phase }) => {
        const sg = new THREE.SphereGeometry(size, 16, 16);
        const sm = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.6,
          shininess: 80,
        });
        const sphere = new THREE.Mesh(sg, sm);
        sphere.position.set(Math.cos(phase) * r, Math.sin(phase) * 0.4, Math.sin(phase) * r);
        orbitGroup.add(sphere);
        return { mesh: sphere, r, phase, ...sphereData.find((d) => d.color === color) };
      });

      // ── Ring around torus knot ──
      const ringGeo = new THREE.TorusGeometry(2.5, 0.015, 8, 120);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      scene.add(ring);

      const ring2Geo = new THREE.TorusGeometry(2.1, 0.012, 8, 100);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.25,
      });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = Math.PI / 3;
      ring2.rotation.z = Math.PI / 6;
      scene.add(ring2);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));

      const purpleLight = new THREE.PointLight(0x6366f1, 3, 8);
      purpleLight.position.set(2, 2, 2);
      scene.add(purpleLight);

      const cyanLight = new THREE.PointLight(0x22d3ee, 2, 6);
      cyanLight.position.set(-2, -1, 2);
      scene.add(cyanLight);

      const pinkLight = new THREE.PointLight(0xf472b6, 1.5, 5);
      pinkLight.position.set(0, -3, -2);
      scene.add(pinkLight);

      // ── Mouse ──
      let mouseX = 0;
      let mouseY = 0;
      const onMouseMove = (e) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouseMove);

      // ── Animation ──
      let t = 0;
      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.008;

        torusKnot.rotation.x += (mouseY * 0.5 - torusKnot.rotation.x) * 0.04;
        torusKnot.rotation.y += (mouseX * 0.5 - torusKnot.rotation.y) * 0.04;
        torusKnot.rotation.z += 0.004;

        wireKnot.rotation.x = torusKnot.rotation.x;
        wireKnot.rotation.y = torusKnot.rotation.y;
        wireKnot.rotation.z = torusKnot.rotation.z;

        orbitGroup.rotation.y = t * 0.4;
        orbitGroup.rotation.x = Math.sin(t * 0.3) * 0.3;

        orbitSpheres.forEach(({ mesh, r, phase, speed }, i) => {
          const angle = t * speed + phase;
          mesh.position.x = Math.cos(angle) * r;
          mesh.position.z = Math.sin(angle) * r;
          mesh.position.y = Math.sin(t * 0.5 + i) * 0.5;
        });

        ring.rotation.z += 0.003;
        ring2.rotation.y += 0.005;

        purpleLight.intensity = 3 + Math.sin(t * 1.5) * 0.8;
        cyanLight.intensity = 2 + Math.cos(t * 2) * 0.5;

        renderer.render(scene, camera);
      }
      animate();

      // ── Resize ──
      const onResize = () => {
        if (!mountRef.current || !mounted) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
      };
    }

    const cleanup = init();

    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (
          mountRef.current &&
          rendererRef.current.domElement &&
          mountRef.current.contains(rendererRef.current.domElement)
        ) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      cleanup.then?.((fn) => fn?.());
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        width: "100%",
        padding: "0.55rem 0.9rem",
        background: active ? "rgba(99,102,241,0.18)" : "transparent",
        border: "none",
        borderLeft: active ? "3px solid #6366f1" : "3px solid transparent",
        borderRadius: "0 6px 6px 0",
        color: active ? "#a5b4fc" : "#64748b",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.82rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
        letterSpacing: "0.01em",
      }}
    >
      <span style={{ fontSize: "1rem", opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div
      style={{
        background: "rgba(30,41,59,0.7)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "12px",
        padding: "1.1rem 1.2rem",
        backdropFilter: "blur(8px)",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span
          style={{
            fontSize: "1.1rem",
            background: `${color}22`,
            border: `1px solid ${color}44`,
            borderRadius: "6px",
            padding: "0.15rem 0.35rem",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f1f5f9", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "0.7rem", color: "#34d399", marginTop: "0.3rem", fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SkillBar({ skill, level }) {
  const pct = typeof level === "number" ? level : 75;
  return (
    <div style={{ marginBottom: "0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>{skill}</span>
        <span style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: "4px", background: "rgba(99,102,241,0.15)", borderRadius: "4px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #6366f1, #22d3ee)",
            borderRadius: "4px",
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function Badge({ children, color = "#6366f1" }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
        fontSize: "0.68rem",
        fontWeight: 600,
        padding: "0.15rem 0.55rem",
        borderRadius: "999px",
        marginRight: "0.35rem",
        marginBottom: "0.35rem",
        letterSpacing: "0.03em",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(30,41,59,0.6)",
        border: "1px solid rgba(99,102,241,0.15)",
        borderRadius: "14px",
        padding: "1.4rem",
        backdropFilter: "blur(10px)",
        marginBottom: "1rem",
        transition: "border-color 0.2s, transform 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        marginBottom: "1.2rem",
        paddingBottom: "0.8rem",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
      }}
    >
      <span style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "0.95rem", fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </span>
      {count !== undefined && (
        <span
          style={{
            background: "rgba(99,102,241,0.25)",
            color: "#a5b4fc",
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "0.1rem 0.45rem",
            borderRadius: "999px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────
export default function SaasDashboardTemplate({ data }) {
  const [activeNav, setActiveNav] = useState("overview");

  if (!data) return null;

  const hero = data?.hero || {};
  const contact = data?.contact || {};
  const name = hero.name || "Your Name";
  const title = hero.title || "Your Title";
  const summary = hero.summary || hero.tagline || "";
  const email = contact.email || "";
  const phone = contact.phone || "";
  const linkedin = contact.linkedin || "";
  const github = contact.github || "";
  const website = contact.portfolioUrl || "";
  const location = "";
  const skills = Array.isArray(data?.skills)
    ? data.skills.flatMap((g) => g.skills || [])
    : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const certifications = Array.isArray(data?.certifications) ? data.certifications : [];

  const navItems = [
    { id: "overview", icon: "⬡", label: "Overview" },
    { id: "experience", icon: "◈", label: "Experience" },
    { id: "projects", icon: "◉", label: "Projects" },
    { id: "education", icon: "◎", label: "Education" },
    { id: "skills", icon: "◆", label: "Skills" },
  ];

  // Assign skill levels deterministically
  const skillLevels = [95, 90, 88, 85, 82, 80, 78, 75, 72, 70, 68, 65];
  const getLevel = (i) => skillLevels[i % skillLevels.length];

  const tagColors = ["#6366f1", "#22d3ee", "#34d399", "#f472b6", "#fbbf24", "#a78bfa"];
  const getColor = (i) => tagColors[i % tagColors.length];

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#0b1120",
        minHeight: "100vh",
        color: "#e2e8f0",
        display: "flex",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0b1120; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

        .saas-link {
          color: #a5b4fc;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .saas-link:hover { color: #6366f1; }

        .saas-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.28rem 0.7rem;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
          margin-right: 0.4rem;
        }
        .saas-btn:hover {
          background: rgba(99,102,241,0.3);
          border-color: rgba(99,102,241,0.6);
          color: #c7d2fe;
        }
      `}</style>

      {/* ── LEFT SIDEBAR ── */}
      <aside
        style={{
          width: "220px",
          minWidth: "220px",
          background: "rgba(15,23,42,0.95)",
          borderRight: "1px solid rgba(99,102,241,0.12)",
          display: "flex",
          flexDirection: "column",
          padding: "0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            padding: "1.4rem 1rem 1rem",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.3rem",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: "#f1f5f9",
                  lineHeight: 1.2,
                  maxWidth: "140px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#64748b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "140px",
                }}
              >
                {title}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "0.8rem 0.3rem", flex: 1 }}>
          <div
            style={{
              fontSize: "0.6rem",
              color: "#334155",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0 0.7rem",
              marginBottom: "0.4rem",
            }}
          >
            Navigation
          </div>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
            />
          ))}
        </nav>

        {/* Contact links */}
        <div
          style={{
            padding: "0.8rem",
            borderTop: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              color: "#334155",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Contact
          </div>
          {email && (
            <a href={`mailto:${email}`} className="saas-link" style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ✉ {email}
            </a>
          )}
          {phone && (
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.3rem" }}>
              ☎ {phone}
            </div>
          )}
          {location && (
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.3rem" }}>
              ⌖ {location}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
            {github && (
              <a href={github.startsWith("http") ? github : `https://${github}`} target="_blank" rel="noopener noreferrer" className="saas-btn">
                GitHub
              </a>
            )}
            {linkedin && (
              <a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="saas-btn">
                LinkedIn
              </a>
            )}
            {website && (
              <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="saas-btn">
                Website
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2rem 2rem 3rem",
          minWidth: 0,
        }}
      >
        {/* ── OVERVIEW ── */}
        {activeNav === "overview" && (
          <div>
            {/* Top header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 280px",
                gap: "1.5rem",
                marginBottom: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* Profile block */}
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#6366f1",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  ◈ Portfolio Dashboard
                </div>
                <h1
                  style={{
                    fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: "0 0 0.3rem",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {name}
                </h1>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#a5b4fc",
                    fontWeight: 500,
                    marginBottom: "1rem",
                  }}
                >
                  {title}
                </div>
                {summary && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.75,
                      color: "#94a3b8",
                      maxWidth: "600px",
                      margin: 0,
                    }}
                  >
                    {summary}
                  </p>
                )}
              </div>

              {/* 3D Model panel */}
              <div
                style={{
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  height: "280px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "0.6rem",
                    left: "0.8rem",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }} />
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#34d399",
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                    }}
                  >
                    3D.LIVE
                  </span>
                </div>
                <div style={{ width: "100%", height: "100%", zIndex: 1, position: "relative" }}>
                  <DashboardModel3D />
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <StatCard label="Skills" value={skills.length} icon="◆" color="#6366f1" sub="Technologies" />
              <StatCard label="Projects" value={projects.length} icon="◉" color="#22d3ee" sub="Built & shipped" />
              <StatCard label="Experience" value={experience.length} icon="◈" color="#34d399" sub="Roles held" />
              <StatCard label="Education" value={education.length} icon="◎" color="#f472b6" sub="Degrees" />
            </div>

            {/* Skills preview + Recent Experience */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Top skills */}
              {skills.length > 0 && (
                <Card>
                  <SectionHeader title="Top Skills" count={skills.slice(0, 8).length} />
                  {skills.slice(0, 8).map((skill, i) => (
                    <SkillBar key={i} skill={skill} level={getLevel(i)} />
                  ))}
                </Card>
              )}

              {/* Recent experience */}
              {experience.length > 0 && (
                <Card>
                  <SectionHeader title="Recent Experience" count={experience.slice(0, 3).length} />
                  {experience.slice(0, 3).map((exp, i) => (
                    <div
                      key={i}
                      style={{
                        paddingBottom: "0.8rem",
                        marginBottom: "0.8rem",
                        borderBottom: i < Math.min(experience.length, 3) - 1 ? "1px solid rgba(99,102,241,0.1)" : "none",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#e2e8f0", marginBottom: "0.15rem" }}>
                        {exp.title || exp.role}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 500, marginBottom: "0.15rem" }}>
                        {exp.company}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#475569", fontFamily: "'DM Mono', monospace" }}>
                        {exp.startDate || exp.start}
                        {exp.endDate || exp.end ? ` → ${exp.endDate || exp.end}` : " → Present"}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeNav === "experience" && (
          <div>
            <SectionHeader title="Work Experience" count={experience.length} />
            {experience.length > 0 ? (
              experience.map((exp, i) => (
                <Card key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", marginBottom: "0.2rem" }}>
                        {exp.title || exp.role}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 600 }}>
                        {exp.company}
                        {exp.location ? (
                          <span style={{ color: "#475569", fontWeight: 400 }}> · {exp.location}</span>
                        ) : null}
                      </div>
                    </div>
                    <span
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#a5b4fc",
                        fontSize: "0.7rem",
                        fontFamily: "'DM Mono', monospace",
                        padding: "0.2rem 0.7rem",
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {exp.startDate || exp.start}
                      {exp.endDate || exp.end ? ` → ${exp.endDate || exp.end}` : " → Present"}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#94a3b8", margin: "0 0 0.6rem" }}>
                      {exp.description}
                    </p>
                  )}
                  {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 && (
                    <ul style={{ margin: "0 0 0.5rem 1rem", padding: 0 }}>
                      {exp.responsibilities.map((r, ri) => (
                        <li key={ri} style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "0.2rem" }}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                    <ul style={{ margin: "0 0 0.5rem 1rem", padding: 0 }}>
                      {exp.achievements.map((a, ai) => (
                        <li key={ai} style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "0.2rem" }}>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))
            ) : (
              <div style={{ color: "#475569", fontSize: "0.85rem" }}>No experience added yet.</div>
            )}
          </div>
        )}

        {/* ── PROJECTS ── */}
        {activeNav === "projects" && (
          <div>
            <SectionHeader title="Projects" count={projects.length} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {projects.length > 0 ? (
                projects.map((proj, i) => (
                  <Card key={i} style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9" }}>
                        {proj.name || proj.title}
                      </div>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        {(proj.liveUrl || proj.demo) && (
                          <a href={proj.liveUrl || proj.demo} target="_blank" rel="noopener noreferrer" className="saas-btn">
                            ↗ Live
                          </a>
                        )}
                        {(proj.githubUrl || proj.github) && (
                          <a href={proj.githubUrl || proj.github} target="_blank" rel="noopener noreferrer" className="saas-btn">
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.description && (
                      <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "#94a3b8", margin: "0 0 0.8rem" }}>
                        {proj.description}
                      </p>
                    )}
                    <div>
                      {Array.isArray(proj.technologies) &&
                        proj.technologies.map((tech, ti) => (
                          <Badge key={ti} color={getColor(ti)}>{tech}</Badge>
                        ))}
                      {Array.isArray(proj.tech) &&
                        proj.tech.map((tech, ti) => (
                          <Badge key={ti} color={getColor(ti)}>{tech}</Badge>
                        ))}
                    </div>
                  </Card>
                ))
              ) : (
                <div style={{ color: "#475569", fontSize: "0.85rem" }}>No projects added yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ── EDUCATION ── */}
        {activeNav === "education" && (
          <div>
            <SectionHeader title="Education" count={education.length} />
            {education.length > 0 ? (
              education.map((edu, i) => (
                <Card key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", marginBottom: "0.15rem" }}>
                        {edu.degree || edu.field}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 600 }}>
                        {edu.school || edu.institution}
                      </div>
                    </div>
                    <span
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#a5b4fc",
                        fontSize: "0.7rem",
                        fontFamily: "'DM Mono', monospace",
                        padding: "0.2rem 0.7rem",
                        borderRadius: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {edu.startDate || edu.start}
                      {edu.endDate || edu.end ? ` → ${edu.endDate || edu.end}` : ""}
                    </span>
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600, marginBottom: "0.4rem" }}>
                      GPA: {edu.gpa}
                    </div>
                  )}
                  {edu.description && (
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#94a3b8", margin: 0 }}>
                      {edu.description}
                    </p>
                  )}
                </Card>
              ))
            ) : (
              <div style={{ color: "#475569", fontSize: "0.85rem" }}>No education added yet.</div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <SectionHeader title="Certifications" count={certifications.length} />
                {certifications.map((cert, i) => (
                  <Card key={i}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f1f5f9", marginBottom: "0.2rem" }}>
                      {cert.name || cert.title}
                    </div>
                    {cert.issuer && (
                      <div style={{ fontSize: "0.78rem", color: "#6366f1", fontWeight: 500 }}>
                        {cert.issuer}
                        {cert.year || cert.date ? (
                          <span style={{ color: "#475569" }}> · {cert.year || cert.date}</span>
                        ) : null}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeNav === "skills" && (
          <div>
            <SectionHeader title="Skills & Technologies" count={skills.length} />
            {skills.length > 0 ? (
              <>
                {/* Skill bars */}
                <Card>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0 2rem",
                    }}
                  >
                    {skills.map((skill, i) => (
                      <SkillBar key={i} skill={skill} level={getLevel(i)} />
                    ))}
                  </div>
                </Card>

                {/* Badge cloud */}
                <Card>
                  <SectionHeader title="All Technologies" />
                  <div>
                    {skills.map((skill, i) => (
                      <Badge key={i} color={getColor(i)}>{skill}</Badge>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <div style={{ color: "#475569", fontSize: "0.85rem" }}>No skills added yet.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}