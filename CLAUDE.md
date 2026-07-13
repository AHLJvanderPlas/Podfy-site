# Podfy-site — Claude Code Instructions

> See root `../CLAUDE.md` for shared context. The site uses a separate DB (`podfy-public`).
> ⚠️ **Cloudflare auth is pre-configured.** `CLOUDFLARE_API_TOKEN` is set via `.claude/settings.local.json`. Run wrangler commands directly — **never** run `wrangler login` or ask the user to authenticate in the browser.

## Deploy Workflow

```bash
cd Podfy-site
wrangler pages deploy . --project-name podfy-site --branch main
git push origin main
```

No QA environment for the site — deploy direct to `podfy.net`.

After every deploy, update `CLAUDE.md`, `../README.md`, and `../ROADMAP.md`:
- New pages or routes
- Completed design/SEO work
- Roadmap items shipped

---

## Local Dev

```bash
cd Podfy-site && wrangler pages dev .
```

---

## Writing Style

**Do not use em dashes (—) or en dashes (–) in prose copy.** They read as AI-generated text.

- Replace mid-sentence ` — ` with a comma: "GPS captured at upload, not at submit time"
- Replace "Name — Description" list items with a colon: "Driver self-copy: driver receives a branded PDF"
- Replace addendum uses with a period or restructure: "No contract. Billed on your existing invoice."
- **Exception:** page `<title>` separators ("Pricing — PODFY") and CMR legal form labels are fine to keep
- **Exception:** `v2-price-dash` span (`&mdash;`) in pricing tables means "not included" and must stay

---

## Design System

The site uses a **v2 document-grade design system**:

| Token | Value | Use |
|-------|-------|-----|
| `--v2-paper` | `#F5F2EA` | Primary surface |
| `--v2-stamp` | `#D24A1F` | Signal — buttons, italic accents |
| `--v2-delivered` | `#1F6B47` | Status: delivered/ok |
| `--v2-ink` | `#0E1116` | Body text |
| `--v2-muted` | `#5A6473` | Secondary text |

Key rules:
- **No gradient text, no glass-card components, no pill buttons, no stock photos**
- Square corners (`border-radius: 3-6px max`), hairline borders, no shadows
- Typography: Source Serif 4 (display) + Inter (body) + JetBrains Mono (captions/IDs)
- **Fonts self-hosted** — 10 woff2 latin subsets in `/assets/fonts/`; no Google Fonts dependency (2026-05-12)

---

## Key Files

| File | Purpose |
|------|---------|
| `assets/styles.css` | Legacy CSS (still loaded — pending cutover) |
| `assets/styles.site.css` | v2 design system — use this on all pages |
| `assets/theme.js` | System/light/dark theme toggle |
| `assets/advisor.js` | Plan Advisor — 5-step questionnaire, all 4 locales embedded, no framework |
| `assets/advisor.css` | Plan Advisor styles — uses only `--v2-*` tokens |
| `partials/header.html` | Injected via middleware; locale switcher (EN/NL/DE/FR) + locale-rewrite JS |
| `partials/footer.html` | Injected via middleware; locale-rewrite JS for footer links |
| `functions/_middleware.js` | Header/footer partial injection |
| `functions/api/releases.js` | Paginated changelog from `Site_Releases`; filters `release_date <= DATE('now')` |
| `functions/changelog.rss.js` | RSS 2.0 feed (last 20 releases); same date filter |
| `functions/api/pricing.js` | Returns `Site_Pricing` rows as JSON; cached 1h; feeds `data-price-key` spans |
| `functions/api/contact.js` | Contact form → D1 + Resend |
| `functions/api/subscribe.js` | Newsletter subscription |

---

## Database (`podfy-public`)

**Separate from podfy-main.** Four tables:

| Table | Purpose |
|-------|---------|
| `Site_Releases` | Powers `/api/releases` → changelog page + RSS. Only rows where `release_date <= DATE('now')` are returned — future-dated rows can be pre-authored. |
| `Site_Form` | Contact form submissions |
| `Site_Buyer` | Pricing segment keywords (powers `/api/pricing-factor`) |
| `Site_Pricing` | Plan prices + add-on prices synced from `billing_plan_catalog` by podfy-cron every 6h (and on every admin plan price update). Served by `/api/pricing`. Keys match `plan_name.toLowerCase()`. |

