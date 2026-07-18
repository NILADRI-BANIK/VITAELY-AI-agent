const FusionTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#1e293b",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header — full width */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "42px 50px 34px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Diagonal split decoration */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "220px",
            height: "100%",
            backgroundColor: "#334155",
            clipPath: "polygon(40px 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#f8fafc",
                margin: "0 0 8px 0",
                letterSpacing: "1.5px",
                fontFamily: "'Segoe UI', Tahoma, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          <div
            style={{
              width: "50px",
              height: "2px",
              backgroundColor: "#94a3b8",
              margin: "12px 0",
            }}
          />

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "#94a3b8",
                letterSpacing: "0.5px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Two-column body */}
      <div
        style={{
          display: "flex",
          minHeight: "600px",
        }}
      >
        {/* Left column — dark minimal style */}
        <div
          style={{
            width: "38%",
            backgroundColor: "#f1f5f9",
            padding: "32px 28px",
            borderRight: "1px solid #e2e8f0",
            boxSizing: "border-box",
          }}
        >
          <div
            className="fusion-left"
            style={{ fontSize: "13px", lineHeight: "1.65", color: "#1e293b" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Right column — light airy style */}
        <div
          style={{
            width: "62%",
            backgroundColor: "#ffffff",
            padding: "32px 36px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="fusion-right"
            style={{ fontSize: "13px", lineHeight: "1.65", color: "#1e293b" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <style>{`
        /* LEFT COLUMN — dark compact industrial style */
        .fusion-left h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #ffffff !important;
          background-color: #334155 !important;
          padding: 5px 10px !important;
          margin-top: 24px !important;
          margin-bottom: 10px !important;
          font-family: 'Segoe UI', Tahoma, sans-serif !important;
        }
        .fusion-left h3 {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #1e293b !important;
          margin-top: 12px !important;
          margin-bottom: 2px !important;
        }
        .fusion-left p {
          margin: 3px 0 6px 0 !important;
          color: #475569 !important;
          font-size: 12px !important;
        }
        .fusion-left strong, .fusion-left b {
          font-weight: 700 !important;
          color: #1e293b !important;
          display: inline !important;
        }
        .fusion-left ul, .fusion-left ol {
          padding-left: 16px !important;
          margin: 4px 0 8px 0 !important;
        }
        .fusion-left li {
          margin-bottom: 4px !important;
          color: #475569 !important;
          font-size: 12px !important;
        }
        .fusion-left li::marker {
          color: #334155 !important;
        }
        .fusion-left hr {
          border: none !important;
          height: 1px !important;
          background: #cbd5e1 !important;
          margin: 10px 0 !important;
        }
        .fusion-left a {
          color: #334155 !important;
          text-decoration: underline !important;
        }

        /* RIGHT COLUMN — light airy editorial style */
        .fusion-right h2 {
          font-size: 11px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #94a3b8 !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          padding-bottom: 8px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          font-family: 'Segoe UI', Tahoma, sans-serif !important;
        }
        .fusion-right h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #0f172a !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
        }
        .fusion-right p {
          margin: 4px 0 8px 0 !important;
          color: #475569 !important;
        }
        .fusion-right strong, .fusion-right b {
          font-weight: 700 !important;
          color: #0f172a !important;
          display: inline !important;
        }
        .fusion-right ul, .fusion-right ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        .fusion-right li {
          margin-bottom: 5px !important;
          color: #475569 !important;
        }
        .fusion-right li::marker {
          color: #94a3b8 !important;
        }
        .fusion-right hr {
          border: none !important;
          height: 1px !important;
          background: #e2e8f0 !important;
          margin: 12px 0 !important;
        }
        .fusion-right a {
          color: #334155 !important;
          text-decoration: underline !important;
        }

        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default FusionTemplate;
