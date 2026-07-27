const ZenTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.9",
        color: "#2c2c2c",
        backgroundColor: "#fafaf9",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header — vast whitespace, centered, calm */}
      <div
        style={{
          padding: "72px 80px 60px",
          textAlign: "center",
          backgroundColor: "#fafaf9",
        }}
      >
        {/* Top hairline */}
        <div
          style={{
            width: "40px",
            height: "0.5px",
            backgroundColor: "#a0a0a0",
            margin: "0 auto 36px auto",
          }}
        />

        {userName && (
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "400",
              color: "#1a1a1a",
              margin: "0 0 16px 0",
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontFamily: "'Georgia', serif",
            }}
          >
            {userName}
          </h1>
        )}

        {contactInfo && (
          <div
            style={{
              fontSize: "11px",
              color: "#909090",
              letterSpacing: "2px",
              fontFamily: "'Georgia', serif",
              marginTop: "10px",
            }}
          >
            {contactInfo}
          </div>
        )}

        {/* Bottom hairline */}
        <div
          style={{
            width: "40px",
            height: "0.5px",
            backgroundColor: "#a0a0a0",
            margin: "36px auto 0 auto",
          }}
        />
      </div>

      {/* Body */}
      <div
        style={{
          padding: "16px 80px 80px",
          backgroundColor: "#fafaf9",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.9",
            color: "#2c2c2c",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 5px !important;
          color: #909090 !important;
          margin-top: 40px !important;
          margin-bottom: 16px !important;
          padding-bottom: 12px !important;
          border-bottom: 0.5px solid #d0d0d0 !important;
          font-family: 'Georgia', serif !important;
          text-align: left !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 400 !important;
          color: #1a1a1a !important;
          margin-top: 20px !important;
          margin-bottom: 2px !important;
          font-family: 'Georgia', serif !important;
          font-style: italic !important;
        }
        p {
          margin: 4px 0 10px 0 !important;
          color: #3a3a3a !important;
          font-family: 'Georgia', serif !important;
        }
        strong, b {
          font-weight: 600 !important;
          color: #1a1a1a !important;
          display: inline !important;
          font-style: normal !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 12px 0 !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #3a3a3a !important;
          font-family: 'Georgia', serif !important;
        }
        li::marker {
          color: #c0c0c0 !important;
        }
        a {
          color: #2c2c2c !important;
          text-decoration: none !important;
          border-bottom: 0.5px solid #c0c0c0 !important;
        }
        hr {
          border: none !important;
          height: 0.5px !important;
          background: #d8d8d8 !important;
          margin: 20px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ZenTemplate;
