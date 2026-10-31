# Incident and Personal Data Breach Procedure

Internal procedure. Version: draft 1, 2026-10-31. Owner: the owner of Lake-Project (PODFY). Review once a year and after every critical incident.

Status labels: **Live** is operating today. **Planned (date)** is not built yet. **[OWNER]** is a fact or choice only the owner can supply. **[DECIDE]** is a choice with a recommendation.

## 1. Purpose and scope

Handle events that affect the availability, integrity or confidentiality of the PODFY service (podfy.app, portal.podfy.net, delivery.podfy.net, admin.podfy.net, podfy.net, background worker) and any personal data breach, so that customers are informed without delay, the Dutch Autoriteit Persoonsgegevens (AP) is notified within 72 hours when PODFY is the controller, and lessons are recorded.

PODFY is a processor for customer operational data and a controller for its own website, account and billing data. The roles differ in what must be notified (section 8).

## 2. Detection

| Source | Today | Planned |
|---|---|---|
| Uptime alert | Hourly check of podfy.net, podfy.app, admin.podfy.net, portal.podfy.net/login. E-mail to the owner on change from up to down. | Phase 1 (by 27 November 2026): check every 5 minutes of six targets (adds delivery.podfy.net and an API health URL); phone push alert via Pushover plus e-mail on state change and after 2 consecutive failures. |
| Backup alert | E-mail to the owner if the nightly export of a database fails. | Same |
| CSP violation reports | Aggregated in the `csp_reports` table for portal, admin, delivery portal and website. Review: weekly during the report-only phase [OWNER: confirm rhythm]. | Same |
| Customer report | support@podfy.net, contact form, phone for critical incidents [OWNER: number]. | Auto-acknowledgement (see support-process.md) |
| Researcher report | security@podfy.net, `/.well-known/security.txt` | Same |
| Provider notice | Cloudflare status and e-mail notices, Resend and Mollie status notices [OWNER: subscribe to all three]. | Same |
| Own observation | Errors in logs, unusual rows in `upload_guard`, spikes in uploads or sign-in requests, audit log entries not explained. | Same |

Anyone who suspects an incident reports it to the owner at once. Do not wait to be certain.

## 3. Severity

| Severity | Definition | Examples | Target |
|---|---|---|---|
| Critical | Service unavailable or unusable for customers, or suspected or confirmed breach of personal data, or loss of data. | Uploads failing; portal down; a document visible to another customer; leaked secret; ransom or defacement. | Start at once. Customer notice within 4 business hours (Advanced customers), for others within 1 business day. Breach: see section 8. |
| High | Major function degraded, workaround exists, or a subset of customers affected. | E-mail notifications delayed hours; sign-in code works, link does not; invoice run failed. | Customer notice within 1 business day. |
| Normal | Function defect with limited impact. | Wrong filter result. | Handled as support request. |
| Low | Question or cosmetic. | | Support request. |

Raise severity when in doubt. Any suspected personal data breach starts as Critical until assessed.

## 4. Roles

| Role | Person | Duties |
|---|---|---|
| Incident lead | The owner | Declare and classify, decide actions, lead communication, keep the log, sign off the review. |
| Backup lead | [OWNER: name, phone, e-mail] | Takes over when the owner is unreachable for 2 business hours (or 30 minutes for a critical incident during support hours) [DECIDE]. Needs admin access (passkey), access to the Cloudflare account, the secrets vault and the mail account of support@podfy.net. |
| Communications | Incident lead | Sends customer notices (templates in section 7). |
| Technical support | Incident lead, with external help if needed [OWNER: name a contractor or advisor on call, if any]. | Contain, fix, restore. |
| Legal and privacy advice | [OWNER: name an adviser or law firm to call for breach assessment] | Assess notification duty when unclear. |

Contact list is kept outside the PODFY systems (printed or in the password manager) so it is available during an outage [OWNER].

## 5. Procedure

