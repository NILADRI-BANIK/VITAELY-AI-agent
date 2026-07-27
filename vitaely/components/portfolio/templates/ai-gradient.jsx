"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Three.js 3D Model
// Floating AI-themed icosahedron with
// morphing geometry, particle field & glow rings
// ─────────────────────────────────────────────
function AIGradientModel3D() {
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

      const width = mountRef.current.clientWidth || 400;
      const height = mountRef.current.clientHeight || 400;

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.background = null;

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Core icosahedron ──
      const icoGeo = new THREE.IcosahedronGeometry(1.3, 1);
      const icoMat = new THREE.MeshPhongMaterial({
        color: 0x7c3aed,
        emissive: 0x3b0764,
        emissiveIntensity: 0.5,
        shininess: 100,
        specular: 0xc4b5fd,
        transparent: true,
        opacity: 0.92,
        flatShading: true,
      });
      const ico = new THREE.Mesh(icoGeo, icoMat);
      scene.add(ico);

      // store original vertex positions for morphing
      const posAttr = icoGeo.attributes.position;
      const originalPositions = new Float32Array(posAttr.array);

      // ── Wireframe shell ──
      const wireGeo = new THREE.IcosahedronGeometry(1.35, 1);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xc4b5fd,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      scene.add(wire);

      // ── Outer glow sphere ──
      const glowGeo = new THREE.SphereGeometry(1.7, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.045,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(glowGeo, glowMat));

      // ── Spinning gradient rings ──
      const ringData = [
        { r: 2.1, tube: 0.012, color: 0x7c3aed, opacity: 0.5, tiltX: 0.4, tiltZ: 0.1, speed: 0.007 },
        { r: 2.5, tube: 0.009, color: 0x06b6d4, opacity: 0.4, tiltX: 1.0, tiltZ: 0.6, speed: -0.005 },
        { r: 1.85, tube: 0.01, color: 0xf0abfc, opacity: 0.35, tiltX: 0.2, tiltZ: 1.2, speed: 0.009 },
      ];
      const rings = ringData.map(({ r, tube, color, opacity, tiltX, tiltZ }) => {
        const rg = new THREE.TorusGeometry(r, tube, 8, 100);
        const rm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
        const mesh = new THREE.Mesh(rg, rm);
        mesh.rotation.x = tiltX;
        mesh.rotation.z = tiltZ;
        scene.add(mesh);
        return mesh;
      });

      // ── Floating particles ──
      const particleCount = 180;
      const pPositions = new Float32Array(particleCount * 3);
      const pSpeeds = [];
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.2 + Math.random() * 1.4;
        pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPositions[i * 3 + 2] = r * Math.cos(phi);
        pSpeeds.push((Math.random() - 0.5) * 0.003);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xc4b5fd,
        size: 0.04,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));

      const purpleLight = new THREE.PointLight(0x7c3aed, 4, 10);
      purpleLight.position.set(3, 3, 3);
      scene.add(purpleLight);

      const cyanLight = new THREE.PointLight(0x06b6d4, 3, 8);
      cyanLight.position.set(-3, -2, 2);
      scene.add(cyanLight);

      const pinkLight = new THREE.PointLight(0xf0abfc, 2, 6);
      pinkLight.position.set(0, -3, -2);
      scene.add(pinkLight);

      // ── Mouse tracking ──
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

        // Smooth camera-follow rotation on main ico
        ico.rotation.x += (mouseY * 0.6 - ico.rotation.x) * 0.04;
        ico.rotation.y += (mouseX * 0.6 - ico.rotation.y) * 0.04;
        ico.rotation.z += 0.003;

        // Vertex morphing — breathing effect
        const pos = icoGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const ox = originalPositions[i * 3];
          const oy = originalPositions[i * 3 + 1];
          const oz = originalPositions[i * 3 + 2];
          const noise = 1 + 0.08 * Math.sin(t * 1.5 + ox * 3 + oy * 2);
          pos.setXYZ(i, ox * noise, oy * noise, oz * noise);
        }
        pos.needsUpdate = true;
        icoGeo.computeVertexNormals();

        wire.rotation.x = ico.rotation.x;
        wire.rotation.y = ico.rotation.y + t * 0.1;
        wire.rotation.z = ico.rotation.z;

        // Rings orbit
        rings.forEach((ring, i) => {
          ring.rotation.y += ringData[i].speed;
          ring.rotation.x += ringData[i].speed * 0.3;
        });

        // Particles drift
        particles.rotation.y = t * 0.06;
        particles.rotation.x = Math.sin(t * 0.2) * 0.2;

        // Light pulse
        purpleLight.intensity = 4 + Math.sin(t * 1.2) * 1;
        cyanLight.intensity = 3 + Math.cos(t * 1.8) * 0.8;

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

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />
  );
}

