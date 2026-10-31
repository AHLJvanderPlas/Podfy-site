# PODFY Service Description

Version: draft 1, 2026-10-31. Provider: Lake-Project, trading as PODFY, Rodenrijselaan 10A, 3037 XE Rotterdam, The Netherlands. KvK 29816688, VAT NL001170142B85.

Status legend used in this document and in the other procurement documents:

- **Live** means operating today.
- **Planned (date)** means not built yet. The date is the build target from the PODFY capability matrix. No start date is committed before it.
- **[OWNER]** means a fact only the owner can supply. **[DECIDE]** means a policy choice with a recommendation; it is not in force until confirmed.

This description supplements the order form or pilot agreement. Where it differs from the order form, the order form prevails. The Terms of Service (podfy.net/trust) state that uptime commitments for paid subscriptions are defined in the order form; this document is the proposed content of that commitment.

## 1. Scope of the service

PODFY is a hosted, browser-based service. Nothing is installed on the customer side. All components run on Cloudflare (Pages, Workers, D1, R2) with data stored in the EU jurisdiction.

| Component | Address | Used by | Purpose |
|---|---|---|---|
| Capture app | podfy.app | Drivers, reporters, staff of the customer | Upload a proof of delivery or CMR, or file a report, by scanning a QR code. No account needed for the person capturing. |
| Customer portal | portal.podfy.net | Brand administrators and users of the customer | Search and view records, download documents, manage users, settings, notifications, invoices. |
| Delivery portal | delivery.podfy.net | Drivers who received a copy | View their own delivery records through an e-mailed link. |
| Notifications | E-mail from PODFY | Customer staff, optionally the driver | E-mail with the record and a link on each upload. |
| Administration | admin.podfy.net | PODFY staff only | Operation of the service. Not a customer-facing component. |
| Website | podfy.net | Everyone | Information, legal texts, changelog. |

### 1.1 Product: CMR and delivery proof (Live)

- QR code per shipment or location, capture of photos or PDF documents through the phone browser, no app.
- Branding per customer, app in 42 languages, portal in English, e-mail notifications, searchable history, CSV export.
- Retention per plan (see Privacy Policy section 5), deletion at the end of retention, deletion on request.
- Optional add-ons per customer configuration, for example PDF header and footer, PDF merge, GPS stamp, driver copy by e-mail. OCR text extraction and AI document check exist as add-ons that are not yet generally offered (they are in a testing state in the plan catalogue); they are only active for a customer who has agreed to them. See the Security Overview and the Questionnaire Answers for the data flow.

### 1.2 Product: QR Reporting (Planned, Phase 1 to 3, per the capability matrix)

QR Reporting runs on the same application and infrastructure, configured for reports on assets instead of deliveries. The following parts of the promise are **not built yet** and are available inside a pilot or contract only from these dates:

| Capability | Planned |
|---|---|
| Own categories and extra fields, photo required/optional/off, asset register and sticker text, webhook (`pod.created`, `report.created`) | Phase 1, 27 November 2026 |
| Routing rules, status lifecycle, dashboard and reports per asset, zip export including photos, billing per active asset | Phase 2, December 2026 |
| Reporter confirmation and "resolved" message | Phase 2 to 3, January 2027 |
| Open API (API keys per brand), QR portability with 12-month redirect after leaving | Phase 3, February 2027 |

No contract start date for a capability is signed before its date in this table.

### 1.3 Out of scope

Customer's own network, devices and browsers; the e-mail systems of the customer; legal advice on retention periods (the customer configures retention); third-party systems the customer connects through webhooks or the API; beta features, which carry no service level (Terms of Service section 9).

## 2. Availability

### 2.1 Target

**99.5% availability per calendar month** for each of the components in section 1 that the customer uses (capture app, customer portal, delivery portal, notification delivery). 99.5% corresponds to at most about 3 hours 39 minutes of unavailability in a 30-day month.

### 2.2 How availability is measured

Availability for a month is the percentage of check intervals in which the check succeeded, excluding the exclusions in section 2.3.

| Item | Today (Live) | From Phase 1 (planned by 27 November 2026) |
|---|---|---|
| Check frequency | Hourly, from the PODFY background worker | Every 5 minutes (schedule `2-59/5 * * * *`) |
| Targets | podfy.net, podfy.app, admin.podfy.net, portal.podfy.net/login | podfy.net, podfy.app, portal.podfy.net/login, admin.podfy.net, delivery.podfy.net, one API health URL |
| Failure definition | Connection error, timeout after 10 seconds, or HTTP status 500 or higher | Same |
| Alerting | E-mail to the owner on a change from up to down | Phone alert via an ops webhook plus e-mail, on state change and after 2 consecutive failures |
| Evidence | Not published | Results stored in the EU (database `podfy-public-eu`), raw checks 35 days, daily totals 400 days; public status page with 90-day bars and monthly percentage at podfy.net/status |
| Monthly figure | Not published | Published monthly |

