const CyberTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#00ff41",
        backgroundColor: "#0a0a0a",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Scanline overlay effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Top neon bar */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #00ff41 40%, #00cfff 60%, transparent 100%)",
          boxShadow: "0 0 10px #00ff41, 0 0 20px #00ff4166",
        }}
      />

      {/* Terminal header label */}
      <div
        style={{
          backgroundColor: "#0d0d0d",
          borderBottom: "1px solid #00ff4133",
          padding: "6px 44px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ color: "#00ff41", fontSize: "10px", letterSpacing: "2px" }}>●</span>
        <span style={{ color: "#ff5f57", fontSize: "10px" }}>●</span>
        <span style={{ color: "#ffbd2e", fontSize: "10px" }}>●</span>
        <span
          style={{
            color: "#00ff4188",
            fontSize: "10px",
            letterSpacing: "3px",
            marginLeft: "12px",
            textTransform: "uppercase",
          }}
        >
          resume.exe — terminal v2.0
        </span>
      </div>

      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#0d0d0d",
          padding: "32px 44px 24px 44px",
          borderBottom: "1px solid #00ff4133",
          display: "flex",
          alignItems: "center",
          gap: "28px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Profile Image */}
        {profileImage && (
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: "104px",
                height: "104px",
                padding: "2px",
                background: "linear-gradient(135deg, #00ff41, #00cfff)",
                boxSizing: "border-box",
                clipPath: "polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)",
                boxShadow: "0 0 18px #00ff4155, 0 0 36px #00cfff33",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  clipPath: "polygon(7px 0%, 100% 0%, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0% 100%, 0% 7px)",
                  filter: "brightness(0.9) contrast(1.1) saturate(0.85)",
                }}
              />
            </div>
          </div>
        )}

        {/* Name & Contact */}
        <div style={{ flex: 1 }}>
          {/* Prompt prefix */}
          <div
            style={{
              fontSize: "10px",
              color: "#00cfff",
              letterSpacing: "2px",
              marginBottom: "4px",
              fontFamily: "'Courier New', monospace",
            }}
          >
            root@system:~$&nbsp;<span style={{ color: "#00ff4188" }}>whoami</span>
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                margin: "0 0 6px 0",
                color: "#00ff41",
                letterSpacing: "3px",
                textTransform: "uppercase",
                lineHeight: "1.2",
                fontFamily: "'Courier New', monospace",
                textShadow: "0 0 12px #00ff41, 0 0 24px #00ff4166",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Neon divider */}
          <div
            style={{
              height: "1px",
              width: "180px",
              background: "linear-gradient(90deg, #00ff41, #00cfff, transparent)",
              margin: "8px 0",
              boxShadow: "0 0 6px #00ff4155",
            }}
          />

          {contactInfo && (
            <div
              style={{
                fontSize: "11px",
                color: "#00cfff",
                letterSpacing: "1px",
                lineHeight: "2",
                fontFamily: "'Courier New', monospace",
              }}
            >
              <span style={{ color: "#00ff4166" }}>&gt;&nbsp;</span>
              {contactInfo}
            </div>
          )}
        </div>

        {/* Corner bracket decoration */}
        <div style={{ flexShrink: 0, opacity: 0.5 }}>
          <div style={{ color: "#00cfff", fontSize: "28px", lineHeight: 1, fontFamily: "monospace" }}>
            {"["}
            <br />
            {" "}
            <br />
            {"]"}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "28px 44px 40px 44px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#ccffcc",
            fontFamily: "'Courier New', Courier, monospace",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom bar */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #00cfff 40%, #00ff41 60%, transparent 100%)",
          boxShadow: "0 0 10px #00cfff, 0 0 20px #00cfff66",
        }}
      />

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #00cfff !important;
          border-bottom: none !important;
          padding-bottom: 4px !important;
          margin-top: 28px !important;
          margin-bottom: 10px !important;
          font-family: 'Courier New', monospace !important;
          text-shadow: 0 0 8px #00cfff, 0 0 16px #00cfff66 !important;
          position: relative !important;
        }
        h2::before {
          content: '// ' !important;
          color: #00ff4166 !important;
          font-size: 11px !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          height: 1px !important;
          background: linear-gradient(90deg, #00cfff88, #00ff4144, transparent) !important;
          margin-top: 6px !important;
          box-shadow: 0 0 6px #00cfff44 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #00ff41 !important;
          font-family: 'Courier New', monospace !important;
          text-shadow: 0 0 6px #00ff4166 !important;
          letter-spacing: 1px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #99cc99 !important;
          font-family: 'Courier New', monospace !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #00ff41 !important;
          text-shadow: 0 0 6px #00ff4155 !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #99cc99 !important;
          font-family: 'Courier New', monospace !important;
          list-style-type: none !important;
          padding-left: 14px !important;
          position: relative !important;
        }
        li::before {
          content: '>' !important;
          position: absolute !important;
          left: 0px !important;
          color: #00cfff !important;
          font-weight: 700 !important;
          text-shadow: 0 0 6px #00cfff !important;
        }
        a {
          color: #00cfff !important;
          text-decoration: none !important;
          border-bottom: 1px solid #00cfff44 !important;
          text-shadow: 0 0 6px #00cfff66 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #00ff4122 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default CyberTemplate;