---

## SEO Rules

- Update `sitemap.xml` when adding/removing pages (107 URLs currently); no duplicate `<loc>` entries
- Update `hreflang` on every page when adding locale variants
- Keep `llms.txt` current with new features; regenerate `llms-full.txt` when guide/about content changes (it embeds full page text for LLM ingestion)
- FAQ schema on all guide pages; BreadcrumbList on solutions + guides
- Titles ≤ 60 rendered chars, meta descriptions ≤ 155 chars
- Social image is `assets/og-image.jpg` (28KB). Do not reference `og-image.png` on new pages (kept only so old shared links resolve)
- **⚠️ Pricing changes must update the static fallback text inside every `data-price-key` span on all 4 locale pricing pages.** The JS fill from `/api/pricing` only runs in browsers; Google, Bing, and LLM crawlers index the static text. Also update the price tables in `llms.txt` and the Offers in the pricing pages' SoftwareApplication JSON-LD (nl/de/fr).

---

## No-Framework Rule

This is pure HTML/CSS/JS — **no React, no Tailwind, no bundler, no npm install** on new deps. Cloudflare Turnstile and existing fonts stay. Every other dependency requires explicit approval.

---

## Security Status

| Issue | Priority | Status |
|-------|---------|--------|
| ~~`POST /api/releases` admin token hardcoded in source~~ | P0 | **Fixed** — `onRequestPost` removed from `releases.js`; endpoint no longer exists (2026-05-12) |
| `/api/contact` rate limiting | P1 | **Fixed** — CF WAF rule: 1 req/10s per IP (2026-05-12) |
| `/api/subscribe`, `/api/pricing-selection`, `/api/pricing-factor` rate limiting | P2 | **Deferred** — requires CF paid plan (free plan: 10s window only) |

## Security Hardening Applied (2026-05-12)

| Fix | Detail |
|-----|--------|
| ✅ Turnstile on `/api/pricing-selection` | `verifyTurnstile()` uncommented and wired; required when `TURNSTILE_SECRET` is set; missing token → 400 |
| ✅ Subscribe consent validation | `consent` field required (`true` or `"on"`); returns 400 if absent |
| ✅ Subscribe email format | Replaced `includes("@")` with full `EMAIL_RE` regex |
| ✅ Subscribe dedup | Queries `Site_Form` for same email in last 24 h; returns soft success without re-inserting |

---

## Stale Files

| File | Status |
|------|--------|
| `_functions.md` | Old security audit (2026-05-06). P0 (hardcoded token) still open. Keep for reference. |
| `instructions/Podfy-site-overhaul.claude.md` | Active working brief for the site overhaul — still relevant |
| `instructions/design-audit.md` | Senior designer audit — still relevant, many items still open |
| `instructions/legacy-pages-mesh-plan.md` | Active plan for solutions/guides pages — still relevant |
| `instructions/product-functions.md` | Old product spec doc — partially outdated but useful for context |
| `instructions/style-template.md` | CSS reference template — still in use |
| `cmr/` | CMR-specific pages — check if still needed or redirect to portal |

---

## Sprint Status (Site Overhaul)

Per `instructions/Podfy-site-overhaul.claude.md` brief:

| Sprint | Status | Key remaining work |
|--------|--------|--------------------|
| Sprint 1 — Homepage | ✅ Done | Self-hosted fonts, stat band, stamp-in-headline, proof strip, header/footer tokens all shipped (2026-05-12) |
| Sprint 2 — IA collapse | ✅ Done | All 9 solutions + 8 guides pages live |
| Sprint 3 — Pricing/Trust/Changelog | ✅ Done | trust.html consolidated, changelog.html + RSS live |
| Sprint 4 — NL/DE/FR/FR launch | ✅ Done | nl/, de/, fr/ all have full translated page trees (9 solutions, 8 guides, pricing, demo, contact, trust, CMR); hreflang active on all four locales; FR launched 2026-05-12 |
| Sprint 5 — Pricing intelligence | ✅ Done | Dynamic pricing sync, Plan Advisor, pricing page audit, Basic plan column (2026-05-30) |
| Design audit items | 🗓 Remaining | Consolidate stylesheets (`styles.css` → `styles.site.css` only); `prefers-reduced-motion` full block for all transitions; social proof section (named customer story) |

---

## Changes (2026-07-08) — SEO / LLM optimisation pass

- **Meta lengths** — 85 files: 60 over-length descriptions trimmed to ≤155 chars, 25 titles to ≤60 rendered chars
- **JSON-LD coverage** — 18 previously schema-less pages now have schema: Organization+WebSite (nl+de homepages), ContactPage (contact ×4), WebPage (demo/trust ×4, changelog), SoftwareApplication with 5 Offers (nl/de/fr pricing). Only 404.html has none (intentional)
- **og-image** — 548KB PNG → 28KB progressive JPEG (`assets/og-image.jpg`); 96 files re-pointed; PNG kept for old shared links
- **llms-full.txt** — new 70KB file: full text of about, vs-scan-apps, and all 10 EN guides; advertised in robots.txt + llms.txt
- **llms.txt key facts hardened** — 11 atomic facts (all plan rates, retention, GPS-at-capture, EU-WEUR jurisdiction wording, KVK/VAT, demo link)
- **sameAs cleanup** — dead Capterra/G2 links removed from Organization schema (re-add when listings exist); LinkedIn kept
- **NL content** — 3 new pages: `nl/about.html`, `nl/guides/gps-proof-of-delivery/`, `nl/guides/subcontractor-pod/` (NL now has 10 guides, parity with EN); hreflang updated on EN counterparts; 2 cards added to `nl/guides/index.html`
- **sitemap.xml** — 3 new NL URLs added, 3 pre-existing duplicate entries removed (net 107 URLs, validated)

## Changes (2026-05-29/30)

- **Future-dated release notes** — `functions/api/releases.js` + `functions/changelog.rss.js` now add `AND release_date <= DATE('now')` to all queries; pre-authored notes remain hidden until their date
- **Dynamic pricing** — `Site_Pricing` table created in podfy-public; `podfy-cron` syncs from `billing_plan_catalog` every 6h via `syncPricing()`; `PATCH /api/admin/billing/plans/:id` triggers instant upsert; new `/api/pricing.js` serves JSON; all 4 pricing pages have `data-price-key` spans + JS fill script
- **Plan Advisor** — `assets/advisor.js` (vanilla IIFE, EN/NL/DE/FR embedded) + `assets/advisor.css`; 5-step questionnaire above rate card on all 4 locale pricing pages; step 4 plan-inclusion badges; result screen with full plan comparison table
- **Pricing page audit** — all 4 locales corrected: Starter €0.55, Advanced €0.79, CMR €0.35/CMR, retention +€0.08/POD; feature matrix rebuilt from `plan_features` DB (added Damage/exception, PDF branding, CMR row; fixed OCR to Enterprise-only; removed TMS/WMS and white-label-docs add-on); worked examples recalculated
- **Basic plan** — added as leftmost column to rate card on all 4 locale pages; €0.10/POD, 30-day retention; worked example 1 updated (50 PODs = €5); advisor.js `PLAN_FEATURES.basic` corrected (brand link = true)
- **FR locale** — all 25 fr/ pages live; header/footer FR locale enabled; hreflang 4-locale + x-default on all pages; sitemap updated to 97 URLs

## Changes (2026-05-12)

- **Stat band** — `v2-trust-belt` → `v2-stat-band-wrap`; `div/div` → `ul/li` semantic; live item wrapped in `<a class="v2-stat-band-link">`; `&thinsp;` on number strings; CSS: border + bg rule, `--live` modifier, link flex styles
- **Stamp-in-headline** — `aria-label="the same day."` on stamp span; `prefers-reduced-motion: .v2-hero-stamp { transform: rotate(0deg) }`
- **Proof strip** — Card 01: phone status bar (09:24 / signal), URL bar, `v2-proof-hr` divider, camera CTA button, "Any phone" note; `<article>`. Card 02: all inline `style=""` attributes removed → CSS classes (`.v2-proof-pdf-*`); timestamp fixed to 2026. Card 03: dates 2025 → 2026; `<article>`. All 3: `.v2-proof-artifact` flex column with `padding: 1rem; min-height: 200px`
- **Header/footer tokens** — `partials/header.html`: `site-header-shell` → `site-header`, `site-trust-pill` → `site-eu-mark`. `partials/footer.html`: `site-footer-v2` → `site-footer`. CSS: all three renames propagated; EU mark `transform: rotate(-2deg)`; `cursor: not-allowed` removed from inactive locale links
- **Customer story placeholder** — old comment block removed; `TODO(story)` comment placed after proof strip section

## Changes (2026-07-12) — Insights section restructure

- **/insights split into three tab pages** (shared `.ins-tabs` nav): Market updates (`/insights/`),
  Repository (`/insights/repository/`, card grid with covers + category chips), LinkedIn
  (`/insights/linkedin/`, published posts as cards via the `/li/` redirect).
- **SSR repository item detail** `functions/insights/repository/item.js` —
  `/insights/repository/item?slug=&lang=en|nl|de|fr`: 4-language summary + localized
  classification chip, cover, copy-deeplink button, official-text/download buttons,
  DigitalDocument JSON-LD, hreflang ×4. Middleware passthrough entry added.
- **podfy-public migrations 006+007**: `repository_items.external_url` (link-only items,
  file_key='') + `slug`, `category`, `cover_image_key`, `summary_en/nl/de/fr`; 6 official
  legal texts seeded (CMR, e-CMR, CIM, CMNI, TIR, eFTI) with hand-written 4-language
  summaries and AI covers under `marketing/covers/repo-<slug>.jpg`.
- **API routes** in `functions/api/insights/[[route]].js`: `repoitem/<slug>`,
  `repocover/<item_id>` (marketing/covers/ guard), `liposts` (blogs with linkedin_post_url).
- `sitemap-insights.xml` now includes the two section pages + repository item URLs (×4 langs).
- Insights hero signup compacted (single-row inputs, Turnstile `data-appearance="interaction-only"`).

## Changes (2026-07-13) — SEO/LLM authority gaps closed

- **Repository FAQPage schema**: `functions/insights/repository/item.js` reads
  `repository_items.faq_json` (migration 009) and renders both the JSON-LD
  `FAQPage` block and a visible accordion, falling back to the English FAQ if
  the current language's entry isn't populated yet.
- **Title auto-truncation safety net**: `seoTitle()` in both `article.js` and
  `functions/insights/repository/item.js` caps the rendered `<title>` tag at
  60 chars, truncating at a word boundary with an ellipsis. Applies to every
  current and future title automatically — a long title can never again ship
  an un-truncated, Google-chopped SERP snippet without a code change.
- **Cross-linking (bidirectional, fully automatic)**: a repository item shows
  "Related insight" when a published `blog_posts` row has
  `source_item_id = item.item_id` (set by the admin "Generate insight"
  button); an article shows "Source document" the same way in reverse. Zero
  manual linking required for any future repo-generated article.
- **llms.txt**: added an "Insights and repository" section pointing to
  `/insights/`, `/insights/repository/`, and the new dynamic index below.
- **`functions/llms-insights.txt.js`** (new): auto-generated plain-text index
  of every published repository item (grouped by category, with summary +
  canonical + official-source URL) and recent market-update articles. Mirrors
  the `sitemap-insights.xml` pattern — always current, no manual maintenance,
  no risk of the Insights section going invisible to LLMs as content grows.
  **Middleware passthrough required** (`_middleware.js`) — same
  ASSETS.fetch-swallows-functions gotcha as `/sitemap-insights.xml` and
  `/insights/article`.
- Migration 009 (podfy-public): `repository_items.faq_json`; 4 over-length
  titles shortened to <60 chars (`efti-implementing-2024-1942`,
  `efti-implementing-2025-2243`, `reg-2020-1054-mobility-package`,
  `reg-2020-1055-establishment-cabotage`).
