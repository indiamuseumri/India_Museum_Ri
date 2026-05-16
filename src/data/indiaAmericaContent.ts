/**
 * India & America (Mission) Section Content
 * ──────────────────────────────────────────
 * Edit this file to change the "Our Mission" section text and pillar cards.
 * The editorial image is the museum building photo from public/images/museum-building/.
 */

export const EDITORIAL_IMAGE = "/images/museum-building/museum-building.jpeg";

export const EDITORIAL_IMAGE_ALT =
  "India Museum and Heritage Society of Rhode Island building, Providence RI";

export const INDIA_AMERICA_HEADER = {
  overline: "Our Mission",
  headlinePart1: "Where Two Great",
  headlineItalic: "Civilizations Meet",
};

export const INDIA_AMERICA_BODY = [
  "The India Museum and Heritage Society of Rhode Island stands as a permanent cultural bridge — preserving five millennia of Indian civilization.",
  "We celebrate this rich heritage and its profound resonance with American values of liberty, pluralism, and the pursuit of knowledge.",
];

export interface PillarItem {
  heading: string;
  body: string;
  /** Stroke color for the SVG icon */
  iconColor: string;
}

export const PILLARS: PillarItem[] = [
  {
    heading: "Preservation of Heritage",
    body: "Safeguarding the art, literature, and living traditions of Indian civilization for future generations.",
    iconColor: "#E8871A",
  },
  {
    heading: "A Cultural Bridge",
    body: "Connecting India and America through shared values, mutual respect, and cross-cultural understanding.",
    iconColor: "#006B8F",
  },
  {
    heading: "Education & Engagement",
    body: "Empowering the community through educational programs, public events, and active civic participation.",
    iconColor: "#2D6A4F",
  },
];
