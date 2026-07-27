"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// safeUrl helper
// ─────────────────────────────────────────────
const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

// ─────────────────────────────────────────────
// Three.js — Synthwave Sun + Grid + Objects
// ─────────────────────────────────────────────
function SynthwaveModel3D() {
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
      scene.fog = new THREE.FogExp2(0x0d0020, 0.04);

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 120);
      camera.position.set(0, 2.5, 9);
      camera.lookAt(0, 1.5, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Synthwave Sun ──
      const sunGroup = new THREE.Group();
      sunGroup.position.set(0, 3.2, -8);
      scene.add(sunGroup);

      const sunGeo = new THREE.CircleGeometry(2.4, 64);
      geos.push(sunGeo);
      const sunMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uC1: { value: new THREE.Color(0xff8c42) },
          uC2: { value: new THREE.Color(0xff0080) },
          uC3: { value: new THREE.Color(0xb026ff) },
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `
          uniform float uTime; uniform vec3 uC1,uC2,uC3; varying vec2 vUv;
          void main(){
            float y=vUv.y;
            float p=0.04*sin(uTime*1.2);
            vec3 col=mix(uC3,mix(uC2,uC1,smoothstep(0.3,0.7,y+p)),y);
            float d=length(vUv-0.5)*2.;
            float a=1.-smoothstep(0.88,1.,d);
            gl_FragColor=vec4(col,a);
          }`,
        transparent: true,
        side: THREE.DoubleSide,
      });
      mats.push(sunMat);
      sunGroup.add(new THREE.Mesh(sunGeo, sunMat));

      // Horizontal stripe cuts
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        if (t < 0.48) {
          const sg = new THREE.PlaneGeometry(4.88, 0.055 + t * 0.13);
          geos.push(sg);
          const sm = new THREE.MeshBasicMaterial({ color: 0x08001a, transparent: true, opacity: 0.94 });
          mats.push(sm);
          const s = new THREE.Mesh(sg, sm);
          s.position.set(0, -2.4 + t * 4.8, 0.01);
          sunGroup.add(s);
        }
      }

      // Outer glow ring
      const glowGeo = new THREE.RingGeometry(2.38, 3.1, 64);
      geos.push(glowGeo);
      const glowMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `
          uniform float uTime; varying vec2 vUv;
          void main(){
            float p=0.5+0.5*sin(uTime*1.5);
            float f=1.-vUv.y;
            vec3 c=mix(vec3(1.,0.,0.5),vec3(0.69,0.15,1.),vUv.y);
            gl_FragColor=vec4(c,f*0.38*(0.65+0.35*p));
          }`,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      mats.push(glowMat);
      const glowRing = new THREE.Mesh(glowGeo, glowMat);
      glowRing.position.z = -0.01;
      sunGroup.add(glowRing);

      // ── Perspective grid floor ──
      const gridGroup = new THREE.Group();
      gridGroup.position.set(0, -1.2, 0);
      gridGroup.rotation.x = -Math.PI / 2;
      scene.add(gridGroup);

      const gridCols = 20;
      const gridRows = 30;
      const gridW = 28;
      const gridD = 40;

      const vLineMat = new THREE.LineBasicMaterial({ color: 0xff0080, transparent: true, opacity: 0.4 });
      mats.push(vLineMat);
      for (let i = 0; i <= gridCols; i++) {
        const x = -gridW / 2 + (i / gridCols) * gridW;
        const g = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, 0),
          new THREE.Vector3(x * 0.04, gridD, 0),
        ]);
        geos.push(g);
        gridGroup.add(new THREE.Line(g, vLineMat));
      }

      const hLineMat = new THREE.LineBasicMaterial({ color: 0xb026ff, transparent: true, opacity: 0.3 });
      mats.push(hLineMat);
      for (let i = 0; i <= gridRows; i++) {
        const z = (i / gridRows) * gridD;
        const sp = 0.04 + (z / gridD) * 0.96;
        const g = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-(gridW / 2) * sp, z, 0),
          new THREE.Vector3((gridW / 2) * sp, z, 0),
        ]);
        geos.push(g);
        gridGroup.add(new THREE.Line(g, hLineMat));
      }

      // ── Floating neon pyramid ──
      const pyrGeo = new THREE.ConeGeometry(0.88, 1.58, 4);
      geos.push(pyrGeo);
      const pyrMat = new THREE.MeshPhongMaterial({
        color: 0x1a0040,
        emissive: 0xb026ff,
        emissiveIntensity: 0.32,
        shininess: 120,
        specular: 0xff0080,
        transparent: true,
        opacity: 0.88,
      });
      mats.push(pyrMat);
      const pyramid = new THREE.Mesh(pyrGeo, pyrMat);
      pyramid.position.set(-3.4, 0.6, -1);
      pyramid.rotation.y = Math.PI / 4;
      scene.add(pyramid);
      const pyrEdgeGeo = new THREE.EdgesGeometry(pyrGeo);
      geos.push(pyrEdgeGeo);
      const pyrEdgeMat = new THREE.LineBasicMaterial({ color: 0xff0080 });
      mats.push(pyrEdgeMat);
      pyramid.add(new THREE.LineSegments(pyrEdgeGeo, pyrEdgeMat));

      // ── Wireframe sphere ──
      const sphGeo = new THREE.IcosahedronGeometry(0.68, 2);
      geos.push(sphGeo);
      const sphMat = new THREE.MeshBasicMaterial({
        color: 0x00fff7,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      mats.push(sphMat);
      const sphere = new THREE.Mesh(sphGeo, sphMat);
      sphere.position.set(3.2, 0.8, -1.2);
      scene.add(sphere);

      // ── Chrome cube ──
      const cubGeo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
      geos.push(cubGeo);
      const cubMat = new THREE.MeshPhongMaterial({
        color: 0x220044,
        emissive: 0x00c8ff,
        emissiveIntensity: 0.42,
        shininess: 180,
        specular: 0x00fff7,
      });
      mats.push(cubMat);
      const cube = new THREE.Mesh(cubGeo, cubMat);
      cube.position.set(1.8, 1.8, -2.5);
      scene.add(cube);
      const cubEdgeGeo = new THREE.EdgesGeometry(cubGeo);
      geos.push(cubEdgeGeo);
      const cubEdgeMat = new THREE.LineBasicMaterial({ color: 0x00c8ff });
      mats.push(cubEdgeMat);
      cube.add(new THREE.LineSegments(cubEdgeGeo, cubEdgeMat));

      // ── Neon mountain silhouettes ──
      const makeMtn = (pts, side) => {
        const v2 = pts.map(([x, y]) => new THREE.Vector2(x, y));
        const shape = new THREE.Shape(v2);
        const sg = new THREE.ShapeGeometry(shape);
        geos.push(sg);
        const sm = new THREE.MeshBasicMaterial({
          color: 0x280050,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
        });
        mats.push(sm);
        const m = new THREE.Mesh(sg, sm);
        m.position.set(side * 4, -1.2, -6);
        scene.add(m);
        const ep = pts.map(([x, y]) => new THREE.Vector3(x, y, 0));
        const eg = new THREE.BufferGeometry().setFromPoints(ep);
        geos.push(eg);
        const em = new THREE.LineBasicMaterial({ color: 0xff0080, transparent: true, opacity: 0.55 });
        mats.push(em);
        const el = new THREE.Line(eg, em);
        el.position.set(side * 4, -1.2, -6);
        scene.add(el);
      };
      makeMtn(
        [
          [-3, 0],
          [-1.5, 2.5],
          [0, 1],
          [1.5, 3],
          [3, 0],
        ],
        1,
      );
      makeMtn(
        [
          [-3, 0],
          [-1, 2],
          [0.5, 1.2],
          [2, 2.8],
          [3, 0],
        ],
        -1,
      );

      // ── Stars ──
      const starCount = 300;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 60;
        starPos[i * 3 + 1] = Math.random() * 20 + 2;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      geos.push(starGeo);
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.055,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
      });
      mats.push(starMat);
      scene.add(new THREE.Points(starGeo, starMat));

      // ── Neon dust ──
      const dustCount = 120;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 20;
        dustPos[i * 3 + 1] = Math.random() * 6 - 1;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      geos.push(dustGeo);
      const dustMat = new THREE.PointsMaterial({
        color: 0xff4fd8,
        size: 0.042,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      });
      mats.push(dustMat);
      const dustPts = new THREE.Points(dustGeo, dustMat);
      scene.add(dustPts);

      // ── Sky beams ──
      const beamCols = [0xff0080, 0xb026ff, 0x00c8ff];
      beamCols.forEach((color, i) => {
        const bg = new THREE.PlaneGeometry(30, 0.016);
        geos.push(bg);
        const bm = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.28 - i * 0.06,
          side: THREE.DoubleSide,
        });
        mats.push(bm);
        const b = new THREE.Mesh(bg, bm);
        b.position.set(0, 4.5 - i * 0.6, -9);
        scene.add(b);
      });

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x1a0040, 1.2));
      const pL = new THREE.PointLight(0xff0080, 3, 20);
      pL.position.set(-3, 4, 2);
      scene.add(pL);
      const cL = new THREE.PointLight(0x00c8ff, 2.5, 18);
      cL.position.set(3, 3, 2);
      scene.add(cL);
      const puL = new THREE.PointLight(0xb026ff, 2, 15);
      puL.position.set(0, 5, -4);
      scene.add(puL);

      // ── Mouse ──
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
        t += 0.007;

        smx += (mx - smx) * 0.025;
        smy += (my - smy) * 0.025;

        camera.position.x = smx * 0.8;
        camera.position.y = 2.5 + smy * 0.3;
        camera.lookAt(0, 1.5, 0);

        sunGroup.position.y = 3.2 + Math.sin(t * 0.5) * 0.12;
        sunMat.uniforms.uTime.value = t;
        glowMat.uniforms.uTime.value = t;

        // Grid scroll
        gridGroup.position.z = (t * 0.8) % (gridD / gridRows);

        pyramid.rotation.y += 0.008;
        pyramid.position.y = 0.6 + Math.sin(t * 0.7 + 1.0) * 0.18;
        pyrMat.emissiveIntensity = 0.32 + Math.sin(t * 1.4) * 0.14;

        sphere.rotation.x += 0.006;
        sphere.rotation.y += 0.009;
        sphere.position.y = 0.8 + Math.sin(t * 0.9 + 0.5) * 0.2;

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.013;
        cube.position.y = 1.8 + Math.sin(t * 1.1 + 2.0) * 0.15;
        cubMat.emissiveIntensity = 0.42 + Math.cos(t * 1.6) * 0.18;

        pL.intensity = 3 + Math.sin(t * 1.3) * 0.8;
        cL.intensity = 2.5 + Math.cos(t * 1.7) * 0.7;
        puL.intensity = 2 + Math.sin(t * 0.9) * 0.5;

        dustPts.rotation.y = t * 0.02;
        const dp = dustGeo.attributes.position;
        for (let i = 0; i < dustCount; i++) {
          dp.array[i * 3 + 1] += 0.004;
          if (dp.array[i * 3 + 1] > 5) dp.array[i * 3 + 1] = -1;
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
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
    />
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function NeonText({ children, color = "#ff0080", size = "1rem", weight = 700 }) {
  return (
    <span
      style={{
        color,
        fontWeight: weight,
        fontSize: size,
        textShadow: `0 0 8px ${color}, 0 0 20px ${color}88`,
        fontFamily: "'Orbitron', sans-serif",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </span>
  );
}

function GlowCard({ children, style = {}, borderColor = "#ff0080" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(13,0,32,0.78)",
        border: `1px solid ${hov ? borderColor : borderColor + "55"}`,
        borderRadius: "16px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: hov
          ? `0 0 18px ${borderColor}44, 0 0 40px ${borderColor}22, inset 0 0 20px rgba(0,0,0,0.4)`
          : `0 0 8px ${borderColor}22, inset 0 0 20px rgba(0,0,0,0.3)`,
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        padding: "1.4rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? "linear-gradient(135deg,rgba(255,0,128,0.25),rgba(176,38,255,0.2))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "#ff0080" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "999px",
        color: active ? "#ff4fd8" : "#a7a0d8",
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.45rem 1.1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 0 12px rgba(255,0,128,0.35)" : "none",
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
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(1.1rem, 2.5vw, 1.65rem)",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textShadow: "0 0 14px #ff0080, 0 0 30px #ff008055",
          margin: "0 0 0.3rem",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "2px",
          width: "60px",
          background: "linear-gradient(90deg,#ff0080,#b026ff,transparent)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function SkillBadge({ skill, index }) {
  const colors = ["#ff0080", "#b026ff", "#00c8ff", "#00fff7", "#ff4fd8", "#ff8c42", "#ffd166"];
  const c = colors[index % colors.length];
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block",
        background: hov ? `${c}22` : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? c : c + "55"}`,
        borderRadius: "8px",
        color: hov ? c : "#d6d6f2",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "0.78rem",
        fontWeight: 600,
        padding: "0.28rem 0.75rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        cursor: "default",
        transition: "all 0.15s ease",
        textShadow: hov ? `0 0 8px ${c}` : "none",
        boxShadow: hov ? `0 0 10px ${c}33` : "none",
        letterSpacing: "0.02em",
      }}
    >
      {skill}
    </span>
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
        background: "rgba(255,0,128,0.1)",
        border: "1px solid rgba(255,0,128,0.35)",
        borderRadius: "8px",
        color: "#ff4fd8",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        padding: "0.35rem 0.9rem",
        textDecoration: "none",
        transition: "all 0.2s ease",
        letterSpacing: "0.03em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,0,128,0.22)";
        e.currentTarget.style.boxShadow = "0 0 12px rgba(255,0,128,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,0,128,0.1)";
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

function TimelineEntry({ heading, sub, period, description, bullets = [], color = "#ff0080" }) {
  return (
    <GlowCard borderColor={color} style={{ marginBottom: "1.2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
              color: "#ffffff",
              marginBottom: "0.2rem",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {heading}
          </div>
          {sub && (
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color,
                fontFamily: "'Rajdhani', sans-serif",
                textShadow: `0 0 8px ${color}88`,
              }}
            >
              {sub}
            </div>
          )}
        </div>
        {period && (
          <span
            style={{
              background: `${color}18`,
              border: `1px solid ${color}44`,
              color,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 700,
              padding: "0.2rem 0.7rem",
              borderRadius: "6px",
              whiteSpace: "nowrap",
              letterSpacing: "0.06em",
            }}
          >
            {period}
          </span>
        )}
      </div>
      {description && (
        <p
          style={{
            fontSize: "0.85rem",
            lineHeight: 1.75,
            color: "#a7a0d8",
            margin: "0 0 0.5rem",
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {description}
        </p>
      )}
      {bullets.map((b, i) => (
        <div
          key={i}
          style={{
            fontSize: "0.8rem",
            color: "#a7a0d8",
            lineHeight: 1.7,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          + {b}
        </div>
      ))}
    </GlowCard>
  );
}

function ProjectCard({ proj, color }) {
  return (
    <GlowCard borderColor={color} style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ffffff", fontFamily: "'Rajdhani', sans-serif" }}>
          {proj?.title || "Project"}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
          {proj?.liveUrl && (
            <a
              href={safeUrl(proj.liveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: `${color}25`,
                border: `1px solid ${color}55`,
                color,
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.18rem 0.55rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              LIVE↗
            </a>
          )}
          {proj?.github && (
            <a
              href={safeUrl(proj.github)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#a7a0d8",
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.18rem 0.55rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontFamily: "'Orbitron', sans-serif",
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
            fontSize: "0.82rem",
            lineHeight: 1.75,
            color: "#a7a0d8",
            margin: "0 0 0.8rem",
            flex: 1,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {proj.description}
        </p>
      )}
      {Array.isArray(proj?.techStack) && proj.techStack.length > 0 && (
        <div>
          {proj.techStack.map((tech, ti) => (
            <SkillBadge key={ti} skill={tech} index={ti} />
          ))}
        </div>
      )}
    </GlowCard>
  );
}

// ─────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────
export default function RetroWaveTemplate({ data = {} }) {
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
    { id: "about", label: "About" },
    { id: "experience", label: "Work" },
    { id: "projects", label: "Projects" },
    { id: "education", label: "Edu" },
  ];

  const CC = ["#ff0080", "#b026ff", "#00c8ff", "#ff4fd8", "#00fff7", "#ff8c42"];
  const getCC = (i) => CC[i % CC.length];

  return (
    <div
      style={{
        fontFamily: "'Rajdhani', sans-serif",
        background: "#090014",
        minHeight: "100vh",
        color: "#d6d6f2",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #090014; }
        ::-webkit-scrollbar-thumb { background: #ff008055; border-radius: 2px; }

        @keyframes rw-fade-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes rw-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.5; }
        }
        @keyframes rw-glitch {
          0%,94%,100% { clip-path:none; transform:none; }
          95%          { clip-path:inset(20% 0 60% 0); transform:translateX(-3px); }
          96%          { clip-path:inset(60% 0 10% 0); transform:translateX(3px); }
          97%          { clip-path:inset(40% 0 40% 0); transform:translateX(-2px); }
        }
        @keyframes rw-horizon {
          0%,100% { opacity:0.55; }
          50%      { opacity:0.9; }
        }
        .rw-page { animation: rw-fade-up 0.5s ease both; }
        .rw-tab  { animation: rw-fade-up 0.3s ease both; }
        .rw-glitch { animation: rw-glitch 12s ease-in-out infinite; }
      `}</style>

      {/* CRT scanlines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(0,0,0,0.06) 0px,rgba(0,0,0,0.06) 1px,transparent 1px,transparent 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg,#12002B 0%,#1A103D 40%,#090014 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "38%",
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(to top,rgba(255,0,128,0.18),rgba(176,38,255,0.1),transparent)",
            animation: "rw-horizon 4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(176,38,255,0.1) 0%,transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "35vw",
            height: "35vw",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(255,0,128,0.08) 0%,transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="rw-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(9,0,20,0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,0,128,0.2)",
            boxShadow: "0 2px 20px rgba(255,0,128,0.1)",
            padding: "0.75rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            <NeonText color="#ff0080">{name.split(" ")[0].toUpperCase()}</NeonText>
            <span style={{ color: "#b026ff", margin: "0 0.3rem" }}>·</span>
            <NeonText color="#b026ff" size="0.68rem">
              {title.toUpperCase()}
            </NeonText>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <TabBtn key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
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
            <SynthwaveModel3D />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(to right,rgba(9,0,20,0.84) 0%,rgba(9,0,20,0.45) 55%,rgba(9,0,20,0.08) 100%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2, padding: "4rem 2.5rem", maxWidth: "600px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,0,128,0.1)",
                border: "1px solid rgba(255,0,128,0.3)",
                borderRadius: "999px",
                padding: "0.25rem 0.85rem",
                marginBottom: "1.2rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ff0080",
                  boxShadow: "0 0 8px #ff0080",
                  display: "inline-block",
                  animation: "rw-pulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.58rem",
                  color: "#ff4fd8",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                }}
              >
                PORTFOLIO ONLINE
              </span>
            </div>

            <h1
              className="rw-glitch"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                lineHeight: 1.05,
                margin: "0 0 0.5rem",
                textShadow: "0 0 20px rgba(255,0,128,0.6),0 0 50px rgba(255,0,128,0.3)",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(0.75rem, 1.8vw, 1.05rem)",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "1.4rem",
                background: "linear-gradient(90deg,#ff0080,#b026ff,#00c8ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {title}
            </div>

            {summary && (
              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.8,
                  color: "#a7a0d8",
                  maxWidth: "480px",
                  marginBottom: "2rem",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 500,
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
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.52rem",
                color: "rgba(255,0,128,0.4)",
                letterSpacing: "0.2em",
              }}
            >
              SCROLL
            </span>
            <div
              style={{
                width: "1px",
                height: "36px",
                background: "linear-gradient(to bottom,#ff0080,transparent)",
                animation: "rw-pulse 2s ease-in-out infinite",
              }}
            />
          </div>
        </section>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2.5rem 6rem" }}>
          {/* ABOUT */}
          {activeTab === "about" && (
            <div className="rw-tab">
              <SectionHeading>About</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: "1.5rem", alignItems: "start" }}>
                <div>
                  {skillGroups.length > 0 && (
                    <GlowCard style={{ marginBottom: "1.2rem" }} borderColor="#b026ff">
                      <div
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#b026ff",
                          textTransform: "uppercase",
                          marginBottom: "1rem",
                          textShadow: "0 0 8px #b026ff88",
                        }}
                      >
                        {"// Skills"}
                      </div>
                      {skillGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: "0.8rem" }}>
                          {group?.category && (
                            <div
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: "0.72rem",
                                color: "#a7a0d8",
                                marginBottom: "0.4rem",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {group.category}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {(Array.isArray(group?.skills) ? group.skills : []).map((skill, si) => (
                              <SkillBadge key={si} skill={skill} index={si} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </GlowCard>
                  )}
                  {certifications.length > 0 && (
                    <GlowCard borderColor="#00c8ff" style={{ marginBottom: "1.2rem" }}>
                      <div
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#00c8ff",
                          textTransform: "uppercase",
                          marginBottom: "1rem",
                          textShadow: "0 0 8px #00c8ff88",
                        }}
                      >
                        {"// Certifications"}
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
                              fontSize: "0.88rem",
                              color: "#ffffff",
                              marginBottom: "0.15rem",
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                          >
                            {cert?.title || cert?.name || ""}
                          </div>
                          {(cert?.issuer || cert?.organization) && (
                            <div style={{ fontSize: "0.75rem", color: "#00c8ff", fontFamily: "'Rajdhani', sans-serif" }}>
                              {cert.issuer || cert.organization}
                              {(cert?.date || cert?.issueDate) && ` · ${cert.date || cert.issueDate}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlowCard>
                  )}
                  {achievements.length > 0 && (
                    <GlowCard borderColor="#ffd166">
                      <div
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "#ffd166",
                          textTransform: "uppercase",
                          marginBottom: "1rem",
                          textShadow: "0 0 8px #ffd16688",
                        }}
                      >
                        {"// Achievements"}
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
                          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#ffffff", fontFamily: "'Rajdhani', sans-serif" }}>
                            ✦ {ach?.title || ""}
                          </div>
                          {ach?.description && (
                            <div style={{ fontSize: "0.78rem", color: "#a7a0d8", marginTop: "0.2rem", fontFamily: "'Rajdhani', sans-serif" }}>
                              {ach.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </GlowCard>
                  )}
                </div>

                <GlowCard borderColor="#ff0080">
                  <div
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: "#ff0080",
                      textTransform: "uppercase",
                      marginBottom: "1rem",
                      textShadow: "0 0 8px #ff008088",
                    }}
                  >
                    {"// Stats"}
                  </div>
                  {[
                    { l: "Skills", v: totalSkills, c: "#ff0080" },
                    { l: "Projects", v: projects.length, c: "#b026ff" },
                    { l: "Experience", v: experience.length, c: "#00c8ff" },
                    { l: "Education", v: education.length, c: "#ff4fd8" },
                    { l: "Certs", v: certifications.length, c: "#00fff7" },
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
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "0.8rem", color: "#a7a0d8" }}>
                        {l}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: c,
                          textShadow: `0 0 10px ${c}88`,
                        }}
                      >
                        {String(v).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </GlowCard>
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="rw-tab">
              <SectionHeading>Work Experience</SectionHeading>
              {experience.length > 0 ? (
                experience.map((exp, i) => (
                  <TimelineEntry
                    key={i}
                    heading={exp?.title || "Role"}
                    sub={`${exp?.company || ""}${exp?.location ? ` · ${exp.location}` : ""}`}
                    period={
                      exp?.startDate
                        ? `${exp.startDate} → ${exp?.current ? "NOW" : exp?.endDate || ""}`
                        : undefined
                    }
                    description={exp?.description}
                    color={getCC(i)}
                  />
                ))
              ) : (
                <GlowCard>
                  <p style={{ color: "#a7a0d8", fontSize: "0.85rem" }}>No experience added yet.</p>
                </GlowCard>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <div className="rw-tab">
              <SectionHeading>Projects</SectionHeading>
              {projects.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: "1.2rem" }}>
                  {projects.map((proj, i) => (
                    <ProjectCard key={i} proj={proj} color={getCC(i)} />
                  ))}
                </div>
              ) : (
                <GlowCard>
                  <p style={{ color: "#a7a0d8", fontSize: "0.85rem" }}>No projects added yet.</p>
                </GlowCard>
              )}
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <div className="rw-tab">
              <SectionHeading>Education</SectionHeading>
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
                <GlowCard>
                  <p style={{ color: "#a7a0d8", fontSize: "0.85rem" }}>No education added yet.</p>
                </GlowCard>
              )}

              {certifications.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <SectionHeading>Certifications</SectionHeading>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "1rem" }}>
                    {certifications.map((cert, i) => (
                      <GlowCard key={i} borderColor={getCC(i + 4)}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "#ffffff",
                            marginBottom: "0.25rem",
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          {cert?.title || cert?.name || ""}
                        </div>
                        {(cert?.issuer || cert?.organization) && (
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: getCC(i + 4),
                              fontFamily: "'Rajdhani', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {cert.issuer || cert.organization}
                            {(cert?.date || cert?.issueDate) && ` · ${cert.date || cert.issueDate}`}
                          </div>
                        )}
                      </GlowCard>
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
            borderTop: "1px solid rgba(255,0,128,0.15)",
            background: "rgba(9,0,20,0.9)",
            padding: "1.2rem 2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <NeonText color="#ff0080" size="0.78rem">
            {name.toUpperCase()}
          </NeonText>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.52rem",
              color: "rgba(255,0,128,0.3)",
              letterSpacing: "0.15em",
            }}
          >
            RETRO WAVE · THREE.JS · SYNTHWAVE
          </span>
        </footer>
      </div>
    </div>
  );
}