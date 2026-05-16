/**
 * Visit Section Content
 * ─────────────────────
 * Edit this file to change opening hours, address, parking info, admission
 * prices, accessibility details, and the contact email/CTA.
 */

export const VISIT_HEADER = {
  overline: "Plan Your Visit",
  headlinePart1: "We'd Love to",
  headlineItalic: "Welcome You",
};

export const HOURS = [
  { day: "Tuesday – Friday", time: "10:00 AM – 5:00 PM" },
  { day: "Saturday", time: "10:00 AM – 6:00 PM" },
  { day: "Sunday", time: "12:00 PM – 5:00 PM" },
  { day: "Monday", time: "Closed" },
];

export const MAP_LABEL = "India Museum & Heritage Society";
export const MAP_LOCATION = "Providence, Rhode Island";
export const MAP_URL =
  "https://maps.google.com/?q=India+Museum+Heritage+Society+Rhode+Island";
export const MAP_DIRECTIONS_LABEL = "Get Directions";

export interface InfoCardItem {
  id: string;
  title: string;
  /** String array of content lines, joined by line breaks in the UI */
  lines: string[];
}

export const INFO_CARDS: InfoCardItem[] = [
  {
    id: "address",
    title: "Location",
    lines: [
      "India Museum & Heritage Society of Rhode Island",
      "Providence, Rhode Island",
      "United States",
    ],
  },
  {
    id: "parking",
    title: "Parking",
    lines: [
      "Free parking available on premises.",
      "Street parking on adjacent roads.",
      "Accessible van-accessible spaces provided.",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    lines: [
      "Fully wheelchair accessible.",
      "Tactile guides for visually impaired visitors.",
      "ASL interpretation available on request.",
      "Assistive listening devices provided.",
    ],
  },
  {
    id: "admission",
    title: "Admission",
    lines: [
      "Adults: $12 · Seniors & Students: $8",
      "Children under 12: Free",
      "Members: Always Free",
      "Free first Sunday of every month",
    ],
  },
];

export const CONTACT = {
  prompt: "Questions? We're here to help.",
  email: "info@imhsri.org",
  ctaLabel: "Contact Us",
};
