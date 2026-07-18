const QuantumTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Century Gothic', 'Gill Sans', 'Trebuchet MS', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#e2e8f0",
        backgroundColor: "#020c1b",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Particle dot grid background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle, #1e40af22 1px, transparent 1px),
            radial-gradient(circle, #1e40af22 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Glow orbs in background */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-60px",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #1e40af18 0%, #1e3a8a0e 50%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "-80px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #0ea5e914 0%, #0284c70a 50%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "30%",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #1d4ed810 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top energy bar */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, transparent 0%, #1e40af 20%, #3b82f6 45%, #0ea5e9 55%, #38bdf8 70%, #1e40af 85%, transparent 100%)",
          boxShadow: "0 0 12px #3b82f666, 0 0 24px #1e40af44",
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "36px 44px 28px 44px",
          borderBottom: "1px solid #1e3a8a33",
          display: "flex",
          alignItems: "center",
          gap: "30px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Atomic orbit SVG behind image */}
        {profileImage && (
          <div
            style={{
              flexShrink: 0,
              position: "relative",
              width: "116px",
              height: "116px",
            }}
          >
            {/* Orbit rings SVG */}
            <svg
              viewBox="0 0 116 116"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "116px",
                height: "116px",
              }}
            >
              {/* Outer orbit ellipse */}
              <ellipse
                cx="58"
                cy="58"
                rx="54"
                ry="20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.8"
                opacity="0.3"
                transform="rotate(-30 58 58)"
              />
              {/* Second orbit ellipse */}
              <ellipse
                cx="58"
                cy="58"
                rx="54"
                ry="20"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="0.8"
                opacity="0.25"
                transform="rotate(60 58 58)"
              />
              {/* Third orbit ellipse */}
              <ellipse
                cx="58"
                cy="58"
                rx="54"
                ry="20"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                opacity="0.2"
                transform="rotate(150 58 58)"
              />
              {/* Electron dots on orbits */}
              <circle cx="58" cy="4" r="2.5" fill="#3b82f6" opacity="0.8" />
              <circle cx="104" cy="78" r="2" fill="#0ea5e9" opacity="0.7" />
              <circle cx="14" cy="72" r="2" fill="#38bdf8" opacity="0.7" />
              {/* Nucleus glow */}
              <circle cx="58" cy="58" r="6" fill="#1e40af" opacity="0.3" />
              <circle cx="58" cy="58" r="3" fill="#3b82f6" opacity="0.5" />
            </svg>

            {/* Profile image circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                padding: "2px",
                background:
                  "linear-gradient(135deg, #1e40af, #3b82f6, #0ea5e9, #38bdf8)",
                boxSizing: "border-box",
                boxShadow: "0 0 20px #3b82f644, 0 0 40px #1e40af33",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: "#020c1b",
                  padding: "2px",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                    filter: "brightness(0.9) saturate(0.85) contrast(1.05)",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Name & Contact */}
        <div style={{ flex: 1 }}>
          {/* Sci-fi label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                boxShadow: "0 0 6px #3b82f6, 0 0 12px #3b82f666",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#3b82f6",
                fontWeight: "600",
                fontFamily: "'Courier New', monospace",
              }}
            >
              PARTICLE_ID :: QNT-001
            </span>
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 4px 0",
                color: "#e2e8f0",
                letterSpacing: "3px",
                textTransform: "uppercase",
                lineHeight: "1.2",
                fontFamily: "'Century Gothic', 'Gill Sans', sans-serif",
                textShadow: "0 0 30px #3b82f633",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Energy beam divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#0ea5e9",
                boxShadow: "0 0 6px #0ea5e9",
              }}
            />
            <div
              style={{
                flex: 1,
                maxWidth: "180px",
                height: "1px",
                background:
                  "linear-gradient(90deg, #3b82f6, #0ea5e9, transparent)",
                boxShadow: "0 0 4px #3b82f644",
              }}
            />
            <div
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: "#38bdf8",
                opacity: 0.5,
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                letterSpacing: "1px",
                lineHeight: "2",
                fontFamily: "'Century Gothic', 'Trebuchet MS', sans-serif",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Right particle cluster */}
        <div
          style={{
            flexShrink: 0,
            position: "relative",
            width: "48px",
            height: "80px",
            opacity: 0.45,
          }}
        >
          {[
            { top: "0px", left: "24px", r: "3px", color: "#3b82f6" },
            { top: "14px", left: "8px", r: "2px", color: "#0ea5e9" },
            { top: "14px", left: "38px", r: "1.5px", color: "#38bdf8" },
            { top: "30px", left: "18px", r: "2.5px", color: "#3b82f6" },
            { top: "44px", left: "36px", r: "2px", color: "#0ea5e9" },
            { top: "50px", left: "6px", r: "1.5px", color: "#38bdf8" },
            { top: "62px", left: "28px", r: "3px", color: "#3b82f6" },
            { top: "72px", left: "14px", r: "1.5px", color: "#0ea5e9" },
          ].map((dot, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: dot.top,
                left: dot.left,
                width: dot.r,
                height: dot.r,
                borderRadius: "50%",
                backgroundColor: dot.color,
                boxShadow: `0 0 4px ${dot.color}`,
              }}
            />
          ))}
          {/* Connecting lines */}
          <svg
            viewBox="0 0 48 80"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "48px",
              height: "80px",
            }}
          >
            <line
              x1="27"
              y1="3"
              x2="10"
              y2="16"
              stroke="#3b82f6"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <line
              x1="10"
              y1="16"
              x2="20"
              y2="32"
              stroke="#0ea5e9"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <line
              x1="20"
              y1="32"
              x2="38"
              y2="46"
              stroke="#38bdf8"
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1="38"
              y1="46"
              x2="30"
              y2="64"
              stroke="#3b82f6"
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1="27"
              y1="3"
              x2="40"
              y2="16"
              stroke="#0ea5e9"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1="8"
              y1="52"
              x2="20"
              y2="32"
              stroke="#38bdf8"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "30px 44px 44px 44px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#cbd5e1",
          }}
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      </div>

      {/* Bottom energy bar */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, transparent 0%, #1e40af 20%, #0ea5e9 50%, #3b82f6 80%, transparent 100%)",
          boxShadow: "0 0 10px #3b82f655",
          position: "relative",
          zIndex: 2,
        }}
      />

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #38bdf8 !important;
          border-bottom: none !important;
          padding-bottom: 4px !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Century Gothic', 'Gill Sans', sans-serif !important;
          text-shadow: 0 0 10px #0ea5e944 !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '' !important;
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #3b82f6 !important;
          box-shadow: 0 0 6px #3b82f6, 0 0 12px #3b82f666 !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #3b82f644, #0ea5e922, transparent) !important;
          margin-left: 6px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #e2e8f0 !important;
          font-family: 'Century Gothic', 'Gill Sans', sans-serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #94a3b8 !important;
          font-family: 'Century Gothic', 'Trebuchet MS', sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #e2e8f0 !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #94a3b8 !important;
          font-family: 'Century Gothic', 'Trebuchet MS', sans-serif !important;
          list-style-type: none !important;
          padding-left: 18px !important;
          position: relative !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 2px !important;
          top: 6px !important;
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          background-color: #1e40af !important;
          border: 1.5px solid #3b82f6 !important;
          box-shadow: 0 0 4px #3b82f666 !important;
        }
        a {
          color: #38bdf8 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #1e40af55 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #1e3a8a33 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default QuantumTemplate;
