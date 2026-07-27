"use client";

import React from "react";
const IconBox = ({ path }) => (
  <div
    style={{
      width: "32px",
      height: "32px",
      backgroundColor: "#111111",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
      <path d={path} />
    </svg>
  </div>
);

const SectionHeading = ({ title }) => (
  <div
    style={{
      backgroundColor: "#dce8f5",
      borderTop: "1px solid #aaaaaa",
      borderBottom: "1px solid #aaaaaa",
      padding: "5px 10px",
      marginBottom: "8px",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        fontWeight: "bold",
        fontVariant: "small-caps",
        color: "#1a1a1a",
        letterSpacing: "0.5px",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {title}
    </span>
  </div>
);

const TintTemplate = ({ content, profileImage, userName, contactInfo }) => {
  // ── Parse contact info ───────────────────────────────────────────
  const contactParts = contactInfo ? contactInfo.split(" | ") : [];
  const email = contactParts.find((p) => p.includes("@")) || "";
  const mobile = contactParts.find((p) => /\+?\d[\d\s\-()]{6,}/.test(p)) || "";
  const linkedin =
    contactParts.find((p) => p.toLowerCase().includes("linkedin")) || "";
  const twitter =
    contactParts.find((p) => p.toLowerCase().includes("twitter")) || "";

  // ── Parse HTML content into named sections ───────────────────────
  const extractSection = (html, keyword) => {
    const re = new RegExp(
      `<h2[^>]*>[^<]*${keyword}[^<]*<\\/h2>([\\s\\S]*?)(?=<h2|$)`,
      "i",
    );
    const m = html.match(re);
    return m ? m[1].trim() : "";
  };

  const removeSection = (html, keyword) => {
    const re = new RegExp(
      `<h2[^>]*>[^<]*${keyword}[^<]*<\\/h2>[\\s\\S]*?(?=<h2|$)`,
      "i",
    );
    return html.replace(re, "");
  };

  const raw = content || "";
  const summary = extractSection(raw, "Summary");
  const skills = extractSection(raw, "Skills");
  const education = extractSection(raw, "Education");
  const experience = extractSection(raw, "Experience");
  const projects = extractSection(raw, "Projects");

  // SVG icon helper

  const linkedinPath =
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
  const phonePath =
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z";
  const emailPath =
    "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z";
  const twitterPath =
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z";

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "12.5px",
        lineHeight: "1.55",
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        border: "1px solid #bbbbbb",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════════════
          TOP HEADER: Logo | Name | Profile Photo
          ══════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "2px solid #bbbbbb",
          backgroundColor: "#ffffff",
          gap: "10px",
        }}
      >
        {/* Left — TINT Logo */}
        <div style={{ flexShrink: 0, width: "80px" }}>
          <img
            src="/TINT_logo.png"
            alt="TINT Logo"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Center — Name + Summary */}
        <div style={{ flex: 1, textAlign: "left", paddingLeft: "10px" }}>
          {userName && (
            <h1
              style={{
                fontSize: "17px",
                fontWeight: "bold",
                margin: "0 0 6px 0",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#1a1a1a",
                textAlign: "center",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              {userName}
            </h1>
          )}
          {summary && (
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "3px",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                Professional Summary
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#222222",
                  lineHeight: "1.5",
                }}
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          )}
        </div>

        {/* Right — Profile Photo */}
        <div
          style={{
            flexShrink: 0,
            width: "80px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "72px",
                height: "88px",
                objectFit: "cover",
                display: "block",
                border: "1px solid #999999",
                borderRadius: "3px",
              }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "88px",
                border: "1px solid #999999",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                fontSize: "8px",
                color: "#888888",
                textAlign: "center",
                padding: "4px",
                lineHeight: "1.3",
                boxSizing: "border-box",
              }}
            >
              Recent Coloured Photograph of Candidate
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BLUE CONTACT BAR with SVG icons
          ══════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: "#3b6bc7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 16px",
          gap: "6px",
        }}
      >
        {/* LinkedIn */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <IconBox path={linkedinPath} />
          <span
            style={{
              fontSize: "10.5px",
              color: "#ffffff",
              wordBreak: "break-all",
            }}
          >
            {linkedin || "LinkedIn"}
          </span>
        </div>

        {/* Mobile */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <IconBox path={phonePath} />
          <span style={{ fontSize: "10.5px", color: "#ffffff" }}>
            {mobile || "Mobile No."}
          </span>
        </div>

        {/* Email */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <IconBox path={emailPath} />
          <span
            style={{
              fontSize: "10.5px",
              color: "#ffffff",
              wordBreak: "break-all",
            }}
          >
            {email || "Email ID"}
          </span>
        </div>

        {/* Twitter */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <IconBox path={twitterPath} />
          <span
            style={{
              fontSize: "10.5px",
              color: "#ffffff",
              wordBreak: "break-all",
            }}
          >
            {twitter || "Twitter"}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BODY — Two columns
          Left: Academic Qualifications + Skills
          Right: Work Experience
          ══════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderBottom: "1px solid #bbbbbb",
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            width: "52%",
            borderRight: "1px solid #bbbbbb",
            boxSizing: "border-box",
          }}
        >
          {/* Academic Qualifications */}
          <SectionHeading title="Academic Qualifications" />
          <div
            className="tint-body"
            style={{ padding: "0 10px 10px 10px" }}
            dangerouslySetInnerHTML={{
              __html:
                education ||
                "<p style='color:#888;font-size:11px;'>No education entries yet.</p>",
            }}
          />

          {/* Skills — two sub-columns inside left column */}
          <div
            style={{
              backgroundColor: "#dce8f5",
              borderTop: "1px solid #aaaaaa",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  borderRight: "1px solid #aaaaaa",
                  padding: "6px 10px 10px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    fontVariant: "small-caps",
                    marginBottom: "6px",
                    color: "#1a1a1a",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  Skills
                </div>
                <div
                  className="tint-body"
                  dangerouslySetInnerHTML={{ __html: skills || "" }}
                />
              </div>
              <div style={{ flex: 1, padding: "6px 10px 10px 10px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    fontVariant: "small-caps",
                    marginBottom: "6px",
                    color: "#1a1a1a",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  Skills
                </div>
                <div
                  className="tint-body"
                  dangerouslySetInnerHTML={{ __html: skills || "" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Work Experience */}
        <div
          style={{
            width: "48%",
            boxSizing: "border-box",
          }}
        >
          <SectionHeading title="Work Experience / Internship" />
          <div
            className="tint-body"
            style={{ padding: "0 10px 10px 10px" }}
            dangerouslySetInnerHTML={{
              __html:
                experience ||
                "<p style='color:#888;font-size:11px;'>No experience entries yet.</p>",
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PROJECTS — Full width
          ══════════════════════════════════════════════════ */}
      <div>
        <SectionHeading title="Projects" />
        <div
          className="tint-body"
          style={{ padding: "0 12px 12px 12px" }}
          dangerouslySetInnerHTML={{
            __html:
              projects ||
              "<p style='color:#888;font-size:11px;'>No project entries yet.</p>",
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          FOOTER — Place/Date | Signature
          ══════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "1px solid #bbbbbb",
          padding: "10px 16px",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            border: "1px solid #bbbbbb",
            padding: "8px 24px 8px 10px",
            minWidth: "150px",
            fontSize: "11.5px",
          }}
        >
          <div>Place: _______________</div>
          <div style={{ marginTop: "6px" }}>Date: ________________</div>
        </div>
        <div
          style={{
            border: "1px solid #bbbbbb",
            padding: "8px 24px",
            minWidth: "200px",
            textAlign: "center",
            fontSize: "11.5px",
          }}
        >
          Signature of the Candidate
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          GLOBAL STYLES
          ══════════════════════════════════════════════════ */}
      <style>{`
        .tint-body p {
          margin: 3px 0 5px 0 !important;
          font-size: 11.5px !important;
          color: #1a1a1a !important;
          font-family: 'Times New Roman', Times, serif !important;
        }
        .tint-body h2 {
          font-size: 12px !important;
          font-weight: bold !important;
          color: #1a1a1a !important;
          margin: 8px 0 2px 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          font-family: 'Times New Roman', Times, serif !important;
          font-variant: normal !important;
        }
        .tint-body h3 {
          font-size: 12px !important;
          font-weight: bold !important;
          color: #1a1a1a !important;
          margin: 8px 0 2px 0 !important;
          padding: 0 !important;
          font-family: 'Times New Roman', Times, serif !important;
        }
        .tint-body ul, .tint-body ol {
          padding-left: 16px !important;
          margin: 3px 0 6px 0 !important;
        }
        .tint-body li {
          font-size: 11.5px !important;
          color: #1a1a1a !important;
          margin-bottom: 2px !important;
          font-family: 'Times New Roman', Times, serif !important;
        }
        .tint-body strong, .tint-body b {
          font-weight: bold !important;
          color: #1a1a1a !important;
          display: inline !important;
        }
        .tint-body a {
          color: #1a1a1a !important;
          text-decoration: underline !important;
        }
        .tint-body hr {
          border: none !important;
          border-top: 1px solid #cccccc !important;
          margin: 6px 0 !important;
        }
      `}</style>
    </div>
  );
};

export default TintTemplate;
