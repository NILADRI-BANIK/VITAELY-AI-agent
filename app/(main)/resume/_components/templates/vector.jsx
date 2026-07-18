const VectorTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily:
          "'Century Gothic', 'Futura', 'Trebuchet MS', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#1a1a2e",
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
          backgroundColor: "#1a1a2e",
          padding: "46px 54px 42px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Geometric triangle top-right */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "0",
            height: "0",
            borderStyle: "solid",
            borderWidth: "0 120px 120px 0",
            borderColor: "transparent #6366f1 transparent transparent",
            opacity: 0.3,
          }}
        />
        {/* Smaller triangle layered */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "0",
            height: "0",
            borderStyle: "solid",
            borderWidth: "0 70px 70px 0",
            borderColor: "transparent #6366f1 transparent transparent",
            opacity: 0.5,
          }}
        />

        {/* Bottom-left geometric square */}
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "40px",
            width: "60px",
            height: "60px",
            backgroundColor: "#6366f1",
            opacity: 0.08,
            transform: "rotate(30deg)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 8px 0",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "'Century Gothic', 'Futura', Arial, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Angular geometric divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              margin: "14px 0",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "2px",
                backgroundColor: "#6366f1",
              }}
            />
            <div
              style={{
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: "5px 0 5px 8px",
                borderColor: "transparent transparent transparent #6366f1",
              }}
            />
            <div
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "#6366f1",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: "3px 0 3px 5px",
                borderColor: "transparent transparent transparent #6366f1",
                opacity: 0.4,
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "1.5px",
                fontFamily: "'Century Gothic', Arial, sans-serif",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Angular SVG divider */}
      <div style={{ lineHeight: "0", backgroundColor: "#ffffff" }}>
        <svg
          viewBox="0 0 794 20"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%" }}
          preserveAspectRatio="none"
        >
          <polygon points="0,0 794,0 794,20 0,0" fill="#1a1a2e" />
          <polygon points="0,0 260,20 0,20" fill="#6366f1" opacity="0.15" />
        </svg>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "34px 54px 52px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.65",
            color: "#1a1a2e",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #1a1a2e !important;
          margin-top: 28px !important;
          margin-bottom: 14px !important;
          padding: 0 0 0 14px !important;
          border-left: 3px solid #6366f1 !important;
          font-family: 'Century Gothic', 'Futura', Arial, sans-serif !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::after {
          content: '' !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #6366f133, transparent) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1a1a2e !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Century Gothic', Arial, sans-serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2d2d4a !important;
          font-family: 'Century Gothic', Arial, sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a1a2e !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #2d2d4a !important;
          padding-left: 18px !important;
          position: relative !important;
          font-family: 'Century Gothic', Arial, sans-serif !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 0 !important;
          top: 6px !important;
          width: 0 !important;
          height: 0 !important;
          border-style: solid !important;
          border-width: 4px 0 4px 7px !important;
          border-color: transparent transparent transparent #6366f1 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #6366f1 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #6366f144 !important;
        }
        hr {
          border: none !important;
          height: 0 !important;
          border-top: 1px solid #1a1a2e11 !important;
          margin: 14px 0 !important;
          position: relative !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default VectorTemplate;
