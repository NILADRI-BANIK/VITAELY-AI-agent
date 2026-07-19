"use client";

export default function ExecutiveElite({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Executive / Senior Professional",
    senderEmail = "email@example.com",
    senderPhone = "+1 (555) 000-0000",
    senderLocation = "City, State",
    senderWebsite = "",
    recipientName = "Hiring Manager",
    recipientTitle = "Director of Talent",
    companyName = "Company Name",
    companyAddress = "",
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    position = "Position Applied For",
    content = "",
    primaryColor = "#0f1f3d",
  } = data;

  const NAVY = primaryColor || "#0f1f3d";
  const GOLD = "#c9a84c";
  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];

  const totalChars = content.length;
  const BASE_CHARS = 1800;
  const SCALE_DECAY = 2800;

  const bodyScale =
    totalChars <= BASE_CHARS
      ? 1
      : SCALE_DECAY / (SCALE_DECAY + (totalChars - BASE_CHARS));

  const bodyFontSize = 14.5 * bodyScale;
  const bodyLineHeight = Math.max(1.4, 2 * bodyScale);
  const bodyMarginBottom = 15 * bodyScale;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#faf9f7",
        fontFamily: "Georgia, 'Times New Roman', serif",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          backgroundColor: NAVY,
          padding: "0 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 10px)",
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "36px", paddingBottom: "36px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
              <div style={{ width: "28px", height: "1px", backgroundColor: GOLD }} />
              <span style={{ color: GOLD, fontSize: "10px", fontWeight: "400", letterSpacing: "4px", fontFamily: "'Segoe UI', Arial, sans-serif", textTransform: "uppercase" }}>
                Cover Letter
              </span>
              <div style={{ width: "28px", height: "1px", backgroundColor: GOLD }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11.5px", margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "0.5px" }}>
              Application for {position}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 5px",
                letterSpacing: "-0.5px",
                lineHeight: "1.1",
              }}
            >
              {senderName}
            </h1>
            <p style={{ color: GOLD, fontSize: "12px", margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "0.5px" }}>
              {senderTitle}
            </p>
          </div>
        </div>
        <div style={{ height: "3px", background: `linear-gradient(90deg, transparent 0%, ${GOLD} 30%, ${GOLD} 70%, transparent 100%)` }} />
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, padding: "38px 56px", display: "flex", flexDirection: "column" }}>
        {/* Date + Recipient */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div>
            <p style={{ color: "#1a1a2e", fontSize: "13.5px", fontWeight: "700", margin: "0 0 5px", lineHeight: "1.5" }}>
              {recipientName}{recipientTitle ? `, ${recipientTitle}` : ""}
            </p>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 2px" }}>{companyName}</p>
            {companyAddress && <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>{companyAddress}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#888", fontSize: "12px", margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>{date}</p>
          </div>
        </div>

        {/* Gold rule */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "26px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5dfc8" }} />
          <div style={{ width: "8px", height: "8px", backgroundColor: GOLD, transform: "rotate(45deg)" }} />
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5dfc8" }} />
        </div>

        {/* Body text */}
        <div style={{ flex: 1 }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  color: "#2c2c2c",
                  fontSize: `${bodyFontSize}px`,
                  lineHeight: bodyLineHeight,
                  margin: `0 0 ${bodyMarginBottom}px`,
                  textAlign: "justify",
                }}
              >
                {para}
              </p>
            ))
          ) : (
            <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>
              Your cover letter content will appear here...
            </p>
          )}
        </div>

        {/* Signature */}
        <div style={{ marginTop: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px" }}>
            <div style={{ width: "48px", height: "1px", backgroundColor: GOLD }} />
          </div>
          <p style={{ color: "#2c2c2c", fontSize: "13.5px", lineHeight: "1.8", margin: "0 0 18px" }}>
            Respectfully yours,
          </p>
          <p
            style={{
              color: NAVY,
              fontSize: "26px",
              fontWeight: "700",
              fontStyle: "italic",
              margin: "0 0 5px",
              letterSpacing: "-0.5px",
            }}
          >
            {senderName}
          </p>
          <p style={{ color: "#666", fontSize: "12.5px", margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            {senderTitle}
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          backgroundColor: NAVY,
          padding: "14px 56px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {[senderEmail, senderPhone, senderLocation, ...(senderWebsite ? [senderWebsite] : [])]
          .filter(Boolean)
          .map((item, i, arr) => (
            <span key={i} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "0.3px" }}>
                {item}
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: GOLD, margin: "0 14px", fontSize: "10px" }}>◆</span>
              )}
            </span>
          ))}
      </div>
    </div>
  );
}