export const ADMIN_EMAIL = "indiamuseumofrhodeisland@gmail.com";

export const isAdminEmail = (email?: string | null): boolean =>
  email === ADMIN_EMAIL;
