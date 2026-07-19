"use client";

export default function TechCyber({ data = {} }) {
  const {
    senderName = "Your Name",
    senderTitle = "Full-Stack Engineer",
    senderEmail = "dev@example.com",
    senderPhone = "+1 (555) 000-0000",
    senderLocation = "Remote / City",
    senderWebsite = "github.com/yourname",
    recipientName = "Hiring Manager",
    recipientTitle = "Engineering Lead",
    companyName = "Tech Company",
    companyAddress = "",
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    position = "Software Engineer",
    content = "",
    primaryColor = "#00e5ff",
  } = data;

  const CYAN = primaryColor || "#00e5ff";
  const DARK = "#0a0e1a";
  const PANEL = "#0d1224";
  const BORDER = "#1a2540";
  const paragraphs = content ? content.split("\n").filter((p) => p.trim()) : [];

  // ── Dynamic body scaling to guarantee one A4 page (~1123px) ──
  // Header banner and sidebar stay fixed size; only body text shrinks
  // as content grows, and only once content is long enough to actually
  // risk overflowing one page. Earlier tuning (BASE_CHARS=1400) started
  // shrinking well before it was needed, producing tiny text with lots
  // of leftover blank space for completely normal-length letters.
  // BASE_CHARS is now set to roughly what the available body area can
  // hold at full size (~3200 chars ≈ 30+ lines at 13px/1.85 line-height
  // in this template's content column), so typical AI-generated
  // letters (even long ones) render at full size. SCALE_DECAY only
  // engages for genuine outliers beyond that.
  const totalChars = content.length;
  const BASE_CHARS = 3200;
  const SCALE_DECAY = 2400;

  const bodyScale =
    totalChars <= BASE_CHARS
      ? 1
      : SCALE_DECAY / (SCALE_DECAY + (totalChars - BASE_CHARS));

  const bodyFontSize = 13 * bodyScale;
  const bodyLineHeight = Math.max(1.15, 1.85 * bodyScale);
  const bodyMarginBottom = 14 * bodyScale;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: DARK,
        fontFamily: "'Consolas', 'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      {/* ── TOP HEADER BANNER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, #010b1a 0%, #021428 40%, #031d35 100%)`,
          borderBottom: `2px solid ${CYAN}`,
          padding: "28px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid dot pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              `radial-gradient(circle, rgba(0,229,255,0.12) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${CYAN} 40%, ${CYAN} 60%, transparent 100%)`,
            boxShadow: `0 0 12px ${CYAN}`,
          }}
        />

        {/* Left: Title */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ color: CYAN, fontSize: "11px", fontWeight: "700", letterSpacing: "1px" }}>
              [&nbsp;
            </span>
            <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase" }}>
              Cover Letter
            </span>
            <span style={{ color: CYAN, fontSize: "11px", fontWeight: "700", letterSpacing: "1px" }}>
              &nbsp;]
            </span>
          </div>
          <p style={{ color: "rgba(0,229,255,0.5)", fontSize: "10px", margin: 0, letterSpacing: "1px" }}>
            {`// position: ${position}`}
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", margin: "3px 0 0", letterSpacing: "1px" }}>
            {`// date: ${date}`}
          </p>
        </div>

        {/* Right: Name */}
        <div style={{ position: "relative", textAlign: "right" }}>
          <h1
            style={{
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
              fontFamily: "'Consolas', monospace",
            }}
          >
            {senderName}
            <span style={{ color: CYAN }}>_</span>
          </h1>
          <p style={{ color: CYAN, fontSize: "11px", margin: 0, letterSpacing: "1px" }}>
            {senderTitle}
          </p>
        </div>
      </div>

      {/* ── BODY ROW ── */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* LEFT SIDEBAR */}
        <div
          style={{
            width: "210px",
            backgroundColor: PANEL,
            borderRight: `1px solid ${BORDER}`,
            padding: "32px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flexShrink: 0,
          }}
        >
          {/* Section: Contact */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "4px", height: "4px", backgroundColor: CYAN, borderRadius: "50%" }} />
              <p style={{ color: CYAN, fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                ./contact
              </p>
            </div>
            {[
              { label: "email", val: senderEmail },
              { label: "phone", val: senderPhone },
              { label: "location", val: senderLocation },
              ...(senderWebsite ? [{ label: "web", val: senderWebsite }] : []),
            ].map(({ label, val }) =>
              val ? (
                <div key={label} style={{ marginBottom: "10px" }}>
                  <p style={{ color: "rgba(0,229,255,0.4)", fontSize: "9px", margin: "0 0 2px", letterSpacing: "1px" }}>
                    &gt;&gt; {label}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "10.5px", margin: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
                    {val}
                  </p>
                </div>
              ) : null
            )}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: `linear-gradient(90deg, ${CYAN}50, transparent)` }} />

          {/* Section: Target */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "4px", height: "4px", backgroundColor: CYAN, borderRadius: "50%" }} />
              <p style={{ color: CYAN, fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                ./target
              </p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "9px", margin: "0 0 3px", letterSpacing: "0.5px" }}>
              &gt;&gt; role
            </p>
            <p style={{ color: "#ffffff", fontSize: "11px", fontWeight: "600", margin: "0 0 10px", lineHeight: "1.4" }}>
              {position}
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "9px", margin: "0 0 3px", letterSpacing: "0.5px" }}>
              &gt;&gt; company
            </p>
            <p style={{ color: "#ffffff", fontSize: "11px", fontWeight: "600", margin: 0 }}>
              {companyName}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: `linear-gradient(90deg, ${CYAN}50, transparent)` }} />

          {/* Status indicator */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
              <p style={{ color: "#22c55e", fontSize: "9px", margin: 0, letterSpacing: "1px" }}>
                STATUS: ACTIVE
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: "32px 36px", display: "flex", flexDirection: "column" }}>
          {/* Recipient block */}
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: PANEL,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${CYAN}`,
              borderRadius: "0 6px 6px 0",
              marginBottom: "28px",
            }}
          >
            <p style={{ color: "rgba(0,229,255,0.5)", fontSize: "9px", letterSpacing: "1.5px", margin: "0 0 6px" }}>
              {`// recipient: ${recipientName}`}
            </p>
            <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: "600", margin: "0 0 2px" }}>
              {recipientName}
              {recipientTitle ? ` — ${recipientTitle}` : ""}
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11.5px", margin: "0 0 2px" }}>
              {companyName}
            </p>
            {companyAddress && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: 0 }}>{companyAddress}</p>
            )}
          </div>

          {/* Body — scales down as content grows */}
          <div style={{ flex: 1, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
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
                {"// your cover letter content will appear here..."}
              </p>
            )}
          </div>

          {/* Signature */}
          <div
            style={{
              marginTop: "28px",
              paddingTop: "22px",
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12.5px", lineHeight: "1.8", margin: "0 0 16px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              Best regards,
            </p>
            <p
              style={{
                color: CYAN,
                fontSize: "20px",
                fontWeight: "700",
                margin: "0 0 4px",
                fontFamily: "'Consolas', monospace",
              }}
            >
              {senderName}
              <span style={{ color: "rgba(0,229,255,0.4)" }}>;</span>
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11.5px", margin: "0 0 3px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              {senderTitle}
            </p>
            <p style={{ color: "rgba(0,229,255,0.5)", fontSize: "11px", margin: 0, fontFamily: "'Consolas', monospace" }}>
              {senderEmail}
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div
        style={{
          backgroundColor: PANEL,
          borderTop: `1px solid ${BORDER}`,
          padding: "10px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "rgba(0,229,255,0.35)", fontSize: "9px", letterSpacing: "1px" }}>
          [SENSAI_CAREER_PLATFORM]
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px" }}>
          cover-letter.pdf
        </span>
        <span style={{ color: "rgba(0,229,255,0.35)", fontSize: "9px", letterSpacing: "1px" }}>
          [EOF]
        </span>
      </div>
    </div>
  );
}