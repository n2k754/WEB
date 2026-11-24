# CREATOR STARTER KIT

Premium digital product store: Next.js 16 (App Router) · TypeScript · Tailwind CSS 3 · Framer Motion · Lucide.
Includes the website **and** the real paid resources (templates, PDFs, Notion files, prompts), a Stripe Checkout integration, webhook-verified delivery and expiring signed download links.

> **Honest status:** the code is complete and tested, but **no payment, email or legal identity is configured**. Until you add credentials the site says so (checkout shows "not activated", the contact form says the message was *not* sent, legal pages show highlighted "to complete" markers). Nothing pretends to work.

---

## 1. Quick start

```bash
cd creator-starter-kit
npm install
cp .env.example .env.local      # then edit it (see §3)
npm run dev                     # http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit + end-to-end tests of the checkout → webhook → download flow (against a local *mock* Stripe, no real payment) |
| `npm run resources:check` | Verifies the files in `private-files/` match what the site promises (50 templates, 30 ideas, 20 prompts, tiers…) |
| `npm run resources:build` | Regenerates every deliverable in `private-files/` (needs Chromium: `npx playwright install chromium`) |
| `npm run check` | typecheck + resources:check + tests |

Requires Node 20+.

## 2. Project structure

```
creator-starter-kit/
├─ src/
│  ├─ app/                      Pages & API routes (App Router)
│  │  ├─ page.tsx               Home (main sales page)
│  │  ├─ product/ included/ faq/ contact/ legal/
│  │  ├─ success/               Protected purchase page (verifies payment server-side)
│  │  ├─ api/checkout/          Creates a Stripe Checkout Session (server-side price)
│  │  ├─ api/webhooks/stripe/   Signature-verified webhook (orders, refunds, optional email)
│  │  ├─ api/download/          Streams files / ZIPs only for valid signed tokens
│  │  ├─ api/contact/           Contact form backend (Resend)
│  │  └─ sitemap.ts robots.ts opengraph-image.tsx icon.svg
│  ├─ components/
│  │  ├─ ui/                    Button, Container, Reveal, Accordion, AnimatedBackground, Logo, TemplateSvg…
│  │  ├─ layout/                Navbar, Footer
│  │  ├─ sections/              Hero, HeroMockup, TrustBar, ProductCards, PricingCards, CheckoutDialog,
│  │  │                         ComparisonTable, Testimonials, FaqSection, CtaSection, ContactForm…
│  │  └─ preview/               Interactive product preview (templates / Notion / guide / prompts)
│  ├─ config/
│  │  ├─ pricing.ts             ★ ALL prices and package contents
│  │  ├─ business.ts            Legal identity (from env vars), refund-claim window
│  │  ├─ site.ts                Name, nav, footer links
│  │  └─ testimonials.ts        Real testimonials only (empty = section hidden)
│  ├─ content/                  Template engine + 50 template definitions, FAQ, product copy, preview data
│  └─ lib/                      stripe.ts, signing.ts, delivery.ts, orders.ts, email.ts, rate-limit.ts, seo.ts…
├─ content-src/                 Sources of the paid resources (markdown, JSON, CSV)
├─ scripts/                     build-resources.ts, check-resources.ts
├─ private-files/               ★ The paid deliverables (NEVER served publicly) + manifest.json
│  ├─ 00-start-here/            START-HERE.txt, LICENSE.txt
│  ├─ 01-social-media-templates/  svg/ backgrounds/ png/ + catalogue PDFs + Canva how-to
│  ├─ 02-tiktok-content-ideas/  30-TikTok-Content-Ideas.pdf
│  ├─ 03-notion-dashboard/      5 CSV databases + setup guide PDF
│  ├─ 04-digital-business-guide/Digital-Business-Guide.pdf (8 chapters)
│  ├─ 05-ai-prompts/            20 prompts (PDF + TXT)
│  ├─ 06-brand-planning/        Brand planning workbook (Ultimate)
│  └─ 07-bonus-content-planning/Content planning guide (Ultimate)
└─ tests/                       security.test.ts, flow.test.ts
```

## 3. Environment variables

Copy `.env.example` to `.env.local` (local) or set them in your host's dashboard (production).
`NEXT_PUBLIC_*` values are read **at build time**: rebuild after changing them.

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | everything in production | Public URL, no trailing slash. Used for SEO, sitemap, Stripe redirects |
| `STRIPE_SECRET_KEY` | checkout & delivery | `sk_test_…` or `sk_live_…`. **Server only** |
| `STRIPE_WEBHOOK_SECRET` | webhook | `whsec_…` from the webhook endpoint |
| `DOWNLOAD_SIGNING_SECRET` | delivery | ≥ 32 random chars: `openssl rand -base64 48` |
| `DOWNLOAD_URL_TTL_SECONDS` | optional | Lifetime of one download URL (default 900) |
| `ACCESS_LINK_MAX_AGE_DAYS` | optional | How long a purchase page stays valid (default 90) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO_EMAIL` | contact form, access email | All three needed. `EMAIL_FROM` must be on a domain verified in Resend |
| `NEXT_PUBLIC_BUSINESS_*`, `NEXT_PUBLIC_SUPPORT_EMAIL` | legal pages | Your **real** details: name, legal form, address, country, registration no., VAT no., publisher, host. Never invent them |

## 4. Prices and packages

Edit **`src/config/pricing.ts`** only. One change updates the pricing cards, comparison table, structured data **and the amount sent to Stripe** (the server builds the price from this file, never from the browser).
If you change *what* a package contains, also adjust the `tiers` in `scripts/build-resources.ts` and run `npm run resources:check`.

## 5. Payments (Stripe Checkout)

