"use client";

import { useEffect, useRef } from "react";

const safeUrl = (url = "") => {
  if (!url || typeof url !== "string") return "#";

  const trimmed = url.trim();

  if (!trimmed) return "#";

  return trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

// ─────────────────────────────────────────────
// Three.js — Original stylized wireframe dragon
// Coiled serpentine body built from tube segments,
// a triangular head, membrane wings, slow idle
// coil + wing-breathing animation, emerald glow
// to match the template's accent color.
// (Original geometric design — not based on any
// copyrighted or trademarked artwork.)
// ─────────────────────────────────────────────
function WireDragon3D() {
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
      scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);

      const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 5.4);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const rig = new THREE.Group();
      scene.add(rig);

      // ── Build a coiled spine curve for the body ──
      const spinePoints = [];
      const coilTurns = 1.35;
      const coilPointCount = 42;
      for (let i = 0; i < coilPointCount; i++) {
        const p = i / (coilPointCount - 1);
        const angle = p * Math.PI * 2 * coilTurns;
        const radius = 1.3 - p * 0.95;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.55 + (p - 0.5) * 0.4;
        const z = Math.sin(p * Math.PI) * 0.5 - p * 0.3;
        spinePoints.push(new THREE.Vector3(x, y, z));
      }
      const spineCurve = new THREE.CatmullRomCurve3(spinePoints);

      // tapering tube radius along the curve
      const bodyGeo = new THREE.TubeGeometry(spineCurve, 120, 0.001, 8, false);
      // manually taper by scaling radial vertices post-construction
      const posAttr = bodyGeo.attributes.position;
      const segCount = 121;
      for (let seg = 0; seg < segCount; seg++) {
        const t = seg / (segCount - 1);
        const radius = 0.16 * (1 - t * 0.82) + 0.02;
        for (let r = 0; r < 8; r++) {
          const idx = seg * 8 + r;
          if (idx >= posAttr.count) continue;
          const point = spineCurve.getPoint(t);
          const vx = posAttr.getX(idx) - point.x;
          const vy = posAttr.getY(idx) - point.y;
          const vz = posAttr.getZ(idx) - point.z;
          const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
          const scale = radius / len;
          posAttr.setXYZ(
            idx,
            point.x + vx * scale,
            point.y + vy * scale,
            point.z + vz * scale,
          );
        }
      }
      posAttr.needsUpdate = true;
      geos.push(bodyGeo);

      const bodyMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      });
      mats.push(bodyMat);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      rig.add(body);

      const bodySolidMat = new THREE.MeshBasicMaterial({
        color: 0x059669,
        transparent: true,
        opacity: 0.08,
      });
      mats.push(bodySolidMat);
      rig.add(new THREE.Mesh(bodyGeo, bodySolidMat));

      // ── Head at the start of the curve ──
      const headGroup = new THREE.Group();
      const headStart = spineCurve.getPoint(0);
      const headDir = spineCurve.getTangent(0);
      headGroup.position.copy(headStart);
      headGroup.lookAt(headStart.clone().add(headDir));
      rig.add(headGroup);

      const headGeo = new THREE.ConeGeometry(0.19, 0.5, 6);
      geos.push(headGeo);
      const headMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      mats.push(headMat);
      const head = new THREE.Mesh(headGeo, headMat);
      head.rotation.x = Math.PI / 2;
      head.position.z = 0.2;
      headGroup.add(head);

      // small horns
      [-1, 1].forEach((side) => {
        const hornGeo = new THREE.ConeGeometry(0.02, 0.16, 4);
        geos.push(hornGeo);
        const hornMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.8 });
        mats.push(hornMat);
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(side * 0.07, 0.1, -0.05);
        horn.rotation.x = -0.5;
        headGroup.add(horn);
      });

      // glowing eyes
      [-1, 1].forEach((side) => {
        const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
        geos.push(eyeGeo);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xa7f3d0 });
        mats.push(eyeMat);
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(side * 0.08, 0.03, 0.28);
        headGroup.add(eye);
      });

      // ── Wings (membrane made from a custom shape) ──
      const makeWing = (mirror) => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.9 * mirror, 0.35);
        shape.lineTo(1.35 * mirror, 0.05);
        shape.lineTo(1.0 * mirror, -0.15);
        shape.lineTo(0.55 * mirror, -0.1);
        shape.lineTo(0, 0);

        const wingGeo = new THREE.ShapeGeometry(shape);
        geos.push(wingGeo);
        const wingMat = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.14,
          side: THREE.DoubleSide,
        });
        mats.push(wingMat);
        const wing = new THREE.Mesh(wingGeo, wingMat);

        const edgeGeo = new THREE.EdgesGeometry(wingGeo);
        geos.push(edgeGeo);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.6 });
        mats.push(edgeMat);
        wing.add(new THREE.LineSegments(edgeGeo, edgeMat));

        return wing;
      };
      const wingL = makeWing(1);
      const wingR = makeWing(-1);
      const wingAnchor = spineCurve.getPoint(0.12);
      wingL.position.copy(wingAnchor);
      wingR.position.copy(wingAnchor);
      wingL.rotation.y = 0.3;
      wingR.rotation.y = -0.3;
      rig.add(wingL);
      rig.add(wingR);

      // ── Ambient particles (embers) ──
      const emberCount = 90;
      const emberPos = new Float32Array(emberCount * 3);
      for (let i = 0; i < emberCount; i++) {
        emberPos[i * 3] = (Math.random() - 0.5) * 5;
        emberPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
        emberPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      const emberGeo = new THREE.BufferGeometry();
      emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
      geos.push(emberGeo);
      const emberMat = new THREE.PointsMaterial({
        color: 0x6ee7b7,
        size: 0.02,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      });
      mats.push(emberMat);
      const embers = new THREE.Points(emberGeo, emberMat);
      scene.add(embers);

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x0a0a0a, 1.2));
      const glow1 = new THREE.PointLight(0x34d399, 2, 10);
      glow1.position.set(-2, 1.5, 2);
      scene.add(glow1);
      const glow2 = new THREE.PointLight(0x059669, 1.4, 10);
      glow2.position.set(2, -1, 1.5);
      scene.add(glow2);

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

        rig.rotation.y = t * 0.15 + smx * 0.2;
        rig.rotation.x = Math.sin(t * 0.4) * 0.06 + smy * 0.08;
        rig.position.y = Math.sin(t * 0.7) * 0.08;

        // wing breathing
        const flap = Math.sin(t * 1.6) * 0.18;
        wingL.rotation.z = flap;
        wingR.rotation.z = -flap;

        glow1.intensity = 2 + Math.sin(t * 1.3) * 0.5;
        glow2.intensity = 1.4 + Math.cos(t * 1.7) * 0.4;

        embers.rotation.y = t * 0.03;
        const ep = emberGeo.attributes.position;
        for (let i = 0; i < emberCount; i++) {
          ep.array[i * 3 + 1] += 0.0018;
          if (ep.array[i * 3 + 1] > 2.2) ep.array[i * 3 + 1] = -2.2;
        }
        ep.needsUpdate = true;

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

