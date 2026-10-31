# PODFY Security Overview

Version: draft 1, 2026-10-31. Provider: Lake-Project, trading as PODFY (KvK 29816688). Audience: procurement, IT security and data protection reviewers.

Labels: **Live** means in operation and verified against the code or the running service on the date above. **Planned (date)** means not built yet. **[OWNER]** and **[DECIDE]** mark facts or choices the owner must confirm. Where a statement describes what the infrastructure provider (Cloudflare) supplies, it says so; PODFY does not claim those controls as its own certification.

## 1. Summary

- Hosted entirely on Cloudflare (Pages, Workers, D1 databases, R2 object storage). Production data at rest is in the **EU jurisdiction** (databases and buckets created with the EU jurisdiction, which cannot be changed afterwards).
- HTTPS everywhere with HSTS (preload) on all PODFY domains.
- **No passwords.** Sign-in with passkeys (WebAuthn) or one-time e-mail links; the customer portal also accepts a 6-digit code from the same e-mail.
- Admin and portal sessions are re-validated against the database on each request.
- Nightly database backup, kept 14 days, stored in an EU bucket.
- Audit log of administrative actions; abuse limits and single-use challenges on the public upload endpoint.
- Driver e-mail addresses are stored only as an HMAC hash.
- No security certification (ISO 27001, SOC 2) is held by PODFY. See section 12.

## 2. Hosting and data location

| Item | Facts |
|---|---|
| Provider | Cloudflare, Inc. (USA) as infrastructure provider and sub-processor, under its Customer DPA with Standard Contractual Clauses and the EU-U.S. Data Privacy Framework. |
| Databases | Cloudflare D1: `podfy-main-eu` (customer, transaction, billing, authentication and audit data; region Eastern Europe, Vienna, EU jurisdiction) and `podfy-public-eu` (website content, changelog, pricing, and from Phase 1 uptime data; EU jurisdiction). |
| Object storage | Cloudflare R2, EU jurisdiction: `podfy-uploads-eu` (documents and photos), `podfy-logos-eu` (brand logos), `podfy-invoicing-eu` (invoices and database backups). |
| Compute | Cloudflare Workers and Pages Functions. Code runs at the Cloudflare edge location nearest the requester; the EU jurisdiction applies to stored data, not to where a request is momentarily processed. Cloudflare's edge logs (IP address, timestamp, URL, user agent) are kept up to 30 days. |
| Environments | Production, plus a QA environment at qa.podfy.app for the capture app. QA shares the production database and bucket; its uploads are marked `QA-`, never billed, and expire after 30 days. |
| Other locations | None. PODFY has no own servers, office network or data centre. Data is not stored on staff laptops as part of operations [OWNER: confirm no local exports are kept; exports for administration, such as invoice PDFs, may exist]. |

Sub-processors outside the EU: see section 11. Where personal data is transferred outside the EU/EEA, PODFY relies on Standard Contractual Clauses.

## 3. Encryption

| Layer | Measure | Basis |
|---|---|---|
| In transit | HTTPS on all PODFY domains; TLS 1.2 or higher and HTTP/3 at the edge; `Strict-Transport-Security` with `includeSubDomains; preload` (max-age one year on podfy.app and podfy.net, two years on portal, admin and delivery). `.app` is an HSTS-preloaded top-level domain. | Live. Verified in the response headers on 2026-10-31. |
| In transit, e-mail | Mail is sent through Resend; transport encryption between mail servers depends on the receiving server (opportunistic TLS). PODFY does not offer end-to-end e-mail encryption. | Live |
| At rest | Cloudflare D1 and R2 encrypt stored data at rest. This is a platform control supplied by Cloudflare; PODFY does not manage the encryption keys and has no separate application-level encryption of documents. | Provided by Cloudflare |
| Secrets | API keys and signing secrets are stored as platform secrets (Cloudflare Workers/Pages secrets) or in a secrets vault outside the source repositories. A repository rule forbids secrets in code; one value must be recoverable only from the vault. | Live |
| Credentials | Magic-link tokens, sign-in codes and portal session identifiers are stored only as SHA-256 hashes. Passkeys store the public key only. | Live |
| Pseudonymisation | Driver e-mail addresses for the driver-copy function are stored as HMAC-SHA256 with a secret key (`HMAC_SECRET`); the plain address is not stored in the database. | Live |

## 4. Access control

### 4.1 Authentication

