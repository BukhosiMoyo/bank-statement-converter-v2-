import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/app-data";

export function getConfiguredAdminEmails() {
  const configured = process.env.ADMIN_EMAILS ?? "";
  return configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user as SessionUser;
}
