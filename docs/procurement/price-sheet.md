# PODFY price sheet

DRAFT, owner approval needed. Pre-contractual information. Version [OWNER: version and date]. All prices are in euro and exclude VAT. Binding prices are those in your order form.

Supplier: PODFY, a trade name of Lake-Project, Rodenrijselaan 10A, 3037 XE Rotterdam, KvK 29816688, VAT NL001170142B85.

## 1. Proof of delivery

Billed per proof of delivery (POD) processed. No base fee, no per-seat fee, no setup cost.

| | Basic | Starter | Advanced | Pro | Enterprise |
|---|---|---|---|---|---|
| Price per POD | 0.10 [DECIDE: 0.10 or 0.099, see below] | 0.55 | 0.79 | 0.99 | Custom |
| Retention | 14 days | 120 days | 1 year | 5 years | As agreed, up to 7 years |
| Branded upload link, time-stamped PDF, e-mail notification | Yes | Yes | Yes | Yes | Yes |
| Multi-file upload and PDF merge | No | Yes | Yes | Yes | Yes |
| Portal, multi-user roles, damage and exception reporting | No | No | Yes | Yes | Yes |
| PDF header and footer branding | No | No | No | Yes | Yes |
| CMR waybill generator | Not available | Not available | Add-on | Included | Included |
| OCR and AI document scan | No | No | No | No | Yes |

Basic is invoiced at EUR 0.099 per POD in the billing system and shown as EUR 0.10 on the website. [DECIDE: state one figure everywhere. Recommendation: EUR 0.099.]

Add-ons (per POD unless stated):

| Add-on | Price |
|---|---|
| CMR waybill generator | EUR 0.35 per CMR on Advanced; included in Pro and Enterprise. Not available on Basic or Starter (no portal access). (Decided 2026-10-31 by owner.) |
| GPS location check | EUR 0.15 per POD [DECIDE: confirm price and plans where it is included; not on the public rate card] |
| Extended retention | + EUR 0.08 per POD [DECIDE: confirm the retention periods per plan; recommendation: Starter 120 days to 1 year, Advanced 1 to 3 years, Pro 5 to 7 years] |
| No-worries retention | + EUR 0.05 per POD, stacks on extended retention [DECIDE: confirm periods; same as above] |
| Advanced OCR extraction | + EUR 0.15 per POD (included in Enterprise) |

Webhook (from November 2026), status handling, routing, dashboard and full export (from December 2026) and open API (from February 2027): [DECIDE: included in which proof of delivery plans, or priced separately. Recommendation: included in Advanced and up, no extra price].

## 2. QR Reporting

Billed per active asset per month. Nothing per report, user or QR code. Billing per active asset is available from December 2026; pilots before that date are free.

| Active assets | Price per asset per month |
|---|---|
| 1 to 250 | EUR 0.75 |
| 251 to 1,000 | EUR 0.60 |
| 1,001 to 2,500 | EUR 0.50 |
| 2,501 and more | EUR 0.40 |

**Volume pricing: the whole fleet pays the price of the tier it reaches.** With 251 assets, all 251 cost EUR 0.60. Consequence: 251 assets (EUR 150.60) cost less than 250 assets (EUR 187.50), and 1,001 assets (EUR 500.50) cost less than 1,000 (EUR 600.00).

**Active asset.** An asset counts for a month if it is in your register and active at any time in that month. An asset retired during a month counts for that month and is free from the next month. [DECIDE: no pro rata for assets added or retired mid-month. Recommendation: keep it, because it is simple to audit.]

**Minimum fee.** EUR 25 per month. It applies when the monthly total of the QR Reporting lines is below EUR 25, which at EUR 0.75 is the case below 34 assets (33 assets = EUR 24.75).

**Advanced add-on.** + EUR 0.25 per active asset per month. Adds: open API (from February 2027), feedback to the reporter (from January 2027), critical incidents handled within 4 business hours.

### Included in the QR Reporting price

- Asset register, QR codes and stickers with your own text
- Own categories, extra fields and photo settings
- Routing, status, priorities and duplicate grouping
- Dashboard, reports and full export
- Webhook to your systems
- Unlimited users, reports and QR codes (fair use)
- Your branding, app in 42 languages, portal in English, EU storage
- Support: reply within one business day

Capability dates are on the product sheet (product-sheet-qr-reporting.md).

### What is free

- Retired assets
- Users and portal access
- Reports (fair use)
- QR codes and stickers (generation, reprints, custom text)
- Setup (no setup fee)
- The pilot (6 weeks, up to 100 assets)

### Worked examples (excluding VAT, 21% VAT shown for the Netherlands)

**Example A: 180 assets**

