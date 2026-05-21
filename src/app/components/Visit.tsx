import { useIntersection } from "@/hooks/useIntersection";
import {
  VISIT_HEADER,
  MAP_LABEL,
  MAP_LOCATION,
  MAP_URL,
  MAP_DIRECTIONS_LABEL,
} from "@/data/visitContent";

export function Visit() {
  const { ref: sectionRef, visible } = useIntersection(0.12);

  const bg = "#F2EDE2";
  const surface = "#FFFFFF";
  const textPrimary = "#1C1C1E";
  const textSecondary = "#48484A";
  const mapBg = "#E8E4DC";

  return (
    <section
      id="visit"
      ref={sectionRef}
      style={{
        background: bg,
        padding: "var(--section-pad-y) clamp(1.25rem, 5vw, 4rem)",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(2rem, 5vw, 3.5rem)" }}>
          <div
            className={visible ? "museum-animate-fade-in" : "museum-reveal"}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-overline)",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#E8871A",
              marginBottom: "12px",
            }}
          >
            {VISIT_HEADER.overline}
          </div>
          <h2
            className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h1)",
              fontWeight: 600,
              lineHeight: 1.2,
              color: textPrimary,
              margin: 0,
            }}
          >
            {VISIT_HEADER.headlinePart1}
            <br />
            <em style={{ fontStyle: "italic", color: "#C9A84C" }}>{VISIT_HEADER.headlineItalic}</em>
          </h2>
        </div>

        {/* Main grid: map + info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "clamp(1.5rem, 4vw, 3rem)",
          }}
        >
          {/* Map placeholder */}
          <div
            className={visible ? "museum-animate-fade-in-up" : "museum-reveal"}
            style={{
              borderRadius: "var(--card-radius)",
              overflow: "hidden",
              minHeight: "320px",
              background: mapBg,
              position: "relative",
              boxShadow: "0 4px 24px rgba(27,42,107,0.1)", display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "16px",
            }}
            aria-label="Interactive map — loading"
          /* TODO: Add Google Maps embed API key */
          >
            {/* Grid pattern */}
            <div aria-hidden="true" style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }} />
            <div style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#E8871A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(232,135,26,0.4)",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: textPrimary,
              }}>
                {MAP_LABEL}
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-caption)",
                color: textSecondary,
                textAlign: "center",
              }}>
                {MAP_LOCATION}
              </div>
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="museum-focus-visible"
                style={{
                  marginTop: "8px",
                  background: "#1B2A6B",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "10px 22px",
                  borderRadius: "100px",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {MAP_DIRECTIONS_LABEL}
              </a>
            </div>
          </div>

          {/* Info column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(1rem, 2.5vw, 1.5rem)", height: "100%" }}>
            {/* Visit by Appointment Card */}
            <div
              className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
              style={{
                background: surface,
                borderRadius: "var(--card-radius)",
                padding: "clamp(2rem, 5vw, 3.5rem)",
                boxShadow: "0 2px 12px rgba(27,42,107,0.07)", display: "flex",
                flexDirection: "column",
                gap: "32px",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  marginBottom: "16px",
                }}>
                  VISIT BY APPOINTMENT
                </div>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.9375rem, 2vw, 1rem)",
                  lineHeight: 1.75,
                  color: textSecondary,
                  margin: 0,
                }}>
                  The India Museum and Heritage Society of Rhode Island welcomes visitors through scheduled appointments, private cultural visits, and community engagements. We invite guests, students, artists, historians, and cultural enthusiasts to experience India's living heritage in a warm and personal setting.
                </p>
              </div>

              <div style={{
                height: "1px",
                background: "rgba(0,0,0,0.06)",
                width: "100%",
              }} />

              <div>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  color: textPrimary,
                  margin: "0 0 16px",
                }}>
                  Contact Information
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <a href="mailto:Prof1049@aol.com" style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: textPrimary,
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    display: "inline-block",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#E8871A"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textPrimary; }}>
                    Prof1049@aol.com
                  </a>
                  <a href="tel:+14013682277" style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: textPrimary,
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    display: "inline-block",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#E8871A"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textPrimary; }}>
                    +1 (401) 368-2277
                  </a>
                </div>

                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontStyle: "italic",
                  color: "#C9A84C",
                  margin: "24px 0 0 0",
                }}>
                  We look forward to welcoming you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
