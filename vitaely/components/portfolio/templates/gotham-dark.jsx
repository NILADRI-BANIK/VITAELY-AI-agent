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
// Three.js — Holographic Command Console
// Rotating wireframe globe core, radar sweep ring,
// floating glass HUD panels, drifting dust, scan lines.
// ─────────────────────────────────────────────
function HoloConsole3D() {
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

      const width = mountRef.current.clientWidth || 480;
      const height = mountRef.current.clientHeight || 480;

      const scene = new THREE.Scene();
      scene.background = null;
      scene.fog = new THREE.FogExp2(0x030303, 0.045);

      const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
      camera.position.set(0, 1.4, 6.2);
      camera.lookAt(0, 0.6, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const rig = new THREE.Group();
      scene.add(rig);

      // ── Metallic base platform ──
      const baseGeo = new THREE.CylinderGeometry(1.7, 1.9, 0.14, 48);
      geos.push(baseGeo);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x141414,
        metalness: 0.85,
        roughness: 0.35,
      });
      mats.push(baseMat);
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -1.1;
      rig.add(base);

      const rimGeo = new THREE.TorusGeometry(1.9, 0.015, 12, 64);
      geos.push(rimGeo);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6 });
      mats.push(rimMat);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -1.03;
      rig.add(rim);

      // ── Central wireframe core (globe) ──
      const coreGroup = new THREE.Group();
      coreGroup.position.y = 0.5;
      rig.add(coreGroup);

      const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
      geos.push(coreGeo);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      });
      mats.push(coreMat);
      const core = new THREE.Mesh(coreGeo, coreMat);
      coreGroup.add(core);

      const coreInnerGeo = new THREE.IcosahedronGeometry(0.5, 1);
      geos.push(coreInnerGeo);
      const coreInnerMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      mats.push(coreInnerMat);
      const coreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
      coreGroup.add(coreInner);

      // node points on the outer core
      const nodeCount = 40;
      const nodePos = new Float32Array(nodeCount * 3);
      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.85;
        nodePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        nodePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        nodePos[i * 3 + 2] = r * Math.cos(phi);
      }
      const nodeGeo = new THREE.BufferGeometry();
      nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
      geos.push(nodeGeo);
      const nodeMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.045,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      });
      mats.push(nodeMat);
      coreGroup.add(new THREE.Points(nodeGeo, nodeMat));

      // ── Radar sweep ring on the base ──
      const radarGeo = new THREE.RingGeometry(0.3, 1.75, 64);
      geos.push(radarGeo);
      const radarMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        vertexShader: `
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }`,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vUv;
          void main(){
            vec2 c = vUv - 0.5;
            float ang = atan(c.y, c.x);
            float sweep = mod(ang - uTime * 1.1, 6.28318);
            float trail = smoothstep(1.4, 0.0, sweep);
            float ringLine = smoothstep(0.0, 0.02, abs(length(c) - 0.48)) * 0.0;
            vec3 col = mix(vec3(0.03,0.03,0.03), vec3(0.83,0.69,0.22), trail * 0.6);
            float a = trail * 0.55 + ringLine;
            gl_FragColor = vec4(col, a);
          }`,
      });
      mats.push(radarMat);
      const radar = new THREE.Mesh(radarGeo, radarMat);
      radar.rotation.x = -Math.PI / 2;
      radar.position.y = -1.02;
      rig.add(radar);

      // faint static rings
      [0.9, 1.3, 1.7].forEach((radius) => {
        const rg = new THREE.RingGeometry(radius - 0.006, radius, 64);
        geos.push(rg);
        const rm = new THREE.MeshBasicMaterial({
          color: 0xd4af37,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
        });
        mats.push(rm);
        const r = new THREE.Mesh(rg, rm);
        r.rotation.x = -Math.PI / 2;
        r.position.y = -1.015;
        rig.add(r);
      });

      // ── Floating glass HUD panels ──
      const panelMake = (w, h, x, y, z, ry) => {
        const pg = new THREE.PlaneGeometry(w, h);
        geos.push(pg);
        const pm = new THREE.MeshBasicMaterial({
          color: 0x0b0f19,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        mats.push(pm);
        const panel = new THREE.Mesh(pg, pm);
        panel.position.set(x, y, z);
        panel.rotation.y = ry;
        rig.add(panel);

        const bg = new THREE.EdgesGeometry(pg);
        geos.push(bg);
        const bm = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 });
        mats.push(bm);
        panel.add(new THREE.LineSegments(bg, bm));

        // scan-line stripes
        for (let i = 0; i < 4; i++) {
          const sg = new THREE.PlaneGeometry(w * 0.82, 0.02);
          geos.push(sg);
          const sm = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.28,
          });
          mats.push(sm);
          const line = new THREE.Mesh(sg, sm);
          line.position.set(0, h / 2 - 0.16 - i * (h / 5), 0.005);
          panel.add(line);
        }
        return panel;
      };

      const panelA = panelMake(1.0, 0.7, -1.7, 0.9, -0.4, 0.5);
      const panelB = panelMake(0.85, 0.6, 1.75, 0.5, -0.3, -0.55);
      const panelC = panelMake(0.7, 0.5, 0.9, 1.7, -1.0, -0.15);

      // ── Dust particles ──
      const dustCount = 140;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 6;
        dustPos[i * 3 + 1] = Math.random() * 3 - 0.8;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      geos.push(dustGeo);
      const dustMat = new THREE.PointsMaterial({
        color: 0xd4af37,
        size: 0.02,
        transparent: true,
        opacity: 0.45,
        sizeAttenuation: true,
      });
      mats.push(dustMat);
      const dust = new THREE.Points(dustGeo, dustMat);
      scene.add(dust);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x0c0c14, 1.1));
      const goldLight = new THREE.PointLight(0xd4af37, 2.2, 12);
      goldLight.position.set(-2, 2, 2);
      scene.add(goldLight);
      const blueLight = new THREE.PointLight(0x3b82f6, 2.6, 14);
      blueLight.position.set(2, 1.5, 1.5);
      scene.add(blueLight);
      const rim2 = new THREE.PointLight(0x38bdf8, 1.2, 10);
      rim2.position.set(0, -1, 3);
      scene.add(rim2);

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
        t += 0.006;

        smx += (mx - smx) * 0.02;
        smy += (my - smy) * 0.02;

        rig.rotation.y = t * 0.12 + smx * 0.15;
        camera.position.y = 1.4 + smy * 0.15;
        camera.lookAt(0, 0.5, 0);

        coreGroup.rotation.y += 0.0028;
        coreGroup.rotation.x = Math.sin(t * 0.3) * 0.08;
        coreInner.rotation.y -= 0.004;

        radarMat.uniforms.uTime.value = t;

        panelA.position.y = 0.9 + Math.sin(t * 0.6 + 0.3) * 0.06;
        panelB.position.y = 0.5 + Math.sin(t * 0.7 + 1.4) * 0.06;
        panelC.position.y = 1.7 + Math.sin(t * 0.5 + 2.1) * 0.06;

        goldLight.intensity = 2.2 + Math.sin(t * 1.4) * 0.5;
        blueLight.intensity = 2.6 + Math.cos(t * 1.1) * 0.5;

        dust.rotation.y = t * 0.015;
        const dp = dustGeo.attributes.position;
        for (let i = 0; i < dustCount; i++) {
          dp.array[i * 3 + 1] += 0.0025;
          if (dp.array[i * 3 + 1] > 2.2) dp.array[i * 3 + 1] = -0.8;
        }
        dp.needsUpdate = true;

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

function GoldText({ children, size = "1rem", weight = 700, color = "#D4AF37" }) {
  return (
    <span
      style={{
        color,
        fontWeight: weight,
        fontSize: size,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function GlassCard({ children, style = {}, glow = "#D4AF37" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(17,17,17,0.72)",
        border: `1px solid ${hov ? glow + "77" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "20px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: hov
          ? `0 12px 32px rgba(0,0,0,0.55), 0 0 26px ${glow}22`
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
        background: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "#D4AF37" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "999px",
        color: active ? "#F4C430" : "#9CA3AF",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "0.5rem 1.2rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 14px rgba(212,175,55,0.25)" : "none",
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
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(1.1rem, 2.4vw, 1.55rem)",
          fontWeight: 700,
          color: "#F5F5F5",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: "0 0 0.4rem",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "2px",
          width: "56px",
          background: "linear-gradient(90deg,#D4AF37,transparent)",
          borderRadius: "2px",
        }}
      />
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
        background: hov ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "#D4AF37" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "8px",
        color: hov ? "#F4C430" : "#D1D5DB",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.78rem",
        fontWeight: 500,
        padding: "0.3rem 0.8rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.15s ease",
        letterSpacing: "0.01em",
      }}
    >
      {skill}
    </span>
  );
}

