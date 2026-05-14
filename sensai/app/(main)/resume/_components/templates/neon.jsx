const NeonTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Courier New', 'Lucida Console', monospace",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#e0e0e0",
        backgroundColor: "#0d0d0d",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Neon Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #0d0d0d 100%)",
          padding: "48px 50px 36px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "2px solid #b400ff",
          boxShadow: "0 0 30px rgba(180,0,255,0.3)",
        }}
      >
        {/* Decorative neon glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "30px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,0,255,0.1) 0%, transparent 70%)",
          }}
        />

        {profileImage ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Profile Image with neon border */}
            <div
              style={{
                flexShrink: 0,
                padding: "3px",
                background: "linear-gradient(135deg, #00ffff, #b400ff)",
                borderRadius: "50%",
                boxShadow: "0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(180,0,255,0.3)",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid #0d0d0d",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              {userName && (
                <h1
                  style={{
                    fontSize: "30px",
                    fontWeight: "700",
                    color: "#00ffff",
                    margin: "0 0 6px 0",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    textShadow: "0 0 10px rgba(0,255,255,0.8), 0 0 30px rgba(0,255,255,0.4)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {userName}
                </h1>
              )}
              <div
                style={{
                  width: "60px",
                  height: "2px",
                  background: "linear-gradient(90deg, #00ffff, #b400ff)",
                  borderRadius: "2px",
                  marginBottom: "10px",
                  boxShadow: "0 0 8px rgba(0,255,255,0.6)",
                }}
              />
              {contactInfo && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(180,0,255,0.9)",
                    letterSpacing: "0.5px",
                    textShadow: "0 0 6px rgba(180,0,255,0.5)",
                  }}
                >
                  {contactInfo}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "700",
                  color: "#00ffff",
                  margin: "0 0 10px 0",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  textShadow: "0 0 10px rgba(0,255,255,0.8), 0 0 30px rgba(0,255,255,0.4)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {userName}
              </h1>
            )}
            <div
              style={{
                width: "60px",
                height: "2px",
                background: "linear-gradient(90deg, #00ffff, #b400ff)",
                margin: "0 auto 10px",
                boxShadow: "0 0 8px rgba(0,255,255,0.6)",
              }}
            />
            {contactInfo && (
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(180,0,255,0.9)",
                  textShadow: "0 0 6px rgba(180,0,255,0.5)",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Neon scan-line divider */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, transparent, #00ffff, #b400ff, #00ffff, transparent)",
          opacity: 0.6,
          boxShadow: "0 0 10px rgba(0,255,255,0.5)",
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "36px 50px 48px",
          backgroundColor: "#0d0d0d",
        }}
      >
        <div
          style={{ fontSize: "13px", lineHeight: "1.7", color: "#e0e0e0" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 13px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #00ffff !important;
          margin-top: 28px !important;
          margin-bottom: 10px !important;
          padding-bottom: 6px !important;
          border-bottom: 1px solid #b400ff !important;
          text-shadow: 0 0 8px rgba(0,255,255,0.7) !important;
          font-family: 'Courier New', monospace !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #b400ff !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          text-shadow: 0 0 6px rgba(180,0,255,0.5) !important;
          font-family: 'Courier New', monospace !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #cccccc !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #00ffff !important;
          display: inline !important;
          text-shadow: 0 0 4px rgba(0,255,255,0.4) !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #cccccc !important;
        }
        li::marker {
          color: #b400ff !important;
        }
        a {
          color: #00ffff !important;
          text-decoration: underline !important;
          text-shadow: 0 0 4px rgba(0,255,255,0.4) !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, transparent, #00ffff, #b400ff, transparent) !important;
          margin: 12px 0 !important;
          opacity: 0.4 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default NeonTemplate;