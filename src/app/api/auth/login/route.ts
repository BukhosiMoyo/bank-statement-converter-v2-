import { NextResponse } from "next/server";

import {
  authenticateUser,
  issueSession,
  resolvePostAuthRedirect,
  SESSION_COOKIE_NAME,
  WORKSPACE_COOKIE_NAME,
  sessionCookieOptions,
  workspaceCookieOptions,
} from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function describeError(error: unknown): string {
  if (error instanceof AggregateError) {
    const nested = error.errors
      .map((entry) => describeError(entry))
      .filter(Boolean)
      .join(" | ");

    return nested || error.message || "Login could not be completed.";
  }

  if (error instanceof Error) {
    return error.message || `${error.name || "Error"} occurred.`;
  }

  return "Login could not be completed.";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  try {
    const user = await authenticateUser({ email, password });
    const session = await issueSession(user.id);
    const response = buildRedirect(request, resolvePostAuthRedirect(next));

    response.cookies.set(
      SESSION_COOKIE_NAME,
      session.sessionToken,
      sessionCookieOptions(session.expiresAt),
    );
    response.cookies.set(
      WORKSPACE_COOKIE_NAME,
      "personal",
      workspaceCookieOptions(),
    );

    return response;
  } catch (error) {
    const message = describeError(error);

    return buildRedirect(
      request,
      `/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`,
    );
  }
}
