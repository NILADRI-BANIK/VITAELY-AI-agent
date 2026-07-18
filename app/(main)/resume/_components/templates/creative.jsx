const CreativeTemplate = ({ content, profileImage, userName, contactInfo }) => {
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
        display: "flex",
        minHeight: "100%",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: "220px",
          minWidth: "220px",
          backgroundColor: "#7c3aed",
          padding: "30px 20px",
          boxSizing: "border-box",
        }}
      >
        {profileImage && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
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
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "0 0 8px 0",
              color: "#ffffff",
              lineHeight: "1.3",
            }}
          >
            {userName}
          </h1>
        )}

        {contactInfo && (
          <div
            style={{
              fontSize: "11px",
              color: "#ede9fe",
              textAlign: "center",
              lineHeight: "1.8",
            }}
          >
            {contactInfo}
          </div>
        )}

        {/* Decorative dots */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#ede9fe",
            }}
          />
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#c4b5fd",
            }}
          />
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#ede9fe",
            }}
          />
        </div>
      </div>

      {/* Right Content */}
      <div
        style={{
          flex: 1,
          padding: "30px 30px 30px 25px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
            color: "#1a1a1a",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 14px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 1.5px !important;
          color: #7c3aed !important;
          border-bottom: 2px solid #7c3aed !important;
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
          color: #7c3aed !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #ede9fe !important;
          margin: 8px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default CreativeTemplate;