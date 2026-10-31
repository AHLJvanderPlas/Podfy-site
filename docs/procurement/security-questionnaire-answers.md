# Security Questionnaire Answers Library

Version: draft 1, 2026-10-31. Reusable answers for customer security, procurement and privacy questionnaires. Copy an answer as written. Answers that say [OWNER] or [DECIDE] must be completed or confirmed before they are sent. Items marked **Planned** are not built; always quote the date. Related documents: security-overview.md, toms-annex.md, service-description.md, incident-and-breach-procedure.md.

Style rule: answer yes only where it is fully true. A partial control is described as partial.

## A. Company

**A1. Who is the supplier?**
Lake-Project, trading as PODFY. Rodenrijselaan 10A, 3037 XE Rotterdam, The Netherlands. KvK 29816688. VAT NL001170142B85. Website podfy.net.

**A2. Who is responsible for information security and data protection?**
The owner of Lake-Project [OWNER: name and title to quote]. Security reports: security@podfy.net. Privacy requests: support@podfy.net, subject "Privacy request". No data protection officer is appointed; one is not required for this processing [OWNER: confirm].

**A3. How many people work on the service and who has access to production data?**
[OWNER: state the number of staff and contractors with production access. Recommended wording: "Access is limited to named persons, through the admin application with passkeys, and every administrative change is logged."]

**A4. Is the service dependent on subcontractors?**
Yes, on infrastructure and service providers listed under section L. PODFY runs no own servers.

## B. Hosting and data location

**B1. Where is customer data stored?**
In the EU. Databases (Cloudflare D1) and object storage (Cloudflare R2) were created with the EU jurisdiction, which cannot be changed afterwards. The databases are in the Eastern Europe (Vienna) region of that jurisdiction.

**B2. Is data ever processed outside the EU?**
Requests are handled by Cloudflare's edge network at the location nearest to the requester, so processing is transient and may occur outside the EU. Storage at rest stays in the EU jurisdiction. E-mail is sent through Resend (USA) under Standard Contractual Clauses. If the AI document check is activated, document content is sent to Anthropic (USA), see section K.

**B3. Which infrastructure do you use?**
Cloudflare Pages, Workers, D1 and R2. There is no own data centre, no virtual machines and no operating systems to maintain.

**B4. Is customer data separated from other customers?**
Logically. Every record carries the brand identifier, queries are scoped to it, and file keys start with the brand. There is no separate database per customer.

**B5. Do you offer a dedicated or single-tenant environment?**
No.

## C. Encryption

**C1. Is data encrypted in transit?**
Yes. HTTPS on all domains, TLS 1.2 or higher, HSTS with preload. Verified in the response headers.

**C2. Is data encrypted at rest?**
Yes, by the infrastructure provider: Cloudflare D1 and R2 encrypt data at rest. PODFY does not add application-level encryption of documents and does not hold the keys of the storage layer.

**C3. How are secrets and keys managed?**
Platform secrets and a secrets vault outside the source repositories. A written rule forbids secrets in code. Sign-in tokens, codes and session identifiers are stored only as hashes. [OWNER: key rotation interval; recommend yearly and after any suspected exposure.]

**C4. Do you store personal data in pseudonymised form?**
The driver e-mail address for the driver copy is stored only as an HMAC-SHA256 hash. Other personal data (for example documents, GPS coordinates) is stored in clear form within the encrypted storage, because the customer needs to read it.

## D. Access control

**D1. How do users authenticate?**
Passkeys (WebAuthn) or one-time e-mail links. The customer portal also accepts a 6-digit code from the same e-mail. There are no passwords in the system.

**D2. Do you support single sign-on (SAML, OIDC)?**
No. [DECIDE: if asked often, evaluate for a later phase; do not promise a date.]

**D3. Is access role-based and least privilege?**
Yes: PODFY admin, brand administrator and brand user, each limited to their scope. Brand administrators manage their own users and can pause them.

**D4. How is access revoked?**
Admin requests re-check the user in the database on every call, so deactivation applies immediately. Brand administrators remove or pause users in the portal. Sessions expire (admin 2 hours rolling, portal 7 days sliding, delivery portal 3 days).

**D5. Do you review access rights?**
[OWNER: state review rhythm. Recommended: quarterly review of admin users and passkeys, and on every staffing change.]

**D6. Who at PODFY can see our data?**
Authorised staff through the admin application, for support, billing and operation only. Administrative changes are audit-logged.

## E. Multi-factor authentication

**E1. Is MFA available or enforced?**
Passkeys combine possession of the device with local biometrics or PIN and are phishing-resistant. There is no separate TOTP or SMS second factor. Magic-link sign-in proves control of the mailbox only. PODFY staff use passkeys for the admin application [OWNER: confirm all]. The portal does not force customer users onto passkeys; brand administrators can encourage it.

## F. Logging and monitoring

**F1. Do you keep an audit log?**
Yes, of administrative actions: actor, action, target, details, timestamp. Retention: [OWNER: confirm; recommend 24 months]. The log is not stored in a tamper-evident system.