The check is an external HTTP request to the public address from a worker on the same provider's network. It is a simple reachability check, not a transaction test. Until Phase 1 is delivered, the commitment is measured with the hourly check, which gives a coarse picture only. [DECIDE: for pilots before the Phase 1 date, state the target as a goal without credits. Recommended.]

### 2.3 Exclusions

The following do not count as unavailability:

1. **Announced maintenance**, announced at least 48 hours ahead by e-mail to the brand administrators and, from Phase 1, on the status page. Recommended cap: 4 hours per month. [DECIDE]
2. **Third-party outages outside PODFY's control**, including a general outage of the Cloudflare network, of the customer's or driver's internet connection, of Resend (e-mail delivery), or of Mollie (payment). PODFY reports such outages and works around them where it can.
3. **Force majeure** (war, disaster, government action, widespread internet failure, and similar events beyond reasonable control).
4. **Customer-caused** events: wrong configuration by the customer, misuse, use against the Terms of Service, traffic that triggers the abuse limits, unsupported browsers, suspended accounts for non-payment.
5. **Emergency security maintenance** needed to protect customer data, to the extent it cannot be announced 48 hours ahead. PODFY informs the brand administrators as soon as practical. [DECIDE: recommended to include, with a cap of 2 hours per month.]
6. Beta or testing features, and the QA environment.

### 2.4 Service credits [DECIDE]

Proposal, not yet in force:

- If measured availability of a product in a calendar month is below 99.5%, the customer receives a credit of **10% of the monthly fee for the affected product** for that month.
- The customer requests the credit in writing (support@podfy.net) within **30 days** after the end of the month. PODFY confirms the figure from its measurement.
- The credit is applied to a future invoice. It has no cash value, except at the end of the contract where PODFY refunds the credit on the final invoice.
- The credit is the **sole and exclusive remedy** for failure to meet the availability target. It does not limit liability that cannot be limited by law (Terms of Service section 7).
- Recommendation: a single tier at 10% is easy to administer for a small provider. A second tier (for example 25% below 99.0%) can be added later. Credits are not penalties.

Because the service credit is an output of measurement, no credit is offered for months before the Phase 1 measurement is live, unless the order form says otherwise. [DECIDE]

## 3. Support

### 3.1 Channels

| Channel | Address | Use |
|---|---|---|
| E-mail | support@podfy.net | All requests, including incidents. Today this is an inbox; an automatic acknowledgement is planned (see support-process.md). |
| Contact form | podfy.net/contact | General and sales questions. |
| Security reports | security@podfy.net | Vulnerabilities, see Security Overview. |
| Privacy requests | support@podfy.net, subject "Privacy request" | Data subject requests, DPA. |
| Phone for critical incidents | [OWNER: number, and whether customers on Advanced receive it] | Critical incidents only, Advanced plan. Required to keep the 4-business-hour promise (Phase 0 readiness item F). |

### 3.2 Support hours [DECIDE]

Recommended: **business days, 09:00 to 17:00 Central European Time (CET/CEST), Amsterdam time**, excluding Dutch public holidays (New Year's Day, Good Friday, Easter Monday, King's Day, Liberation Day in every fifth year or when agreed, Ascension Day, Whit Monday, Christmas Day, Boxing Day). A "business day" is a day on which PODFY's support hours apply. A "business hour" is an hour within the support hours.

Incidents are monitored outside support hours by automated checks (alert to the owner). Outside support hours there is no commitment to respond, unless the order form says otherwise.

### 3.3 Response targets

| Severity | First response | Applies to |
|---|---|---|
| Critical | Within **4 business hours** (Advanced plan) | Plans with Advanced support. |
| Critical, plans without Advanced | Within 1 business day | |
| High | Within 1 business day | All plans |
| Normal | Within 1 business day | All plans |
| Low | Within 1 business day (first response), answered in the normal order | All plans |

"First response" means a human reply that confirms the issue has been understood and states the next step. It is not a resolution time. PODFY states the status of an open critical incident at least every 4 business hours until mitigated, and daily for high severity. Resolution targets are not committed because they depend on the cause; PODFY works on critical incidents until mitigated, also outside support hours when it is aware of them. [DECIDE: recommended wording; a promise of out-of-hours work needs a named backup person, see support-process.md.]

