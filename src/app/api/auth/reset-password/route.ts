import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/auth";
import { isDatabaseConnectivityError } from "@/lib/db";
import {
  logEmailError,
  sendPasswordResetConfirmationEmail,
} from "@/lib/email";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function describeError(error: unknown): string {
  if (isDatabaseConnectivityError(error)) {
    return "Password reset could not be completed.";
  }

  if (error instanceof AggregateError) {
    const nested: string = error.errors
      .map((entry) => describeError(entry))
      .filter(Boolean)
      .join(" | ");

    return nested || error.message || "Password reset could not be completed.";
  }

  if (error instanceof Error) {
    return error.message || "Password reset could not be completed.";
  }

  return "Password reset could not be completed.";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  try {
    const user = await resetPassword({
      confirmPassword,
      password,
      token,
    });

    await sendPasswordResetConfirmationEmail({
      email: user.email,
      name: user.name,
    }).catch((error) => {
      logEmailError("password reset confirmation", error, {
        email: user.email,
        userId: user.id,
      });
    });

    return buildRedirect(
      request,
      `/login?message=${encodeURIComponent(
        "Your password has been updated. Sign in with your new password.",
      )}`,
    );
  } catch (error) {
    const message = describeError(error);

    return buildRedirect(
      request,
      `/reset-password?error=${encodeURIComponent(message)}&token=${encodeURIComponent(token)}`,
    );
  }
}
