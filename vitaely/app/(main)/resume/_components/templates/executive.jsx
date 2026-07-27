const ExecutiveTemplate = ({ content, profileImage, userName, contactInfo }) => {
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
      {/* Executive Top Bar */}
      <div
        style={{
          backgroundColor: "#b45309",
          height: "8px",
          width: "100%",
        }}
      />

      {/* Header Section */}
      <div
        style={{
          padding: "30px 50px 20px 50px",
          borderBottom: "1px solid #d97706",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {profileImage && (
          <div>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #b45309",
                display: "block",
              }}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                margin: "0 0 4px 0",
                color: "#b45309",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Gold divider */}
          <div
            style={{
              height: "2px",
              width: "80px",
              backgroundColor: "#b45309",
              margin: "6px 0",
            }}
          />

          {contactInfo && (
            <div
              style={{
                fontSize: "12px",
                color: "#555555",
                lineHeight: "1.8",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "10px 50px 40px 50px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#1a1a1a",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Bottom Bar */}
      <div
        style={{
          backgroundColor: "#b45309",
          height: "4px",
          width: "100%",
        }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 14px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #b45309 !important;
          border-bottom: 1px solid #d97706 !important;
          padding-bottom: 4px !important;
          margin-top: 22px !important;
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
          color: #b45309 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #d97706 !important;
          margin: 8px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ExecutiveTemplate;