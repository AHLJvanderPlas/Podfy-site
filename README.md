# Podfy-site

Marketing + trust layer for **PODFY** — proof-of-delivery SaaS.

Live: [https://podfy.net](https://podfy.net) · App: [https://podfy.app](https://podfy.app)

Static HTML, no build step, deployed on **Cloudflare Pages** with Workers (Functions) for API routes.
Push to `main` → auto-deploys to production.

---

## Page architecture

### Core pages

| URL | File | Purpose |
|-----|------|---------|
| `/` | `index.html` | Homepage |
| `/demo` | `demo.html` | Product demo (driver link + portal walkthrough) |
| `/pricing` | `pricing.html` | Rate card + worked examples |
| `/changelog` | `changelog.html` | Release history (fetches `/api/releases`) |
| `/contact` | `contact.html` | Contact form (Turnstile + `/api/contact`) |
| `/trust` | `trust.html` | Consolidated legal hub |
| `/404` | `404.html` | Custom 404 |
| `/instructions/` | `instructions/index.html` | Password-protected site owner reference (noindex) |

### Solutions (audience pages)

| URL | File |
|-----|------|
| `/solutions/` | `solutions/index.html` |
| `/solutions/carriers/` | `solutions/carriers/index.html` |
| `/solutions/3pl/` | `solutions/3pl/index.html` |
| `/solutions/shippers/` | `solutions/shippers/index.html` |
| `/solutions/retail/` | `solutions/retail/index.html` |
| `/solutions/construction/` | `solutions/construction/index.html` |
| `/solutions/facilities/` | `solutions/facilities/index.html` |
| `/solutions/inbound/` | `solutions/inbound/index.html` |
| `/solutions/digitize/` | `solutions/digitize/index.html` |

### Guides (SEO content cluster)

| URL | File |
|-----|------|
| `/guides/` | `guides/index.html` |
| `/guides/proof-of-delivery/` | `guides/proof-of-delivery/index.html` — hub |
| `/guides/digital-vs-paper/` | `guides/digital-vs-paper/index.html` |
| `/guides/missing-pod/` | `guides/missing-pod/index.html` |
| `/guides/pod-disputes/` | `guides/pod-disputes/index.html` |
| `/guides/pod-invoicing/` | `guides/pod-invoicing/index.html` |
| `/guides/pod-compliance/` | `guides/pod-compliance/index.html` |
| `/guides/photo-pod/` | `guides/photo-pod/index.html` |
| `/guides/pod-without-app/` | `guides/pod-without-app/index.html` |

---

## Design system

| File | Role |
|------|------|
| `assets/styles.css?v=v2-r1` | Base tokens (header/footer shells) |
| `assets/styles.v2.css?v=v2-r4` | v2 component library — use this version on all pages |
| `assets/theme.js` | System/light/dark theme toggle |
| `partials/header.html` | Injected via `[[PODFY_HEADER]]` |
| `partials/footer.html` | Injected via `[[PODFY_FOOTER]]` |

Key v2 tokens: `--v2-paper:#F5F2EA` · `--v2-stamp:#D24A1F` · `--v2-delivered:#1F6B47` · `--v2-ink` · `--v2-muted` · `--v2-line` · `--v2-card` · `--v2-font-mono/sans/serif`

Key v2 components (section 19 of styles.v2.css): `.v2-breadcrumb` · `.v2-toc` · `.v2-guide-card` · `.v2-guide-grid` · `.v2-sol-tile` · `.v2-sol-grid` · `.v2-aud-tile` · `.v2-aud-grid` · `.v2-inline-cta` · `.v2-comparison-table` · `.v2-faq-accordion` · `.v2-subscribe-strip` · `#v2-progress`

---

## API routes (Cloudflare Workers / Functions)

| Route | Function | Notes |
|-------|----------|-------|
| `/api/contact` | `functions/api/contact.js` | Turnstile verify → D1 insert → Resend email |
| `/api/releases` | `functions/api/releases.js` | Paginated changelog from `Site_Releases` |
| `/api/subscribe` | `functions/api/subscribe.js` | Email subscription from guide/changelog pages |
| `/api/pricing-factor` | `functions/api/pricing-factor.js` | Dynamic pricing segment lookup via `Site_Buyer` |

---

## Database (Cloudflare D1)

**`podfy-public`** (`8b8e12db-2a7d-47eb-8d12-8a548e71da64`) — bound as `DB`

| Table | Status | Purpose |
|-------|--------|---------|
| `Site_Releases` | Active | Powers `/api/releases` → changelog page |
| `Site_Form` | Active | Stores contact form submissions |
| `Site_Buyer` | Active | Powers `/api/pricing-factor` for pricing segments |

The production DB (`podfy-main`) and staging DB (`podfy-themes-staging`) are **not connected** to this site — they belong to the product apps.

---

## Redirects (`_redirects`)

All 16 legacy `podfy-*.html` SEO URLs redirect 301 to their canonical `/solutions/*/` or `/guides/*/` equivalents. The old broad audience pages (`/carriers`, `/inbound`, `/site-deliveries`) also redirect to specific solution pages.

---

## SEO / AI

- `sitemap.xml` — 25 URLs with `lastmod`, `changefreq`, `priority`. Submit to Google Search Console after any structural change.
- `robots.txt` — `Disallow: /instructions/`
- `llms.txt` — AI/LLM crawler context file at `/llms.txt`
- Organization + WebSite schema (LD+JSON) on homepage
- FAQ schema on all guide pages
- BreadcrumbList schema on solutions + guide pages
- hreflang `en` + `x-default` on all indexed pages. NL hreflang only on homepage (where `nl/index.html` exists).

---

## Deployment

Push to `main` → Cloudflare Pages auto-deploys to `podfy.net`.

```bash
git add <files>
git commit -m "site: description"
git push origin main
```

No QA environment for the site — deploy directly to `main`.

---

## Well-known

- `/.well-known/security.txt` — vulnerability disclosure
- `/llms.txt` — AI crawler context

---

## Turnstile

Sitekey: `0x4AAAAAACFOR78WSLkw_gB7` (public, safe to commit)
Secret: stored as `TURNSTILE_SECRET` env var in CF Pages project settings.

---

## Roadmap

Features confirmed for development — not yet live, do not reference on the site until shipped.

| Feature | Notes |
|---------|-------|
| **Offline upload queuing** | Store-and-forward upload for poor-signal environments (construction sites, rural depots). When shipped: re-add to `pricing.html` included list, `digital-vs-paper` comparison table, `proof-of-delivery` guide step 02. |
| **Social proof section** | Homepage placeholder is commented out in `index.html`. Activate when first named customer reference or delivery volume stat is confirmed. |
| **NL language pages** | `nl/index.html` exists. Full NL site (`/nl/demo`, `/nl/pricing`, etc.) when translation is ready. Hreflang is already declared on homepage. |
