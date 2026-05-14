const LuxeTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily:
          "'Didot', 'Bodoni MT', 'Playfair Display', 'Book Antiqua', Georgia, serif",
        fontSize: "13px",
        lineHeight: "1.8",
        color: "#2c2218",
        backgroundColor: "#fdf8f2",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Top rose gold foil bar */}
      <div
        style={{
          height: "4px",
          background:
            "linear-gradient(90deg, #c8956c 0%, #e8c4a0 20%, #f0d4b8 35%, #d4a574 50%, #f0d4b8 65%, #e8c4a0 80%, #c8956c 100%)",
        }}
      />

      {/* Editorial masthead strip */}
      <div
        style={{
          backgroundColor: "#2c2218",
          padding: "8px 44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: "8px",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "#c8956c",
            fontFamily: "'Didot', 'Bodoni MT', Georgia, serif",
          }}
        >
          Portfolio Edition
        </div>
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#c8956c",
                opacity: i === 2 ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: "8px",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "#c8956c",
            fontFamily: "'Didot', 'Bodoni MT', Georgia, serif",
          }}
        >
          Exclusive Issue
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          backgroundColor: "#fdf8f2",
          padding: "40px 44px 32px 44px",
          borderBottom: "1px solid #e8c4a055",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark large initial */}
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            right: "30px",
            fontSize: "200px",
            fontWeight: "400",
            color: "rgba(200,149,108,0.04)",
            fontFamily: "'Didot', 'Bodoni MT', Georgia, serif",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            fontStyle: "italic",
          }}
        >
          L
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "32px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Profile Image */}
          {profileImage && (
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: "112px",
                  height: "140px",
                  position: "relative",
                }}
              >
                {/* Rose gold frame */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, #c8956c, #e8c4a0, #f0d4b8, #d4a574, #c8956c)",
                    padding: "2px",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: "brightness(1.02) saturate(0.9) contrast(1.05)",
                    }}
                  />
                </div>
                {/* Corner accent top-left */}
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    left: "-4px",
                    width: "14px",
                    height: "14px",
                    borderTop: "2px solid #c8956c",
                    borderLeft: "2px solid #c8956c",
                  }}
                />
                {/* Corner accent bottom-right */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    width: "14px",
                    height: "14px",
                    borderBottom: "2px solid #c8956c",
                    borderRight: "2px solid #c8956c",
                  }}
                />
              </div>
            </div>
          )}

          {/* Name & Contact */}
          <div style={{ flex: 1, paddingTop: "8px" }}>
            {/* Thin decorative rule above name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #c8956c, #e8c4a0, transparent)",
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  color: "#c8956c",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontFamily: "'Didot', 'Bodoni MT', Georgia, serif",
                }}
              >
                ✦
              </div>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #e8c4a0, #c8956c, transparent)",
                }}
              />
            </div>

            {userName && (
              <h1
                style={{
                  fontSize: "34px",
                  fontWeight: "400",
                  margin: "0 0 4px 0",
                  color: "#2c2218",
                  letterSpacing: "6px",
                  textTransform: "uppercase",
                  lineHeight: "1.15",
                  fontFamily:
                    "'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif",
                  fontStyle: "normal",
                }}
              >
                {userName}
              </h1>
            )}

            {/* Rose gold divider */}
            <div
              style={{
                height: "1px",
                width: "100%",
                background:
                  "linear-gradient(90deg, #c8956c, #e8c4a0, #f0d4b8, transparent)",
                margin: "14px 0",
              }}
            />

            {contactInfo && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#9a7d6a",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  lineHeight: "2.2",
                  fontFamily: "'Didot', 'Bodoni MT', Georgia, serif",
                }}
              >
                {contactInfo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Champagne accent strip */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, #c8956c 25%, #f0d4b8 50%, #c8956c 75%, transparent 100%)",
        }}
      />
      <div
        style={{
          height: "4px",
          backgroundColor: "#fdf8f2",
          borderBottom: "1px solid #e8c4a033",
        }}
      />

      {/* Content Area */}
      <div
        style={{
          padding: "32px 44px 48px 44px",
          boxSizing: "border-box",
          backgroundColor: "#fdf8f2",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.8",
            color: "#2c2218",
          }}
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      </div>

      {/* Footer rose gold bar */}
      <div
        style={{
          height: "4px",
          background:
            "linear-gradient(90deg, #c8956c 0%, #e8c4a0 20%, #f0d4b8 35%, #d4a574 50%, #f0d4b8 65%, #e8c4a0 80%, #c8956c 100%)",
        }}
      />

      <style>{`
        h2 {
          font-size: 9px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 6px !important;
          color: #c8956c !important;
          border-bottom: none !important;
          padding-bottom: 4px !important;
          margin-top: 32px !important;
          margin-bottom: 14px !important;
          font-family: 'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }
        h2::before {
          content: '—' !important;
          color: #d4a574 !important;
          font-size: 12px !important;
          flex-shrink: 0 !important;
          letter-spacing: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #c8956c55, #e8c4a033, transparent) !important;
          margin-left: 4px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 16px !important;
          margin-bottom: 2px !important;
          color: #2c2218 !important;
          font-family: 'Didot', 'Bodoni MT', Georgia, serif !important;
          letter-spacing: 0.5px !important;
          font-style: italic !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #6b5344 !important;
          font-family: 'Didot', 'Bodoni MT', Georgia, serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #2c2218 !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 5px !important;
          color: #6b5344 !important;
          font-family: 'Didot', 'Bodoni MT', Georgia, serif !important;
          list-style-type: none !important;
          padding-left: 18px !important;
          position: relative !important;
        }
        li::before {
          content: '✦' !important;
          position: absolute !important;
          left: 0px !important;
          top: 0px !important;
          color: #c8956c !important;
          font-size: 8px !important;
          line-height: 1.9 !important;
        }
        a {
          color: #c8956c !important;
          text-decoration: none !important;
          border-bottom: 1px solid #e8c4a066 !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, transparent, #c8956c55, #e8c4a055, transparent) !important;
          margin: 12px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default LuxeTemplate;