| Surface | Methods | Session |
|---|---|---|
| Admin (PODFY staff, admin.podfy.net) | Passkey (WebAuthn, discoverable credentials) or e-mail magic link (15-minute, one-time token; opening the link only shows a Continue page, a click consumes it, so mail scanners cannot burn it). Rate limit: 3 tokens per e-mail per 15 minutes. No password login exists; the password endpoints and stored hashes were removed on 2026-09-30. | Signed cookie, 2-hour lifetime with rolling refresh while active. |
| Customer portal (portal.podfy.net) | Magic link (15 minutes, one-time, scanner-safe), 6-digit code in the same e-mail (5 tries per code, 20 per e-mail per day), or passkey. Links are only sent to addresses that have a membership; unknown addresses receive the same response and nothing is sent. Request rate limit: 5 per 15 minutes. | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`; session identifier stored as a SHA-256 hash; sliding 7-day lifetime. Expired tokens and sessions are purged by a scheduled job. |
| Delivery portal (drivers) | E-mailed link, only for drivers who received a copy; tokens are issued for the delivery portal only and do not open the customer portal. | Session lifetime 3 days (configured `SESSION_TTL_DAYS`); sign-in link valid 15 minutes. |
| Capture app (podfy.app) | No account. Access to a brand by its QR code or link; abuse controls in section 5. | None |

### 4.2 Multi-factor authentication

PODFY does not offer a separate second factor such as TOTP. A passkey is itself a two-factor mechanism (possession of the device plus local biometric or PIN) and resists phishing. A magic link proves control of the mailbox; for that reason the mailbox is the recovery path, and PODFY staff are required to protect it with multi-factor authentication [OWNER: confirm for all staff mailboxes]. Customers can ask their users to register a passkey in My Account.

### 4.3 Authorisation and least privilege

- Roles: PODFY admin; brand administrator and user within a customer brand (organisation). Brand administrators manage their own users, can pause users, and cannot see other brands.
- Tenant separation is logical: every record carries the brand identifier (slug) and queries are scoped to it. The authenticated media proxy validates brand membership before it returns a file (first path segment is the brand). Public record pages use long random share tokens, not sequential identifiers.
- The portal blocks removal or demotion of the last active administrator of a brand.
- Admin requests re-check the database on every call (not only the cookie), so deactivating a PODFY admin takes effect immediately.
- Access of PODFY staff to customer data happens only through the admin application, for support, billing and operations. [OWNER: number of PODFY staff with admin access; recommend one named owner plus one backup, both with passkeys.]

## 5. Application security

| Control | Detail | Status |
|---|---|---|
| Content-Security-Policy | podfy.app: enforced, `script-src 'self' 'wasm-unsafe-eval'` (no inline scripts), `frame-ancestors 'none'`. The portal, admin, delivery portal and podfy.net have had all inline scripts and inline styles removed from the source (admin 144 inline handlers rewritten; guard tests fail the build if inline code returns). Their strict policy is currently served in **report-only mode** with violation reports collected; the enforced header on admin, delivery portal and podfy.net still permits `'unsafe-inline'` for scripts, and the portal enforces only `frame-ancestors`, `object-src` and `base-uri`. Switching to enforcement is planned after the report data are clean. [OWNER: add a target date.] | podfy.app Live; others report-only |
| Other headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` where applicable. | Live |
| Upload abuse limits | Single-use anti-bot challenge per upload (replay is rejected), 30 upload requests per 10 minutes per IP address, 20 driver-copy e-mails per day per recipient (by hash). The group identifier is generated by the server; the client value is ignored. | Live |
| File validation | Only PDF, JPG and PNG as allowed; type is checked by content sniffing, not only by extension; every file in a request is validated before any is stored. Size and count limits apply. | Live |
| Bot protection (website) | Cloudflare Turnstile on contact and newsletter forms. | Live |
| Input handling | Server-side validation; database access through parameterised queries; CSV export neutralises spreadsheet formulas. | Live |
| Object-level checks | Authenticated file access validates brand membership; public record pages are keyed by random tokens; shared-record erasure covers soft-deleted rows, OCR/AI rows and notification logs. | Live |
| Cloudflare edge | DDoS protection and Cloudflare's standard rate limiting and WAF capabilities apply as available on PODFY's Cloudflare plan. [OWNER: state the plan and which WAF managed rules and custom rules are enabled; the site text names WAF and rate limiting but this was not verified in the repositories.] | Provided by Cloudflare |
| CSP reporting | Violation reports from portal, admin, delivery and the website are aggregated in a database table (paths with ids or tokens are reduced to `:id`; capped at 1000 rows per application) and reviewed. | Live |

