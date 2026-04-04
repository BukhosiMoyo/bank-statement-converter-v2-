import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { deleteSessionByTokenHash } from "@/lib/app-data";
import {
  hashValue,
  SESSION_COOKIE_NAME,
  WORKSPACE_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  if (token) {
    await deleteSessionByTokenHash(hashValue(token));
  }

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set(WORKSPACE_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
  });
  return response;
}
