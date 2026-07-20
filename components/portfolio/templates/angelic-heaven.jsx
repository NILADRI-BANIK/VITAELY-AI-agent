"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Three.js 3D Model — Angel Wings centerpiece
// Large glowing wings with slow breathing motion
// ─────────────────────────────────────────────
function AngelWingsModel3D() {
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
      camera.position.set(0, 0.2, 6);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Wing group (built from feather-like curved planes) ──
      const wingsGroup = new THREE.Group();
      scene.add(wingsGroup);

      function buildWing(side) {
        const wing = new THREE.Group();
        const featherRows = 7;
        const featherCols = 5;

        for (let r = 0; r < featherRows; r++) {
          const rowSpread = 1 - r / featherRows;
          const rowLength = 1.9 - r * 0.16;
          const rowY = r * 0.34;

          for (let c = 0; c < featherCols - Math.floor(r / 3); c++) {
            const colCount = featherCols - Math.floor(r / 3);
            const t = colCount > 1 ? c / (colCount - 1) : 0.5;
            const angle = (t - 0.5) * 1.6 * rowSpread + r * 0.09;

            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.quadraticCurveTo(rowLength * 0.35, 0.14, rowLength, 0.04);
            shape.quadraticCurveTo(rowLength * 0.55, -0.1, 0, 0);

            const geo = new THREE.ShapeGeometry(shape, 8);
            const mat = new THREE.MeshBasicMaterial({
              color: 0xfff7e0,
              transparent: true,
              opacity: 0.22 - r * 0.015,
              side: THREE.DoubleSide,
            });
            const feather = new THREE.Mesh(geo, mat);

            feather.position.set(
              side * Math.cos(angle) * (0.3 + r * 0.05),
              rowY,
              Math.sin(angle) * 0.5 - r * 0.12,
            );
            feather.rotation.z = side * (angle * 0.6);
            feather.rotation.y = side * 0.3;
            wing.add(feather);

            // outline stroke for feather definition
            const edgeGeo = new THREE.EdgesGeometry(geo);
            const edgeMat = new THREE.LineBasicMaterial({
              color: 0xd4af37,
              transparent: true,
              opacity: 0.35,
            });
            const edge = new THREE.LineSegments(edgeGeo, edgeMat);
            edge.position.copy(feather.position);
            edge.rotation.copy(feather.rotation);
            wing.add(edge);
          }
        }

        // Soft glow spine down the wing
        const spineGeo = new THREE.PlaneGeometry(0.06, 2.6);
        const spineMat = new THREE.MeshBasicMaterial({
          color: 0xffe9a8,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        });
        const spine = new THREE.Mesh(spineGeo, spineMat);
        spine.position.set(side * 0.15, 1.1, 0.1);
        spine.rotation.z = side * 0.35;
        wing.add(spine);

        wing.position.x = side * 0.25;
        return wing;
      }

      const leftWing = buildWing(-1);
      const rightWing = buildWing(1);
      wingsGroup.add(leftWing, rightWing);
      wingsGroup.position.y = -0.6;

      // ── Halo ring above ──
      const haloGroup = new THREE.Group();
      const haloGeo = new THREE.TorusGeometry(0.85, 0.025, 12, 64);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xf6d365,
        transparent: true,
        opacity: 0.85,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2.1;
      haloGroup.add(halo);

      const haloGlowGeo = new THREE.TorusGeometry(0.85, 0.09, 12, 64);
      const haloGlowMat = new THREE.MeshBasicMaterial({
        color: 0xfff7d6,
        transparent: true,
        opacity: 0.15,
      });
      const haloGlow = new THREE.Mesh(haloGlowGeo, haloGlowMat);
      haloGlow.rotation.x = Math.PI / 2.1;
      haloGroup.add(haloGlow);

      haloGroup.position.y = 2.5;
      scene.add(haloGroup);

      // ── Floating sparkle particles (gold dust) ──
      const pCount = 140;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 7;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xf6d365,
        size: 0.028,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // Soft feather drift particles (a few larger ones)
      const featherDriftCount = 10;
      const drift = [];
      for (let i = 0; i < featherDriftCount; i++) {
        const fGeo = new THREE.PlaneGeometry(0.12, 0.28);
        const fMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        });
        const f = new THREE.Mesh(fGeo, fMat);
        f.position.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 2,
        );
        f.userData = {
          speed: 0.15 + Math.random() * 0.2,
          sway: Math.random() * Math.PI * 2,
        };
        drift.push(f);
        scene.add(f);
      }

      scene.add(new THREE.AmbientLight(0xfff7d6, 0.6));
      const goldLight = new THREE.PointLight(0xf6d365, 2, 10);
      goldLight.position.set(2, 2, 3);
      scene.add(goldLight);
      const blueLight = new THREE.PointLight(0xddeeff, 1.2, 10);
      blueLight.position.set(-2, -1, 3);
      scene.add(blueLight);

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

        // Slow breathing motion for wings
        const breathe = Math.sin(t * 0.7) * 0.06;
        leftWing.rotation.z = 0.05 + breathe;
        rightWing.rotation.z = -0.05 - breathe;
        leftWing.rotation.y = -0.1 + Math.sin(t * 0.5) * 0.03;
        rightWing.rotation.y = 0.1 - Math.sin(t * 0.5) * 0.03;

        wingsGroup.rotation.y += (mouseX * 0.25 - wingsGroup.rotation.y) * 0.03;
        wingsGroup.rotation.x += (mouseY * 0.12 - wingsGroup.rotation.x) * 0.03;

        // Halo slow rotation + gentle bob
        haloGroup.rotation.z = t * 0.15;
        haloGroup.position.y = 2.5 + Math.sin(t * 0.6) * 0.08;

        // Particle rise
        particles.rotation.y = t * 0.02;
        const pp = pGeo.attributes.position;
        for (let i = 0; i < pCount; i++) {
          pp.array[i * 3 + 1] += 0.006;
          if (pp.array[i * 3 + 1] > 3) pp.array[i * 3 + 1] = -3;
        }
        pp.needsUpdate = true;

        // Feather drift
        drift.forEach((f) => {
          f.position.y += f.userData.speed * 0.01;
          f.position.x += Math.sin(t + f.userData.sway) * 0.003;
          f.rotation.z = Math.sin(t * 0.5 + f.userData.sway) * 0.6;
          if (f.position.y > 3) f.position.y = -3;
        });

        goldLight.intensity = 2 + Math.sin(t * 1.4) * 0.4;

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
      style={{ width: "100%", height: "100%", cursor: "default" }}
    />
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