1. **Detect and record.** Start the incident log (time, who, what, source). Use one document per incident, named with the date. Note every action with a timestamp.
2. **Classify.** Assign severity (section 3). Ask: is personal data involved? Is data exposed, altered, lost or unavailable? Which customers, which systems?
3. **Contain.** Stop the harm first. Typical actions: revoke or rotate the leaked secret (Cloudflare secrets, `HMAC_SECRET`, API keys, session secrets); deactivate an admin user and passkeys; expire sessions and tokens (purge `portal_sessions`, `portal_login_tokens`); block an abusive source in Cloudflare; disable a failing feature or webhook; roll back or hot-patch the deployment; take a database backup before changing data.
4. **Preserve evidence.** Keep logs, audit log entries, request details and copies of affected rows before cleanup. Cloudflare edge logs are kept up to 30 days; extend the hold for the investigation.
5. **Assess.** Determine cause, scope (which brands, which records, which data categories), start and end time, and whether personal data was accessed by an unauthorised party. For a breach follow section 8.
6. **Communicate.** First customer notice within the targets in section 3; updates at least every 4 business hours for critical incidents until mitigated, then at resolution. Use the templates in section 7. From Phase 1 (by 27 November 2026) also update the public status page.
7. **Eradicate and recover.** Fix the root cause, redeploy (capture app: QA first unless an emergency; document the exception), restore from backup if data was lost (backup runs 03:00 UTC, kept 14 days; see Security Overview), verify with the live schema and a smoke test.
8. **Close.** Send the resolved notice. Complete the register entry and the post-incident review (section 10).

## 6. Escalation

- No acknowledgement of a critical alert within 30 minutes during support hours: backup lead is called.
- Outage caused by a provider: follow the provider's status page, tell customers it is a provider incident, do not speculate about its cause, and consider a workaround.
- Possible criminal act (extortion, intrusion): preserve evidence, report to the police, consider the Dutch National Cyber Security Centre guidance [OWNER].
- Insurance: notify the cyber insurer as the policy requires, usually immediately [OWNER: policy not yet in force].

## 7. Customer communication templates (English)

Send from support@podfy.net to the brand administrators of the affected customers. Keep it factual. No speculation, no blame. Use the customer's name. Times in CET/CEST.

### 7.1 Initial notice

> Subject: PODFY incident notice: [short description], [date]
>
> Dear [name],
>
> We are investigating an incident that affects [product/function] at PODFY. It started at [time] on [date].
>
> Impact: [what customers cannot do or what may be affected]. [Workaround, if any.]
> What we are doing: we are working on [containment/fix].
> Personal data: [we have no indication that personal data is affected / we are assessing whether personal data is affected and will tell you within [x] hours].
>
> Next update by [time]. You can reach us at support@podfy.net [or phone for critical incidents: number].
>
> Kind regards,
> [name], PODFY (Lake-Project)

### 7.2 Update

> Subject: PODFY incident update [n]: [short description]
>
> Dear [name],
>
> Update at [time]: [current state: investigating / mitigated / monitoring].
> What we know: [facts established since the last notice].
> What we are doing next: [actions].
> Impact on you: [changes since the last notice].
> Next update by [time], or earlier if the situation changes.
>
> Kind regards,
> [name], PODFY

### 7.3 Resolved

> Subject: PODFY incident resolved: [short description]
>
> Dear [name],
>
> The incident that began at [time] on [date] was resolved at [time] on [date].
> Cause: [short factual cause].
> Impact: [what was affected, for how long, how many records or uploads, if known].
> Data: [no personal data was affected / personal data was affected, see the separate notice].
> Measures: [what has been done, what will be done to prevent a repeat].
> A written summary is available on request. [If service credits apply: you can request the service credit under the service description within 30 days.]
>
> Kind regards,
> [name], PODFY

### 7.4 Personal data breach notice to the customer (controller)

> Subject: Notice of a personal data breach affecting your data, PODFY, [date]
>
> Dear [name],
>
> As your processor under the data processing agreement we are informing you, without undue delay, of a personal data breach. We became aware of it at [date, time].
>
> Nature of the breach: [what happened: unauthorised access / loss / alteration / disclosure].
> Period: from [time] to [time], [ongoing/stopped].
> Data affected: [categories: for example documents and photos, GPS coordinates, driver identifiers, signatures, portal user e-mail addresses]; approximate number of records [n] and of data subjects [n or unknown].
> Likely consequences: [assessment].
> Measures taken and proposed: [containment, remediation, advice to data subjects if any].
> Contact for questions: [name, phone, e-mail].
>
> This notice contains the information available now. We will send further information as we learn more, and we will help you with your own assessment and any notification to the supervisory authority and data subjects, which is your responsibility as controller.
>
> Kind regards,
> [name], PODFY (Lake-Project)

