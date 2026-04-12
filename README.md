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
npm run typecheck
npm run build
npm run production-check
```

`npm run production-check` runs lint, type generation, typecheck, a production build, and an environment preflight against the current shell plus any local `.env*` files that exist in the repo.

## Deployment

The app is ready to deploy as a standard Next.js application.

### Required environment variables

Set these in your deployment platform before going live:

```bash
SITE_URL=https://bankstatementconvertor.co.za
NEXT_PUBLIC_SITE_URL=https://bankstatementconvertor.co.za
DATABASE_URL=postgresql://...
ADMIN_EMAILS=you@example.com
EFT_ACCOUNT_NAME=Your Business Name
EFT_BANK_NAME=Your Bank
EFT_ACCOUNT_NUMBER=Your Account Number
```

### Optional environment variables

Use these when the related features should be active in production:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM="Bank Statement Converter <billing@your-domain.com>"
EMAIL_FROM_ACCOUNTS="Your Brand <accounts@your-domain.com>"
EMAIL_FROM_BILLING="Your Brand <billing@your-domain.com>"
MAX_STATEMENT_UPLOAD_MB=20
PAYMENT_PROOF_RETENTION_DAYS=30
```

### Notes for production

- Use a managed Postgres database in production.
- Do not set `PGSSL=disable` for a hosted database unless your provider explicitly requires it.
- `RESEND_API_KEY` is required for transactional email delivery.
- Use `EMAIL_FROM_ACCOUNTS` and `EMAIL_FROM_BILLING` if you want different sender identities for account emails and payment emails.
- `SITE_URL` and `NEXT_PUBLIC_SITE_URL` should point to the final public domain.
- `ADMIN_EMAILS` controls who gets platform admin access.
- `MAX_STATEMENT_UPLOAD_MB` controls the server-side PDF upload cap. The default is `20`.
- Run `npm run production-check` before pushing a release to catch missing env vars, placeholder values, and a broken clean-build pipeline.

### Neon database

- Create a Neon Postgres database and copy its connection string into `DATABASE_URL`.
- Set `SITE_URL` and `NEXT_PUBLIC_SITE_URL` to `https://bankstatementconvertor.co.za` in production.
- Leave `PGSSL` unset for Neon. Do not use `PGSSL=disable`.
- The app creates its own tables on first use through the existing Postgres bootstrapping in the app layer.

## Notes

- The current parser is aimed at digital text-based PDFs.
- Guests can convert but do not get saved history.
- Logged-in users get saved conversions and persistent account settings.
- Local feedback persistence uses Postgres via `DATABASE_URL`.
- The same `DATABASE_URL` flow can point to Neon in production.
- Product planning lives in [docs/product-plan.md](/Users/maxx/Projects/BankStatementConverter/docs/product-plan.md).
