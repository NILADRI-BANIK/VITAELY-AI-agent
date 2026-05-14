const PremiumTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Didot', 'Bodoni MT', 'Playfair Display', 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1a1208",
        backgroundColor: "#0d0d0d",
        minHeight: "100%",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold decorative top border */}
      <div
        style={{
          height: "6px",
          background: "linear-gradient(90deg, #8B6914, #D4AF37, #F5E27A, #D4AF37, #8B6914)",
          width: "100%",
        }}
      />

      {/* Header Section — dark luxury */}
      <div
        style={{
          backgroundColor: "#111111",
          padding: "40px 50px 32px",
          position: "relative",
          borderBottom: "1px solid #2a2200",
        }}
      >
        {/* Subtle corner ornament top-left */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            width: "40px",
            height: "40px",
            borderTop: "2px solid #D4AF37",
            borderLeft: "2px solid #D4AF37",
            opacity: 0.6,
          }}
        />
        {/* Subtle corner ornament top-right */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "40px",
            height: "40px",
            borderTop: "2px solid #D4AF37",
            borderRight: "2px solid #D4AF37",
            opacity: 0.6,
          }}
        />

        {/* Profile Image */}
        {profileImage && (
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <div
              style={{
                display: "inline-block",
                padding: "3px",
                background: "linear-gradient(135deg, #8B6914, #D4AF37, #F5E27A, #D4AF37, #8B6914)",
                borderRadius: "50%",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid #0d0d0d",
                }}
              />
            </div>
          </div>
        )}

        {/* Name */}
        {userName && (
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "400",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#D4AF37",
                margin: "0",
                fontFamily: "'Didot', 'Bodoni MT', 'Playfair Display', serif",
              }}
            >
              {userName}
            </h1>
          </div>
        )}

        {/* Gold divider line with diamond */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            margin: "12px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "linear-gradient(90deg, transparent, #D4AF37)",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              backgroundColor: "#D4AF37",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "linear-gradient(90deg, #D4AF37, transparent)",
            }}
          />
        </div>

        {/* Contact Info */}
        {contactInfo && (
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#b8a06a",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Body Section */}
      <div
        style={{
          backgroundColor: "#faf8f2",
          padding: "36px 50px 48px",
          position: "relative",
        }}
      >
        {/* Content */}
        <div
          style={{ fontSize: "13px", lineHeight: "1.7", color: "#1a1208" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Gold bottom border */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #8B6914, #D4AF37, #F5E27A, #D4AF37, #8B6914)",
          width: "100%",
        }}
      />

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #8B6914 !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          padding-bottom: 6px !important;
          border-bottom: 1px solid #D4AF37 !important;
          font-family: 'Didot', 'Bodoni MT', 'Playfair Display', serif !important;
          position: relative !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #1a1208 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Didot', 'Bodoni MT', 'Playfair Display', serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2c2410 !important;
          font-family: 'Didot', 'Bodoni MT', 'Playfair Display', serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a1208 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #2c2410 !important;
          font-family: 'Didot', 'Bodoni MT', 'Playfair Display', serif !important;
        }
        li::marker {
          color: #D4AF37 !important;
        }
        a {
          color: #8B6914 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #D4AF3766 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #D4AF37 !important;
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

export default PremiumTemplate;