"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Three.js 3D Model Component
// Floating brutalist 3D cube with wireframe
// ─────────────────────────────────────────────
function BrutalistModel3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let THREE;
    let mounted = true;

    async function init() {
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (!mounted || !mountRef.current) return;

      const width = mountRef.current.clientWidth || 320;
      const height = mountRef.current.clientHeight || 320;

      // Scene
      const scene = new THREE.Scene();
      scene.background = null;

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // ── Main solid cube ──
      const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      const boxMat = new THREE.MeshPhongMaterial({
        color: 0xf97316,
        shininess: 0,
        flatShading: true,
      });
      const cube = new THREE.Mesh(boxGeo, boxMat);
      scene.add(cube);

      // ── Wireframe overlay ──
      const wireGeo = new THREE.BoxGeometry(1.62, 1.62, 1.62);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        linewidth: 2,
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      scene.add(wire);

      // ── Bold black border cube (edges) ──
      const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 1.6, 1.6));
      const edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      scene.add(edges);

      // ── Floating small cubes ──
      const smallCubes = [];
      const smallPositions = [
        [2.2, 1.2, 0],
        [-2.2, -1.0, 0.5],
        [1.8, -1.8, -0.5],
        [-1.5, 1.8, -0.3],
      ];
      smallPositions.forEach(([x, y, z], i) => {
        const sg = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        const sm = new THREE.MeshPhongMaterial({
          color: i % 2 === 0 ? 0x000000 : 0xffffff,
          flatShading: true,
        });
        const sc = new THREE.Mesh(sg, sm);
        sc.position.set(x, y, z);
        // edge on small cube
        const se = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.36, 0.36, 0.36)),
          new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
        );
        sc.add(se);
        scene.add(sc);
        smallCubes.push(sc);
      });

      // ── Lights ──
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(5, 5, 5);
      scene.add(dirLight);

      const dirLight2 = new THREE.DirectionalLight(0xf97316, 0.5);
      dirLight2.position.set(-5, -3, -2);
      scene.add(dirLight2);

      // ── Mouse interaction ──
      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      window.addEventListener("mousemove", handleMouseMove);

      // ── Animation loop ──
      let t = 0;
      function animate() {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.012;

        cube.rotation.x += (mouseY * 0.8 - cube.rotation.x) * 0.06;
        cube.rotation.y += (mouseX * 0.8 - cube.rotation.y) * 0.06;
        wire.rotation.x = cube.rotation.x;
        wire.rotation.y = cube.rotation.y;
        edges.rotation.x = cube.rotation.x;
        edges.rotation.y = cube.rotation.y;

        smallCubes.forEach((sc, i) => {
          sc.rotation.x += 0.015 * (i % 2 === 0 ? 1 : -1);
          sc.rotation.y += 0.02 * (i % 2 === 0 ? 1 : -1);
          sc.position.y += Math.sin(t + i * 1.2) * 0.004;
        });

        renderer.render(scene, camera);
      }
      animate();

      // ── Resize handler ──
      const handleResize = () => {
        if (!mountRef.current || !mounted) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
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
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", cursor: "grab" }}
    />
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div
      style={{
        border: "3px solid #000",
        marginBottom: "2rem",
        background: "#fff",
        boxShadow: "6px 6px 0 #000",
      }}
    >
      <div
        style={{
          background: "#000",
          color: "#f97316",
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "0.4rem 1rem",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  );
}

function Tag({ children, accent }) {
  return (
    <span
      style={{
        display: "inline-block",
        border: "2px solid #000",
        background: accent ? "#f97316" : "#fff",
        color: "#000",
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.2rem 0.6rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        boxShadow: "2px 2px 0 #000",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main Template
// ─────────────────────────────────────────────
export default function NeoBrutalismTemplate({ data }) {
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
    { id: "experience", label: "Work" },
    { id: "projects", label: "Projects" },
    { id: "education", label: "Education" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Space Mono', monospace",
        background: "#f5f0e8",
        minHeight: "100vh",
        color: "#000",
      }}
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Anton&display=swap');

        * { box-sizing: border-box; }

        .nb-tab-btn {
          border: 3px solid #000;
          background: #fff;
          color: #000;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.5rem 1.2rem;
          cursor: pointer;
          box-shadow: 4px 4px 0 #000;
          transition: transform 0.1s, box-shadow 0.1s;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .nb-tab-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #000;
        }
        .nb-tab-btn.active {
          background: #f97316;
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #000;
        }

        .nb-card {
          border: 3px solid #000;
          background: #fff;
          box-shadow: 5px 5px 0 #000;
          margin-bottom: 1.2rem;
          padding: 1.2rem;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .nb-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: 8px 8px 0 #000;
        }

        .nb-link {
          color: #000;
          text-decoration: underline;
          font-weight: 700;
        }
        .nb-link:hover { color: #f97316; }

        .nb-contact-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          border: 2px solid #000;
          background: #fff;
          padding: 0.3rem 0.8rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          box-shadow: 3px 3px 0 #000;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
          text-decoration: none;
          color: #000;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .nb-contact-chip:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 #000;
          background: #f97316;
        }
      `}</style>

      {/* ── HERO ── */}
      <div
        style={{
          borderBottom: "4px solid #000",
          background: "#fff",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 0,
          minHeight: "420px",
        }}
      >
        {/* Left: text */}
        <div
          style={{
            padding: "3rem 2.5rem",
            borderRight: "4px solid #000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Brutalist badge */}
          <div
            style={{
              display: "inline-block",
              background: "#f97316",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "0.2rem 0.8rem",
              marginBottom: "1rem",
              width: "fit-content",
            }}
          >
            ✦ Portfolio
          </div>

          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "#000",
              margin: "0 0 0.5rem 0",
              wordBreak: "break-word",
            }}
          >
            {name}
          </h1>

          <div
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#f97316",
              marginBottom: "1.5rem",
              borderLeft: "5px solid #000",
              paddingLeft: "0.8rem",
            }}
          >
            {title}
          </div>

          {summary && (
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.82rem",
                lineHeight: 1.7,
                color: "#333",
                maxWidth: "520px",
                marginBottom: "2rem",
              }}
            >
              {summary}
            </p>
          )}

          {/* Contact chips */}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {email && (
              <a href={`mailto:${email}`} className="nb-contact-chip">
                ✉ {email}
              </a>
            )}
            {phone && (
              <span className="nb-contact-chip">☎ {phone}</span>
            )}
            {location && (
              <span className="nb-contact-chip">⌖ {location}</span>
            )}
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-contact-chip"
              >
                ⌥ GitHub
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-contact-chip"
              >
                ⊞ LinkedIn
              </a>
            )}
            {website && (
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-contact-chip"
              >
                ↗ Website
              </a>
            )}
          </div>
        </div>

        {/* Right: 3D Model */}
        <div
          style={{
            background: "#f5f0e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            minHeight: "340px",
          }}
        >
          {/* Decorative grid lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              zIndex: 0,
            }}
          />
          {/* Label */}
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              background: "#000",
              color: "#f97316",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              padding: "0.2rem 0.6rem",
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            3D.PREVIEW
          </div>
          <div style={{ width: "100%", height: "320px", zIndex: 1 }}>
            <BrutalistModel3D />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginBottom: "2rem",
            borderBottom: "3px solid #000",
            paddingBottom: "1rem",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nb-tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* ── Main panel ── */}
          <div>
            {/* ABOUT */}
            {activeTab === "about" && (
              <div>
                {skills.length > 0 && (
                  <Section title="// Skills">
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {skills.map((skill, i) => (
                        <Tag key={i} accent={i % 5 === 0}>
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  </Section>
                )}
                {certifications.length > 0 && (
                  <Section title="// Certifications">
                    {certifications.map((cert, i) => (
                      <div key={i} className="nb-card">
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {cert.name || cert.title}
                        </div>
                        {cert.issuer && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#666",
                              fontStyle: "italic",
                            }}
                          >
                            {cert.issuer}
                            {cert.year || cert.date
                              ? ` · ${cert.year || cert.date}`
                              : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </Section>
                )}
              </div>
            )}

            {/* EXPERIENCE */}
            {activeTab === "experience" && (
              <Section title="// Work Experience">
                {experience.length > 0 ? (
                  experience.map((exp, i) => (
                    <div key={i} className="nb-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "0.3rem",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <div>
                          <div
                            style={{ fontWeight: 700, fontSize: "1rem" }}
                          >
                            {exp.title || exp.role}
                          </div>
                          <div
                            style={{
                              color: "#f97316",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                            }}
                          >
                            {exp.company}
                          </div>
                        </div>
                        <div
                          style={{
                            border: "2px solid #000",
                            background: "#f5f0e8",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            whiteSpace: "nowrap",
                            boxShadow: "2px 2px 0 #000",
                          }}
                        >
                          {exp.startDate || exp.start}
                          {exp.endDate || exp.end
                            ? ` → ${exp.endDate || exp.end}`
                            : " → Present"}
                        </div>
                      </div>
                      {exp.location && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "#666",
                            marginBottom: "0.5rem",
                          }}
                        >
                          ⌖ {exp.location}
                        </div>
                      )}
                      {exp.description && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            lineHeight: 1.7,
                            color: "#333",
                            margin: 0,
                          }}
                        >
                          {exp.description}
                        </p>
                      )}
                      {Array.isArray(exp.responsibilities) &&
                        exp.responsibilities.length > 0 && (
                          <ul
                            style={{
                              margin: "0.5rem 0 0 1rem",
                              padding: 0,
                              fontSize: "0.8rem",
                              lineHeight: 1.7,
                              color: "#333",
                            }}
                          >
                            {exp.responsibilities.map((r, ri) => (
                              <li key={ri}>{r}</li>
                            ))}
                          </ul>
                        )}
                      {Array.isArray(exp.achievements) &&
                        exp.achievements.length > 0 && (
                          <ul
                            style={{
                              margin: "0.5rem 0 0 1rem",
                              padding: 0,
                              fontSize: "0.8rem",
                              lineHeight: 1.7,
                              color: "#333",
                            }}
                          >
                            {exp.achievements.map((a, ai) => (
                              <li key={ai}>{a}</li>
                            ))}
                          </ul>
                        )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "#666" }}>
                    No experience added yet.
                  </p>
                )}
              </Section>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <Section title="// Projects">
                {projects.length > 0 ? (
                  projects.map((proj, i) => (
                    <div key={i} className="nb-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "0.4rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{ fontWeight: 700, fontSize: "0.95rem" }}
                        >
                          {proj.name || proj.title}
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          {proj.liveUrl || proj.demo ? (
                            <a
                              href={proj.liveUrl || proj.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                border: "2px solid #000",
                                background: "#f97316",
                                color: "#000",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                padding: "0.15rem 0.5rem",
                                textDecoration: "none",
                                boxShadow: "2px 2px 0 #000",
                              }}
                            >
                              ↗ LIVE
                            </a>
                          ) : null}
                          {proj.githubUrl || proj.github ? (
                            <a
                              href={proj.githubUrl || proj.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                border: "2px solid #000",
                                background: "#fff",
                                color: "#000",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                padding: "0.15rem 0.5rem",
                                textDecoration: "none",
                                boxShadow: "2px 2px 0 #000",
                              }}
                            >
                              ⌥ CODE
                            </a>
                          ) : null}
                        </div>
                      </div>
                      {proj.description && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            lineHeight: 1.7,
                            color: "#333",
                            margin: "0 0 0.6rem 0",
                          }}
                        >
                          {proj.description}
                        </p>
                      )}
                      {Array.isArray(proj.technologies) &&
                        proj.technologies.length > 0 && (
                          <div
                            style={{ display: "flex", flexWrap: "wrap" }}
                          >
                            {proj.technologies.map((tech, ti) => (
                              <Tag key={ti}>{tech}</Tag>
                            ))}
                          </div>
                        )}
                      {Array.isArray(proj.tech) && proj.tech.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {proj.tech.map((tech, ti) => (
                            <Tag key={ti}>{tech}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "#666" }}>
                    No projects added yet.
                  </p>
                )}
              </Section>
            )}

            {/* EDUCATION */}
            {activeTab === "education" && (
              <Section title="// Education">
                {education.length > 0 ? (
                  education.map((edu, i) => (
                    <div key={i} className="nb-card">
                      <div
                        style={{ fontWeight: 700, fontSize: "0.95rem" }}
                      >
                        {edu.degree || edu.field}
                      </div>
                      <div
                        style={{
                          color: "#f97316",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {edu.school || edu.institution}
                      </div>
                      <div
                        style={{ fontSize: "0.72rem", color: "#666" }}
                      >
                        {edu.startDate || edu.start}
                        {edu.endDate || edu.end
                          ? ` → ${edu.endDate || edu.end}`
                          : ""}
                        {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                      </div>
                      {edu.description && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            lineHeight: 1.7,
                            color: "#333",
                            margin: "0.5rem 0 0",
                          }}
                        >
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "#666" }}>
                    No education added yet.
                  </p>
                )}
              </Section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div>
            {/* Stats block */}
            <div
              style={{
                border: "3px solid #000",
                background: "#000",
                boxShadow: "6px 6px 0 #f97316",
                marginBottom: "1.5rem",
                padding: "1.2rem",
              }}
            >
              <div
                style={{
                  color: "#f97316",
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                Quick Stats
              </div>
              {[
                { label: "Skills", val: skills.length },
                { label: "Projects", val: projects.length },
                { label: "Experience", val: experience.length },
                { label: "Education", val: education.length },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #333",
                    paddingBottom: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      color: "#999",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      color: "#f97316",
                      fontFamily: "'Anton', sans-serif",
                      fontSize: "1.4rem",
                    }}
                  >
                    {String(val).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

            {/* Skills mini list */}
            {skills.length > 0 && activeTab !== "about" && (
              <div
                style={{
                  border: "3px solid #000",
                  background: "#fff",
                  boxShadow: "6px 6px 0 #000",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.8rem",
                    borderBottom: "2px solid #000",
                    paddingBottom: "0.4rem",
                  }}
                >
                  Top Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {skills.slice(0, 10).map((skill, i) => (
                    <Tag key={i} accent={i % 4 === 0}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: "4px solid #000",
          background: "#000",
          color: "#f97316",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span>✦ {name.toUpperCase()} · PORTFOLIO</span>
        <span style={{ color: "#666" }}>
          NEO-BRUTALISM TEMPLATE · BUILT WITH THREE.JS
        </span>
      </div>
    </div>
  );
}