## 6. Logging, monitoring and audit

| Log | Content | Retention |
|---|---|---|
| Audit log (`audit_log`) | Administrative actions: actor, action, target, details, timestamp. Covers theme and settings changes, billing actions, contact and user changes, passkey events, pricing changes, content changes. | No automatic deletion today. [OWNER: confirm retention; recommend 24 months.] |
| Authentication records | Sign-in tokens and sessions with request IP and user agent (for abuse investigation). Tokens and sessions are purged when expired. | Until expiry (short) |
| Cloudflare edge logs | IP address, timestamp, URL, user agent. | Up to 30 days; longer only for an active investigation |
| CSP reports | Aggregated violation counts. | Rolling, capped |
| API usage log | Per-call log of AI provider usage (call site, model, token counts, estimated cost); it does not store document contents. | [OWNER] |
| Uptime | Hourly check today, results used for owner alerts only. From Phase 1: 5-minute checks stored 35 days, daily totals 400 days, public status page. | Planned, by 27 November 2026 |

Alerting: an uptime failure or a failed nightly backup produces an e-mail alert to the owner (Live). A phone alert (an ops webhook that pushes critical alerts to the owner's phone) and a 5-minute check are **Planned for Phase 1 (by 27 November 2026)**.

Limits to state honestly: there is no central SIEM, no tamper-evident log store, and no formal log review schedule [OWNER: if a review rhythm exists, state it].

## 7. Backup and recovery

| Item | Facts |
|---|---|
| What | A full JSON export of every table of both databases (`podfy-main-eu` and `podfy-public-eu`). |
| When | Every night at 03:00 UTC (scheduled worker). |
| Where | R2 bucket `podfy-invoicing-eu` (EU jurisdiction), under `backups/`. |
| Retention | 14 days; older files are deleted by the same job. Personal data deleted in the live system can therefore remain in a backup for up to 14 days. |
| Monitoring | The job writes a status record and sends an e-mail alert to the owner if a database export fails. |
| Not covered | The nightly job backs up the databases, not the document files in `podfy-uploads-eu`. Document files rely on the durability of Cloudflare R2. Backups are held with the same provider and in the same Cloudflare account as production data; there is no copy at a second provider. A full export of the database was also taken before the data wipe of 2026-09-29. [DECIDE: consider a weekly encrypted copy to a second EU provider and a bucket versioning policy for the document bucket.] |
| Restore | Manual: the owner loads the JSON export into a new or the existing D1 database. [OWNER: date and result of the last restore test; none is recorded. Recommend one test before the first pilot and then twice a year.] |
| Objectives | [DECIDE] RPO 24 hours (nightly backup), RTO 1 business day. Objectives, not guarantees. |

## 8. Vulnerability management and disclosure

- **Disclosure policy.** Reports to security@podfy.net. Published at podfy.net/trust (Responsible Disclosure), `SECURITY.md` and `https://podfy.net/.well-known/security.txt` (Contact, Policy, Preferred-Languages; the file is live and expires on 2027-05-24, so it must be renewed before then [OWNER]).
- **Timelines.** Acknowledgement within 3 business days, triage within 7 business days. Remediation targets: critical 7 days, high 30 days, medium 90 days, low 180 days. Coordinated disclosure, safe harbour for good-faith research. Severity uses CVSS v3.1.
- **Patching.** PODFY runs no servers or operating systems. Dependencies are limited and bundled; the platform (runtime, TLS, network) is patched by Cloudflare. [OWNER: state how dependency updates are checked, for example `npm audit` before releases. This was not verified.]
- **Penetration test.** None performed by a third party to date. [OWNER] Recommendation: commission an external web application test of the customer portal, capture app and admin before the first paid enterprise contract, and re-test yearly.
- **Bug bounty.** None; credit on request.

## 9. Secure development

- Source in private repositories. Production deployments are made by the owner from a local machine with Cloudflare's deployment tool; GitHub does not auto-deploy.
- **Tests on every deploy.** The deploy scripts of the capture app, customer portal, admin, delivery portal and website run the automated test suite and stop on failure. The background worker (`podfy-cron`) and logo worker do not have a test suite yet; a test runner for the background worker is Planned for Phase 1 (by 27 November 2026).
- **QA first for the capture app.** Changes to podfy.app are deployed to qa.podfy.app, smoke-tested, approved and only then deployed to production. Other components deploy directly to production after tests pass.
- **Enforced rules instead of written rules.** Source-scanning tests fail the build for inline scripts and styles, stale generated files, and legacy company details. A browser smoke test opens every tab of the portal and admin and fails on page errors or CSP violations.
- **Schema discipline.** The code and the live database schema are checked together; changes to shared databases are applied in one pass across all applications.
- **Verification of deploys.** Deploys are verified against the served artifact, not only the deploy command's success message.
- Code review is by the single developer-owner with automated checks and AI-assisted review. There is no second human reviewer. [OWNER: confirm; state any independent review.]

## 10. Personnel and organisation

[OWNER] The following facts are not recorded in the repositories and must be supplied by the owner before this document is sent: number of people with access to production systems; confidentiality undertakings (contracts or NDAs) for staff and contractors; screening practice; security awareness; device hygiene (disk encryption, screen lock, updates); offboarding steps (remove admin user, revoke passkeys, rotate secrets); a named backup person for incidents.

Recommended baseline: every person with admin access signs a confidentiality undertaking, uses a passkey, and has full-disk encryption and a screen lock on the device used.

## 11. Sub-processors

Source: podfy.net/trust, section Sub-processors. Customers with a DPA receive at least 14 days' notice of a material addition.

| Provider | Country | Purpose | Data location | Transfer basis |
|---|---|---|---|---|
| Cloudflare, Inc. | USA | Compute (Workers/Pages), database (D1), object storage (R2), CDN, DNS, DDoS protection, bot management (Turnstile). All customer data at rest and in transit. | EU jurisdiction (EU data centres only) | SCCs and EU-U.S. Data Privacy Framework |
| Resend, Inc. | USA | Transactional e-mail: POD notifications, portal magic-link e-mails, invoice e-mails, contact form replies. | US (transit); sender domain EU | SCCs |
| Mollie B.V. | Netherlands (EU) | Payment processing for subscription billing (billing contact name and payment method details only). | EU | No transfer |

**Additional processors that are used but not yet on the published list** [OWNER: add to podfy.net/trust and notify DPA customers 14 days ahead, or confirm they do not apply to customer personal data]:

| Provider | Purpose | Notes |
|---|---|---|
| Anthropic PBC (USA) | Document OCR and AI document check (Claude API). Documents or images of a customer's uploads are sent to the API only for brands that have these add-ons active. | The add-ons are in a testing state (hidden from customers in the plan catalogue). Active so far only for internal demo use. Must be listed before any customer activates them. Data location USA; transfer basis to be confirmed (SCCs in Anthropic's commercial DPA) [verify]. |
| Ops alert webhook (planned) | Phone alerts for uptime via the owner's home automation (Homey). | Alert texts carry system names and URLs, no customer personal data. Not a sub-processor of customer personal data. Planned for Phase 1. |
| Cloudflare Workers AI | Bound to the background worker; used to generate images for website articles. | No customer data. |

## 12. Certifications, assurance and insurance

- **PODFY holds no certification** (no ISO 27001, no SOC 2, no TISAX). PODFY is a small provider and relies on a limited platform and on automated checks.
- **Cloudflare** holds certifications and attestations for its infrastructure, such as ISO/IEC 27001 and SOC 2 [verify current scope and report dates on Cloudflare's compliance page before quoting]. These apply to the infrastructure layer only. They do not certify PODFY's application, configuration or processes.
- **Insurance.** [OWNER: professional liability and cyber insurance; quotes requested under Phase 0, item B. State insurer, cover and validity once in force.]

## 13. Data protection

PODFY is a processor for customer operational data (documents, GPS coordinates at upload, delivery references, signatures) and a controller for its own website, account and billing data. A DPA with Standard Contractual Clauses is available; the technical and organisational measures are in toms-annex.md. Retention periods per plan: 14 days, 120 days, 1 year or 5 years, up to 7 years with the extended retention add-on (Privacy Policy, section 5). Expired records are removed by a job that runs every 6 hours.

## 14. Contacts

Security reports: security@podfy.net. Support and privacy requests: support@podfy.net. Policy: https://podfy.net/trust.
