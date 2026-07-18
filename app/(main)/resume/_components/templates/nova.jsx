const NovaTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Verdana', 'Geneva', Tahoma, sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1a1a1a",
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
          backgroundColor: "#ffffff",
          padding: "48px 54px 40px",
          position: "relative",
          overflow: "hidden",
          borderTop: "5px solid #eab308",
        }}
      >
        {/* Starburst decorative top-right */}
        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "40px",
            width: "90px",
            height: "90px",
            opacity: 0.08,
            background:
              "conic-gradient(from 0deg, #eab308 0deg, transparent 20deg, #eab308 40deg, transparent 60deg, #eab308 80deg, transparent 100deg, #eab308 120deg, transparent 140deg, #eab308 160deg, transparent 180deg, #eab308 200deg, transparent 220deg, #eab308 240deg, transparent 260deg, #eab308 280deg, transparent 300deg, #eab308 320deg, transparent 340deg, #eab308 360deg)",
            borderRadius: "50%",
          }}
        />
        {/* Second starburst */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "100px",
            width: "50px",
            height: "50px",
            opacity: 0.05,
            background:
              "conic-gradient(from 15deg, #eab308 0deg, transparent 20deg, #eab308 40deg, transparent 60deg, #eab308 80deg, transparent 100deg, #eab308 120deg, transparent 140deg, #eab308 160deg, transparent 180deg, #eab308 200deg, transparent 220deg, #eab308 240deg, transparent 260deg, #eab308 280deg, transparent 300deg, #eab308 320deg, transparent 340deg, #eab308 360deg)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Star accent above name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span style={{ color: "#eab308", fontSize: "16px", lineHeight: 1 }}>
              ✦
            </span>
            <div
              style={{
                height: "1px",
                width: "40px",
                backgroundColor: "#eab308",
                opacity: 0.4,
              }}
            />
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#1a1a1a",
                margin: "0 0 8px 0",
                letterSpacing: "1px",
                fontFamily: "'Verdana', Geneva, Tahoma, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Starburst row divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              margin: "14px 0",
            }}
          >
            <div
              style={{
                height: "2px",
                width: "60px",
                backgroundColor: "#eab308",
              }}
            />
            <span style={{ color: "#eab308", fontSize: "10px", lineHeight: 1 }}>
              ✦
            </span>
            <div
              style={{
                height: "1px",
                width: "30px",
                backgroundColor: "#eab308",
                opacity: 0.4,
              }}
            />
            <span
              style={{
                color: "#eab308",
                fontSize: "7px",
                lineHeight: 1,
                opacity: 0.4,
              }}
            >
              ✦
            </span>
            <div
              style={{
                height: "1px",
                flex: 1,
                backgroundColor: "#eab308",
                opacity: 0.1,
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "#555555",
                letterSpacing: "1px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "32px 54px 52px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#1a1a1a",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom accent bar */}
      <div style={{ height: "5px", backgroundColor: "#eab308" }} />

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #1a1a1a !important;
          margin-top: 30px !important;
          margin-bottom: 14px !important;
          font-family: 'Verdana', Geneva, Tahoma, sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '✦' !important;
          color: #eab308 !important;
          font-size: 12px !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #eab30855, transparent) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1a1a1a !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Verdana', Geneva, Tahoma, sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #333333 !important;
          font-family: 'Verdana', Geneva, Tahoma, sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a1a1a !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #333333 !important;
          padding-left: 22px !important;
          position: relative !important;
          font-family: 'Verdana', Geneva, Tahoma, sans-serif !important;
        }
        li::before {
          content: '✦' !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #eab308 !important;
          font-size: 8px !important;
          line-height: 2 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #b45309 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #eab30844 !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #eab30833, transparent) !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default NovaTemplate;
