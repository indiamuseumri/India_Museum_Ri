import { useState, useEffect } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import {
  EVENTS_HEADER,
  REGISTRATION_FORM,
  type EventItem,
} from "@/data/eventsContent";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

// TODO: Connected to Supabase events table
// Table: events | Status: OPEN | CLOSED | COMING_SOON

interface EventsProps {
  darkMode: boolean;
}

export function Events({ darkMode }: EventsProps) {
  const { ref: sectionRef, visible } = useIntersection(0.1);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setFetchError(false);
    try {

      const { data, error } = await supabase
        .from('events')
        .select('id, title, category, date, time, location, description, status, image_url, created_at')
        .order('date', { ascending: true });
      if (error) throw error;

      const mapped: EventItem[] = (data || []).map((ev, idx) => {
        const d = new Date(ev.date);
        const monthStr = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const dayStr = String(d.getDate()).padStart(2, '0');
        const displayStatus = ev.status === 'COMING_SOON' ? 'COMING SOON' : ev.status;
        const categoryColors: Record<string, string> = {
          Community: '#C9184A', Workshop: '#E8871A', Performance: '#006B8F',
          Lecture: '#2D6A4F', Cultural: '#1B2A6B',
        };
        return {
          id: ev.id,
          title: ev.title,
          date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          month: monthStr,
          day: dayStr,
          category: ev.category || 'Event',
          categoryColor: categoryColors[ev.category || ''] || '#E8871A',
          description: ev.description,
          featured: idx === 0 && displayStatus === 'OPEN',
          time: ev.time,
          location: ev.location,
          status: displayStatus as EventItem['status'],
        };
      });
      setEvents(mapped);
    } catch (err) {
      console.error('[EVENTS PUBLIC] Fetch error:', err);
      setFetchError(true);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const bg = darkMode ? "#0D1433" : "#FDFAF5";
  const textPrimary = darkMode ? "#F5F0E8" : "#1C1C1E";
  const textSecondary = darkMode ? "#A8A8B8" : "#48484A";

  const featured = events.find((e) => e.featured);
  const regular = events.filter((e) => !e.featured);

  return (
    <section
      id="events"
      ref={sectionRef}
      style={{
        background: bg,
        padding: "var(--section-pad-y) clamp(1.25rem, 5vw, 4rem)",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(2rem, 5vw, 3.5rem)" }}>
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
            {EVENTS_HEADER.overline}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h2
              className={visible ? "museum-animate-fade-in-up museum-delay-100" : "museum-reveal"}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h1)",
                fontWeight: 600,
                lineHeight: 1.2,
                color: textPrimary,
                margin: 0,
              }}
            >
              {EVENTS_HEADER.heading}
            </h2>
            <a
              href={EVENTS_HEADER.viewAllHref}
              className="museum-focus-visible"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#E8871A",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minHeight: "44px",
                padding: "0 4px",
              }}
            >
              {EVENTS_HEADER.viewAllLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "clamp(1rem, 2.5vw, 1.5rem)",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: darkMode ? "#151F4A" : "#FFFFFF",
                  borderRadius: "var(--card-radius)",
                  padding: "1.5rem",
                  height: "240px",
                  animation: "pulse 1.5s ease-in-out infinite",
                  opacity: 0.6,
                }}
              />
            ))}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }`}</style>
          </div>
        )}

        {/* Error state */}
        {fetchError && !loading && (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ color: textSecondary, fontFamily: "var(--font-body)", marginBottom: "1rem" }}>Failed to load events.</p>
            <button
              onClick={fetchEvents}
              style={{
                background: "#E8871A",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 24px",
                borderRadius: "100px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && events.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎭</div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              color: textPrimary,
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}>
              No upcoming events at this time
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: textSecondary,
            }}>
              Check back soon for new events and programs.
            </p>
          </div>
        )}

        {/* Featured Event */}
        {!loading && !fetchError && featured && (
          <FeaturedEventCard
            event={featured}
            darkMode={darkMode}
            visible={visible}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            onRegister={() => setSelectedEvent(featured)}
          />
        )}

        {/* Regular Events Grid */}
        {!loading && !fetchError && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "clamp(1rem, 2.5vw, 1.5rem)",
              marginTop: "clamp(1rem, 3vw, 2rem)",
            }}
          >
            {regular.map((event, idx) => (
              <RegularEventCard
                key={event.id}
                event={event}
                darkMode={darkMode}
                visible={visible}
                delay={(idx + 1) * 100}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                onRegister={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          darkMode={darkMode}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
}

/* ─── Registration Modal ─── */
interface RegistrationModalProps {
  event: EventItem;
  darkMode: boolean;
  onClose: () => void;
}

function RegistrationModal({ event, darkMode, onClose }: RegistrationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', preferredTime: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.phone || !/^\d{7,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) errs.phone = 'Enter a valid phone number';
    if (!formData.preferredTime) errs.preferredTime = 'Please select a time';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // CRITICAL CHECK — verify event.id is a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!event?.id || !uuidRegex.test(event.id)) {
      console.error('[REGISTRATION] Invalid event ID:', event?.id);
      console.error('[REGISTRATION] Expected UUID format');
      toast.error('Invalid event ID. Please refresh and try again.');
      return;
    }

    setSubmitting(true);
    try {

      // IMPORTANT: field names must match DB exactly
      const { data, error } = await supabase.from('registrations').insert([{
        event_id: event.id,              // UUID — CORRECT
        full_name: formData.name,        // DB column: full_name
        phone_number: formData.phone,    // DB column: phone_number
        preferred_time: formData.preferredTime,
      }]);

      if (error) {
        console.error('[REGISTRATION] Insert error:', error);
        console.error('[REGISTRATION] Error code:', error.code);
        console.error('[REGISTRATION] Error message:', error.message);
        console.error('[REGISTRATION] Error details:', error.details);
        console.error('[REGISTRATION] Error hint:', error.hint);
        if (error.code === '42501') {
          toast.error('Permission denied. Please try again.');
        } else if (error.code === '22P02') {
          toast.error('Invalid ID format. Please refresh and try again.');
        } else if (error.code === '23503') {
          toast.error('Referenced event not found. Please refresh and try again.');
        } else {
          toast.error(error.message || 'Registration failed. Please try again.');
        }
        return;
      }

      toast.success('Registration submitted successfully');

      // TODO: Send registration confirmation email
      // API: POST /api/send-registration-email
      // Payload: { name: formData.name, phone: formData.phone, eventTitle: event.title, eventDate: event.date, eventTime: event.time }

      setTimeout(() => onClose(), 1500);
    } catch (err: unknown) {
      console.error('[REGISTRATION] Unexpected error:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit registration';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
    background: darkMode ? "rgba(0,0,0,0.2)" : "#FFFFFF",
    color: darkMode ? "#F5F0E8" : "#1C1C1E",
    fontFamily: "var(--font-body)",
  };

  const labelStyle = {
    display: "block" as const,
    marginBottom: "8px",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    color: darkMode ? "#F5F0E8" : "#1C1C1E",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Register for ${event.title}`}
    >
      <div
        style={{
          background: darkMode ? "#151F4A" : "#FFFFFF",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close registration modal"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: darkMode ? "#F5F0E8" : "#1C1C1E",
            cursor: "pointer",
            padding: "8px",
            minWidth: "44px",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 600,
          color: darkMode ? "#F5F0E8" : "#1C1C1E",
          marginBottom: "8px",
        }}>
          {REGISTRATION_FORM.title}
        </h3>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: darkMode ? "#A8A8B8" : "#48484A",
          marginBottom: "24px",
        }}>
          {event.title}
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>{REGISTRATION_FORM.nameLabel} <span style={{ color: "#C9184A" }}>*</span></label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
            {errors.name && <span style={{ color: '#E8566B', fontSize: '0.75rem', fontFamily: 'var(--font-body)', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
          </div>
          <div>
            <label style={labelStyle}>{REGISTRATION_FORM.phoneLabel} <span style={{ color: "#C9184A" }}>*</span></label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={inputStyle}
            />
            {errors.phone && <span style={{ color: '#E8566B', fontSize: '0.75rem', fontFamily: 'var(--font-body)', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
          </div>
          <div>
            <label style={labelStyle}>{REGISTRATION_FORM.timeLabel} <span style={{ color: "#C9184A" }}>*</span></label>
            <select
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              style={inputStyle}
            >
              {REGISTRATION_FORM.timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.preferredTime && <span style={{ color: '#E8566B', fontSize: '0.75rem', fontFamily: 'var(--font-body)', marginTop: '4px', display: 'block' }}>{errors.preferredTime}</span>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            aria-label={submitting ? "Submitting registration" : "Submit registration"}
            style={{
              marginTop: "16px",
              background: submitting ? "#B06A14" : "#E8871A",
              color: "#FFFFFF",
              padding: "14px",
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              border: "none",
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s ease, opacity 0.2s ease",
            }}
          >
            {submitting && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            )}
            {submitting ? "Registering…" : REGISTRATION_FORM.submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Card Components ─── */
interface EventCardProps {
  event: EventItem;
  darkMode: boolean;
  visible: boolean;
  delay?: number;
  textPrimary: string;
  textSecondary: string;
  onRegister: () => void;
}

function FeaturedEventCard({ event, darkMode, visible, textPrimary, textSecondary, onRegister }: EventCardProps) {
  return (
    <article
      className={visible ? "museum-animate-fade-in-up museum-delay-200" : "museum-reveal"}
      style={{
        background: `linear-gradient(135deg, ${darkMode ? "#1B2A6B" : "#1B2A6B"} 0%, ${darkMode ? "#0D1B42" : "#0D1B42"} 100%)`,
        borderRadius: "var(--card-radius)",
        padding: "clamp(1.5rem, 4vw, 2.5rem)",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "clamp(1.25rem, 3vw, 2rem)",
        alignItems: "start",
        boxShadow: "0 4px 24px rgba(27,42,107,0.25)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Featured badge */}
      <div style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        background: "#E8871A",
        color: "#FFFFFF",
        padding: "4px 12px",
        borderRadius: "100px",
        fontFamily: "var(--font-body)",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>
        Featured
      </div>

      {/* Decorative gold circle */}
      <div aria-hidden="true" style={{
        position: "absolute",
        right: "-40px",
        bottom: "-40px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        border: "1px solid rgba(201,168,76,0.15)",
        pointerEvents: "none",
      }} />

      {/* Date Block */}
      <div style={{
        background: "#E8871A",
        borderRadius: "12px",
        padding: "12px 16px",
        textAlign: "center",
        minWidth: "64px",
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.85)",
          textTransform: "uppercase",
        }}>
          {event.month}
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1,
          marginTop: "4px",
        }}>
          {event.day}
        </div>
      </div>

      {/* Content */}
      <div>
        <div style={{
          display: "inline-block",
          background: `rgba(201,24,74,0.2)`,
          color: "#FFB3C8",
          padding: "3px 10px",
          borderRadius: "100px",
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}>
          {event.category}
        </div>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.25rem, 3vw, 1.625rem)",
          fontWeight: 600,
          color: "#FFFFFF",
          margin: "0 0 10px",
          lineHeight: 1.3,
          paddingRight: "80px",
        }}>
          {event.title}
        </h3>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-body)",
          lineHeight: 1.6,
          color: "rgba(245,240,232,0.78)",
          margin: "0 0 16px",
        }}>
          {event.description}
        </p>
        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          {[
            { icon: "🕐", text: event.time },
            { icon: "📍", text: event.location },
          ].map((meta) => (
            <span key={meta.text} style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              color: "rgba(245,240,232,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}>
              <span aria-hidden="true">{meta.icon}</span>
              {meta.text}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {event.status === "OPEN" && (
            <button
              onClick={onRegister}
              className="museum-focus-visible"
              aria-label={`Register for ${event.title}`}
              style={{
                background: "#E8871A",
                color: "#FFFFFF",
                border: "none",
                padding: "11px 24px",
                borderRadius: "100px",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "44px",
                transition: "background 0.2s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#D4780F";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#E8871A";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              Register Now
            </button>
          )}
          {event.status === "COMING SOON" && (
            <div style={{
              background: "rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              border: "1.5px solid rgba(255,255,255,0.25)",
              padding: "11px 24px",
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              minHeight: "44px",
            }}>
              Coming Soon
            </div>
          )}
          {event.status === "CLOSED" && (
            <div style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.5)",
              border: "1.5px solid rgba(255,255,255,0.1)",
              padding: "11px 24px",
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              minHeight: "44px",
            }}>
              Registration Closed
            </div>
          )}
          <button
            className="museum-focus-visible"
            aria-label={`Add ${event.title} to calendar`}
            style={{
              background: "transparent",
              color: "rgba(245,240,232,0.85)",
              border: "1.5px solid transparent",
              padding: "10px 16px",
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              minHeight: "44px",
              transition: "background 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Add to Calendar
          </button>
        </div>
      </div>
    </article>
  );
}

function RegularEventCard({ event, darkMode, visible, delay = 0, textPrimary, textSecondary, onRegister }: EventCardProps) {
  const [hovered, setHovered] = useState(false);
  const surface = darkMode ? "#151F4A" : "#FFFFFF";

  return (
    <article
      className={visible ? `museum-animate-fade-in-up` : "museum-reveal"}
      style={{
        animationDelay: `${delay + 200}ms`,
        background: surface,
        borderRadius: "var(--card-radius)",
        padding: "1.25rem 1.25rem 1.5rem",
        boxShadow: hovered
          ? `0 6px 20px rgba(27,42,107,${darkMode ? "0.3" : "0.12"})`
          : `0 1px 8px rgba(27,42,107,${darkMode ? "0.2" : "0.07"})`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Date + category row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: event.categoryColor,
            color: "#FFFFFF",
            padding: "4px 8px",
            borderRadius: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 700,
            lineHeight: 1,
            minWidth: "40px",
            textAlign: "center",
          }}>
            <div style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.5625rem" }}>{event.month}</div>
            <div style={{ fontSize: "1.125rem", fontFamily: "var(--font-display)" }}>{event.day}</div>
          </div>
          <span style={{
            background: `${event.categoryColor}18`,
            color: event.categoryColor,
            padding: "3px 10px",
            borderRadius: "100px",
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {event.category}
          </span>
        </div>
      </div>

      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-h3)",
        fontWeight: 600,
        color: textPrimary,
        margin: 0,
        lineHeight: 1.3,
      }}>
        {event.title}
      </h3>

      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-body)",
        lineHeight: 1.6,
        color: textSecondary,
        margin: 0,
        flex: 1,
      }}>
        {event.description}
      </p>

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {[
          { icon: "🕐", text: event.time },
          { icon: "📍", text: event.location },
        ].map((meta) => (
          <span key={meta.text} style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-caption)",
            color: textSecondary,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            opacity: 0.8,
          }}>
            <span aria-hidden="true">{meta.icon}</span>
            {meta.text}
          </span>
        ))}
      </div>

      {/* Status / Register */}
      {event.status === "OPEN" && (
        <button
          onClick={(e) => { e.stopPropagation(); onRegister(); }}
          className="museum-focus-visible"
          aria-label={`Register for ${event.title}`}
          style={{
            background: "transparent",
            color: event.categoryColor,
            border: `1.5px solid ${event.categoryColor}40`,
            padding: "9px 16px",
            borderRadius: "100px",
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "background 0.2s ease, border-color 0.2s ease",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = `${event.categoryColor}12`;
            (e.currentTarget as HTMLButtonElement).style.borderColor = event.categoryColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${event.categoryColor}40`;
          }}
        >
          Register Now
        </button>
      )}
      {event.status === "COMING SOON" && (
        <div
          style={{
            background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            color: textSecondary,
            border: `1.5px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
            padding: "9px 16px",
            borderRadius: "100px",
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          Coming Soon
        </div>
      )}
      {event.status === "CLOSED" && (
        <div
          style={{
            background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
            border: `1.5px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            padding: "9px 16px",
            borderRadius: "100px",
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          Registration Closed
        </div>
      )}
    </article>
  );
}
