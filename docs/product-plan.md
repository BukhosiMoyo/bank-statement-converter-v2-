# Bank Statement Converter Plan

## Verified Context

- Date: 2026-04-03
- Repo state: empty greenfield workspace
- Existing UI analysis: verified, no current UI, design system, or copy system exists in this repo
- Reference project inspected: `bank2ynab` at [`.references/bank2ynab`](/Users/maxx/Projects/BankStatementConverter/.references/bank2ynab)

## UI Impact

- Will UI change? Yes.
- What changes:
  - A new public marketing site
  - A new converter flow
  - A new authenticated dashboard
  - A new pricing and billing area
  - A new account settings area
- Why:
  - There is no existing UI in the repository, so this is a greenfield product.
- Guardrails:
  - Product UI stays minimal.
  - Beauty comes from layout, type, spacing, color, and motion, not extra helper copy.
  - Marketing pages can carry more copy for SEO; dashboard and converter screens should stay tight.

## Product Goal

Build a web app that converts bank statement PDFs into structured exports accountants can work with, with a preview before download, account-based usage limits, and subscription billing in South African rand.

## Core User Flow

1. User lands on a marketing or SEO page.
1. User uploads a PDF bank statement.
1. System validates file type, size, and page count.
1. System extracts transactions and normalizes them into a canonical schema.
1. User previews the extracted rows before export.
1. User exports CSV or XLSX.
1. User can create an account to unlock more monthly usage and view history.
1. Paid users can subscribe to higher page limits.

## Scope Recommendation

### MVP

- PDF upload
- Transaction extraction from digital bank statement PDFs
- Preview table before export
- CSV export
- XLSX export
- Guest usage cap
- Free account tier
- Paid monthly and annual plans
- Basic dashboard with usage, recent conversions, billing, and settings
- SEO landing pages for target banks and use cases

### Post-MVP

- OCR fallback for scanned/image-only PDFs
- Multi-file batch conversion
- Bank-specific parser templates
- QuickBooks, Xero, Sage, and YNAB output presets
- Shared team workspaces
- API access

## Use What Works From `bank2ynab`

### Borrow

- Adapter or plugin model for bank-specific parsers
- Strong separation between ingestion, parsing, normalization, and export
- Test-fixture strategy with real sample files per bank layout
- Canonical transaction shaping before output generation

### Do Not Copy

- CLI-driven config-file UX
- File-system polling model
- YNAB-specific output assumptions
- Reliance on a single `pdfplumber` table extraction path
- Lack of meaningful PDF integration coverage

## Product Decision: Meter Pages, Not Conversions

The current idea of "5 without an account, 10 with an account" should be measured in pages, not jobs.

Reason:

- One statement might be 1 page.
- Another might be 80 pages.
- Counting jobs creates bad pricing, abuse risk, and margin risk.

Recommended interpretation:

- Guest: 5 pages total
- Free account: 10 pages per month

This keeps the intent of the idea while aligning pricing to actual processing cost.

## Pricing Draft

These are launch recommendations, not final locked pricing.

### Free

- Guest: 5 pages total
- Signed-in free account: 10 pages per month
- Preview enabled
- CSV export from day one
- Keep XLSX for signed-in users or paid plans until activation data says otherwise

### Paid Monthly

- Starter: R99/month, 350 pages
- Pro: R249/month, 1,200 pages
- Business: R699/month, 5,000 pages

### Paid Annual

- Starter: R990/year
- Pro: R2,490/year
- Business: R6,990/year

### Add-On Credits

- R49 for 100 pages
- R149 for 400 pages

Notes:

- `R99 / 350 pages` is aggressive and cheaper per page than the public competitor baseline reviewed during planning.
- Keep overage packs available so occasional users do not need a full subscription.
- Mark `Pro` as the anchor plan.

## Recommended Stack

### Web App

- Next.js App Router
- TypeScript
- Tailwind CSS
- Reusable in-house component system built from a small base, not a large pattern explosion

### Auth

- Email/password for launch
- Social login later if needed
- Keep auth fully integrated into the main app flow, not bolted on

### Database

- PostgreSQL

### ORM

- Prisma or Drizzle

### Storage

- S3-compatible object storage for uploaded PDFs and generated exports

### Payments

- Start with a provider that supports ZAR billing cleanly
- Recommended launch choice: Paystack for South African pricing and settlement
- Keep billing behind a small provider abstraction so Stripe can be added later for wider international coverage

### Conversion Engine

- Keep the conversion pipeline in the Next.js codebase
- Implement extraction and normalization in TypeScript
- Use background jobs only for heavy processing, but keep the product as one Next.js application for MVP

### Background Processing

- Postgres-backed job table for MVP
- Move to Redis or workflow tooling only if throughput requires it

## Parsing Architecture

### Canonical Transaction Schema

Every extracted row should normalize into:

- `transactionDate`
- `description`
- `reference`
- `debit`
- `credit`
- `amount`
- `balance`
- `currency`
- `accountName`
- `accountNumberMasked`
- `statementStartDate`
- `statementEndDate`
- `sourcePage`
- `rowIndex`
- `confidence`
- `rawText`

### Pipeline