function ProgressBar({ label, value = 80, color = "#D4AF37" }) {
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
        <span style={{ fontSize: "0.72rem", color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: "5px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            borderRadius: "999px",
            background: `linear-gradient(90deg, ${color}, #F4C430)`,
            boxShadow: `0 0 10px ${color}88`,
            transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
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
        background: "rgba(212,175,55,0.08)",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: "999px",
        color: "#F4C430",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.4rem 1rem",
        textDecoration: "none",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(212,175,55,0.18)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(212,175,55,0.3)";
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

function TimelineEntry({ heading, sub, period, description, extra }) {
  return (
    <GlassCard style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }}>
            {heading}
          </div>
          {sub && (
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#F4C430", fontFamily: "'Inter', sans-serif", marginTop: "0.15rem" }}>
              {sub}
            </div>
          )}
        </div>
        {period && (
          <span
            style={{
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#F4C430",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.62rem",
              fontWeight: 700,
              padding: "0.25rem 0.7rem",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
            }}
          >
            {period}
          </span>
        )}
      </div>
      {extra && (
        <div style={{ fontSize: "0.74rem", color: "#9CA3AF", marginBottom: "0.35rem", fontFamily: "'Inter', sans-serif" }}>
          {extra}
        </div>
      )}
      {description && (
        <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#B8BCC4", margin: 0, fontFamily: "'Inter', sans-serif" }}>
          {description}
        </p>
      )}
    </GlassCard>
  );
}

function ProjectCard({ proj }) {
  return (
    <GlassCard style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }}>
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
                borderRadius: "6px",
                textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.04em",
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
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.4)",
                color: "#F4C430",
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.18rem 0.55rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.04em",
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
                fontSize: "0.68rem",
                fontWeight: 600,
                padding: "0.18rem 0.55rem",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.04)",
                color: "#9CA3AF",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "'Inter', sans-serif",
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

