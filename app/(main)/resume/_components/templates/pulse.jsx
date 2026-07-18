const PulseTemplate = ({ content, profileImage, userName, contactInfo }) => {
  return (
    <div
      style={{
        fontFamily: "'Century Gothic', 'Gill Sans', 'Trebuchet MS', sans-serif",
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#1a1a2e",
        backgroundColor: "#ffffff",
        maxWidth: "794px",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Top heartbeat bar */}
      <div
        style={{
          height: "4px",
          backgroundColor: "#e11d48",
          position: "relative",
          overflow: "visible",
        }}
      />

      {/* Heartbeat SVG strip */}
      <div
        style={{
          backgroundColor: "#fff0f3",
          padding: "6px 44px",
          borderBottom: "1px solid #fecdd3",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 700 28"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "28px", display: "block" }}
          preserveAspectRatio="none"
        >
          {/* Flat baseline with heartbeat spike */}
          <polyline
            points="
              0,14
              60,14
              80,14
              90,4
              100,24
              110,2
              120,22
              130,14
              150,14
              220,14
              280,14
              330,14
              370,14
              390,4
              400,24
              410,2
              420,22
              430,14
              450,14
              520,14
              580,14
              630,14
              650,4
              660,24
              670,2
              680,22
              690,14
              700,14
            "
            fill="none"
            stroke="#e11d48"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Glow duplicate */}
          <polyline
            points="
              0,14
              60,14
              80,14
              90,4
              100,24
              110,2
              120,22
              130,14
              150,14
              220,14
              280,14
              330,14
              370,14
              390,4
              400,24
              410,2
              420,22
              430,14
              450,14
              520,14
              580,14
              630,14
              650,4
              660,24
              670,2
              680,22
              690,14
              700,14
            "
            fill="none"
            stroke="#fb7185"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px 44px 24px 44px",
          borderBottom: "1px solid #fecdd3",
          display: "flex",
          alignItems: "center",
          gap: "28px",
          position: "relative",
        }}
      >
        {/* Red cross decoration top-right */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "44px",
            opacity: 0.08,
          }}
        >
          <div style={{ position: "relative", width: "32px", height: "32px" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "10px",
                backgroundColor: "#e11d48",
                transform: "translateY(-50%)",
                borderRadius: "2px",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "10px",
                backgroundColor: "#e11d48",
                transform: "translateX(-50%)",
                borderRadius: "2px",
              }}
            />
          </div>
        </div>

        {/* Profile Image */}
        {profileImage && (
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: "108px",
                height: "108px",
                borderRadius: "50%",
                padding: "3px",
                background: "linear-gradient(135deg, #e11d48, #fb7185, #fda4af)",
                boxSizing: "border-box",
                boxShadow: "0 4px 20px rgba(225,29,72,0.2)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: "#fff0f3",
                  padding: "2px",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Name & Contact */}
        <div style={{ flex: 1 }}>
          {/* Pulse label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#e11d48",
                boxShadow: "0 0 0 2px #fecdd3",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#e11d48",
                fontWeight: "600",
              }}
            >
              Curriculum Vitae
            </span>
          </div>

          {userName && (
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                margin: "0 0 6px 0",
                color: "#1a1a2e",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                lineHeight: "1.2",
                fontFamily: "'Century Gothic', 'Gill Sans', 'Trebuchet MS', sans-serif",
              }}
            >
              {userName}
            </h1>
          )}

          {/* Red accent line */}
          <div
            style={{
              height: "2px",
              width: "80px",
              background: "linear-gradient(90deg, #e11d48, #fda4af, transparent)",
              margin: "8px 0",
              borderRadius: "2px",
            }}
          />

          {contactInfo && (
            <div
              style={{
                fontSize: "11px",
                color: "#6b7280",
                letterSpacing: "0.5px",
                lineHeight: "2",
                fontFamily: "'Century Gothic', 'Trebuchet MS', sans-serif",
              }}
            >
              {contactInfo}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: "30px 44px 44px 44px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#1a1a2e",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom heartbeat strip */}
      <div
        style={{
          backgroundColor: "#fff0f3",
          padding: "6px 44px",
          borderTop: "1px solid #fecdd3",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 700 20"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "20px", display: "block" }}
          preserveAspectRatio="none"
        >
          <polyline
            points="
              0,10 80,10 95,3 105,17 115,1 125,18 135,10 200,10
              300,10 370,10 385,3 395,17 405,1 415,18 425,10 500,10
              580,10 620,10 635,3 645,17 655,1 665,18 675,10 700,10
            "
            fill="none"
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Bottom red bar */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #e11d48, #fb7185, #e11d48)",
        }}
      />

      <style>{`
        h2 {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 4px !important;
          color: #e11d48 !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
          margin-top: 28px !important;
          margin-bottom: 12px !important;
          font-family: 'Century Gothic', 'Gill Sans', 'Trebuchet MS', sans-serif !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }
        h2::before {
          content: '' !important;
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #e11d48 !important;
          box-shadow: 0 0 0 2px #fecdd3 !important;
          flex-shrink: 0 !important;
        }
        h2::after {
          content: '' !important;
          display: block !important;
          flex: 1 !important;
          height: 1px !important;
          background: linear-gradient(90deg, #fecdd3, transparent) !important;
          margin-left: 6px !important;
        }
        h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          margin-top: 14px !important;
          margin-bottom: 2px !important;
          color: #1a1a2e !important;
          font-family: 'Century Gothic', 'Gill Sans', 'Trebuchet MS', sans-serif !important;
          letter-spacing: 0.3px !important;
        }
        p {
          margin: 3px 0 8px 0 !important;
          color: #4b5563 !important;
          font-family: 'Century Gothic', 'Trebuchet MS', sans-serif !important;
        }
        strong, b {
          font-weight: 700 !important;
          display: inline !important;
          color: #1a1a2e !important;
        }
        ul, ol {
          padding-left: 16px !important;
          margin: 4px 0 10px 0 !important;
        }
        li {
          margin-bottom: 4px !important;
          color: #4b5563 !important;
          font-family: 'Century Gothic', 'Trebuchet MS', sans-serif !important;
          list-style-type: none !important;
          padding-left: 16px !important;
          position: relative !important;
        }
        li::before {
          content: '' !important;
          position: absolute !important;
          left: 2px !important;
          top: 7px !important;
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          background-color: #fda4af !important;
          border: 1.5px solid #e11d48 !important;
        }
        a {
          color: #e11d48 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #fecdd3 !important;
        }
        hr {
          border: none !important;
          border-top: 1px solid #fecdd3 !important;
          margin: 10px 0 !important;
        }
        div[align="center"] {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default PulseTemplate;