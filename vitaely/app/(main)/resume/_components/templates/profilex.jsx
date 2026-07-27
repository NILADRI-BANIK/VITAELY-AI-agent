const ProfilexTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        minHeight: "1000px",
      }}
    >
      {/* ── LEFT SIDEBAR ── */}
      <div
        style={{
          width: "260px",
          flexShrink: 0,
          backgroundColor: "#1b2a4a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 0 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Profile image or fallback */}
        <div
          style={{
            padding: "4px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4f9cf9, #a78bfa)",
            marginBottom: "18px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                display: "block",
                border: "3px solid #1b2a4a",
              }}
            />
          ) : (
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                backgroundColor: "#2d3f63",
                border: "3px solid #1b2a4a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "38px",
                fontWeight: "700",
              }}
            >
              {userName?.charAt(0) || "?"}
            </div>
          )}
        </div>

        {/* Name */}
        {userName && (
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#ffffff",
              textAlign: "center",
              letterSpacing: "0.5px",
              padding: "0 20px",
              marginBottom: "6px",
              lineHeight: "1.3",
            }}
          >
            {userName}
          </div>
        )}

        {/* Thin divider */}
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "linear-gradient(90deg, #4f9cf9, #a78bfa)",
            borderRadius: "2px",
            margin: "10px 0 18px",
          }}
        />

        {/* Contact info block */}
        {contactInfo && (
          <div
            style={{
              width: "100%",
              padding: "0 22px",
              boxSizing: "border-box",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "3px",
                color: "#4f9cf9",
                marginBottom: "10px",
              }}
            >
              Contact
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.72)",
                lineHeight: "1.8",
                wordBreak: "break-word",
              }}
            >
              {contactInfo}
            </div>
          </div>
        )}

        {/* Sidebar rendered content (skills, languages etc injected via CSS targeting) */}
        <div
          style={{
            width: "100%",
            padding: "0 22px",
            boxSizing: "border-box",
            marginTop: "10px",
          }}
          className="profilex-sidebar-content"
        />
      </div>

      {/* ── RIGHT MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          padding: "40px 38px 48px",
          boxSizing: "border-box",
          borderLeft: "4px solid #4f9cf9",
        }}
      >
        <div
          style={{ fontSize: "13px", lineHeight: "1.65", color: "#1a1a1a" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #1b2a4a !important;
          margin-top: 26px !important;
          margin-bottom: 10px !important;
          padding: 5px 10px !important;
          background-color: #eef3fb !important;
          border-left: 3px solid #4f9cf9 !important;
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1b2a4a !important;
          margin-top: 14px !important;
          margin-bottom: 1px !important;
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
        }
        p {
          margin: 3px 0 7px 0 !important;
          color: #374151 !important;
          font-size: 13px !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1b2a4a !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #374151 !important;
          font-size: 13px !important;
        }
        li::marker {
          color: #4f9cf9 !important;
        }
        a {
          color: #4f9cf9 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background-color: #e5e7eb !important;
          margin: 10px 0 !important;
        }
        em, i {
          font-style: italic !important;
          color: #6b7280 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ProfilexTemplate;