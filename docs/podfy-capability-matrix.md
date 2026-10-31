# PODFY capability matrix: what the site promises and when it is built (updated 2026-10-31, Phase 1 build)

Owner decision 2026-10-30: podfy.net presents every capability below as **available** for both solutions
(CMR and delivery proof, QR Reporting). One generic app and one background flow: the process differs only
by settings (categories, file requirement, wording set, register lookup, billing unit).

**Rule while a promise is not built yet:** a prospect who needs it gets it inside their pilot or contract
start date; never sign a start date before the build date in this table.

| Capability (as promised on the site) | Today | Build | Phase / target |
|---|---|---|---|
| QR per asset/shipment, no app, branding, 12 languages, EU storage | live | — | live |
| E-mail notifications, searchable history, CSV export | live | — | live |
| Daily backups, encryption, DPA, retention, deletion | live (nightly D1 backup, 14 days) | — | live |
| Own categories and extra fields (e.g. refund amount + payment reference) | **built, on QA** (app QA + portal configurator live; app production after owner approval) | per-brand category + field list | 1 · 27 Nov 2026 |
| Photo required / optional / off | **built, on QA** (delivery: required/optional, report: all three; max 1 photo per report in Phase 1, D1) | form setting | 1 · 27 Nov 2026 |
| Asset register from template, move/retire, stickers with custom text | **live in portal** (feature `asset_register`, visibility testing until go-live D3); app lookup on QA | reference register + sticker text | 1 · 27 Nov 2026 |
| Webhook (`pod.created` / `report.created`) | **live** (portal settings, custom payload builder, signed, retries 1 min to 12 h, delivery log, resend; feature `webhooks` testing until go-live); records from production app after its approval | signed, retries, delivery log | 1 · 27 Nov 2026 |
| Routing rules per location / group / category | per-brand recipients | rules engine | 2 · Dec 2026 |
| Status new → in progress → resolved / rejected; priorities; duplicate grouping | received / delivered / issue | shared lifecycle | 2 · Dec 2026 |
| Dashboard and reports per asset, location, period | portal list | per-reference view + reports | 2 · Dec 2026 |
| Full export incl. photos/documents | CSV only | zip export | 2 · Dec 2026 |
| Billing per active asset per month (no per report/user/QR fee) | per document | billing line × active references | 2 · Dec 2026 |
| Reporter confirmation + "resolved" message | driver copy e-mail | reuse + status trigger | 2–3 · Jan 2027 |
| Open API (fetch records, update status) | none | API keys per brand | 3 · Feb 2027 |
| QR portability: export destinations, 12-month redirect after leaving | none | per-brand redirect setting | 3 · Feb 2027 |
| 99.5% uptime measured monthly, proactive incident communication | **live**: podfy.net/status, checks every 5 minutes, owner alert by e-mail (+ optional ops webhook); monthly report not built | public status page + monthly report | 1 · Nov 2026 |
| Support: 1 business day; critical within 4 business hours | inbox | support process, on-call rule | 0 · now (process) |
| Monthly cancellation | terms | terms text for QR Reporting | 0 · now |
