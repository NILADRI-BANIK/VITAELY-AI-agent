"use client";

export default function StartupFounder({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Founder & Product Lead",
    senderEmail = "hello@startup.io",
    senderPhone = "+1 (555) 000-0000",
    senderLocation = "San Francisco, CA",
    senderWebsite = "startup.io",
    recipientName = "Hiring Manager",
    recipientTitle = "",
    companyName = "Company",
    companyAddress = "",
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    position = "Head of Product",
    content = "",
    primaryColor = "#f59e0b",
  } = data;

  const AMBER = primaryColor || "#f59e0b";
  const AMBER_DARK = "#d97706";
  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];

  const totalChars = content.length;
  const BASE_CHARS = 1800;
  const SCALE_DECAY = 2800;

  const bodyScale =
    totalChars <= BASE_CHARS
      ? 1
      : SCALE_DECAY / (SCALE_DECAY + (totalChars - BASE_CHARS));

  const bodyFontSize = 14.5 * bodyScale;
  const bodyLineHeight = Math.max(1.4, 1.85 * bodyScale);
  const bodyMarginBottom = 14 * bodyScale;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#ffffff",
        fontFamily: "'Inter', 'Segoe UI', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      {/* ── TOP AMBER BAR ── */}
      <div
        style={{
          background: `linear-gradient(90deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
          padding: "0 52px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "130px", height: "130px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", right: "100px", bottom: "-40px", width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.07)" }} />
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "12px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", position: "relative" }}>
          Cover Letter
        </span>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11.5px", position: "relative" }}>
          Applying to <strong style={{ color: "#ffffff", fontWeight: "700" }}>{companyName}</strong>
        </span>
      </div>

      {/* ── NAME HERO SECTION ── */}
      <div
        style={{
          padding: "30px 52px 26px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 style={{ color: "#111827", fontSize: "36px", fontWeight: "800", margin: "0 0 6px", letterSpacing: "-1.5px", lineHeight: "1.05" }}>
            {senderName}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", fontWeight: "400", margin: "0 0 14px" }}>
            {senderTitle}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[senderEmail, senderPhone, senderLocation, ...(senderWebsite ? [senderWebsite] : [])]
              .filter(Boolean)
              .map((item) => (
                <span
                  key={item}
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    backgroundColor: `${AMBER}15`,
                    border: `1px solid ${AMBER}40`,
                    borderRadius: "20px",
                    color: "#374151",
                    fontSize: "11px",
                    fontWeight: "500",
                  }}
                >
                  {item}
                </span>
              ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "24px" }}>
          <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>{date}</p>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: "5px", background: `linear-gradient(180deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`, flexShrink: 0 }} />

        <div style={{ flex: 1, padding: "32px 44px 32px 40px", display: "flex", flexDirection: "column" }}>
          {/* Recipient block */}
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "#fffbeb",
              border: `1px solid ${AMBER}30`,
              borderRadius: "8px",
              marginBottom: "26px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ color: "#92400e", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 3px" }}>Attention</p>
              <p style={{ color: "#111827", fontSize: "13.5px", fontWeight: "600", margin: "0 0 2px" }}>
                {recipientName}{recipientTitle ? ` · ${recipientTitle}` : ""}
              </p>
              <p style={{ color: "#6b7280", fontSize: "12.5px", margin: 0 }}>{companyName}</p>
              {companyAddress && <p style={{ color: "#9ca3af", fontSize: "11.5px", margin: "2px 0 0" }}>{companyAddress}</p>}
            </div>
            <div style={{ flexShrink: 0, backgroundColor: AMBER, borderRadius: "6px", padding: "8px 14px", textAlign: "center" }}>
              <p style={{ color: "#ffffff", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 2px", textTransform: "uppercase" }}>Role</p>
              <p style={{ color: "#ffffff", fontSize: "11.5px", fontWeight: "600", margin: 0, maxWidth: "120px", lineHeight: "1.3" }}>{position}</p>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1 }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    color: "#374151",
                    fontSize: `${bodyFontSize}px`,
                    lineHeight: bodyLineHeight,
                    margin: `0 0 ${bodyMarginBottom}px`,
                  }}
                >
                  {para}
                </p>
              ))
            ) : (
              <p style={{ color: "#9ca3af", fontSize: "14px", fontStyle: "italic" }}>
                Your cover letter content will appear here...
              </p>
            )}
          </div>

          {/* Signature */}
          <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ color: "#6b7280", fontSize: "13.5px", margin: "0 0 12px" }}>Best,</p>
            <p style={{ color: "#111827", fontSize: "20px", fontWeight: "800", margin: "0 0 3px", letterSpacing: "-0.5px" }}>
              {senderName}
            </p>
            <p style={{ color: "#6b7280", fontSize: "12.5px", margin: "0 0 2px" }}>{senderTitle}</p>
            <p style={{ color: AMBER, fontSize: "11.5px", margin: 0, fontWeight: "600" }}>{senderEmail}</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 52px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" }}>
        <span style={{ color: "#d1d5db", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>Cover Letter</span>
        <div style={{ width: "24px", height: "3px", backgroundColor: AMBER, borderRadius: "2px" }} />
        <span style={{ color: "#d1d5db", fontSize: "10px" }}>{companyName}</span>
      </div>
    </div>
  );
}
