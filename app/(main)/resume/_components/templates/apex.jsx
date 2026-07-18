const ApexTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily:
          "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#0f0f0f",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header — top-heavy inverted pyramid */}
      <div
        style={{
          backgroundColor: "#0f0f0f",
          padding: "52px 54px 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inverted pyramid shape at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "-1px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderStyle: "solid",
            borderWidth: "28px 80px 0 80px",
            borderColor: "#ffffff transparent transparent transparent",
          }}
        />

        {/* Wide pyramid layer */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderStyle: "solid",
            borderWidth: "16px 200px 0 200px",
            borderColor:
              "rgba(255,255,255,0.04) transparent transparent transparent",
          }}
        />

        {/* Wider pyramid layer */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderStyle: "solid",
            borderWidth: "12px 350px 0 350px",
            borderColor:
              "rgba(255,255,255,0.03) transparent transparent transparent",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          {userName && (
            <h1
              style={{
                fontSize: "42px",
                fontWeight: "900",
                color: "#ffffff",
                margin: "0 0 6px 0",
                letterSpacing: "5px",
                textTransform: "uppercase",
                fontFamily:
                  "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                lineHeight: "1.1",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Pyramid dot row — widest at top, narrows */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              margin: "16px 0 10px",
            }}
          >
            {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: `rgba(255,255,255,${0.15 + i * 0.1 > 0.85 ? 0.85 : 0.15 + i * 0.1})`,
                }}
              />
            ))}
          </div>

          {contactInfo && (
            <div
              style={{
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontFamily: "'Arial Narrow', Arial, sans-serif",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "42px 54px 52px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.65",
            color: "#0f0f0f",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 13px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #ffffff !important;
          background-color: #0f0f0f !important;
          margin-top: 30px !important;
          margin-bottom: 14px !important;
          padding: 8px 20px !important;
          text-align: center !important;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif !important;
          clip-path: polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%) !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0f0f0f !important;
          margin-top: 16px !important;
          margin-bottom: 2px !important;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif !important;
          letter-spacing: 0.5px !important;
        }
        p {
          margin: 4px 0 8px 0 !important;
          color: #1a1a1a !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #0f0f0f !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 0 !important;
          margin: 6px 0 12px 0 !important;
          list-style: none !important;
        }
        li {
          margin-bottom: 6px !important;
          color: #1a1a1a !important;
          padding-left: 20px !important;
          position: relative !important;
          font-family: 'Arial Narrow', Arial, sans-serif !important;
        }
        li::before {
          content: '▼' !important;
          position: absolute !important;
          left: 0 !important;
          top: 1px !important;
          font-size: 7px !important;
          color: #0f0f0f !important;
          line-height: 1.8 !important;
        }
        li::marker {
          display: none !important;
          content: '' !important;
        }
        a {
          color: #0f0f0f !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: #0f0f0f22 !important;
          margin: 14px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default ApexTemplate;
