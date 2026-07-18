const GalaxyTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#d4d0e8",
        backgroundColor: "#07060f",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Star field background layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 8% 12%, #a78bfa88 0%, transparent 100%),
            radial-gradient(1px 1px at 18% 35%, #818cf8aa 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 27% 8%, #c4b5fdbb 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 55%, #a78bfa66 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 22%, #818cf8aa 0%, transparent 100%),
            radial-gradient(2px 2px at 52% 78%, #c4b5fd99 0%, transparent 100%),
            radial-gradient(1px 1px at 63% 14%, #a78bfa77 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 42%, #818cf8bb 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 78% 68%, #c4b5fdaa 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 28%, #a78bfa88 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 55%, #818cf877 0%, transparent 100%),
            radial-gradient(1px 1px at 12% 72%, #c4b5fd66 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 88%, #a78bfa88 0%, transparent 100%),
            radial-gradient(2px 2px at 40% 90%, #818cf8aa 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 95%, #c4b5fdbb 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 85%, #a78bfa77 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 92%, #818cf888 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 5% 50%, #c4b5fd66 0%, transparent 100%),
            radial-gradient(1px 1px at 95% 10%, #a78bfa99 0%, transparent 100%),
            radial-gradient(1px 1px at 33% 30%, #818cf855 0%, transparent 100%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Nebula glow blobs */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #4c1d9522 0%, #3730a322 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #1e1b4b33 0%, #312e8133 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top aurora bar */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, transparent 0%, #4c1d95 20%, #6d28d9 40%, #818cf8 55%, #4338ca 75%, transparent 100%)",
          boxShadow: "0 0 12px #6d28d966, 0 0 24px #4c1d9544",
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "36px 44px 28px 44px",
          borderBottom: "1px solid #2d1f5e44",
          display: "flex",
          alignItems: "center",
          gap: "28px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Profile Image */}
        {profileImage && (
          <div style={{ flexShrink: 0 }}>
            {/* Outer glow ring */}
            <div
              style={{
                width: "112px",
                height: "112px",
                borderRadius: "50%",
                padding: "3px",
                background: "linear-gradient(135deg, #7c3aed, #4338ca, #818cf8, #6d28d9)",
                boxSizing: "border-box",
                boxShadow: "0 0 20px #7c3aed55, 0 0 40px #4338ca33",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  padding: "2px",
                  backgroundColor: "#0f0c1a",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                    filter: "brightness(0.95) saturate(0.9)",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Name & Contact */}
        <div style={{ flex: 1 }}>
          {/* Small star dots above name */}
          <div style={{ display: "flex", gap: "5px", marginBottom: "8px", alignItems: "center" }}>
            {[14, 8, 5, 8, 14].map((size, i) => (
              <div
                key={i}
                style={{
                  width: `${size / 8}px`,
                  height: `${size / 8}px`,
                  borderRadius: "50%",
                  backgroundColor: i === 2 ? "#c4b5fd" : "#818cf8",
                  boxShadow: i === 2 ? "0 0 4px #c4b5fd" : "0 0 2px #818cf8",
                  opacity: i === 2 ? 1 : 0.6,
                }}
              />
            ))}
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "27px",
                fontWeight: "400",
                margin: "0 0 6px 0",
                color: "#ede9fe",
                letterSpacing: "3px",
                textTransform: "uppercase",
                lineHeight: "1.2",
                fontFamily: "'Palatino Linotype', Palatino, serif",
                textShadow: "0 0 30px #7c3aed44",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Indigo accent line */}
          <div
            style={{
              height: "1px",
              width: "140px",
              background: "linear-gradient(90deg, #7c3aed, #818cf8, transparent)",
              margin: "10px 0",
              boxShadow: "0 0 8px #7c3aed44",
            }}
          />

          {contactInfo && (
            <div
              style={{
                fontSize: "11px",
                color: "#9d8fcc",
                letterSpacing: "1.5px",
                lineHeight: "2",
                fontFamily: "'Palatino Linotype', Palatino, serif",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Right star cluster decoration */}
        <div style={{ flexShrink: 0, position: "relative", width: "40px", height: "60px" }}>
          {[
            { top: "0px", left: "20px", size: "2px", color: "#c4b5fd" },
            { top: "12px", left: "8px", size: "1.5px", color: "#818cf8" },
            { top: "20px", left: "30px", size: "1px", color: "#a78bfa" },
            { top: "32px", left: "14px", size: "2px", color: "#818cf8" },
            { top: "44px", left: "26px", size: "1.5px", color: "#c4b5fd" },
            { top: "50px", left: "6px", size: "1px", color: "#a78bfa" },
          ].map((star, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: "50%",
                backgroundColor: star.color,
                boxShadow: `0 0 3px ${star.color}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "30px 44px 44px 44px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#c4bedd",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom aurora bar */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #4338ca 30%, #7c3aed 55%, #4c1d95 75%, transparent 100%)",
          boxShadow: "0 0 10px #6d28d955",
          position: "relative",
          zIndex: 2,
        }}
      />

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #a78bfa !important;
          border-bottom: none !important;
          padding-bottom: 4px !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
          text-shadow: 0 0 10px #7c3aed66 !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '✦' !important;
          font-size: 8px !important;
          color: #c4b5fd !important;
          text-shadow: 0 0 6px #c4b5fd !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #7c3aed55, transparent) !important;
          margin-left: 8px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #e0d9f5 !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #a89ec4 !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #d4d0e8 !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #a89ec4 !important;
          font-family: 'Palatino Linotype', Palatino, serif !important;
          list-style-type: none !important;
          padding-left: 14px !important;
          position: relative !important;
        }
        li::before {
          content: '·' !important;
          position: absolute !important;
          left: 2px !important;
          color: #818cf8 !important;
          font-size: 16px !important;
          line-height: 1 !important;
          top: 1px !important;
          text-shadow: 0 0 4px #818cf8 !important;
        }
        a {
          color: #818cf8 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #4338ca55 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #2d1f5e55 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default GalaxyTemplate;