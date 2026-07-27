const PrismTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Trebuchet MS', 'Gill Sans', 'Century Gothic', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1a1a2e",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Rainbow prism top bar */}
      <div style={{ display: "flex", height: "5px" }}>
        {[
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#06b6d4",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
        ].map((color, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: color,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Header with SVG triangles */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#0f0f1a",
          overflow: "hidden",
          minHeight: "180px",
        }}
      >
        {/* SVG triangle prism background */}
        <svg
          viewBox="0 0 794 180"
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
          {/* Large triangle panels — prism light split */}
          <polygon points="0,0 180,0 0,180" fill="rgba(239,68,68,0.09)" />
          <polygon
            points="0,0 280,0 60,180 0,180"
            fill="rgba(249,115,22,0.08)"
          />
          <polygon
            points="180,0 400,0 200,180 60,180"
            fill="rgba(234,179,8,0.07)"
          />
          <polygon
            points="280,0 480,0 300,180 160,180"
            fill="rgba(34,197,94,0.06)"
          />
          <polygon
            points="400,0 580,0 420,180 260,180"
            fill="rgba(6,182,212,0.07)"
          />
          <polygon
            points="480,0 680,0 540,180 360,180"
            fill="rgba(59,130,246,0.08)"
          />
          <polygon
            points="580,0 794,0 794,80 640,180 480,180"
            fill="rgba(139,92,246,0.09)"
          />
          <polygon points="680,0 794,0 794,0" fill="rgba(236,72,153,0.09)" />

          {/* Bright accent triangle edges */}
          <polygon points="0,0 120,0 0,120" fill="#ef444430" />
          <polygon points="100,0 200,0 100,100 0,100" fill="#f9731620" />
          <polygon points="560,0 794,0 794,120" fill="#8b5cf630" />
          <polygon points="650,0 794,0 794,80" fill="#ec489925" />

          {/* Light beam lines from center */}
          <line
            x1="397"
            y1="0"
            x2="0"
            y2="180"
            stroke="#ffffff"
            strokeWidth="0.4"
            opacity="0.08"
          />
          <line
            x1="397"
            y1="0"
            x2="200"
            y2="180"
            stroke="#ffffff"
            strokeWidth="0.3"
            opacity="0.06"
          />
          <line
            x1="397"
            y1="0"
            x2="400"
            y2="180"
            stroke="#ffffff"
            strokeWidth="0.4"
            opacity="0.08"
          />
          <line
            x1="397"
            y1="0"
            x2="600"
            y2="180"
            stroke="#ffffff"
            strokeWidth="0.3"
            opacity="0.06"
          />
          <line
            x1="397"
            y1="0"
            x2="794"
            y2="180"
            stroke="#ffffff"
            strokeWidth="0.4"
            opacity="0.08"
          />
        </svg>

        {/* Header content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "32px 44px 28px 44px",
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {/* Profile Image */}
          {profileImage && (
            <div style={{ flexShrink: 0 }}>
              {/* Triangle clip frame */}
              <div
                style={{
                  width: "108px",
                  height: "108px",
                  position: "relative",
                }}
              >
                {/* Rainbow ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    padding: "3px",
                    background:
                      "conic-gradient(#ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
                    boxSizing: "border-box",
                    boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      backgroundColor: "#0f0f1a",
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
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Name & Contact */}
          <div style={{ flex: 1 }}>
            {/* Rainbow spectrum label */}
            <div
              style={{
                display: "flex",
                gap: "3px",
                marginBottom: "8px",
              }}
            >
              {["R", "E", "S", "U", "M", "E"].map((letter, i) => {
                const colors = [
                  "#ef4444",
                  "#f97316",
                  "#eab308",
                  "#22c55e",
                  "#3b82f6",
                  "#8b5cf6",
                ];
                return (
                  <span
                    key={i}
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: colors[i],
                      opacity: 0.8,
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>

            {userName && (
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: "0 0 6px 0",
                  color: "#ffffff",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  lineHeight: "1.2",
                  fontFamily: "'Trebuchet MS', 'Century Gothic', sans-serif",
                }}
              >
                {userName}
              </h1>
            )}

            {/* Prism rainbow divider */}
            <div
              style={{
                display: "flex",
                height: "2px",
                width: "220px",
                margin: "10px 0",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              {[
                "#ef4444",
                "#f97316",
                "#eab308",
                "#22c55e",
                "#06b6d4",
                "#3b82f6",
                "#8b5cf6",
                "#ec4899",
              ].map((color, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: color }} />
              ))}
            </div>

            {contactInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "1px",
                  lineHeight: "2",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>

        {/* Bottom triangle cutout row */}
        <svg
          viewBox="0 0 794 20"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%", height: "20px" }}
          preserveAspectRatio="none"
        >
          {[
            { x: 0, color: "#ef4444" },
            { x: 99, color: "#f97316" },
            { x: 198, color: "#eab308" },
            { x: 297, color: "#22c55e" },
            { x: 396, color: "#06b6d4" },
            { x: 495, color: "#3b82f6" },
            { x: 594, color: "#8b5cf6" },
            { x: 693, color: "#ec4899" },
          ].map(({ x, color }, i) => (
            <polygon
              key={i}
              points={`${x},0 ${x + 99},0 ${x + 50},20`}
              fill={color}
              opacity="0.7"
            />
          ))}
        </svg>
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
            color: "#1a1a2e",
          }}
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      </div>

      {/* Bottom prism bar */}
      <div style={{ display: "flex", height: "5px" }}>
        {[
          "#8b5cf6",
          "#3b82f6",
          "#06b6d4",
          "#22c55e",
          "#eab308",
          "#f97316",
          "#ef4444",
          "#ec4899",
        ].map((color, i) => (
          <div
            key={i}
            style={{ flex: 1, backgroundColor: color, opacity: 0.9 }}
          />
        ))}
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #1a1a2e !important;
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
          border-left: 7px solid transparent !important;
          border-right: 7px solid transparent !important;
          border-bottom: 12px solid #8b5cf6 !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 2px !important;
          background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, transparent) !important;
          margin-left: 6px !important;
          border-radius: 2px !important;
          opacity: 0.5 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #1a1a2e !important;
          font-family: 'Trebuchet MS', 'Century Gothic', sans-serif !important;
          letter-spacing: 0.3px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #4b5563 !important;
          font-family: 'Trebuchet MS', sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #1a1a2e !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #4b5563 !important;
          font-family: 'Trebuchet MS', sans-serif !important;
          list-style-type: none !important;
          padding-left: 18px !important;
          position: relative !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 0px !important;
          top: 4px !important;
          width: 0 !important;
          height: 0 !important;
          border-left: 5px solid transparent !important;
          border-right: 5px solid transparent !important;
          border-bottom: 9px solid #8b5cf6 !important;
          opacity: 0.7 !important;
        }
        a {
          color: #6d28d9 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #c4b5fd55 !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899) !important;
          margin: 10px 0 !important;
          opacity: 0.3 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default PrismTemplate;
