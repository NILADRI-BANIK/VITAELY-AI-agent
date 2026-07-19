"use client";

export default function Scandinavian({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Your Title",
    senderEmail = "email@example.com",
    senderPhone = "+1 (555) 000-0000",
    senderLocation = "City, Country",
    senderWebsite = "",
    recipientName = "Hiring Manager",
    recipientTitle = "",
    companyName = "Company Name",
    companyAddress = "",
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    position = "Position",
    content = "",
    primaryColor = "#111111",
  } = data;

  const BLACK = "#111111";
  const MID_GRAY = "#9ca3af";
  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];

  const totalChars = content.length;
  const BASE_CHARS = 1800;
  const SCALE_DECAY = 2800;

  const bodyScale =
    totalChars <= BASE_CHARS
      ? 1
      : SCALE_DECAY / (SCALE_DECAY + (totalChars - BASE_CHARS));

  const bodyFontSize = 15 * bodyScale;
  const bodyLineHeight = Math.max(1.4, 2 * bodyScale);
  const bodyMarginBottom = 16 * bodyScale;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#ffffff",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ padding: "52px 72px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <span style={{ color: MID_GRAY, fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Segoe UI', Arial, sans-serif", fontWeight: "400" }}>
            Cover Letter
          </span>
          <span style={{ color: MID_GRAY, fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{date}</span>
        </div>
        <h1 style={{ color: BLACK, fontSize: "48px", fontWeight: "300", margin: "0 0 4px", letterSpacing: "-2px", lineHeight: "1" }}>
          {senderName}
        </h1>
        <div style={{ height: "1px", backgroundColor: BLACK, margin: "16px 0 14px" }} />
        <p style={{ color: MID_GRAY, fontSize: "12.5px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "400", margin: 0 }}>
          {senderTitle}
        </p>
      </div>

      {/* ── TWO COLUMN SECTION ── */}
      <div style={{ display: "flex", flex: 1, padding: "40px 72px", gap: "56px" }}>
        {/* Left Column */}
        <div style={{ width: "160px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Contact */}
          <div>
            <p style={{ color: BLACK, fontSize: "9.5px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: "600", margin: "0 0 12px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Contact
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Email", val: senderEmail },
                { label: "Phone", val: senderPhone },
                { label: "Location", val: senderLocation },
                ...(senderWebsite ? [{ label: "Web", val: senderWebsite }] : []),
              ].map(({ label, val }) =>
                val ? (
                  <div key={label}>
                    <p style={{ color: MID_GRAY, fontSize: "9px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>
                      {label}
                    </p>
                    <p style={{ color: "#374151", fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif", margin: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
                      {val}
                    </p>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Applying For */}
          <div>
            <p style={{ color: BLACK, fontSize: "9.5px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: "600", margin: "0 0 12px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Applying For
            </p>
            <p style={{ color: "#374151", fontSize: "11.5px", fontFamily: "'Segoe UI', Arial, sans-serif", fontWeight: "600", margin: "0 0 4px", lineHeight: "1.4" }}>
              {position}
            </p>
            <p style={{ color: MID_GRAY, fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif", margin: 0 }}>{companyName}</p>
          </div>

          {/* Addressed To */}
          <div>
            <p style={{ color: BLACK, fontSize: "9.5px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: "600", margin: "0 0 12px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Addressed To
            </p>
            <p style={{ color: "#374151", fontSize: "11.5px", fontFamily: "'Segoe UI', Arial, sans-serif", fontWeight: "600", margin: "0 0 3px", lineHeight: "1.4" }}>
              {recipientName}
            </p>
            {recipientTitle && <p style={{ color: MID_GRAY, fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif", margin: "0 0 3px" }}>{recipientTitle}</p>}
            <p style={{ color: MID_GRAY, fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif", margin: 0 }}>{companyName}</p>
            {companyAddress && <p style={{ color: "#d1d5db", fontSize: "10.5px", fontFamily: "'Segoe UI', Arial, sans-serif", margin: "3px 0 0" }}>{companyAddress}</p>}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    color: "#1f2937",
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
          <div style={{ marginTop: "40px" }}>
            <div style={{ height: "1px", backgroundColor: "#e5e7eb", marginBottom: "24px" }} />
            <p style={{ color: "#6b7280", fontSize: "12.5px", fontFamily: "'Segoe UI', Arial, sans-serif", margin: "0 0 16px" }}>
              With regards,
            </p>
            <p style={{ color: BLACK, fontSize: "26px", fontWeight: "300", margin: "0 0 6px", letterSpacing: "-1px" }}>
              {senderName}
            </p>
            <div style={{ height: "1px", width: "48px", backgroundColor: BLACK, marginBottom: "8px" }} />
            <p style={{ color: MID_GRAY, fontSize: "11px", fontFamily: "'Segoe UI', Arial, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>
              {senderTitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM RULE ── */}
      <div style={{ height: "1px", backgroundColor: "#e5e7eb", marginTop: "auto" }} />
      <div style={{ padding: "14px 72px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#d1d5db", fontSize: "10px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{senderEmail}</span>
        <span style={{ color: "#d1d5db", fontSize: "10px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>◦</span>
        <span style={{ color: "#d1d5db", fontSize: "10px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{senderPhone}</span>
      </div>
    </div>
  );
}