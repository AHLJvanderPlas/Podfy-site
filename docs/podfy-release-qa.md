# PODFY Report design preview — QA (2026-10-29)

Preview: https://design-report-preview.podfy-site.pages.dev

| Check | Result |
|---|---|
| Site tests (`npm test`: inline code, styles, company details, csp-report) | 7/7 pass |
| All new + changed routes respond (/, /solutions/, overview, 4 industries, /pricing, /contact, /demo, /nl/) | 200 |
| Preview not indexable | `X-Robots-Tag: noindex` (Cloudflare preview) + `noindex` meta on the 5 new pages |
| Production untouched | podfy.net has no Solutions menu (verified) |
| Console errors / CSP violations on /, /solutions/, overview, remote equipment, /pricing | none |
| /contact console errors | 7 from Cloudflare Turnstile — identical on production (pre-existing, not from this change) |
| Keyboard: Solutions menu | Enter opens, Escape closes, focus returns to the button |
| Contact preselect from Report pages | `?solution=report&industry=ev-chargers` → "EV chargers" |
| Titles ≤ 60 / descriptions ≤ 155 on new pages | 40–45 / 134–149 |
| No em/en dashes in new copy, no `style=` attributes | 0 / 0 |
| `docs/` not published | excluded in `deploy.sh`; not in `dist/` |
| Screenshots | 1440 px: homepage block, open menu, overview, EV, solutions, contact; 390 px: overview; dark mode: coffee machines |
| Not yet done | NL/DE/FR versions of the new pages; 768 px screenshots; Lighthouse/CWV run |
