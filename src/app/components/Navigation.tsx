import { useState, useEffect, useCallback } from "react";
import { NAV_LINKS, DONATE_BUTTON, SKIP_LINK_TEXT } from "@/data/navigationContent";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const navBg = scrolled ? "rgba(253,250,245,0.96)" : "transparent";
  const navBorder = scrolled ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent";
  const textColor = scrolled ? "#1C1C1E" : "#FFFFFF";
  const logoFilter = scrolled ? "none" : "brightness(0) invert(1)";

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="museum-focus-visible"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "1rem",
          zIndex: 9999,
          background: "#1B2A6B",
          color: "#FFFFFF",
          padding: "8px 16px",
          borderRadius: "6px",
          fontFamily: "var(--font-body)",
        }}
        onFocus={(e) => { e.currentTarget.style.left = "1rem"; }}
        onBlur={(e) => { e.currentTarget.style.left = "-9999px"; }}
      >
        {SKIP_LINK_TEXT}
      </a>

      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: scrolled ? "saturate(180%)" : "none",
          transition: "background 0.3s ease, border-color 0.3s ease",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div
          className="px-4 md:px-8 flex items-center justify-between"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "clamp(64px, 10vw, 72px)",
          }}
        >
          {/* Logo */}
          <a
            href="#"
            aria-label="India Museum and Heritage Society of Rhode Island — Home"
            className="museum-focus-visible flex items-center shrink-0 no-underline"
          >
            <img
              src="/images/logo.png"
              alt="India Museum and Heritage Society of Rhode Island logo featuring a multicolored lotus symbol"
              className="h-[40px] md:h-[56px] w-auto block"
              style={{
                filter: logoFilter,
                transition: "filter 0.3s ease",
              }}
            />
          </a>

          {/* Desktop Nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(1rem, 3vw, 2rem)",
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="museum-focus-visible"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  color: textColor,
                  textDecoration: "none",
                  padding: "4px 2px",
                  borderBottom: "2px solid transparent",
                  transition: "color 0.2s ease, border-color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "#E8871A";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}

            {/* Donate CTA */}
            <a
              href={DONATE_BUTTON.href}
              className="museum-focus-visible"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "#FFFFFF",
                textDecoration: "none",
                background: "#E8871A",
                padding: "10px 22px",
                borderRadius: "100px",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s ease, transform 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#D4780F";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#E8871A";
              }}
            >
              {DONATE_BUTTON.label}
            </a>
          </div>

          {/* Mobile controls — hamburger retained for mobile navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              className="museum-focus-visible"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: textColor,
                padding: "10px",
                borderRadius: "8px",
                minWidth: "44px",
                minHeight: "44px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                transition: "opacity 0.2s ease",
              }}
            >
              <span style={{
                display: "block", width: "22px", height: "2px",
                background: "currentColor", borderRadius: "2px",
                transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                transition: "transform 0.25s ease",
              }} />
              <span style={{
                display: "block", width: "22px", height: "2px",
                background: "currentColor", borderRadius: "2px",
                opacity: mobileOpen ? 0 : 1,
                transition: "opacity 0.2s ease",
              }} />
              <span style={{
                display: "block", width: "22px", height: "2px",
                background: "currentColor", borderRadius: "2px",
                transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                transition: "transform 0.25s ease",
              }} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="museum-animate-slide-down md:hidden"
            style={{
              background: "rgba(253,250,245,0.98)",
              borderTop: `1px solid rgba(201,168,76,0.2)`,
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
            }}
          >
            <div className="px-4 py-4 flex flex-col gap-1 md:px-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="museum-focus-visible"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1.0625rem",
                    fontWeight: 500,
                    color: "#1C1C1E",
                    textDecoration: "none",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    minHeight: "44px",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={DONATE_BUTTON.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  marginTop: "8px",
                  background: "#E8871A",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "14px 24px",
                  borderRadius: "100px",
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textAlign: "center",
                  minHeight: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {DONATE_BUTTON.label}
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
