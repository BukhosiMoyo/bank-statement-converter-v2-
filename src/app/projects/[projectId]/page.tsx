import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Project",
};

export default async function ProjectRedirectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  await requireCurrentUser({
    redirectTo: `/dashboard/projects/${projectId}`,
  });
  redirect(`/dashboard/projects/${projectId}`);
}