1. Create a Stripe account and complete business verification (required for live payments; eligibility depends on your country/business: **you** must meet Stripe's requirements).
2. Dashboard → Developers → API keys → copy the secret key into `STRIPE_SECRET_KEY` (start with a **test** key `sk_test_…`).
3. Dashboard → Developers → Webhooks → *Add endpoint*: `https://YOUR-DOMAIN/api/webhooks/stripe`, events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) prints a `whsec_…` for `.env.local`. Pay with card `4242 4242 4242 4242`.
5. Set `DOWNLOAD_SIGNING_SECRET`.
6. For live mode, swap to `sk_live_…` and a live webhook endpoint. Don't go live before the legal details (§7) are filled in and the policies reviewed.

**How it stays secure**

- The secret key lives only in server code. The browser sends only `{package, consent}`; price comes from `pricing.ts`.
- `/success?session_id=…` never trusts the browser: the server asks Stripe for the session, requires `payment_status = paid` **and** `status = complete`, and reads the package from metadata written by our own server.
- The webhook verifies Stripe's HMAC signature on the raw body (5-minute replay window) and records orders; `charge.refunded` revokes access.
- Files are never in `public/`. Download URLs are HMAC-signed, tied to one purchase + one package + one file, and expire (15 min). The route only serves files listed in the manifest for the buyer's package (a Pro buyer can't fetch Ultimate files).
- Checkout requires an explicit consent box (immediate access + loss of withdrawal right); the consent is stored in Stripe metadata.

**Order storage.** Orders are stored in `.data/orders.json` (dev / single server with a persistent disk). On serverless hosts (Vercel/Netlify) the disk is ephemeral: replace the three functions in `src/lib/orders.ts` with a database/KV (Postgres, Upstash Redis, Vercel KV…). Purchases still unlock correctly without it because the success page verifies directly with Stripe; only refund revocation and de-duplicated emails need persistent storage.

## 6. Contact form and order emails

Uses [Resend](https://resend.com) through its REST API. Create an API key, verify your sending domain, then set `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO_EMAIL`. Without them the form validates, then tells the visitor the message was **not** sent. With them configured, paid orders also receive an email containing their access link.
Basic rate limiting is in-memory (per instance); add a shared limiter or WAF for multi-instance deployments.

## 7. Legal pages

`/legal` contains terms, privacy policy, delivery information, refund policy and legal notice, written for digital goods sold to consumers in the EU/UK (14-day withdrawal right waived with express consent at checkout; faults/duplicate charges refunded within 30 days: `POLICY.faultClaimDays` in `src/config/business.ts`).
Business details come from env vars; any missing value is shown as a **highlighted "[To complete: …]" marker** and a banner warns the owner. **These texts are templates, not legal advice: have them reviewed by a qualified professional for your country** (VAT on digital services, consumer law, registration obligations, cookie rules if you add analytics).

## 8. Content & resources

The paid files are generated from `content-src/` and `src/content/templates.ts`:

- **50 templates** are generated by code (SVG with live text + background-only SVG + PNG). They are original vector/image files, **not Canva share links**. The catalogue and the how-to explain exactly how to use them in Canva or a vector editor. Nothing claims native Canva templates exist.
- **30 TikTok ideas** (`tiktok-ideas.json`), **20 prompts** (`prompts.json`), **8 guide chapters** (`content-src/guide/*.md`), Notion CSVs and docs (`content-src/notion`, `content-src/docs`).
- The 20 prompts are ready to copy and use but were **not** executed against a language model by us; test them with your preferred assistant and adjust the wording before selling a "tested" claim.

To edit anything: change the source, then `npm run resources:build && npm run resources:check`, and commit `private-files/`.
Adding a file: add it in `scripts/build-resources.ts` with its `tiers`; it appears on the success page automatically. Updating files for "future updates" customers = rebuild and redeploy; everyone's purchase page serves the latest.

Testimonials: add real, consented ones to `src/config/testimonials.ts`; the section stays hidden while the list is empty.

## 9. Deployment

**Vercel (simplest)**
1. Push the repo, import it in Vercel, set *Root Directory* to `creator-starter-kit`.
2. Add the environment variables (§3) for Production; `NEXT_PUBLIC_SITE_URL` = your final domain.
3. Deploy, then create the Stripe webhook pointing to the deployed URL.
4. `outputFileTracingIncludes` in `next.config.mjs` already bundles `private-files/` with the download route.
5. Replace the order store (§5) with a database/KV.

**VPS / Docker / any Node host**: `npm ci && npm run build && npm start` behind HTTPS (Caddy/Nginx). Keep `.data/` on a persistent volume.

Security headers are set in `next.config.mjs`. Make sure HTTPS is enforced by your host.

## 10. Still requires external configuration

- Stripe account, verification, keys, webhook (and a decision on VAT/tax handling in Stripe)
- `DOWNLOAD_SIGNING_SECRET`
- Resend account/domain (contact form and access emails)
- Real business identity for the legal pages + professional review of the texts
- Persistent order storage if deploying serverless
- Real customer testimonials (optional)
- A custom domain and `NEXT_PUBLIC_SITE_URL`
- Optional: analytics (add a consent banner first), social profiles

## 11. Tested

`npm test` covers token signing/tampering/expiry, Stripe signature verification (tampered body, wrong secret, stale timestamp), form encoding, validation, rate limiting, and a full simulated purchase (checkout → unpaid is locked → signed webhook → paid → download → cross-package denial → refund revocation) against a mock Stripe server. The UI was exercised in Chromium on desktop and mobile widths (navigation, dialog, preview tabs, copy, FAQ, contact states, downloads, no console errors, no horizontal overflow).
