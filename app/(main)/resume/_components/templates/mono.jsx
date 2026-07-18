const MonoTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, 'Lucida Console', monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#000000",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#000000",
          padding: "40px 50px 32px",
          position: "relative",
        }}
      >
        {/* Top border decoration */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50px",
            right: "50px",
            height: "1px",
            backgroundColor: "#ffffff",
            opacity: 0.3,
          }}
        />

        {userName && (
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#ffffff",
              margin: "0 0 8px 0",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Typewriter cursor line */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#ffffff",
            opacity: 0.2,
            margin: "12px 0",
          }}
        />

        {contactInfo && (
          <div
            style={{
              fontSize: "11px",
              color: "#cccccc",
              letterSpacing: "2px",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            {contactInfo}
          </div>
        )}

        {/* Bottom border decoration */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50px",
            right: "50px",
            height: "1px",
            backgroundColor: "#ffffff",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Thick separator */}
      <div
        style={{
          height: "4px",
          backgroundColor: "#000000",
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "36px 50px 48px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
            color: "#000000",
            fontFamily: "'Courier New', Courier, monospace",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #000000 !important;
          margin-top: 28px !important;
          margin-bottom: 10px !important;
          padding-bottom: 6px !important;
          border-bottom: 2px solid #000000 !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #000000 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Courier New', Courier, monospace !important;
          letter-spacing: 1px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #000000 !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #000000 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 20px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #000000 !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        li::marker {
          color: #000000 !important;
        }
        a {
          color: #000000 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: #000000 !important;
          margin: 14px 0 !important;
          opacity: 0.2 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default MonoTemplate;