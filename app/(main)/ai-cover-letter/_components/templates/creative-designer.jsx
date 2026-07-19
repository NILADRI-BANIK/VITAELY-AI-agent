"use client";

export default function CreativeDesigner({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Creative Designer",
    senderEmail = "hello@example.com",
    senderPhone = "+1 (555) 000-0000",
    senderLocation = "City, State",
    senderWebsite = "portfolio.example.com",
    recipientName = "Hiring Manager",
    recipientTitle = "Creative Director",
    companyName = "Creative Studio",
    companyAddress = "",
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    position = "Senior Designer",
    content = "",
    primaryColor = "#6366f1",
  } = data;

  const PURPLE = primaryColor || "#6366f1";
  const PINK = "#ec4899";
  const ORANGE = "#f97316";
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
        fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      {/* ── GRADIENT HEADER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 55%, ${ORANGE} 100%)`,
          padding: "44px 56px 50px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "120px", width: "220px", height: "220px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: "20px", right: "180px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)" }} />

        <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "20px", padding: "4px 14px", marginBottom: "16px" }}>
          <span style={{ color: "#ffffff", fontSize: "10px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>Cover Letter</span>
        </div>

        <h1 style={{ color: "#ffffff", fontSize: "42px", fontWeight: "800", margin: "0 0 10px", letterSpacing: "-1.5px", lineHeight: "1.2", position: "relative" }}>
          {senderName}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", fontWeight: "400", margin: "0 0 5px", letterSpacing: "0.5px" }}>
          {senderTitle}
        </p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", margin: 0, fontWeight: "400" }}>
          Applying for: <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>{position}</strong>
          {" "}at <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>{companyName}</strong>
        </p>
      </div>

      {/* ── CONTACT STRIP ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PURPLE}15, ${PINK}10, ${ORANGE}10)`,
          borderTop: "none",
          borderBottom: "3px solid transparent",
          backgroundClip: "padding-box",
          padding: "10px 56px",
          display: "flex",
          gap: "28px",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${PURPLE}, ${PINK}, ${ORANGE})` }} />
        {[
          { icon: "✉", val: senderEmail },
          { icon: "✆", val: senderPhone },
          { icon: "⌖", val: senderLocation },
          ...(senderWebsite ? [{ icon: "⬡", val: senderWebsite }] : []),
        ].map(({ icon, val }) =>
          val ? (
            <div key={val} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: PURPLE, fontSize: "12px" }}>{icon}</span>
              <span style={{ color: "#4b5563", fontSize: "11px" }}>{val}</span>
            </div>
          ) : null
        )}
        <div style={{ marginLeft: "auto" }}>
          <span style={{ color: "#9ca3af", fontSize: "11px" }}>{date}</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: "8px", background: `linear-gradient(180deg, ${PURPLE} 0%, ${PINK} 50%, ${ORANGE} 100%)`, flexShrink: 0 }} />

        <div style={{ flex: 1, padding: "34px 48px 34px 40px", display: "flex", flexDirection: "column" }}>
          {/* Recipient */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}>
              <div style={{ width: "20px", height: "2px", background: `linear-gradient(90deg, ${PURPLE}, ${PINK})` }} />
              <span style={{ color: "#9ca3af", fontSize: "9.5px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>To</span>
            </div>
            <p style={{ color: "#111827", fontSize: "14px", fontWeight: "700", margin: "0 0 2px" }}>
              {recipientName}
              {recipientTitle ? <span style={{ color: "#6b7280", fontWeight: "400", fontSize: "13px" }}> · {recipientTitle}</span> : null}
            </p>
            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>{companyName}</p>
            {companyAddress && <p style={{ color: "#9ca3af", fontSize: "12px", margin: "2px 0 0" }}>{companyAddress}</p>}
          </div>

          <div style={{ height: "1px", backgroundColor: "#f3f4f6", marginBottom: "22px" }} />

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
          <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 12px" }}>Warmly,</p>
              <p style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 3px", letterSpacing: "-0.5px", color: PURPLE }}>
                {senderName}
              </p>
              <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>{senderTitle}</p>
            </div>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${PURPLE}20, ${PINK}20)`,
                border: `2px solid ${PURPLE}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "800",
                color: PURPLE,
              }}
            >
              {senderName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}