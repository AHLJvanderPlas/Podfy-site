# PODFY Report — launch readiness (gates for podfy.net)

The marketing pages ship in three states. Each state change needs owner approval.

| State | podfy.net shows | Allowed CTAs | Requires |
|---|---|---|---|
| **A. Preview** (now) | Report overview + 4 industry pages, labelled "In development / pilot" | "Request a demo", "Join the pilot" (→ /contact?solution=report) | owner approves names + preview copy; owner/legal OK on wording |
| **B. Pilot** | same, "Pilot" label; screenshots of the real form | "Request a demo" | app MVP live for pilot brands (rows 3–7 of the capability matrix) |
| **C. Live** | no label; pricing; real Report demo | "Try the demo", "See pricing" | MVP + pricing approved + Report demo + trust/privacy updated for report data |

## App MVP checklist (state B)
- [ ] Per-brand workflow type `report` with its own texts in all app languages
- [ ] Photo optional; category/text-only submission stored and notified
- [ ] Per-brand issue categories (labels per language)
- [ ] Asset register: ID, name, site, status; QR per asset (reuse Dispatch QR card)
- [ ] Report notification e-mail
- [ ] Portal: filter by category and asset
- [ ] Retention for reports decided and enforced
- [ ] Trust / privacy: report data types (photos, notes, optional contact) — legal review

## Separate build (not required for B)
- [ ] Webhooks (`report.created`, signed, retried) + endpoint settings in the portal
- [ ] Read API
