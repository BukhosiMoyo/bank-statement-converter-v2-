import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Settings",
};

export default async function SettingsRedirectPage() {
  await requireCurrentUser({ redirectTo: "/dashboard/settings" });
  redirect("/dashboard/settings");
}
