import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/lib/auth";
import { isDatabaseConnectivityError } from "@/lib/db";
import {
  logEmailError,
  sendPasswordResetEmail,
} from "@/lib/email";

const RESET_REQUEST_MESSAGE =
  "If an account exists for that email, we sent a password reset link.";

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
  const email = String(formData.get("email") ?? "");

  try {
    const resetRequest = await requestPasswordReset(email);

    if (resetRequest) {
      const resetUrl = `/reset-password?token=${encodeURIComponent(
        resetRequest.resetToken,
      )}`;

      await sendPasswordResetEmail({
        email: resetRequest.email,
        expiresAt: resetRequest.expiresAt.toISOString(),
        name: resetRequest.name,
        resetUrl,
      }).catch((error) => {
        logEmailError("password reset", error, {
          email: resetRequest.email,
          userId: resetRequest.userId,
        });
      });
    }

    return buildRedirect(
      request,
      `/forgot-password?message=${encodeURIComponent(RESET_REQUEST_MESSAGE)}`,
    );
  } catch (error) {
    const message = describeError(error);

    return buildRedirect(
      request,
      `/forgot-password?error=${encodeURIComponent(message)}&email=${encodeURIComponent(email)}`,
    );
  }
}