// ─────────────────────────────────────────────
// Main Template
// data shape matches notion-style.jsx / retro-wave.jsx:
//   data.hero: { name, title, summary/tagline }
//   data.contact: { email, phone, linkedin, github, twitter, portfolioUrl, leetcode, hackerrank }
//   data.skills: [{ category, skills: [] }]
//   data.experience / education / projects / certifications / achievements
// ─────────────────────────────────────────────
export default function GothamDarkTemplate({ data = {} }) {
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
    { id: "experience", label: "Operations" },
    { id: "projects", label: "Deployments" },
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #D4AF3755; border-radius: 2px; }

        @keyframes gd-fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes gd-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.45; }
        }
        @keyframes gd-drift {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(14px,-10px); }
        }
        .gd-page { animation: gd-fade-up 0.55s ease both; }
        .gd-tab  { animation: gd-fade-up 0.32s ease both; }
      `}</style>

      {/* Ambient fog / vignette background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,#131313 0%,#050505 60%)" }} />
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(212,175,55,0.05) 0%,transparent 65%)",
            filter: "blur(50px)",
            animation: "gd-drift 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "45vw",
            height: "45vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 65%)",
            filter: "blur(50px)",
            animation: "gd-drift 22s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 90px)",
          }}
        />
      </div>

      <div className="gd-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(5,5,5,0.85)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(212,175,55,0.15)",
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
                borderRadius: "2px",
                background: "#D4AF37",
                display: "inline-block",
                transform: "rotate(45deg)",
                boxShadow: "0 0 10px #D4AF37",
              }}
            />
            <GoldText size="0.8rem">{name.toUpperCase()}</GoldText>
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
            minHeight: "88vh",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* 3D model — left side */}
          <div style={{ position: "absolute", left: 0, top: 0, width: "55%", height: "100%", zIndex: 0 }}>
            <HoloConsole3D />
          </div>

          {/* fade the model into the background toward the text column */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "55%",
              height: "100%",
              zIndex: 1,
              background: "linear-gradient(to right, rgba(5,5,5,0.1) 0%, rgba(5,5,5,0.55) 70%, rgba(5,5,5,0.95) 100%)",
            }}
          />

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
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "999px",
                padding: "0.28rem 0.9rem",
                marginBottom: "1.3rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#D4AF37",
                  boxShadow: "0 0 8px #D4AF37",
                  display: "inline-block",
                  animation: "gd-pulse 2.2s ease-in-out infinite",
                }}
              />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.6rem", color: "#F4C430", fontWeight: 700, letterSpacing: "0.18em" }}>
                SYSTEM ONLINE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(2.1rem, 5.5vw, 4rem)",
                fontWeight: 700,
                color: "#F5F5F5",
                letterSpacing: "-0.01em",
                lineHeight: 1.08,
                margin: "0 0 0.6rem",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(0.78rem, 1.6vw, 1rem)",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                color: "#F4C430",
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
                  maxWidth: "500px",
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
            <div className="gd-tab">
              <SectionHeading>Profile</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
                <div>
                  {skillGroups.length > 0 && (
                    <GlassCard style={{ marginBottom: "1.2rem" }}>
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: "#D4AF37",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Skill Matrix
                      </div>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.9rem" }}>
                          {group?.category && (
                            <div style={{ fontSize: "0.74rem", color: "#9CA3AF", marginBottom: "0.4rem", fontFamily: "'Inter', sans-serif" }}>
                              {group.category}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {(Array.isArray(group?.skills) ? group.skills : []).map((skill, si) => (
                              <SkillBadge key={si} skill={skill} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </GlassCard>
                  )}

                  {achievements.length > 0 && (
                    <GlassCard>
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          color: "#D4AF37",
                          textTransform: "uppercase",
                          marginBottom: "1.1rem",
                        }}
                      >
                        Commendations
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
                          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }}>
                            {ach?.title || ""}
                          </div>
                          {ach?.description && (
                            <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginTop: "0.25rem", fontFamily: "'Inter', sans-serif" }}>
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlassCard>
                  )}

                  {skillGroups.length === 0 && achievements.length === 0 && (
                    <GlassCard>
                      <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>Nothing added here yet.</p>
                    </GlassCard>
                  )}
                </div>

                <GlassCard>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      color: "#D4AF37",
                      textTransform: "uppercase",
                      marginBottom: "1.1rem",
                    }}
                  >
                    System Readout
                  </div>
                  <ProgressBar label="Skills" value={Math.min(totalSkills * 4, 100)} color="#D4AF37" />
                  <ProgressBar label="Projects" value={Math.min(projects.length * 12, 100)} color="#3B82F6" />
                  <ProgressBar label="Experience" value={Math.min(experience.length * 20, 100)} color="#38BDF8" />
                  <ProgressBar label="Certifications" value={Math.min(certifications.length * 15, 100)} color="#F4C430" />
                </GlassCard>
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="gd-tab">
              <SectionHeading>Operations Log</SectionHeading>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={`${exp?.company || ""}${exp?.location ? ` · ${exp.location}` : ""}`}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "PRESENT" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                  />
                ))
              ) : (
                <GlassCard>
                  <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>No experience logged yet.</p>
                </GlassCard>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <div className="gd-tab">
              <SectionHeading>Deployments</SectionHeading>
              {projects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
                  {projects.map((proj, i) => (
                    <ProjectCard key={i} proj={proj} />
                  ))}
                </div>
              ) : (
                <GlassCard>
                  <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>No deployments logged yet.</p>
                </GlassCard>
              )}
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <div className="gd-tab">
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
                <GlassCard>
                  <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>No records archived yet.</p>
                </GlassCard>
              )}

              {certifications.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <SectionHeading>Certifications</SectionHeading>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
                    {certifications.map((cert, i) => (
                      <GlassCard key={i}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#F5F5F5", marginBottom: "0.25rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {cert?.title || cert?.name || ""}
                        </div>
                        {(cert?.issuer || cert?.organization) && (
                          <div style={{ fontSize: "0.76rem", color: "#D4AF37", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                            {cert.issuer || cert.organization}
                            {(cert?.date || cert?.issueDate) && ` · ${cert.date || cert.issueDate}`}
                          </div>
                        )}
                      </GlassCard>
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
            borderTop: "1px solid rgba(212,175,55,0.12)",
            background: "rgba(5,5,5,0.92)",
            padding: "1.2rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <GoldText size="0.78rem">{name.toUpperCase()}</GoldText>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.55rem", color: "rgba(212,175,55,0.35)", letterSpacing: "0.18em" }}>
            SENTINEL OS · SECURE CONSOLE
          </span>
        </footer>
      </div>
    </div>
  );
}