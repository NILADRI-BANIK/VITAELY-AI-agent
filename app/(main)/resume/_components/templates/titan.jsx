const TitanTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Arial Black', 'Impact', 'Haettenschweiler', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#e8e8e8",
        backgroundColor: "#1c1c1c",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Top steel rivets bar */}
      <div
        style={{
          height: "6px",
          background: "linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 40%, #2a2a2a 100%)",
          borderBottom: "1px solid #111111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Steel sheen overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* Header block */}
      <div
        style={{
          background: "linear-gradient(160deg, #2a2a2a 0%, #1e1e1e 50%, #181818 100%)",
          padding: "36px 44px 28px 44px",
          borderBottom: "3px solid #3a3a3a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Industrial grid texture overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
            pointerEvents: "none",
          }}
        />

        {/* Large watermark text */}
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            right: "-10px",
            fontSize: "120px",
            fontWeight: "900",
            color: "rgba(255,255,255,0.02)",
            fontFamily: "'Arial Black', Impact, sans-serif",
            lineHeight: 1,
            letterSpacing: "-4px",
            pointerEvents: "none",
            userSelect: "none",
            textTransform: "uppercase",
          }}
        >
          TITAN
        </div>

        {/* Header content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Profile Image */}
          {profileImage && (
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: "108px",
                  height: "108px",
                  padding: "3px",
                  background: "linear-gradient(135deg, #6b6b6b, #3a3a3a, #888888, #2a2a2a)",
                  boxSizing: "border-box",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  boxShadow: "4px 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
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
                    clipPath: "polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))",
                    filter: "brightness(0.88) contrast(1.1) saturate(0.6)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Name & Contact */}
          <div style={{ flex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "38px",
                  fontWeight: "900",
                  margin: "0 0 4px 0",
                  color: "#f0f0f0",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  lineHeight: "1.05",
                  fontFamily: "'Arial Black', Impact, sans-serif",
                  textShadow: "2px 2px 0px #000000, 3px 3px 8px rgba(0,0,0,0.5)",
                }}
              >
                {userName}
              </h1>
            )}

            {/* Steel divider */}
            <div
              style={{
                height: "3px",
                width: "100%",
                maxWidth: "320px",
                background: "linear-gradient(90deg, #888888, #555555, #333333, transparent)",
                margin: "10px 0",
                boxShadow: "0 1px 0 rgba(255,255,255,0.05)",
              }}
            />

            {contactInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#909090",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  lineHeight: "2",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "400",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>

          {/* Right steel bolt decorations */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              opacity: 0.4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #aaaaaa, #444444)",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.8)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Steel plate divider strip */}
      <div
        style={{
          height: "10px",
          background: "linear-gradient(180deg, #111111 0%, #2a2a2a 40%, #222222 60%, #111111 100%)",
          borderTop: "1px solid #444444",
          borderBottom: "1px solid #111111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "30px 44px 44px 44px",
          boxSizing: "border-box",
          backgroundColor: "#1c1c1c",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#cccccc",
            fontFamily: "Arial, sans-serif",
            fontWeight: "400",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom steel bar */}
      <div
        style={{
          height: "6px",
          background: "linear-gradient(180deg, #2a2a2a 0%, #3a3a3a 50%, #4a4a4a 100%)",
          borderTop: "1px solid #555555",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 5px !important;
          color: #c0c0c0 !important;
          border-bottom: none !important;
          padding: 8px 12px !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Arial Black', Impact, sans-serif !important;
          background: linear-gradient(90deg, #2a2a2a, #222222) !important;
          border-left: 3px solid #666666 !important;
          border-top: 1px solid #3a3a3a !important;
          border-bottom: 1px solid #111111 !important;
          display: block !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #e0e0e0 !important;
          font-family: 'Arial Black', Arial, sans-serif !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #aaaaaa !important;
          font-family: Arial, sans-serif !important;
          font-weight: 400 !important;
        }
        strong, b {
          font-weight: 900 !important;
          display: inline !important;
          color: #dddddd !important;
          font-family: 'Arial Black', Arial, sans-serif !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 5px !important;
          color: #aaaaaa !important;
          font-family: Arial, sans-serif !important;
          list-style-type: none !important;
          padding-left: 18px !important;
          position: relative !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 0px !important;
          top: 6px !important;
          width: 8px !important;
          height: 8px !important;
          background: radial-gradient(circle at 35% 35%, #888888, #333333) !important;
          border-radius: 50% !important;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.8) !important;
        }
        a {
          color: #9ca3af !important;
          text-decoration: none !important;
          border-bottom: 1px solid #444444 !important;
        }
        hr {
          border: none !important;
          border-top: 2px solid #2a2a2a !important;
          border-bottom: 1px solid #3a3a3a !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default TitanTemplate;