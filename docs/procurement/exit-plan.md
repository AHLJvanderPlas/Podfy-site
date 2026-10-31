# PODFY exit plan

DRAFT, owner approval needed. Pre-contractual information. Describes how a customer leaves PODFY with its data and its QR codes. Items marked with a date are not available before that date.

## 1. Principles

- Your data stays yours. You can export it at any time during the contract, not only at the end.
- Your QR codes are linked to your own asset numbers or shipment references, not to a PODFY-only code.
- Cancellation is monthly. There is no exit fee. [DECIDE: confirm no exit fee and no fee for the export. Recommendation: none.]

## 2. What you can export

| Data | Format | Available |
|---|---|---|
| Proof of delivery records and reports (metadata: reference, date, status, categories, notes) | CSV, from the portal, self-service | Now |
| Invoice data sets | CSV, from the portal | Now |
| Asset register including the QR address of each asset | CSV | From November 2026 |
| Full export: CSV plus original files, photos and PDFs | ZIP, signed download link valid 24 hours, sent by e-mail to the requester | From December 2026 |
| Webhook history and delivery log | Part of the full export | From December 2026 |
| Fetch records through the API | JSON, open API (Advanced) | From February 2027 |

Until the full export is available, files (PDFs and photos) are provided on request as a ZIP prepared by PODFY. [DECIDE: manual export service for contracts that end before December 2026. Recommendation: yes, within 10 business days, at no charge.]

## 3. How to request

1. Self-service: in the portal use the export function (CSV today, "Export all data" from December 2026).
2. Or e-mail support@podfy.net with the subject "Exit request" and your brand name. State the date you want the service to end.
3. PODFY confirms in writing within one business day, names a contact person and the dates in the table below.
4. A period for the export can be chosen (all data or a date range).

## 4. QR codes after you leave

- A QR code printed on an asset or a shipment card normally points to a PODFY address. When you leave, those addresses would stop working.
- From February 2027: for 12 months after the end of your contract PODFY redirects each QR address to a destination you choose (for example your own reporting page). You set the destination before the end date, and you can change it during the 12 months. The register export contains the QR address of every asset so you can map your own redirect.
- Before February 2027: [DECIDE: what PODFY commits for customers who leave before the redirect exists. Recommendation: do not terminate or delete any brand before the redirect is built; keep QR addresses resolving to a notice page and tell the customer so in the contract.]
- After the 12 months, the addresses are released and show a short notice. [DECIDE: whether to extend the redirect on request. Recommendation: yes, at cost price, on request.]
- The redirect never gives anyone access to your reports.

## 5. Deletion

- During the handover period (see timeline) your data remains available for export. No new reports are accepted after the end date unless the redirect sends reporters elsewhere.
- After the handover period PODFY deletes your reports, files, photos, asset register and portal users from production systems. Retention rules per plan also apply while the contract runs.
- Database backups are kept for 14 days and are overwritten on that cycle, so deleted data leaves backups within 14 days after deletion.
- Invoice and billing records are kept for 7 years because of the Dutch tax retention duty.
- On request PODFY sends a written deletion confirmation. [OWNER: name of the person who sends it.]
- Your portal login and account data are deleted after the contract ends plus 90 days, on request, in line with the privacy statement.

## 6. Timeline

| When | What |
|---|---|
| Day 0 | You give notice (portal or support@podfy.net). Cancellation is monthly; the contract ends at [DECIDE: end of the calendar month in which you cancel. Recommendation: end of that month, notice any time before the last day]. |
| Day 0 + 1 business day | PODFY confirms the end date and the export steps. |
| Before the end date | You export your data and set the redirect destination (from February 2027). |
| End date | Service ends. Invoicing stops after the final invoice. |
| End date to + 90 days | Handover period: export remains available on request. [DECIDE: length of the handover period. Recommendation: 90 days, in line with the account data rule in the privacy statement.] |
| End date to + 12 months | QR redirect active (from February 2027). |
| End of handover period | Production data deleted. Written confirmation on request. |
| Deletion + 14 days | Data has left database backups. |
| Deletion + 7 years | Invoice and billing records deleted. |

## 7. Contact

support@podfy.net | Contact person: [OWNER: name, role, direct phone]
