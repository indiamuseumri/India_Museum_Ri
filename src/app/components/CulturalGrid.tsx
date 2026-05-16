import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntersection } from "@/hooks/useIntersection";
import { CULTURAL_GRID_HEADER, CULTURES, type CultureItem } from "@/data/culturalGridContent";

// Category route mapping:
// faith → /exhibitions/faith
// art → /exhibitions/art
// music → /exhibitions/music
// literature → /exhibitions/literature
// traditions → /exhibitions/ethnic
const CATEGORY_ROUTES: Record<string, string> = {
  faith: '/exhibitions/faith',
  art: '/exhibitions/art',
  music: '/exhibitions/music',
  literature: '/exhibitions/literature',
  traditions: '/exhibitions/ethnic',
};

interface CulturalGridProps {
  darkMode: boolean;
}

export function CulturalGrid({ darkMode }: CulturalGridProps) {
  const { ref: sectionRef, visible } = useIntersection(0.15);

  const bg = darkMode ? "#0D1433" : "#FDFAF5";
  const textPrimary = darkMode ? "#F5F0E8" : "#1C1C1E";
  const textSecondary = darkMode ? "#A8A8B8" : "#48484A";

  return (
    <section
      id="exhibitions"
      ref={sectionRef}
      style={{
        background: bg,
        padding: "var(--section-pad-y) 0",
        transition: "background 0.3s ease",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 clamp(1.25rem, 5vw, 4rem)",
          marginBottom: "clamp(2.5rem, 6vw, 4rem)",
        }}
      >
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
          {CULTURAL_GRID_HEADER.overline}
        </div>
        <h2
          className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h1)",
            fontWeight: 600,
            lineHeight: 1.2,
            color: textPrimary,
            margin: 0,
            maxWidth: "520px",
          }}
        >
          {CULTURAL_GRID_HEADER.heading}
        </h2>
        <p
          className={visible ? "museum-animate-fade-in-up museum-delay-200" : "museum-reveal"}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-lg)",
            lineHeight: 1.65,
            color: textSecondary,
            marginTop: "16px",
            maxWidth: "520px",
          }}
        >
          {CULTURAL_GRID_HEADER.description}
        </p>
      </div>

      {/* Cards — horizontal scroll on mobile, grid on desktop */}
      <div
        className="museum-swipe-scroll"
        style={{
          padding: "0 clamp(1.25rem, 5vw, 4rem)",
          paddingBottom: "16px",
        }}
      >
        <div
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          style={{
            gap: "clamp(1rem, 2.5vw, 1.5rem)",
            minWidth: "min-content",
          }}
        >
          {CULTURES.map((culture, idx) => (
            <CultureCard
              key={culture.id}
              culture={culture}
              darkMode={darkMode}
              visible={visible}
              delay={idx * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CultureCardProps {
  culture: CultureItem;
  darkMode: boolean;
  visible: boolean;
  delay: number;
}

function CultureCard({ culture, darkMode, visible, delay }: CultureCardProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const cardBg = darkMode ? "#151F4A" : "#FFFFFF";
  const textPrimary = darkMode ? "#F5F0E8" : "#1C1C1E";
  const textSecondary = darkMode ? "#A8A8B8" : "#48484A";

  const handleClick = () => {
    const route = CATEGORY_ROUTES[culture.id];
    if (route) navigate(route);
  };

  return (
    <article
      className={`museum-focus-visible ${visible ? "museum-animate-fade-in-up" : "museum-reveal"}`}
      style={{
        animationDelay: `${delay}ms`,
        flex: "0 0 280px",
        background: cardBg,
        borderRadius: "var(--card-radius)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 8px 28px rgba(27,42,107,${darkMode ? "0.4" : "0.14"})`
          : `0 2px 12px rgba(27,42,107,${darkMode ? "0.25" : "0.07"})`,
      }}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img
          src={culture.image}
          alt={`${culture.title} — Indian cultural heritage`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
          loading="lazy"
        />
        {/* Color overlay on hover */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 40%, ${culture.color}CC 100%)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.3s ease",
        }} />
        {/* Category badge */}
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: culture.color,
          color: "#FFFFFF",
          padding: "4px 10px",
          borderRadius: "100px",
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          {culture.icon} {culture.id.charAt(0).toUpperCase() + culture.id.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-caption)",
          color: culture.color,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}>
          {culture.subtitle}
        </div>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-h3)",
          fontWeight: 600,
          color: textPrimary,
          margin: "0 0 10px",
          lineHeight: 1.3,
        }}>
          {culture.title}
        </h3>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-body)",
          lineHeight: 1.6,
          color: textSecondary,
          margin: 0,
        }}>
          {culture.description}
        </p>
        <div style={{
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: culture.color,
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-caption)",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}>
          Explore
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </article>
  );
}