const CorporateTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Navy header */}
      <div
        style={{
          backgroundColor: "#1e3a5f",
          padding: "36px 50px 28px",
        }}
      >
        {userName && (
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "#ffffff",
              margin: "0 0 8px 0",
              letterSpacing: "1px",
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              textTransform: "uppercase",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Gold accent line */}
        <div
          style={{
            width: "60px",
            height: "3px",
            backgroundColor: "#c9a84c",
            borderRadius: "2px",
            marginBottom: "10px",
          }}
        />

        {contactInfo && (
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "0.3px",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Gold divider */}
      <div style={{ height: "4px", backgroundColor: "#c9a84c" }} />

      {/* Body — left navy strip for two-column illusion */}
      <div
        style={{
          display: "flex",
          minHeight: "600px",
        }}
      >
        {/* Left accent strip */}
        <div
          style={{
            width: "8px",
            backgroundColor: "#1e3a5f",
            flexShrink: 0,
          }}
        />

        {/* Light sidebar column (decorative) */}
        <div
          style={{
            width: "24px",
            backgroundColor: "#eaf0f7",
            flexShrink: 0,
          }}
        />

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            padding: "32px 44px 44px 32px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{ fontSize: "13px", lineHeight: "1.6", color: "#1a1a1a" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 2.5px !important;
          color: #1e3a5f !important;
          margin-top: 26px !important;
          margin-bottom: 8px !important;
          padding-bottom: 5px !important;
          border-bottom: 2px solid #c9a84c !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1e3a5f !important;
          margin-top: 14px !important;
          margin-bottom: 1px !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        p {
          margin: 3px 0 7px 0 !important;
          color: #2d2d2d !important;
          font-size: 13px !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a1a1a !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #2d2d2d !important;
          font-size: 13px !important;
        }
        li::marker {
          color: #c9a84c !important;
        }
        a {
          color: #1e3a5f !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background-color: #dde3ea !important;
          margin: 10px 0 !important;
        }
        em, i {
          font-style: italic !important;
          color: #555555 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default CorporateTemplate;