export function getConfiguredAdminEmails() {
  const configured = process.env.ADMIN_EMAILS ?? "";

  return configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isConfiguredAdminEmail(email: string) {
  return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}
