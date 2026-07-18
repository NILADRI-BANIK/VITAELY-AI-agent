const CrystalTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily:
          "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#0c2340",
        backgroundColor: "#f0f7ff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #dbeeff 0%, #eaf4ff 40%, #ffffff 70%, #d6eeff 100%)",
          padding: "50px 54px 44px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(180,220,255,0.6)",
        }}
      >
        {/* Glass sheen top-left */}
        <div
          style={{
            position: "absolute",
            top: "-30px",
            left: "-30px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.45)",
            filter: "blur(30px)",
          }}
        />

        {/* Glass sheen bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "-20px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(180,220,255,0.35)",
            filter: "blur(24px)",
          }}
        />

        {/* Crystal facet lines */}
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "80px",
            width: "1px",
            height: "100%",
            background:
              "linear-gradient(180deg, transparent, rgba(180,220,255,0.5), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "140px",
            width: "1px",
            height: "100%",
            background:
              "linear-gradient(180deg, transparent, rgba(180,220,255,0.3), transparent)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {userName && (
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "300",
                color: "#0c2340",
                margin: "0 0 8px 0",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontFamily: "'Gill Sans', Calibri, sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Crystal divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              margin: "14px 0",
              width: "180px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(90deg, transparent, #7ab8e8)",
              }}
            />
            <div
              style={{
                width: "6px",
                height: "6px",
                background: "#7ab8e8",
                transform: "rotate(45deg)",
                margin: "0 6px",
              }}
            />
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(90deg, #7ab8e8, transparent)",
              }}
            />
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "#4a7fa8",
                letterSpacing: "1.5px",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Thin icy border */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, #b8d8f0, #dbeeff, #a8c8e8, #dbeeff, #b8d8f0)",
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "38px 54px 52px",
          backgroundColor: "#f0f7ff",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(180,220,255,0.15) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(200,230,255,0.12) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#0c2340",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #4a7fa8 !important;
          margin-top: 30px !important;
          margin-bottom: 12px !important;
          padding-bottom: 8px !important;
          border-bottom: 1px solid rgba(122,184,232,0.4) !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
          background: linear-gradient(90deg, rgba(180,220,255,0.25), transparent) !important;
          padding-left: 8px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #0c2340 !important;
          margin-top: 16px !important;
          margin-bottom: 2px !important;
          font-family: 'Gill Sans', Calibri, sans-serif !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #1e3a5f !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #0c2340 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #1e3a5f !important;
          padding-left: 20px !important;
          position: relative !important;
        }
        li::before {
          content: '◆' !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          font-size: 7px !important;
          color: #7ab8e8 !important;
          line-height: 1.9 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #4a7fa8 !important;
          text-decoration: none !important;
          border-bottom: 1px solid rgba(122,184,232,0.5) !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, transparent, rgba(122,184,232,0.5), transparent) !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default CrystalTemplate;
