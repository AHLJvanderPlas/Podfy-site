# Podfy-site

Marketing + trust layer for **PODFY** — proof-of-delivery SaaS.

Live: [https://podfy.net](https://podfy.net) · App: [https://podfy.app](https://podfy.app)

Static HTML, no build step, deployed on **Cloudflare Pages** with Workers (Functions) for API routes.

---

## Pages

| URL | File | Purpose |
|-----|------|---------|
| `/` | `index.html` | Homepage |
| `/carriers` | `carriers.html` | Audience: carriers & 3PLs |
| `/inbound` | `inbound.html` | Audience: inbound & receiving |
| `/site-deliveries` | `site-deliveries.html` | Audience: construction / site |
| `/demo` | `demo.html` | Product demo |
| `/pricing` | `pricing.html` | Rate card + worked examples |
| `/changelog` | `changelog.html` | Release history (fetches `/api/releases`) |
| `/contact` | `contact.html` | Contact form (Turnstile + `/api/contact`) |
| `/trust` | `trust.html` | Consolidated legal hub |
| `/404` | `404.html` | Custom 404 |

All pages use `body.v2` and load `styles.css` + `styles.v2.css`.

---

## Design system

| File | Role |
|------|------|
| `assets/styles.css` | v1 base tokens (still used by header/footer shells) |
| `assets/styles.v2.css` | v2 component library (sections, cards, forms, changelog, trust, pricing) |
| `assets/theme.js` | System/light/dark theme toggle |
| `partials/header.html` | Injected via `[[PODFY_HEADER]]` |
| `partials/footer.html` | Injected via `[[PODFY_FOOTER]]` |

Key v2 tokens: `--v2-paper:#F5F2EA` · `--v2-stamp:#D24A1F` · `--v2-delivered:#1F6B47` · `--v2-ink` · `--v2-muted` · `--v2-border` · `--v2-font-mono`

---

## API routes (Cloudflare Workers / Functions)

| Route | Function | Notes |
|-------|----------|-------|
| `/api/contact` | `functions/api/contact.js` | Turnstile verify → D1 insert → Resend email |
| `/api/releases` | `functions/api/releases.js` | Paginated changelog from `Site_Releases` |
| `/api/pricing-selection` | (removed Sprint 3) | Was pricing configurator |
| `/api/pricing-factor` | (removed Sprint 3) | Was pricing configurator |

---

## Database (Cloudflare D1)

**`podfy-public`** (`8b8e12db-2a7d-47eb-8d12-8a548e71da64`) — bound as `DB`

Tables: `Site_Releases` · `Site_Buyer` · `Site_Form`

---

## Redirects

`_redirects` (Cloudflare Pages format: `/source /dest status`):

- 17 legacy SEO pages → canonical audience pages (`/carriers`, `/inbound`, `/site-deliveries`)
- `/releases` → `/changelog`
- `/free-tier-demo` → `/demo`
- `/companies` → `/`
- 6 legal pages → `/trust#anchor` (Sprint 3 Set C)

---

## Sitemap

`sitemap.xml` — canonical v2 pages only, with hreflang `en` + `x-default`.
NL locale declared in hreflang but content ships Sprint 5+.

---

## Deployment

Auto-deploy is **off**. Every deploy requires two steps:

```bash
# 1. Push to git
git add <files> && git commit -m "..." && git push origin main

# 2. Deploy to Cloudflare Pages
cd Podfy-site
wrangler pages deploy . --project-name podfy-site --branch main
```

No QA environment for the site — deploy directly to production.

---

## Well-known

- `/.well-known/security.txt` — vulnerability disclosure metadata

---

## Turnstile

Sitekey: `0x4AAAAAACFOR78WSLkw_gB7` (public, safe to commit)
Secret: stored as `TURNSTILE_SECRET` env var in CF Pages project settings.
