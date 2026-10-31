# Annex: Technical and Organisational Measures (GDPR Art. 32)

Annex to the Data Processing Agreement between the Customer (controller) and Lake-Project, trading as PODFY (processor), Rodenrijselaan 10A, 3037 XE Rotterdam, KvK 29816688.

Version: draft 1, 2026-10-31. Each measure is stated as it operates. Measures marked **Planned** are not yet in operation and are shown with their target date; they are not warranted until delivered. **[OWNER]** marks facts the owner must confirm before signature. More background is in security-overview.md.

## 0. Processing covered

Processor operates the PODFY service: capture of proof-of-delivery and report documents, storage, notification, portal access, retention and deletion. Personal data: driver identifiers and optional driver e-mail (hashed), GPS coordinates at upload, uploaded documents and photos (which may show persons or signatures), recipient signatures, reporter name and e-mail where the reporting form collects them, portal user names and e-mail addresses, IP address for abuse protection. Infrastructure: Cloudflare (EU jurisdiction storage). Sub-processors: see section 9.

## 1. Pseudonymisation and encryption (Art. 32(1)(a))

1.1 All connections to PODFY domains use HTTPS (TLS 1.2 or higher) and HSTS with preload.
1.2 Data at rest in the databases (Cloudflare D1) and object storage (Cloudflare R2) is encrypted at rest by Cloudflare. Processor does not manage these keys.
1.3 Driver e-mail addresses used for the driver copy are stored only as an HMAC-SHA256 hash with a secret key; the plain address is not stored in the processor's database. The address is processed transiently to send the e-mail (via Resend).
1.4 Sign-in tokens, 6-digit codes and portal session identifiers are stored only as SHA-256 hashes. Passkeys store only the public key.
1.5 Secrets (API keys, signing keys) are kept as platform secrets or in a secrets vault outside source code. A rule prohibits secrets in code and repositories.
1.6 Document files are not additionally encrypted at application level. Where the customer requires this, it is an agreed extra. [DECIDE: state "not offered".]

## 2. Confidentiality (Art. 32(1)(b))

2.1 **Authentication without passwords.** Admin: passkey or one-time e-mail link (15 minutes). Customer portal: one-time link, 6-digit code or passkey. Delivery portal: one-time e-mailed link. No passwords are stored or accepted.
2.2 **Brute-force protection.** Per-e-mail and per-IP limits on link requests and on code attempts (5 attempts per code, 20 per e-mail per day); upload endpoint limited to 30 requests per 10 minutes per IP.
2.3 **Scanner-safe links.** Opening a magic link only shows a confirmation page; the token is consumed on explicit confirmation.
2.4 **Authorisation.** Roles per brand; brand administrators manage their own users; users see only their own brand's records. Authenticated file access validates brand membership. Public record pages use random share tokens.
2.5 **Immediate revocation.** Each admin request re-validates the user in the database, so deactivation takes effect at once. Brand administrators can pause portal users. Delivery-portal tokens cannot open the customer portal.
2.6 **Tenant separation.** Logical separation by brand identifier in every query and in the object key of files. No physical separation per customer.
2.7 **Sessions.** Admin 2 hours rolling; portal 7 days sliding; delivery portal 3 days; cookies HttpOnly, Secure, SameSite.
2.8 **Staff access.** Access to customer data by processor staff only through the admin application, only as needed for support, billing and operation, and every administrative change is audit-logged. [OWNER: number of staff with access; confidentiality undertakings in place.]
2.9 **Data minimisation.** Driver e-mail stored hashed only; GPS and files are removed at the end of retention; only addresses with a membership receive sign-in e-mails.
2.10 **Browser protections.** Content-Security-Policy (enforced on podfy.app; report-only strict policy on the other applications, with inline scripts and styles already removed from the source), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
2.11 **Physical security.** Processor has no data centre or server room. Physical security of data centres is provided by Cloudflare.
2.12 **Devices of staff.** [OWNER: full-disk encryption, screen lock, automatic updates, no storage of customer data on local devices beyond temporary exports.]

## 3. Integrity (Art. 32(1)(b))

3.1 **Input control.** Uploaded files are accepted only as PDF, JPG or PNG, validated by content sniffing, size and count limits; every file of a request is validated before any is stored.
3.2 **Anti-tamper on upload.** Single-use challenge per upload (replay rejected); server-generated record identifier; limits per IP and per recipient.
3.3 **Parameterised database access** and server-side validation of all input.
3.4 **Audit log** of administrative actions (who, what, when, details) for traceability. The log is not tamper-evident (no separate write-once store).
3.5 **Transmission control.** Data is transmitted only over encrypted channels (see 1.1). E-mail between mail servers is opportunistically encrypted; notification e-mails contain a link to the record and, depending on customer configuration, the document.
3.6 **Change control.** Automated tests run before each deploy (capture app, customer portal, admin, delivery portal, website). Changes to the capture app are tested on a QA environment first. The worker that runs scheduled jobs has no test suite yet: Planned, Phase 1 (by 27 November 2026).
3.7 **Invoice and credit records** are append-only or not deletable (Dutch 7-year retention).

## 4. Availability and resilience (Art. 32(1)(b) and (c))

