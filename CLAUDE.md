# Podfy-site — Claude Code Instructions

> See root `../CLAUDE.md` for shared context. The site uses a separate DB (`podfy-public`).

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
- **Fonts not yet self-hosted** — pending CSP update and font files under `/assets/fonts/`

---

## Key Files

| File | Purpose |
|------|---------|
| `assets/styles.css` | Legacy CSS (still loaded — pending cutover) |
| `assets/styles.v2.css` | v2 component library — use this on all pages |
| `assets/theme.js` | System/light/dark theme toggle |
| `partials/header.html` | Injected via middleware into all HTML pages |
| `partials/footer.html` | Injected via middleware |
| `functions/api/releases.js` | Paginated changelog from Site_Releases |
| `functions/api/contact.js` | Contact form → D1 + Resend |
| `functions/api/subscribe.js` | Newsletter subscription |
| `functions/_middleware.js` | Header/footer partial injection |
| `changelog.rss` | RSS 2.0 feed (last 20 releases) |

---

## Database (`podfy-public`)

**Separate from podfy-main.** Three tables only:

| Table | Purpose |
|-------|---------|
| `Site_Releases` | Powers `/api/releases` → changelog page + RSS |
| `Site_Form` | Contact form submissions |
| `Site_Buyer` | Pricing segment keywords (powers `/api/pricing-factor`) |

---

## SEO Rules

- Update `sitemap.xml` when adding/removing pages (25 URLs currently)
- Update `hreflang` on every page when adding locale variants
- Keep `llms.txt` current with new features
- FAQ schema on all guide pages; BreadcrumbList on solutions + guides

---

## No-Framework Rule

This is pure HTML/CSS/JS — **no React, no Tailwind, no bundler, no npm install** on new deps. Cloudflare Turnstile and existing fonts stay. Every other dependency requires explicit approval.

---

## Open Security Issues

| Issue | Priority | Status |
|-------|---------|--------|
| `POST /api/releases` admin token hardcoded in source | P0 | Open — `onRequestPost` removed from releases.js; endpoint no longer exists |
| No rate limiting on contact/subscribe | P1-P2 | Open — use CF WAF rules |

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
| Sprint 1 — Homepage | ✅ Done | Fonts, header/footer cutover, stat band, stamp-in-headline (see design-audit) |
| Sprint 2 — IA collapse | ✅ Done | All 9 solutions + 8 guides pages live |
| Sprint 3 — Pricing/Trust/Changelog | ✅ Done | trust.html consolidated, changelog.html + RSS live |
| Sprint 4 — NL launch | 🗓 Planned | nl/ content pages, hreflang activation |
| Design audit items | 🗓 Planned | Ship fonts, consolidate stylesheets, stat band, proof strip redesign, changelog teaser |
