import {
  FOOTER_TAGLINE_SECONDARY,
  FOOTER_DESCRIPTION,
  COPYRIGHT_TEMPLATE,
} from "@/data/footerContent";

interface FooterProps {
  darkMode: boolean;
}

export function Footer({ darkMode }: FooterProps) {
  const bg = "#0D1433";
  const textSecondary = "#8E8EA0";

  const copyrightText = COPYRIGHT_TEMPLATE.replace("{{year}}", String(new Date().getFullYear()));

  return (
    <footer
      role="contentinfo"
      style={{
        background: bg,
        color: "#F5F0E8",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Gold top accent */}
      <div style={{
        height: "3px",
        background: "linear-gradient(90deg, transparent, #C9A84C, #E8871A, #C9A84C, transparent)",
      }} />

      {/* Centered branding composition */}
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "clamp(3rem, 7vw, 4.5rem) clamp(1.25rem, 5vw, 4rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "0",
        }}
      >
        {/* Logo — original colors, no filter */}
        <a
          href="#"
          aria-label="India Museum and Heritage Society of Rhode Island — Back to top"
          style={{ display: "inline-block", marginBottom: "clamp(1.75rem, 5vw, 2.75rem)", textDecoration: "none" }}
        >
          <img
            src="/images/logo.png"
            alt="India Museum and Heritage Society of Rhode Island logo"
            style={{
              height: "clamp(140px, 25vw, 240px)",
              width: "auto",
              display: "block",
            }}
          />
        </a>

        {/* Copyright */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.8125rem",
          color: "rgba(245,240,232,0.55)",
          margin: "0 0 10px",
          letterSpacing: "0.01em",
        }}>
          {copyrightText}
        </p>

        {/* Tagline — gold italic, most prominent */}
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.85rem, 2vw, 0.9375rem)",
          fontStyle: "italic",
          color: "#C9A84C",
          margin: "0 0 12px",
          lineHeight: 1.55,
          fontWeight: 500,
        }}>
          {FOOTER_TAGLINE_SECONDARY}
        </p>

        {/* Description — softest, most understated */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          lineHeight: 1.65,
          color: textSecondary,
          margin: 0,
          maxWidth: "420px",
        }}>
          {FOOTER_DESCRIPTION}
        </p>
      </div>
    </footer>
  );
}
