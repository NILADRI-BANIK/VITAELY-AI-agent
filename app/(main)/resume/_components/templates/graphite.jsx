const GraphiteTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Arial Narrow', 'Arial', sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#3a3a3a",
        backgroundColor: "#f0efed",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#2e2e2e",
          padding: "46px 54px 36px",
          position: "relative",
        }}
      >
        {/* Industrial top stripe */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            height: "6px",
            background:
              "repeating-linear-gradient(90deg, #3d3d3d 0px, #3d3d3d 20px, #444444 20px, #444444 40px)",
          }}
        />

        {userName && (
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#e8e8e8",
              margin: "0 0 10px 0",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'Arial Narrow', Arial, sans-serif",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Industrial divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "14px 0",
          }}
        >
          <div
            style={{ width: "24px", height: "2px", backgroundColor: "#606060" }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              backgroundColor: "#606060",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{ width: "60px", height: "2px", backgroundColor: "#505050" }}
          />
        </div>

        {contactInfo && (
          <div
            style={{
              fontSize: "11.5px",
              color: "#909090",
              letterSpacing: "1.5px",
              fontFamily: "'Arial Narrow', Arial, sans-serif",
            }}
          >
            {contactInfo}
          </div>
        )}

        {/* Bottom stripe */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "3px",
            backgroundColor: "#404040",
          }}
        />
      </div>

      {/* Mid bar */}
      <div
        style={{
          height: "8px",
          backgroundColor: "#c8c8c4",
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "38px 54px 52px",
          backgroundColor: "#f0efed",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.65",
            color: "#3a3a3a",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #555555 !important;
          margin-top: 30px !important;
          margin-bottom: 12px !important;
          padding: 6px 10px !important;
          background-color: #e0dfdd !important;
          border-left: 4px solid #888888 !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #2e2e2e !important;
          margin-top: 16px !important;
          margin-bottom: 2px !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #3a3a3a !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #2e2e2e !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 20px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 5px !important;
          color: #3a3a3a !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
        }
        li::marker {
          color: #888888 !important;
        }
        a {
          color: #555555 !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 2px !important;
          background: #d0cfcd !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default GraphiteTemplate;
