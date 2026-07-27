const StartupTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Verdana', 'Geneva', 'Tahoma', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#0f172a",
        backgroundColor: "#f8fafc",
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
          background: "linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)",
          width: "100%",
        }}
      />

      {/* Header */}
      <div
        style={{
          backgroundColor: "#0f172a",
          padding: "40px 50px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background geometric shapes */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(249,115,22,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "120px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "42%",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(236,72,153,0.06)",
          }}
        />

        {/* Profile + Name row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Profile Image */}
          {profileImage && (
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  padding: "3px",
                  background: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
                  borderRadius: "16px",
                  display: "inline-block",
                }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "13px",
                    objectFit: "cover",
                    display: "block",
                    border: "2px solid #0f172a",
                  }}
                />
              </div>
            </div>
          )}

          {/* Name + contact */}
          <div style={{ flex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#ffffff",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.5px",
                  fontFamily: "'Verdana', 'Geneva', sans-serif",
                  lineHeight: "1.2",
                }}
              >
                {userName}
              </h1>
            )}

            {/* Vibrant tag line divider */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: "#f97316",
                }}
              />
              <div
                style={{
                  width: "16px",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: "#ec4899",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: "#8b5cf6",
                }}
              />
            </div>

            {contactInfo && (
              <div
                style={{
                  fontSize: "11.5px",
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.3px",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>

        {/* No image fallback — centered */}
        {!profileImage && (
          <div
            style={{
              textAlign: "center",
              position: "relative",
              zIndex: 1,
              marginTop: "-10px",
            }}
          >
            {userName && (
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#ffffff",
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.5px",
                }}
              >
                {userName}
              </h1>
            )}
            {contactInfo && (
              <div
                style={{
                  fontSize: "11.5px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vibrant thin stripe */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)",
          opacity: 0.6,
        }}
      />

      {/* Body */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "36px 50px 48px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#0f172a",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom accent */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #8b5cf6, #ec4899, #f97316)",
          width: "100%",
        }}
      />

      <style>{`
        h2 {
          font-size: 12px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #0f172a !important;
          margin-top: 28px !important;
          margin-bottom: 10px !important;
          padding-bottom: 8px !important;
          border-bottom: 2px solid #f97316 !important;
          font-family: 'Verdana', 'Geneva', sans-serif !important;
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
          background: linear-gradient(135deg, #f97316, #ec4899) !important;
          flex-shrink: 0 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Verdana', 'Geneva', sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #334155 !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #0f172a !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #334155 !important;
        }
        li::marker {
          color: #f97316 !important;
        }
        a {
          color: #8b5cf6 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #f97316, #ec4899, #8b5cf6) !important;
          margin: 12px 0 !important;
          opacity: 0.25 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default StartupTemplate;