import { redirect } from "next/navigation";

import {
  getConfiguredAdminEmails,
  isConfiguredAdminEmail,
} from "@/lib/admin-config";
import { getCurrentUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/app-data";

export { getConfiguredAdminEmails };

export function isAdminEmail(email: string) {
  return isConfiguredAdminEmail(email);
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user as SessionUser;
}
