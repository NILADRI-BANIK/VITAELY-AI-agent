"use client";

import { useEffect, useRef, useState } from "react";

const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

// ─────────────────────────────────────────────
// Three.js — Original geometric dragon + throne silhouette + embers/snow
// All shapes are hand-built primitives; no copyrighted or trademarked assets.
// ─────────────────────────────────────────────
function GotDragonScene3D() {
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
      scene.fog = new THREE.FogExp2(0x0b0b0b, 0.045);

      const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
      camera.position.set(0, 0.6, 6.5);
      camera.lookAt(0.8, 0.2, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Iron-Throne-like silhouette (abstract stacked blades, original) ──
      const throneGroup = new THREE.Group();
      throneGroup.position.set(2.0, -0.9, -1.2);
      scene.add(throneGroup);

      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x2f2f2f,
        metalness: 0.85,
        roughness: 0.35,
        emissive: 0xd4af37,
        emissiveIntensity: 0.04,
      });
      mats.push(bladeMat);

      for (let i = 0; i < 26; i++) {
        const h = 0.7 + Math.random() * 1.7;
        const w = 0.05 + Math.random() * 0.04;
        const geo = new THREE.BoxGeometry(w, h, w * 0.6);
        geos.push(geo);
        const blade = new THREE.Mesh(geo, bladeMat);
        const angle = (i / 26) * Math.PI * 1.15 - Math.PI * 0.575;
        const radius = 1.35;
        blade.position.set(Math.sin(angle) * radius, h / 2, Math.cos(angle) * radius * 0.4 - 0.3);
        blade.rotation.z = (Math.random() - 0.5) * 0.5;
        blade.rotation.y = angle;
        throneGroup.add(blade);
      }

      // seat base
      const seatGeo = new THREE.BoxGeometry(1.6, 0.35, 1.1);
      geos.push(seatGeo);
      const seatMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.7,
        roughness: 0.5,
      });
      mats.push(seatMat);
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(0, 0.1, 0.1);
      throneGroup.add(seat);
      
