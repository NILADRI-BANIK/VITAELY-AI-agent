const VelocityTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily:
          "'Impact', 'Arial Narrow', 'Haettenschweiler', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#0f0f0f",
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
          backgroundColor: "#0f0f0f",
          padding: "44px 54px 48px",
          position: "relative",
          overflow: "hidden",
          clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 100%)",
          marginBottom: "-20px",
        }}
      >
        {/* Speed streak lines */}
        {[20, 35, 50, 65, 78].map((top, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${top}%`,
              left: "-10%",
              width: `${40 + i * 10}%`,
              height: "1px",
              background: `rgba(255,165,0,${0.06 + i * 0.02})`,
              transform: "skewY(-8deg)",
            }}
          />
        ))}

        {/* Orange slash accent */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "60px",
            width: "6px",
            height: "100%",
            backgroundColor: "#f97316",
            transform: "skewX(-12deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "76px",
            width: "2px",
            height: "100%",
            backgroundColor: "#f97316",
            opacity: 0.4,
            transform: "skewX(-12deg)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#ffffff",
                margin: "0 0 6px 0",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontFamily: "'Impact', 'Arial Narrow', Arial, sans-serif",
                fontStyle: "italic",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Speed slash divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              margin: "12px 0",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "3px",
                backgroundColor: "#f97316",
                transform: "skewX(-20deg)",
              }}
            />
            <div
              style={{
                width: "16px",
                height: "3px",
                backgroundColor: "#f97316",
                opacity: 0.5,
                transform: "skewX(-20deg)",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "3px",
                backgroundColor: "#f97316",
                opacity: 0.25,
                transform: "skewX(-20deg)",
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "2px",
                fontFamily: "'Arial Narrow', Arial, sans-serif",
                fontStyle: "normal",
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
          padding: "48px 54px 52px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.65",
            color: "#0f0f0f",
            fontFamily: "'Arial Narrow', Arial, sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 12px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #ffffff !important;
          background-color: #0f0f0f !important;
          margin-top: 28px !important;
          margin-bottom: 14px !important;
          padding: 7px 16px 7px 12px !important;
          font-family: 'Impact', 'Arial Narrow', Arial, sans-serif !important;
          font-style: italic !important;
          clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%) !important;
          display: block !important;
          width: fit-content !important;
          min-width: 160px !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          height: 2px !important;
          background: linear-gradient(90deg, #f97316, transparent) !important;
          margin-top: 6px !important;
          transform: skewX(-20deg) !important;
          width: 80% !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0f0f0f !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
          font-style: italic !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2a2a2a !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
          font-style: normal !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #0f0f0f !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #2a2a2a !important;
          padding-left: 20px !important;
          position: relative !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
        }
        li::before {
          content: '/' !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #f97316 !important;
          font-weight: 900 !important;
          font-style: italic !important;
          font-size: 14px !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #0f0f0f !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background: linear-gradient(90deg, #f97316, #0f0f0f22, transparent) !important;
          margin: 14px 0 !important;
          transform: skewX(-10deg) !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default VelocityTemplate;
