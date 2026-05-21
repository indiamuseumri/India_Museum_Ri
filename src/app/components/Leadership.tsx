import { useState } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import { LEADERSHIP_HEADER, LEADERSHIP_DATA, BENEFACTOR_DATA, type LeaderItem } from "@/data/leadershipContent";

// TODO: Replace static LEADERSHIP_DATA with Supabase fetch
// Table: leadership_profiles
// Fields: id, name, role, bio, image_url, is_memorial
// API: const { data } = await supabase.from('leadership_profiles').select('*').order('rank')

export function Leadership() {
  const { ref: sectionRef, visible } = useIntersection(0.12);

  const bg = "#FDFAF5";
  const textPrimary = "#1C1C1E";
  const textSecondary = "#48484A";

  // Separate founder from committee
  const founder = LEADERSHIP_DATA.find(
    (l) => l.name.includes("Kul Bhushan") || l.name.includes("Bush")
  );
  const committee = LEADERSHIP_DATA.filter(
    (l) => !(l.name.includes("Kul Bhushan") || l.name.includes("Bush"))
  );

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

        {/* ─── Tier 1: Founder Card ─── */}
        {founder && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "clamp(2rem, 5vw, 3rem)",
            }}
          >
            <div
              style={{
                flex: "0 1 380px",
                maxWidth: "380px",
                width: "100%",
              }}
            >
              <LeaderCard
                leader={founder}
                visible={visible}
                delay={0}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            </div>
          </div>
        )}

        {/* ─── Tier 2: Founding Benefactors ─── */}
        {BENEFACTOR_DATA.length > 0 && (
          <div style={{ marginBottom: "clamp(2rem, 5vw, 3rem)" }}>
            {/* Sub-section label */}
            <div
              className={visible ? "museum-animate-fade-in museum-delay-300" : "museum-reveal"}
              style={{
                textAlign: "center",
                marginBottom: "clamp(1.5rem, 3vw, 2rem)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ flex: 1, maxWidth: "60px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5))" }} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#C9A84C",
                  }}
                >
                  Founding Benefactors
                </span>
                <div style={{ flex: 1, maxWidth: "60px", height: "1px", background: "linear-gradient(90deg, rgba(201,168,76,0.5), transparent)" }} />
              </div>
            </div>

            {/* Benefactor cards — centered pair */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "clamp(1.25rem, 3vw, 2rem)",
              }}
              className="benefactor-grid"
            >
              {BENEFACTOR_DATA.map((benefactor, idx) => (
                <div
                  key={benefactor.id}
                  style={{
                    flex: "0 1 340px",
                    maxWidth: "380px",
                    width: "100%",
                  }}
                  className="benefactor-card-wrapper"
                >
                  <LeaderCard
                    leader={benefactor}
                    visible={visible}
                    delay={(idx + 1) * 150}
                    textPrimary={textPrimary}
                    textSecondary={textSecondary}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Tier 3: Leadership Committee ─── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "clamp(1.25rem, 3vw, 2rem)",
          }}
          className="leadership-grid"
        >
          {committee.map((leader, idx) => (
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
                visible={visible}
                delay={(idx + 2) * 120}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            </div>
          ))}
        </div>

        {/* Mobile: 1 card per row full width */}
        <style>{`
          @media (max-width: 768px) {
            .leadership-card-wrapper,
            .benefactor-card-wrapper {
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
  visible: boolean;
  delay: number;
  textPrimary: string;
  textSecondary: string;
}

function LeaderCard({ leader, visible, delay, textPrimary, textSecondary }: LeaderCardProps) {
  const [hovered, setHovered] = useState(false);
  const surface = "#FFFFFF";

  const isFounder = leader.name.includes("Kul Bhushan") || leader.name.includes("Bush");
  const isHonorary = leader.isHonorary === true;

  const altText = `Portrait of ${leader.name}, ${leader.role}`;

  // ─── Card border treatment ───
  const cardBorder = isFounder
    ? "1px solid rgba(201,168,76,0.5)"
    : isHonorary
      ? "1px solid rgba(201,168,76,0.4)"
      : "1px solid rgba(201,168,76,0.25)";

  // ─── Shadow treatment ───
  const baseShadow = isFounder
    ? "0 10px 32px rgba(27,42,107,0.1)"
    : isHonorary
      ? "0 8px 28px rgba(27,42,107,0.09)"
      : "0 6px 20px rgba(27,42,107,0.06)";

  const hoverShadow = isFounder
    ? "0 16px 48px rgba(27,42,107,0.15)"
    : isHonorary
      ? "0 14px 40px rgba(27,42,107,0.13)"
      : "0 10px 28px rgba(27,42,107,0.1)";

  // ─── Portrait ring treatment ───
  const portraitRing = isFounder
    ? `0 0 0 4px ${surface}, 0 0 0 8px #C9A84C, 0 12px 24px rgba(27,42,107,0.2)`
    : isHonorary
      ? `0 0 0 3px ${surface}, 0 0 0 7px rgba(201,168,76,0.9), 0 10px 20px rgba(27,42,107,0.15)`
      : `0 0 0 2px ${surface}, 0 0 0 4px rgba(201,168,76,0.8), 0 8px 16px rgba(27,42,107,0.1)`;

  // ─── Role label color ───
  const roleColor = isFounder ? "#B87F22" : isHonorary ? "#B87F22" : "#C9A84C";

  // ─── Padding ───
  const topPadding = isFounder || isHonorary ? "2rem 1.25rem 0" : "1.75rem 1.25rem 0";

  return (
    <article
      className={`museum-focus-visible ${visible ? "museum-animate-fade-in-up" : "museum-reveal"}`}
      style={{
        animationDelay: `${delay + 200}ms`,
        background: surface,
        borderRadius: "1.5rem",
        border: cardBorder,
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
      {/* Portrait — refined avatar circle with ring-offset effect via box-shadow */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        padding: topPadding,
      }}>
        <div style={{
          width: "116px",
          height: "116px",
          borderRadius: "50%",
          boxShadow: portraitRing,
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
      <div style={{
        padding: (isFounder || isHonorary) ? "1.5rem 1.75rem 2rem" : "1.5rem 1.5rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}>
        {/* Role — refined uppercase label */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: roleColor,
          marginBottom: "6px",
        }}>
          {leader.role}
        </div>

        {/* Name — bold serif */}
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: (isFounder || isHonorary) ? "1.375rem" : "1.25rem",
          fontWeight: 600,
          color: textPrimary,
          margin: "0 0 6px",
          lineHeight: 1.2,
        }}>
          {leader.name}
        </h3>

        {/* Founder Tribute Line */}
        {isFounder && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "rgba(201,168,76,1)",
            letterSpacing: "0.12em",
            fontWeight: 500,
            margin: "0 0 6px",
          }}>
            Vision • Service • Legacy
          </div>
        )}

        {/* Honorary Tribute Line */}
        {isHonorary && leader.tributeLine && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "rgba(201,168,76,1)",
            letterSpacing: "0.12em",
            fontWeight: 500,
            margin: "0 0 6px",
          }}>
            {leader.tributeLine}
          </div>
        )}

        {/* In Memoriam badge */}
        {leader.isMemorial && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontStyle: "italic",
            color: "rgba(160,140,100,0.9)",
            marginBottom: "6px",
            letterSpacing: "0.06em",
          }}>
            ✦ In Memoriam
          </div>
        )}

        {/* Divider */}
        <div style={{
          width: (isFounder || isHonorary) ? "48px" : "36px",
          height: (isFounder || isHonorary) ? "2px" : "1px",
          background: "#C9A84C",
          margin: "6px auto 0",
          opacity: (isFounder || isHonorary) ? 0.8 : 0.5,
        }} />

        {/* Bio — only show if non-empty */}
        {leader.bio && leader.bio.trim() !== "" && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            color: textSecondary,
            margin: "12px 0 0",
            flex: 1,
          }}>
            {leader.bio}
          </p>
        )}
      </div>
    </article>
  );
}
