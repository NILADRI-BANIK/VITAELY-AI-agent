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
// LiquidGlassModel3D
// Apple-aesthetic Three.js scene:
//   • Central translucent glass sphere with inner shimmer
//   • Iridescent caustic light rings orbiting at varying tilts
//   • Soft pearl-white particle field floating gently
//   • Subtle point light pulsing (warm white / Apple blue)
//   • Mouse-reactive gentle rotation
// ─────────────────────────────────────────────────────────────────
function LiquidGlassModel3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let cleanupListeners = null;
    
    // ── FIXED: Hoist cleanup arrays to the top of the useEffect scope ──
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

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.background = null;

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

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

      // ── Outer glass sphere (translucent, wireframe-free) ──
      const outerGeo = new THREE.SphereGeometry(1.6, 64, 64);
      const outerMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
        roughness: 0.0,
        metalness: 0.0,
        side: THREE.FrontSide,
      });
      const outerSphere = new THREE.Mesh(outerGeo, outerMat);
      scene.add(outerSphere);

      // ── Inner glow sphere ──
      const innerGeo = new THREE.SphereGeometry(1.42, 48, 48);
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: 0xddeeff,
        transparent: true,
        opacity: 0.18,
        roughness: 0.1,
        metalness: 0.0,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(innerGeo, innerMat));

      // ── Core shimmer sphere ──
      const coreGeo = new THREE.SphereGeometry(0.9, 32, 32);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.0,
        metalness: 0.2,
        side: THREE.FrontSide,
      });
      const coreSphere = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreSphere);

      // ── Iridescent caustic rings ──
      const ringDefs = [
        { r: 1.95, tube: 0.012, tiltX: 0.4, tiltZ: 0.0, color: 0x0a84ff, opacity: 0.55, speed: 0.28 },
        { r: 2.2, tube: 0.009, tiltX: 1.15, tiltZ: 0.5, color: 0xbfdfff, opacity: 0.35, speed: -0.2 },
        { r: 2.05, tube: 0.01, tiltX: 0.7, tiltZ: 1.3, color: 0x30d158, opacity: 0.3, speed: 0.38 },
        { r: 1.85, tube: 0.008, tiltX: 1.55, tiltZ: 0.8, color: 0xffffff, opacity: 0.4, speed: -0.15 },
        { r: 2.35, tube: 0.007, tiltX: 0.2, tiltZ: 0.6, color: 0x64d2ff, opacity: 0.25, speed: 0.22 },
      ];

      const ringMeshes = ringDefs.map(
        ({ r, tube, tiltX, tiltZ, color, opacity }) => {
          const geo = new THREE.TorusGeometry(r, tube, 8, 120);
          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.x = tiltX;
          mesh.rotation.z = tiltZ;
          scene.add(mesh);
          return { mesh, mat, baseTiltX: tiltX, baseTiltZ: tiltZ };
        }
      );

      // ── Pearl particle field ──
      const pCount = 280;
      const pPos = new Float32Array(pCount * 3);
      const pSizes = new Float32Array(pCount);
      
      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rad = 2.5 + Math.random() * 2.2;
        pPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = rad * Math.cos(phi);
        pSizes[i] = 0.5 + Math.random() * 1.5;
      }
      
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));
      
      const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // ── FIXED: Push to cleanup arrays AFTER initialization to avoid ReferenceError ──
      geometries.push(outerGeo, innerGeo, coreGeo, pGeo);
      materials.push(outerMat, innerMat, coreMat, pMat);
      ringMeshes.forEach(({ mesh }) => {
        geometries.push(mesh.geometry);
        materials.push(mesh.material);
      });

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      
      const blueLight = new THREE.PointLight(0x0a84ff, 3.5, 10);
      blueLight.position.set(3, 2, 3);
      scene.add(blueLight);
      
      const warmLight = new THREE.PointLight(0xfff5e0, 2.0, 8);
      warmLight.position.set(-3, -1, 2);
      scene.add(warmLight);
      
      const rimLight = new THREE.PointLight(0x30d158, 1.2, 7);
      rimLight.position.set(0, -3, -2);
      scene.add(rimLight);

      // ── Mouse tracking ──
      let mouseX = 0;
      let mouseY = 0;
      const onMouse = (e) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      mountRef.current.addEventListener("mousemove", onMouse);

      // ── Resize ──
      const onResize = () => {
        if (!mountRef.current || !mounted) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      };
      window.addEventListener("resize", onResize);

      const handleVisibility = () => {
        if (document.hidden) {
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
          }
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
      let smoothMouseX = 0;
      let smoothMouseY = 0;

      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.006;
        
        // Smooth mouse lerp — Apple-style spring feel
        smoothMouseX += (mouseX - smoothMouseX) * 0.035;
        smoothMouseY += (mouseY - smoothMouseY) * 0.035;
        
        // Gentle globe rotation + mouse parallax
        outerSphere.rotation.y = t * 0.08 + smoothMouseX * 0.35;
        outerSphere.rotation.x = t * 0.04 + smoothMouseY * 0.2;
        coreSphere.rotation.y = -t * 0.12 + smoothMouseX * 0.25;
        coreSphere.rotation.x = -t * 0.06 + smoothMouseY * 0.15;
        
        // Rings — individual drift + mouse tilt
        ringMeshes.forEach(({ mesh, baseTiltX, baseTiltZ }, i) => {
          const d = ringDefs[i];
          mesh.rotation.x =
            baseTiltX + smoothMouseY * 0.18 + Math.sin(t * d.speed + i) * 0.04;
          mesh.rotation.z =
            baseTiltZ + smoothMouseX * 0.18 + Math.cos(t * d.speed + i) * 0.04;
          mesh.rotation.y = t * d.speed * 0.6;
        });
        
        // Orbiting lights
        blueLight.position.x = Math.cos(t * 0.4) * 4;
        blueLight.position.z = Math.sin(t * 0.4) * 4;
        blueLight.intensity = 3.0 + Math.sin(t * 1.5) * 0.8;
        
        warmLight.position.x = Math.cos(t * 0.3 + Math.PI) * 3.5;
        warmLight.position.z = Math.sin(t * 0.3 + Math.PI) * 3.5;
        
        // Gentle particle rotation + subtle breathe
        particles.rotation.y = t * 0.025;
        particles.rotation.x = t * 0.012;
        pMat.opacity = 0.45 + Math.sin(t * 0.8) * 0.12;
        
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
        
        // ── FIXED: Memory leak cleanup now has proper scope ──
        geometries.forEach((geo) => geo?.dispose?.());
        materials.forEach((mat) => mat?.dispose?.());
        
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
// GlassCard — reusable frosted glass panel
// ─────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, className = "" }) {
  return (
    <div
      className={`al-glass-card ${className}`}
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.70)",
        borderRadius: "20px",
        boxShadow:
          "0 8px 32px rgba(10,132,255,0.08), 0 1.5px 0 rgba(255,255,255,0.9) inset",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SectionLabel — small Apple-style eyebrow label
// ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#0a84ff",
        marginBottom: "0.6rem",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────
// NavPill — tab navigation button
// ─────────────────────────────────────────────────────────────────
function NavPill({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.45rem 1.1rem",
        borderRadius: "999px",
        border: active
          ? "1px solid rgba(10,132,255,0.35)"
          : "1px solid rgba(255,255,255,0.6)",
        background: active ? "rgba(10,132,255,0.12)" : "rgba(255,255,255,0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: active ? "#0a84ff" : "#6b7280",
        fontSize: "0.8rem",
        fontWeight: active ? 600 : 500,
        fontFamily: "'Nunito', sans-serif",
        cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        boxShadow: active
          ? "0 2px 12px rgba(10,132,255,0.18)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {icon && <span style={{ fontSize: "0.85rem" }}>{icon}</span>}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// SkillPill — individual skill tag
// ─────────────────────────────────────────────────────────────────
function SkillPill({ skill }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block",
        padding: "0.3rem 0.85rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        background: hov ? "rgba(10,132,255,0.14)" : "rgba(255,255,255,0.65)",
        border: `1px solid ${hov ? "rgba(10,132,255,0.4)" : "rgba(255,255,255,0.85)"}`,
        color: hov ? "#0a84ff" : "#374151",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.18s ease",
        boxShadow: hov
          ? "0 2px 8px rgba(10,132,255,0.15)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {skill}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// ContactChip — contact row item
// ─────────────────────────────────────────────────────────────────
function ContactChip({ icon, label, href }) {
  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.3rem 0.85rem",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(255,255,255,0.85)",
        fontSize: "0.76rem",
        fontWeight: 500,
        color: "#374151",
        fontFamily: "'DM Sans', sans-serif",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "all 0.18s ease",
      }}
    >
      <span style={{ fontSize: "0.85rem" }}>{icon}</span>
      {label}
    </span>
  );
  if (href && href !== "#") {
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

// ─────────────────────────────────────────────────────────────────
// TimelineEntry — experience / education item
// ─────────────────────────────────────────────────────────────────
function TimelineEntry({
  heading,
  sub,
  period,
  description,
  bullets = [],
  extra,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.4rem",
        paddingBottom: "1.4rem",
        borderBottom: "1px solid rgba(10,132,255,0.08)",
      }}
    >
      {/* Timeline dot + line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "0.25rem",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0a84ff, #30d158)",
            boxShadow: "0 0 8px rgba(10,132,255,0.45)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            width: "1px",
            flex: 1,
            background: "rgba(10,132,255,0.15)",
            marginTop: "4px",
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.3rem",
            marginBottom: "0.25rem",
          }}
        >
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#1c1c1e",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {heading}
          </span>
          {period && (
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                color: "#0a84ff",
                background: "rgba(10,132,255,0.08)",
                padding: "0.15rem 0.65rem",
                borderRadius: "999px",
                whiteSpace: "nowrap",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {period}
            </span>
          )}
        </div>
        {sub && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "#6b7280",
              fontWeight: 500,
              marginBottom: "0.4rem",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {sub}
          </p>
        )}
        {extra && (
          <p
            style={{
              fontSize: "0.74rem",
              color: "#0a84ff",
              marginBottom: "0.35rem",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {extra}
          </p>
        )}
        {description && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "#4b5563",
              lineHeight: 1.75,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {description}
          </p>
        )}
        {bullets.map((b, i) => (
          <div
            key={i}
            style={{
              fontSize: "0.78rem",
              color: "#6b7280",
              lineHeight: 1.65,
              paddingLeft: "0.8rem",
              borderLeft: "2px solid rgba(10,132,255,0.25)",
              marginTop: "0.3rem",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ProjectCard — individual project
// ─────────────────────────────────────────────────────────────────
function ProjectCard({ proj }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${hov ? "rgba(10,132,255,0.30)" : "rgba(255,255,255,0.75)"}`,
        borderRadius: "16px",
        padding: "1.2rem",
        transition: "all 0.22s ease",
        boxShadow: hov
          ? "0 8px 28px rgba(10,132,255,0.12), 0 1px 0 rgba(255,255,255,0.9) inset"
          : "0 4px 16px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.5rem",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "#1c1c1e",
            fontFamily: "'Nunito', sans-serif",
            margin: 0,
          }}
        >
          {proj.title || proj.name}
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {proj.github && (
            <a
              href={safeUrl(proj.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#0a84ff",
                textDecoration: "none",
                padding: "0.2rem 0.65rem",
                background: "rgba(10,132,255,0.08)",
                borderRadius: "999px",
                border: "1px solid rgba(10,132,255,0.2)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              GitHub ↗
            </a>
          )}
          {proj.liveUrl && (
            <a
              href={safeUrl(proj.liveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#30d158",
                textDecoration: "none",
                padding: "0.2rem 0.65rem",
                background: "rgba(48,209,88,0.08)",
                borderRadius: "999px",
                border: "1px solid rgba(48,209,88,0.25)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
      {proj.description && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "#4b5563",
            lineHeight: 1.7,
            marginBottom: "0.7rem",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {proj.description}
        </p>
      )}
      {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {proj.techStack.map((tech, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                padding: "0.18rem 0.6rem",
                borderRadius: "999px",
                background: "rgba(10,132,255,0.07)",
                color: "#0a84ff",
                border: "1px solid rgba(10,132,255,0.18)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────────────────────────
export default function AppleLiquidTemplate({ data = {} }) {
  const [activeTab, setActiveTab] = useState("about");

  // ── Safe data extraction ──
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
  const twitter = contact.twitter || "";
  const website = contact.portfolioUrl || contact.website || "";
  
  const skillGroups = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const certifications = Array.isArray(data?.certifications) ? data.certifications : [];
  const achievements = Array.isArray(data?.achievements) ? data.achievements : [];
  const hobbies = Array.isArray(data?.hobbies) ? data.hobbies : [];
  
  const totalSkills = skillGroups.reduce(
    (acc, g) => acc + (Array.isArray(g?.skills) ? g.skills.length : 0),
    0
  );

  if (!data) return null;

  const tabs = [
    { id: "about", label: "About", icon: "✦" },
    { id: "experience", label: "Experience", icon: "◈" },
    { id: "projects", label: "Projects", icon: "⬡" },
    { id: "education", label: "Education", icon: "◎" },
  ];

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        background:
          "linear-gradient(145deg, #f0f6ff 0%, #e8f4fd 25%, #f5f0ff 55%, #eaf6f0 100%)",
      }}
    >
      {/* ── Google Fonts + CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(10,132,255,0.25); border-radius: 999px; }
        @keyframes al-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes al-fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes al-blob1 {
          0%,100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; transform: scale(1) rotate(0deg); }
          33%      { border-radius: 40% 60% 30% 70% / 60% 40% 50% 50%; transform: scale(1.04) rotate(3deg); }
          66%      { border-radius: 70% 30% 50% 50% / 40% 60% 60% 40%; transform: scale(0.97) rotate(-2deg); }
        }
        @keyframes al-blob2 {
          0%,100% { border-radius: 40% 60% 50% 50% / 60% 40% 50% 50%; transform: scale(1) rotate(0deg); }
          50%      { border-radius: 60% 40% 40% 60% / 40% 60% 60% 40%; transform: scale(1.06) rotate(-4deg); }
        }
        @keyframes al-shimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 1.0; }
          100% { opacity: 0.5; }
        }
        .al-blob-1 {
          position: fixed; z-index: 0; pointer-events: none;
          width: 520px; height: 520px;
          background: radial-gradient(circle at 40% 40%, rgba(10,132,255,0.14) 0%, rgba(100,210,255,0.08) 50%, transparent 75%);
          top: -120px; right: -100px;
          animation: al-blob1 14s ease-in-out infinite;
        }
        .al-blob-2 {
          position: fixed; z-index: 0; pointer-events: none;
          width: 460px; height: 460px;
          background: radial-gradient(circle at 60% 60%, rgba(48,209,88,0.10) 0%, rgba(100,210,255,0.06) 50%, transparent 75%);
          bottom: -80px; left: -80px;
          animation: al-blob2 18s ease-in-out infinite;
        }
        .al-blob-3 {
          position: fixed; z-index: 0; pointer-events: none;
          width: 300px; height: 300px;
          background: radial-gradient(circle at 50% 50%, rgba(175,82,222,0.08) 0%, transparent 70%);
          top: 40%; left: 38%;
          animation: al-blob1 22s ease-in-out infinite reverse;
        }
        .al-glass-card {
          transition: box-shadow 0.2s ease, background 0.2s ease;
        }
        .al-hero-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 960px) {
          .al-hero-grid { grid-template-columns: 1fr; }
          .al-model-panel { height: 280px !important; }
        }
        .al-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .al-projects-grid { grid-template-columns: 1fr; }
        }
        .al-fade-in {
          animation: al-fadeup 0.45s ease both;
        }
        .al-section-title {
          font-family: 'Nunito', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1c1c1e;
          margin-bottom: 1.2rem;
          letter-spacing: -0.02em;
        }
      `}</style>

      {/* Ambient blobs */}
      <div className="al-blob-1" />
      <div className="al-blob-2" />
      <div className="al-blob-3" />

      {/* ── TOP NAV BAR ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "0 1px 0 rgba(10,132,255,0.06)",
          padding: "0.75rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <div
              key={i}
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                background: c,
                boxShadow: `0 0 0 0.5px rgba(0,0,0,0.12)`,
              }}
            />
          ))}
          <span
            style={{
              marginLeft: "0.5rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#1c1c1e",
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 1.75rem 5rem",
        }}
      >
        {/* ── HERO SECTION ── */}
        <div className="al-hero-grid" style={{ marginBottom: "2rem" }}>
          {/* Left — identity card */}
          <div className="al-fade-in" style={{ animationDelay: "0.05s" }}>
            <GlassCard style={{ padding: "2rem 2.2rem" }}>
              <div style={{ marginBottom: "1.2rem" }}>
                <h1
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                    fontWeight: 900,
                    color: "#1c1c1e",
                    letterSpacing: "-0.035em",
                    lineHeight: 1.1,
                    marginBottom: "0.4rem",
                  }}
                >
                  {name}
                </h1>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#0a84ff",
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </p>
              </div>

              {summary && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#4b5563",
                    lineHeight: 1.8,
                    marginBottom: "1.4rem",
                    fontFamily: "'DM Sans', sans-serif",
                    maxWidth: "480px",
                  }}
                >
                  {summary}
                </p>
              )}

              {(email || phone || location || github || linkedin || twitter || website) && (
                <div>
                  <SectionLabel>Contact</SectionLabel>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.45rem",
                    }}
                  >
                    {email && (
                      <ContactChip
                        icon="✉️"
                        label={email}
                        href={`mailto:${email}`}
                      />
                    )}
                    {phone && (
                      <ContactChip
                        icon="📱"
                        label={phone}
                        href={`tel:${phone}`}
                      />
                    )}
                    {location && (
                      <ContactChip icon="📍" label={location} href="#" />
                    )}
                    {github && (
                      <ContactChip
                        icon="⌥"
                        label="GitHub"
                        href={safeUrl(github)}
                      />
                    )}
                    {linkedin && (
                      <ContactChip
                        icon="in"
                        label="LinkedIn"
                        href={safeUrl(linkedin)}
                      />
                    )}
                    {twitter && (
                      <ContactChip
                        icon="𝕏"
                        label="Twitter"
                        href={safeUrl(twitter)}
                      />
                    )}
                    {website && (
                      <ContactChip
                        icon="🌐"
                        label="Portfolio"
                        href={safeUrl(website)}
                      />
                    )}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "1.2rem",
                  marginTop: "1.5rem",
                  paddingTop: "1.2rem",
                  borderTop: "1px solid rgba(10,132,255,0.10)",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { v: totalSkills, l: "Skills" },
                  { v: experience.length, l: "Roles" },
                  { v: projects.length, l: "Projects" },
                  { v: certifications.length, l: "Certs" },
                ].map(
                  ({ v, l }) =>
                    v > 0 && (
                      <div
                        key={l}
                        style={{ textAlign: "center", minWidth: "50px" }}
                      >
                        <div
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#0a84ff",
                            fontFamily: "'Nunito', sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          {v}
                        </div>
                        <div
                          style={{
                            fontSize: "0.68rem",
                            color: "#9ca3af",
                            fontWeight: 500,
                            marginTop: "0.2rem",
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          {l}
                        </div>
                      </div>
                    )
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right — 3D glass model panel */}
          <div
            className="al-model-panel al-fade-in"
            style={{
              height: "400px",
              position: "relative",
              animationDelay: "0.15s",
            }}
          >
            <GlassCard
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                padding: 0,
                background: "rgba(255,255,255,0.35)",
                boxShadow:
                  "0 12px 48px rgba(10,132,255,0.12), 0 1.5px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              {[
                {
                  top: "10px",
                  left: "10px",
                  borderTop: "1.5px solid rgba(10,132,255,0.5)",
                  borderLeft: "1.5px solid rgba(10,132,255,0.5)",
                },
                {
                  top: "10px",
                  right: "10px",
                  borderTop: "1.5px solid rgba(10,132,255,0.5)",
                  borderRight: "1.5px solid rgba(10,132,255,0.5)",
                },
                {
                  bottom: "10px",
                  left: "10px",
                  borderBottom: "1.5px solid rgba(10,132,255,0.5)",
                  borderLeft: "1.5px solid rgba(10,132,255,0.5)",
                },
                {
                  bottom: "10px",
                  right: "10px",
                  borderBottom: "1.5px solid rgba(10,132,255,0.5)",
                  borderRight: "1.5px solid rgba(10,132,255,0.5)",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: "16px",
                    height: "16px",
                    zIndex: 2,
                    ...s,
                  }}
                />
              ))}
              
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "rgba(255,255,255,0.70)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.85)",
                  borderRadius: "999px",
                  padding: "0.2rem 0.75rem",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#30d158",
                    boxShadow: "0 0 5px rgba(48,209,88,0.7)",
                    animation: "al-shimmer 2s ease-in-out infinite",
                  }}
                />
                LIQUID GLASS · 3D
              </div>
              
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  zIndex: 0,
                }}
              >
                <LiquidGlassModel3D />
              </div>
              
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "40px",
                  background:
                    "linear-gradient(to top, rgba(255,255,255,0.5), transparent)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            </GlassCard>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div
          className="al-fade-in"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.8rem",
            flexWrap: "wrap",
            animationDelay: "0.2s",
          }}
        >
          {tabs.map((tab) => (
            <NavPill
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* ── ABOUT TAB ── */}
        {activeTab === "about" && (
          <div className="al-fade-in" style={{ animationDelay: "0.05s" }}>
            <div
              className="al-about-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 260px",
                gap: "1.2rem",
                alignItems: "start",
              }}
            >
              <div>
                {skillGroups.length > 0 && (
                  <GlassCard
                    style={{ padding: "1.6rem", marginBottom: "1.2rem" }}
                  >
                    <p className="al-section-title">Skills</p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {skillGroups.map((group, gi) => (
                        <div key={gi}>
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
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
                {achievements.length > 0 && (
                  <GlassCard
                    style={{ padding: "1.6rem", marginBottom: "1.2rem" }}
                  >
                    <p className="al-section-title">Achievements</p>
                    {achievements.map((ach, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: "0.9rem",
                          paddingBottom: "0.9rem",
                          borderBottom:
                            i < achievements.length - 1
                              ? "1px solid rgba(10,132,255,0.08)"
                              : "none",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: "#1c1c1e",
                            fontFamily: "'Nunito', sans-serif",
                            marginBottom: "0.25rem",
                          }}
                        >
                          ✦ {ach.title}
                        </p>
                        {ach.description && (
                          <p
                            style={{
                              fontSize: "0.78rem",
                              color: "#4b5563",
                              lineHeight: 1.7,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {ach.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </GlassCard>
                )}
                {hobbies.length > 0 && (
                  <GlassCard style={{ padding: "1.6rem" }}>
                    <p className="al-section-title">Interests</p>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {hobbies.map((h, i) => (
                        <SkillPill key={i} skill={h} />
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>

              <div>
                {certifications.length > 0 && (
                  <GlassCard
                    style={{ padding: "1.4rem", marginBottom: "1.2rem" }}
                  >
                    <p className="al-section-title">Certifications</p>
                    {certifications.map((cert, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: "0.75rem",
                          paddingBottom: "0.75rem",
                          borderBottom:
                            i < certifications.length - 1
                              ? "1px solid rgba(10,132,255,0.08)"
                              : "none",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#1c1c1e",
                            fontFamily: "'Nunito', sans-serif",
                            lineHeight: 1.4,
                          }}
                        >
                          {cert.title || cert.name}
                        </p>
                        {(cert.issuer || cert.organization) && (
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "#6b7280",
                              fontFamily: "'DM Sans', sans-serif",
                              marginTop: "0.2rem",
                            }}
                          >
                            {cert.issuer || cert.organization}
                          </p>
                        )}
                        {(cert.date || cert.issueDate) && (
                          <p
                            style={{
                              fontSize: "0.68rem",
                              color: "#0a84ff",
                              fontFamily: "'DM Sans', sans-serif",
                              marginTop: "0.15rem",
                            }}
                          >
                            {cert.date || cert.issueDate}
                          </p>
                        )}
                      </div>
                    ))}
                  </GlassCard>
                )}
                <GlassCard style={{ padding: "1.4rem" }}>
                  <p className="al-section-title">Overview</p>
                  {[
                    { icon: "⬡", label: "Skills", val: totalSkills },
                    { icon: "◈", label: "Roles", val: experience.length },
                    { icon: "◎", label: "Projects", val: projects.length },
                    {
                      icon: "✦",
                      label: "Achievements",
                      val: achievements.length,
                    },
                    {
                      icon: "❋",
                      label: "Certifications",
                      val: certifications.length,
                    },
                  ].map(({ icon, label, val }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.45rem 0",
                        borderBottom: "1px solid rgba(10,132,255,0.07)",
                        fontSize: "0.78rem",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>
                        {icon} {label}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#0a84ff",
                          background: "rgba(10,132,255,0.08)",
                          padding: "0.1rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </GlassCard>
              </div>
            </div>
            <style>{`
              @media (max-width: 800px) {
                .al-about-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* ── EXPERIENCE TAB ── */}
        {activeTab === "experience" && (
          <div className="al-fade-in">
            <GlassCard style={{ padding: "1.8rem 2rem" }}>
              <p className="al-section-title">Work Experience</p>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp.title || exp.role}
                    sub={`${exp.company || ""}${
                      exp.location ? " · " + exp.location : ""
                    }`}
                    period={
                      exp.startDate || exp.start
                        ? `${exp.startDate || exp.start} → ${
                            exp.current
                              ? "Present"
                              : exp.endDate || exp.end || "Present"
                          }`
                        : undefined
                    }
                    description={exp.description}
                    bullets={[
                      ...(Array.isArray(exp.responsibilities)
                        ? exp.responsibilities
                        : []),
                      ...(Array.isArray(exp.achievements)
                        ? exp.achievements
                        : []),
                    ]}
                  />
                ))
              ) : (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  No experience records yet.
                </p>
              )}
            </GlassCard>
          </div>
        )}

        {/* ── PROJECTS TAB ── */}
        {activeTab === "projects" && (
          <div className="al-fade-in">
            <div style={{ marginBottom: "1rem" }}>
              <p
                className="al-section-title"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#1c1c1e",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                Projects
              </p>
            </div>
            {projects.length > 0 ? (
              <div className="al-projects-grid">
                {projects.map((proj, i) => (
                  <ProjectCard key={i} proj={proj} />
                ))}
              </div>
            ) : (
              <GlassCard style={{ padding: "1.8rem" }}>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  No projects listed yet.
                </p>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── EDUCATION TAB ── */}
        {activeTab === "education" && (
          <div className="al-fade-in">
            <GlassCard
              style={{ padding: "1.8rem 2rem", marginBottom: "1.2rem" }}
            >
              <p className="al-section-title">Education</p>
              {education.length > 0 ? (
                education.map((edu, i) => (
                  <TimelineEntry
                    key={i}
                    heading={edu.degree || edu.field}
                    sub={edu.institution || edu.school}
                    period={
                      edu.startDate || edu.start
                        ? `${edu.startDate || edu.start} → ${
                            edu.current
                              ? "Present"
                              : edu.endDate || edu.end || ""
                          }`
                        : undefined
                    }
                    description={edu.description}
                    extra={
                      edu.gpa
                        ? `GPA: ${edu.gpa}`
                        : edu.score
                        ? `${edu.scoreType || "Score"}: ${edu.score}${
                            edu.outOf ? `/${edu.outOf}` : ""
                          }`
                        : undefined
                    }
                  />
                ))
              ) : (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  No education records yet.
                </p>
              )}
            </GlassCard>
            {certifications.length > 0 && (
              <GlassCard style={{ padding: "1.8rem 2rem" }}>
                <p className="al-section-title">Certifications</p>
                {certifications.map((cert, i) => (
                  <TimelineEntry
                    key={i}
                    heading={cert.title || cert.name}
                    sub={cert.issuer || cert.organization}
                    period={cert.date || cert.issueDate}
                  />
                ))}
              </GlassCard>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.70)",
          background: "rgba(255,255,255,0.50)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            color: "#9ca3af",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: "0.68rem",
            color: "#c4c4c6",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          APPLE LIQUID GLASS · THREE.JS
        </span>
      </div>
    </div>
  );
}