# PODFY capability matrix — Report vs. what exists (2026-10-29)

Legend — **live**: in production · **extend**: exists for Delivery, needs a Report variant · **build**: does not exist · **phase 2**: after launch.
"Copy treatment" = how podfy.net may describe it before it is live.

| Capability (brief §11) | Existing implementation | Gap | Effort | Copy treatment now |
|---|---|---|---|---|
| Public link / QR per item, no app or login | podfy.app/{slug}/{ref}; Dispatch QR cards (PNG, label, A4) in the portal | asset wording; QR label template for machines | extend (S) | "QR code per machine" (planned) |
| Reference pre-filled from QR | `ref1` in the URL, locked field | — | live | — |
| Workflow type Delivery vs Report (texts, labels, success copy) | one Delivery workflow; texts in i18n.json (12 languages) | per-brand workflow type + Report text set | build (M) | do not show UI as live |
| Issue categories, configurable per brand | 6 fixed delivery codes (optional) | per-brand category list + labels per language | extend (M) | example categories, labelled "example" |
| Photo optional (category/text-only report) | at least one file required (client + server) | allow file-less submission for Report workflow; PDF/record without document | build (M) | "photo optional" only after built |
| Asset register (ID, name, site, status, retire/move) | none (reference is free text) | table + portal UI + QR mapping | build (L) | "asset identified by its QR code" (planned) |
| Notifications to the responsible team | brand recipients + custom notification templates (c_note) | Report e-mail wording | extend (S) | "e-mail notification" (planned) |
| Webhook / API (`report.created`) | **none** (only Mollie → Podfy) | signed webhooks, retries, per-brand endpoint config, event log; later a read API | build (L) | **no claim**; "integrations on the roadmap — tell us your system" |
| History per asset / category | portal list, search by reference / date / status | category filter, per-asset view | extend (M) | "searchable history" (planned) |
| Branding + languages | live | — | live | — |
| Abuse protection | upload challenge + rate limits | review limits for anonymous public reporters | extend (S) | — |
| Location | EXIF → browser (permission) → IP | Report: location optional/off by default | extend (S) | "the machine's location comes from its QR code" |
| Retention / deletion | per plan + cron cleanup | Report retention per plan (owner decision) | decide | none until decided |
| Public Report demo | none | isolated demo brand with sample machine | build (S) after MVP | "Request a demo" |
| Pricing | per POD / plan | asset-based or per-report model | decide | "Pricing on request" |
| CSV asset import, bulk QR sheets, analytics, routing | none | — | phase 2 | not mentioned |

**Conclusion:** Report needs an app MVP (workflow type, optional photo, configurable categories, asset register, Report notifications) before anything on podfy.net can be called live. Webhooks/API are a separate build and the largest item; they are not required for an MVP that notifies by e-mail.
