export const ADMIN_CONFIG = {
  ADMIN_EMAIL: "webdevcody@gmail.com",
} as const;

export const isAdminEmail = (email: string | null | undefined): boolean => {
  return email === ADMIN_CONFIG.ADMIN_EMAIL;
};
