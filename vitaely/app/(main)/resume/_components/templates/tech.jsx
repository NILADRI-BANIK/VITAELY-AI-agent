const TechTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#e2e8f0",
        backgroundColor: "#0f172a",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Terminal Header */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "16px 30px",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Terminal dots */}
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#ef4444",
          }}
        />
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#f59e0b",
          }}
        />
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
          }}
        />
        <span
          style={{
            marginLeft: "10px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          resume.md — bash
        </span>
      </div>

      {/* Profile Section */}
      <div
        style={{
          padding: "30px 40px 20px 40px",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {profileImage && (
            <div>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #059669",
                  display: "block",
                }}
              />
            </div>
          )}

          <div style={{ flex: 1 }}>
            {/* Green prompt */}
            <div
              style={{
                fontSize: "12px",
                color: "#059669",
                marginBottom: "4px",
                fontFamily: "Courier New, monospace",
              }}
            >
              $ whoami
            </div>

            {userName && (
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  margin: "0 0 6px 0",
                  color: "#059669",
                  fontFamily: "Courier New, monospace",
                  letterSpacing: "1px",
                }}
              >
                {userName}
              </h1>
            )}

            {contactInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  lineHeight: "1.8",
                  fontFamily: "Courier New, monospace",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "20px 40px 40px 40px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#e2e8f0",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 13px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #059669 !important;
          font-family: Courier New, monospace !important;
          margin-top: 22px !important;
          margin-bottom: 8px !important;
          padding-left: 0 !important;
        }
        h2::before {
          content: "## " !important;
          color: #334155 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          margin-top: 12px !important;
          margin-bottom: 2px !important;
          color: #7dd3fc !important;
          font-family: Courier New, monospace !important;
        }
        h3::before {
          content: "→ " !important;
          color: #334155 !important;
        }
        p {
          margin: 3px 0 6px 0 !important;
          color: #cbd5e1 !important;
          font-family: Courier New, monospace !important;
        }
        strong, b {
          font-weight: bold !important;
          display: inline !important;
          color: #f8fafc !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 8px 0 !important;
        }
        li {
          margin-bottom: 2px !important;
          color: #cbd5e1 !important;
          font-family: Courier New, monospace !important;
          list-style-type: none !important;
          padding-left: 12px !important;
          position: relative !important;
        }
        li::before {
          content: ">" !important;
          position: absolute !important;
          left: 0 !important;
          color: #059669 !important;
        }
        a {
          color: #7dd3fc !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #1e293b !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default TechTemplate;