// ── Royal Coin (rotating medallion, original geometric design) ──
      const coinGroup = new THREE.Group();
      coinGroup.position.set(2.1, 1.3, 0.6);
      scene.add(coinGroup);

      const coinGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.09, 48);
      geos.push(coinGeo);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.22,
        emissive: 0xd4af37,
        emissiveIntensity: 0.08,
      });
      mats.push(coinMat);
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 2.4;
      coinGroup.add(coin);

      // engraved ring detail
      const ringGeo = new THREE.TorusGeometry(0.52, 0.025, 12, 48);
      geos.push(ringGeo);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xbfc5c8,
        metalness: 0.9,
        roughness: 0.3,
      });
      mats.push(ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.4;
      ring.position.y = 0.046;
      coinGroup.add(ring);

      // center emblem (sigil-like crossed shapes, original)
      const emblemGeo = new THREE.OctahedronGeometry(0.22, 0);
      geos.push(emblemGeo);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0x7a1015,
        metalness: 0.6,
        roughness: 0.35,
        emissive: 0x7a1015,
        emissiveIntensity: 0.15,
      });
      mats.push(emblemMat);
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.position.y = 0.05;
      coinGroup.add(emblem);

      // ── Embers ──
      const emberCount = 110;
      const emberPos = new Float32Array(emberCount * 3);
      for (let i = 0; i < emberCount; i++) {
        emberPos[i * 3] = (Math.random() - 0.5) * 7;
        emberPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
        emberPos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      const emberGeo = new THREE.BufferGeometry();
      emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
      geos.push(emberGeo);
      const emberMat = new THREE.PointsMaterial({
        color: 0xff8c42,
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      mats.push(emberMat);
      const embers = new THREE.Points(emberGeo, emberMat);
      scene.add(embers);

      // ── Snow ──
      const snowCount = 140;
      const snowPos = new Float32Array(snowCount * 3);
      for (let i = 0; i < snowCount; i++) {
        snowPos[i * 3] = (Math.random() - 0.5) * 8;
        snowPos[i * 3 + 1] = Math.random() * 5;
        snowPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
      const snowGeo = new THREE.BufferGeometry();
      snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
      geos.push(snowGeo);
      const snowMat = new THREE.PointsMaterial({
        color: 0xbfc5c8,
        size: 0.018,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      });
      mats.push(snowMat);
      const snow = new THREE.Points(snowGeo, snowMat);
      scene.add(snow);

      // ── Lights (torch + moonlight) ──
      scene.add(new THREE.AmbientLight(0x1a1a1a, 1.1));
      const torch1 = new THREE.PointLight(0xff8c42, 2.2, 12);
      torch1.position.set(-2, 1.2, 2);
      scene.add(torch1);
      const torch2 = new THREE.PointLight(0xd4af37, 1.4, 12);
      torch2.position.set(2, -0.5, 1.5);
      scene.add(torch2);
      const moon = new THREE.DirectionalLight(0x243b6b, 0.6);
      moon.position.set(0, 5, -3);
      scene.add(moon);

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

      let t = 0;
      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.006;

        smx += (mx - smx) * 0.02;
        smy += (my - smy) * 0.02;

        // coin slow spin + float
        coinGroup.rotation.y = t * 0.6 + smx * 0.2;
        coinGroup.position.y = 1.3 + Math.sin(t * 0.6) * 0.12;
        emblem.rotation.z = t * 0.3;

        // throne slow rotation
        throneGroup.rotation.y = Math.sin(t * 0.15) * 0.12 + smx * 0.05;

        torch1.intensity = 2.2 + Math.sin(t * 2.1) * 0.6;
        torch2.intensity = 1.4 + Math.cos(t * 1.8) * 0.5;

        embers.rotation.y = t * 0.02;
        const ep = emberGeo.attributes.position;
        for (let i = 0; i < emberCount; i++) {
          ep.array[i * 3 + 1] += 0.002;
          if (ep.array[i * 3 + 1] > 2.5) ep.array[i * 3 + 1] = -2.5;
        }
        ep.needsUpdate = true;

        const sp = snowGeo.attributes.position;
        for (let i = 0; i < snowCount; i++) {
          sp.array[i * 3 + 1] -= 0.006;
          sp.array[i * 3] += Math.sin(t + i) * 0.0015;
          if (sp.array[i * 3 + 1] < -2.5) sp.array[i * 3 + 1] = 2.5;
        }
        sp.needsUpdate = true;

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

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SealHeading({ children, color = "#D4AF37" }) {
  return (
    <div style={{ marginBottom: "1.8rem", textAlign: "center" }}>
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.3rem, 3vw, 2rem)",
          fontWeight: 700,
          color: "#EDE6D6",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textShadow: `0 0 18px ${color}55`,
          margin: "0 0 0.6rem",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "2px",
          width: "90px",
          margin: "0 auto",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </div>
  );
}

function StonePanel({ children, style = {}, glow = "#D4AF37" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "linear-gradient(160deg, #1a1a1a 0%, #14120f 100%)",
        border: `1px solid ${hov ? glow + "77" : "#3a352b"}`,
        borderRadius: "6px",
        padding: "1.6rem",
        boxShadow: hov
          ? `0 0 22px ${glow}22, inset 0 0 30px rgba(0,0,0,0.5)`
          : "inset 0 0 30px rgba(0,0,0,0.4)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.3s ease",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "6px",
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function ShieldBadge({ skill, index }) {
  const colors = ["#D4AF37", "#7A1015", "#243B6B", "#1F6B4F", "#BFC5C8"];
  const c = colors[index % colors.length];
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        background: hov ? `${c}1f` : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? c : c + "55"}`,
        borderRadius: "4px",
        color: hov ? c : "#C9C2B0",
        fontFamily: "'EB Garamond', serif",
        fontSize: "0.85rem",
        fontWeight: 600,
        padding: "0.35rem 0.85rem",
        marginRight: "0.45rem",
        marginBottom: "0.45rem",
        transition: "all 0.2s ease",
        textShadow: hov ? `0 0 8px ${c}` : "none",
        letterSpacing: "0.02em",
      }}
    >
      🛡 {skill}
    </span>
  );
}

function RavenChip({ icon, label, href }) {
  const isLink = href && href !== "#";
  const inner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        background: "rgba(212,175,55,0.08)",
        border: "1px solid rgba(212,175,55,0.35)",
        borderRadius: "4px",
        color: "#D4AF37",
        fontFamily: "'EB Garamond', serif",
        fontSize: "0.9rem",
        fontWeight: 600,
        padding: "0.5rem 1rem",
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(212,175,55,0.18)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(212,175,55,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(212,175,55,0.08)";
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

function KingdomTimelineEntry({ heading, sub, period, description, color = "#D4AF37" }) {
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "1.3rem",
        borderLeft: `2px solid ${color}44`,
        marginBottom: "1.4rem",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "-7px",
          top: "0.3rem",
          width: "12px",
          height: "12px",
          background: color,
          transform: "rotate(45deg)",
          boxShadow: `0 0 10px ${color}88`,
        }}
      />
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#EDE6D6",
          marginBottom: "0.2rem",
        }}
      >
        {heading}
      </div>
      {sub && (
        <div style={{ fontFamily: "'EB Garamond', serif", fontSize: "0.9rem", color, fontWeight: 600 }}>
          {sub}
        </div>
      )}
      {period && (
        <div
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "0.78rem",
            color: "#8a8272",
            marginTop: "0.25rem",
            letterSpacing: "0.04em",
          }}
        >
          {period}
        </div>
      )}
      {description && (
        <p
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "0.92rem",
            color: "#B8B0A0",
            lineHeight: 1.75,
            margin: "0.5rem 0 0",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function ArchiveProjectCard({ proj, color }) {
  return (
    <StonePanel glow={color}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.6rem" }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#EDE6D6",
          }}
        >
          🗡 {proj?.title || "Project"}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
          {proj?.liveUrl && (
            <a
              href={safeUrl(proj.liveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: `${color}22`,
                border: `1px solid ${color}55`,
                color,
                fontSize: "0.62rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.05em",
              }}
            >
              VIEW
            </a>
          )}
          {proj?.github && (
            <a
              href={safeUrl(proj.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#B8B0A0",
                fontSize: "0.62rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.05em",
              }}
            >
              CODE
            </a>
          )}
        </div>
      </div>
      {proj?.description && (
        <p
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "0.92rem",
            lineHeight: 1.75,
            color: "#B8B0A0",
            margin: "0 0 0.8rem",
          }}
        >
          {proj.description}
        </p>
      )}
      {Array.isArray(proj?.techStack) && proj.techStack.length > 0 && (
        <div>
          {proj.techStack.map((tech, ti) => (
            <ShieldBadge key={ti} skill={tech} index={ti} />
          ))}
        </div>
      )}
    </StonePanel>
  );
}

// ─────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────
export default function GameOfThronesTemplate({ data = {} }) {
  const [activeTab, setActiveTab] = useState("about");

  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const name = hero.name || "Your Name";
  const title = hero.title || "Your Title";
  const summary =
    hero.summary || hero.tagline || "Forged through dedication. Driven by honor.";

  const email = contact.email || "";
  const phone = contact.phone || "";
  const linkedin = contact.linkedin || "";
  const github = contact.github || "";
  const twitter = contact.twitter || "";
  const website = contact.portfolioUrl || "";

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
    { id: "about", label: "About" },
    { id: "experience", label: "Campaigns" },
    { id: "projects", label: "Archive" },
    { id: "education", label: "Citadel" },
  ];

  const CC = ["#D4AF37", "#7A1015", "#243B6B", "#1F6B4F", "#BFC5C8"];
  const getCC = (i) => CC[i % CC.length];

  return (
    <div
      style={{
        fontFamily: "'EB Garamond', serif",
        background: "#0B0B0B",
        minHeight: "100vh",
        color: "#B8B0A0",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=EB+Garamond:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0B0B0B; }
        ::-webkit-scrollbar-thumb { background: #D4AF3755; border-radius: 2px; }

        @keyframes got-fade-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes got-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.45; }
        }
        @keyframes got-fog {
          0%   { transform: translateX(-5%); opacity:0.35; }
          50%  { transform: translateX(5%); opacity:0.55; }
          100% { transform: translateX(-5%); opacity:0.35; }
        }
        .got-page { animation: got-fade-up 0.6s ease both; }
        .got-tab  { animation: got-fade-up 0.35s ease both; }
      `}</style>

      {/* Fog overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(60,55,45,0.25) 0%, transparent 60%)",
          animation: "got-fog 12s ease-in-out infinite",
        }}
      />

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg,#141210 0%,#0F0D0B 45%,#0B0B0B 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "45vw",
            height: "45vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(122,16,21,0.08) 0%,transparent 65%)",
            filter: "blur(50px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(212,175,55,0.06) 0%,transparent 65%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      <div className="got-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(11,11,11,0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
            padding: "0.85rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.6rem",
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#D4AF37",
              textShadow: "0 0 12px rgba(212,175,55,0.5)",
            }}
          >
            ⚔ {name.split(" ")[0].toUpperCase()}
            <span style={{ color: "#7A1015", margin: "0 0.4rem" }}>·</span>
            <span style={{ color: "#B8B0A0", fontSize: "0.7rem" }}>{title.toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(122,16,21,0.15))"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeTab === tab.id ? "#D4AF37" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "3px",
                  color: activeTab === tab.id ? "#D4AF37" : "#8a8272",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.5rem 1.1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === tab.id ? "0 0 12px rgba(212,175,55,0.3)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          style={{
            position: "relative",
            minHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <GotDragonScene3D />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(to right, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.5) 55%, rgba(11,11,11,0.1) 100%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2, padding: "4rem 2.5rem", maxWidth: "620px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "3px",
                padding: "0.3rem 0.9rem",
                marginBottom: "1.4rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#D4AF37",
                  transform: "rotate(45deg)",
                  boxShadow: "0 0 8px #D4AF37",
                  display: "inline-block",
                  animation: "got-pulse 2.5s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.6rem",
                  color: "#D4AF37",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                }}
              >
                HOUSE PORTFOLIO
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
                fontWeight: 800,
                color: "#EDE6D6",
                letterSpacing: "0.01em",
                lineHeight: 1.1,
                margin: "0 0 0.6rem",
                textShadow: "0 0 24px rgba(212,175,55,0.35)",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(0.75rem, 1.6vw, 1rem)",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                color: "#7A1015",
                textShadow: "0 0 12px rgba(122,16,21,0.5)",
              }}
            >
              {title}
            </div>

            {summary && (
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  color: "#B8B0A0",
                  maxWidth: "480px",
                  marginBottom: "2rem",
                  borderLeft: "2px solid #D4AF3755",
                  paddingLeft: "1rem",
                }}
              >
                &ldquo;{summary}&rdquo;
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {email && <RavenChip icon="✉" label="Raven" href={`mailto:${email}`} />}
              {phone && <RavenChip icon="☎" label={phone} href="" />}
              {github && <RavenChip icon="⚒" label="GitHub" href={safeUrl(github)} />}
              {linkedin && <RavenChip icon="🛡" label="LinkedIn" href={safeUrl(linkedin)} />}
              {twitter && <RavenChip icon="𝕏" label="Twitter" href={safeUrl(twitter)} />}
              {website && <RavenChip icon="⌘" label="Website" href={safeUrl(website)} />}
            </div>
          </div>

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
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.55rem",
                color: "rgba(212,175,55,0.4)",
                letterSpacing: "0.22em",
              }}
            >
              DESCEND
            </span>
            <div
              style={{
                width: "1px",
                height: "36px",
                background: "linear-gradient(to bottom,#D4AF37,transparent)",
                animation: "got-pulse 2.5s ease-in-out infinite",
              }}
            />
          </div>
        </section>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2.5rem 6rem" }}>
          {/* ABOUT */}
          {activeTab === "about" && (
            <div className="got-tab">
              <SealHeading>The Realm</SealHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: "1.5rem", alignItems: "start" }}>
                <div>
                  {skillGroups.length > 0 && (
                    <StonePanel style={{ marginBottom: "1.2rem" }} glow="#243B6B">
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#5B7FBB",
                          textTransform: "uppercase",
                          marginBottom: "1rem",
                        }}
                      >
                        ⚔ Knight&apos;s Skills
                      </div>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.8rem" }}>
                          {group?.category && (
                            <div
                              style={{
                                fontFamily: "'EB Garamond', serif",
                                fontSize: "0.85rem",
                                color: "#B8B0A0",
                                marginBottom: "0.4rem",
                                fontStyle: "italic",
                              }}
                            >
                              {group.category}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {(Array.isArray(group?.skills) ? group.skills : []).map((skill, si) => (
                              <ShieldBadge key={si} skill={skill} index={si} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </StonePanel>
                  )}
                  {certifications.length > 0 && (
                    <StonePanel glow="#1F6B4F" style={{ marginBottom: "1.2rem" }}>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#3A9E77",
                          textTransform: "uppercase",
                          marginBottom: "1rem",
                        }}
                      >
                        📜 Citadel Chains
                      </div>
                      {certifications.map((cert, i) => (
                        <div
                          key={i}
                          style={{
                            borderBottom: i < certifications.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            paddingBottom: "0.6rem",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "#EDE6D6",
                              marginBottom: "0.15rem",
                              fontFamily: "'EB Garamond', serif",
                            }}
                          >
                            {cert?.title || cert?.name || ""}
                          </div>
                          {(cert?.issuer || cert?.organization) && (
                            <div style={{ fontSize: "0.8rem", color: "#3A9E77", fontFamily: "'EB Garamond', serif" }}>
                              {cert.issuer || cert.organization}
                              {(cert?.date || cert?.issueDate) && ` · ${cert.date || cert.issueDate}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </StonePanel>
                  )}
                  {achievements.length > 0 && (
                    <StonePanel glow="#D4AF37">
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#D4AF37",
                          textTransform: "uppercase",
                          marginBottom: "1rem",
                        }}
                      >
                        👑 Legendary Deeds
                      </div>
                      {achievements.map((ach, i) => (
                        <div
                          key={i}
                          style={{
                            borderBottom: i < achievements.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            paddingBottom: "0.6rem",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#EDE6D6", fontFamily: "'EB Garamond', serif" }}>
                            ✦ {ach?.title || ""}
                          </div>
                          {ach?.description && (
                            <div style={{ fontSize: "0.85rem", color: "#B8B0A0", marginTop: "0.2rem", fontFamily: "'EB Garamond', serif" }}>
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </StonePanel>
                  )}
                </div>

                <StonePanel glow="#7A1015">
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: "#B33A41",
                      textTransform: "uppercase",
                      marginBottom: "1rem",
                    }}
                  >
                    Royal Ledger
                  </div>
                  {[
                    { l: "Skills", v: totalSkills, c: "#D4AF37" },
                    { l: "Projects", v: projects.length, c: "#7A1015" },
                    { l: "Campaigns", v: experience.length, c: "#243B6B" },
                    { l: "Citadel", v: education.length, c: "#1F6B4F" },
                    { l: "Chains", v: certifications.length, c: "#BFC5C8" },
                  ].map(({ l, v, c }) => (
                    <div
                      key={l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        paddingBottom: "0.55rem",
                        marginBottom: "0.55rem",
                      }}
                    >
                      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "0.88rem", color: "#B8B0A0" }}>
                        {l}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: c,
                          textShadow: `0 0 10px ${c}88`,
                        }}
                      >
                        {String(v).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </StonePanel>
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="got-tab">
              <SealHeading>War Campaigns</SealHeading>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <KingdomTimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={`${exp?.company || ""}${exp?.location ? ` · ${exp.location}` : ""}`}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "PRESENT" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                    color={getCC(i)}
                  />
                ))
              ) : (
                <StonePanel>
                  <p style={{ color: "#8a8272", fontSize: "0.9rem" }}>No campaigns recorded yet.</p>
                </StonePanel>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <div className="got-tab">
              <SealHeading>Royal Archive</SealHeading>
              {projects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: "1.2rem" }}>
                  {projects.map((proj, i) => (
                    <ArchiveProjectCard key={i} proj={proj} color={getCC(i)} />
                  ))}
                </div>
              ) : (
                <StonePanel>
                  <p style={{ color: "#8a8272", fontSize: "0.9rem" }}>No records in the archive yet.</p>
                </StonePanel>
              )}
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <div className="got-tab">
              <SealHeading>Citadel Records</SealHeading>
              {education.length > 0 ? (
                education.map((edu, i) => (
                  <KingdomTimelineEntry
                    key={i}
                    heading={edu?.degree || "Degree"}
                    sub={edu?.institution || ""}
                    period={
                      edu?.startDate
                        ? `${edu.startDate} → ${edu?.current ? "Present" : edu?.endDate || ""}`
                        : undefined
                    }
                    description={
                      edu?.score
                        ? `${edu?.scoreType || "Score"}: ${edu.score}${edu?.outOf ? `/${edu.outOf}` : ""}${
                            edu?.description ? " — " + edu.description : ""
                          }`
                        : edu?.description
                    }
                    color={getCC(i + 2)}
                  />
                ))
              ) : (
                <StonePanel>
                  <p style={{ color: "#8a8272", fontSize: "0.9rem" }}>No records at the Citadel yet.</p>
                </StonePanel>
              )}

              {certifications.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <h2>Maester&apos;s Chains</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "1rem" }}>
                    {certifications.map((cert, i) => (
                      <StonePanel key={i} glow={getCC(i + 4)}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "#EDE6D6",
                            marginBottom: "0.25rem",
                            fontFamily: "'EB Garamond', serif",
                          }}
                        >
                          {cert?.title || cert?.name || ""}
                        </div>
                        {(cert?.issuer || cert?.organization) && (
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: getCC(i + 4),
                              fontFamily: "'EB Garamond', serif",
                              fontWeight: 600,
                            }}
                          >
                            {cert.issuer || cert.organization}
                            {(cert?.date || cert?.issueDate) && ` · ${cert.date || cert.issueDate}`}
                          </div>
                        )}
                      </StonePanel>
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
            borderTop: "1px solid rgba(212,175,55,0.15)",
            background: "rgba(11,11,11,0.92)",
            padding: "1.3rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.82rem",
              color: "#D4AF37",
              letterSpacing: "0.08em",
              textShadow: "0 0 10px rgba(212,175,55,0.4)",
            }}
          >
            HOUSE {name.toUpperCase()}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.55rem",
              color: "rgba(212,175,55,0.35)",
              letterSpacing: "0.18em",
            }}
          >
            WINTER IS COMING · THREE.JS
          </span>
        </footer>
      </div>
    </div>
  );
}