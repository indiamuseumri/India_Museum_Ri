/**
 * Leadership Section Content
 * ──────────────────────────
 * Edit this file to change leader names, roles, bios, and profile images.
 * Images are served from public/images/leadership/.
 *
 * // TODO: Replace static LEADERSHIP_DATA with Supabase fetch
 * // Table: leadership_profiles
 * // Fields: id, name, role, bio, image_url, is_memorial
 * // API: const { data } = await supabase.from('leadership_profiles').select('*').order('rank')
 */

export const LEADERSHIP_HEADER = {
  overline: "Institutional Leadership",
  heading: "Leadership",
  description:
    "Guided by distinguished scholars, diplomats, and community leaders, IMHSRI is governed with a shared commitment to cultural preservation and excellence.",
};

export interface LeaderItem {
  id: number;
  name: string;
  role: string;
  image: string;
  isMemorial: boolean;
  bio: string;
}

export const LEADERSHIP_DATA: LeaderItem[] = [
  {
    id: 1,
    name: "Subhash Chander",
    role: "President",
    image: "/images/leadership/president.jpeg",
    isMemorial: false,
    bio: "", // TODO: Populate from Supabase — table: leadership_profiles, field: bio
  },
  {
    id: 2,
    name: 'Late Kul Bhushan "Bush" Chaudhary',
    role: "Founder",
    image: "/images/leadership/founder.jpeg",
    isMemorial: true,
    bio: "", // TODO: Populate from Supabase — table: leadership_profiles, field: bio
  },
  {
    id: 3,
    name: "Mahesh Patel",
    role: "Patron",
    image: "/images/leadership/patron.jpeg",
    isMemorial: false,
    bio: "", // TODO: Populate from Supabase — table: leadership_profiles, field: bio
  },
  {
    id: 4,
    name: "Nitin Trivedi",
    role: "Treasurer",
    image: "/images/leadership/treasurer.jpeg",
    isMemorial: false,
    bio: "", // TODO: Populate from Supabase — table: leadership_profiles, field: bio
  },
  {
    id: 5,
    name: "Debbie Trivedi",
    role: "Secretary",
    image: "/images/leadership/secretary.jpeg",
    isMemorial: false,
    bio: "", // TODO: Populate from Supabase — table: leadership_profiles, field: bio
  },
];
