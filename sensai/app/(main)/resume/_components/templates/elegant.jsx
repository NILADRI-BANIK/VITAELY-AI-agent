const ElegantTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#2d1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        padding: "50px 60px",
      }}
    >
      {/* Elegant Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "24px",
          borderBottom: "1px solid #9f1239",
          paddingBottom: "20px",
        }}
      >
        {profileImage && (
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #9f1239",
                display: "inline-block",
              }}
            />
          </div>
        )}

        {userName && (
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "normal",
              textAlign: "center",
              margin: "0 0 6px 0",
              color: "#9f1239",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "Georgia, serif",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Decorative line under name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            margin: "8px 0",
          }}
        >
          <div
            style={{
              height: "1px",
              width: "60px",
              backgroundColor: "#9f1239",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#9f1239",
            }}
          />
          <div
            style={{
              height: "1px",
              width: "60px",
              backgroundColor: "#9f1239",
            }}
          />
        </div>

        {contactInfo && (
          <div
            style={{
              fontSize: "12px",
              color: "#6b4c4c",
              letterSpacing: "0.5px",
              marginTop: "8px",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        style={{
          fontSize: "13px",
          lineHeight: "1.7",
          color: "#2d1a1a",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 14px !important;
          font-weight: normal !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #9f1239 !important;
          text-align: center !important;
          margin-top: 22px !important;
          margin-bottom: 10px !important;
          font-family: Georgia, serif !important;
          position: relative !important;
        }
        h2::after {
          content: "" !important;
          display: block !important;
          width: 40px !important;
          height: 1px !important;
          background-color: #9f1239 !important;
          margin: 4px auto 0 auto !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          font-style: italic !important;
          margin-top: 12px !important;
          margin-bottom: 2px !important;
          color: #2d1a1a !important;
          font-family: Georgia, serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2d1a1a !important;
          font-family: Georgia, serif !important;
          text-align: justify !important;
        }
        strong, b {
          font-weight: bold !important;
          display: inline !important;
          color: #2d1a1a !important;
        }
        ul, ol {
          padding-left: 20px !important;
          margin: 4px 0 8px 0 !important;
        }
        li {
          margin-bottom: 3px !important;
          color: #2d1a1a !important;
          font-family: Georgia, serif !important;
        }
        a {
          color: #9f1239 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #f9a8b4 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ElegantTemplate;