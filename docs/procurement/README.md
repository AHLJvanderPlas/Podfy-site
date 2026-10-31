# PODFY procurement pack

Status: DRAFT, owner approval needed. Nothing here is sent to a prospect until the owner has approved it and every [OWNER] and [DECIDE] mark is resolved or removed. Written 2026-10-31. Pre-contractual: capabilities that are not built yet are shown as "available from <month year>", dates from `../podfy-capability-matrix.md`.

Audience: procurement officers, operations managers and accountants at prospective customers. Language: English.

## Index

| File | Content | Writer |
|---|---|---|
| `product-sheet-proof-of-delivery.md` | One page: proof of delivery | commercial |
| `product-sheet-qr-reporting.md` | One page: QR Reporting | commercial |
| `price-sheet.md` | Prices, tiers, terms, payment, VAT, worked examples | commercial |
| `pilot-agreement.md` | One page pilot template | commercial |
| `exit-plan.md` | Export, QR redirect, deletion, timeline | commercial |
| `company-facts.md` | Legal entity, hosting, bank, insurance | commercial |
| `service-description.md` | Uptime, support, response times, service credits | security/service |
| `security-overview.md` | EU hosting, encryption, backups, access, audit log | security/service |
| `toms-annex.md` | Technical and organisational measures for the DPA | security/service |
| `security-questionnaire-answers.md` | Reusable answers | security/service |
| `incident-and-breach-procedure.md` | Incidents and data breaches | security/service |
| `support-process.md` | Channels, hours, escalation | security/service |

Existing documents that stay on podfy.net/trust: terms of service, privacy statement, DPA request, subprocessor list.

Not yet in the pack: insurance certificates (professional liability, cyber), a signed DPA example, a named customer reference. See `company-facts.md`.

## Rules used in the commercial files

- Source of every price: `pricing.html` and the QR price list in `scripts/qr-pages` (QR_TIERS, QR_MIN, QR_ADV). Billing rules: the billing section of the root `CLAUDE.md` and `plans/01-core-model.md` section 7.
- No capability is promised from a date earlier than its build date. Pilots start from 1 December 2026.
- Open items from `../podfy-claims-register.md` (retention ladder, GPS check add-on, Basic price rounding; CMR add-on and GPS wording decided 2026-10-31) are marked [DECIDE], not decided here.
- Sub-processor gap found: the AI document reading uses an AI provider that is not on the public list at podfy.net/trust (the claims register says it is). Listed below.

## Open placeholders in the commercial files

### [OWNER] (owner fills in)

| File | Item |
|---|---|
| all product/price/exit files | Version and date; named contact person, role, direct phone |
| `price-sheet.md` | IBAN and account name for bank transfers |
| `price-sheet.md` | Accountant confirmation of VAT on pre-paid usage and expired pre-paid credit (open in the billing notes) |
| `price-sheet.md` | VAT treatment for customers outside the EU |
| `pilot-agreement.md` | Legal review of the template; PODFY contact for the pilot; authorised signatory |
| `exit-plan.md` | Person who sends the written deletion confirmation |
| `company-facts.md` | Legal form; number of employees; owner/managing person; founded year (website meta says "Founded in The Hague", correct it); telephone and hours |
| `company-facts.md` | KvK confirmation that PODFY is a registered trade name of Lake-Project and the old registration is retired |
| `company-facts.md` | Bank: bank name, account holder, IBAN, BIC |
| `company-facts.md` | Insurance: professional liability, cyber, general liability (insurer, policy number, sum, validity); get quotes if none |
| `company-facts.md` | ISO 27001 / SOC 2 status; customer reference; data protection contact |

### [DECIDE] (owner choice, with recommendation)

| # | File | Question | Recommendation |
|---|---|---|---|
| 1 | product sheet PoD, price sheet | Basic price: EUR 0.10 (website) or 0.099 (invoices) | Show EUR 0.099 everywhere |
| 2 | price sheet | RESOLVED (decided 2026-10-31 by owner): CMR generator is an add-on at EUR 0.35 per CMR on Advanced; included in Pro and Enterprise; not available on Basic or Starter (no portal access) | Done |
| 3 | price sheet | GPS location check add-on (EUR 0.15): confirm price and plans | Publish it on the rate card |
| 4 | price sheet | Extended and no-worries retention: periods per plan | Starter 120 days to 1 year, Advanced 1 to 3 years, Pro 5 to 7 years |
| 5 | price sheet | Webhook, status, routing, dashboard, export, API for proof of delivery plans: included or priced | Included in Advanced and up |
| 6 | price sheet | Active asset counting: no pro rata for mid-month changes | Keep it, simple to audit |
| 7 | price sheet | What happens above fair use (about 10 reports per asset per month) | No blocking, no surcharge without 30 days written notice and a proposal |
| 8 | price sheet | Notice period for price changes after the fixed period | 60 days |
| 9 | price sheet | Annual commitment: cancellable within the year? | No; the benefit is 24 month price fixation and prepayment discount |
| 10 | price sheet | Annual prepayment discount | 10%, or keep "ask us" |
| 11 | price sheet | Standard payment term | 30 days for all customers |
| 12 | price sheet | Late payment interest and costs | Reminder at due date; statutory commercial interest after a second written reminder |
| 13 | price sheet | Invoice language | English, Dutch on request |
| 14 | product sheet QR | Retention period for QR Reporting reports | 2 years from report date, configurable |
| 15 | pilot agreement | Data deletion after a pilot that does not convert | 30 days after end date |
| 16 | pilot agreement | Stickers after a pilot without conversion: stop or redirect | Redirect for 30 days |
| 17 | exit plan | No exit fee and no export fee | None |
| 18 | exit plan | Manual file export for contracts ending before December 2026 | Yes, within 10 business days, free |
| 19 | exit plan | Commitment for customers leaving before the redirect exists (before February 2027) | Do not terminate or delete a brand before the redirect is built; keep QR addresses on a notice page |
| 20 | exit plan | Extending the 12 month redirect on request | Yes, at cost price |
| 21 | exit plan | Contract end date after cancellation | End of the calendar month of notice |
| 22 | exit plan | Handover period length | 90 days |
| 23 | company facts | AI document reading provider missing from the public subprocessor list | Add it to the list before the pack is sent, or state the feature is off |

Placeholders in the second writer's files (service-description.md and others) are listed in those files, not here.

## Before sending

1. Resolve the items above and remove the DRAFT line from each file.
2. Check each "available from" date against `../podfy-capability-matrix.md` on the day of sending.
3. Send the pack within one business day of a request (readiness plan section B).
