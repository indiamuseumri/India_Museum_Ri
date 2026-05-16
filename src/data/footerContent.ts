/**
 * Footer Content
 * ──────────────
 * Edit this file to change footer links, social media URLs, newsletter copy,
 * tagline, and legal text.
 */

export const FOOTER_TAGLINE = "India's Heritage. America's Home.";

export const FOOTER_TAGLINE_SECONDARY =
  "Celebrating India's Heritage. Enriching America's Cultural Tapestry.";

export const FOOTER_DESCRIPTION =
  "A non-profit institution dedicated to preserving and celebrating India's extraordinary cultural heritage in Rhode Island and beyond.";

export const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Visit: [
    { label: "Plan Your Visit", href: "#visit" },
    { label: "Exhibitions", href: "#exhibitions" },
    { label: "Accessibility", href: "#visit" },
  ],
  Engage: [
    { label: "Events Calendar", href: "#events" },
    { label: "Membership", href: "#" },
    { label: "Education Programs", href: "#" },
    { label: "Volunteer", href: "#" },
  ],
  Support: [
    { label: "Donate", href: "#donate" },
    { label: "Contact Us", href: "mailto:info@imhsri.org" },
  ],
};

/** Social media links — update href values with real profile URLs */
export const SOCIAL_LINKS = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
];

export const NEWSLETTER = {
  heading: "Stay Connected",
  description:
    "Receive exhibition news, event invitations, and cultural insights.",
  placeholder: "your@email.com",
  buttonLabel: "Subscribe",
};

export const LEGAL_LINKS = ["Privacy Policy", "Terms of Use", "Accessibility"];

export const COPYRIGHT_TEMPLATE =
  "© {{year}} India Museum and Heritage Society of Rhode Island. All Rights Reserved.";
