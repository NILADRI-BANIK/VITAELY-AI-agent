const AtsTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: "12px",
        lineHeight: "1.6",
        color: "#000000",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        padding: "48px 60px",
        boxSizing: "border-box",
      }}
    >
      {/* Header — plain text only, no image */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid #000000",
        }}
      >
        {userName && (
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#000000",
              margin: "0 0 6px 0",
              letterSpacing: "0px",
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              textTransform: "uppercase",
            }}
          >
            {userName}
          </h1>
        )}

        {contactInfo && (
          <div
            style={{
              fontSize: "11px",
              color: "#000000",
              lineHeight: "1.5",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{ fontSize: "12px", lineHeight: "1.6", color: "#000000" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style>{`
        h2 {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0px !important;
          color: #000000 !important;
          margin-top: 20px !important;
          margin-bottom: 6px !important;
          padding-bottom: 4px !important;
          border-bottom: 1px solid #000000 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        h3 {
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #000000 !important;
          margin-top: 10px !important;
          margin-bottom: 2px !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        p {
          margin: 2px 0 6px 0 !important;
          color: #000000 !important;
          font-size: 12px !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #000000 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 8px 0 !important;
        }
        li {
          margin-bottom: 3px !important;
          color: #000000 !important;
          font-size: 12px !important;
        }
        li::marker {
          color: #000000 !important;
        }
        a {
          color: #000000 !important;
          text-decoration: none !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #000000 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
        em, i {
          font-style: italic !important;
          color: #000000 !important;
        }
      `}</style>
    </div>
  );
};

export default AtsTemplate;