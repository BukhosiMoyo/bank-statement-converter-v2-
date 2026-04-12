import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Forgot password",
  description:
    "Request a password reset link for your Bank Statement Converter account.",
  path: "/forgot-password",
  noIndex: true,
});

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = readValue(params.error);
  const message = readValue(params.message);
  const email = readValue(params.email);

  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="mx-auto w-full max-w-md px-4 pt-10 sm:px-6 lg:px-8">
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Forgot password
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Reset your password.
          </h1>
          <form
            action="/api/auth/forgot-password"
            className="mt-8 space-y-4"
            method="post"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                defaultValue={email}
                name="email"
                type="email"
              />
            </label>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
              type="submit"
            >
              Send reset link
            </button>
          </form>
          {error ? (
            <p className="mt-4 rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-2xl border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
              {message}
            </p>
          ) : null}
          <p className="mt-6 text-sm text-[var(--muted)]">
            Back to{" "}
            <Link className="text-[var(--accent)]" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
