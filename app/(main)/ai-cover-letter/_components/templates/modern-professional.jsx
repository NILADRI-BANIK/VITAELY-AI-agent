"use client";

export default function ModernProfessional({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Professional Title",
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
    primaryColor = "#2563eb",
  } = data;

  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];
  const initial = senderName ? senderName.charAt(0).toUpperCase() : "A";

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
        overflow: "visible",
      }}
    >
      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: "220px",
          minHeight: "1123px",
          background: `linear-gradient(170deg, ${primaryColor} 0%, #1e3a8a 55%, #0f2060 100%)`,
          padding: "44px 24px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "180px", height: "180px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: "80px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)" }} />

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "22px", position: "relative" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "3px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "14px",
              letterSpacing: "-1px",
            }}
          >
            {initial}
          </div>
          <h1 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: "0 0 5px", lineHeight: "1.25" }}>
            {senderName}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", margin: 0, lineHeight: "1.4" }}>
            {senderTitle}
          </p>
        </div>

        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.18)", marginBottom: "22px" }} />

        {/* Contact */}
        <div style={{ marginBottom: "22px" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "8.5px", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 12px" }}>
            Contact
          </p>
          {[
            { label: "Email", val: senderEmail },
            { label: "Phone", val: senderPhone },
            { label: "Location", val: senderLocation },
            ...(senderWebsite ? [{ label: "Website", val: senderWebsite }] : []),
          ].map(({ label, val }) =>
            val ? (
              <div key={label} style={{ marginBottom: "10px" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "8px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>
                  {label}
                </p>
                <p style={{ color: "#fff", fontSize: "11px", margin: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
                  {val}
                </p>
              </div>
            ) : null
          )}
        </div>

        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.18)", marginBottom: "22px" }} />

        {/* Position */}
        <div style={{ flex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "8.5px", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 10px" }}>
            Position
          </p>
          <p style={{ color: "#fff", fontSize: "12.5px", fontWeight: "600", margin: "0 0 4px", lineHeight: "1.4" }}>
            {position}
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", margin: 0 }}>{companyName}</p>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.18)", marginBottom: "12px" }} />
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", margin: 0 }}>{date}</p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "44px 40px 40px", display: "flex", flexDirection: "column" }}>
        {/* Label bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{ width: "38px", height: "4px", backgroundColor: primaryColor, borderRadius: "2px" }} />
          <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase" }}>
            Cover Letter
          </span>
        </div>

        {/* Recipient */}
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#eff6ff",
            borderLeft: `4px solid ${primaryColor}`,
            borderRadius: "0 6px 6px 0",
            marginBottom: "26px",
          }}
        >
          <p style={{ color: "#1f2937", fontSize: "13px", fontWeight: "600", margin: "0 0 2px" }}>
            {recipientName}
            {recipientTitle ? ` · ${recipientTitle}` : ""}
          </p>
          <p style={{ color: "#4b5563", fontSize: "12px", margin: "0 0 2px" }}>{companyName}</p>
          {companyAddress && <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>{companyAddress}</p>}
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
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ color: "#374151", fontSize: "13px", lineHeight: "1.8", margin: "0 0 14px" }}>
            Best regards,
          </p>
          <p
            style={{
              color: primaryColor,
              fontSize: "22px",
              fontWeight: "700",
              fontStyle: "italic",
              fontFamily: "Georgia, 'Times New Roman', serif",
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            {senderName}
          </p>
          <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 2px" }}>{senderTitle}</p>
          <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>{senderEmail}</p>
        </div>
      </div>
    </div>
  );
}