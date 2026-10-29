# PODFY Report on podfy.net — design and implementation plan

Branch `design/report-preview` · preview: https://design-report-preview.podfy-site.pages.dev (Cloudflare preview, `X-Robots-Tag: noindex`).
Production (podfy.net) is unchanged until the owner approves.

## What the design adds (built, EN)

| Area | Change | Files |
|---|---|---|
| Navigation | "Solutions" becomes a menu: PODFY Delivery (8 segments + CMR) and PODFY Report (overview + 4 industries, *Preview* label). Keyboard: Enter opens, Escape closes and returns focus. Mobile drawer gets both families. | `partials/header.html`, `assets/js/i/6d42b945d751.js` (extracted) |
| Homepage | Delivery hero unchanged. New block after the stat band: "One platform. Two practical solutions." with a Delivery card and a Report card (Preview). | `index.html` |
| Report overview | `/solutions/qr-issue-reporting/`: hero + illustrative form, status note, problem, Scan → Report → Notify, 4 industries, what Report does / leaves to your tools, not-an-emergency note, 7 FAQs, CTA (Request a demo / Join the pilot). | `solutions/qr-issue-reporting/index.html` |
| 4 industry pages | EV chargers, vending machines, coffee machines, remote equipment: own buyer, problem, example categories, use cases, safety/boundary note, FAQs, related links. | `solutions/qr-issue-reporting/*/index.html` |
| Solutions index | Delivery grid labelled; new Report section with 5 tiles. | `solutions/index.html` |
| Facilities | Contextual Report link (equipment in buildings); delivery intent unchanged. | `solutions/facilities/index.html` |
| Pricing | Band: "Prices on this page are for PODFY Delivery; Report pilot pricing per project" → Request a proposal. No new prices. | `pricing.html` |
| Contact | Sector list gets a PODFY Report group; preselected from `?solution=report&industry=…`; optional "number of machines or sites" (added to the message server-side, no schema change). | `contact.html`, `assets/js/i/40f0ddfdb8ac.js`, `functions/api/contact.js` |
| Footer | "QR issue reporting · Preview" under Solutions. | `partials/footer.html` |
| Styles | Menu, solution cards, preview label, status note, flow, phone illustration, boundaries, FAQ. Square corners, hairlines, no shadows, tokens only (dark mode included). | `assets/styles.site.css` (all pages → `?v=v3-r3`) |

## Corrections to existing pages (in the same branch, all locales)
- Demo: "within 24 hours" → **72 hours** (EN/NL/DE/FR) — matches the demo brand's `data_ttl_hours`.
- Carriers (EN/NL/DE/FR) + subcontractor guide (EN/NL) + llms-full: removed "via portal, **API**, or **batch CSV**" (neither exists) → "add the reference to your Podfy link, or print a QR card from the portal".
- Facilities FAQ (EN/NL/FR): "Pro: 7 years" → "5 years on Pro, 7 on Enterprise".

## Still to do before publishing (after owner approval)
1. Translate the 5 new pages + homepage block + menu/footer labels into NL, DE and FR (new folders under `nl/ de/ fr/solutions/qr-issue-reporting/`), add hreflang ×4 + x-default on all 5 pages.
2. Remove `noindex` from the 5 pages; add 20 URLs to `sitemap.xml`; add Report to `llms.txt`.
3. Owner decisions in `podfy-claims-register.md` (retention wording, GPS wording, EU wording, CMR entitlement, testimonial) → apply in all locales.
4. Trust/privacy: report data types — legal review before state B (pilot) — see `podfy-report-launch-readiness.md`.

## Rollback
Everything is in branch `design/report-preview`; production deploys only from `main`. To drop a published change: revert the merge commit and redeploy (`./deploy.sh`). New pages are additive; no URL of an existing page changes, so no redirects are needed.
