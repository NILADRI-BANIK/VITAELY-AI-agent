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
// ServerHubModel3D
// Floating holographic server hub — central hexagon core with
// orbiting channel nodes, connected by purple energy links,
// pulsing glow, slow rotation. Discord-blurple themed.
// ─────────────────────────────────────────────────────────────────
function ServerHubModel3D() {
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

      const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
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

      // ── Central hexagon core ──
      const coreGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.35, 6);
      const coreMat = new THREE.MeshPhongMaterial({
        color: 0x5865f2,
        emissive: 0x3c45a5,
        emissiveIntensity: 0.6,
        shininess: 90,
        specular: 0x99aab5,
        transparent: true,
        opacity: 0.9,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.rotation.x = Math.PI / 2.6;
      scene.add(core);

      // wireframe hex outline
      const coreWireGeo = new THREE.EdgesGeometry(
        new THREE.CylinderGeometry(1.03, 1.03, 0.37, 6),
      );
      const coreWireMat = new THREE.LineBasicMaterial({
        color: 0x7289da,
        transparent: true,
        opacity: 0.6,
      });
      const coreWire = new THREE.LineSegments(coreWireGeo, coreWireMat);
      coreWire.rotation.x = core.rotation.x;
      scene.add(coreWire);

      // inner glow disc
      const glowGeo = new THREE.CircleGeometry(1.4, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x5865f2,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      const glowDisc = new THREE.Mesh(glowGeo, glowMat);
      glowDisc.rotation.x = Math.PI / 2.6;
      scene.add(glowDisc);

      // ── Orbiting channel nodes ──
      const nodeDefs = [
        { r: 2.4, size: 0.16, color: 0x5865f2, speed: 0.35, phase: 0 },
        { r: 2.7, size: 0.12, color: 0x7289da, speed: -0.28, phase: Math.PI * 0.6 },
        { r: 2.2, size: 0.14, color: 0x23a55a, speed: 0.42, phase: Math.PI * 1.2 },
        { r: 2.9, size: 0.1, color: 0xf0b232, speed: -0.32, phase: Math.PI * 0.3 },
        { r: 2.5, size: 0.13, color: 0x99aab5, speed: 0.25, phase: Math.PI * 1.7 },
        { r: 2.6, size: 0.11, color: 0x5865f2, speed: -0.4, phase: Math.PI * 0.9 },
      ];

      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      const nodes = nodeDefs.map(({ r, size, color, phase }) => {
        const geo = new THREE.IcosahedronGeometry(size, 0);
        const mat = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.7,
          shininess: 100,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          Math.cos(phase) * r,
          Math.sin(phase) * 0.5,
          Math.sin(phase) * r,
        );
        orbitGroup.add(mesh);
        geometries.push(geo);
        materials.push(mat);
        return mesh;
      });

      // ── Energy link lines from core to each node ──
      const linkMat = new THREE.LineBasicMaterial({
        color: 0x5865f2,
        transparent: true,
        opacity: 0.25,
      });
      const links = nodes.map((node) => {
        const linkGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          node.position.clone(),
        ]);
        const line = new THREE.Line(linkGeo, linkMat);
        orbitGroup.add(line);
        geometries.push(linkGeo);
        return { line, node };
      });
      materials.push(linkMat);

      // ── Outer holographic rings ──
      const ringDefs = [
        { r: 3.1, tiltX: 0.5, tiltZ: 0.1, opacity: 0.28, speed: 0.15 },
        { r: 3.4, tiltX: 1.1, tiltZ: 0.7, opacity: 0.18, speed: -0.11 },
      ];
      const rings = ringDefs.map(({ r, tiltX, tiltZ, opacity }) => {
        const geo = new THREE.TorusGeometry(r, 0.008, 8, 100);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x7289da,
          transparent: true,
          opacity,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = tiltX;
        mesh.rotation.z = tiltZ;
        scene.add(mesh);
        geometries.push(geo);
        materials.push(mat);
        return mesh;
      });

      // ── Faint particle field ──
      const pCount = 160;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rad = 3.6 + Math.random() * 1.6;
        pPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = rad * Math.cos(phi);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x99aab5,
        size: 0.028,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);
      geometries.push(pGeo);
      materials.push(pMat);

      geometries.push(coreGeo, coreWireGeo, glowGeo);
      materials.push(coreMat, coreWireMat, glowMat);
      ringDefs.forEach(() => {}); // already pushed above

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      const purpleLight = new THREE.PointLight(0x5865f2, 4, 10);
      purpleLight.position.set(2, 2, 3);
      scene.add(purpleLight);

      const blurpleLight = new THREE.PointLight(0x7289da, 2, 8);
      blurpleLight.position.set(-3, -2, 2);
      scene.add(blurpleLight);

      const greenLight = new THREE.PointLight(0x23a55a, 1, 6);
      greenLight.position.set(0, -3, -2);
      scene.add(greenLight);

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
        t += 0.007;

        smoothX += (mouseX - smoothX) * 0.04;
        smoothY += (mouseY - smoothY) * 0.04;

        // slow rotation of core, mouse-reactive tilt
        core.rotation.z += 0.004;
        coreWire.rotation.z = core.rotation.z;
        glowDisc.rotation.z = core.rotation.z;

        core.rotation.y = smoothX * 0.3;
        coreWire.rotation.y = smoothX * 0.3;

        // pulse the core glow
        const pulse = 0.5 + Math.sin(t * 2) * 0.25;
        coreMat.emissiveIntensity = 0.4 + pulse * 0.4;
        glowMat.opacity = 0.08 + pulse * 0.08;

        // orbit the nodes around the hub
        orbitGroup.rotation.y = t * 0.25 + smoothX * 0.15;
        orbitGroup.rotation.x = smoothY * 0.1;

        nodeDefs.forEach((d, i) => {
          const angle = t * d.speed + d.phase;
          const node = nodes[i];
          node.position.x = Math.cos(angle) * d.r;
          node.position.z = Math.sin(angle) * d.r;
          node.position.y = Math.sin(t * 0.6 + i) * 0.4;
          node.rotation.x += 0.01;
          node.rotation.y += 0.015;
        });

        // update link line endpoints to follow nodes
        links.forEach(({ line, node }) => {
          const positions = line.geometry.attributes.position;
          positions.setXYZ(1, node.position.x, node.position.y, node.position.z);
          positions.needsUpdate = true;
        });

        // rings drift
        rings.forEach((ring, i) => {
          ring.rotation.z += ringDefs[i].speed * 0.01;
        });

        // particle drift
        particles.rotation.y = t * 0.03;

        // light pulse
        purpleLight.intensity = 3.5 + Math.sin(t * 1.6) * 1;
        blurpleLight.intensity = 1.6 + Math.cos(t * 1.3) * 0.5;

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

