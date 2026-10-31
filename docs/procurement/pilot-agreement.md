# PODFY QR Reporting pilot agreement (template)

DRAFT, owner approval needed. Template, not legal advice. [OWNER: have the final text reviewed by your legal adviser before use.]

## 1. Parties

| | Supplier | Customer |
|---|---|---|
| Name | PODFY, a trade name of Lake-Project | [Customer legal name] |
| Address | Rodenrijselaan 10A, 3037 XE Rotterdam | [Address] |
| KvK / VAT | 29816688 / NL001170142B85 | [KvK] / [VAT number] |
| Contact for the pilot | [OWNER: name, e-mail, phone] | [Name, e-mail, phone] |

## 2. Scope

PODFY provides the QR Reporting service to the Customer for the assets in section 4, for the pilot period only. The service is described in product-sheet-qr-reporting.md. The pilot is free of charge. No setup fee. No automatic conversion to a paid subscription.

## 3. Period

- Start date: [date] (see rule in section 11)
- End date: [start date + 6 weeks]
- First weekly check-in: [date and time]

## 4. Assets

- Number of assets in the pilot: [50 to 100]. The maximum for a free pilot is 100 assets. More assets need a separate written agreement.
- Asset types and locations: [description]
- The Customer supplies the asset register (template provided by PODFY): [date due]

## 5. Configuration agreed

| Item | Choice |
|---|---|
| Categories (and extra fields) | [list] |
| Photo | required / optional / off |
| Sticker text (per language) | [text] |
| Recipients (per location, group or category) | [e-mail addresses] |
| Webhook / ticketing target, if used | [system and endpoint, or none] |
| Languages | [list] |
| Brand (logo, colours) | [files supplied by date] |

PODFY configures this before the start date. Changes during the pilot are made on request at the weekly check-in.

## 6. Weekly check-in

A 30 minute call every week: reports received, problems, configuration changes, progress against the success criteria. PODFY sends a short summary within one business day. Support during the pilot: reply within one business day, via support@podfy.net.

## 7. Success criteria (agreed before the start)

| Criterion | How measured | Baseline (before pilot) | Target |
|---|---|---|---|
| Share of reports that identify the machine (machine ID present) | Reports with asset ID divided by all reports | [blank] % | [blank] % |
| Time to report (from fault to report received) | Median minutes, from report timestamp and fault time given by the reporter or operator | [blank] | [blank] |
| Fewer phone calls about faults | Calls per week to the service desk about faults on pilot assets | [blank] per week | [blank] per week |
| [Other, optional] | | [blank] | [blank] |

The Customer and PODFY review these figures at the end of the pilot. Reaching the targets does not oblige the Customer to convert, and missing them does not oblige PODFY to extend.

## 8. Data and privacy

- The PODFY data processing agreement (DPA) applies and is signed before the start date if reports may contain personal data (optional reporter name or e-mail, photos that may show people).
- Data is stored in the EU. Subprocessors: podfy.net/trust.
- The Customer remains the controller of reports and asset data. PODFY is processor.
- At the end of the pilot, without conversion: PODFY exports the pilot data to the Customer on request and deletes it within [DECIDE: days. Recommendation: 30 days after the end date, with written confirmation on request]. QR stickers placed during the pilot stop working at that point [DECIDE: or redirect for a short period; recommendation: redirect for 30 days].
- With conversion: the register, reports and QR codes are kept and continue under the subscription without re-registration. Stickers stay valid.

## 9. Conversion

- Price after the pilot: per the PODFY price sheet at the tier reached, minimum EUR 13.50 per month, excluding VAT, or as agreed here: [price per asset, or "price sheet"].
- Advanced add-on (EUR 0.25 per asset per month): [yes / no].
- Price fixation: [12 / 24 months with annual commitment].
- Number of assets at conversion (estimate): [number].
- Subscription start date: [date, not earlier than the day after the pilot ends, and not before the billing capability date in section 11].
- Payment: invoice monthly / weekly, 30 days, or pre-paid credit.
- Decision date: the Customer informs PODFY in writing by [end date + 7 days] whether it converts.

## 10. Termination

Either party may end the pilot at any time with written notice (e-mail is enough). Data handling follows section 8. No fees are due for the pilot or its early end.

## 11. Start date rule

No pilot starts before the build date of every capability it relies on. Dates are from the PODFY capability matrix (updated 2026-10-30). PODFY confirms in writing that each capability is in production before the start date.

| Capability the pilot relies on | Available from | Needed for this pilot? |
|---|---|---|
| Own categories and fields; photo required, optional or off; asset register and stickers with custom text; webhook | Phase 1, production 27 to 30 November 2026 (pilots from 1 December 2026) | [yes / no] |
| Status lifecycle (new, in progress, resolved, rejected), priorities, duplicate grouping; routing rules; dashboard and reports | December 2026 | [yes / no] |
| Full export including photos (ZIP); billing per active asset | December 2026 | [yes / no] |
| Reporter confirmation and "resolved" message (Advanced) | January 2027 | [yes / no] |
| Open API (Advanced); QR portability with 12-month redirect | February 2027 | [yes / no] |

Agreed start date: [date]. It is not earlier than the latest "available from" date of any capability marked "yes". If a needed capability is late, the start date moves and the end date moves with it.

## 12. Signatures

| For PODFY (Lake-Project) | For the Customer |
|---|---|
| Name: [OWNER: authorised signatory] | Name: |
| Role: | Role: |
| Date: | Date: |
| Signature: | Signature: |
