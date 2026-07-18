const AuraTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif",
        fontSize: "13px",
        lineHeight: "1.8",
        color: "#2d2640",
        backgroundColor: "#fdf9ff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Dreamy pastel top bar */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #f9a8d4, #c4b5fd, #93c5fd, #6ee7b7, #fde68a)",
          width: "100%",
        }}
      />

      {/* Header — soft dreamy pastel */}
      <div
        style={{
          background: "linear-gradient(160deg, #fce7f3 0%, #ede9fe 35%, #dbeafe 65%, #d1fae5 100%)",
          padding: "48px 50px 36px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Soft glow blobs in background */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-40px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,168,212,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147,197,253,0.3) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "260px",
            height: "140px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,181,253,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Profile Image with aura glow */}
        {profileImage && (
          <div
            style={{
              display: "inline-block",
              position: "relative",
              marginBottom: "18px",
            }}
          >
            {/* Outer aura ring */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "-10px",
                right: "-10px",
                bottom: "-10px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(196,181,253,0.5) 0%, rgba(249,168,212,0.3) 50%, transparent 75%)",
                filter: "blur(6px)",
              }}
            />
            {/* Mid glow ring */}
            <div
              style={{
                position: "absolute",
                top: "-4px",
                left: "-4px",
                right: "-4px",
                bottom: "-4px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f9a8d4, #c4b5fd, #93c5fd, #6ee7b7)",
                padding: "3px",
              }}
            />
            {/* Image */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "3px",
                background: "linear-gradient(135deg, #f9a8d4, #c4b5fd, #93c5fd)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "108px",
                  height: "108px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid #fdf9ff",
                }}
              />
            </div>
          </div>
        )}

        {/* Name */}
        {userName && (
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              letterSpacing: "2px",
              background: "linear-gradient(90deg, #be185d, #7c3aed, #1d4ed8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Georgia', 'Palatino Linotype', serif",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Pastel divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            margin: "10px auto",
            width: "fit-content",
          }}
        >
          {["#f9a8d4", "#c4b5fd", "#93c5fd", "#6ee7b7", "#fde68a"].map(
            (color, i) => (
              <div
                key={i}
                style={{
                  width: i === 2 ? "20px" : "8px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: color,
                  opacity: 0.9,
                }}
              />
            )
          )}
        </div>

        {/* Contact Info */}
        {contactInfo && (
          <div
            style={{
              fontSize: "11.5px",
              color: "#6b5b8a",
              letterSpacing: "0.8px",
              marginTop: "8px",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Pastel wave strip */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #f9a8d4, #c4b5fd, #93c5fd, #6ee7b7, #fde68a)",
          opacity: 0.5,
        }}
      />

      {/* Body */}
      <div
        style={{
          backgroundColor: "#fdf9ff",
          padding: "36px 50px 48px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.8",
            color: "#2d2640",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom pastel bar */}
      <div
        style={{
          height: "5px",
          background: "linear-gradient(90deg, #fde68a, #6ee7b7, #93c5fd, #c4b5fd, #f9a8d4)",
          width: "100%",
        }}
      />

      <style>{`
        h2 {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #7c3aed !important;
          margin-top: 28px !important;
          margin-bottom: 10px !important;
          padding-bottom: 7px !important;
          border-bottom: 2px solid #e9d5ff !important;
          font-family: 'Georgia', serif !important;
          position: relative !important;
        }
        h2::after {
          content: '' !important;
          position: absolute !important;
          bottom: -2px !important;
          left: 0 !important;
          width: 40px !important;
          height: 2px !important;
          background: linear-gradient(90deg, #f9a8d4, #c4b5fd) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #2d2640 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Georgia', serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #3d3455 !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #2d2640 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 18px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #3d3455 !important;
        }
        li::marker {
          color: #c4b5fd !important;
        }
        a {
          color: #7c3aed !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #f9a8d4, #c4b5fd, #93c5fd) !important;
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

export default AuraTemplate;