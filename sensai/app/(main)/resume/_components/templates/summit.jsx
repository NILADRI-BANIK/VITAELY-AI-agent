const SummitTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily:
          "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        fontSize: "13px",
        lineHeight: "1.67",
        color: "#1a2332",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header — mountain peak shape */}
      <div
        style={{
          backgroundColor: "#1a2332",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Mountain peak SVG background */}
        <svg
          viewBox="0 0 794 160"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            height: "100%",
          }}
          preserveAspectRatio="none"
        >
          {/* Snow cap peak */}
          <polygon points="397,0 480,80 314,80" fill="rgba(255,255,255,0.06)" />
          {/* Left mountain slope */}
          <polygon points="0,160 397,0 200,160" fill="rgba(255,255,255,0.03)" />
          {/* Right mountain slope */}
          <polygon
            points="794,160 397,0 600,160"
            fill="rgba(255,255,255,0.03)"
          />
          {/* Ridge lines */}
          <line
            x1="397"
            y1="0"
            x2="0"
            y2="160"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <line
            x1="397"
            y1="0"
            x2="794"
            y2="160"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <line
            x1="397"
            y1="0"
            x2="200"
            y2="160"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
          <line
            x1="397"
            y1="0"
            x2="600"
            y2="160"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Top peak bar — bold and thick */}
        <div
          style={{
            background:
              "linear-gradient(90deg, #15803d 0%, #166534 40%, #14532d 100%)",
            height: "8px",
            width: "100%",
          }}
        />

        {/* Tapering accent bars */}
        <div style={{ position: "relative", padding: "0 54px" }}>
          <div
            style={{
              background:
                "linear-gradient(90deg, #15803d, #166534, transparent)",
              height: "3px",
              width: "70%",
            }}
          />
          <div
            style={{
              background: "linear-gradient(90deg, #15803d, transparent)",
              height: "1px",
              width: "45%",
              marginBottom: "2px",
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            padding: "32px 54px 52px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {userName && (
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 8px 0",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "'Gill Sans', Calibri, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Mountain peak divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "14px 0",
            }}
          >
            <div
              style={{
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: "0 8px 12px 8px",
                borderColor: "transparent transparent #15803d transparent",
              }}
            />
            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "linear-gradient(90deg, #15803d, rgba(255,255,255,0.1))",
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "1.5px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Bottom SVG mountain taper */}
        <div style={{ lineHeight: "0" }}>
          <svg
            viewBox="0 0 794 32"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%" }}
            preserveAspectRatio="none"
          >
            <polygon points="0,0 794,0 397,32" fill="#ffffff" />
            <polygon points="0,0 280,0 397,32" fill="#15803d" opacity="0.12" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "36px 54px 52px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.67",
            color: "#1a2332",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #1a2332 !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          padding-bottom: 8px !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '' !important;
          display: inline-block !important;
          width: 0 !important;
          height: 0 !important;
          border-style: solid !important;
          border-width: 0 6px 10px 6px !important;
          border-color: transparent transparent #15803d transparent !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #15803d55, transparent) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1a2332 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2d3748 !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a2332 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #2d3748 !important;
          padding-left: 20px !important;
          position: relative !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 0 !important;
          top: 5px !important;
          width: 0 !important;
          height: 0 !important;
          border-style: solid !important;
          border-width: 0 5px 8px 5px !important;
          border-color: transparent transparent #15803d transparent !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #15803d !important;
          text-decoration: none !important;
          border-bottom: 1px solid #15803d44 !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #15803d33, transparent) !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default SummitTemplate;
