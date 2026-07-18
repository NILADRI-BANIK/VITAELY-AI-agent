const PixelTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, 'Lucida Console', monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#1a0533",
        backgroundColor: "#f3f0ff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1a0533",
          padding: "40px 54px 36px",
          position: "relative",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Pixel corner decorations — top left */}
        <div style={{ position: "absolute", top: "10px", left: "10px" }}>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <div
                key={`tl-${row}-${col}`}
                style={{
                  position: "absolute",
                  top: `${row * 6}px`,
                  left: `${col * 6}px`,
                  width: "4px",
                  height: "4px",
                  backgroundColor: `rgba(124,58,237,${(row + col) % 2 === 0 ? 0.7 : 0.2})`,
                }}
              />
            )),
          )}
        </div>

        {/* Pixel corner decorations — top right */}
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <div
                key={`tr-${row}-${col}`}
                style={{
                  position: "absolute",
                  top: `${row * 6}px`,
                  right: `${col * 6}px`,
                  width: "4px",
                  height: "4px",
                  backgroundColor: `rgba(124,58,237,${(row + col) % 2 === 0 ? 0.7 : 0.2})`,
                }}
              />
            )),
          )}
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Pixel bracket */}
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              color: "#7c3aed",
              letterSpacing: "2px",
              marginBottom: "8px",
              opacity: 0.8,
            }}
          >
            {">>> RESUME.EXE"}
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 8px 0",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontFamily: "'Courier New', Courier, monospace",
                textShadow: "2px 2px 0px #7c3aed",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Pixel divider — dashed blocks */}
          <div
            style={{
              display: "flex",
              gap: "3px",
              margin: "14px 0",
              alignItems: "center",
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor:
                    i % 3 === 0
                      ? "#7c3aed"
                      : i % 3 === 1
                        ? "rgba(124,58,237,0.4)"
                        : "rgba(124,58,237,0.1)",
                }}
              />
            ))}
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "1.5px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {"// "}
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Pixel border strip */}
      <div
        style={{
          display: "flex",
          height: "8px",
          backgroundColor: "#1a0533",
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor:
                i % 4 === 0
                  ? "#7c3aed"
                  : i % 4 === 1
                    ? "#5b21b6"
                    : i % 4 === 2
                      ? "#4c1d95"
                      : "#1a0533",
            }}
          />
        ))}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "36px 54px 52px",
          backgroundColor: "#f3f0ff",
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
            color: "#1a0533",
            fontFamily: "'Courier New', Courier, monospace",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 3px !important;
          color: #ffffff !important;
          background-color: #7c3aed !important;
          margin-top: 28px !important;
          margin-bottom: 14px !important;
          padding: 6px 12px !important;
          font-family: 'Courier New', Courier, monospace !important;
          display: block !important;
          outline: 2px solid #5b21b6 !important;
          outline-offset: 2px !important;
        }
        h2::before {
          content: '# ' !important;
          color: #c4b5fd !important;
          font-weight: 400 !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1a0533 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          font-family: 'Courier New', Courier, monospace !important;
          letter-spacing: 0.5px !important;
        }
        h3::before {
          content: '> ' !important;
          color: #7c3aed !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #2d1b69 !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #1a0533 !important;
          display: inline !important;
          background-color: rgba(124,58,237,0.08) !important;
          padding: 0 2px !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 5px !important;
          color: #2d1b69 !important;
          padding-left: 22px !important;
          position: relative !important;
          font-family: 'Courier New', Courier, monospace !important;
        }
        li::before {
          content: '[+]' !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #7c3aed !important;
          font-size: 10px !important;
          line-height: 1.8 !important;
          font-weight: 700 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #7c3aed !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background: repeating-linear-gradient(90deg, #7c3aed 0px, #7c3aed 8px, transparent 8px, transparent 12px) !important;
          margin: 14px 0 !important;
          opacity: 0.3 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default PixelTemplate;
