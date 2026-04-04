import { redirect } from "next/navigation";

import { ConverterWorkspace } from "@/components/converter-workspace";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Convert",
};

function buildDashboardConvertPath(input: {
  conversionId: string | null;
  handoffId: string | null;
}) {
  const params = new URLSearchParams();

  if (input.conversionId) {
    params.set("conversion", input.conversionId);
  }

  if (input.handoffId) {
    params.set("handoff", input.handoffId);
  }

  const serialized = params.toString();
  return serialized ? `/dashboard/convert?${serialized}` : "/dashboard/convert";
}

export default async function ConvertPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const conversionId =
    typeof params.conversion === "string" ? params.conversion : null;
  const handoffId = typeof params.handoff === "string" ? params.handoff : null;

  if (user) {
    redirect(buildDashboardConvertPath({ conversionId, handoffId }));
  }

  if (conversionId) {
    redirect(
      `/login?next=${encodeURIComponent(
        buildDashboardConvertPath({ conversionId, handoffId: null }),
      )}`,
    );
  }

  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="mx-auto w-full max-w-[94rem] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <ConverterWorkspace
          canManageSavedConversion={false}
          defaultCurrency="ZAR"
          defaultExportName={null}
          initialUploadHandoffId={handoffId}
          initialPreview={null}
          initialConversionId={null}
          initialProjectId={null}
          isAuthenticated={false}
          usageSummary={null}
          workspaceLabel="Personal"
          workspaceType="personal"
          projects={[]}
        />
      </section>
    </main>
  );
}
