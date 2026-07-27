const RoyaleTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', 'Palatino Linotype', serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1a1506",
        backgroundColor: "#fdfbf4",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top gold border */}
      <div
        style={{
          height: "6px",
          background: "linear-gradient(90deg, #92702a, #c9a84c, #f0d060, #c9a84c, #92702a)",
        }}
      />

      {/* Thin navy line */}
      <div style={{ height: "2px", backgroundColor: "#1e3a5f" }} />

      {/* Header */}
      <div
        style={{
          backgroundColor: "#1e3a5f",
          padding: "44px 54px 38px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Decorative corner flourish — top left */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "14px",
            fontSize: "28px",
            color: "rgba(201,168,76,0.35)",
            lineHeight: 1,
            fontFamily: "serif",
          }}
        >
          ❧
        </div>

        {/* Decorative corner flourish — top right */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "14px",
            fontSize: "28px",
            color: "rgba(201,168,76,0.35)",
            lineHeight: 1,
            fontFamily: "serif",
            transform: "scaleX(-1)",
          }}
        >
          ❧
        </div>

        {/* Decorative corner flourish — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "14px",
            fontSize: "22px",
            color: "rgba(201,168,76,0.25)",
            lineHeight: 1,
            fontFamily: "serif",
            transform: "scaleY(-1)",
          }}
        >
          ❧
        </div>

        {/* Decorative corner flourish — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "14px",
            fontSize: "22px",
            color: "rgba(201,168,76,0.25)",
            lineHeight: 1,
            fontFamily: "serif",
            transform: "scale(-1,-1)",
          }}
        >
          ❧
        </div>

        {/* Profile image or monogram crest */}
        <div style={{ marginBottom: "18px" }}>
          {profileImage ? (
            <div
              style={{
                display: "inline-block",
                padding: "4px",
                background: "linear-gradient(135deg, #92702a, #f0d060, #92702a)",
                borderRadius: "50%",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid #1e3a5f",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #92702a, #f0d060, #92702a)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                border: "3px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1e3a5f",
                  fontFamily: "'Georgia', serif",
                  lineHeight: 1,
                }}
              >
                {userName?.charAt(0) || "✦"}
              </span>
            </div>
          )}
        </div>

        {/* Gold top ornamental rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <div style={{ width: "60px", height: "1px", backgroundColor: "rgba(201,168,76,0.5)" }} />
          <span style={{ color: "#c9a84c", fontSize: "14px" }}>✦</span>
          <div style={{ width: "60px", height: "1px", backgroundColor: "rgba(201,168,76,0.5)" }} />
        </div>

        {/* Name */}
        {userName && (
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#f0d060",
              margin: "0 0 6px 0",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "'Georgia', 'Palatino Linotype', serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Gold bottom ornamental rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            margin: "14px 0 16px",
          }}
        >
          <div style={{ width: "80px", height: "1px", backgroundColor: "rgba(201,168,76,0.5)" }} />
          <span style={{ color: "#c9a84c", fontSize: "10px" }}>◆</span>
          <div style={{ width: "80px", height: "1px", backgroundColor: "rgba(201,168,76,0.5)" }} />
        </div>

        {/* Contact info */}
        {contactInfo && (
          <div
            style={{
              fontSize: "11.5px",
              color: "rgba(240,208,96,0.75)",
              letterSpacing: "1.5px",
              lineHeight: "1.8",
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Thin navy + gold border bottom of header */}
      <div style={{ height: "2px", backgroundColor: "#1e3a5f" }} />
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #92702a, #c9a84c, #f0d060, #c9a84c, #92702a)",
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "38px 54px 52px",
          backgroundColor: "#fdfbf4",
        }}
      >
        <div
          style={{ fontSize: "13px", lineHeight: "1.7", color: "#1a1506" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom gold bar */}
      <div
        style={{
          height: "2px",
          backgroundColor: "#1e3a5f",
        }}
      />
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #92702a, #c9a84c, #f0d060, #c9a84c, #92702a)",
        }}
      />

      <style>{`
        h2 {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #1e3a5f !important;
          margin-top: 30px !important;
          margin-bottom: 10px !important;
          padding-bottom: 6px !important;
          border-bottom: 1px solid #c9a84c !important;
          font-family: 'Georgia', 'Palatino Linotype', serif !important;
          text-align: center !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1e3a5f !important;
          margin-top: 14px !important;
          margin-bottom: 1px !important;
          font-family: 'Georgia', 'Palatino Linotype', serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2d2510 !important;
          font-size: 13px !important;
          font-family: 'Georgia', serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a1506 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 5px !important;
          color: #2d2510 !important;
          font-size: 13px !important;
          font-family: 'Georgia', serif !important;
        }
        li::marker {
          color: #c9a84c !important;
        }
        a {
          color: #92702a !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent) !important;
          margin: 12px 0 !important;
        }
        em, i {
          font-style: italic !important;
          color: #5a4a20 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default RoyaleTemplate;