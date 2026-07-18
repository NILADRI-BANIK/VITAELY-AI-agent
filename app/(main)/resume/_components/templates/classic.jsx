const ClassicTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        padding: "40px 50px",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      {profileImage && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img
            src={profileImage}
            alt="Profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #1a1a1a",
              display: "inline-block",
            }}
          />
        </div>
      )}

      {userName && (
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "0 0 6px 0",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#1a1a1a",
          }}
        >
          {userName}
        </h1>
      )}

      {/* Contact Info */}
      {contactInfo && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#444444",
            marginBottom: "16px",
          }}
        >
          {contactInfo}
        </div>
      )}

      {/* Divider */}
      <hr
        style={{
          border: "none",
          borderTop: "2px solid #1a1a1a",
          margin: "10px 0 16px 0",
        }}
      />

      {/* Content */}
      <div
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#1a1a1a",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Internal styles for markdown content */}
      <style>{`
        h2 {
          font-size: 15px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          border-bottom: 1px solid #1a1a1a !important;
          padding-bottom: 3px !important;
          margin-top: 18px !important;
          margin-bottom: 8px !important;
          color: #1a1a1a !important;
          font-family: Georgia, serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          margin-top: 10px !important;
          margin-bottom: 2px !important;
          color: #1a1a1a !important;
          font-family: Georgia, serif !important;
        }
        p {
          margin: 3px 0 6px 0 !important;
          color: #1a1a1a !important;
          font-family: Georgia, serif !important;
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
          font-family: Georgia, serif !important;
        }
        a {
          color: #1a1a1a !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #1a1a1a !important;
          margin: 8px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ClassicTemplate;