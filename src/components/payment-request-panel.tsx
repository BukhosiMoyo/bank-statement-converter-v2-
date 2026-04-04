import Link from "next/link";

import type { PaymentRequest } from "@/lib/app-data";

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

function getStatusClass(status: PaymentRequest["status"]) {
  switch (status) {
    case "approved":
      return "bg-[rgba(22,106,91,0.14)] text-[var(--accent)]";
    case "rejected":
    case "expired":
      return "bg-[rgba(140,63,63,0.12)] text-[#8c3f3f]";
    default:
      return "bg-[rgba(197,142,70,0.16)] text-[#8a5c1e]";
  }
}

function resolveNextAction(paymentRequest: PaymentRequest) {
  switch (paymentRequest.status) {
    case "awaiting_payment":
      return "Next: pay and upload proof";
    case "proof_submitted":
      return "Next: waiting for review";
    case "under_review":
      return "Next: waiting for approval";
    case "approved":
      return paymentRequest.purchaseKind === "credits"
        ? "Credits added"
        : "Plan activation completed";
    case "rejected":
      return "Next: upload proof again";
    case "expired":
      return paymentRequest.purchaseKind === "credits"
        ? "Next: request a new credit purchase"
        : "Next: request a new upgrade";
    default:
      return null;
  }
}

export function PaymentRequestPanel({
  paymentRequest,
  href,
  actionLabel = "Open payment",
}: {
  paymentRequest: PaymentRequest;
  href: string;
  actionLabel?: string;
}) {
  const nextAction = resolveNextAction(paymentRequest);

  return (
    <div className="rounded-[1.7rem] border border-black/8 bg-white/72 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Payment
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {paymentRequest.displayName}
            </p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(paymentRequest.status)}`}
            >
              {formatStatus(paymentRequest.status)}
            </span>
          </div>
          {nextAction ? (
            <p className="mt-2 text-sm text-[var(--muted)]">{nextAction}</p>
          ) : null}
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {paymentRequest.purchaseKind === "credits" ? "Credits" : "Amount"}
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
            {paymentRequest.purchaseKind === "credits"
              ? `${paymentRequest.creditQuantity ?? 0} credits`
              : paymentRequest.amountDisplay}
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {paymentRequest.purchaseKind === "credits" ? "Amount" : "Reference"}
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--foreground)]">
            {paymentRequest.purchaseKind === "credits"
              ? paymentRequest.amountDisplay
              : paymentRequest.paymentReference}
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {paymentRequest.purchaseKind === "credits" ? "Reference" : "Expires"}
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
            {paymentRequest.purchaseKind === "credits"
              ? paymentRequest.paymentReference
              : new Intl.DateTimeFormat("en-ZA", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(paymentRequest.expiresAt))}
          </p>
        </div>
      </div>
      {paymentRequest.purchaseKind === "credits" ? (
        <div className="mt-3 rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Expires
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
            {new Intl.DateTimeFormat("en-ZA", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(paymentRequest.expiresAt))}
          </p>
        </div>
      ) : null}
    </div>
  );
}