1. Upload PDF and create job record.
1. Fingerprint file with SHA-256 to dedupe repeated uploads.
1. Count pages and enforce quota before processing.
1. Detect whether PDF is text-based or image-based.
1. Run extraction strategy:
   - bank template parser if layout is known
   - generic table parser for text PDFs
   - OCR fallback for image PDFs
1. Normalize rows into the canonical schema.
1. Score confidence per row and mark suspicious rows.
1. Generate preview payload.
1. Generate CSV and XLSX exports.
1. Store result metadata and usage ledger.

### Extraction Strategy

#### V1

- Use a TypeScript PDF extraction stack inside the Next.js app
- Start with text extraction and layout heuristics for digital PDFs
- Keep bank-specific parser adapters in TypeScript
- Build heuristics around:
  - date recognition
  - debit and credit column detection
  - balance column detection
  - multi-line description joining
  - amount cleanup for local number formats

#### V2

- Add OCR for scanned statements
- Add bank-specific templates for South African banks first

## Preview Experience

The preview is a product requirement, not a nice-to-have.

Minimum preview behavior:

- Show extracted rows in a table
- Show detected statement metadata
- Flag low-confidence rows
- Let user download only after preview is ready
- Preserve the export format selection before download

Optional later:

- Inline column remapping
- Row exclusion
- Manual value fixes before export

## Account and Billing Model

### Anonymous

- Short-lived upload session
- 5-page total cap
- No long-term history

### Free Account

- 10 pages per month
- Conversion history
- Re-download recent exports

### Paid Account

- Monthly or annual page allowance
- Add-on page packs
- Billing history
- Plan management

## Data Model

Suggested initial tables:

- `users`
- `sessions`
- `plans`
- `subscriptions`
- `usage_ledgers`
- `uploads`
- `conversion_jobs`
- `conversion_results`
- `extracted_rows`
- `bank_templates`
- `billing_events`

## Security and Retention

This product handles financial documents, so privacy is a core feature.

- Encrypt files at rest
- Use signed URLs for upload and download
- Virus-scan uploads before processing
- Delete guest files and exports on a short TTL
- Give signed-in users limited retention for re-download history
- Avoid keeping raw PDFs longer than needed for support and retries
- Store structured extraction metadata separately from the original file
- State clearly that uploaded files are not used for model training if that remains true in implementation

## SEO Strategy

The SEO surface should focus on intent-rich pages, not generic fluff.

### Target Landing Pages

- `/bank-statement-converter`
- `/pdf-to-csv-bank-statement`
- `/pdf-to-excel-bank-statement`
- `/for/accountants`
- `/for/bookkeepers`
- `/banks/fnb-pdf-to-csv`
- `/banks/standard-bank-pdf-to-excel`
- `/banks/absa-bank-statement-converter`
- `/banks/nedbank-pdf-to-csv`
- `/banks/capitec-pdf-to-excel`

### Content Rules

- Each page must include a real conversion angle, not spun SEO filler
- Use examples, supported output formats, privacy messaging, and FAQs
- Add structured data where useful
- Internally link bank pages to pricing and the converter

## UI Direction

There is no existing UI to preserve, so the app can be designed from scratch.

Recommended direction:

- Premium but restrained financial-tool aesthetic
- Strong typography
- Dense, readable data tables
- Clear upload state, processing state, preview state, and export state
- Minimal product copy
- More expressive copy reserved for marketing pages only

Product surfaces to design:

- Marketing home page
- Pricing page
- Converter page
- Auth pages
- Dashboard
- Billing page
- Settings page

## South Africa-First Launch Order

Start with banks most likely to matter locally:

- FNB
- Standard Bank
- Absa
- Nedbank
- Capitec

Reason:

- The product pricing is in ZAR.
- Local statement layouts should be strongest first.
- This gives us a narrower parser problem for MVP.

## Build Sequence

### Phase 0: Research and Fixtures

- Collect anonymized sample statements
- Build a parser benchmark set
- Define the canonical transaction schema

### Phase 1: Core Conversion MVP

- Scaffold Next.js app
- Build the TypeScript conversion pipeline in-app
- Build upload, job creation, preview, CSV export, XLSX export
- Support text-based PDFs first

### Phase 2: Accounts and Limits

- Add auth
- Add guest and free-account quotas
- Add usage dashboard

### Phase 3: Billing

- Add ZAR subscriptions
- Add annual plans
- Add add-on page packs

### Phase 4: SEO and Scale

- Launch SEO landing pages
- Add bank-specific parser templates
- Add OCR fallback
- Add conversion history and analytics

## Immediate Next Steps

1. Lock the initial target banks.
1. Confirm whether the free limits should be page-based as recommended.
1. Collect 10 to 20 anonymized PDF samples across the first target banks.
1. Scaffold the Next.js application and conversion pipeline.
1. Build the canonical transaction schema and preview table first.

## Open Questions

- Do you want the first release to support only South African banks, or generic global PDFs as well?
- Should the free tier allow XLSX export from day one, or only CSV?
- Do you want export presets for accounting tools in V1, or only generic CSV and XLSX?
- Do you want billing to be South Africa-first only, or globally available at launch?
