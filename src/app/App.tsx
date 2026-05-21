import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { CulturalGrid } from "./components/CulturalGrid";
import { IndiaAmerica } from "./components/IndiaAmerica";
import { Events } from "./components/Events";
import { DonationStrip } from "./components/DonationStrip";
import { Visit } from "./components/Visit";
import { Leadership } from "./components/Leadership";
import { Footer } from "./components/Footer";
import { PaymentNotification } from "./components/PaymentNotification";
import ExhibitionGallery from "@/pages/ExhibitionGallery";
import DonationSuccess from "@/pages/DonationSuccess";
import DonationCancel from "@/pages/DonationCancel";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Routes>
      {/* Exhibition Gallery page */}
      <Route path="/exhibitions/:category" element={<ExhibitionGallery />} />

      {/* Donation result pages — redirect to homepage with query param */}
      <Route path="/donation/success" element={<DonationSuccess />} />
      <Route path="/donation/cancel" element={<DonationCancel />} />

      {/* Admin panel */}
      <Route path="/admin/*" element={<Admin />} />

      {/* Home page */}
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Payment popup state
  const [searchParams] = useSearchParams();
  const [paymentPopup, setPaymentPopup] = useState<"success" | "cancel" | null>(null);

  // Read payment query param on mount
  useEffect(() => {
    const paymentParam = searchParams.get("payment");
    if (paymentParam === "success") {
      setPaymentPopup("success");
      window.history.replaceState({}, "", "/");
    } else if (paymentParam === "cancelled") {
      setPaymentPopup("cancel");
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        background: "#FDFAF5",
        color: "#1C1C1E",
        minHeight: "100vh",
        position: "relative",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      {/* Payment status popup */}
      {paymentPopup && (
        <PaymentNotification
          type={paymentPopup}
          onDismiss={() => setPaymentPopup(null)}
        />
      )}

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
      <Navigation />

      {/* Main content */}
      <main id="main-content" ref={mainRef}>
        {/* 1. Hero */}
        <Hero />

        {/* 2. Cultural Grid — The Many Indias */}
        <CulturalGrid />

        {/* 3. India & America editorial section */}
        <IndiaAmerica />

        {/* 4. Events */}
        <Events />

        {/* 5. Donation Strip */}
        <DonationStrip />

        {/* 6. Visit */}
        <Visit />

        {/* 7. Leadership */}
        <Leadership />
      </main>

      {/* Footer */}
      <Footer />

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
  );
}