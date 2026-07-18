const AvatarTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
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
      {/* Header — centered avatar focus */}
      <div
        style={{
          backgroundColor: "#0f766e",
          padding: "44px 54px 56px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Decorative concentric rings behind avatar */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Profile image with fallback initial */}
          <div
            style={{
              display: "inline-block",
              padding: "4px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              marginBottom: "20px",
            }}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid rgba(255,255,255,0.85)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "3px solid rgba(255,255,255,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "40px",
                  fontWeight: "700",
                  fontFamily: "'Gill Sans', Calibri, sans-serif",
                }}
              >
                {userName?.charAt(0) || "?"}
              </div>
            )}
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: "#ffffff",
                margin: "0 0 8px 0",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "'Gill Sans', Calibri, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Dot divider */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              margin: "12px 0",
            }}
          >
            <div style={{ width: "30px", height: "1px", backgroundColor: "rgba(255,255,255,0.4)" }} />
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
            <div style={{ width: "30px", height: "1px", backgroundColor: "rgba(255,255,255,0.4)" }} />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "1px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Curved SVG bottom */}
        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", lineHeight: "0" }}>
          <svg
            viewBox="0 0 794 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%" }}
            preserveAspectRatio="none"
          >
            <path d="M0,24 Q397,0 794,24 L794,24 L0,24 Z" fill="#ffffff" />
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
            color: "#1a1a1a",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #0f766e !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          padding-bottom: 6px !important;
          border-bottom: 1.5px solid #0f766e33 !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        h2::before {
          content: '' !important;
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #0f766e !important;
          flex-shrink: 0 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1a1a1a !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #333333 !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
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
          padding-left: 20px !important;
          position: relative !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 2px !important;
          top: 6px !important;
          width: 7px !important;
          height: 7px !important;
          border-radius: 50% !important;
          background-color: #0f766e !important;
          opacity: 0.6 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #0f766e !important;
          text-decoration: none !important;
          border-bottom: 1px solid #0f766e44 !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #0f766e33, transparent) !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default AvatarTemplate;