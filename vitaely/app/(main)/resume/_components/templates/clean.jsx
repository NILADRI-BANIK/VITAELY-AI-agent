const CleanTemplate = ({ content, profileImage, userName, contactInfo }) => {
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
        padding: "40px 50px",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "2px solid #0369a1",
          paddingBottom: "16px",
          marginBottom: "20px",
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
                border: "3px solid #0369a1",
                display: "inline-block",
              }}
            />
          </div>
        )}

        {userName && (
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "0 0 6px 0",
              color: "#0369a1",
              letterSpacing: "1px",
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
              color: "#555555",
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
          lineHeight: "1.6",
          color: "#1a1a1a",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 14px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 1.5px !important;
          color: #0369a1 !important;
          border-bottom: 1px solid #bae6fd !important;
          padding-bottom: 4px !important;
          margin-top: 20px !important;
          margin-bottom: 8px !important;
          font-family: Arial, sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          margin-top: 10px !important;
          margin-bottom: 2px !important;
          color: #1a1a1a !important;
          font-family: Arial, sans-serif !important;
        }
        p {
          margin: 3px 0 6px 0 !important;
          color: #333333 !important;
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
          color: #333333 !important;
          font-family: Arial, sans-serif !important;
        }
        a {
          color: #0369a1 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #bae6fd !important;
          margin: 8px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default CleanTemplate;