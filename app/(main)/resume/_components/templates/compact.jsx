const CompactTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: "11.5px",
        lineHeight: "1.45",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header — compact, left-aligned */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "22px 40px 14px",
          borderBottom: "2px solid #4b5563",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {/* Name */}
          {userName && (
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#111827",
                margin: "0",
                letterSpacing: "0.5px",
                fontFamily: "'Arial', 'Helvetica', sans-serif",
                textTransform: "uppercase",
                lineHeight: "1.2",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Contact info — right side */}
          {contactInfo && (
            <div
              style={{
                fontSize: "10.5px",
                color: "#4b5563",
                textAlign: "right",
                lineHeight: "1.5",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>

        {/* Thin accent line under name */}
        <div
          style={{
            width: "40px",
            height: "2px",
            backgroundColor: "#4b5563",
            borderRadius: "1px",
            marginTop: "8px",
          }}
        />
      </div>

      {/* Body */}
      <div
        style={{
          padding: "14px 40px 30px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#1a1a1a" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 10.5px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          color: #111827 !important;
          margin-top: 14px !important;
          margin-bottom: 4px !important;
          padding-bottom: 3px !important;
          border-bottom: 1.5px solid #4b5563 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        h3 {
          font-size: 11.5px !important;
          font-weight: 700 !important;
          color: #111827 !important;
          margin-top: 8px !important;
          margin-bottom: 0px !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          line-height: 1.4 !important;
        }
        p {
          margin: 1px 0 4px 0 !important;
          color: #2d2d2d !important;
          font-size: 11.5px !important;
          line-height: 1.45 !important;
        }
        strong, b {
          font-weight: 700 !important;
          color: #111827 !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 14px !important;
          margin: 2px 0 5px 0 !important;
        }
        li {
          margin-bottom: 2px !important;
          color: #2d2d2d !important;
          font-size: 11.5px !important;
          line-height: 1.45 !important;
        }
        li::marker {
          color: #4b5563 !important;
        }
        a {
          color: #1a1a1a !important;
          text-decoration: underline !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background-color: #d1d5db !important;
          margin: 6px 0 !important;
        }
        em, i {
          font-style: italic !important;
          color: #4b5563 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default CompactTemplate;