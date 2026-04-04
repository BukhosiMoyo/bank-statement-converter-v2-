import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Sign in",
};

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = readValue(params.error);
  const next = readValue(params.next);

  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="mx-auto w-full max-w-md px-4 pt-10 sm:px-6 lg:px-8">
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Sign in
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Access your workspace.
          </h1>
          <form
            action="/api/auth/login"
            className="mt-8 space-y-4"
            method="post"
          >
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                name="email"
                type="email"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <input
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                name="password"
                type="password"
              />
            </label>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
              type="submit"
            >
              Continue
            </button>
          </form>
          {error ? (
            <p className="mt-4 rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              {error}
            </p>
          ) : null}
          <p className="mt-6 text-sm text-[var(--muted)]">
            No account yet?{" "}
            <Link className="text-[var(--accent)]" href="/signup">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