### 3.4 Severity definitions

| Severity | Definition | Examples |
|---|---|---|
| **Critical** | The service is unavailable or unusable for a customer, or there is a confirmed or suspected personal data breach or security incident affecting the customer. No workaround. | Uploads fail for all drivers of a customer; portal cannot be opened; documents visible to the wrong customer; data loss. |
| **High** | A main function is seriously degraded, a workaround exists or only part of the users are affected. | Notification e-mails delayed by hours; sign-in works only with the 6-digit code; webhook deliveries failing (from Phase 1); invoices cannot be downloaded. |
| **Normal** | A function does not work as described, with limited business impact. | A filter returns wrong results; a PDF layout error; a wrong translation that changes meaning. |
| **Low** | Question, advice, cosmetic issue, feature request. | How to add a user; typo; request for a new field. |

The customer proposes a severity when reporting. PODFY sets the final severity and tells the customer if it differs.

### 3.5 Incident communication

- **Status page**: podfy.net/status, current state and 90-day history. **Planned, Phase 1 (by 27 November 2026).** Today the page does not exist (the address returns "not found").
- **E-mail to brand administrators** for critical and high incidents: initial notice, updates, resolution, with the template in incident-and-breach-procedure.md. Live as a manual process.
- **Personal data breach**: the customer, as controller, is informed without undue delay, see the DPA and the incident procedure.
- **Post-incident summary** for critical incidents on request, within 10 business days. [DECIDE: recommended.]
- Planned: a monthly uptime figure on the status page (Phase 1).

## 4. Change management

- **Environments.** The capture app podfy.app has a separate test environment, qa.podfy.app. A change to the capture app is deployed to QA, tested, approved by the owner and only then deployed to production. Other components (portal, admin, delivery portal, website, workers) are deployed directly to production after automated tests pass. Note for customers: the QA environment shares the production database and storage; QA uploads are marked, unbilled and deleted after 30 days; brand e-mail from QA goes only to addresses the customer configures for QA.
- **Automated tests.** The deploy scripts of the capture app, customer portal, admin, delivery portal and website stop the deployment if the test suite fails.
- **Changelog.** Customer-visible changes are published at podfy.net/changelog (Live), with an RSS feed.
- **Notice of changes.** Changes that reduce core functionality for paying customers are not made during a subscription term, unless required by law or security (Terms of Service section 10). Changes to sub-processors are notified at least 14 days in advance to customers with a DPA.
- **Emergency changes** (security fix, outage) can be deployed at once and are described in the changelog afterwards where relevant.

## 5. Maintenance windows

[DECIDE] Recommended: planned maintenance that may cause unavailability is scheduled on weekdays between 06:00 and 08:00 CET/CEST or Sunday 20:00 to 23:00 CET/CEST, announced at least 48 hours ahead, at most 4 hours per month. Most deployments on this platform (static assets and edge functions) do not interrupt service. Database migrations are additive where possible.

## 6. Data, backup and continuity (summary)

- Data is stored in the EU jurisdiction of Cloudflare (D1 databases `podfy-main-eu`, `podfy-public-eu`; R2 buckets in EU jurisdiction).
- Nightly database backup at 03:00 UTC, kept 14 days (Live). Details and limits in the Security Overview.
- Recovery objectives [DECIDE]: **RPO 24 hours, RTO 1 business day** for a loss of the databases. These are objectives, not guarantees, and are not part of the availability target.
- Export of the customer's data at any time (CSV today; zip export with photos and documents Planned, Phase 2, December 2026) and an exit plan: see exit-plan.md.

## 7. Customer responsibilities

Keep sign-in credentials and the mailboxes used for magic links secure; name and maintain the brand administrators; configure retention, users and notification addresses; report incidents through the channels above and mark critical incidents as such; keep contact details for incident communication current; do not run load or security tests against production without agreement (see the Responsible Disclosure rules).

## 8. Open points for the owner

| # | Item | Type |
|---|---|---|
| 1 | Service credit: 10%, request within 30 days, sole remedy | [DECIDE] recommend yes |
| 2 | Support hours 09:00 to 17:00 CET/CEST, business days, Dutch holidays | [DECIDE] recommend yes |
| 3 | Maintenance window and 4 hours per month cap | [DECIDE] |
| 4 | Phone number and backup person for critical incidents | [OWNER] |
| 5 | Exact Phase 1 date for 5-minute check and status page | [DECIDE] currently planned by 27 November 2026 |
| 6 | Whether pilots before Phase 1 carry credits | [DECIDE] recommend no credits, target only |