export default function Developer3DTemplate({ data = {} }) {
  const hero = data?.hero || {};
  const contact = data?.contact || {};

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const experience = Array.isArray(data?.experience)
    ? data.experience
    : [];
  const projects = Array.isArray(data?.projects)
    ? data.projects
    : [];
  const education = Array.isArray(data?.education)
    ? data.education
    : [];
  const hobbies = Array.isArray(data?.hobbies)
    ? data.hobbies
    : [];
  const achievements = Array.isArray(data?.achievements)
    ? data.achievements
    : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];

  return (
    <div
      className="min-h-screen font-mono"
      style={{
        background: "#0a0a0f",
        color: "#e2e8f0",
      }}
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 py-16 md:px-10"
        style={{
          background:
            "linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #059669 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div
            className="inline-block rounded-full border px-3 py-1 text-xs mb-5"
            style={{
              background: "rgba(5,150,105,0.12)",
              color: "#34d399",
              borderColor: "rgba(5,150,105,0.25)",
            }}
          >
            &lt;developer /&gt;
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold mb-3 break-words"
            style={{ color: "#34d399" }}
          >
            {hero?.name || "Your Name"}
          </h1>

          {hero?.title && (
            <p
              className="text-lg mb-2"
              style={{ color: "#94a3b8" }}
            >
              {hero.title}
            </p>
          )}

          {hero?.tagline && (
            <p
              className="text-sm italic mb-4"
              style={{ color: "#64748b" }}
            >
              {hero.tagline}
            </p>
          )}

          {hero?.summary && (
            <p
              className="text-sm leading-relaxed max-w-2xl mx-auto"
              style={{ color: "#94a3b8" }}
            >
              {hero.summary}
            </p>
          )}

          {/* Contact */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
            {contact?.email && (
              <span
                className="px-3 py-1 rounded-md"
                style={{
                  background: "#1e293b",
                  color: "#94a3b8",
                }}
              >
                {contact.email}
              </span>
            )}

            {contact?.phone && (
              <span
                className="px-3 py-1 rounded-md"
                style={{
                  background: "#1e293b",
                  color: "#94a3b8",
                }}
              >
                {contact.phone}
              </span>
            )}

            {contact?.github && (
              <a
                href={safeUrl(contact.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                GitHub
              </a>
            )}

            {contact?.linkedin && (
              <a
                href={safeUrl(contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                LinkedIn
              </a>
            )}

            {contact?.twitter && (
              <a
                href={safeUrl(contact.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                Twitter
              </a>
            )}

            {contact?.portfolioUrl && (
              <a
                href={safeUrl(contact.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md underline"
                style={{
                  background: "#1e293b",
                  color: "#34d399",
                }}
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-10">
        {/* Skills — dragon placed beside this section */}
        {skills.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Skills
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
              <div className="space-y-4">
                {skills.map((group, index) => {
                  const skillItems = Array.isArray(group?.skills)
                    ? group.skills
                    : group?.skills
                      ? [group.skills]
                      : [];

                  return (
                    <div key={`skill-${index}`}>
                      <p
                        className="text-xs mb-2"
                        style={{ color: "#64748b" }}
                      >
                        {group?.category || "General"}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {skillItems.map((skill, skillIndex) => (
                          <span
                            key={`skill-item-${skillIndex}`}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: "rgba(5,150,105,0.12)",
                              color: "#34d399",
                              border:
                                "1px solid rgba(5,150,105,0.25)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dragon panel */}
              <div
                className="relative rounded-lg overflow-hidden hidden md:block"
                style={{
                  height: "320px",
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(5,150,105,0.08) 0%, transparent 70%)",
                  border: "1px solid #1e293b",
                }}
              >
                <WireDragon3D />
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Experience
            </h2>

            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div
                  key={`exp-${index}`}
                  className="rounded-lg p-5"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e293b",
                  }}
                >
                  <div className="flex justify-between flex-wrap gap-3">
                    <div>
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "#e2e8f0" }}
                      >
                        {exp?.title || "Role"}
                      </h3>

                      <p
                        className="text-xs mt-1"
                        style={{ color: "#34d399" }}
                      >
                        {exp?.company || ""}
                      </p>
                    </div>

                    <span
                      className="text-xs whitespace-nowrap"
                      style={{ color: "#64748b" }}
                    >
                      {exp?.startDate || ""}
                      {(exp?.startDate || exp?.endDate) && " — "}
                      {exp?.current
                        ? "Present"
                        : exp?.endDate || ""}
                    </span>
                  </div>

                  {exp?.description && (
                    <p
                      className="text-sm mt-3 leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj, index) => (
                <div
                  key={`proj-${index}`}
                  className="rounded-lg p-5"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e293b",
                  }}
                >
                  <div className="flex justify-between flex-wrap gap-3 mb-3">
                    <h3
                      className="font-bold text-sm"
                      style={{ color: "#e2e8f0" }}
                    >
                      {proj?.title || "Project"}
                    </h3>

                    <div className="flex gap-3">
                      {proj?.github && (
                        <a
                          href={safeUrl(proj.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#34d399" }}
                        >
                          GitHub
                        </a>
                      )}

                      {proj?.liveUrl && (
                        <a
                          href={safeUrl(proj.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: "#34d399" }}
                        >
                          Live
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(proj?.techStack) &&
                    proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {proj.techStack.map((tech, techIndex) => (
                          <span
                            key={`tech-${techIndex}`}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: "#1e293b",
                              color: "#94a3b8",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {proj?.description && (
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Education
            </h2>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={`edu-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      {edu?.degree || ""}
                    </h3>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      {edu?.institution || ""}
                    </p>

                    {edu?.score && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {edu?.scoreType || "Score"}:{" "}
                        {edu.score}
                        {edu?.outOf ? `/${edu.outOf}` : ""}
                      </p>
                    )}
                  </div>

                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: "#64748b" }}
                  >
                    {edu?.startDate || ""}
                    {(edu?.startDate || edu?.endDate) && " — "}
                    {edu?.current
                      ? "Present"
                      : edu?.endDate || ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Certifications
            </h2>

            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div
                  key={`cert-${index}`}
                  className="flex justify-between flex-wrap gap-3"
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#e2e8f0" }}
                    >
                      {cert?.title || cert?.name || ""}
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      {cert?.issuer ||
                        cert?.organization ||
                        ""}
                    </p>
                  </div>

                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: "#64748b" }}
                  >
                    {cert?.date || cert?.issueDate || ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "#34d399" }}
            >
              # Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={`achievement-${index}`}
                  className="rounded-lg p-4"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e293b",
                  }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {achievement?.title || ""}
                  </h3>

                  {achievement?.description && (
                    <p
                      className="text-xs mt-2 leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "#34d399" }}
            >
              # Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="text-xs px-3 py-1 rounded"
                  style={{
                    background: "#1e293b",
                    color: "#94a3b8",
                  }}
                >
                  {hobby}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}