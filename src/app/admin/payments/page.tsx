import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin";

export const metadata = {
  title: "Admin Payments",
};

export default async function AdminPaymentsRedirectPage() {
  await requireAdminUser();
  redirect("/dashboard/admin/payments");
}