function ChannelNav({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.55rem",
        width: "100%",
        padding: "0.5rem 0.7rem",
        background: active ? "rgba(88,101,242,0.18)" : "transparent",
        border: "none",
        borderRadius: "6px",
        color: active ? "#F2F3F5" : "#949BA4",
        fontFamily: "'gg sans', 'Inter', sans-serif",
        fontSize: "0.85rem",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 180ms ease, color 180ms ease",
        marginBottom: "0.15rem",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#DBDEE1";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#949BA4";
        }
      }}
    >
      <span style={{ fontSize: "0.95rem", opacity: active ? 1 : 0.7 }}>#</span>
      {label}
    </button>
  );
}

function DCard({ children, style = {}, glow = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#2B2D31",
        border: `1px solid ${hov && glow ? "rgba(88,101,242,0.5)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "14px",
        padding: "1.3rem",
        boxShadow: hov
          ? "0 6px 20px rgba(88,101,242,0.15)"
          : "0 2px 8px rgba(0,0,0,0.25)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 180ms ease",
        ...style,
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
        gap: "0.55rem",
        marginBottom: "1.1rem",
        paddingBottom: "0.7rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          color: "#F2F3F5",
          fontWeight: 700,
          fontSize: "0.95rem",
          fontFamily: "'gg sans', 'Inter', sans-serif",
        }}
      >
        {title}
      </span>
      {count !== undefined && (
        <span
          style={{
            background: "rgba(88,101,242,0.2)",
            color: "#7289DA",
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "0.1rem 0.5rem",
            borderRadius: "999px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function SkillBadge({ skill }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block",
        background: hov ? "rgba(88,101,242,0.25)" : "rgba(88,101,242,0.12)",
        border: `1px solid ${hov ? "rgba(88,101,242,0.6)" : "rgba(88,101,242,0.25)"}`,
        color: hov ? "#EBEDFC" : "#B5BAC1",
        fontSize: "0.76rem",
        fontWeight: 600,
        padding: "0.28rem 0.75rem",
        borderRadius: "999px",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        transition: "all 150ms ease",
        cursor: "default",
      }}
    >
      {skill}
    </span>
  );
}

function StatusDot({ color }) {
  return (
    <span
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  );
}

function ContactPill({ label, href }) {
  if (!href || href === "#") return null;
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.4rem 0.85rem",
        borderRadius: "999px",
        background: "#2B2D31",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#DBDEE1",
        fontSize: "0.78rem",
        fontWeight: 600,
        fontFamily: "'gg sans', 'Inter', sans-serif",
        textDecoration: "none",
        marginRight: "0.5rem",
        marginBottom: "0.5rem",
        transition: "background 150ms ease, border-color 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(88,101,242,0.15)";
        e.currentTarget.style.borderColor = "rgba(88,101,242,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#2B2D31";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {label}
    </a>
  );
}

function TimelineEntry({ heading, sub, period, description, bullets = [], extra, isLast }) {
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
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #5865F2, #7289DA)",
            boxShadow: "0 0 8px rgba(88,101,242,0.6)",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "1px",
              flex: 1,
              minHeight: "42px",
              background: "rgba(88,101,242,0.2)",
              marginTop: "4px",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: "1.5rem" }}>
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
              color: "#F2F3F5",
              fontFamily: "'gg sans', 'Inter', sans-serif",
            }}
          >
            {heading}
          </span>
          {period && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#7289DA",
                background: "rgba(88,101,242,0.12)",
                padding: "0.15rem 0.6rem",
                borderRadius: "999px",
                whiteSpace: "nowrap",
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
              color: "#949BA4",
              fontWeight: 500,
              marginBottom: "0.4rem",
            }}
          >
            {sub}
          </p>
        )}
        {extra && (
          <p style={{ fontSize: "0.76rem", color: "#23A55A", marginBottom: "0.35rem" }}>
            {extra}
          </p>
        )}
        {description && (
          <p style={{ fontSize: "0.82rem", color: "#B5BAC1", lineHeight: 1.75 }}>
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
                  color: "#B5BAC1",
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

function ProjectCard({ proj }) {
  return (
    <DCard glow style={{ display: "flex", flexDirection: "column" }}>
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
            color: "#F2F3F5",
            margin: 0,
            fontFamily: "'gg sans', 'Inter', sans-serif",
          }}
        >
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
                fontWeight: 700,
                color: "#DBDEE1",
                textDecoration: "none",
                padding: "0.22rem 0.6rem",
                background: "#4E5058",
                borderRadius: "6px",
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
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
                padding: "0.22rem 0.6rem",
                background: "#5865F2",
                borderRadius: "6px",
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
            color: "#B5BAC1",
            lineHeight: 1.7,
            marginBottom: "0.8rem",
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
                fontWeight: 700,
                padding: "0.18rem 0.55rem",
                borderRadius: "999px",
                background: "rgba(88,101,242,0.15)",
                color: "#7289DA",
                border: "1px solid rgba(88,101,242,0.25)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </DCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────────────────────────
export default function DiscordDarkTemplate({ data = {} }) {
  const [activeNav, setActiveNav] = useState("overview");

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

  const navItems = [
    { id: "overview", label: "overview" },
    { id: "experience", label: "experience" },
    { id: "projects", label: "projects" },
    { id: "education", label: "education" },
    { id: "skills", label: "skills" },
  ];

  return (
    <div
      style={{
        fontFamily: "'gg sans', 'Inter', sans-serif",
        background: "#313338",
        minHeight: "100vh",
        color: "#F2F3F5",
        display: "flex",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #313338; }
        ::-webkit-scrollbar-thumb { background: #1E1F22; border-radius: 999px; }

        @keyframes dd-fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dd-glowPulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }
        .dd-fade { animation: dd-fadeSlide 220ms ease both; }

        .dd-hero-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 960px) {
          .dd-hero-grid { grid-template-columns: 1fr; }
          .dd-model-panel { height: 260px !important; }
        }
        .dd-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .dd-projects-grid { grid-template-columns: 1fr; }
        }

        .dd-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1.1rem;
          border-radius: 8px;
          border: none;
          background: #5865F2;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 150ms ease;
          text-decoration: none;
        }
        .dd-btn:hover { background: #4752C4; }
        .dd-btn-secondary {
          background: #4E5058;
        }
        .dd-btn-secondary:hover { background: #5c5e66; }
      `}</style>

      {/* ── LEFT SIDEBAR ── */}
      <aside
        style={{
          width: "230px",
          minWidth: "230px",
          background: "#1E1F22",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Profile block */}
        <div
          style={{
            padding: "1.4rem 1rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #5865F2, #7289DA)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {name.charAt(0).toUpperCase()}
              <span
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#23A55A",
                  border: "2px solid #1E1F22",
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#F2F3F5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#949BA4",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <StatusDot color="#23A55A" /> Online
              </div>
            </div>
          </div>
        </div>

        {/* Channels nav */}
        <nav style={{ padding: "0.9rem 0.6rem", flex: 1 }}>
          <div
            style={{
              fontSize: "0.62rem",
              color: "#949BA4",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0 0.4rem",
              marginBottom: "0.5rem",
            }}
          >
            Portfolio Channels
          </div>
          {navItems.map((item) => (
            <ChannelNav
              key={item.id}
              label={item.label}
              active={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
            />
          ))}
        </nav>

        {/* Contact links */}
        <div
          style={{
            padding: "0.9rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "0.62rem",
              color: "#949BA4",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}
          >
            Direct Messages
          </div>
          {email && (
            <a
              href={`mailto:${email}`}
              style={{
                display: "block",
                fontSize: "0.74rem",
                color: "#B5BAC1",
                textDecoration: "none",
                marginBottom: "0.4rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              ✉ {email}
            </a>
          )}
          {phone && (
            <div style={{ fontSize: "0.74rem", color: "#949BA4", marginBottom: "0.4rem" }}>
              ☎ {phone}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {github && (
              <a href={safeUrl(github)} target="_blank" rel="noopener noreferrer" className="dd-btn dd-btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.68rem" }}>
                GitHub
              </a>
            )}
            {linkedin && (
              <a href={safeUrl(linkedin)} target="_blank" rel="noopener noreferrer" className="dd-btn dd-btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.68rem" }}>
                LinkedIn
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
          <div className="dd-fade">
            <div className="dd-hero-grid" style={{ marginBottom: "1.5rem" }}>
              {/* Profile info */}
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#7289DA",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  # portfolio-overview
                </div>
                <h1
                  style={{
                    fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
                    fontWeight: 800,
                    color: "#F2F3F5",
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
                    color: "#7289DA",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  {title}
                </div>
                {summary && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.8,
                      color: "#B5BAC1",
                      maxWidth: "560px",
                      marginBottom: "1.2rem",
                    }}
                  >
                    {summary}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <ContactPill label="Twitter" href={twitter ? safeUrl(twitter) : ""} />
                  <ContactPill label="Portfolio" href={website ? safeUrl(website) : ""} />
                  <ContactPill label="LeetCode" href={leetcode ? safeUrl(leetcode) : ""} />
                  <ContactPill label="HackerRank" href={hackerrank ? safeUrl(hackerrank) : ""} />
                </div>
              </div>

              {/* 3D Model panel */}
              <div
                className="dd-model-panel"
                style={{
                  background: "#1E1F22",
                  border: "1px solid rgba(88,101,242,0.15)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  height: "300px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at center, rgba(88,101,242,0.25) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "0.7rem",
                    left: "0.9rem",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#23A55A",
                      animation: "dd-glowPulse 2s ease-in-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: "#23A55A",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    SERVER.HUB LIVE
                  </span>
                </div>
                <div style={{ width: "100%", height: "100%", zIndex: 1, position: "relative" }}>
                  <ServerHubModel3D />
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
              {[
                { label: "Skills", val: totalSkills, color: "#5865F2" },
                { label: "Projects", val: projects.length, color: "#23A55A" },
                { label: "Experience", val: experience.length, color: "#F0B232" },
                { label: "Certs", val: certifications.length, color: "#F23F43" },
              ].map(({ label, val, color }) => (
                <DCard key={label} style={{ padding: "1rem 1.2rem" }}>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#949BA4",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color,
                      fontFamily: "'gg sans', 'Inter', sans-serif",
                    }}
                  >
                    {val}
                  </div>
                </DCard>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
              {skillGroups.length > 0 && (
                <DCard>
                  <SectionHeader title="Top Skills" />
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {skillGroups
                      .flatMap((g) => (Array.isArray(g?.skills) ? g.skills : []))
                      .slice(0, 10)
                      .map((skill, i) => (
                        <SkillBadge key={i} skill={skill} />
                      ))}
                  </div>
                </DCard>
              )}
              {hobbies.length > 0 && (
                <DCard>
                  <SectionHeader title="Interests" />
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {hobbies.map((h, i) => (
                      <SkillBadge key={i} skill={h} />
                    ))}
                  </div>
                </DCard>
              )}
            </div>
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeNav === "experience" && (
          <div className="dd-fade">
            <SectionHeader title="Experience" count={experience.length} />
            <DCard style={{ marginBottom: "1.5rem" }}>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={exp?.company || ""}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "Present" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                    isLast={i === experience.length - 1}
                  />
                ))
              ) : (
                <p style={{ fontSize: "0.85rem", color: "#949BA4" }}>
                  No experience added yet.
                </p>
              )}
            </DCard>

            {achievements.length > 0 && (
              <>
                <SectionHeader title="Achievements" count={achievements.length} />
                <DCard>
                  {achievements.map((ach, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: i < achievements.length - 1 ? "0.9rem" : 0,
                        paddingBottom: i < achievements.length - 1 ? "0.9rem" : 0,
                        borderBottom:
                          i < achievements.length - 1
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "none",
                      }}
                    >
                      <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "#F2F3F5" }}>
                        🏆 {ach?.title || ""}
                      </p>
                      {ach?.description && (
                        <p style={{ fontSize: "0.78rem", color: "#B5BAC1", marginTop: "0.2rem" }}>
                          {ach.description}
                        </p>
                      )}
                    </div>
                  ))}
                </DCard>
              </>
            )}
          </div>
        )}

        {/* ── PROJECTS ── */}
        {activeNav === "projects" && (
          <div className="dd-fade">
            <SectionHeader title="Projects" count={projects.length} />
            {projects.length > 0 ? (
              <div className="dd-projects-grid">
                {projects.map((proj, i) => (
                  <ProjectCard key={i} proj={proj} />
                ))}
              </div>
            ) : (
              <DCard>
                <p style={{ fontSize: "0.85rem", color: "#949BA4" }}>
                  No projects added yet.
                </p>
              </DCard>
            )}
          </div>
        )}

        {/* ── EDUCATION ── */}
        {activeNav === "education" && (
          <div className="dd-fade">
            <SectionHeader title="Education" count={education.length} />
            <DCard style={{ marginBottom: "1.5rem" }}>
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
                    isLast={i === education.length - 1}
                  />
                ))
              ) : (
                <p style={{ fontSize: "0.85rem", color: "#949BA4" }}>
                  No education added yet.
                </p>
              )}
            </DCard>

            {certifications.length > 0 && (
              <>
                <SectionHeader title="Certifications" count={certifications.length} />
                <DCard>
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
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "none",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F2F3F5" }}>
                          {cert?.title || cert?.name || ""}
                        </span>
                        {(cert?.issuer || cert?.organization) && (
                          <span style={{ fontSize: "0.78rem", color: "#949BA4", marginLeft: "0.4rem" }}>
                            — {cert.issuer || cert.organization}
                          </span>
                        )}
                      </div>
                      {(cert?.date || cert?.issueDate) && (
                        <span style={{ fontSize: "0.75rem", color: "#7289DA" }}>
                          {cert.date || cert.issueDate}
                        </span>
                      )}
                    </div>
                  ))}
                </DCard>
              </>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeNav === "skills" && (
          <div className="dd-fade">
            <SectionHeader title="Skills & Technologies" count={totalSkills} />
            {skillGroups.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {skillGroups.map((group, gi) => (
                  <DCard key={gi}>
                    {group?.category && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#7289DA",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: "0.6rem",
                        }}
                      >
                        {group.category}
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {(Array.isArray(group?.skills) ? group.skills : []).map(
                        (skill, si) => (
                          <SkillBadge key={si} skill={skill} />
                        ),
                      )}
                    </div>
                  </DCard>
                ))}
              </div>
            ) : (
              <DCard>
                <p style={{ fontSize: "0.85rem", color: "#949BA4" }}>
                  No skills added yet.
                </p>
              </DCard>
            )}
          </div>
        )}
      </main>
    </div>
  );
}