4.1 Service runs on Cloudflare's global network, with DDoS protection at the edge. No single server of the processor exists.
4.2 Availability target 99.5% per calendar month (service-description.md).
4.3 Monitoring: hourly external check of four addresses with e-mail alert to the owner (Live). Planned (Phase 1, by 27 November 2026): check every 5 minutes of six targets, phone alert, public status page.
4.4 Nightly backup (03:00 UTC) of all database tables, retained 14 days, in an EU-jurisdiction bucket; failure produces an alert. Document files are not part of the nightly job and rely on the durability of Cloudflare R2.
4.5 Recovery objectives [DECIDE]: RPO 24 hours, RTO 1 business day.
4.6 Capacity and abuse: rate limits and queue-based processing (e-mail queue) so a spike does not lose notifications.
4.7 Business continuity: no dependency on a single office or device for operation; the owner can operate from any device with a passkey [OWNER: confirm backup person and secrets vault recovery].

## 5. Restoring availability (Art. 32(1)(c))

5.1 Procedure: new or existing D1 database populated from the latest JSON export in `backups/`; redeploy applications from source; verify against the live schema; notify the customer. Documented by the owner. [OWNER: write the restore runbook.]
5.2 **Restore test:** [OWNER: date and result of the last test. None is on record. Recommend: before the first pilot, then twice a year.]
5.3 Deletion in the live system propagates to backups within 14 days, because backups expire after 14 days.

## 6. Regular testing, assessment and evaluation (Art. 32(1)(d))

6.1 Automated regression and source-scanning tests run before deploys; a browser smoke test fails on page errors and CSP violations.
6.2 CSP violation reports from the applications are collected and reviewed.
6.3 Vulnerability intake via security@podfy.net and `/.well-known/security.txt`, with remediation targets (critical 7 days, high 30, medium 90, low 180).
6.4 External penetration test: none to date. [OWNER] Recommended before the first enterprise contract and then yearly.
6.5 Review of this annex and of sub-processors at least once per year and on every material change. [OWNER: confirm annual review.]

## 7. Organisational measures

7.1 **Governance.** Owner is responsible for security and data protection. No data protection officer is appointed (not mandatory for this processing) [OWNER: confirm]. Privacy contact: support@podfy.net, subject "Privacy request".
7.2 **Policies.** Security guardrails for development are written and, where possible, enforced by tests. Incident and breach procedure: incident-and-breach-procedure.md.
7.3 **Personnel.** [OWNER: confidentiality undertaking, screening, training, offboarding.]
7.4 **Documentation.** Register of processing activities as processor [OWNER: confirm exists]. Breach register (incident-and-breach-procedure.md).
7.5 **Customer instructions.** Processing only on documented instructions of the customer (DPA). Customer configures retention, users and notification recipients.

## 8. Retention and deletion

8.1 Retention periods per plan: 14 days, 120 days, 1 year, 5 years, and up to 7 years with the extended retention add-on, counted from upload.
8.2 A scheduled job runs every 6 hours. At the end of retention the record is marked deleted and the stored file, OCR and AI results and GPS data are removed. Metadata of deleted records is removed permanently after a further period [OWNER: the job removes soft-deleted rows after 10 years; confirm that this metadata (no files, no GPS) is acceptable for the DPA or shorten].
8.3 Expired sign-in tokens and sessions are purged by the same job.
8.4 On termination, data is exported to the customer and deleted after the handover period (exit-plan.md). Customer account data is deleted 90 days after termination on request.
8.5 Erasure of a single record, or of records before a date, on documented request of the customer; the erasure covers soft-deleted rows, OCR and AI rows and notification logs, and stops before any database change if a file cannot be deleted.
8.6 Invoice records are kept 7 years (legal obligation).

## 9. Sub-processor management

9.1 Written agreements with each sub-processor with data protection terms; Standard Contractual Clauses where data goes outside the EU/EEA.
9.2 Current list at podfy.net/trust. Material additions are notified at least 14 days ahead to customers with a DPA; the customer may object.
9.3 Current sub-processors: Cloudflare, Inc. (infrastructure, EU jurisdiction storage), Resend, Inc. (transactional e-mail), Mollie B.V. (payments, billing contacts only). Anthropic PBC for document OCR and AI check: used only for customers who activate those add-ons; add to the public list before first activation [OWNER].
9.4 Selection: each new sub-processor is assessed on location, security, contract terms and necessity before use.

## 10. Data subject requests

10.1 Requests reach the processor through support@podfy.net (subject "Privacy request") or are forwarded by the customer.
10.2 Because the customer is the controller, the processor forwards a request received from a data subject to the customer without answering it on the merits, unless the customer instructs otherwise.
10.3 The processor assists the customer with access, rectification, erasure, restriction and export within 10 business days of the customer's request, using the portal export (CSV), the erasure tools and the audit trail. [DECIDE: recommend 10 business days.]
10.4 Erasure requests from portal users are recorded in a request queue and executed by PODFY staff.

## 11. Personal data breach

11.1 The processor notifies the customer without undue delay, and in any case within **36 hours** after becoming aware of a personal data breach affecting the customer's data, with the information available (nature, categories and approximate numbers, likely consequences, measures taken, contact). [DECIDE: 36 hours is the recommended contractual figure so that the customer can meet its own 72-hour duty under Art. 33; shorter periods weaken what a one-person provider can promise.]
11.2 Procedure, roles, templates and the breach register are in incident-and-breach-procedure.md. The processor supports the customer's notification to the supervisory authority and to data subjects.
11.3 The processor does not notify the supervisory authority or data subjects on the customer's behalf unless instructed. For PODFY's own controller data the Dutch Autoriteit Persoonsgegevens is notified within 72 hours where required.

## 12. Audit

The customer may request information needed to show compliance and, on reasonable notice and at its own cost, an audit or inspection, limited in scope and frequency. The processor can provide this annex, the security overview, the questionnaire answers and, where available, summaries of test results. Infrastructure certification reports of Cloudflare are issued by Cloudflare under its own terms.
