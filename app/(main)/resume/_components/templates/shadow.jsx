const ShadowTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#d4d4d4",
        backgroundColor: "#1c1917",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#141412",
          padding: "50px 54px 40px",
          borderBottom: "1px solid #2e2e2a",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          position: "relative",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: "4px",
            backgroundColor: "#3a3a36",
            boxShadow: "2px 0 12px rgba(0,0,0,0.5)",
          }}
        />

        {userName && (
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#f0ece4",
              margin: "0 0 10px 0",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "'Palatino Linotype', Palatino, serif",
              textShadow: "0 4px 16px rgba(0,0,0,0.7)",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Divider */}
        <div
          style={{
            width: "60px",
            height: "1px",
            backgroundColor: "#4a4a44",
            margin: "14px 0",
            boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        />

        {contactInfo && (
          <div
            style={{
              fontSize: "11.5px",
              color: "#8a8a80",
              letterSpacing: "1px",
              fontFamily: "'Palatino Linotype', Palatino, serif",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "40px 54px 56px",
          backgroundColor: "#1c1917",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#d4d4d4",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #a0a098 !important;
          margin-top: 32px !important;
          margin-bottom: 12px !important;
          padding-bottom: 8px !important;
          border-bottom: 1px solid #2e2e2a !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #e8e4dc !important;
          margin-top: 16px !important;
          margin-bottom: 2px !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
          text-shadow: 0 1px 6px rgba(0,0,0,0.4) !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #b8b8b0 !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #e8e4dc !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 20px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 5px !important;
          color: #b8b8b0 !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
        }
        li::marker {
          color: #4a4a44 !important;
        }
        a {
          color: #a0a098 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: #2e2e2a !important;
          margin: 16px 0 !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ShadowTemplate;
