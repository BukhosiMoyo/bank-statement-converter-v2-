import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Reset password",
  description: "Set a new password for your Bank Statement Converter account.",
  path: "/reset-password",
  noIndex: true,
});

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = readValue(params.error);
  const token = readValue(params.token);

  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="mx-auto w-full max-w-md px-4 pt-10 sm:px-6 lg:px-8">
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Reset password
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Choose a new password.
          </h1>
          {token ? (
            <form
              action="/api/auth/reset-password"
              className="mt-8 space-y-4"
              method="post"
            >
              <input name="token" type="hidden" value={token} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  New password
                </span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  name="password"
                  type="password"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Confirm password
                </span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  name="confirmPassword"
                  type="password"
                />
              </label>
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                type="submit"
              >
                Reset password
              </button>
            </form>
          ) : (
            <p className="mt-8 rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              This password reset link is invalid or expired.
            </p>
          )}
          {error ? (
            <p className="mt-4 rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              {error}
            </p>
          ) : null}
          <p className="mt-6 text-sm text-[var(--muted)]">
            Need a new link?{" "}
            <Link className="text-[var(--accent)]" href="/forgot-password">
              Request another reset email
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