**F2. Do you log access to customer data?**
Sign-in tokens and sessions record time, IP address and user agent while valid. Administrative actions are in the audit log. [OWNER: state whether record views in the portal are logged; the website text claims view logging for shared record pages, which could not be verified in the repository.]

**F3. How do you monitor the service?**
Hourly external check of four addresses with e-mail alert to the owner; alert on a failed nightly backup; Content-Security-Policy violation reports. Planned, Phase 1 (by 27 November 2026): check every 5 minutes of six targets, phone alert and public status page.

**F4. Is there a SIEM or 24/7 monitoring?**
No. Monitoring is automated with alerts to the owner. There is no 24/7 staffed security operation.

## G. Backup and disaster recovery

**G1. Do you back up data?**
Yes. Every night at 03:00 UTC all tables of both databases are exported to an EU-jurisdiction bucket and kept for 14 days. Failures raise an alert. The job does not copy the document files; those rely on Cloudflare R2 durability. Backups are held with the same provider as production data.

**G2. What are your RPO and RTO?**
[DECIDE] RPO 24 hours, RTO 1 business day, as objectives and not guarantees.

**G3. When did you last test a restore?**
[OWNER: date and result. If none: "A restore test has not yet been recorded; one is scheduled before the first pilot" and then do it.]

**G4. Do you have a disaster recovery plan?**
Restore from the latest export into a new database and redeploy from source. The code is kept in private repositories and can be redeployed within hours. A written runbook is [OWNER: to be written].

**G5. What happens if Cloudflare has an outage?**
The service is unavailable until Cloudflare recovers; there is no second provider. Such outages are excluded from the availability target but communicated. [DECIDE: if a customer requires multi-cloud failover, it is not offered.]

## H. Vulnerability management and testing

**H1. How do you manage vulnerabilities?**
Reports arrive through security@podfy.net and `/.well-known/security.txt`. Acknowledgement within 3 business days, triage within 7. Remediation targets: critical 7 days, high 30, medium 90, low 180. Operating system and runtime patching is done by Cloudflare; PODFY has no servers. [OWNER: describe dependency checks.]

**H2. Do you have a vulnerability disclosure policy or bug bounty?**
A disclosure policy with safe harbour at podfy.net/trust and `SECURITY.md`. No bug bounty.

**H3. Have you had an independent penetration test?**
No, not to date. [OWNER] Recommended: commission one for the customer portal, capture app and admin before the first enterprise contract and repeat yearly. Customers may request a test of their own on agreement and notice.

**H4. How do you test code before release?**
Automated tests run before each deploy of the capture app, customer portal, admin, delivery portal and website, and stop the deploy on failure. Source-scanning tests enforce security rules such as no inline scripts. The capture app is tested on a QA environment first. The scheduled-jobs worker has no tests yet; a test runner is Planned for Phase 1 (by 27 November 2026).

**H5. Do you use a Content-Security-Policy?**
Enforced on podfy.app with no inline scripts. On the portal, admin, delivery portal and podfy.net, the source has no inline scripts or styles and a strict policy is running in report-only mode; the enforced policy there is still broader. Enforcement is planned [OWNER: date].

## I. Incident response

**I1. Do you have an incident response procedure?**
Yes: incident-and-breach-procedure.md, covering detection, severity, roles, containment, communication, breach register and post-incident review.

**I2. How quickly will you tell us about an incident?**
Critical and high incidents: e-mail to brand administrators, first notice as soon as the impact is known, updates at least every 4 business hours for critical incidents. A personal data breach: without undue delay and within 36 hours of becoming aware [DECIDE: contractual figure].

**I3. How is a personal data breach handled?**
Assess, contain, notify the controller (customer) without undue delay, support the customer's notification, record in the breach register. For PODFY's own controller data the Dutch Autoriteit Persoonsgegevens is notified within 72 hours where required.

**I4. Have you had a security incident or data breach in the past 3 years?**
[OWNER: answer from the breach register. The service started operating in 2026; production test data was wiped on 2026-09-29 before commercial use. Do not answer without checking.]

## J. Business continuity and support

**J1. What availability do you commit to?**
99.5% per calendar month with the exclusions in the service description; service credits proposed [DECIDE]. Measured hourly today; every 5 minutes with a public status page from Phase 1 (planned by 27 November 2026).

**J2. What are your support hours and response times?**
[DECIDE] Business days, 09:00 to 17:00 CET/CEST, Dutch holidays excluded. First response within one business day. Critical incidents within 4 business hours with the Advanced plan.

**J3. What if the key person is unavailable?**
[OWNER: name the backup person and what that person can do (access, communication). Required to keep the 4-business-hour promise.]

**J4. What is your exit process?**
Export of data at any time (CSV today; zip export with photos and documents Planned, Phase 2, December 2026), deletion after the handover period, QR redirect for 12 months after leaving (Planned, Phase 3, February 2027). See exit-plan.md.

## K. AI usage

**K1. Do you use AI on our data?**
Only in two optional add-ons: OCR text extraction and an AI document check. They are currently in a testing state and are not offered generally. When a brand has an add-on active, the uploaded document or image is sent to the Anthropic Claude API to read the text and extract fields such as document type, reference match, signature or stamp presence, and damage remarks. The results are stored with the record. Nothing is sent for brands that do not activate the add-ons. PODFY does not use AI to make decisions about people.

