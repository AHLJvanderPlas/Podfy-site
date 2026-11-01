# PODFY capability matrix: what the site promises and when it is built (updated 2026-11-01, Phase 2 build)

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
| Photo required / optional / off | **live** (delivery: required/optional, report: all three); **up to 5 photos in one report built 2026-11-01, on QA** (app production after owner approval) | form setting + transaction_files | 1 · live; 5 photos: 2 · Dec 2026 |
| Asset register from template, move/retire, stickers with custom text | **live** (feature `asset_register`, beta) | reference register + sticker text | 1 · live |
| Webhook (`pod.created` / `report.created`, plus `record.status_changed` / `record.updated` from Phase 2) | **live** (portal settings, custom payload builder, signed, retries 1 min to 12 h, delivery log, resend; feature `webhooks` beta) | signed, retries, delivery log | 1 · live |
| Routing rules per location / group / category | **built 2026-11-01**: portal configurator + test panel live; app routing on QA (production after owner approval); feature `routing_rules` testing | rules engine | 2 · Dec 2026 |
| Status new → in progress → resolved / rejected; priorities; duplicate grouping | **built 2026-11-01**: status, assignee, comments, timeline, bulk update, priority live in portal (features `work_status`, `duplicate_grouping` testing); duplicate detection in the app on QA | shared lifecycle | 2 · Dec 2026 |
| Dashboard and reports per asset, location, period | **live in portal 2026-11-01** (report-mode Stats: counts, time to resolve, per category/location/group, top assets, assets without reports, per-asset view) | per-reference view + reports | 2 · Dec 2026 |
| Full export incl. photos/documents | **live 2026-11-01** (ZIP of CSV + all files, link valid 24 h, deleted after 7 days; feature `full_export` testing) | zip export | 2 · Dec 2026 |
| Billing per active asset per month (no per report/user/QR fee) | **built 2026-11-01** in the invoice engine (tiers €0.68/0.45/0.36/0.27, minimum €13.50, QR Advanced €0.25, pilot €0, weekly × 12/52, dry run); QR cards free. No customer on it until the owner approves a dry-run invoice | billing line × active references | 2 · Dec 2026 |
| Reporter confirmation + "resolved" message | driver copy e-mail | reuse + status trigger | 2–3 · Jan 2027 |
| Open API (fetch records, update status) | none | API keys per brand | 3 · Feb 2027 |
| QR portability: export destinations, 12-month redirect after leaving | none | per-brand redirect setting | 3 · Feb 2027 |
| 99.5% uptime measured monthly, proactive incident communication | **live**: podfy.net/status, checks every 5 minutes, owner alert by e-mail (+ optional ops webhook); monthly uptime report by e-mail + archived JSON (1st of each month) | public status page + monthly report | 1 · Nov 2026 |
| Support: 1 business day; critical within 4 business hours | inbox | support process, on-call rule | 0 · now (process) |
| Monthly cancellation | terms | terms text for QR Reporting | 0 · now |
