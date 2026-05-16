/**
 * Donation Strip Content
 * ──────────────────────
 * Edit this file to change the donation section headline, description,
 * suggested amounts, and CTA button text.
 */

export const DONATION_CONTENT = {
  headlinePart1: "Preserve Heritage.",
  headlineItalic: "Inspire Generations.",

  description:
    "Your gift sustains our programs, preserves rare artifacts, and ensures that India's extraordinary heritage remains alive for future generations of Americans to discover and celebrate.",

  /** Donation amount buttons — the first one matching defaultSelected is pre-selected */
  amounts: ["$25", "$50", "$100", "$250", "Other"],
  defaultSelected: "$50",

  ctaLabel: "Donate", // Followed by the selected amount, e.g. "Donate $50"
  ctaHref: "#donate-form",

  trustLine: "501(c)(3) Non-profit · Secure · Tax-deductible",
};
