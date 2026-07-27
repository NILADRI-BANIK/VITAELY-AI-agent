const ProfessionalTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#0f172a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Top Navy Bar */}
      <div
        style={{
          backgroundColor: "#0f172a",
          padding: "30px 50px",
          marginBottom: "0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {profileImage && (
            <div>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "85px",
                  height: "85px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #94a3b8",
                  display: "block",
                }}
              />
            </div>
          )}

          <div style={{ flex: 1 }}>
            {userName && (
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "0 0 4px 0",
                  color: "#ffffff",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {userName}
              </h1>
            )}

            {/* Silver divider */}
            <div
              style={{
                height: "1px",
                width: "100px",
                backgroundColor: "#94a3b8",
                margin: "6px 0",
              }}
            />

            {contactInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  lineHeight: "1.8",
                  letterSpacing: "0.5px",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Silver accent bar */}
      <div
        style={{
          backgroundColor: "#94a3b8",
          height: "3px",
          width: "100%",
        }}
      />

      {/* Content Area */}
      <div
        style={{
          padding: "25px 50px 40px 50px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#0f172a",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Bottom Navy Bar */}
      <div
        style={{
          backgroundColor: "#0f172a",
          height: "6px",
          width: "100%",
        }}
      />

      {/* Internal styles */}
      <style>{`
        h2 {
          font-size: 13px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #ffffff !important;
          background-color: #0f172a !important;
          padding: 5px 10px !important;
          margin-top: 20px !important;
          margin-bottom: 8px !important;
          font-family: Arial, sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          margin-top: 10px !important;
          margin-bottom: 2px !important;
          color: #0f172a !important;
          font-family: Arial, sans-serif !important;
        }
        p {
          margin: 3px 0 6px 0 !important;
          color: #334155 !important;
          font-family: Arial, sans-serif !important;
        }
        strong, b {
          font-weight: bold !important;
          display: inline !important;
          color: #0f172a !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 8px 0 !important;
        }
        li {
          margin-bottom: 2px !important;
          color: #334155 !important;
          font-family: Arial, sans-serif !important;
        }
        a {
          color: #0f172a !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #94a3b8 !important;
          margin: 8px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalTemplate;