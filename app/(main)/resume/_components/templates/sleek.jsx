const SleekTemplate = ({ content, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Trebuchet MS', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "12.5px",
        lineHeight: "1.65",
        color: "#1c1c1c",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top accent line — ultra thin sky blue */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)",
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "40px 56px 28px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Name */}
        {userName && (
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "200",
              color: "#0c0c0c",
              margin: "0 0 4px 0",
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
              lineHeight: "1.1",
            }}
          >
            {userName}
          </h1>
        )}

        {/* Thin line under name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "1px",
              backgroundColor: "#0ea5e9",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#0ea5e9",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#e5e7eb",
            }}
          />
        </div>

        {/* Contact info */}
        {contactInfo && (
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              lineHeight: "1.6",
            }}
          >
            {contactInfo}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "32px 56px 48px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#1c1c1c" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #0ea5e9 !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          padding-bottom: 0px !important;
          border-bottom: none !important;
          font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
          position: relative !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          margin-top: 6px !important;
          height: 1px !important;
          background: linear-gradient(90deg, #0ea5e9, #e5e7eb) !important;
          width: 100% !important;
        }
        h3 {
          font-size: 12.5px !important;
          font-weight: 600 !important;
          color: #0c0c0c !important;
          margin-top: 14px !important;
          margin-bottom: 1px !important;
          letter-spacing: 0.5px !important;
          font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
        }
        p {
          margin: 3px 0 7px 0 !important;
          color: #374151 !important;
          font-size: 12.5px !important;
        }
        strong, b {
          font-weight: 600 !important;
          color: #1c1c1c !important;
          display: inline !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #374151 !important;
          font-size: 12.5px !important;
        }
        li::marker {
          color: #0ea5e9 !important;
        }
        a {
          color: #0ea5e9 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #bae6fd !important;
        }
        hr {
          border: none !important;
          height: 1px !important;
          background: linear-gradient(90deg, #0ea5e9, #e5e7eb) !important;
          margin: 12px 0 !important;
        }
        em, i {
          font-style: italic !important;
          color: #6b7280 !important;
          font-weight: 300 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default SleekTemplate;