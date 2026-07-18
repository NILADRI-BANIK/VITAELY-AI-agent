const VisionTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)",
        }}
      />

      {/* Header — name left, image top-right */}
      <div
        style={{
          padding: "36px 48px 28px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Left — name + divider + contact */}
        <div style={{ flex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "34px",
                fontWeight: "800",
                color: "#0c1a2e",
                margin: "0 0 6px 0",
                letterSpacing: "-0.5px",
                lineHeight: "1.1",
                fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                textTransform: "uppercase",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Blue accent line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "12px 0 14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "4px",
                backgroundColor: "#0ea5e9",
                borderRadius: "2px",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "4px",
                backgroundColor: "#bae6fd",
                borderRadius: "2px",
              }}
            />
          </div>

          {/* Contact info */}
          {contactInfo && (
            <div
              style={{
                fontSize: "12px",
                color: "#4b5563",
                lineHeight: "1.8",
                letterSpacing: "0.2px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Right — profile image top-right */}
        <div style={{ flexShrink: 0 }}>
          {profileImage ? (
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(14,165,233,0.25)",
                border: "3px solid #e0f2fe",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "12px",
                backgroundColor: "#e0f2fe",
                border: "3px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0ea5e9",
                fontSize: "38px",
                fontWeight: "800",
                fontFamily: "'Segoe UI', Arial, sans-serif",
              }}
            >
              {userName?.charAt(0) || "?"}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "32px 48px 48px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{ fontSize: "13px", lineHeight: "1.65", color: "#1a1a1a" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)",
        }}
      />

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #0ea5e9 !important;
          margin-top: 28px !important;
          margin-bottom: 10px !important;
          padding-bottom: 6px !important;
          border-bottom: 2px solid #e0f2fe !important;
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0c1a2e !important;
          margin-top: 14px !important;
          margin-bottom: 1px !important;
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
        }
        p {
          margin: 3px 0 7px 0 !important;
          color: #374151 !important;
          font-size: 13px !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #0c1a2e !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #374151 !important;
          font-size: 13px !important;
        }
        li::marker {
          color: #0ea5e9 !important;
        }
        a {
          color: #0ea5e9 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background-color: #e5e7eb !important;
          margin: 10px 0 !important;
        }
        em, i {
          font-style: italic !important;
          color: #6b7280 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default VisionTemplate;