"use client";

export default function NeoBrutalism({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Your Role",
    senderEmail = "email@example.com",
    senderPhone = "+1 (555) 000-0000",
    senderLocation = "City, State",
    senderWebsite = "",
    recipientName = "Hiring Manager",
    recipientTitle = "",
    companyName = "Company Name",
    companyAddress = "",
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    position = "Position Applied For",
    content = "",
    primaryColor = "#facc15",
  } = data;

  const YELLOW = primaryColor || "#facc15";
  const BLACK = "#0a0a0a";
  const BORDER = `3px solid ${BLACK}`;
  const SHADOW = `4px 4px 0px ${BLACK}`;
  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];

  const totalChars = content.length;
  const BASE_CHARS = 1600;
  const SCALE_DECAY = 2500;

  const bodyScale =
    totalChars <= BASE_CHARS
      ? 1
      : SCALE_DECAY / (SCALE_DECAY + (totalChars - BASE_CHARS));

  const bodyFontSize = 14.5 * bodyScale;
  const bodyLineHeight = Math.max(1.4, 1.85 * bodyScale);
  const bodyMarginBottom = 13 * bodyScale;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#fafaf9",
        fontFamily: "'Arial Black', 'Arial', sans-serif",
        padding: "28px 36px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        overflow: "visible",
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER HERO BOX ── */}
      <div
        style={{
          backgroundColor: YELLOW,
          border: BORDER,
          boxShadow: SHADOW,
          padding: "24px 28px",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ position: "absolute", top: "-1px", right: "28px", backgroundColor: BLACK, padding: "6px 16px" }}>
          <span style={{ color: YELLOW, fontSize: "9px", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase" }}>Cover Letter</span>
        </div>

        <div>
          <h1 style={{ color: BLACK, fontSize: "40px", fontWeight: "900", margin: "0 0 5px", letterSpacing: "-2px", lineHeight: "1", textTransform: "uppercase" }}>
            {senderName}
          </h1>
          <p style={{ color: BLACK, fontSize: "13px", fontWeight: "700", margin: 0, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.65 }}>
            {senderTitle}
          </p>
        </div>

        <div style={{ backgroundColor: BLACK, padding: "10px 18px", textAlign: "center" }}>
          <p style={{ color: YELLOW, fontSize: "10px", fontWeight: "900", margin: "0 0 3px", letterSpacing: "1px", textTransform: "uppercase" }}>Date</p>
          <p style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", margin: 0 }}>{date}</p>
        </div>
      </div>

      {/* ── TWO-COLUMN ROW ── */}
      <div style={{ display: "flex", gap: "16px" }}>
        {/* [01] SENDER */}
        <div style={{ flex: 1, border: BORDER, boxShadow: SHADOW, padding: "18px 20px", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", borderBottom: `2px solid ${BLACK}`, paddingBottom: "8px" }}>
            <div style={{ backgroundColor: BLACK, color: YELLOW, fontSize: "10px", fontWeight: "900", padding: "3px 8px", letterSpacing: "1px" }}>01</div>
            <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "2.5px", textTransform: "uppercase", color: BLACK }}>Sender</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {[
              { label: "Email", val: senderEmail },
              { label: "Phone", val: senderPhone },
              { label: "Location", val: senderLocation },
              ...(senderWebsite ? [{ label: "Web", val: senderWebsite }] : []),
            ].map(({ label, val }) =>
              val ? (
                <div key={label} style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                  <span style={{ backgroundColor: BLACK, color: "#ffffff", fontSize: "8px", fontWeight: "900", padding: "2px 6px", letterSpacing: "1px", textTransform: "uppercase", flexShrink: 0 }}>
                    {label}
                  </span>
                  <span style={{ color: BLACK, fontSize: "11.5px", fontWeight: "700", wordBreak: "break-word" }}>{val}</span>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* [02] RECIPIENT */}
        <div style={{ flex: 1, border: BORDER, boxShadow: SHADOW, padding: "18px 20px", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", borderBottom: `2px solid ${BLACK}`, paddingBottom: "8px" }}>
            <div style={{ backgroundColor: YELLOW, color: BLACK, fontSize: "10px", fontWeight: "900", padding: "3px 8px", letterSpacing: "1px", border: `2px solid ${BLACK}` }}>02</div>
            <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "2.5px", textTransform: "uppercase", color: BLACK }}>Recipient</span>
          </div>
          <p style={{ color: BLACK, fontSize: "13.5px", fontWeight: "900", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.3" }}>
            {recipientName}
          </p>
          {recipientTitle && <p style={{ color: BLACK, fontSize: "11.5px", fontWeight: "700", margin: "0 0 3px", opacity: 0.65 }}>{recipientTitle}</p>}
          <p style={{ color: BLACK, fontSize: "12px", fontWeight: "700", margin: "0 0 3px" }}>{companyName}</p>
          {companyAddress && <p style={{ color: BLACK, fontSize: "11px", fontWeight: "700", margin: 0, opacity: 0.5 }}>{companyAddress}</p>}
          <div style={{ marginTop: "12px", padding: "7px 10px", backgroundColor: `${YELLOW}40`, border: `2px solid ${BLACK}` }}>
            <span style={{ fontSize: "9px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: BLACK, opacity: 0.6 }}>Re: </span>
            <span style={{ fontSize: "11.5px", fontWeight: "900", color: BLACK }}>{position}</span>
          </div>
        </div>
      </div>

      {/* ── [03] LETTER CONTENT ── */}
      <div style={{ border: BORDER, boxShadow: SHADOW, padding: "20px 24px", backgroundColor: "#ffffff", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: `2px solid ${BLACK}`, paddingBottom: "10px" }}>
          <div style={{ backgroundColor: BLACK, color: YELLOW, fontSize: "10px", fontWeight: "900", padding: "3px 8px", letterSpacing: "1px" }}>03</div>
          <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "2.5px", textTransform: "uppercase", color: BLACK }}>Letter</span>
        </div>
        <div style={{ fontFamily: "'Arial', sans-serif" }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  color: "#1a1a1a",
                  fontSize: `${bodyFontSize}px`,
                  lineHeight: bodyLineHeight,
                  margin: `0 0 ${bodyMarginBottom}px`,
                  fontWeight: "400",
                  fontFamily: "'Arial', sans-serif",
                }}
              >
                {para}
              </p>
            ))
          ) : (
            <p style={{ color: "#9ca3af", fontSize: "13px", fontStyle: "italic" }}>Your cover letter content will appear here...</p>
          )}
        </div>
      </div>

      {/* ── [04] SIGNATURE ── */}
      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1, border: BORDER, boxShadow: SHADOW, padding: "18px 22px", backgroundColor: YELLOW, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ backgroundColor: BLACK, color: YELLOW, fontSize: "10px", fontWeight: "900", padding: "3px 8px", letterSpacing: "1px" }}>04</div>
            <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "2.5px", textTransform: "uppercase", color: BLACK }}>Signature</span>
          </div>
          <p style={{ color: BLACK, fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 5px", opacity: 0.6 }}>Sincerely,</p>
          <p style={{ color: BLACK, fontSize: "26px", fontWeight: "900", margin: "0 0 3px", letterSpacing: "-1px", textTransform: "uppercase", lineHeight: "1" }}>
            {senderName}
          </p>
          <p style={{ color: BLACK, fontSize: "11px", fontWeight: "700", margin: 0, opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>
            {senderTitle}
          </p>
        </div>

        <div style={{ width: "210px", flexShrink: 0, border: BORDER, boxShadow: SHADOW, padding: "18px 20px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px" }}>
          <p style={{ color: BLACK, fontSize: "9px", fontWeight: "900", letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 8px", borderBottom: `2px solid ${BLACK}`, paddingBottom: "6px" }}>
            Contact
          </p>
          {[senderEmail, senderPhone, senderLocation].filter(Boolean).map((item) => (
            <p key={item} style={{ color: BLACK, fontSize: "11px", fontWeight: "700", margin: 0, lineHeight: "1.4" }}>{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}