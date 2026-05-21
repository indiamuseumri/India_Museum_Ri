import { useState } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import { DONATION_CONTENT } from "@/data/donationContent";
import toast from "react-hot-toast";

// TODO: Connected to Stripe checkout session
// API: POST /api/create-checkout-session
// Donations stored in Supabase donations table

export function DonationStrip() {
  const { ref: sectionRef, visible } = useIntersection(0.2);
  const [selected, setSelected] = useState(DONATION_CONTENT.defaultSelected);
  const [customAmount, setCustomAmount] = useState("");
  const [donating, setDonating] = useState(false);

  const getAmount = (): number => {
    if (selected === "Other") {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return parseInt(selected.replace('$', ''), 10);
  };

  const handleDonate = async () => {
    const selectedAmount = getAmount();
    if (!selectedAmount || selectedAmount <= 0) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }
    if (selectedAmount > 10000) {
      toast.error('Maximum donation amount is $10,000');
      return;
    }

    setDonating(true);

    try {

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(selectedAmount) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DONATION] API error:', errorData);
        throw new Error(
          errorData.error || `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.url) {
        console.error('[DONATION] No URL in response:', data);
        throw new Error('No checkout URL received from server');
      }

      window.location.href = data.url;

    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('[DONATION] Error:', err?.message || error);
      toast.error(
        err?.message || 'Unable to start donation. Please try again.'
      );
      setDonating(false);
      // Note: setDonating(false) only on error
      // On success user is redirected — no reset needed
    }
  };

  return (
    <section
      id="donate"
      ref={sectionRef}
      style={{
        background: `linear-gradient(135deg, #1B2A6B 0%, #0D1B42 60%, #15236B 100%)`,
        padding: "var(--section-pad-y) clamp(1.25rem, 5vw, 4rem)",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Support the museum"
    >
      {/* Decorative pattern */}
      <div aria-hidden="true" style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(232,135,26,0.08) 0%, transparent 50%),
                          radial-gradient(circle at 80% 50%, rgba(0,107,143,0.1) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      {/* Gold top border */}
      <div aria-hidden="true" style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, transparent, #C9A84C, #E8871A, #C9A84C, transparent)",
      }} />

      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Lotus icon */}
        <div
          className={visible ? "museum-animate-fade-in" : "museum-reveal"}
          aria-hidden="true"
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            lineHeight: 1,
          }}
        >
          🪷
        </div>

        {/* Headline */}
        <h2
          className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h1)",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "#FFFFFF",
            margin: "0 0 16px",
          }}
        >
          {DONATION_CONTENT.headlinePart1}
          <br />
          <em style={{ fontStyle: "italic", color: "#F0D080" }}>{DONATION_CONTENT.headlineItalic}</em>
        </h2>

        {/* Description */}
        <p
          className={visible ? "museum-animate-fade-in-up museum-delay-200" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-lg)",
            lineHeight: 1.7,
            color: "rgba(245,240,232,0.82)",
            margin: "0 0 36px",
          }}
        >
          {DONATION_CONTENT.description}
        </p>

        {/* Amount selector */}
        <div
          className={visible ? "museum-animate-fade-in-up museum-delay-300" : "museum-reveal"}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(8px, 3vw, 16px)",
            justifyContent: "center",
            marginBottom: "16px",
          }}
          role="group"
          aria-label="Select donation amount"
        >
          {DONATION_CONTENT.amounts.map((amount) => (
            <button
              key={amount}
              className="museum-focus-visible"
              aria-pressed={selected === amount}
              onClick={() => setSelected(amount)}
              style={{
                background: selected === amount ? "#F7931E" : "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                border: selected === amount ? "2px solid #F7931E" : "2px solid rgba(255,255,255,0.25)",
                padding: "10px 22px",
                borderRadius: "100px",
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                fontWeight: selected === amount ? 700 : 500,
                cursor: "pointer",
                minHeight: "48px",
                minWidth: "60px",
                transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
                transform: selected === amount ? "scale(1.04)" : "scale(1)",
              }}
            >
              {amount}
            </button>
          ))}
        </div>

        {/* Custom amount input — visible when "Other" selected */}
        {selected === "Other" && (
          <div
            className="museum-animate-fade-in"
            style={{
              marginBottom: "24px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", maxWidth: "200px", width: "100%" }}>
              <span style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(245,240,232,0.6)",
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                fontWeight: 600,
              }}>$</span>
              <input
                type="number"
                min="1"
                placeholder="Amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                aria-label="Custom donation amount in dollars"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 32px",
                  borderRadius: "100px",
                  border: "2px solid #F7931E",
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textAlign: "center",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className={visible ? "museum-animate-fade-in-up museum-delay-400" : "museum-reveal"}>
          <button
            onClick={handleDonate}
            disabled={donating}
            className="museum-focus-visible"
            aria-label={`Donate ${selected !== "Other" ? selected : (customAmount ? `$${customAmount}` : "now")}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: donating ? "#B06A14" : "#E8871A",
              color: "#FFFFFF",
              border: "none",
              padding: "16px clamp(24px, 6vw, 40px)",
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontSize: "1.0625rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              minHeight: "56px",
              boxShadow: "0 4px 24px rgba(232,135,26,0.4)",
              cursor: donating ? "wait" : "pointer",
              transition: "background 0.2s ease, transform 0.15s ease",
              opacity: donating ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!donating) {
                (e.currentTarget as HTMLButtonElement).style.background = "#D4780F";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!donating) {
                (e.currentTarget as HTMLButtonElement).style.background = "#E8871A";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }
            }}
          >
            {donating ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
            {donating ? "Processing…" : `${DONATION_CONTENT.ctaLabel} ${selected !== "Other" ? selected : (customAmount ? `$${customAmount}` : "Now")}`}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Trust line */}
        <p
          className={visible ? "museum-animate-fade-in museum-delay-500" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-caption)",
            color: "rgba(245,240,232,0.5)",
            margin: "20px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {DONATION_CONTENT.trustLine}
        </p>
      </div>
    </section>
  );
}
