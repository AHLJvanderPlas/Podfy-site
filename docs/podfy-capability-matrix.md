# PODFY capability matrix: what the site promises and when it is built (updated 2026-11-01, Phase 4 built)

Owner decision 2026-10-30: podfy.net presents every capability below as **available** for both solutions
(CMR and delivery proof, QR Reporting). One generic app and one background flow: the process differs only
by settings (categories, file requirement, wording set, register lookup, billing unit).

**Rule while a promise is not built yet:** a prospect who needs it gets it inside their pilot or contract
start date; never sign a start date before the build date in this table.

| Capability (as promised on the site) | Today | Build | Phase / target |
|---|---|---|---|
| QR per asset/shipment, no app, branding, app in 42 languages, portal in English, EU storage | live | — | live |
| E-mail notifications, searchable history, CSV export | live | — | live |
| Daily backups, encryption, DPA, retention, deletion | live (nightly D1 backup, 14 days) | — | live |
| Own categories and extra fields (e.g. refund amount + payment reference) | **live** (app production 2026-10-31; portal configurator) | per-brand category + field list | 1 · live |
| Photo required / optional / off | **live** (delivery: required/optional, report: all three); **up to 5 photos in one report live 2026-11-01** | form setting + transaction_files | 1 · live; 5 photos: 2 · live |
| Asset register from template, move/retire, stickers with custom text | **live** (feature `asset_register`, beta) | reference register + sticker text | 1 · live |
| Webhook (`pod.created` / `report.created`, plus `record.status_changed` / `record.updated` from Phase 2) | **live** (portal settings, custom payload builder, signed, retries 1 min to 12 h, delivery log, resend; feature `webhooks` beta) | signed, retries, delivery log | 1 · live |
| Routing rules per location / group / category | **live 2026-11-01** (portal configurator + test panel, app routing; feature `routing_rules` beta) | rules engine | 2 · live |
| Status new → in progress → resolved / rejected; priorities; duplicate grouping | **live 2026-11-01** (status, assignee, comments, timeline, bulk update, priority; duplicate detection; features `work_status`, `duplicate_grouping` beta) | shared lifecycle | 2 · live |
| Dashboard and reports per asset, location, period | **live in portal 2026-11-01** (report-mode Stats: counts, time to resolve, per category/location/group, top assets, assets without reports, per-asset view) | per-reference view + reports | 2 · live |
| Full export incl. photos/documents | **live 2026-11-01** (ZIP of CSV + all files, link valid 24 h, deleted after 7 days; feature `full_export` beta) | zip export | 2 · live |
| Billing per active asset per month (no per report/user/QR fee) | **built 2026-11-01** in the invoice engine (tiers €0.68/0.45/0.36/0.27, minimum €13.50, QR Advanced €0.25, pilot €0, weekly × 12/52, dry run); QR cards free. Dry-run invoice approved by the owner 2026-11-01; QR Business/Advanced catalog rows stay `testing` until the first paying QR contract | billing line × active references | 2 · live |
| Reporter confirmation + "resolved" message | **built 2026-11-01**: "Keep me informed" (e-mail + consent) on the form, contact stored AES-256-GCM encrypted, confirmation mail (app), "resolved" mail when the status becomes resolved (portal/API → queue → cron), contact deleted after the resolved mail or 90 days, "My reports" on delivery.podfy.net; live everywhere 2026-11-01 (app production after owner approval); feature `reporter_feedback` (Advanced) beta | reuse + status trigger | 3 · live |
| Open API (fetch records, update status) | **live 2026-11-01** (portal.podfy.net/api/v1: records list/get/update status, references; API keys per brand with scopes, live and QA keys, 600 requests/min; reference podfy.net/docs/api; feature `open_api` (Advanced) beta) | API keys per brand | 3 · live |
| QR portability: export destinations, 12-month redirect after leaving | **built 2026-11-01**: QR destinations CSV (admin) and `references.csv` in the full export (live); brand lifecycle terminated + redirect address + date (admin, live, default 12 months, max 24); podfy.app redirect live 2026-11-01 | per-brand redirect setting | 3 · live |
| 99.5% uptime measured monthly, proactive incident communication | **live**: podfy.net/status, checks every 5 minutes, owner alert by e-mail (+ optional ops webhook); monthly uptime report by e-mail + archived JSON (1st of each month) | public status page + monthly report | 1 · Nov 2026 |
| Support: 1 business day; critical within 4 business hours | inbox | support process, on-call rule | 0 · now (process) |
| Monthly cancellation | terms | terms text for QR Reporting | 0 · now |
| Refund requests to payment platforms (amount + payment reference on the form, approval, signed webhook, result via API) | **built 2026-11-01** (portal + API + cron live; app on QA until owner approval): admins approve, optional auto-approval up to €10, PODFY never pays out; feature `refund_requests` (Advanced) testing | refund_requests + refund.* events | 4 · built |
| Own domain for the form and QR codes (white label of podfy.app; portal stays PODFY) | **built 2026-11-01**: set up by PODFY in admin (Cloudflare Pages custom domain), €25/month per domain, included in Enterprise; feature `own_domain` testing | brand_domains + host resolution | 4 · built |
| AI triage of report photos (suggestions only, opt-in) | **built 2026-11-01**: Claude Haiku 4.5, up to 3 photos, suggested category/priority, safety flag, description; per-brand monthly limit and global budget; stays testing until the legal pass (Anthropic sub-processor, DPA) | triage sweep | 4 · built, testing |
| Recurring problems per asset / location / category | **live 2026-11-01** in the portal dashboard (recurring assets, repeat after fix, hotspots, weekly trend, CSV) | insights | 4 · live |
| Asset register import from Excel (XLSX) | **live 2026-11-01** next to CSV (template and export as XLSX) | XLSX in the browser | 4 · live |

