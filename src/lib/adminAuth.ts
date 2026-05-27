const ADMIN_EMAILS: string[] = [
  "indiamuseumofrhodeisland@gmail.com",
  // Add additional approved admin emails below this line
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
