# Bank Statement Converter

Next.js application for converting bank statement PDFs into accountant-friendly exports.

## Current Slice

- Marketing home page
- Converter route with PDF upload
- First-pass preview generation for digital PDFs
- CSV download from preview rows
- Email/password authentication with persistent sessions
- Saved user-owned conversions with dashboard history
- Functional account settings persistence

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- `pdfjs-dist` for first-pass PDF text extraction
- `pg` for parser feedback persistence

## Run

Start Postgres locally:

```bash
docker compose up -d
```

Create `.env.local` from `.env.example`, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run build
```

## Deployment

The app is ready to deploy as a standard Next.js application.

### Required environment variables

Set these in your deployment platform before going live:

```bash
SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
DATABASE_URL=postgresql://...
ADMIN_EMAILS=you@example.com
EFT_ACCOUNT_NAME=Your Business Name
EFT_BANK_NAME=Your Bank
EFT_ACCOUNT_NUMBER=Your Account Number
EFT_BRANCH_CODE=Your Branch Code
```

### Optional environment variables

Use these when the related features should be active in production:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM="Bank Statement Converter <billing@your-domain.com>"
EMAIL_FROM_ACCOUNTS="Your Brand <accounts@your-domain.com>"
EMAIL_FROM_BILLING="Your Brand <billing@your-domain.com>"
PAYMENT_PROOF_RETENTION_DAYS=30
```

### Notes for production

- Use a managed Postgres database in production.
- Do not set `PGSSL=disable` for a hosted database unless your provider explicitly requires it.
- `RESEND_API_KEY` is required for transactional email delivery.
- Use `EMAIL_FROM_ACCOUNTS` and `EMAIL_FROM_BILLING` if you want different sender identities for account emails and payment emails.
- `SITE_URL` and `NEXT_PUBLIC_SITE_URL` should point to the final public domain.
- `ADMIN_EMAILS` controls who gets platform admin access.

## Notes

- The current parser is aimed at digital text-based PDFs.
- Guests can convert but do not get saved history.
- Logged-in users get saved conversions and persistent account settings.
- Local feedback persistence uses Postgres via `DATABASE_URL`.
- The same `DATABASE_URL` flow can point to Neon in production.
- Product planning lives in [docs/product-plan.md](/Users/maxx/Projects/BankStatementConverter/docs/product-plan.md).
