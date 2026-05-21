import { useState, useEffect, useCallback } from "react";
import { NAV_LINKS, DONATE_BUTTON, SKIP_LINK_TEXT } from "@/data/navigationContent";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

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
          className="px-3 sm:px-6 lg:px-10 flex items-center justify-between"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "clamp(56px, 10vw, 72px)",
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
              className="h-7 sm:h-9 lg:h-11 w-auto block"
              style={{
                filter: logoFilter,
                transition: "filter 0.3s ease",
              }}
            />
          </a>

          {/* Center nav links — always visible */}
          <div
            className="flex-1 flex items-center justify-center min-w-0 gap-2 sm:gap-4 lg:gap-6"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="museum-focus-visible whitespace-nowrap text-[10px] sm:text-xs lg:text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  color: textColor,
                  textDecoration: "none",
                  padding: "4px 2px",
                  borderBottom: "2px solid transparent",
                  transition: "color 0.2s ease, border-color 0.2s ease",
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
          </div>

          {/* Right section — Donate CTA */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <a
              href={DONATE_BUTTON.href}
              className="museum-focus-visible flex-shrink-0 whitespace-nowrap px-3 py-1 text-[10px] font-semibold sm:px-5 sm:py-2 sm:text-sm"
              style={{
                fontFamily: "var(--font-body)",
                letterSpacing: "0.04em",
                color: "#FFFFFF",
                textDecoration: "none",
                background: "#E8871A",
                borderRadius: "100px",
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s ease, transform 0.15s ease",
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
        </div>
      </nav>
    </>
  );
}
