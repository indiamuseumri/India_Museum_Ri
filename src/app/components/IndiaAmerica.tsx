import { useRef, useEffect, useState } from "react";
import {
  EDITORIAL_IMAGE,
  EDITORIAL_IMAGE_ALT,
} from "@/data/indiaAmericaContent";

export function IndiaAmerica() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  const bg = "#F2EDE2";

  const textPrimary = "#1C1C1E";
  const textSecondary = "#48484A";

  // Scroll reveal — fires once
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="exhibitions"
      ref={sectionRef}
      style={{
        background: bg,
        paddingTop: "80px",
        paddingBottom: "80px",
        paddingLeft: "clamp(1.25rem, 5vw, 4rem)",
        paddingRight: "clamp(1.25rem, 5vw, 4rem)",
        transition: "background 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionProperty: "opacity, transform, background",
        transitionDuration: "500ms, 500ms, 300ms",
        transitionTimingFunction: "ease-out, ease-out, ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Two-column grid: image left, content right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
          }}
          className="mission-grid"
        >
          {/* Image side */}
          <div>
            <img
              src={EDITORIAL_IMAGE}
              alt={EDITORIAL_IMAGE_ALT}
              loading="eager"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: imgHovered
                  ? "0 28px 56px rgba(0, 0, 0, 0.13)"
                  : "0 20px 48px rgba(0, 0, 0, 0.10)",
                transform: imgHovered ? "translateY(-4px)" : "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                display: "block",
              }}
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
            />
          </div>

          {/* Content side */}
          <div>
            {/* PART 1 — Label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "3px",
                  height: "18px",
                  background: "linear-gradient(180deg, #E8871A, #C9A84C)",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#E8871A",
                }}
              >
                About the Museum
              </span>
            </div>

            {/* PART 2 — Main Heading */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 600,
                lineHeight: 1.18,
                letterSpacing: "0.3px",
                color: textPrimary,
                margin: "0 0 22px",
              }}
            >
              Preserving India's
              <br />
              <em style={{ fontStyle: "italic", color: "#C9A84C" }}>Living Heritage</em>
            </h2>

            {/* Gold divider */}
            <div
              style={{
                width: "48px",
                height: "3px",
                background: "linear-gradient(90deg, #E8871A, #C9A84C)",
                borderRadius: "2px",
                marginBottom: "22px",
              }}
            />

            {/* PART 3 — About Paragraphs */}
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body)",
                lineHeight: 1.72,
                color: textSecondary,
                maxWidth: "560px",
                marginBottom: "24px",
              }}
            >
              <p style={{ margin: "0 0 14px" }}>
                The India Museum and Heritage Society of Rhode Island is a living cultural institution dedicated to preserving, celebrating, and sharing the vast artistic, literary, musical, and historical heritage of India.
              </p>
              <p style={{ margin: 0 }}>
                Rooted in community vision and sustained by decades of dedication, the museum serves as a vibrant home where India's diversity is experienced, creativity is nurtured, and cultural understanding is deepened. Located in the heart of Providence's historic Federal Hill, our museum offers exhibitions, performances, educational programs, and a welcoming space for artistic expression.
              </p>
            </div>

            {/* PART 4 — History Card */}
            <div
              style={{
                borderLeft: "3px solid #E8871A",
                background: "rgba(232,135,26,0.04)",
                borderRadius: "0 10px 10px 0",
                padding: "18px 20px",
                marginBottom: "24px",
                maxWidth: "560px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#E8871A",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span aria-hidden="true">📜</span> History
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  lineHeight: 1.65,
                  color: textSecondary,
                  margin: 0,
                }}
              >
                The museum began over two decades ago as part of the Rhode Island Heritage Harbor initiative. When the larger project could not be completed, Kul Bhushan 'Bush' Chaudhary ensured the vision survived — securing and restoring an independent building in Providence, transforming it into a lasting cultural home for the community.
              </p>
            </div>

            {/* PART 5 — Closing Statement */}
            <div
              style={{
                borderTop: "1px solid rgba(0,0,0,0.08)",
                paddingTop: "20px",
                maxWidth: "560px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  color: "#C9A84C",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Heritage is not simply preserved here —
                <br />
                it is lived, shared, and carried forward.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS for mobile grid */}
      <style>{`
        @media (max-width: 768px) {
          .mission-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}