// ─────────────────────────────────────────────
// Helpers / Sub-components
// ─────────────────────────────────────────────

function GradientText({ children, gradient = "linear-gradient(135deg,#c4b5fd,#67e8f9,#f0abfc)" }) {
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

function Pill({ children, color = "#7c3aed" }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        fontSize: "0.7rem",
        fontWeight: 600,
        padding: "0.18rem 0.65rem",
        borderRadius: "999px",
        marginRight: "0.35rem",
        marginBottom: "0.35rem",
        letterSpacing: "0.025em",
        transition: "background 0.2s",
      }}
    >
      {children}
    </span>
  );
}

function GlassCard({ children, style = {}, hover = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(196,181,253,0.4)" : "rgba(196,181,253,0.12)"}`,
        borderRadius: "18px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        padding: "1.5rem",
        transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(124,58,237,0.18), 0 0 0 1px rgba(196,181,253,0.15)"
          : "0 4px 24px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          fontWeight: 700,
          margin: "0 0 0.4rem",
          letterSpacing: "-0.03em",
        }}
      >
        <GradientText>{children}</GradientText>
      </h2>
      {sub && (
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(6,182,212,0.2))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(196,181,253,0.45)" : "rgba(255,255,255,0.08)"}`,
        color: active ? "#c4b5fd" : "#64748b",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "0.82rem",
        fontWeight: active ? 600 : 400,
        padding: "0.45rem 1.2rem",
        borderRadius: "999px",
        cursor: "pointer",
        transition: "all 0.2s",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

function SkillChip({ skill, index }) {
  const colors = ["#7c3aed", "#0891b2", "#be185d", "#047857", "#b45309", "#9333ea"];
  const c = colors[index % colors.length];
  return (
    <div
      style={{
        background: `${c}18`,
        border: `1px solid ${c}40`,
        color: "#e2e8f0",
        fontSize: "0.78rem",
        fontWeight: 500,
        padding: "0.4rem 0.9rem",
        borderRadius: "10px",
        transition: "all 0.2s",
        cursor: "default",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${c}35`;
        e.currentTarget.style.borderColor = `${c}80`;
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${c}18`;
        e.currentTarget.style.borderColor = `${c}40`;
        e.currentTarget.style.color = "#e2e8f0";
      }}
    >
      {skill}
    </div>
  );
}

function ContactChip({ icon, text, href }) {
  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "rgba(196,181,253,0.08)",
        border: "1px solid rgba(196,181,253,0.2)",
        color: "#c4b5fd",
        fontSize: "0.75rem",
        fontWeight: 500,
        padding: "0.3rem 0.85rem",
        borderRadius: "999px",
        transition: "all 0.2s",
        cursor: href ? "pointer" : "default",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        if (href) {
          e.currentTarget.style.background = "rgba(196,181,253,0.18)";
          e.currentTarget.style.borderColor = "rgba(196,181,253,0.45)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(196,181,253,0.08)";
        e.currentTarget.style.borderColor = "rgba(196,181,253,0.2)";
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto") ? undefined : "_blank"}
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

// ─────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────
export default function AiGradientTemplate({ data }) {
  const [activeTab, setActiveTab] = useState("about");

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

  const tabs = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "education", label: "Education" },
  ];

  const pillColors = ["#7c3aed", "#0891b2", "#be185d", "#047857", "#b45309", "#9333ea", "#0369a1", "#c2410c"];
  const getPC = (i) => pillColors[i % pillColors.length];

  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        background: "#050816",
        minHeight: "100vh",
        color: "#e2e8f0",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050816; }
        ::-webkit-scrollbar-thumb { background: #3b0764; border-radius: 2px; }
      `}</style>

      {/* ── Background mesh gradients ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Blob 1 — purple */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "55vw",
            height: "55vw",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        {/* Blob 2 — cyan */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-8%",
            width: "45vw",
            height: "45vw",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(6,182,212,0.16) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        {/* Blob 3 — pink */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "35%",
            width: "35vw",
            height: "35vw",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(240,171,252,0.1) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
        />
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(196,181,253,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "5rem 6vw 3rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 440px",
            gap: "3rem",
            alignItems: "center",
            maxWidth: "1300px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Left: text content */}
          <div>
            {/* Eyebrow label */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.35)",
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
                  background: "#a78bfa",
                  animation: "aiPulse 2s ease-in-out infinite",
                  display: "inline-block",
                }}
              />
              <style>{`
                @keyframes aiPulse {
                  0%,100%{opacity:1;transform:scale(1)}
                  50%{opacity:0.4;transform:scale(1.4)}
                }
                @keyframes aiFloat {
                  0%,100%{transform:translateY(0)}
                  50%{transform:translateY(-10px)}
                }
                @keyframes aiFadeUp {
                  from{opacity:0;transform:translateY(24px)}
                  to{opacity:1;transform:translateY(0)}
                }
              `}</style>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#a78bfa",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                AI Portfolio
              </span>
            </div>

            {/* Name */}
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
                margin: "0 0 0.6rem",
                animation: "aiFadeUp 0.7s ease both",
              }}
            >
              <GradientText gradient="linear-gradient(135deg, #f1f5f9 0%, #c4b5fd 50%, #67e8f9 100%)">
                {name}
              </GradientText>
            </h1>

            {/* Title */}
            <div
              style={{
                fontSize: "clamp(1rem, 2vw, 1.35rem)",
                fontWeight: 500,
                color: "#94a3b8",
                marginBottom: "1.5rem",
                animation: "aiFadeUp 0.7s 0.1s ease both",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>

            {/* Summary */}
            {summary && (
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  color: "#64748b",
                  maxWidth: "560px",
                  margin: "0 0 2rem",
                  animation: "aiFadeUp 0.7s 0.2s ease both",
                }}
              >
                {summary}
              </p>
            )}

            {/* Contact chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                animation: "aiFadeUp 0.7s 0.3s ease both",
              }}
            >
              {email && (
                <ContactChip icon="✉" text={email} href={`mailto:${email}`} />
              )}
              {phone && <ContactChip icon="☎" text={phone} />}
              {location && <ContactChip icon="⌖" text={location} />}
              {github && (
                <ContactChip
                  icon="⌥"
                  text="GitHub"
                  href={github.startsWith("http") ? github : `https://${github}`}
                />
              )}
              {linkedin && (
                <ContactChip
                  icon="⊞"
                  text="LinkedIn"
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                />
              )}
              {website && (
                <ContactChip
                  icon="↗"
                  text="Website"
                  href={website.startsWith("http") ? website : `https://${website}`}
                />
              )}
            </div>
          </div>

          {/* Right: 3D Model */}
          <div
            style={{
              position: "relative",
              height: "440px",
              animation: "aiFloat 5s ease-in-out infinite",
            }}
          >
            {/* Glow behind model */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, transparent 70%)",
                filter: "blur(30px)",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
              <AIGradientModel3D />
            </div>
            {/* Corner label */}
            <div
              style={{
                position: "absolute",
                bottom: "1rem",
                right: "1rem",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                color: "rgba(196,181,253,0.4)",
                letterSpacing: "0.12em",
                zIndex: 2,
              }}
            >
              3D.INTERACTIVE
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
            color: "rgba(196,181,253,0.3)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>Scroll</span>
          <div
            style={{
              width: "1px",
              height: "32px",
              background:
                "linear-gradient(to bottom, rgba(196,181,253,0.3), transparent)",
            }}
          />
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 6vw 6rem",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "3rem",
            padding: "0.5rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(196,181,253,0.1)",
            borderRadius: "999px",
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => (
            <TabBtn
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* ── ABOUT ── */}
        {activeTab === "about" && (
          <div>
            {/* Skills grid */}
            {skills.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <SectionTitle sub="Technologies & tools I work with">
                  Skills
                </SectionTitle>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                  }}
                >
                  {skills.map((skill, i) => (
                    <SkillChip key={i} skill={skill} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <SectionTitle sub="Credentials & achievements">
                  Certifications
                </SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {certifications.map((cert, i) => (
                    <GlassCard key={i}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: "#e2e8f0",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {cert.name || cert.title}
                      </div>
                      {cert.issuer && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#a78bfa",
                            fontWeight: 500,
                          }}
                        >
                          {cert.issuer}
                          {cert.year || cert.date ? (
                            <span style={{ color: "#475569" }}>
                              {" "}
                              · {cert.year || cert.date}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeTab === "experience" && (
          <div>
            <SectionTitle sub="Where I've worked and what I've built">
              Experience
            </SectionTitle>
            {experience.length > 0 ? (
              <div style={{ position: "relative" }}>
                {/* Timeline line */}
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "0",
                    bottom: "0",
                    width: "1px",
                    background:
                      "linear-gradient(to bottom, #7c3aed, rgba(124,58,237,0.1))",
                    marginLeft: "0.55rem",
                  }}
                />
                <div style={{ paddingLeft: "2.5rem" }}>
                  {experience.map((exp, i) => (
                    <div key={i} style={{ position: "relative", marginBottom: "2rem" }}>
                      {/* Timeline dot */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-2.1rem",
                          top: "0.4rem",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #7c3aed, #06b6d4)",
                          border: "2px solid #050816",
                          boxShadow: "0 0 8px rgba(124,58,237,0.6)",
                        }}
                      />
                      <GlassCard>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "#f1f5f9",
                                marginBottom: "0.15rem",
                              }}
                            >
                              {exp.title || exp.role}
                            </div>
                            <div
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                              }}
                            >
                              <GradientText gradient="linear-gradient(90deg,#a78bfa,#67e8f9)">
                                {exp.company}
                              </GradientText>
                              {exp.location && (
                                <span style={{ color: "#475569", fontWeight: 400 }}>
                                  {" "}
                                  · {exp.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            style={{
                              background: "rgba(124,58,237,0.15)",
                              border: "1px solid rgba(124,58,237,0.3)",
                              color: "#a78bfa",
                              fontSize: "0.7rem",
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: "0.2rem 0.7rem",
                              borderRadius: "6px",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {exp.startDate || exp.start}
                            {exp.endDate || exp.end
                              ? ` → ${exp.endDate || exp.end}`
                              : " → Present"}
                          </span>
                        </div>
                        {exp.description && (
                          <p
                            style={{
                              fontSize: "0.82rem",
                              lineHeight: 1.78,
                              color: "#94a3b8",
                              margin: "0 0 0.6rem",
                            }}
                          >
                            {exp.description}
                          </p>
                        )}
                        {Array.isArray(exp.responsibilities) &&
                          exp.responsibilities.length > 0 && (
                            <ul style={{ margin: "0 0 0.5rem 1.1rem", padding: 0 }}>
                              {exp.responsibilities.map((r, ri) => (
                                <li
                                  key={ri}
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#94a3b8",
                                    lineHeight: 1.75,
                                    marginBottom: "0.2rem",
                                  }}
                                >
                                  {r}
                                </li>
                              ))}
                            </ul>
                          )}
                        {Array.isArray(exp.achievements) &&
                          exp.achievements.length > 0 && (
                            <ul style={{ margin: "0 0 0.5rem 1.1rem", padding: 0 }}>
                              {exp.achievements.map((a, ai) => (
                                <li
                                  key={ai}
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#94a3b8",
                                    lineHeight: 1.75,
                                    marginBottom: "0.2rem",
                                  }}
                                >
                                  {a}
                                </li>
                              ))}
                            </ul>
                          )}
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: "#475569", fontSize: "0.85rem" }}>
                No experience added yet.
              </p>
            )}
          </div>
        )}

        {/* ── PROJECTS ── */}
        {activeTab === "projects" && (
          <div>
            <SectionTitle sub="Things I've designed, built & shipped">
              Projects
            </SectionTitle>
            {projects.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
                  gap: "1.2rem",
                }}
              >
                {projects.map((proj, i) => (
                  <GlassCard key={i} style={{ display: "flex", flexDirection: "column" }}>
                    {/* Project header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.6rem",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#f1f5f9",
                          lineHeight: 1.3,
                        }}
                      >
                        {proj.name || proj.title}
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                        {(proj.liveUrl || proj.demo) && (
                          <a
                            href={proj.liveUrl || proj.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))",
                              border: "1px solid rgba(196,181,253,0.3)",
                              color: "#c4b5fd",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "6px",
                              textDecoration: "none",
                              transition: "opacity 0.2s",
                            }}
                          >
                            ↗ Live
                          </a>
                        )}
                        {(proj.githubUrl || proj.github) && (
                          <a
                            href={proj.githubUrl || proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#94a3b8",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "6px",
                              textDecoration: "none",
                              transition: "opacity 0.2s",
                            }}
                          >
                            Code
                          </a>
                        )}
                      </div>
                    </div>

                    {proj.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          lineHeight: 1.75,
                          color: "#64748b",
                          margin: "0 0 1rem",
                          flex: 1,
                        }}
                      >
                        {proj.description}
                      </p>
                    )}

                    <div>
                      {Array.isArray(proj.technologies) &&
                        proj.technologies.map((tech, ti) => (
                          <Pill key={ti} color={getPC(ti)}>
                            {tech}
                          </Pill>
                        ))}
                      {Array.isArray(proj.tech) &&
                        proj.tech.map((tech, ti) => (
                          <Pill key={ti} color={getPC(ti)}>
                            {tech}
                          </Pill>
                        ))}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <p style={{ color: "#475569", fontSize: "0.85rem" }}>
                No projects added yet.
              </p>
            )}
          </div>
        )}

        {/* ── EDUCATION ── */}
        {activeTab === "education" && (
          <div>
            <SectionTitle sub="Academic background & learning journey">
              Education
            </SectionTitle>
            {education.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "1.2rem",
                  marginBottom: "2.5rem",
                }}
              >
                {education.map((edu, i) => (
                  <GlassCard key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "0.4rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "#f1f5f9",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {edu.degree || edu.field}
                        </div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                          <GradientText gradient="linear-gradient(90deg,#a78bfa,#67e8f9)">
                            {edu.school || edu.institution}
                          </GradientText>
                        </div>
                      </div>
                      <span
                        style={{
                          background: "rgba(124,58,237,0.12)",
                          border: "1px solid rgba(124,58,237,0.25)",
                          color: "#a78bfa",
                          fontSize: "0.68rem",
                          fontFamily: "'JetBrains Mono', monospace",
                          padding: "0.18rem 0.55rem",
                          borderRadius: "6px",
                          fontWeight: 500,
                        }}
                      >
                        {edu.startDate || edu.start}
                        {edu.endDate || edu.end
                          ? ` – ${edu.endDate || edu.end}`
                          : ""}
                      </span>
                    </div>
                    {edu.gpa && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#34d399",
                          fontWeight: 600,
                          marginBottom: "0.4rem",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        GPA · {edu.gpa}
                      </div>
                    )}
                    {edu.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          lineHeight: 1.75,
                          color: "#64748b",
                          margin: 0,
                        }}
                      >
                        {edu.description}
                      </p>
                    )}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <p style={{ color: "#475569", fontSize: "0.85rem" }}>
                No education added yet.
              </p>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <SectionTitle sub="Professional credentials">
                  Certifications
                </SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {certifications.map((cert, i) => (
                    <GlassCard key={i}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: "#e2e8f0",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {cert.name || cert.title}
                      </div>
                      {cert.issuer && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#a78bfa",
                            fontWeight: 500,
                          }}
                        >
                          {cert.issuer}
                          {cert.year || cert.date ? (
                            <span style={{ color: "#475569" }}>
                              {" "}· {cert.year || cert.date}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(196,181,253,0.08)",
          padding: "1.5rem 6vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          background: "rgba(5,8,22,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          <GradientText gradient="linear-gradient(90deg,#c4b5fd,#67e8f9)">
            {name}
          </GradientText>
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            color: "rgba(196,181,253,0.25)",
            letterSpacing: "0.1em",
          }}
        >
          AI GRADIENT TEMPLATE · THREE.JS
        </span>
      </footer>
    </div>
  );
}