function GlassCard({ children, style = {}, className = "" }) {
  return (
    <div
      className={`ah-glass-card ${className}`}
      style={{
        background: "rgba(255,255,255,0.45)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(212,175,55,0.35)",
        borderRadius: "28px",
        boxShadow:
          "0 8px 32px rgba(180,150,90,0.12), 0 0 40px rgba(255,255,255,0.4)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.85rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "0.6rem",
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: "#3a3a3a",
          textShadow: "0 0 24px rgba(246,211,101,0.35)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: "80px",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #D4AF37, transparent)",
          margin: "1.1rem auto 0",
        }}
      />
    </div>
  );
}

function GoldBadge({ label }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: hov
          ? "rgba(246,211,101,0.28)"
          : "rgba(255,255,255,0.5)",
        border: `1px solid ${hov ? "#D4AF37" : "rgba(212,175,55,0.4)"}`,
        color: "#8a6d1f",
        fontFamily: "'Manrope', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.5rem 1.1rem",
        borderRadius: "999px",
        marginRight: "0.6rem",
        marginBottom: "0.6rem",
        letterSpacing: "0.02em",
        boxShadow: hov
          ? "0 0 18px rgba(246,211,101,0.5)"
          : "0 0 0 rgba(0,0,0,0)",
        transform: hov ? "translateY(-2px) rotate(-1deg)" : "none",
        transition: "all 0.25s ease",
        cursor: "default",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#D4AF37",
          boxShadow: "0 0 6px #D4AF37",
        }}
      />
      {label}
    </span>
  );
}

function GoldButton({ href, children, primary = false }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.85rem 2rem",
        borderRadius: "999px",
        fontFamily: "'Manrope', sans-serif",
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textDecoration: "none",
        border: primary ? "1px solid transparent" : "1px solid #D4AF37",
        background: primary
          ? "linear-gradient(135deg, #F6D365, #D4AF37)"
          : hov
            ? "rgba(246,211,101,0.2)"
            : "rgba(255,255,255,0.55)",
        color: primary ? "#3a2e08" : "#8a6d1f",
        boxShadow: hov
          ? "0 0 28px rgba(246,211,101,0.55)"
          : "0 4px 16px rgba(180,150,90,0.15)",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </a>
  );
}

