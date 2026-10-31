# PODFY claims register

Verified 2026-10-29 against the code and the live database (podfy-app, podfy-admin, podfy-portal, podfy-cron, D1 `podfy-main-eu`).
Status: **verified** · **incorrect** (fix now) · **needs owner approval** · **future feature** (must not be marketed as live).

## Delivery (existing site)

| # | Claim (as published) | Where | What the code / data says | Status | Treatment |
|---|---|---|---|---|---|
| 1 | Demo data "auto-deletes in 72 h" **and** "auto-deleted within 24 hours" | `/demo` (all 4 locales) — both on the same page | Demo brand `data_ttl_hours = 72` (podfy-app `_upload/brand.js` → `expires_at`); cron deletes expired records + files every 6 h | **incorrect (24 h) — corrected in the preview branch** | **72 hours** everywhere |
| 2 | "7 years EU archive retention" / "Retrievable on demand for 7 years" | `/` stat band + record section | Plan defaults: Basic 14 d · Starter 120 d · Advanced 1 y · Pro 5 y · Enterprise 7 y (`billing_plan_catalog.validity_days`); longer via Extended retention add-on | **incorrect as a general claim** | "Up to 7 years (Enterprise or Extended retention)"; plan default stated per plan |
| 2b | "On the Pro plan, records are stored for 7 years" | `/solutions/facilities/` FAQ + JSON-LD (all locales) | Pro = 5 years (1825 days); 7 years = Enterprise | **incorrect — corrected in the preview branch (EN/NL/FR; DE has no such claim)** | "5 years on Pro, 7 on Enterprise" |
| 3 | Pricing add-on text "Advanced: 7 years", "Pro: 5 → 7 years", "Pro: 10 years" | `/pricing` | Extended retention is an add-on (€0.08/POD); exact per-plan extension not encoded in the catalog | **needs owner approval** | Owner to confirm the extension ladder; one table everywhere |
| 4 | "GPS coordinates captured at the moment the camera fires, not at upload time" | `/about`, `llms-full.txt` | Location order: photo **EXIF** (time of the photo, when present) → browser location **requested at send time** → IP estimate (`_upload/location.js`, `main.js` getCurrentPositionOnce) | **resolved 2026-10-31** | Corrected in all 4 locales + llms files. New wording: "The location comes from the photo itself when it carries one; otherwise the phone's location when the file is sent (with the driver's permission); otherwise an estimate from the connection. The record states which source was used." The site no longer claims a queue or an original capture timestamp: `main.js` has no offline queue (a failed upload shows an error and the driver sends again); the timestamp is set by the server when the upload arrives. |
| 5 | "GPS stamp and timestamp are added automatically" | `/`, carriers, photo-pod, subcontractor guides | Timestamp always; location only with photo EXIF or browser permission; **GPS Location Check is a paid add-on** (€0.15) / plan feature `check_gps` | **resolved 2026-10-31 (wording); add-on not named** | Site now says "timestamp on every record; location when available (photo or phone, with permission)"; the false "GPS stamping is included on all plans including Basic, not an add-on" is removed. The add-on is not named because the repo cannot confirm the plan inclusion: `plan_features` seeds `check_gps` as included for Starter, Advanced, Pro, Enterprise (migration 038), catalog default price 0.00 (migration 049); the 0.15 price and the Basic position are only in the live DB. |
| 6 | "no data leaves the European Union" | `/about`, `llms-full.txt` | Storage (D1 + R2) is Cloudflare **EU jurisdiction**; e-mail via **Resend** and optional AI reading (**Anthropic**) are subprocessors outside the EU — the trust page and the compliance guide already say so | **resolved 2026-10-31** | All locales + llms files: "Records and files are stored in the EU (Cloudflare EU jurisdiction); e-mail delivery and optional AI reading use the sub-processors listed on the trust page." |
| 7 | "Create a Podfy link via portal, **API**, or **batch CSV import**" | `/guides/subcontractor-pod` (EN, NL), `/solutions/carriers/` (EN, NL, DE, FR: FAQ + steps + JSON-LD), `llms-full.txt` | No customer API and no CSV link import exist (links are per brand/reference; Dispatch QR cards in the portal) | **incorrect — corrected in the preview branch** | "add the reference to your Podfy link, or print a QR card from the portal" |
| 8 | "The CMR generator is an add-on available on Advanced and Pro plans" | `/cmr/` | `plan_features.cmr_tool`: **included in Pro and Enterprise**; €0.35/CMR (catalog default) | **resolved 2026-10-31 (owner)** | "CMR generator: add-on at €0.35 per CMR on Advanced; included in Pro and Enterprise. Not available on Basic or Starter (no portal access)." Applied to pricing (rate card + add-on row), CMR generator page + FAQ JSON-LD, solutions tile, llms files, procurement price/product sheets, in all locales. |
| 8b | "CMR generator — Available on all plans" | `/` inline CTA (all locales) | see #8: included in Pro + Enterprise; add-on otherwise | **resolved 2026-10-31** | The claim "Available on all plans" no longer appears anywhere (solutions tile and CMR pages corrected; the homepage CTA text is generated from `price_text` and carries no availability claim). Same sentence as #8. |
| 8c | Header badge "EU · only" (`aria-label`: Hosted in the EU) | every page (header partial) | storage EU; e-mail/AI subprocessors outside the EU | **resolved 2026-10-31 (owner: "EU storage")** | Badge text "EU storage", aria-label "Data stored in the EU (Cloudflare EU jurisdiction)"; NL "Opslag in de EU", DE "Speicherung in der EU", FR "Stockage dans l'UE" (hand-written script in `partials/header.html`). |
| 8d | Testimonial "We used to chase paper CMRs for days…" (Transport operator, 4 trucks, North Brabant) | `/pricing` (all locales) | No source in the repo | **resolved 2026-10-31 (owner: remove)** | Testimonial section removed from `/pricing` EN and NL (DE and FR never had it). |
| 9 | CMR price €0.35 per waybill | guides, 3pl, pricing, cmr | Catalog `CMR` €0.35 | **verified** | — |
| 10 | Plan prices €0.55 / €0.79 / €0.99; Basic €0.10 | `/pricing` | Catalog 0.55 / 0.79 / 0.99; Basic **0.099** | verified (Basic rounded) | Keep or show €0.099 — owner |
| 11 | Company identity | imprint, terms, privacy, about, footer, invoices | Fixed 2026-10-09: Lake-Project (trading as PODFY), Rodenrijselaan 10A, 3037 XE Rotterdam, KvK 29816688, VAT NL001170142B85; guard tests in podfy-admin + Podfy-site | **verified** | — (brief's "release blocker" is resolved) |
| 12 | "No app, no account" for drivers | everywhere | Public upload link, no login | **verified** | — |
| 13 | Pre-paid credit, welcome credit, Mollie | `/trust#terms-credit` | Live since 2026-10-09 | **verified** | — |
| 14 | "EU-hosted" / "EU jurisdiction" storage | many | Cloudflare D1 + R2 created with EU jurisdiction | **verified** | — |
| 15 | Integrations: "audit export", "export" | index, solutions, compliance guide | Portal CSV export of deliveries + invoice datasets exist; no API/webhook | verified (export only) | Never imply API/webhooks until built |

## Report (new brief) — capabilities the brief assumes

| # | Assumed in the brief | Reality | Status |
|---|---|---|---|
| R1 | "existing self-service **webhook and API**" to forward reports | **None exists.** The only webhook in the codebase is Mollie → Podfy. `api/v1` is one internal admin route. | **future feature** — must be built before any integration claim |
| R2 | Issue categories, configurable | podfy-app has 6 **fixed delivery** issue codes (DAMAGE, MISSING, WRONG, DELAY, DOCUMENTS, OTHER) + notes, optional | **needs extension** (per-brand categories, report wording) |
| R3 | Photo optional; category-only report | Every upload **requires at least one file** (`submitUpload` returns without files; server validates files) | **needs extension** |
| R4 | Stable QR per asset, ID prefilled, no login | QR per **reference** exists (Dispatch QR cards → `podfy.app/{slug}/{ref}`), no login | **partly supported** (reference = asset ID; no asset register) |
| R5 | Asset register (name, site, status, retire/move) | none | **future feature** |
| R6 | Notifications to the responsible team | brand e-mail recipients + custom notification templates exist | **supported** (wording is delivery-specific) |
| R7 | Report history per asset/date/category | portal list with search by reference/date/status | **partly supported** (no category filter/asset view) |
| R8 | Branding, multilingual reporting form | brand colours/logo + 12-language app UI | **supported** |
| R9 | Abuse protection on public links | single-use upload challenge, per-IP + per-recipient limits (`upload_guard`) | **supported** |
| R10 | Public Report demo | Delivery demo only (demo brand, 72 h) | **future feature** |

## Owner decisions 2026-10-29 (supersede the Report rows above where they conflict)

- QR Reporting is presented as **New**, not Preview; mild overpromising is accepted.
- Claimed as available: e-mail notifications, **webhooks** (build together, target live end of November 2026), asset template upload, QR stickers with custom text, own categories, photo required/optional/off.
- **Open API: "Soon"** only.
- Same functions for both solutions, different description.

## Owner decision 2026-10-30 (later): present everything as available

The site now presents routing, status management, priorities, duplicate grouping, dashboards and reports,
reporter feedback, refund fields, full export, the open API, QR portability and the service promises
(99.5% uptime, support times, monthly cancellation) as available. Build dates per item:
`podfy-capability-matrix.md`. Third-party payment platforms are not named on the site (integration is
described as "via webhook and API").

## Copy rules derived from this register

- QR Reporting: "Request a demo" / "Request a proposal"; no "Try it" until a QR demo brand exists.
- Delivery: still no API or CSV-import claims (row 7).
- Location is "permission-based where available"; storage is "in the EU" with named subprocessors, not "never leaves the EU".
