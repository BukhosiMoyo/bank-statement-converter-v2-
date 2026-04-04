import { NextResponse } from "next/server";

import {
  issueSession,
  registerUser,
  resolvePostAuthRedirect,
  SESSION_COOKIE_NAME,
  WORKSPACE_COOKIE_NAME,
  sessionCookieOptions,
  workspaceCookieOptions,
} from "@/lib/auth";
import { logEmailError, sendWelcomeEmail } from "@/lib/email";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const referralCode = String(formData.get("referralCode") ?? "");
  const next = String(formData.get("next") ?? "");

  try {
    const user = await registerUser({ name, email, password, referralCode });
    const session = await issueSession(user.id);
    await sendWelcomeEmail({
      email: user.email,
      name: user.name,
    }).catch((error) => {
      logEmailError("signup welcome", error, {
        email: user.email,
        userId: user.id,
      });
    });
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
    const message =
      error instanceof Error
        ? error.message
        : "Account creation could not be completed.";

    return buildRedirect(
      request,
      `/signup?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}&ref=${encodeURIComponent(referralCode)}`,
    );
  }
}
