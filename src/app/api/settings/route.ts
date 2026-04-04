import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { updateUserSettings } from "@/lib/app-data";
import { isSupportedCurrency } from "@/lib/currencies";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard%2Fsettings");
  }

  const formData = await request.formData();
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();
  const preferredCurrency = String(formData.get("preferredCurrency") ?? "")
    .trim()
    .toUpperCase();
  const exportName = String(formData.get("exportName") ?? "").trim();
  const defaultProjectId = String(formData.get("defaultProjectId") ?? "").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/settings").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/settings";

  if (!workspaceName || !preferredCurrency || !exportName) {
    return buildRedirect(
      request,
      `${returnTo}?error=` +
        encodeURIComponent("Complete all settings fields before saving."),
    );
  }

  if (!isSupportedCurrency(preferredCurrency)) {
    return buildRedirect(
      request,
      `${returnTo}?error=` +
        encodeURIComponent("Choose a supported currency."),
    );
  }

  try {
    await updateUserSettings(currentUser.id, {
      workspaceName,
      preferredCurrency,
      exportName,
      defaultProjectId: defaultProjectId || null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Settings could not be updated.";

    return buildRedirect(
      request,
      `${returnTo}?error=` + encodeURIComponent(message),
    );
  }

  return buildRedirect(request, `${returnTo}?saved=1`);
}
