export const ADMIN_EMAIL = "indiamuseumofrhodeisland@gmail.com";

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL;
};
