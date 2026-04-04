import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { requireCurrentUser } from "@/lib/auth";
import { getPaymentRequestForUser, type PaymentRequest } from "@/lib/app-data";
import { getEftAccountDetails } from "@/lib/billing";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";

export const metadata = {
  title: "Payment",
};

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

function formatStatus(status: PaymentRequest["status"]) {
  switch (status) {
    case "awaiting_payment":
      return "Awaiting payment";
    case "proof_submitted":
      return "Proof submitted";
    case "under_review":
      return "Under review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function canManageProof(user: Awaited<ReturnType<typeof requireCurrentUser>>, paymentRequest: PaymentRequest) {
  if (paymentRequest.workspaceType === "personal") {
    return paymentRequest.workspaceUserId === user.id;
  }

  const membership = paymentRequest.organizationId
    ? user.organizations.find(
        (organization) => organization.id === paymentRequest.organizationId,
      ) ?? null
    : null;

  return membership?.role === "owner";
}

export default async function PaymentRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ paymentRequestId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/pricing" });
  const { paymentRequestId } = await params;
  const paymentRequest = await getPaymentRequestForUser(user.id, paymentRequestId);
  const query = await searchParams;
  const saved = readValue(query.saved);
  const error = readValue(query.error);

  if (!paymentRequest) {
    notFound();
  }

  const eftAccount = getEftAccountDetails();
  const canUploadProof = canManageProof(user, paymentRequest);
  const showInstructions =
    paymentRequest.status === "awaiting_payment" ||
    paymentRequest.status === "rejected";
  const showProofLink = canUploadProof && paymentRequest.hasProof;
  const canRemoveProof =
    canUploadProof &&
    paymentRequest.hasProof &&
    paymentRequest.status !== "approved" &&
    paymentRequest.status !== "under_review";
  const savedMessage =
    saved === "proof-removed"
      ? "Proof removed."
      : saved
        ? "Proof submitted."
        : null;

  return (
    <main className="pb-16">
      <SiteHeader />
      <section
        className={`mx-auto w-full ${SITE_CONTAINER_CLASS} px-4 pt-8 sm:px-6 lg:px-8`}
      >
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
                Payment
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {paymentRequest.displayName}
              </h1>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {paymentRequest.workspaceName}
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
            >
              Back to pricing
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              ["Status", formatStatus(paymentRequest.status)],
              ["Amount", paymentRequest.amountDisplay],
              ["Reference", paymentRequest.paymentReference],
              ["Expires", formatDate(paymentRequest.expiresAt)],
            ].map(([label, value]) => (
              <article
                key={label}
                className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                  {value}
                </p>
              </article>
            ))}
          </div>

          {savedMessage ? (
            <p className="mt-4 rounded-2xl border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
              {savedMessage}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              {error}
            </p>
          ) : null}

          {showInstructions ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <article className="rounded-[1.7rem] border border-black/8 bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  EFT details
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Account name", eftAccount.accountName],
                    ["Bank", eftAccount.bankName],
                    ["Account number", eftAccount.accountNumber],
                    ["Branch code", eftAccount.branchCode],
                    ["Amount", paymentRequest.amountDisplay],
                    ["Reference", paymentRequest.paymentReference],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm text-[var(--foreground)]">
                  Use this reference exactly.
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {paymentRequest.purchaseKind === "credits"
                    ? "Your credits will be added after payment is confirmed."
                    : "Your plan will activate after payment is confirmed."}
                </p>
              </article>

              <article className="rounded-[1.7rem] border border-black/8 bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Proof of payment
                </p>
                {canUploadProof ? (
                  <div className="mt-5 space-y-4">
                    <form
                      action={`/api/payments/${paymentRequest.id}/proof`}
                      className="grid gap-4"
                      method="post"
                      encType="multipart/form-data"
                    >
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium">File</span>
                        <input
                          className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                          name="proof"
                          type="file"
                          accept="application/pdf,image/png,image/jpeg,image/webp"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium">Note</span>
                        <input
                          className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                          name="note"
                          type="text"
                        />
                      </label>
                      <button
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                        type="submit"
                      >
                        Submit proof
                      </button>
                    </form>
                    {canRemoveProof ? (
                      <form
                        action={`/api/payments/${paymentRequest.id}/proof/remove`}
                        method="post"
                      >
                        <button
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
                          type="submit"
                        >
                          Remove proof
                        </button>
                      </form>
                    ) : null}
                    <div className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                      Proof files are used for manual review, then cleaned from processed requests after the retention window.
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                    Only the workspace owner can submit proof.
                  </div>
                )}
              </article>
            </div>
          ) : null}

          {!showInstructions ? (
            <div className="mt-6 rounded-[1.7rem] border border-black/8 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Status
              </p>
              <p className="mt-3 text-sm text-[var(--foreground)]">
                {paymentRequest.status === "proof_submitted" &&
                "Proof received. Waiting for review."}
                {paymentRequest.status === "under_review" &&
                "Payment is under review."}
                {paymentRequest.status === "approved" &&
                (paymentRequest.purchaseKind === "credits"
                  ? "Payment approved. Credits have been added to this workspace."
                  : "Payment approved. The plan is active for this workspace and the new cycle has started.")}
                {paymentRequest.status === "expired" &&
                (paymentRequest.purchaseKind === "credits"
                  ? "This request expired. Start a new credit purchase from pricing."
                  : "This request expired. Start a new upgrade from pricing.")}
              </p>
              {paymentRequest.status === "rejected" && paymentRequest.reviewNote ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {paymentRequest.reviewNote}
                </p>
              ) : null}
              {paymentRequest.reviewNote &&
              paymentRequest.status !== "rejected" &&
              paymentRequest.status !== "approved" ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {paymentRequest.reviewNote}
                </p>
              ) : null}
              {showProofLink ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/api/payments/${paymentRequest.id}/proof`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
                    target="_blank"
                  >
                    View proof
                  </Link>
                  {canRemoveProof ? (
                    <form
                      action={`/api/payments/${paymentRequest.id}/proof/remove`}
                      method="post"
                    >
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
                        type="submit"
                      >
                        Remove proof
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