function NavLink({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Manrope', sans-serif",
        fontSize: "0.82rem",
        fontWeight: active ? 700 : 500,
        letterSpacing: "0.05em",
        color: active || hov ? "#8a6d1f" : "#6b6b6b",
        padding: "0.4rem 0",
        marginRight: "1.8rem",
        position: "relative",
        transition: "color 0.2s ease",
      }}
    >
      {label}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-2px",
          height: "1.5px",
          background: "#D4AF37",
          transform: active || hov ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "center",
          transition: "transform 0.25s ease",
        }}
      />
    </button>
  );
}

function TimelineItem({ heading, subheading, meta, description, bullets, isLast }) {
  return (
    <div style={{ display: "flex", gap: "1.5rem", position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "20px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFF7D6, #D4AF37)",
            boxShadow: "0 0 12px rgba(246,211,101,0.8)",
            flexShrink: 0,
            marginTop: "0.3rem",
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "2px",
              flex: 1,
              background:
                "linear-gradient(180deg, #D4AF37, rgba(212,175,55,0.15))",
              marginTop: "0.3rem",
            }}
          />
        )}
      </div>
      <div style={{ paddingBottom: "2.2rem", flex: 1 }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "#3a3a3a",
          }}
        >
          {heading}
        </div>
        {subheading && (
          <div
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "0.85rem",
              color: "#8a6d1f",
              fontWeight: 600,
              marginTop: "0.15rem",
            }}
          >
            {subheading}
          </div>
        )}
        {meta && (
          <div
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "0.75rem",
              color: "#9a9a9a",
              marginTop: "0.2rem",
              letterSpacing: "0.03em",
            }}
          >
            {meta}
          </div>
        )}
        {description && (
          <div
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "0.85rem",
              color: "#5c5c5c",
              lineHeight: 1.75,
              marginTop: "0.6rem",
            }}
          >
            {description}
          </div>
        )}
        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul style={{ margin: "0.6rem 0 0", paddingLeft: "1.1rem" }}>
            {bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: "0.82rem",
                  color: "#5c5c5c",
                  lineHeight: 1.7,
                  marginBottom: "0.2rem",
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

// ─────────────────────────────────────────────
// Main Template
// Prop contract matches the rest of the system: { data }
// ─────────────────────────────────────────────
export default function AngelicHeavenTemplate({ data = {} }) {
  const [activeTab, setActiveTab] = useState("about");
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

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
    (acc, group) =>
      acc + (Array.isArray(group?.skills) ? group.skills.length : 0),
    0,
  );

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 150);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!data) return null;

  const tabs = [
    { id: "about", label: "About" },
    { id: "experience", label: "Journey" },
    { id: "projects", label: "Creations" },
    { id: "education", label: "Learning" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F8F8F5 45%, #EEF6FF 100%)",
        color: "#3a3a3a",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F8F8F5; }
        ::-webkit-scrollbar-thumb { background: #D4AF37aa; border-radius: 3px; }

        @keyframes ahFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ahFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes ahFloatSlow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(6px); }
        }
        @keyframes ahDrift {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(110%); }
        }
        @keyframes ahPulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes ahSparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .ah-fade-up { animation: ahFadeUp 1s cubic-bezier(0.2,0.7,0.3,1) both; }
        .ah-glass-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .ah-glass-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(180,150,90,0.18), 0 0 60px rgba(255,247,214,0.6);
        }

        .ah-hero-grid {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 2.5rem;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 6rem 2.5rem 4rem;
        }
        @media (max-width: 960px) {
          .ah-hero-grid { grid-template-columns: 1fr; padding-top: 8rem; }
          .ah-model-panel { height: 340px !important; order: -1; }
        }
        .ah-content-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.75rem;
          align-items: start;
        }
        @media (max-width: 900px) { .ah-content-grid { grid-template-columns: 1fr; } }
        .ah-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 600px) { .ah-projects-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Ambient light rays / god rays */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,247,214,0.55) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 30% at 80% 20%, rgba(221,238,255,0.4) 0%, transparent 60%)",
        }}
      />
      {/* Soft drifting cloud shapes */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: 0.5,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "8%",
            width: "260px",
            height: "70px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.9), transparent 70%)",
            filter: "blur(6px)",
            animation: "ahDrift 38s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "28%",
            width: "340px",
            height: "90px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)",
            filter: "blur(8px)",
            animation: "ahDrift 52s linear infinite",
            animationDelay: "-15s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            width: "220px",
            height: "60px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.6), transparent 70%)",
            filter: "blur(6px)",
            animation: "ahDrift 45s linear infinite",
            animationDelay: "-8s",
          }}
        />
      </div>

      {/* Content wrapper */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        {/* Floating top navigation */}
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.7rem 1.6rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(212,175,55,0.3)",
            boxShadow: "0 4px 24px rgba(180,150,90,0.15)",
          }}
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* ── HERO ── */}
        <div className="ah-hero-grid">
          <div className="ah-fade-up" style={{ animationDelay: "0.1s" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "1rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#D4AF37",
                marginBottom: "1rem",
              }}
            >
              ✦ Chosen Creator ✦
            </div>
            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
                fontWeight: 700,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
                margin: "0 0 0.8rem",
                background:
                  "linear-gradient(135deg, #3a3a3a 0%, #8a6d1f 50%, #3a3a3a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 40px rgba(246,211,101,0.25)",
              }}
            >
              {name}
            </h1>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.4rem",
                color: "#6b6b6b",
                marginBottom: "1.5rem",
              }}
            >
              {title}
            </div>
            {summary && (
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.85,
                  color: "#5c5c5c",
                  maxWidth: "560px",
                  marginBottom: "2rem",
                }}
              >
                {summary}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }}>
              {email && (
                <GoldButton href={`mailto:${email}`} primary>
                  ✦ Contact
                </GoldButton>
              )}
              {website && (
                <GoldButton href={safeUrl(website)}>🌐 Portfolio</GoldButton>
              )}
              {github && <GoldButton href={safeUrl(github)}>⌗ GitHub</GoldButton>}
              {linkedin && (
                <GoldButton href={safeUrl(linkedin)}>in LinkedIn</GoldButton>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                marginTop: "2rem",
                fontSize: "0.82rem",
                color: "#8a8a8a",
              }}
            >
              {location && <span>📍 {location}</span>}
              {phone && <span>☎ {phone}</span>}
            </div>
          </div>

          {/* 3D Angel Wings panel */}
          <div
            className="ah-model-panel"
            style={{
              height: "460px",
              position: "relative",
              borderRadius: "32px",
              overflow: "hidden",
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(255,247,214,0.5), rgba(221,238,255,0.25) 70%, transparent 100%)",
              border: "1px solid rgba(212,175,55,0.25)",
              boxShadow: "0 0 60px rgba(246,211,101,0.2) inset",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                transform: `translate(${mouse.x * 4}px, ${mouse.y * 4}px)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              <AngelWingsModel3D />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "1.2rem",
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "0.8rem",
                color: "#a8935a",
                letterSpacing: "0.15em",
                zIndex: 2,
              }}
            >
              ~ Guided by Light ~
            </div>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "1rem 2.5rem 6rem",
          }}
        >
          {/* ── ABOUT ── */}
          {activeTab === "about" && (
            <div>
              <SectionHeading eyebrow="Gifts & Grace" title="Skills & Blessings" />
              {skillGroups.length > 0 && (
                <GlassCard style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.9rem",
                      color: "#8a6d1f",
                      marginBottom: "1.2rem",
                    }}
                  >
                    {totalSkills} skills illuminated across {skillGroups.length}{" "}
                    realms
                  </div>
                  {skillGroups.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: "1.4rem" }}>
                      {group?.category && (
                        <div
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#5c5c5c",
                            marginBottom: "0.6rem",
                            letterSpacing: "0.05em",
                          }}
                        >
                          ✦ {group.category}
                        </div>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {(Array.isArray(group?.skills) ? group.skills : []).map(
                          (skill, si) => (
                            <GoldBadge key={si} label={skill} />
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </GlassCard>
              )}

              <div className="ah-content-grid">
                <div>
                  {certifications.length > 0 && (
                    <GlassCard style={{ marginBottom: "1.75rem" }}>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "1.15rem",
                          fontWeight: 600,
                          marginBottom: "1.2rem",
                          color: "#3a3a3a",
                        }}
                      >
                        👑 Sacred Certifications
                      </div>
                      {certifications.map((cert, i) => (
                        <div
                          key={i}
                          style={{
                            paddingBottom: "0.9rem",
                            marginBottom: "0.9rem",
                            borderBottom:
                              i < certifications.length - 1
                                ? "1px solid rgba(212,175,55,0.2)"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "0.92rem",
                              color: "#3a3a3a",
                            }}
                          >
                            {cert.title || cert.name}
                          </div>
                          {(cert.issuer || cert.organization) && (
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "#8a8a8a",
                                marginTop: "0.2rem",
                              }}
                            >
                              {cert.issuer || cert.organization}
                              {cert.date || cert.issueDate
                                ? ` · ${cert.date || cert.issueDate}`
                                : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlassCard>
                  )}

                  {achievements.length > 0 && (
                    <GlassCard style={{ marginBottom: "1.75rem" }}>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "1.15rem",
                          fontWeight: 600,
                          marginBottom: "1.2rem",
                          color: "#3a3a3a",
                        }}
                      >
                        ⭐ Divine Achievements
                      </div>
                      {achievements.map((ach, i) => (
                        <div
                          key={i}
                          style={{
                            paddingBottom: "0.9rem",
                            marginBottom: "0.9rem",
                            borderBottom:
                              i < achievements.length - 1
                                ? "1px solid rgba(212,175,55,0.2)"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "0.92rem",
                              color: "#3a3a3a",
                            }}
                          >
                            ✦ {ach.title}
                          </div>
                          {ach.description && (
                            <div
                              style={{
                                fontSize: "0.82rem",
                                color: "#6b6b6b",
                                marginTop: "0.3rem",
                                lineHeight: 1.7,
                              }}
                            >
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlassCard>
                  )}

                  {hobbies.length > 0 && (
                    <GlassCard>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "1.15rem",
                          fontWeight: 600,
                          marginBottom: "1.2rem",
                          color: "#3a3a3a",
                        }}
                      >
                        🕊 Interests & Serenity
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {hobbies.map((hobby, i) => (
                          <GoldBadge key={i} label={hobby} />
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </div>

                {/* Sidebar stats */}
                <div>
                  <GlassCard>
                    <div
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: "1.2rem",
                        color: "#3a3a3a",
                        textAlign: "center",
                      }}
                    >
                      Celestial Ledger
                    </div>
                    {[
                      { k: "Skills", v: totalSkills },
                      { k: "Projects", v: projects.length },
                      { k: "Experience", v: experience.length },
                      { k: "Education", v: education.length },
                      { k: "Certs", v: certifications.length },
                      { k: "Achievements", v: achievements.length },
                    ].map(({ k, v }) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.82rem",
                          padding: "0.5rem 0",
                          borderBottom: "1px solid rgba(212,175,55,0.15)",
                        }}
                      >
                        <span style={{ color: "#8a8a8a" }}>{k}</span>
                        <span style={{ color: "#8a6d1f", fontWeight: 700 }}>
                          {v}
                        </span>
                      </div>
                    ))}
                  </GlassCard>
                </div>
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {activeTab === "experience" && (
            <div>
              <SectionHeading eyebrow="The Path Walked" title="Journey & Calling" />
              <GlassCard>
                {experience.length > 0 ? (
                  experience.map((exp, i) => (
                    <TimelineItem
                      key={i}
                      heading={exp.title || exp.role}
                      subheading={
                        exp.company +
                        (exp.location ? ` · ${exp.location}` : "")
                      }
                      meta={`${exp.startDate || exp.start || ""} → ${
                        exp.current
                          ? "Present"
                          : exp.endDate || exp.end || "Present"
                      }`}
                      description={exp.description}
                      bullets={[
                        ...(Array.isArray(exp.responsibilities)
                          ? exp.responsibilities
                          : []),
                        ...(Array.isArray(exp.achievements)
                          ? exp.achievements
                          : []),
                      ]}
                      isLast={i === experience.length - 1}
                    />
                  ))
                ) : (
                  <div style={{ color: "#a8a8a8", fontSize: "0.9rem" }}>
                    No journey recorded yet.
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {/* ── PROJECTS ── */}
          {activeTab === "projects" && (
            <div>
              <SectionHeading eyebrow="Works of Light" title="Sacred Creations" />
              {projects.length > 0 ? (
                <div className="ah-projects-grid">
                  {projects.map((proj, i) => (
                    <GlassCard key={i} style={{ padding: "1.75rem" }}>
                      <div
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1.2rem",
                          fontSize: "1.2rem",
                          opacity: 0.5,
                        }}
                      >
                        ✦
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "1.05rem",
                          fontWeight: 600,
                          color: "#3a3a3a",
                          marginBottom: "0.6rem",
                        }}
                      >
                        {proj.title || proj.name}
                      </div>
                      {proj.description && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#6b6b6b",
                            lineHeight: 1.75,
                            marginBottom: "1rem",
                          }}
                        >
                          {proj.description}
                        </div>
                      )}
                      {Array.isArray(proj.techStack) &&
                        proj.techStack.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              marginBottom: "1rem",
                            }}
                          >
                            {proj.techStack.map((tech, ti) => (
                              <span
                                key={ti}
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#8a6d1f",
                                  background: "rgba(246,211,101,0.15)",
                                  border: "1px solid rgba(212,175,55,0.3)",
                                  borderRadius: "999px",
                                  padding: "0.25rem 0.7rem",
                                  marginRight: "0.4rem",
                                  marginBottom: "0.4rem",
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      <div style={{ display: "flex", gap: "1rem" }}>
                        {proj.liveUrl && (
                          <a
                            href={safeUrl(proj.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.78rem",
                              color: "#8a6d1f",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            View Live ✦
                          </a>
                        )}
                        {proj.github && (
                          <a
                            href={safeUrl(proj.github)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.78rem",
                              color: "#6b6b6b",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Source ⌗
                          </a>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard>
                  <div style={{ color: "#a8a8a8", fontSize: "0.9rem" }}>
                    No creations shared yet.
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === "education" && (
            <div>
              <SectionHeading eyebrow="Wisdom Gathered" title="Learning & Growth" />
              <GlassCard>
                {education.length > 0 ? (
                  education.map((edu, i) => (
                    <TimelineItem
                      key={i}
                      heading={edu.degree || edu.field}
                      subheading={edu.institution || edu.school}
                      meta={`${edu.startDate || edu.start || ""}${
                        edu.current
                          ? " → Present"
                          : edu.endDate || edu.end
                            ? ` → ${edu.endDate || edu.end}`
                            : ""
                      }${
                        edu.gpa
                          ? `  ·  GPA: ${edu.gpa}`
                          : edu.score
                            ? `  ·  Score: ${edu.score}${edu.outOf ? `/${edu.outOf}` : ""}`
                            : ""
                      }`}
                      description={edu.description}
                      isLast={i === education.length - 1}
                    />
                  ))
                ) : (
                  <div style={{ color: "#a8a8a8", fontSize: "0.9rem" }}>
                    No learning recorded yet.
                  </div>
                )}
              </GlassCard>

              {certifications.length > 0 && (
                <GlassCard style={{ marginTop: "1.75rem" }}>
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1.2rem",
                      color: "#3a3a3a",
                    }}
                  >
                    Scrolls of Certification
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    {certifications.map((cert, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(255,255,255,0.5)",
                          border: "1px solid rgba(212,175,55,0.3)",
                          borderRadius: "16px",
                          padding: "0.9rem 1.2rem",
                          minWidth: "220px",
                          flex: "1 1 240px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: "#3a3a3a",
                          }}
                        >
                          {cert.title || cert.name}
                        </div>
                        {(cert.issuer || cert.organization) && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#8a8a8a",
                              marginTop: "0.2rem",
                            }}
                          >
                            {cert.issuer || cert.organization}
                            {cert.date || cert.issueDate
                              ? ` · ${cert.date || cert.issueDate}`
                              : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid rgba(212,175,55,0.25)",
            padding: "2rem 2.5rem",
            textAlign: "center",
            background: "rgba(255,255,255,0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "#8a6d1f",
              letterSpacing: "0.05em",
            }}
          >
            ✦ Crafted with grace by {name} ✦
          </div>
        </div>
      </div>
    </div>
  );
}