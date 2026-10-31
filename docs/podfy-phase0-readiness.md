# Phase 0: be seen as a serious, safe supplier (2026-10-30)

Goal: every prospect, procurement officer, accountant or AI assistant that checks PODFY finds one consistent
company, a complete procurement pack, transparent terms and a fast, precise answer. Owner: Alexander.

## Status 2026-10-31

| Item | Status |
|---|---|
| A1 KvK trade name, retire old registration | open (owner) |
| A2 same identity on external profiles, Mollie, signatures | open (owner); on podfy.net done 2026-10-30 |
| A3 contact on /contact | support@podfy.net on every /contact page and as ContactPoint in the JSON-LD (owner decision 2026-10-31: use support@ for now); named person + phone still open |
| B procurement pack | **drafted** in `docs/procurement/` (13 files, EN); owner review + [OWNER]/[DECIDE] items in `docs/procurement/README.md` |
| C commercial | done (prices published 2026-10-30) |
| D demo brand on QA | after Phase 1 (needs report mode) |
| E comparison page | **live 2026-10-31**: /vs-qr-form-tools/ (EN/NL/DE/FR) |
| E status page, changelog per feature | Phase 1 (WP 1.8, 1.9) |
| F support process, auto-reply, incident and breach procedure | **drafted** (`docs/procurement/support-process.md`, `incident-and-breach-procedure.md`); auto-reply setup + backup person + phone line open (owner) |
| F 5-minute uptime check + phone alert | Phase 1 WP 1.8 (e-mail; phone via ops webhook to the owner's Homey flow, owner sets the URL) |
| G terms + privacy for QR Reporting | **drafted** in `docs/drafts/qr-reporting-legal.{en,nl,de,fr}.md`; owner + lawyer approval before publishing |
| G open claims | decided and fixed live 2026-10-31 (GPS timing, EU wording, EU storage badge, CMR availability, testimonial removed); see claims register |

## A. One identity everywhere (this week)
1. KvK: confirm "PODFY" is registered as trade name (handelsnaam) of Lake-Project (29816688). Retire or
   update the old registration (the number blocked by tests/company.test.mjs); external profiles still show it
   (an advisor quoted it on 2026-10-30).
2. Same name, address, KvK, VAT, phone and website on: Google Business Profile, LinkedIn company page,
   every directory in admin Marketing > Backlinks, Mollie profile, invoices, e-mail signatures, DPA.
3. A named contact person and a phone number on /contact; B2B buyers want a person, not only a form.

## B. Procurement pack (this week; ready to send within one business day)
- One-page product sheet per solution (CMR and delivery proof; QR Reporting).
- Price sheet: what is included, tiers, fair use, minimum fee, what is free (retired assets, users, QR codes).
- Service description: 99.5% uptime measured monthly with exclusions (planned maintenance announced 48 h
  ahead, third-party outages, force majeure), support channels and hours, response times, service credits
  (for example 10% of the monthly fee below target) instead of penalties.
- DPA + subprocessor list (exist) + annex with technical and organisational measures (TOMs).
- Security overview: EU hosting, encryption, daily backups, passkey admin access, audit log, CSP,
  security.txt / disclosure.
- Exit plan: export formats, 12-month QR redirect, deletion after the handover period.
- One-page pilot agreement: scope, 6 weeks, number of assets, success criteria, conversion price, data.
- Insurance certificates: professional liability and cyber insurance (buyers ask; get quotes now).
- Company facts sheet and a library of reusable answers for security questionnaires.

## C. Commercial best practice
- Publish QR Reporting prices: transparent pricing wins against suppliers that hide it.
  Proposal: €0.75 per active asset per month; 251-1,000 €0.60; 1,001-2,500 €0.50; 2,501+ €0.40;
  minimum €25 per month; Advanced (API, reporter feedback, priority support) +€0.25.
- The buyer's model, not ours: per active asset; nothing per report, user or QR code; free pilot;
  monthly cancellable; price fixed 12 months (24 with an annual commitment).
- Annual prepayment discount through pre-paid credit (already built).

## D. Answer every prospect like a pro
- Reply within one business day, point by point in the prospect's own structure.
- Demo on QA with their machine types, categories and sticker text in a branded demo brand.
- Pilot after Phase 1 is live (from 1 December 2026): 50-100 assets, 6 weeks, weekly check-in, success
  criteria agreed up front (share of reports with a machine ID, time to report, fewer phone calls).
- Never commit a start date before the build date in podfy-capability-matrix.md.

## E. Visible proof
- Public status page (Phase 1) and a monthly uptime figure.
- Changelog entry for every shipped Phase 1-3 feature: buyers read velocity as reliability.
- First named case study after the first pilot (replaces the anonymous testimonial).
- LinkedIn launch posts for QR Reporting; listings on Capterra / G2 / SaaSworthy once live.
- Comparison page "PODFY vs generic QR form tools", like the existing scan-apps comparison.

## F. Support and incident readiness (before the first pilot)
- support@ with auto-acknowledgement and stated hours; a phone line for critical incidents and a backup
  person, otherwise the 4-business-hour promise cannot be kept.
- Uptime check every 5 minutes with a phone alert (today: hourly).
- Incident and data-breach procedure: customers informed without delay, the AP within 72 hours.

## G. Legal texts for QR Reporting (next week)
- Terms: QR Reporting service description, per-asset billing, fair use, SLA reference, exit and redirect.
- Privacy statement and DPA annex: reporter data (optional name/e-mail, photos that may show people, IP
  for abuse protection) and retention for reports.
- Do not name third-party platforms (for example payment terminals) as integrations without an agreement.
- Decide the open claims (retention, GPS, EU wording, CMR plans, testimonial): they also appear in the pack.
