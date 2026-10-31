# PODFY QR Reporting: product sheet

DRAFT, owner approval needed. Pre-contractual information. Version [OWNER: version and date]. Prices exclude VAT.

## The problem

When a machine, vending unit, vehicle or property asset has a fault, the report comes in by phone, e-mail or a message with no machine number. Staff ask "which one, where, what is wrong?" before any work starts. Nobody can see how often an asset fails.

## How it works

1. Every asset gets its own QR code and a sticker with your logo and your own text, for example "Scan to report an issue".
2. Anyone scans it with the phone camera. A form opens in the browser, in their language. No app, no login. The asset ID and location are already filled in.
3. The reporter picks a category, adds a note and, if you want, a photo.
4. The report goes to the right people by e-mail and, by webhook, to your ticketing or maintenance system. It is stored per asset.

## Key capabilities

| Capability | Availability |
|---|---|
| QR per asset, your branding, app in 42 languages, portal in English, EU storage, e-mail notification | Available now (today per reference, without asset register) |
| Your own categories and extra fields (for example refund amount and payment reference) | Available from November 2026 |
| Photo required, optional or off, per form | Available from November 2026 |
| Asset register from a template upload, move and retire assets, stickers with custom text | Available from November 2026 |
| Webhook (`report.created`), signed, with retries and delivery log | Available from November 2026 |
| Public status page and monthly uptime figure | Available from November 2026 |
| Routing per location, asset group or category | Available from December 2026 |
| Status new, in progress, resolved, rejected; priorities; duplicate grouping | Available from December 2026 |
| Dashboard and reports per asset, location and period | Available from December 2026 |
| Full export including photos (ZIP); billing per active asset | Available from December 2026 |
| Confirmation and "resolved" message to the reporter (Advanced) | Available from January 2027 |
| Open API (Advanced); QR portability with 12-month redirect after leaving | Available from February 2027 |

Pilots start from 1 December 2026, after the first group of capabilities is in production. A start date is never set before the build date of a capability the pilot relies on.

## What PODFY does not do

Plan repairs or dispatch technicians, pay out refunds, or monitor the machine itself. It records and forwards reports.

## Integrations

E-mail, webhook (from November 2026) and open API (from February 2027). No third-party platform is named as an integration unless an agreement exists.

## Security and EU

- Reports and photos are stored in the EU (Cloudflare EU jurisdiction). E-mail delivery and payments use the subprocessors on podfy.net/trust.
- Encryption in transit and at rest, daily backups, tenant separation, abuse protection on public forms.
- Data processing agreement available. Reporters may give an optional name or e-mail; photos may show people. Retention for report records: [DECIDE: retention period for QR Reporting reports. Recommendation: 2 years from report date, configurable].

## Pricing summary

Per active asset per month. Nothing per report, user or QR code. Retired assets are free.

| Active assets | Per asset per month |
|---|---|
| 1 to 250 | EUR 0.68 |
| 251 to 1,000 | EUR 0.45 |
| 1,001 to 2,500 | EUR 0.36 |
| 2,501 and more | EUR 0.27 |

The whole fleet pays the price of the tier it reaches. Minimum EUR 13.50 per month. Advanced adds EUR 0.25 per asset per month. Free 6-week pilot for up to 100 assets. Cancel monthly. Details: price-sheet.md.

## Contact

PODFY is a trade name of Lake-Project, Rodenrijselaan 10A, 3037 XE Rotterdam, KvK 29816688, VAT NL001170142B85.
support@podfy.net | podfy.net | Contact person: [OWNER: name, role, direct phone]
