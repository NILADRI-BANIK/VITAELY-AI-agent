const OrbitTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Trebuchet MS', 'Segoe UI', Tahoma, Geneva, sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1e1b4b",
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
          backgroundColor: "#1e1b4b",
          padding: "48px 54px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbital rings */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "30%",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 10px 0",
                letterSpacing: "2px",
                fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Orbital dot divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              margin: "14px 0",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === 2 ? "10px" : i === 1 || i === 3 ? "7px" : "5px",
                  height: i === 2 ? "10px" : i === 1 || i === 3 ? "7px" : "5px",
                  borderRadius: "50%",
                  backgroundColor: `rgba(255,255,255,${i === 2 ? 0.9 : i === 1 || i === 3 ? 0.5 : 0.25})`,
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "1px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Curved bottom SVG */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            lineHeight: "0",
          }}
        >
          <svg
            viewBox="0 0 794 28"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%" }}
            preserveAspectRatio="none"
          >
            <path d="M0,28 Q397,0 794,28 L794,28 L0,28 Z" fill="#ffffff" />
          </svg>
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
            color: "#1e1b4b",
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
          color: #1e1b4b !important;
          margin-top: 30px !important;
          margin-bottom: 14px !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
        }
        h2::before {
          content: '' !important;
          display: inline-block !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          background-color: #1e1b4b !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #1e1b4b44, transparent) !important;
          border-radius: 1px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1e1b4b !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #374151 !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1e1b4b !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #374151 !important;
          padding-left: 22px !important;
          position: relative !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 4px !important;
          top: 6px !important;
          width: 7px !important;
          height: 7px !important;
          border-radius: 50% !important;
          border: 1.5px solid #1e1b4b !important;
          background: transparent !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #1e1b4b !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #1e1b4b22, transparent) !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default OrbitTemplate;
