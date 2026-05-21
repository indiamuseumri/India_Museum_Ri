import { useEffect, useState } from "react";

interface PaymentNotificationProps {
  type: "success" | "cancel";
  onDismiss: () => void;
}

const MESSAGES = {
  success:
    "Thank you for your generous support. Your donation to the India Museum and Heritage Society has been received successfully.",
  cancel:
    "No payment was made. Your donation was not completed — you have not been charged. You're welcome to try again whenever you're ready.",
};

const AUTO_DISMISS_MS = {
  success: 7000,
  cancel: 9000,
};

export function PaymentNotification({ type, onDismiss }: PaymentNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in on next frame
    const rafId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350); // Wait for fade-out before unmounting
    }, AUTO_DISMISS_MS[type]);
    return () => clearTimeout(timer);
  }, [type, onDismiss]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  const isSuccess = type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "clamp(1rem, 4vw, 2rem)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        width: "min(92vw, 520px)",
        pointerEvents: "auto",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        style={{
          background: "#FFFDF8",
          borderRadius: "16px",
          borderLeft: `4px solid ${isSuccess ? "#C9A84C" : "#8E8EA0"}`,
          boxShadow:
            "0 8px 32px rgba(27, 42, 107, 0.12), 0 2px 8px rgba(0,0,0,0.06)",
          padding: "clamp(1.25rem, 4vw, 1.75rem)",
          display: "flex",
          alignItems: "flex-start",
          gap: "clamp(0.75rem, 2vw, 1rem)",
          position: "relative",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Icon */}
        <div
          aria-hidden="true"
          style={{
            width: "40px",
            height: "40px",
            minWidth: "40px",
            borderRadius: "50%",
            background: isSuccess
              ? "linear-gradient(135deg, #C9A84C, #E8871A)"
              : "linear-gradient(135deg, #8E8EA0, #A8A8B8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            color: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          {isSuccess ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16.5" r="0.5" fill="#FFFFFF" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div style={{ flex: 1, paddingRight: "24px" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
              fontWeight: 600,
              color: "#1C1C1E",
              marginBottom: "6px",
              lineHeight: 1.3,
            }}
          >
            {isSuccess ? "Donation Received" : "Donation Not Completed"}
          </div>
          <p
            style={{
              fontSize: "clamp(0.85rem, 2vw, 0.9375rem)",
              lineHeight: 1.6,
              color: "#48484A",
              margin: 0,
            }}
          >
            {MESSAGES[type]}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Dismiss notification"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#8E8EA0",
            padding: "4px",
            minWidth: "32px",
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#1C1C1E";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#8E8EA0";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
