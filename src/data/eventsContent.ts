/**
 * Events Section Content
 * ──────────────────────
 * EVENTS_HEADER and REGISTRATION_FORM are still actively used.
 * The EVENTS array below is DEPRECATED — kept for reference only.
 * All event data is now fetched live from Supabase.
 *
 * ⚠️  DO NOT import EVENTS in any component.
 *     The hardcoded IDs (e.g., "diwali-2026") are NOT valid UUIDs
 *     and will cause "invalid input syntax for type uuid" errors
 *     if used for registration inserts.
 */

export const EVENTS_HEADER = {
  overline: "Calendar",
  heading: "Upcoming Events",
  viewAllLabel: "View all events",
  viewAllHref: "#events-all",
};

export interface EventItem {
  id: string;
  title: string;
  date: string;
  month: string;
  day: string;
  category: string;
  categoryColor: string;
  description: string;
  featured?: boolean;
  time: string;
  location: string;
  status: "OPEN" | "COMING SOON" | "CLOSED";
}

export const EVENTS: EventItem[] = [
  {
    id: "diwali-2026",
    title: "Diwali Cultural Celebration",
    date: "November 1, 2026",
    month: "NOV",
    day: "01",
    category: "Community",
    categoryColor: "#C9184A",
    description:
      "Join us for a grand evening of lights, music, and traditional ceremony as we celebrate Diwali — the Festival of Lights — with the greater Providence community.",
    featured: true,
    time: "5:00 PM – 9:00 PM",
    location: "IMHSRI Gallery & Courtyard",
    status: "OPEN",
  },
  {
    id: "mughal-workshop",
    title: "Mughal Miniature Art Workshop",
    date: "March 21, 2026",
    month: "MAR",
    day: "21",
    category: "Workshop",
    categoryColor: "#E8871A",
    description:
      "A hands-on master class in the delicate tradition of Mughal miniature painting, guided by a visiting artist from the National Crafts Museum of New Delhi.",
    time: "10:00 AM – 1:00 PM",
    location: "Education Studio",
    status: "CLOSED",
  },
  {
    id: "classical-concert",
    title: "Classical Indian Music Concert",
    date: "April 5, 2026",
    month: "APR",
    day: "05",
    category: "Performance",
    categoryColor: "#006B8F",
    description:
      "An intimate evening of Hindustani classical music featuring the sitar, tabla, and voice — exploring the meditative power of raga traditions.",
    time: "7:00 PM – 9:30 PM",
    location: "Main Auditorium",
    status: "OPEN",
  },
  {
    id: "silk-road-lecture",
    title: "Heritage Lecture: The Silk Road",
    date: "April 18, 2026",
    month: "APR",
    day: "18",
    category: "Lecture",
    categoryColor: "#2D6A4F",
    description:
      "Dr. Ananya Krishnamurti of Brown University traces India's role in the ancient Silk Road trade networks and the exchange of ideas, goods, and culture.",
    time: "4:00 PM – 6:00 PM",
    location: "Seminar Hall",
    status: "COMING SOON",
  },
];

/** Registration form field labels */
export const REGISTRATION_FORM = {
  title: "Register for Event",
  nameLabel: "Full Name",
  phoneLabel: "Phone Number",
  emailLabel: "Email Address",
  timeLabel: "Preferred Time",
  timeOptions: [
    { value: "", label: "Select a time" },
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
  ],
  submitLabel: "Register",
};
