const BoldTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Bold Header Banner */}
      <div
        style={{
          backgroundColor: "#dc2626",
          padding: "30px 50px",
          marginBottom: "0",
        }}
      >
        {profileImage && (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #ffffff",
                display: "inline-block",
              }}
            />
          </div>
        )}

        {userName && (
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "900",
              textAlign: "center",
              margin: "0 0 6px 0",
              color: "#ffffff",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {userName}
          </h1>
        )}

        {contactInfo && (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#fecaca",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Red accent bar */}
      <div
        style={{
          backgroundColor: "#991b1b",
          height: "6px",
          width: "100%",
        }}
      />

      {/* Content Area */}
      <div
        style={{
          padding: "30px 50px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#1a1a1a",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 15px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #dc2626 !important;
          border-left: 4px solid #dc2626 !important;
          padding-left: 10px !important;
          margin-top: 20px !important;
          margin-bottom: 8px !important;
          font-family: Arial, sans-serif !important;
        }
        h3 {
          font-size: 14px !important;
          font-weight: bold !important;
          margin-top: 10px !important;
          margin-bottom: 2px !important;
          color: #1a1a1a !important;
          font-family: Arial, sans-serif !important;
        }
        p {
          margin: 3px 0 6px 0 !important;
          color: #1a1a1a !important;
          font-family: Arial, sans-serif !important;
        }
        strong, b {
          font-weight: bold !important;
          display: inline !important;
          color: #1a1a1a !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 8px 0 !important;
        }
        li {
          margin-bottom: 2px !important;
          color: #1a1a1a !important;
          font-family: Arial, sans-serif !important;
        }
        a {
          color: #dc2626 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 2px solid #dc2626 !important;
          margin: 8px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default BoldTemplate;