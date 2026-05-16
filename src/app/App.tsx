import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { CulturalGrid } from "./components/CulturalGrid";
import { IndiaAmerica } from "./components/IndiaAmerica";
import { Events } from "./components/Events";
import { DonationStrip } from "./components/DonationStrip";
import { Visit } from "./components/Visit";
import { Leadership } from "./components/Leadership";
import { Footer } from "./components/Footer";
import ExhibitionGallery from "@/pages/ExhibitionGallery";
import DonationSuccess from "@/pages/DonationSuccess";
import DonationCancel from "@/pages/DonationCancel";
import Admin from "@/pages/Admin";

const DARK_MODE_KEY = "imhsri-dark-mode";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved !== null) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.style.setProperty("--background", "#0D1433");
      root.style.setProperty("--foreground", "#F5F0E8");
    } else {
      root.classList.remove("dark");
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
    }
  }, [darkMode]);

  useEffect(() => {
    // Listen for OS theme changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if no explicit localStorage preference
      if (localStorage.getItem(DARK_MODE_KEY) === null) {
        setDarkMode(e.matches);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Scroll progress + back-to-top visibility
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollProgress(progress);
    setShowBackToTop(scrollTop > 200);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Section fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("museum-section-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    // Observe all direct children sections of main
    const sections = mainRef.current?.querySelectorAll(":scope > section, :scope > *[id]");
    sections?.forEach((section) => {
      section.classList.add("museum-section-animate");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const toggleDark = () => setDarkMode((prev) => !prev);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Routes>
      {/* Exhibition Gallery page */}
      <Route path="/exhibitions/:category" element={<ExhibitionGallery />} />

      {/* Donation result pages */}
      <Route path="/donation/success" element={<DonationSuccess />} />
      <Route path="/donation/cancel" element={<DonationCancel />} />

      {/* Admin panel */}
      <Route path="/admin/*" element={<Admin />} />

      {/* Home page — existing layout, fully intact */}
      <Route
        path="/"
        element={
          <div
            style={{
              fontFamily: "var(--font-body)",
              background: darkMode ? "#0D1433" : "#FDFAF5",
              color: darkMode ? "#F5F0E8" : "#1C1C1E",
              minHeight: "100vh",
              transition: "background 0.3s ease, color 0.3s ease",
              position: "relative",
              width: "100%",
              maxWidth: "100vw",
            }}
          >
            {/* Scroll Progress Indicator */}
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "3px",
                width: `${scrollProgress}%`,
                background: "#F7931E",
                zIndex: 9999,
                transition: "width 0.1s linear",
              }}
            />

            {/* Navigation */}
            <Navigation darkMode={darkMode} onToggleDark={toggleDark} />

            {/* Main content */}
            <main id="main-content" ref={mainRef}>
              {/* 1. Hero */}
              <Hero darkMode={darkMode} />

              {/* 2. Cultural Grid — The Many Indias */}
              <CulturalGrid darkMode={darkMode} />

              {/* 3. India & America editorial section */}
              <IndiaAmerica darkMode={darkMode} />

              {/* 4. Events */}
              <Events darkMode={darkMode} />

              {/* 5. Donation Strip */}
              <DonationStrip darkMode={darkMode} />

              {/* 6. Visit */}
              <Visit darkMode={darkMode} />

              {/* 7. Leadership */}
              <Leadership darkMode={darkMode} />
            </main>

            {/* Footer */}
            <Footer darkMode={darkMode} />

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="museum-focus-visible"
              style={{
                position: "fixed",
                bottom: "clamp(1.5rem, 4vw, 2.5rem)",
                right: "clamp(1.5rem, 4vw, 2.5rem)",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#1B2A6B",
                color: "#C9A84C",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(27,42,107,0.35)",
                zIndex: 90,
                opacity: showBackToTop ? 1 : 0,
                pointerEvents: showBackToTop ? "auto" : "none",
                transform: showBackToTop ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        }
      />
    </Routes>
  );
}