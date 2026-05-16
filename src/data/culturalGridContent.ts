/**
 * Cultural Grid (Exhibitions) Content
 * ────────────────────────────────────
 * Edit this file to change the exhibitions section header and individual culture cards.
 * Images are external URLs — replace them to change card imagery.
 */

export const CULTURAL_GRID_HEADER = {
  overline: "Exhibitions",
  heading: "Explore the Exhibitions",
  description:
    "India is not one story — it is a thousand. Each tradition, language, and art form reveals a unique thread in an extraordinary tapestry.",
};

export interface CultureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  image: string;
}

export const CULTURES: CultureItem[] = [
  {
    id: "faith",
    title: "Faith & Philosophy",
    subtitle: "Dharma · Karma · Moksha",
    description:
      "Explore millennia of spiritual thought — from the Vedic hymns and Upanishads to the living traditions of Hinduism, Buddhism, Jainism, and Sikhism.",
    color: "#C9184A",
    accent: "#E8A0B4",
    icon: "🪷",
    image:
      "https://images.unsplash.com/photo-1633617127680-18229ebb1b94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIaW5kdSUyMHRlbXBsZSUyMHByYXllciUyMHNwaXJpdHVhbCUyMGluZGlhfGVufDF8fHx8MTc3MjY0NjU0MXww&ixlib=rb-4.1.0&q=80&w=800",
  },
  {
    id: "art",
    title: "Art & Architecture",
    subtitle: "Stone · Bronze · Canvas",
    description:
      "Marvel at intricate temple carvings, Mughal miniatures, Rajput frescoes, and the ancient geometries that shaped civilizations across millennia.",
    color: "#E8871A",
    accent: "#F5C07A",
    icon: "🏛️",
    image:
      "https://images.unsplash.com/photo-1766327562692-4321958545d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBpbnRyaWNhdGUlMjBzdG9uZSUyMGNhcnZpbmd8ZW58MXx8fHwxNzcyNjQ2NTQyfDA&ixlib=rb-4.1.0&q=80&w=800",
  },
  {
    id: "music",
    title: "Music & Dance",
    subtitle: "Raga · Tala · Abhinaya",
    description:
      "From Bharatanatyam's precise mudras to the soaring melodies of Hindustani classical music — India's performing arts speak a universal language.",
    color: "#006B8F",
    accent: "#7BC8E0",
    icon: "🎵",
    image:
      "https://images.unsplash.com/photo-1764014792669-021d8e197f05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBjbGFzc2ljYWwlMjBkYW5jZSUyMGJoYXJhdGFuYXR5YW0lMjBwZXJmb3JtZXJ8ZW58MXx8fHwxNzcyNjQ2NTQyfDA&ixlib=rb-4.1.0&q=80&w=800",
  },
  {
    id: "literature",
    title: "Literature & Languages",
    subtitle: "Sanskrit · Tamil · Urdu",
    description:
      "Home to over 20 scheduled languages, India's literary heritage spans ancient epics, devotional poetry, and a rich tradition of scholarly inquiry.",
    color: "#2D6A4F",
    accent: "#74C69D",
    icon: "📜",
    image:
      "https://images.unsplash.com/photo-1562164914-f71b2835e86b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwU2Fuc2tyaXQlMjBtYW51c2NyaXB0JTIwSW5kaWFuJTIwbGl0ZXJhdHVyZXxlbnwxfHx8fDE3NzI2NDY1NDN8MA&ixlib=rb-4.1.0&q=80&w=800",
  },
  {
    id: "traditions",
    title: "Ethnic Traditions",
    subtitle: "Festivals · Textiles · Cuisine",
    description:
      "Celebrate the vibrant mosaic of India's ethnic diversity — from the silk looms of Varanasi to the harvest festivals that mark the rhythm of life.",
    color: "#1B2A6B",
    accent: "#8093E8",
    icon: "🎆",
    image:
      "https://images.unsplash.com/photo-1690814033781-f369d45a8277?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMEluZGlhbiUyMGN1bHR1cmFsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzI2NDY1NDN8MA&ixlib=rb-4.1.0&q=80&w=800",
  },
];
