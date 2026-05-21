import { useEffect, useState } from "react";
import { HERO_CONTENT } from "@/data/heroContent";

export function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="main-content"
      role="banner"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 clamp(1.25rem, 5vw, 4rem)",
        paddingTop: "calc(72px + env(safe-area-inset-top, 0px))",
        paddingBottom: "clamp(2rem, 6vw, 3.5rem)",
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/images/museum-hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
        }}
        role="presentation"
        aria-hidden="true"
      />

      {/* Overlay gradient — rich indigo to transparent */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            160deg,
            rgba(13, 20, 51, 0.88) 0%,
            rgba(27, 42, 107, 0.72) 40%,
            rgba(27, 42, 107, 0.50) 70%,
            rgba(13, 20, 51, 0.78) 100%
          )`,
        }}
      />

      {/* Gold accent line top */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, transparent, #C9A84C, #E8871A, #C9A84C, transparent)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "800px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(1.5rem, 3vw, 2rem)",
        }}
      >
        {/* Overline */}
        <div
          className={visible ? "museum-animate-fade-in" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-overline)",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#C9A84C",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ display: "inline-block", width: "32px", height: "1px", background: "#C9A84C" }} />
          {HERO_CONTENT.overline}
          <span style={{ display: "inline-block", width: "32px", height: "1px", background: "#C9A84C" }} />
        </div>

        {/* Hero Headline */}
        <h1
          className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-hero)",
            fontWeight: 600,
            lineHeight: 1.18,
            color: "#FFFFFF",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {HERO_CONTENT.headlinePart1}
          <br />
          <em style={{ fontStyle: "italic", color: "#F0D080" }}>{HERO_CONTENT.headlineItalic}</em>
        </h1>

        {/* Intro paragraphs */}
        <div
          className={visible ? "museum-animate-fade-in-up museum-delay-200" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-lg)",
            lineHeight: 1.65,
            color: "rgba(245, 240, 232, 0.88)",
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {HERO_CONTENT.introParagraphs.map((para, idx) => (
            <p key={idx} style={{ margin: 0 }}>{para}</p>
          ))}

          {/* Editorial closing line */}
          <p
            style={{
              margin: 0,
              marginTop: "6px",
              fontStyle: "italic",
              color: "#F0D080",
              fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
              lineHeight: 1.6,
            }}
          >
            {HERO_CONTENT.closingLine}
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className={visible ? "museum-animate-fade-in-up museum-delay-300" : "museum-reveal"}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(0.75rem, 2vw, 1rem)",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* Primary CTA */}
          <a
            href={HERO_CONTENT.primaryCTA.href}
            className="museum-focus-visible"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: "#FFFFFF",
              textDecoration: "none",
              background: "#E8871A",
              padding: "15px 32px",
              borderRadius: "100px",
              minHeight: "52px",
              minWidth: "180px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease, transform 0.15s ease",
              boxShadow: "0 4px 20px rgba(232, 135, 26, 0.35)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#D4780F";
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#E8871A";
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
            }}
          >
            {HERO_CONTENT.primaryCTA.label}
          </a>

          {/* Secondary CTA */}
          <a
            href={HERO_CONTENT.secondaryCTA.href}
            className="museum-focus-visible"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: "#FFFFFF",
              textDecoration: "none",
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.45)",
              padding: "14px 32px",
              borderRadius: "100px",
              minHeight: "52px",
              minWidth: "160px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
            }}
          >
            {HERO_CONTENT.secondaryCTA.label}
          </a>
        </div>

        {/* Feature highlights */}
        <div
          className={visible ? "museum-animate-fade-in-up museum-delay-400" : "museum-reveal"}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(1.5rem, 4vw, 3rem)",
            justifyContent: "center",
            marginTop: "clamp(1rem, 3vw, 2rem)",
            paddingTop: "clamp(1rem, 3vw, 2rem)",
            borderTop: "1px solid rgba(201, 168, 76, 0.25)",
            width: "100%",
          }}
        >
          {HERO_CONTENT.features.map((feature, idx) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: "clamp(1.5rem, 4vw, 3rem)" }}>
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    width: "1px",
                    height: "28px",
                    background: "rgba(201,168,76,0.35)",
                    flexShrink: 0,
                  }}
                />
              )}
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-caption)",
                fontWeight: 500,
                color: "rgba(245,240,232,0.75)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gold accent line bottom */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />
    </section>
  );
}
