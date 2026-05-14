const TimelineTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.7",
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
          background: "linear-gradient(135deg, #0f766e 0%, #134e4a 60%, #0d3d39 100%)",
          padding: "44px 50px 36px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "20%",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        {profileImage ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Profile Image */}
            <div
              style={{
                flexShrink: 0,
                padding: "4px",
                background: "rgba(255,255,255,0.25)",
                borderRadius: "50%",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid rgba(255,255,255,0.7)",
                }}
              />
            </div>

            {/* Name + contact */}
            <div style={{ flex: 1 }}>
              {userName && (
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#ffffff",
                    margin: "0 0 6px 0",
                    letterSpacing: "1px",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {userName}
                </h1>
              )}
              <div
                style={{
                  width: "50px",
                  height: "3px",
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "2px",
                  marginBottom: "10px",
                }}
              />
              {contactInfo && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "0.4px",
                  }}
                >
                  {contactInfo}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "0 0 10px 0",
                  letterSpacing: "1px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  fontFamily: "'Georgia', serif",
                }}
              >
                {userName}
              </h1>
            )}
            <div
              style={{
                width: "50px",
                height: "3px",
                background: "rgba(255,255,255,0.7)",
                margin: "0 auto 10px",
                borderRadius: "2px",
              }}
            />
            {contactInfo && (
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teal accent bar */}
      <div
        style={{
          height: "6px",
          background: "linear-gradient(90deg, #0f766e, #14b8a6, #0f766e)",
        }}
      />

      {/* Body with timeline left border */}
      <div
        style={{
          padding: "36px 50px 48px 70px",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        {/* Vertical timeline line */}
        <div
          style={{
            position: "absolute",
            top: "36px",
            bottom: "48px",
            left: "44px",
            width: "2px",
            background: "linear-gradient(180deg, #0f766e 0%, #ccfbf1 100%)",
            borderRadius: "2px",
          }}
        />

        <div
          style={{ fontSize: "13px", lineHeight: "1.7", color: "#1a1a2e" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 14px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #0f766e !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          padding-bottom: 6px !important;
          border-bottom: 2px solid #ccfbf1 !important;
          font-family: 'Georgia', serif !important;
          position: relative !important;
        }
        h2::before {
          content: '' !important;
          position: absolute !important;
          left: -34px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: #0f766e !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 0 2px #0f766e !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #134e4a !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Georgia', serif !important;
          position: relative !important;
        }
        h3::before {
          content: '' !important;
          position: absolute !important;
          left: -30px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #14b8a6 !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 0 1px #14b8a6 !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #374151 !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a1a2e !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #374151 !important;
        }
        li::marker {
          color: #0f766e !important;
        }
        a {
          color: #0f766e !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background: linear-gradient(90deg, #0f766e, #ccfbf1) !important;
          margin: 12px 0 !important;
          opacity: 0.4 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default TimelineTemplate;