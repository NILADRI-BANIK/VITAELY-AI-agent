const MatrixTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Courier New', 'Lucida Console', 'Consolas', monospace",
        fontSize: "12.5px",
        lineHeight: "1.65",
        color: "#d4d4d4",
        backgroundColor: "#0d1117",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top green scan line */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #00ff41, #00cc33, #004d14)",
        }}
      />

      {/* Header */}
      <div
        style={{
          backgroundColor: "#0d1117",
          padding: "36px 50px 28px",
          borderBottom: "1px solid #00ff4133",
        }}
      >
        {/* Prompt prefix line */}
        <div
          style={{
            fontSize: "11px",
            color: "#00ff41",
            letterSpacing: "1px",
            marginBottom: "6px",
            opacity: 0.7,
          }}
        >
          {`// resume.init() — loading profile...`}
        </div>

        {/* Name styled as a code variable */}
        {userName && (
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#569cd6",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "1px",
              }}
            >
              const
            </span>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "#00ff41",
                margin: "0",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "'Courier New', monospace",
                textShadow: "0 0 12px rgba(0,255,65,0.4)",
                lineHeight: "1.2",
              }}
            >
              {userName}
            </h1>
            <span
              style={{
                fontSize: "12px",
                color: "#d4d4d4",
                fontFamily: "'Courier New', monospace",
                opacity: 0.5,
              }}
            >
              = {"{}"}
            </span>
          </div>
        )}

        {/* Green underline */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(90deg, #00ff41, transparent)",
            margin: "12px 0 10px",
            opacity: 0.4,
          }}
        />

        {/* Contact info styled as a comment */}
        {contactInfo && (
          <div
            style={{
              fontSize: "11.5px",
              color: "#6a9955",
              letterSpacing: "0.5px",
              lineHeight: "1.6",
            }}
          >
            <span style={{ opacity: 0.7 }}>{`/* `}</span>
            {contactInfo}
            <span style={{ opacity: 0.7 }}>{` */`}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "30px 50px 48px",
          backgroundColor: "#0d1117",
        }}
      >
        <div
          style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#d4d4d4" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom bar */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #004d14, #00cc33, #00ff41)",
        }}
      />

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #569cd6 !important;
          margin-top: 26px !important;
          margin-bottom: 10px !important;
          padding: 4px 10px !important;
          background-color: #161b22 !important;
          border-left: 3px solid #00ff41 !important;
          border-bottom: none !important;
          font-family: 'Courier New', monospace !important;
        }
        h3 {
          font-size: 12.5px !important;
          font-weight: 700 !important;
          color: #dcdcaa !important;
          margin-top: 14px !important;
          margin-bottom: 1px !important;
          font-family: 'Courier New', monospace !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 3px 0 7px 0 !important;
          color: #d4d4d4 !important;
          font-size: 12.5px !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #00ff41 !important;
          display: inline !important;
          text-shadow: 0 0 6px rgba(0,255,65,0.3) !important;
        }
        ul, ol {
          padding-left: 20px !important;
          margin: 4px 0 10px 0 !important;
          list-style-type: none !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #d4d4d4 !important;
          font-size: 12.5px !important;
          position: relative !important;
          padding-left: 16px !important;
        }
        li::before {
          content: '>' !important;
          position: absolute !important;
          left: 0 !important;
          color: #00ff41 !important;
          font-weight: 700 !important;
        }
        a {
          color: #569cd6 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #00ff41, transparent) !important;
          margin: 12px 0 !important;
          opacity: 0.3 !important;
        }
        em, i {
          font-style: italic !important;
          color: #6a9955 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
        code {
          background-color: #161b22 !important;
          color: #00ff41 !important;
          padding: 1px 5px !important;
          border-radius: 3px !important;
          font-family: 'Courier New', monospace !important;
        }
      `}</style>
    </div>
  );
};

export default MatrixTemplate;