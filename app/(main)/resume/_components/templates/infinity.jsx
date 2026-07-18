const InfinityTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Century Gothic', 'Futura', 'Trebuchet MS', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1e1b2e",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Gradient Header Block */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 25%, #6d28d9 50%, #7c3aed 70%, #a855f7 100%)",
          padding: "40px 44px 36px 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background ∞ watermark large */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "30px",
            transform: "translateY(-50%)",
            fontSize: "200px",
            lineHeight: 1,
            color: "rgba(255,255,255,0.04)",
            fontWeight: "900",
            fontFamily: "Georgia, serif",
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "-10px",
          }}
        >
          ∞
        </div>

        {/* Subtle arc overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-50px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />

        {/* Header content row */}
        <div
          style={{
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
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  padding: "3px",
                  background: "linear-gradient(135deg, #ffffff55, #a855f7aa, #ffffff33)",
                  boxSizing: "border-box",
                  boxShadow: "0 8px 32px rgba(109,40,217,0.4), 0 0 0 1px rgba(255,255,255,0.15)",
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
                    border: "2px solid rgba(255,255,255,0.2)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {/* Name & Contact */}
          <div style={{ flex: 1 }}>
            {/* ∞ small accent above name */}
            <div
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1,
                marginBottom: "6px",
                letterSpacing: "4px",
              }}
            >
              ∞
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
                  fontFamily: "'Century Gothic', 'Futura', 'Trebuchet MS', sans-serif",
                }}
              >
                {userName}
              </h1>
            )}

            {/* White gradient divider */}
            <div
              style={{
                height: "1px",
                width: "200px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.1), transparent)",
                margin: "10px 0",
              }}
            />

            {contactInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "1px",
                  lineHeight: "2",
                  fontFamily: "'Century Gothic', 'Trebuchet MS', sans-serif",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Infinity loop SVG accent strip */}
      <div
        style={{
          background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
          padding: "10px 44px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid #ddd6fe",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            color: "#7c3aed",
            fontWeight: "900",
            letterSpacing: "2px",
            opacity: 0.5,
          }}
        >
          ∞ ∞ ∞
        </div>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "linear-gradient(90deg, #7c3aed44, transparent)",
          }}
        />
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
            color: "#1e1b2e",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Footer gradient bar */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #1e1b4b, #3730a3, #6d28d9, #a855f7, #6d28d9, #3730a3, #1e1b4b)",
        }}
      />

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #6d28d9 !important;
          border-bottom: none !important;
          padding-bottom: 4px !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Century Gothic', 'Futura', 'Trebuchet MS', sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '∞' !important;
          font-size: 13px !important;
          color: #a855f7 !important;
          font-weight: 900 !important;
          flex-shrink: 0 !important;
          opacity: 0.7 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #7c3aed55, #a855f722, transparent) !important;
          margin-left: 6px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #1e1b2e !important;
          font-family: 'Century Gothic', 'Futura', 'Trebuchet MS', sans-serif !important;
          letter-spacing: 0.3px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #4b4869 !important;
          font-family: 'Century Gothic', 'Trebuchet MS', sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #1e1b2e !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #4b4869 !important;
          font-family: 'Century Gothic', 'Trebuchet MS', sans-serif !important;
          list-style-type: none !important;
          padding-left: 16px !important;
          position: relative !important;
        }
        li::before {
          content: '∞' !important;
          position: absolute !important;
          left: 0px !important;
          color: #a855f7 !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          top: 3px !important;
          opacity: 0.7 !important;
        }
        a {
          color: #6d28d9 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #a855f744 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #e9d5ff !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default InfinityTemplate;