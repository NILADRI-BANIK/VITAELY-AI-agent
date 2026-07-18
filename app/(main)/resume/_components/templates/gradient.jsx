const GradientTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Trebuchet MS', 'Segoe UI', Tahoma, Geneva, sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1e1e2e",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Gradient Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f64f59 50%, #c471ed 75%, #12c2e9 100%)",
          padding: "48px 50px 36px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blurred circles */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "60px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "40%",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        {/* Profile image + name side by side */}
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
          {profileImage && (
            <div
              style={{
                flexShrink: 0,
                padding: "3px",
                background: "rgba(255,255,255,0.4)",
                borderRadius: "50%",
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
                  border: "3px solid rgba(255,255,255,0.8)",
                }}
              />
            </div>
          )}

          {/* Name + contact */}
          <div style={{ flex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "0 0 6px 0",
                  letterSpacing: "1px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
                }}
              >
                {userName}
              </h1>
            )}

            {/* White divider */}
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
                  color: "rgba(255,255,255,0.88)",
                  letterSpacing: "0.5px",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>

        {/* Centered layout when no image */}
        {!profileImage && (
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "0 0 10px 0",
                  letterSpacing: "1px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {userName}
              </h1>
            )}
            {contactInfo && (
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gradient wave divider */}
      <div
        style={{
          height: "8px",
          background: "linear-gradient(90deg, #667eea, #f64f59, #12c2e9, #764ba2)",
          opacity: 0.4,
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "36px 50px 48px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{ fontSize: "13px", lineHeight: "1.7", color: "#1e1e2e" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 14px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #764ba2 !important;
          margin-top: 26px !important;
          margin-bottom: 10px !important;
          padding-bottom: 6px !important;
          border-bottom: 2px solid transparent !important;
          border-image: linear-gradient(90deg, #667eea, #f64f59, #12c2e9) 1 !important;
          font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1e1e2e !important;
          margin-top: 12px !important;
          margin-bottom: 2px !important;
          font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2d2d3e !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1e1e2e !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #2d2d3e !important;
        }
        li::marker {
          color: #f64f59 !important;
        }
        a {
          color: #667eea !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background: linear-gradient(90deg, #667eea, #f64f59, #12c2e9) !important;
          margin: 12px 0 !important;
          opacity: 0.3 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default GradientTemplate;