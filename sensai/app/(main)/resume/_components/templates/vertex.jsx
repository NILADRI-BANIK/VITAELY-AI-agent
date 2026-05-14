const VertexTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Trebuchet MS', 'Century Gothic', 'Gill Sans', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#0f172a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Header geometric block */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#0f172a",
          overflow: "hidden",
          minHeight: "196px",
        }}
      >
        {/* SVG geometric background shapes */}
        <svg
          viewBox="0 0 794 196"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
          preserveAspectRatio="none"
        >
          {/* Background geometric panels */}
          <polygon points="0,0 340,0 260,196 0,196" fill="#1e293b" />
          <polygon
            points="300,0 520,0 440,196 220,196"
            fill="#1a2744"
            opacity="0.6"
          />
          <polygon points="480,0 794,0 794,196 400,196" fill="#162032" />

          {/* Accent sharp triangles */}
          <polygon points="0,0 160,0 0,160" fill="#4338ca" opacity="0.25" />
          <polygon points="0,0 80,0 0,80" fill="#6366f1" opacity="0.3" />
          <polygon points="634,0 794,0 794,162" fill="#4338ca" opacity="0.2" />
          <polygon points="714,0 794,0 794,80" fill="#6366f1" opacity="0.25" />

          {/* Diagonal accent lines */}
          <line
            x1="180"
            y1="0"
            x2="0"
            y2="196"
            stroke="#6366f1"
            strokeWidth="0.8"
            opacity="0.2"
          />
          <line
            x1="320"
            y1="0"
            x2="140"
            y2="196"
            stroke="#818cf8"
            strokeWidth="0.5"
            opacity="0.15"
          />
          <line
            x1="614"
            y1="0"
            x2="794"
            y2="196"
            stroke="#6366f1"
            strokeWidth="0.8"
            opacity="0.2"
          />

          {/* Bottom sharp zigzag edge */}
          <polygon
            points="0,196 794,196 794,178 695,196 596,178 497,196 398,178 299,196 200,178 101,196 0,178"
            fill="#ffffff"
          />
        </svg>

        {/* Header content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "32px 44px 40px 44px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* Profile image in polygon clip */}
          {profileImage && (
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  position: "relative",
                  width: "110px",
                  height: "110px",
                }}
              >
                {/* Outer glow border polygon */}
                <svg
                  viewBox="0 0 110 110"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "110px",
                    height: "110px",
                  }}
                >
                  <defs>
                    <clipPath id="hexClip">
                      <polygon points="55,2 104,28 104,82 55,108 6,82 6,28" />
                    </clipPath>
                    <linearGradient
                      id="borderGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4338ca" />
                    </linearGradient>
                  </defs>
                  {/* Border polygon */}
                  <polygon
                    points="55,2 104,28 104,82 55,108 6,82 6,28"
                    fill="none"
                    stroke="url(#borderGrad)"
                    strokeWidth="2.5"
                  />
                  {/* Inner accent lines at corners */}
                  <polygon
                    points="55,2 104,28 104,82 55,108 6,82 6,28"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="6"
                    opacity="0.15"
                  />
                  <image
                    href={profileImage}
                    x="8"
                    y="8"
                    width="94"
                    height="94"
                    clipPath="url(#hexClip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Name & Contact */}
          <div style={{ flex: 1 }}>
            {/* Geometric accent bar above name */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "9px solid #6366f1",
                }}
              />
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "9px solid #818cf8",
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "9px solid #a5b4fc",
                  opacity: 0.3,
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "linear-gradient(90deg, #6366f144, transparent)",
                  marginLeft: "4px",
                }}
              />
            </div>

            {userName && (
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "700",
                  margin: "0 0 4px 0",
                  color: "#f8fafc",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  lineHeight: "1.15",
                  fontFamily: "'Trebuchet MS', 'Century Gothic', sans-serif",
                }}
              >
                {userName}
              </h1>
            )}

            {/* Sharp geometric divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0",
                margin: "10px 0",
                width: "200px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: "linear-gradient(90deg, #6366f1, #818cf8)",
                }}
              />
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "8px solid #818cf8",
                }}
              />
            </div>

            {contactInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(248,250,252,0.6)",
                  letterSpacing: "1px",
                  lineHeight: "2",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>

          {/* Right geometric corner stack */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              alignItems: "flex-end",
              opacity: 0.3,
            }}
          >
            {[60, 44, 28, 14].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w}px`,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, #818cf8)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Geometric accent strip */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          height: "6px",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 2, backgroundColor: "#4338ca" }} />
        <div style={{ flex: 1, backgroundColor: "#6366f1" }} />
        <div style={{ flex: 1, backgroundColor: "#818cf8" }} />
        <div style={{ flex: 1, backgroundColor: "#a5b4fc" }} />
        <div style={{ flex: 3, backgroundColor: "#e0e7ff" }} />
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "30px 44px 44px 44px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#0f172a",
          }}
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      </div>

      {/* Bottom geometric bar */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          height: "6px",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 3, backgroundColor: "#e0e7ff" }} />
        <div style={{ flex: 1, backgroundColor: "#a5b4fc" }} />
        <div style={{ flex: 1, backgroundColor: "#818cf8" }} />
        <div style={{ flex: 1, backgroundColor: "#6366f1" }} />
        <div style={{ flex: 2, backgroundColor: "#4338ca" }} />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #4338ca !important;
          border-bottom: none !important;
          padding-bottom: 4px !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Trebuchet MS', 'Century Gothic', sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '' !important;
          display: inline-block !important;
          width: 0 !important;
          height: 0 !important;
          border-top: 6px solid transparent !important;
          border-bottom: 6px solid transparent !important;
          border-left: 11px solid #6366f1 !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #6366f155, #a5b4fc33, transparent) !important;
          margin-left: 6px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #0f172a !important;
          font-family: 'Trebuchet MS', 'Century Gothic', sans-serif !important;
          letter-spacing: 0.3px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #475569 !important;
          font-family: 'Trebuchet MS', sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #0f172a !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #475569 !important;
          font-family: 'Trebuchet MS', sans-serif !important;
          list-style-type: none !important;
          padding-left: 18px !important;
          position: relative !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 0px !important;
          top: 5px !important;
          width: 0 !important;
          height: 0 !important;
          border-top: 5px solid transparent !important;
          border-bottom: 5px solid transparent !important;
          border-left: 9px solid #6366f1 !important;
          opacity: 0.65 !important;
        }
        a {
          color: #4338ca !important;
          text-decoration: none !important;
          border-bottom: 1px solid #c7d2fe !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #e0e7ff !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default VertexTemplate;
