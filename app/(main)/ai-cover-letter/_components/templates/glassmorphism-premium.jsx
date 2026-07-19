"use client";

export default function GlassmorphismPremium({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Senior Professional",
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
    primaryColor = "#7c3aed",
  } = data;

  const VIOLET = primaryColor || "#7c3aed";
  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];

  const totalChars = content.length;
  const BASE_CHARS = 1800;
  const SCALE_DECAY = 2800;

  const bodyScale =
    totalChars <= BASE_CHARS
      ? 1
      : SCALE_DECAY / (SCALE_DECAY + (totalChars - BASE_CHARS));

  const bodyFontSize = 14.5 * bodyScale;
  const bodyLineHeight = Math.max(1.4, 1.9 * bodyScale);
  const bodyMarginBottom = 14 * bodyScale;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #1a1040 70%, #0d0b20 100%)",
        fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        position: "relative",
      }}
    >
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "-120px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", right: "10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(196,181,253,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* ── HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(109,40,217,0.4) 100%)",
          border: "1px solid rgba(167,139,250,0.3)",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "1px solid rgba(167,139,250,0.2)",
          padding: "40px 52px",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent 0%, ${VIOLET} 30%, #a78bfa 60%, transparent 100%)` }} />

        <div>
          <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: "20px", marginBottom: "12px" }}>
            <span style={{ color: "#c4b5fd", fontSize: "9.5px", fontWeight: "600", letterSpacing: "2.5px", textTransform: "uppercase" }}>Cover Letter</span>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "36px", fontWeight: "700", margin: "0 0 7px", letterSpacing: "-1px", lineHeight: "1.1", textShadow: "0 2px 20px rgba(167,139,250,0.4)" }}>
            {senderName}
          </h1>
          <p style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "400", margin: 0 }}>{senderTitle}</p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(196,181,253,0.6)", fontSize: "11px", margin: "0 0 5px" }}>{date}</p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "12.5px", fontWeight: "600", margin: "0 0 3px" }}>{position}</p>
          <p style={{ color: "rgba(167,139,250,0.7)", fontSize: "11.5px", margin: 0 }}>{companyName}</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", padding: "26px 48px", gap: "24px" }}>
        {/* Left sidebar */}
        <div
          style={{
            width: "185px",
            flexShrink: 0,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(167,139,250,0.15)",
            borderRadius: "12px",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div>
            <p style={{ color: "rgba(167,139,250,0.5)", fontSize: "8.5px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 12px" }}>Contact</p>
            {[
              { label: "Email", val: senderEmail },
              { label: "Phone", val: senderPhone },
              { label: "Location", val: senderLocation },
              ...(senderWebsite ? [{ label: "Website", val: senderWebsite }] : []),
            ].map(({ label, val }) =>
              val ? (
                <div key={label} style={{ marginBottom: "10px" }}>
                  <p style={{ color: "rgba(167,139,250,0.5)", fontSize: "8.5px", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "10.5px", margin: 0, wordBreak: "break-word", lineHeight: "1.4" }}>{val}</p>
                </div>
              ) : null
            )}
          </div>

          <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(167,139,250,0.3), transparent)" }} />

          <div>
            <p style={{ color: "rgba(167,139,250,0.5)", fontSize: "8.5px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>Addressed To</p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", fontWeight: "600", margin: "0 0 3px", lineHeight: "1.4" }}>{recipientName}</p>
            {recipientTitle && <p style={{ color: "rgba(167,139,250,0.6)", fontSize: "10px", margin: "0 0 3px" }}>{recipientTitle}</p>}
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10.5px", margin: 0 }}>{companyName}</p>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(167,139,250,0.18)",
            borderRadius: "12px",
            padding: "26px 28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    color: "rgba(255,255,255,0.82)",
                    fontSize: `${bodyFontSize}px`,
                    lineHeight: bodyLineHeight,
                    margin: `0 0 ${bodyMarginBottom}px`,
                  }}
                >
                  {para}
                </p>
              ))
            ) : (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", fontStyle: "italic" }}>
                Your cover letter content will appear here...
              </p>
            )}
          </div>

          {/* Signature */}
          <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid rgba(167,139,250,0.2)" }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "12.5px", margin: "0 0 12px" }}>With appreciation,</p>
            <p style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", fontStyle: "italic", fontFamily: "Georgia, serif", margin: "0 0 4px", textShadow: "0 0 20px rgba(167,139,250,0.5)" }}>
              {senderName}
            </p>
            <p style={{ color: "#a78bfa", fontSize: "12px", margin: "0 0 2px" }}>{senderTitle}</p>
            <p style={{ color: "rgba(167,139,250,0.55)", fontSize: "11px", margin: 0 }}>{senderEmail}</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid rgba(167,139,250,0.15)", padding: "12px 48px", display: "flex", justifyContent: "center", gap: "28px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.4) 50%, transparent 100%)" }} />
        {[senderEmail, senderPhone, senderLocation].filter(Boolean).map((item, i, arr) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <span style={{ color: "rgba(167,139,250,0.45)", fontSize: "10.5px" }}>{item}</span>
            {i < arr.length - 1 && <span style={{ color: "rgba(167,139,250,0.2)", fontSize: "8px" }}>◆</span>}
          </span>
        ))}
      </div>
    </div>
  );
}