const EliteTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Didact Gothic', 'Trebuchet MS', 'Gill Sans', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#e8e8e8",
        backgroundColor: "#1a1a1a",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Top platinum bar */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #1a1a1a 0%, #c8bfa8 30%, #e8e0cc 55%, #c8bfa8 75%, #1a1a1a 100%)",
        }}
      />

      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#222222",
          padding: "36px 44px 28px 44px",
          borderBottom: "1px solid #333333",
          display: "flex",
          alignItems: "center",
          gap: "28px",
        }}
      >
        {/* Profile Image */}
        {profileImage && (
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: "108px",
                height: "108px",
                borderRadius: "4px",
                padding: "3px",
                background: "linear-gradient(135deg, #c8bfa8, #e8e0cc, #a09080, #e8e0cc)",
                boxSizing: "border-box",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "2px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>
        )}

        {/* Name & Contact */}
        <div style={{ flex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "300",
                margin: "0 0 4px 0",
                color: "#f0ece4",
                letterSpacing: "4px",
                textTransform: "uppercase",
                lineHeight: "1.2",
                fontFamily: "'Didact Gothic', 'Trebuchet MS', sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Platinum accent line */}
          <div
            style={{
              height: "1px",
              width: "60px",
              background: "linear-gradient(90deg, #c8bfa8, #e8e0cc)",
              margin: "10px 0",
            }}
          />

          {contactInfo && (
            <div
              style={{
                fontSize: "11px",
                color: "#9a9a9a",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                lineHeight: "2",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Corner decorative element */}
        <div style={{ flexShrink: 0, opacity: 0.3 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
            <div style={{ width: "24px", height: "1px", backgroundColor: "#c8bfa8" }} />
            <div style={{ width: "16px", height: "1px", backgroundColor: "#c8bfa8" }} />
            <div style={{ width: "8px", height: "1px", backgroundColor: "#c8bfa8" }} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "32px 44px 40px 44px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#cccccc",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom platinum bar */}
      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, #1a1a1a 0%, #c8bfa8 50%, #1a1a1a 100%)",
          margin: "0 44px",
        }}
      />
      <div style={{ height: "16px", backgroundColor: "#1a1a1a" }} />

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #c8bfa8 !important;
          border-bottom: none !important;
          padding-bottom: 6px !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Didact Gothic', 'Trebuchet MS', sans-serif !important;
          position: relative !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          height: 1px !important;
          background: linear-gradient(90deg, #c8bfa8, #333333) !important;
          margin-top: 6px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 400 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #e8e8e8 !important;
          font-family: 'Didact Gothic', 'Trebuchet MS', sans-serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #aaaaaa !important;
          font-family: 'Didact Gothic', 'Trebuchet MS', sans-serif !important;
        }
        strong, b {
          font-weight: 600 !important;
          display: inline !important;
          color: #d8d8d8 !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #aaaaaa !important;
          font-family: 'Didact Gothic', 'Trebuchet MS', sans-serif !important;
          list-style-type: none !important;
          padding-left: 12px !important;
          position: relative !important;
        }
        li::before {
          content: '—' !important;
          position: absolute !important;
          left: -4px !important;
          color: #c8bfa8 !important;
          font-size: 10px !important;
        }
        a {
          color: #c8bfa8 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #555 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #333333 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default EliteTemplate;