**K2. Is our data used to train AI models?**
Under Anthropic's commercial terms, data submitted through the API is not used to train Anthropic's models by default [OWNER: verify the current wording of Anthropic's commercial terms and DPA, and quote the clause, before sending]. PODFY does not train models on customer data.

**K3. Where is the data processed and how long does the provider keep it?**
The Anthropic API is operated from the USA; transfer under Standard Contractual Clauses [OWNER: verify]. Retention at the provider: per Anthropic's current API retention terms [OWNER: verify the period and whether zero data retention is available and worth requesting].

**K4. Can we switch the AI features off?**
Yes. They are off unless activated for the brand.

**K5. Is Anthropic a sub-processor?**
Yes for customers who activate the add-ons. It is not yet on the published list at podfy.net/trust [OWNER: add before first activation and notify customers with a DPA 14 days ahead].

## L. GDPR and sub-processors

**L1. Are you a controller or a processor?**
Processor for operational data in the customer's account (documents, GPS, references, driver identifiers, signatures, reporter data). Controller for website, account, billing and support data.

**L2. Do you sign a DPA?**
Yes, with Standard Contractual Clauses where relevant. Request with subject "DPA request" to support@podfy.net. The technical and organisational measures are in toms-annex.md.

**L3. Who are your sub-processors?**
Cloudflare, Inc. (USA; infrastructure, EU jurisdiction storage; SCCs and EU-U.S. Data Privacy Framework), Resend, Inc. (USA; transactional e-mail; SCCs), Mollie B.V. (Netherlands; payments, billing contacts only). Anthropic PBC (USA) for the optional AI add-ons, see section K. List: podfy.net/trust.

**L4. How do you notify us of sub-processor changes?**
At least 14 days ahead by e-mail to customers with a DPA. The customer may object.

**L5. How do you support data subject requests?**
Forward requests to the customer, and assist with access, rectification, erasure and export within 10 business days of the customer's instruction [DECIDE]. Tools: CSV export, erasure of single records or records before a date, request queue for portal users.

**L6. Do you transfer data outside the EU/EEA?**
Only to the sub-processors above that are in the USA, under Standard Contractual Clauses. Storage stays in the EU jurisdiction.

**L7. Do you carry out a DPIA?**
The customer, as controller, decides whether a DPIA is required. PODFY provides information. The photos and GPS coordinates that drivers upload can be personal data; PODFY recommends the customer to cover this in its own assessment.

## M. Data retention and deletion

**M1. How long is data kept?**
By plan, counted from upload: 14 days (Basic), 120 days (Starter), 1 year (Advanced), 5 years (Pro), up to 7 years with the extended retention add-on. Invoice records 7 years. Contact form 12 months. Edge logs up to 30 days.

**M2. How is data deleted?**
A job runs every 6 hours. At the end of retention the record is marked deleted and its file, OCR and AI results and GPS data are removed. Erasure on request removes the record's files and rows, including soft-deleted rows. Metadata of deleted records may remain in a marked-deleted state for a longer period [OWNER: the job removes such rows after 10 years; confirm or shorten].

**M3. When is data deleted from backups?**
Backups expire after 14 days, so deleted data leaves the backups within 14 days.

**M4. What happens to our data when the contract ends?**
It is exported for the customer and deleted after the handover period; customer account data is deleted 90 days after termination on request. See exit-plan.md.

## N. Certifications and insurance

**N1. Are you ISO 27001 or SOC 2 certified?**
No. PODFY holds no certification. The infrastructure provider Cloudflare holds certifications and attestations (for example ISO/IEC 27001 and SOC 2 reports) [verify current scope before quoting]. These apply to the infrastructure layer only and do not cover PODFY's application or processes.

**N2. Do you follow a security framework?**
PODFY applies its own written security guardrails, enforced by automated tests where possible, and the GDPR Art. 32 measures in the annex. It is not mapped to a formal framework [OWNER: optional mapping to a baseline such as the Dutch NCSC or CIS controls].

**N3. Do you carry insurance?**
[OWNER: professional liability and cyber insurance. Quotes are being obtained. State insurer, cover amounts and validity period when in force. If none: "Professional liability and cyber cover is in preparation."]

**N4. Do you have a business continuity or security policy document?**
The security overview, TOMs annex and incident procedure serve as the documented policies. A separate information security policy is [OWNER: optional].

## O. Application questions that often follow

**O1. How do you protect the public upload page from abuse?**
Single-use challenge per upload, limits per IP address (30 per 10 minutes) and per driver-copy recipient (20 per day), content validation of every file, server-generated identifiers.

**O2. How do you protect against phishing of portal users?**
Passkeys are phishing-resistant. Magic links are one-time, valid for 15 minutes, requested only for known addresses, and are not consumed by mail scanners. The 6-digit code works independently of the link.

**O3. Is customer data used for advertising or sold?**
No. PODFY does not use analytics platforms, advertising networks or tracking pixels and does not sell or share customer data for commercial purposes.
