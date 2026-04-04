import Link from "next/link";

import { PaymentRequestPanel } from "@/components/payment-request-panel";
import { SiteHeader } from "@/components/site-header";
import { listCreditBundles } from "@/lib/billing";
import { getCurrentUser } from "@/lib/auth";
import {
  canManageWorkspacePlan,
  getWorkspacePendingPaymentRequest,
  getWorkspacePlanSummary,
  getWorkspaceScope,
} from "@/lib/app-data";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { listPlanDefinitions } from "@/lib/plans";

export const metadata = {
  title: "Pricing",
};

const ENTERPRISE_CONTACT_HREF =
  "mailto:sales@bankstatementconverter.com?subject=Enterprise%20plan";

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const saved = readValue(params.saved);
  const error = readValue(params.error);
  const workspace = currentUser ? getWorkspaceScope(currentUser) : null;
  const [planSummary, pendingPayment] = currentUser
    ? await Promise.all([
        getWorkspacePlanSummary(workspace!),
        getWorkspacePendingPaymentRequest(currentUser.id, workspace!),
      ])
    : [null, null];
  const plans = listPlanDefinitions();
  const creditBundles = listCreditBundles();
  const canManagePlan = workspace ? canManageWorkspacePlan(workspace) : false;

  return (
    <main className="pb-16">
      <SiteHeader />
      <section
        className={`mx-auto w-full ${SITE_CONTAINER_CLASS} px-4 pb-12 pt-8 sm:px-6 lg:px-8`}
      >
        <div className="max-w-2xl">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Pricing
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Pricing built for accountants.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            Process bank statements faster, keep client work organized, and move up only when your monthly workload grows.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            No card required to get started. Upgrade anytime.
          </p>
          {currentUser ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              {currentUser.activeWorkspace.name}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = planSummary?.planId === plan.id;
            const isPendingPlan =
              pendingPayment?.purchaseKind === "plan" &&
              pendingPayment.planId === plan.id;
            const projectAllowance =
              plan.projectLimit === null
                ? "Manage multiple clients"
                : `${plan.projectLimit} client workspace`;

            return (
              <article
                key={plan.id}
                className={`panel rounded-[2rem] p-6 ${
                  plan.badgeLabel ? "border-[rgba(22,106,91,0.24)] bg-white" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
                    {plan.name}
                  </p>
                  {isCurrentPlan ? (
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]">
                      Current
                    </span>
                  ) : plan.badgeLabel ? (
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]">
                      {plan.badgeLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-6 text-5xl font-semibold tracking-tight text-[var(--foreground)]">
                  {plan.price}
                  {plan.interval ? (
                    <span className="text-base font-medium text-[var(--muted)]">
                      {plan.interval}
                    </span>
                  ) : null}
                </p>
                <p className="mt-4 text-sm text-[var(--foreground)]">
                  {plan.description}
                </p>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {plan.contactOnly
                    ? "Custom statement volumes"
                    : `${plan.monthlyConversionLimit} statements / month`}
                  {" · "}
                  {plan.contactOnly ? "Custom workspace setup" : projectAllowance}
                </p>
                <div className="mt-6 space-y-3">
                  {plan.notes.map((note) => (
                    <div
                      key={note}
                      className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--foreground)]"
                    >
                      {note}
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  {plan.contactOnly ? (
                    <Link
                      href={ENTERPRISE_CONTACT_HREF}
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
                    >
                      {plan.ctaLabel}
                    </Link>
                  ) : currentUser ? (
                    <form action="/api/plan" method="post">
                      <input name="planId" type="hidden" value={plan.id} />
                      <input name="billingCycle" type="hidden" value="monthly" />
                      <input name="returnTo" type="hidden" value="/pricing" />
                      <button
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-55"
                        disabled={isCurrentPlan || !canManagePlan}
                        type="submit"
                      >
                        {isCurrentPlan
                          ? "Current plan"
                          : isPendingPlan
                            ? "Continue payment"
                          : canManagePlan
                            ? plan.ctaLabel
                            : "Owner only"}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/signup"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
                    >
                      {plan.ctaLabel}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <section className="panel mt-10 rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
            Credit packs
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Credits are perfect for occasional use or when you need extra statements beyond your monthly plan.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Subscriptions are best for regular use. Credits are best for top-ups or occasional work.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {creditBundles.map((bundle) => {
              const isPendingBundle =
                pendingPayment?.purchaseKind === "credits" &&
                pendingPayment.creditBundleId === bundle.id;

              return (
                <article key={bundle.id} className="rounded-[1.7rem] border border-black/8 bg-white/72 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
                      {bundle.name}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {new Intl.NumberFormat("en-ZA", {
                        style: "currency",
                        currency: "ZAR",
                        minimumFractionDigits: 2,
                      }).format(bundle.amountMinor / 100)}
                    </p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      "Credits do not expire",
                      "Best for top-ups and occasional work",
                      "Added after EFT approval",
                    ].map((note) => (
                      <div
                        key={note}
                        className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--foreground)]"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    {currentUser ? (
                      <form action="/api/plan" method="post">
                        <input name="creditBundleId" type="hidden" value={bundle.id} />
                        <input name="billingCycle" type="hidden" value="one_time" />
                        <input name="returnTo" type="hidden" value="/pricing" />
                        <button
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={!canManagePlan}
                          type="submit"
                        >
                          {isPendingBundle
                            ? "Continue payment"
                            : canManagePlan
                              ? bundle.ctaLabel
                              : "Owner only"}
                        </button>
                      </form>
                    ) : (
                      <Link
                        href="/signup"
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
                      >
                        {bundle.ctaLabel}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {pendingPayment ? (
          <div className="mt-6">
            <PaymentRequestPanel
              paymentRequest={pendingPayment}
              href={`/payments/${pendingPayment.id}`}
            />
          </div>
        ) : null}

        {saved ? (
          <p className="mt-6 rounded-2xl border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
            Plan updated.
          </p>
        ) : null}
        {error ? (
          <p className="mt-6 rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
            {error}
          </p>
        ) : null}

        <section className="panel mt-10 rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
            How it works
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            {[
              "Starter works instantly and includes 5 statements each month.",
              "Projects keep each client or job in its own workspace.",
              "Business adds organization workspaces for shared client work.",
              "Paid plans use EFT, proof upload, and activation after approval.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.6rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--foreground)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="panel mt-10 rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
            Allowance
          </p>
          <div className="mt-5 overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white/72">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgba(255,255,255,0.82)] text-[var(--muted)]">
                <tr>
                  {["Plan", "Statements", "Clients"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-t border-black/6">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {plan.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {plan.contactOnly
                        ? "Custom"
                        : `${plan.monthlyConversionLimit} / month`}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {plan.contactOnly
                        ? "Custom"
                        : plan.projectLimit === null
                          ? "Unlimited"
                          : String(plan.projectLimit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
