import { useState } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import { LEADERSHIP_HEADER, LEADERSHIP_DATA, type LeaderItem } from "@/data/leadershipContent";

// TODO: Replace static LEADERSHIP_DATA with Supabase fetch
// Table: leadership_profiles
// Fields: id, name, role, bio, image_url, is_memorial
// API: const { data } = await supabase.from('leadership_profiles').select('*').order('rank')

interface LeadershipProps {
  darkMode: boolean;
}

export function Leadership({ darkMode }: LeadershipProps) {
  const { ref: sectionRef, visible } = useIntersection(0.12);

  const bg = darkMode ? "#0D1433" : "#FDFAF5";
  const textPrimary = darkMode ? "#F5F0E8" : "#1C1C1E";
  const textSecondary = darkMode ? "#A8A8B8" : "#48484A";

  return (
    <section
      id="leadership"
      ref={sectionRef}
      style={{
        background: bg,
        padding: "var(--section-pad-y) clamp(1.25rem, 5vw, 4rem)",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 6vw, 4rem)" }}>
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
            {LEADERSHIP_HEADER.overline}
          </div>
          <h2
            className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h1)",
              fontWeight: 600,
              lineHeight: 1.2,
              color: textPrimary,
              margin: "0 auto 16px",
              maxWidth: "480px",
            }}
          >
            {LEADERSHIP_HEADER.heading}
          </h2>
          <div
            className={visible ? "museum-animate-fade-in museum-delay-200" : "museum-reveal"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1, maxWidth: "80px", height: "1px", background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
            <span aria-hidden="true" style={{ fontSize: "1.25rem" }}>🪷</span>
            <div style={{ flex: 1, maxWidth: "80px", height: "1px", background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
          </div>
          <p
            className={visible ? "museum-animate-fade-in-up museum-delay-200" : "museum-reveal"}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body-lg)",
              lineHeight: 1.65,
              color: textSecondary,
              margin: "0 auto",
              maxWidth: "520px",
            }}
          >
            {LEADERSHIP_HEADER.description}
          </p>
        </div>

        {/* Leader cards — Row 1: 3 cards, Row 2: 2 cards centered */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "clamp(1.25rem, 3vw, 2rem)",
          }}
          className="leadership-grid"
        >
          {LEADERSHIP_DATA.map((leader, idx) => (
            <div
              key={leader.id}
              style={{
                flex: "0 1 340px",
                maxWidth: "380px",
                width: "100%",
              }}
              className="leadership-card-wrapper"
            >
              <LeaderCard
                leader={leader}
                darkMode={darkMode}
                visible={visible}
                delay={idx * 120}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            </div>
          ))}
        </div>

        {/* Mobile: 1 card per row full width */}
        <style>{`
          @media (max-width: 768px) {
            .leadership-card-wrapper {
              flex: 1 1 100% !important;
              max-width: 100% !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

interface LeaderCardProps {
  leader: LeaderItem;
  darkMode: boolean;
  visible: boolean;
  delay: number;
  textPrimary: string;
  textSecondary: string;
}

function LeaderCard({ leader, darkMode, visible, delay, textPrimary, textSecondary }: LeaderCardProps) {
  const [hovered, setHovered] = useState(false);
  const surface = darkMode ? "#151F4A" : "#FFFFFF"; // Premium archival surface
  
  const isFounder = leader.name.includes("Kul Bhushan") || leader.name.includes("Bush");

  const altText = `Portrait of ${leader.name}, ${leader.role}`;

  // Premium, warm museum-frame borders
  const cardBorder = darkMode
    ? `1px solid rgba(201,168,76,0.15)`
    : `1px solid rgba(201,168,76,0.25)`; // Warmer outline
  const founderCardBorder = darkMode
    ? `1px solid rgba(201,168,76,0.35)`
    : `1px solid rgba(201,168,76,0.5)`;

  // Dimensional, soft shadows instead of flat generic shadows
  const baseShadow = isFounder
    ? `0 10px 32px rgba(27,42,107,${darkMode ? "0.25" : "0.1"})`
    : `0 6px 20px rgba(27,42,107,${darkMode ? "0.15" : "0.06"})`;
  
  const hoverShadow = isFounder
    ? `0 16px 48px rgba(27,42,107,${darkMode ? "0.35" : "0.15"})`
    : `0 10px 28px rgba(27,42,107,${darkMode ? "0.25" : "0.1"})`;

  return (
    <article
      className={`museum-focus-visible ${visible ? "museum-animate-fade-in-up" : "museum-reveal"}`}
      style={{
        animationDelay: `${delay + 200}ms`,
        background: surface,
        borderRadius: "1.5rem", // rounded-3xl for incredibly premium feel
        border: isFounder ? founderCardBorder : cardBorder,
        boxShadow: hovered ? hoverShadow : baseShadow,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.4s ease, transform 0.4s ease, border-color 0.4s ease",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
      }}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Portrait — refined avatar circle with true ring-offset effect via box-shadow */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        padding: isFounder ? "2rem 1.25rem 0" : "1.75rem 1.25rem 0", // Deliberate top padding
      }}>
        <div style={{
          width: "116px", // Perfect proportion
          height: "116px",
          borderRadius: "50%",
          boxShadow: isFounder
            ? `0 0 0 4px ${surface}, 0 0 0 8px ${darkMode ? "rgba(201,168,76,0.9)" : "#C9A84C"}, 0 12px 24px rgba(27,42,107,${darkMode ? "0.4" : "0.2"})`
            : `0 0 0 2px ${surface}, 0 0 0 4px ${darkMode ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.8)"}, 0 8px 16px rgba(27,42,107,${darkMode ? "0.25" : "0.1"})`,
          flexShrink: 0,
        }}>
          <img
            src={leader.image}
            alt={altText}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              borderRadius: "50%",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Content — tightened vertical rhythm */}
      <div style={{ padding: isFounder ? "1.5rem 1.5rem 1.75rem" : "1.5rem 1.5rem 1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Role — refined uppercase label */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: isFounder ? "#B87F22" : "#C9A84C", // Richer gold for founder
          marginBottom: "6px", // Tight rhythm
        }}>
          {leader.role}
        </div>

        {/* Name — bold serif */}
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: isFounder ? "1.375rem" : "1.25rem",
          fontWeight: 600,
          color: textPrimary,
          margin: "0 0 6px", // Tight rhythm
          lineHeight: 1.2,
        }}>
          {leader.name}
        </h3>

        {/* Founder Tribute Line */}
        {isFounder && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem", // text-sm / text-xs range
            color: darkMode ? "rgba(201,168,76,0.9)" : "rgba(201,168,76,1)", // Richest gold tone
            letterSpacing: "0.12em", // tracking-wider
            fontWeight: 500, // Slightly more intentional weight
            margin: "0 0 6px", // Fits tightly below name
          }}>
            Vision • Service • Legacy
          </div>
        )}

        {/* In Memoriam badge */}
        {leader.isMemorial && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontStyle: "italic",
            color: darkMode ? "rgba(201,168,76,0.7)" : "rgba(160,140,100,0.9)", // Warmer gray-gold
            marginBottom: "6px",
            letterSpacing: "0.06em",
          }}>
            ✦ In Memoriam
          </div>
        )}

        {/* Divider */}
        <div style={{
          width: isFounder ? "48px" : "36px",
          height: isFounder ? "2px" : "1px",
          background: "#C9A84C",
          margin: "6px auto 0", // Sits tight to content, remaining space is handled gracefully below
          opacity: isFounder ? 0.8 : 0.5,
        }} />

        {/* Bio — only show if non-empty */}
        {leader.bio && leader.bio.trim() !== "" && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            lineHeight: 1.6, // Slightly tighter line-height
            color: textSecondary,
            margin: "12px 0 0",
            flex: 1, // Pushes remaining space to bottom if bio exists
          }}>
            {leader.bio}
          </p>
        )}
      </div>
    </article>
  );
}