| Line | Calculation | Amount |
|---|---|---|
| QR Reporting | 180 x EUR 0.75 | EUR 135.00 |
| Subtotal (without Advanced) | | EUR 135.00 |
| VAT 21% | | EUR 28.35 |
| Total | | EUR 163.35 |
| With Advanced | 180 x EUR 1.00 | EUR 180.00 |
| VAT 21% | | EUR 37.80 |
| Total with Advanced | | EUR 217.80 |

**Example B: 1,200 assets**

| Line | Calculation | Amount |
|---|---|---|
| QR Reporting (tier 1,001 to 2,500) | 1,200 x EUR 0.50 | EUR 600.00 |
| VAT 21% | | EUR 126.00 |
| Total | | EUR 726.00 |
| With Advanced | 1,200 x EUR 0.75 | EUR 900.00 |
| VAT 21% | | EUR 189.00 |
| Total with Advanced | | EUR 1,089.00 |

### Fair use

Unlimited reports are meant for normal operation: on average about 10 reports per asset per month across your fleet. If your average is higher for a sustained period, we contact you first to find out why (for example a faulty asset, a misplaced QR code or abuse of a public form) and agree a way forward. [DECIDE: what happens above fair use. Recommendation: no blocking and no surcharge without 30 days written notice and a proposal; reports are never refused while we talk.]

### Pilot

Free for 6 weeks, up to 100 assets, no setup fee. It does not convert automatically: a paid subscription starts only when both parties sign a conversion. Template: pilot-agreement.md. Pilots start from 1 December 2026.

### Price fixation

The price in your order form is fixed for 12 months from the start date, or for 24 months with an annual commitment. After that period, price changes need written notice of [DECIDE: notice period. Recommendation: 60 days] and apply at the next billing period. Monthly cancellation applies in both cases unless you chose the annual commitment. [DECIDE: if a customer commits annually, is it cancellable before the end of the year? Recommendation: no, but the annual price is lower via prepayment.]

### Annual prepayment

Available through pre-paid credit (section 4). Discount: [DECIDE: discount for 12 months prepaid. Recommendation: 10%, or state "ask us" as on the website].

## 3. Invoicing and payment

- Usage is invoiced in arrears. Choose monthly (previous calendar month, issued on the 1st) or weekly (previous Monday to Sunday, issued on Monday). Weekly QR Reporting invoices are the monthly amount x 12 / 52.
- Invoices are PDF documents e-mailed to your billing contact and any cc recipients you name. Your purchase order number can be shown on the invoice. Invoice numbers run in sequence (format PODFY-2026-001).
- Payment term: 30 days from invoice date by default. A different term is stated in your order form. [DECIDE: keep 30 days as the standard for all customers. Recommendation: yes.]
- Pay online from the invoice link with iDEAL/Wero, credit card (including Apple Pay and Google Pay) or Bancontact, through Mollie. Bank transfer: IBAN [OWNER: IBAN and account name] with the invoice number as reference.
- Late payment: [DECIDE: statutory commercial interest and collection costs, or a fixed reminder process. Recommendation: reminder at due date, statutory commercial interest only after a second written reminder].
- A sent invoice is corrected with a credit note, never silently changed.
- Currency: euro. Invoice language: [DECIDE: English and Dutch. Recommendation: English, Dutch on request].

## 4. Pre-paid credit

You can buy pre-paid credit in the portal, from EUR 50 to EUR 5,000 including VAT per top-up. The top-up invoice (14 days) charges the VAT. The credit becomes available once the invoice is paid and is valid for 12 months from payment. Later usage invoices show the amount paid from credit; the VAT inside the pre-paid part was already charged on the top-up invoice, so do not reclaim it twice. Credit is not refundable. Welcome or goodwill credit, if granted, is stated excluding VAT and is deducted before VAT. Per customer you can choose: invoice afterwards, invoice with optional credit, or pre-paid required (a top-up invoice is sent automatically when the budget runs low). [OWNER: accountant has not yet confirmed the VAT treatment of pre-paid usage and expired pre-paid credit; confirm before this section is sent.]

## 5. VAT

Prices exclude VAT. Dutch customers are charged 21% VAT. For business customers in another EU member state with a valid VAT number, the reverse charge applies (VAT 0%, "VAT reverse charged") and the invoice shows both VAT numbers. Customers outside the EU: [OWNER: accountant to confirm VAT treatment for non-EU customers]. Provide your VAT number and billing address when you order.

## 6. Liability and service level

Liability, uptime (99.5% per month) and service credits are set out in the terms (podfy.net/trust) and in service-description.md. The terms limit liability to the amounts paid in the 12 months before the event, except where the law does not allow it.

## Contact

support@podfy.net | Contact person: [OWNER: name, role, direct phone]
