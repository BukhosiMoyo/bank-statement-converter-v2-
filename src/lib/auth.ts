import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createPasswordResetTokenRecord,
  createSessionRecord,
  createUser,
  findUserByEmail,
  getSessionUserByTokenHash,
  resetUserPasswordByToken,
  type SessionUser,
} from "@/lib/app-data";
import { isDatabaseConnectivityError } from "@/lib/db";

export const SESSION_COOKIE_NAME = "bsc_session";
export const WORKSPACE_COOKIE_NAME = "bsc_workspace";
const SESSION_DURATION_DAYS = 30;
const PASSWORD_RESET_DURATION_MINUTES = 60;

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

function buildPasswordHash(password: string) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);

  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

function passwordResetExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_DURATION_MINUTES * 60 * 1000);
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function safeRedirectTarget(target: string | null | undefined) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return "/dashboard";
  }

  if (/[\r\n]/.test(target)) {
    return "/dashboard";
  }

  try {
    const url = new URL(target, "http://bankstatementconverter.local");

    if (url.origin !== "http://bankstatementconverter.local") {
      return "/dashboard";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

export function validateSignupInput(input: {
  name: string;
  email: string;
  password: string;
  referralCode?: string | null;
}) {
  if (input.name.trim().length < 2) {
    return "Enter your full name.";
  }

  if (!isValidEmailAddress(input.email)) {
    return "Enter a valid email address.";
  }

  if (input.password.length < 8) {
    return "Use at least 8 characters for the password.";
  }

  return null;
}

export function validateLoginInput(input: {
  email: string;
  password: string;
}) {
  if (!input.email.trim() || !input.password) {
    return "Enter your email and password.";
  }

  return null;
}

export function validatePasswordResetRequestInput(input: { email: string }) {
  if (!input.email.trim()) {
    return "Enter your email address.";
  }

  if (!isValidEmailAddress(input.email)) {
    return "Enter a valid email address.";
  }

  return null;
}

export function validatePasswordResetInput(input: {
  password: string;
  confirmPassword: string;
}) {
  if (input.password.length < 8) {
    return "Use at least 8 characters for the password.";
  }

  if (input.password !== input.confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, saltHex, derivedHex] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !saltHex || !derivedHex) {
    return false;
  }

  const derivedKey = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expectedKey = Buffer.from(derivedHex, "hex");

  if (derivedKey.length !== expectedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedKey);
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  referralCode?: string | null;
}) {
  const validationError = validateSignupInput(input);

  if (validationError) {
    throw new Error(validationError);
  }

  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = buildPasswordHash(input.password);
  let user = null;

  try {
    user = await createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      referralCode: input.referralCode ?? null,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new Error("An account with that email already exists.");
    }

    throw error;
  }

  if (!user) {
    throw new Error("Account creation failed.");
  }

  return user;
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}) {
  const validationError = validateLoginInput(input);

  if (validationError) {
    throw new Error(validationError);
  }

  const user = await findUserByEmail(input.email);

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }

  return user;
}

export async function issueSession(userId: string) {
  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = sessionExpiryDate();

  await createSessionRecord({
    userId,
    tokenHash: hashValue(sessionToken),
    expiresAt: expiresAt.toISOString(),
  });

  return {
    sessionToken,
    expiresAt,
  };
}

export async function requestPasswordReset(email: string) {
  const validationError = validatePasswordResetRequestInput({ email });

  if (validationError) {
    throw new Error(validationError);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const resetToken = randomBytes(32).toString("hex");
  const expiresAt = passwordResetExpiryDate();

  await createPasswordResetTokenRecord({
    userId: user.id,
    tokenHash: hashValue(resetToken),
    expiresAt: expiresAt.toISOString(),
  });

  return {
    email: user.email,
    expiresAt,
    name: user.name,
    resetToken,
    userId: user.id,
  };
}

export async function resetPassword(input: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const validationError = validatePasswordResetInput(input);

  if (validationError) {
    throw new Error(validationError);
  }

  const token = input.token.trim();

  if (!token) {
    throw new Error("This password reset link is invalid or expired.");
  }

  const user = await resetUserPasswordByToken({
    tokenHash: hashValue(token),
    passwordHash: buildPasswordHash(input.password),
  });

  if (!user) {
    throw new Error("This password reset link is invalid or expired.");
  }

  return user;
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  } as const;
}

export function workspaceCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  } as const;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const workspace = cookieStore.get(WORKSPACE_COOKIE_NAME)?.value ?? null;

  if (!token) {
    return null;
  }

  try {
    return await getSessionUserByTokenHash(hashValue(token), workspace);
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return null;
    }

    throw error;
  }
}

export async function requireCurrentUser(options?: {
  redirectTo?: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const target = safeRedirectTarget(options?.redirectTo);
    redirect(`/login?next=${encodeURIComponent(target)}`);
  }

  return user as SessionUser;
}

export function resolvePostAuthRedirect(target: string | null | undefined) {
  return safeRedirectTarget(target);
}
