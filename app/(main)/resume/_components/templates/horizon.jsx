const HorizonTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Optima', 'Candara', 'Segoe UI', Tahoma, sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1a2433",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top horizon rule stack */}
      <div style={{ width: "100%" }}>
        <div style={{ height: "6px", backgroundColor: "#0369a1" }} />
        <div
          style={{ height: "3px", backgroundColor: "#0284c7", opacity: 0.6 }}
        />
        <div
          style={{ height: "1.5px", backgroundColor: "#38bdf8", opacity: 0.4 }}
        />
        <div
          style={{ height: "1px", backgroundColor: "#bae6fd", opacity: 0.5 }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "44px 60px 36px",
          position: "relative",
        }}
      >
        {userName && (
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "300",
              color: "#0369a1",
              margin: "0 0 6px 0",
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontFamily: "'Optima', 'Candara', Tahoma, sans-serif",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Wide landscape ruled divider */}
        <div style={{ margin: "18px 0 14px" }}>
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#0369a1",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#0369a1",
              opacity: 0.25,
              marginTop: "4px",
            }}
          />
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#0369a1",
              opacity: 0.1,
              marginTop: "4px",
            }}
          />
        </div>

        {contactInfo && (
          <div
            style={{
              fontSize: "11.5px",
              color: "#64748b",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {contactInfo}
          </div>
        )}

        {/* Bottom horizon rule stack */}
        <div style={{ marginTop: "28px" }}>
          <div
            style={{ height: "1px", backgroundColor: "#bae6fd", opacity: 0.6 }}
          />
          <div
            style={{
              height: "1.5px",
              backgroundColor: "#38bdf8",
              opacity: 0.4,
              marginTop: "4px",
            }}
          />
          <div
            style={{
              height: "3px",
              backgroundColor: "#0284c7",
              opacity: 0.5,
              marginTop: "4px",
            }}
          />
          <div
            style={{
              height: "5px",
              backgroundColor: "#0369a1",
              marginTop: "4px",
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "36px 60px 56px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#1a2433",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom horizon rule stack */}
      <div style={{ width: "100%" }}>
        <div
          style={{ height: "1px", backgroundColor: "#bae6fd", opacity: 0.5 }}
        />
        <div
          style={{ height: "1.5px", backgroundColor: "#38bdf8", opacity: 0.4 }}
        />
        <div
          style={{ height: "3px", backgroundColor: "#0284c7", opacity: 0.6 }}
        />
        <div style={{ height: "6px", backgroundColor: "#0369a1" }} />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 5px !important;
          color: #0369a1 !important;
          margin-top: 32px !important;
          margin-bottom: 6px !important;
          font-family: 'Optima', 'Candara', Tahoma, sans-serif !important;
        }
        h2 + * {
          margin-top: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          width: 100% !important;
          height: 1px !important;
          background-color: #0369a1 !important;
          opacity: 0.7 !important;
          margin-top: 6px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1a2433 !important;
          margin-top: 16px !important;
          margin-bottom: 2px !important;
          font-family: 'Optima', 'Candara', Tahoma, sans-serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #334155 !important;
          font-family: 'Optima', 'Candara', Tahoma, sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a2433 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #334155 !important;
          padding-left: 18px !important;
          position: relative !important;
          font-family: 'Optima', 'Candara', Tahoma, sans-serif !important;
          border-bottom: 1px solid #e0f2fe !important;
          padding-bottom: 5px !important;
        }
        li::before {
          content: '—' !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #0369a1 !important;
          font-size: 11px !important;
          line-height: 1.8 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #0369a1 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #bae6fd !important;
        }
        hr {
          border: none !important;
          margin: 16px 0 !important;
          border-top: 1px solid #0369a133 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default HorizonTemplate;
