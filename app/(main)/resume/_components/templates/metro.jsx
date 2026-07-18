const MetroTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', 'Segoe UI Light', Tahoma, Geneva, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#1a1a1a",
        backgroundColor: "#f2f2f2",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header tile — large Metro hero block */}
      <div
        style={{
          backgroundColor: "#0284c7",
          padding: "48px 54px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Metro tile accent blocks */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "120px",
            height: "120px",
            backgroundColor: "#0369a1",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "120px",
            width: "60px",
            height: "60px",
            backgroundColor: "#38bdf8",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "60px",
            height: "60px",
            backgroundColor: "#075985",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "180px",
            height: "8px",
            backgroundColor: "#38bdf8",
            opacity: 0.3,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "34px",
                fontWeight: "100",
                color: "#ffffff",
                margin: "0 0 6px 0",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "'Segoe UI Light', 'Segoe UI', Tahoma, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Metro tile divider */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              margin: "16px 0 14px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "4px",
                backgroundColor: "#ffffff",
              }}
            />
            <div
              style={{
                width: "16px",
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.4)",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "1px",
                fontFamily: "'Segoe UI', Tahoma, sans-serif",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Metro tile strip */}
      <div style={{ display: "flex", height: "10px" }}>
        <div style={{ flex: 3, backgroundColor: "#0284c7" }} />
        <div style={{ flex: 2, backgroundColor: "#0369a1" }} />
        <div style={{ flex: 1, backgroundColor: "#075985" }} />
        <div style={{ flex: 1, backgroundColor: "#38bdf8", opacity: 0.6 }} />
      </div>

      {/* Body */}
      <div
        style={{
          padding: "36px 54px 52px",
          backgroundColor: "#f2f2f2",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.65",
            color: "#1a1a1a",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 300 !important;
          text-transform: uppercase !important;
          letter-spacing: 5px !important;
          color: #ffffff !important;
          background-color: #0284c7 !important;
          margin-top: 28px !important;
          margin-bottom: 14px !important;
          padding: 8px 14px !important;
          font-family: 'Segoe UI Light', 'Segoe UI', Tahoma, sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::after {
          content: '' !important;
          display: inline-block !important;
          width: 6px !important;
          height: 6px !important;
          background-color: rgba(255,255,255,0.5) !important;
          flex-shrink: 0 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1a1a1a !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Segoe UI', Tahoma, sans-serif !important;
          letter-spacing: 0.3px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #333333 !important;
          font-family: 'Segoe UI', Tahoma, sans-serif !important;
        }
        strong, b {
          font-weight: 600 !important;
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
          padding-left: 18px !important;
          position: relative !important;
          font-family: 'Segoe UI', Tahoma, sans-serif !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 0 !important;
          top: 5px !important;
          width: 8px !important;
          height: 8px !important;
          background-color: #0284c7 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #0284c7 !important;
          text-decoration: none !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background-color: #e0e0e0 !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default MetroTemplate;
