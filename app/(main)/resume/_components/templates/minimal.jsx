const MinimalTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#333333",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        padding: "50px 60px",
      }}
    >
      {/* Minimal Header */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        {profileImage && (
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #e5e5e5",
                display: "inline-block",
              }}
            />
          </div>
        )}

        {userName && (
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "300",
              textAlign: "center",
              margin: "0 0 6px 0",
              color: "#333333",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Thin center line */}
        <div
          style={{
            width: "30px",
            height: "1px",
            backgroundColor: "#6b7280",
            margin: "10px auto",
          }}
        />

        {contactInfo && (
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#6b7280",
              letterSpacing: "1px",
              lineHeight: "2",
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
          color: "#333333",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: normal !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #6b7280 !important;
          border-bottom: 1px solid #e5e5e5 !important;
          padding-bottom: 6px !important;
          margin-top: 24px !important;
          margin-bottom: 10px !important;
          font-family: Arial, sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          margin-top: 12px !important;
          margin-bottom: 2px !important;
          color: #333333 !important;
          font-family: Arial, sans-serif !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #444444 !important;
          font-family: Arial, sans-serif !important;
        }
        strong, b {
          font-weight: bold !important;
          display: inline !important;
          color: #333333 !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 8px 0 !important;
        }
        li {
          margin-bottom: 3px !important;
          color: #444444 !important;
          font-family: Arial, sans-serif !important;
          list-style-type: none !important;
          padding-left: 10px !important;
          position: relative !important;
        }
        li::before {
          content: "–" !important;
          position: absolute !important;
          left: 0 !important;
          color: #6b7280 !important;
        }
        a {
          color: #333333 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #e5e5e5 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #e5e5e5 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default MinimalTemplate;