## 8. Personal data breach (GDPR Art. 33 and 34)

### 8.1 Definition

A breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data. It includes lost availability of personal data, for example data loss without a restorable backup.

### 8.2 Assess within hours

Record: what happened; which data; whose data (which customers or whether it is PODFY's own data); how many records and persons; whether the data was encrypted or hashed in a way that prevents use; whether an unauthorised party actually accessed it; likely risk to persons (low, risk, high risk); containment status. Use the breach register fields in section 9.

### 8.3 PODFY as processor (customer operational data)

1. Notify each affected customer (controller) **without undue delay** after becoming aware, and in any case within **36 hours** [DECIDE: contractual figure, see TOMs annex], using template 7.4, to the brand administrators and to the privacy contact on the DPA.
2. Provide the facts known, add information in stages, and support the customer in deciding about notification to the AP and to data subjects. The customer decides and notifies; PODFY does not notify the AP or data subjects on the customer's behalf unless instructed.
3. Keep evidence and the register entry.

### 8.4 PODFY as controller (website, account, billing, support data)

1. Assess the risk to persons. If the breach is unlikely to result in a risk, document the reasoning in the register and do not notify.
2. If it is likely to result in a risk, notify the Dutch **Autoriteit Persoonsgegevens** within **72 hours** after becoming aware, via the AP's data breach notification form (autoriteitpersoonsgegevens.nl). If the notice cannot be complete in 72 hours, send what is known and add the rest in stages, with reasons for delay.
3. If it is likely to result in a **high** risk, also inform the data subjects without undue delay, in clear language: nature, contact point, likely consequences, measures. Not required if the data was unintelligible to unauthorised persons (for example properly encrypted), if measures remove the high risk, or if it would take disproportionate effort (then a public notice).
4. If unsure whether the breach concerns controller or processor data, treat it as both until clarified and notify the customers first.

### 8.5 Clock

The 72 hours start when PODFY has a reasonable degree of certainty that a breach occurred, not when the investigation ends. Record the exact time of awareness in the log.

## 9. Breach register

Keep a register of all personal data breaches, whether notified or not (Art. 33(5)). One row per breach. Store in a file outside the PODFY production systems [OWNER: location]. Fields:

| Field | Content |
|---|---|
| ID and date | Sequential number, date and time of awareness |
| Reporter and source | Who or what detected it |
| Description | Facts, cause |
| Data and persons | Categories, approximate numbers, which customers |
| Role of PODFY | Processor, controller, both |
| Risk assessment | Likely consequences, level, reasoning |
| Containment and remediation | Actions with dates |
| Notifications | Customers (when, who), AP (reference, time), data subjects, insurer, police |
| Decision on notification | If not notified, the reasoning |
| Review done | Date, link to review |

## 10. Post-incident review

Within 10 business days after a critical incident or any personal data breach:

1. Timeline from the incident log.
2. Root cause and contributing factors (technical and process).
3. What worked and what did not (detection time, communication time, backup readiness).
4. Corrective actions with owner and date; enter in the roadmap.
5. Update this procedure, the TOMs annex and the questionnaire answers if facts changed.
6. Provide a short written summary to affected customers on request.

## 11. Exercises

[DECIDE] Once a year, run a tabletop exercise (for example: leaked API key; wrong customer sees a document) and test the restore from backup. Record the date and result in the register's notes. Recommended before the first pilot (from 1 December 2026).

## 12. Open points for the owner

| # | Item | Type |
|---|---|---|
| 1 | Backup person, with access and authority | [OWNER] |
| 2 | Phone number for critical incidents | [OWNER] |
| 3 | Adviser for breach assessment; incident contractor on call | [OWNER] |
| 4 | Pushover account and keys in worker secrets (Phase 1) | [OWNER] |
| 5 | Breach register location | [OWNER] |
| 6 | 36 hours to notify controllers | [DECIDE] recommend yes |
| 7 | Annual exercise | [DECIDE] recommend yes |
| 8 | Cyber insurer notification duty | [OWNER] |
