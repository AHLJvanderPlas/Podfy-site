# QR Reporting: legal text additions (DRAFT, EN)

Status: draft for owner approval, 2026-10-31. Nothing here is published. Source of facts: capability matrix (2026-10-30), phase 0 readiness (sections B and G), QR pricing source (`build.py` QR_TIERS, QR_MIN, QR_ADV), plans 01 and 10. Style, defined terms and tone follow `trust.html` (Terms, Privacy Policy, "What you can count on").

This is a drafting aid, not legal advice. Items marked [DECIDE] need the owner, and the ones marked [DECIDE, LAWYER] should be seen by a lawyer before publication.

---

## Part 1. Cover note for the owner

### 1.1 What goes where in trust.html

**Terms of Service (`id="terms"`)**. Sections 1 to 10 keep their numbers and ids. Insert six new numbered sections after section 10. The current section 11 (governing law, company details, contact) becomes section 17 and keeps its id `terms-law`.

| New no. | Heading | Proposed id | Source in this file |
|---|---|---|---|
| 11 | QR Reporting: service | `terms-qr` | Terms 11 below |
| 12 | QR Reporting: active assets, fees & pilot | `terms-qr-fees` | Terms 12 below |
| 13 | QR Reporting: fair use | `terms-qr-fair-use` | Terms 13 below |
| 14 | QR Reporting: your responsibilities | `terms-qr-customer` | Terms 14 below |
| 15 | QR Reporting: service levels | `terms-qr-sla` | Terms 15 below |
| 16 | QR Reporting: exit, QR redirect & data export | `terms-qr-exit` | Terms 16 below |
| 17 | Governing law, company details & contact (was 11) | `terms-law` | unchanged |

Small edits to existing Terms text (listed at the end of Part 2): section 2 (definitions), section 6 (fees), section 7 (service levels), section 10 (changes). Bump "Last updated" for Terms. Before renumbering, search the whole site (`grep -rn "section 11\|#terms"`) for references to "section 11" or to numbered Terms sections.

**Privacy Policy (`id="privacy"`)**. Sections 1 to 8 keep their numbers. Insert one new section 9 "QR Reporting: people who submit a report" (id `privacy-reporters`). Current section 9 (Children) becomes 10 and section 10 (Changes) becomes 11. Add rows and bullets to the existing section 2 (roles), section 3 (table), section 4 (purposes), section 5 (retention) and section 8 (rights), as shown in Part 3. Bump "Last updated" for the Privacy Policy.

**Sub-processors (`id="subprocessors"`)**. No new provider is needed for QR Reporting as designed (Cloudflare for storage and abuse protection, Resend for e-mail to staff and reporters). See [DECIDE 14] about AI reading.

**"What you can count on" (`id="service"`)**. Existing wording is consistent with this draft. Add a link "Service Description" next to the 99.5% uptime card once the Service Description exists ([DECIDE 6]).

**Separate documents to produce (not in trust.html)**: Service Description (referenced by Terms section 15), DPA annex for QR Reporting (Part 3.6), sticker notice (Part 4).

### 1.2 Build-date notes (do not publish a clause as available before its date)

The Terms are binding text, so a clause that promises a feature must not be live earlier than the feature, or must carry the "from" qualifier below. Capability matrix dates:

| Clause depends on | Build date (matrix) | How this draft handles it |
|---|---|---|
| Asset register, own categories, photo optional | Phase 1, 27 Nov 2026 | Pilot starts 1 Dec 2026 at the earliest (readiness D). Terms can go live with the pilot. |
| Billing per active asset per month | Phase 2, Dec 2026 | Section 12 is written for it. Until built, pilots run at EUR 0 and the first invoice is not issued before the build date. [DECIDE 1] |
| Full export including photos (ZIP) | Phase 2, Dec 2026 | Section 16 says "from 1 January 2027 as a ZIP" and CSV before; until then PODFY provides the photo export on request within 10 business days. |
| Reporter e-mail stored encrypted, "Keep me informed", resolved message | Phase 2-3, Jan 2027 | Privacy 9.2 and 9.6 carry a bracketed owner note. Do not publish the "Keep me informed" wording before it ships. |
| QR redirect after leaving (12 months) | Phase 3, Feb 2027 | Section 16 is written as a contractual promise. Bracketed owner note: until the redirect setting exists, PODFY performs it manually per customer, which is possible because it is one redirect rule per brand. [DECIDE 9] |
| Public status page, monthly uptime report | Phase 1, Nov 2026 | Section 15 refers to it. Uptime check is hourly today and 5-minute is planned (readiness F). The Service Description must not claim 5-minute checks until in place. |
| 99.5% uptime target, support 1 business day, critical 4 business hours with Advanced | Phase 0, process | Needs the on-call rule and a backup person (readiness F) before the first pilot. |
| Open API, reporter feedback (Advanced) | Phase 3, Feb 2027 / Jan 2027 | Not named in the Terms; the Advanced add-on is described by price only and "as described in the Service Description". |

### 1.3 Decisions needed

[DECIDE] items are numbered here and repeated in place in the text. Each has a recommendation.

1. [DECIDE] VAT: state prices excluding VAT. Recommendation: yes, B2B, consistent with the welcome-credit wording ("stated excluding VAT"). Confirm what the public pricing page shows.
2. [DECIDE] When an asset counts as active within a billing period. The product rule is "in the register and not retired during the period". Recommendation: keep that rule, count an asset added mid-period in full for that period, and add an anti-abuse sentence (re-adding an asset that was retired in the same period counts as active). Weekly billing brands exist in plan 01; this draft covers monthly billing only.
3. [DECIDE] Pilot: what happens above 100 assets, and conversion. Recommendation: pilot is capped at 100 assets; assets above the cap are not accepted into the pilot register; the pilot converts to paid only by written confirmation of the conversion price (in the one-page pilot agreement), never automatically.
4. [DECIDE] Price fixation after the 12 or 24 months. Recommendation: PODFY may change prices after the fixed period on 60 days' written notice, and you may then cancel at the end of the month before the new price applies. Also carve prices out of the "continued use constitutes acceptance" sentence in Terms section 10.
5. [DECIDE] Fair use surcharge amount and mechanism. Recommendation: no number in the Terms; any surcharge only by written agreement beforehand, never retroactive, and the customer can instead cancel or reduce assets. Measure as total reports divided by active assets, averaged over a rolling 3 months, so seasonal peaks do not trigger it.
6. [DECIDE] Where the Service Description lives. Recommendation: publish at `/trust#service-description` as a new section plus a PDF for the procurement pack, same text. Include business-day definition (Monday to Friday, 09:00 to 17:00 Central European Time, excluding Dutch public holidays) and the exact scope of "availability" (recommendation: the report form can be opened and a report accepted, and the customer portal can be opened).
7. [DECIDE, LAWYER] Service credit: 10% of the monthly fee for the affected month if monthly availability is below 99.5%, as sole remedy, claim within 30 days after the month, credited on the next invoice, no cash payout. Recommendation: accept 10%, and add no termination right for repeated failure (a buyer will ask; a fallback is a right to terminate monthly anyway, which already exists because cancellation is monthly). Credits count toward the liability cap in Terms section 7.
8. [DECIDE] Handover period before deletion after leaving: 30 days (proposed). Recommendation: 30 days from the end date, export available during that time, deletion from the live system at the end and from nightly backups within 14 more days (matrix: nightly D1 backup, 14 days). Note this differs from the 90 days post-termination for account data in Privacy section 5; keep both and say why (report data is more sensitive and often contains photos of people).
9. [DECIDE] QR redirect: free of charge? what if no destination is set? Recommendation: free for 12 months; if the customer has set no destination by the end date, the QR URLs show a neutral page saying the service ended and naming the customer, with no form. Until the redirect setting is built (Feb 2027), perform manually per customer on request (see 1.2).
10. [DECIDE] Cancellation mechanics: notice by the customer portal or e-mail to support@podfy.net, effective at the end of the calendar month in which notice is received. Recommendation: that. Pilot ends on its end date without notice.
11. [DECIDE] Retention default for reports. The facts say "follows the brand's settings"; the Privacy Policy retention table is per plan for POD records. Recommendation: say the customer sets the retention period per brand, with a maximum of 7 years, and PODFY proposes a default of 12 months in the onboarding form (owner to confirm the default and maximum).
12. [DECIDE] Reporter e-mail retention. Recommendation: delete the encrypted reporter e-mail 30 days after the report is marked resolved, or when the report is deleted, whichever is first (needs the resolved status, Phase 2, Dec 2026).
13. [DECIDE] Photo EXIF. Plan 01 shows a webhook example with location source "photo", and the delivery product reads photo EXIF. In report mode, location comes from the register. Recommendation: strip GPS EXIF from report photos on upload, or if that is not built, say honestly in Privacy 9.2 that photo metadata may be kept. This draft uses the "stripped" wording in brackets; verify against the code before publishing.
14. [DECIDE] AI reading of report photos. The claims register names Anthropic as a sub-processor for optional AI reading in the delivery product; the public sub-processor list does not. Plan 10 says no OCR/AI rows are queued for records without a file. Recommendation: confirm that no report photo is sent to AI reading by default, state that in the DPA annex, and add the provider to the list if it is ever used for reports.
15. [DECIDE] IP address detail. The upload guard keeps IP counters for 24 hours. Cloudflare edge security logs keep IP addresses up to 30 days (existing Privacy section 3 and 5). Recommendation: say both, as drafted. Confirm that the IP is not stored on the report record itself.
16. [DECIDE, LAWYER] Whether PODFY is only a processor for the sticker flow. The customer decides purposes, so processor is the right role; PODFY is controller only for abuse protection data. A lawyer should confirm the wording on joint responsibility is not needed. Also the "Keep me informed" consent line and reporter-facing text are the customer's responsibility with a PODFY template.
17. [DECIDE, LAWYER] Insurance: buyers will ask for professional liability and cyber certificates (readiness B). Not a text item, but the liability cap in Terms section 7 (12 months fees paid) is low for a fleet customer and may be negotiated.
18. [DECIDE] Redirect destination rules (lawful, not misleading, not malware). Recommendation: as drafted, PODFY can refuse or switch off a destination for abuse, and in that case shows the neutral page.
19. [DECIDE] Annual commitment: what it is. The price sheet says "24 months with an annual commitment". Recommendation: define it in the order form (12 months paid up front or committed), not in the Terms; the Terms only say "as agreed in the order form".
20. [DECIDE] Consumer law: all drafted text assumes B2B only. Consumers are the reporters, not the customer, so consumer law on the contract does not apply; the notice in Part 4 is the reporter-facing text.

---

## Part 2. Terms additions

Insert after Terms section 10. Defined terms already in Terms section 2 ("Services", "Customer Data", "Application") are reused. New defined terms are introduced in section 11 and section 12.

### 11. QR Reporting: service {#terms-qr}

"QR Reporting" means the part of the Application with which you collect reports about physical assets, such as machines, installations, vehicles or locations ("Assets"). Each Asset gets a QR code. Anyone who scans the code ("Reporter") can submit a report ("Report") through a web form, without installing an app or creating an account.

A Report consists of a category, and may include a note, a photo and extra fields, as you configure them. A Reporter may also give an e-mail address, if you have switched on that option. [OWNER NOTE: the "Keep me informed" e-mail option and reporter confirmation are built in Phase 2-3, target January 2027; the sentence on e-mail addresses must not be published before that.]

QR Reporting includes an Asset register, QR codes and stickers, categories and fields, routing and status management, dashboards and reports, export, a webhook to your systems, your branding, and the languages the Application supports. The Advanced add-on adds the features described in the Service Description (including API access, reporter feedback and priority support). Features are made available from the date stated on podfy.net or in your order form; PODFY does not commit to a start date earlier than the date a feature is built.

QR Reporting is a tool for collecting and routing reports. It is not an emergency service, an alarm system or a safety system. You may not rely on it to receive reports that require immediate action to prevent injury, and section 3 (high-risk activities) applies in full.

You, not PODFY, decide what you do with a Report. PODFY does not verify the content of a Report.

### 12. QR Reporting: active assets, fees & pilot {#terms-qr-fees}

**Billing unit.** QR Reporting is billed per Active Asset per month. An "Active Asset" is an Asset that is in your register and has not been retired during the billing period. Retired Assets are free. There is no fee per Report, per user, per QR code, or for stickers. [DECIDE 2: an Asset added during a period counts in full for that period; an Asset that is retired and re-added within the same period counts as active.]

**Prices.** Prices are volume prices per Active Asset per month, excluding VAT [DECIDE 1]. The price of the tier you reach applies to all your Active Assets in that period (it is not a staircase):

| Active Assets in the period | Price per Active Asset per month |
|---|---|
| 1 to 250 | EUR 0.75 |
| 251 to 1,000 | EUR 0.60 |
| 1,001 to 2,500 | EUR 0.50 |
| 2,501 and more | EUR 0.40 |

**Minimum fee.** The minimum fee is EUR 25 per month. If the amount calculated from Active Assets is lower, the invoice shows a top-up to EUR 25.

**Advanced add-on.** The Advanced add-on costs EUR 0.25 per Active Asset per month, in addition to the price above, for the Assets for which it is switched on.

**Pilot.** A pilot is free for 6 weeks for up to 100 Assets. The scope, number of Assets, success criteria and conversion price are set out in a one-page pilot agreement. During the pilot, the invoice lines are shown at EUR 0 and labelled "Pilot". A pilot does not convert into a paid subscription unless you confirm the conversion price in writing [DECIDE 3]. Section 9 (beta and trials) does not apply to the pilot where the pilot agreement says otherwise.

**No setup fee.** There is no setup fee.

**Price fixation.** The prices in this section are fixed for 12 months from the start of your paid subscription, or for 24 months if you agree an annual commitment in your order form [DECIDE 19]. During that period section 10 (changes) does not allow PODFY to change these prices. After that period PODFY may change the prices by giving you at least 60 days' written notice, and you may cancel with effect from the end of the month before the new prices apply [DECIDE 4].

**Invoicing.** PODFY invoices monthly in arrears, on the basis of the number of Active Assets in the period as shown in the Application. You can see the count in the Application at any time. Pre-paid credit and annual prepayment work as described in section 6. Invoices are payable within the term stated on the invoice. If you dispute an invoice, you must tell PODFY within 30 days of the invoice date, stating the reasons.

**Cancellation.** You may cancel monthly, in the portal or by e-mail to support@podfy.net, with effect from the end of the calendar month in which PODFY receives your notice [DECIDE 10]. A pilot ends on its end date without notice. [OWNER NOTE: billing per Active Asset is built in Phase 2, December 2026. No paid invoice is issued under this section before then.]

### 13. QR Reporting: fair use {#terms-qr-fair-use}

Unlimited Reports are included, subject to fair use. Fair use means that, averaged over your Active Assets, you receive about 10 Reports per Active Asset per month. PODFY measures this as the total number of Reports divided by the number of Active Assets, averaged over a rolling period of 3 months [DECIDE 5].

If you stay clearly above this level, PODFY will first contact you to understand why and to look for a solution, such as different settings, a different set-up or a different plan. If we cannot find a solution, PODFY may propose a surcharge. A surcharge applies only after you have agreed to it in writing, applies only to future periods, and you may instead choose to cancel or to reduce your Assets. PODFY will not block, delay or limit your Reports because of fair use.

Automatic abuse protection is separate from fair use. PODFY may reject or slow down submissions that look automated, repeated or abusive, for example many submissions from one device in a short time, to protect you and the Services. This does not depend on the number of Reports you receive on average.

### 14. QR Reporting: your responsibilities {#terms-qr-customer}

In addition to section 3 and section 6:

(a) **Stickers and Assets.** You are responsible for placing QR codes and stickers, for having the right to place them on the Asset and in the place where it stands, for keeping the Asset register correct (including retiring Assets that no longer exist), and for the text on your stickers. PODFY does not check where stickers are placed.

(b) **Lawful use.** You may use QR Reporting only for lawful purposes. You may not use Reports or Reporter contact details for marketing, profiling, or any purpose that you have not told Reporters about. You may not ask Reporters to provide special categories of personal data (for example health data) or other data you have no need for, and you may not configure extra fields to do so.

(c) **Informing people.** You are the controller of the personal data in Reports (see the Privacy Policy, section 9). You must inform your staff and anyone who may submit a Report, in a way that meets applicable law, that Reports may include photos, which may show people or number plates, and what you do with Reports. The Application shows a short notice on the form, and PODFY provides a model text (see the notice below). You are responsible for adding your own privacy information and link, and for choosing a lawful basis for your processing.

(d) **Settings.** You choose whether a photo is required, optional or switched off, the categories and fields, the languages, who receives Reports, and the retention period. If photos are not needed for your purpose, we recommend making them optional or switching them off.

(e) **Requests from people.** You deal with requests from Reporters and other data subjects about Reports (access, erasure and so on). PODFY helps you as described in the Data Processing Addendum.

(f) **Content.** You are responsible for how you use, share and act upon Reports. Section 8 (indemnity) applies to claims arising from Customer Data and from your use of Reports.

### 15. QR Reporting: service levels {#terms-qr-sla}

PODFY's service levels for QR Reporting are described in the Service Description, which forms part of these Terms for QR Reporting and is available at [URL, DECIDE 6]. In case of conflict between the Service Description and your order form, the order form prevails. The following applies.

**Availability target.** PODFY aims for a monthly availability of 99.5% for QR Reporting. Availability is measured per calendar month, as the share of the month in which the Reporting form can be opened and a Report accepted, and the customer portal can be opened, as defined in the Service Description. This target allows for about 3 hours and 36 minutes of unavailability in a 30-day month. PODFY publishes the result of each month [OWNER NOTE: public status page and monthly uptime report: Phase 1, target November 2026].

**Exclusions.** The following time does not count as unavailability: (a) planned maintenance announced at least 48 hours in advance; (b) outages or failures of third parties that PODFY does not control, including the internet, your own network and devices, and sub-processors listed in the Privacy Policy, as far as these are not caused by PODFY's failure to comply with its obligations; (c) events of force majeure; (d) suspension in accordance with these Terms; and (e) your own use, settings or integrations that cause the failure.

**Support.** PODFY replies to support requests within one business day. With the Advanced add-on, PODFY responds to critical incidents within 4 business hours. A "business day" and "business hours" are defined in the Service Description [DECIDE 6]. A "critical incident" is a failure that stops all or most Reporters from submitting Reports or you from reading them.

**Incident communication.** PODFY informs customers proactively about incidents that affect availability, through the status page and, where a personal data breach is concerned, in accordance with the Data Processing Addendum and the Privacy Policy.

**Service credits [DECIDE 7, LAWYER].** If the availability in a calendar month is below 99.5%, you may request a service credit of 10% of the monthly fee for that month (the fee excluding VAT for that month, including the minimum fee top-up). You must request the credit in writing within 30 days after the end of that month. PODFY applies the credit to your next invoice; it has no cash value and is not paid out. A service credit is your sole and exclusive remedy for failing to meet the availability target. It does not limit your rights under section 10 to stop using the Services, and credits count towards the limit of liability in section 7.

**Beta features.** Section 9 applies to features marked as beta; the availability target does not apply to them.

### 16. QR Reporting: exit, QR redirect & data export {#terms-qr-exit}

**Your data stays yours.** You may export your Reports, photos and QR destinations at any time during the subscription. Reports can be exported as CSV in the Application. A full export with photos and documents (ZIP) is available from January 2027; before then PODFY provides the photo export on request within 10 business days. [OWNER NOTE: ZIP export: Phase 2, December 2026 per the capability matrix. Dated here as January 2027 for margin; adjust to the real date.]

**Handover period.** If the agreement ends, for any reason, PODFY keeps your Customer Data available for export for 30 days after the end date (the "Handover Period") [DECIDE 8]. At the end of the Handover Period PODFY deletes your Customer Data from the live systems and, within 14 days after that, from backups (nightly backups are kept for 14 days). You may ask PODFY in writing to delete earlier. Invoice and billing records are kept for 7 years, as the Privacy Policy states. If you export Reports yourself, you are responsible for retaining them in line with your own legal duties.

**QR redirect.** Your QR codes point to web addresses of the form `https://podfy.app/{slug}/{ref}`, where {ref} is your own Asset number. For 12 months after the end date, PODFY redirects these addresses to a destination you choose (for example an address of your own, or of a new supplier), free of charge [DECIDE 9]. The following conditions apply:

(a) all invoices due have been paid;
(b) you tell PODFY the destination, in the Application or in writing, no later than the end date. You may change it during the 12 months. If you give no destination, PODFY shows a neutral page that says the service has ended and names you (the company), and does not offer a form;
(c) the destination must be lawful and must not be misleading, harmful or malicious. PODFY may refuse a destination or switch the redirect off if the destination is used for abuse or to harm people or PODFY, or if PODFY is ordered to do so by an authority;
(d) the redirect only forwards the visitor. After the end date PODFY does not accept, store or route Reports for you, does not offer service levels for the redirect, and may add a short interstitial page where required for security;
(e) PODFY will not give your slug to another customer during the 12 months.

After the 12 months the QR addresses stop working and may be reused.

[OWNER NOTE: the per-brand redirect setting is built in Phase 3, target February 2027. Until then PODFY performs the redirect manually per customer. Do not commit to a redirect for a customer whose end date is before February 2027 without checking that this can be done.]

**Termination for cause.** If PODFY ends the agreement because of your material breach (section 10), PODFY may withhold the redirect and the export until the breach is remedied or, in case of abuse, refuse them, unless the law requires otherwise.

### Edits to existing Terms text (for the owner)

1. Section 2, Definitions: add `"QR Reporting" has the meaning in section 11.` and extend "Customer Data" with `and, for QR Reporting, Reports and Reporter contact details you receive through the Services`.
2. Section 6, third paragraph: `If your use of podfy.app is subject to fees, pricing and payment terms are defined in your order form or commercial agreement.` Add: `For QR Reporting, section 12 applies unless your order form says otherwise.`
3. Section 7, second paragraph, first sentence: replace `are defined in your order form` with `are defined in your order form or, for QR Reporting, in section 15 and the Service Description`.
4. Section 10, first paragraph, second sentence (`We may update these Terms periodically; your continued use after changes become effective constitutes acceptance.`): add `This does not apply to the prices and fixed periods in section 12, which can only be changed as set out there.`
5. Update "Last updated" for the Terms (to the publication date).

---

## Part 3. Privacy Policy additions

### 3.1 Section 2, Our roles (add to the existing list)

Add to the processor bullet: `... and Reports received through QR Reporting (see section 9). For this data your organisation is the controller.`

Add a controller bullet: `Abuse protection data of people who submit a Report through QR Reporting (see section 9.4).`

### 3.2 Section 3, Personal data we process (add rows to the table)

| Category | Data |
|---|---|
| Reports (QR Reporting, Customer Data) | Category, optional note (free text), optional photo, optional extra fields set by the customer, report time, asset number and a copy of the register data at that time (name, location, group), optional e-mail address of the Reporter. Processed as a data processor. |
| Abuse protection (QR Reporting) | IP address and counters used to limit repeated or automated submissions, challenge tokens. Processed as a data controller. |

### 3.3 Section 4, Purposes, legal bases & legitimate interests (add rows)

| Purpose | Legal basis (GDPR Art. 6) |
|---|---|
| Receiving, routing and handling Reports for our customers | The customer's legal basis as controller (usually Art. 6(1)(f), legitimate interests in maintaining, repairing and securing its assets). PODFY processes on the customer's instructions. |
| Sending a Reporter updates about their Report ("Keep me informed") or a copy | The customer's legal basis as controller, normally Art. 6(1)(a), consent, which the Reporter gives by ticking the box and can withdraw. |
| Abuse protection for QR Reporting (limiting repeated or automated submissions) | Art. 6(1)(f), legitimate interests (protecting the service, our customers and Reporters from abuse) |

### 3.4 Section 5, Retention periods (add rows)

| Data | Retention |
|---|---|
| Reports (QR Reporting) | As set by the customer for its brand [DECIDE 11], up to 7 years. After expiry files are scheduled for deletion. After the agreement ends: 30 days, see Terms section 16 [DECIDE 8]. |
| Reporter e-mail address (QR Reporting) | Stored encrypted. Deleted with the Report, and in any case 30 days after the Report is resolved [DECIDE 12]. |
| Abuse protection counters (QR Reporting) | 24 hours |
| Backups containing Reports | Nightly backups, 14 days |

Edge security logs remain as stated in this section (up to 30 days), and also contain IP addresses of people who open a QR page.

### 3.5 Section 8, Your rights under GDPR (add a paragraph)

`If you submitted a Report through a QR code, the organisation that placed the code is the controller of that Report. Please contact that organisation. See section 9.5.`

### 3.6 New section 9: QR Reporting: people who submit a report {#privacy-reporters}

This section is for people who scan a QR code to submit a Report ("Reporters") and for people who appear in a Report. It applies in addition to the rest of this Policy.

**9.1 Who is responsible.** The organisation that placed the QR code (the "customer"; its name is shown on the form) decides why and how your Report is used. It is the controller. PODFY processes the Report for the customer as its processor and does not use it for its own purposes. PODFY is the controller only for abuse protection data (9.4).

**9.2 What is collected.**

- Category you select, and any other fields the customer has configured.
- A note you write. Please do not put personal data in the note that is not needed.
- A photo, if you add one. Photos are optional [unless the customer requires one]. A photo may show people, number plates or other personal data. Please avoid showing people. [DECIDE 13: PODFY removes GPS location from photo metadata when the photo is uploaded. / Photo metadata may be kept.]
- An e-mail address, only if you tick "Keep me informed" or ask for a copy. It is stored encrypted and used only to send you updates about your Report. [OWNER NOTE: encrypted reporter contact and "Keep me informed": Phase 3, target January-February 2027; remove this bullet until then.]
- The asset number from the QR code, and a copy of the register data at that moment (asset name, location, group). The location comes from the customer's asset register. PODFY does not ask for or read the location of your phone when you submit a Report.
- Time of the Report.

**9.3 No account.** You do not need an app or an account. PODFY does not place advertising or analytics cookies on the form (see the Cookie Policy).

**9.4 Abuse protection (PODFY as controller).** To stop automated or repeated misuse, PODFY processes your IP address and counters of recent submissions. The counters are deleted after 24 hours. Cloudflare, our infrastructure provider, also keeps edge security logs with IP addresses for up to 30 days (see section 5). Legal basis: Art. 6(1)(f), legitimate interests. You may object under Art. 21; we will then check whether we can protect the service in another way. PODFY does not use this data for any other purpose and does not link it to your identity.

**9.5 Your rights and where to use them.** Because the customer is the controller, you should send requests for access, correction, erasure, restriction, objection and withdrawal of consent to that customer. Please include the asset number, the approximate time of the Report and what the Report was about, because Reports are submitted without an account and cannot otherwise be identified. If you send a request to PODFY at support@podfy.net with subject "Privacy request", we forward it to the customer, where we can identify it, and tell you that we did so. For abuse protection data (9.4) you can contact PODFY directly; because the counters are deleted after 24 hours, we may not be able to find your data. You may always lodge a complaint with the Autoriteit Persoonsgegevens or with your local supervisory authority.

**9.6 Withdrawing consent.** If you gave your e-mail address, you can withdraw consent at any time by using the link in the e-mail you receive, or by contacting the customer. Withdrawal does not affect earlier processing. [OWNER NOTE: unsubscribe link in reporter e-mails is part of the Phase 3 feature; confirm it exists before publishing this sentence.]

**9.7 Where it is stored, who else sees it.** Reports are stored in the EU (Cloudflare D1 and R2, EU jurisdiction). Reports are sent by e-mail to the people the customer has chosen, using Resend (see Sub-processors). The customer may forward Reports to its own systems with a webhook or API. PODFY does not sell Reports and does not use them for advertising.

**9.8 Security.** See section 7 and Security. Reporter e-mail addresses are stored encrypted [see OWNER NOTE in 9.2].

**9.9 Photos of people.** If a photo shows you, or your vehicle, and you want it removed, contact the customer (9.5). PODFY helps the customer to delete it.

### 3.7 DPA annex note for QR Reporting

Add as Annex (or schedule) to the PODFY Data Processing Addendum. The existing DPA text is not in this repository, so adapt to it.

**Annex: QR Reporting**

1. **Subject matter and duration.** Processing of Reports and Reporter contact details through QR Reporting, for the duration of the agreement plus the Handover Period of 30 days (Terms section 16).
2. **Nature and purpose.** Collecting, storing, routing by e-mail and webhook, displaying, exporting and deleting Reports on behalf of the customer, so the customer can handle issues with its assets. Plus the technical processing needed to deliver the Services.
3. **Categories of data subjects.** Reporters; people who appear in photos or are mentioned in notes; customer staff who receive or handle Reports.
4. **Types of personal data.** Note text; photos (may show people or number plates); values of extra fields set by the customer; optional e-mail address (stored encrypted); report time; asset reference and register copy. Special categories of data are not requested by the Services; the customer must not configure the Services to collect them [see Terms section 14(b)].
5. **Instructions.** Processing happens only on the customer's documented instructions, which are the agreement, the settings in the Application and the customer's lawful requests. PODFY does not use Reports for its own purposes. AI reading is not applied to Reports unless the customer switches it on [DECIDE 14].
6. **Sub-processors.** Cloudflare, Inc. (compute, database, storage, EU jurisdiction); Resend, Inc. (e-mail delivery). The list in the Privacy Policy and the 14-day notice apply.
7. **Location of storage.** EU (Cloudflare EU jurisdiction). Transfers via listed sub-processors on the basis stated in the Sub-processors table.
8. **Assistance.** PODFY helps with requests from data subjects (search by asset number and period, export, deletion), and with breach notification (without undue delay), data protection impact assessments on reasonable request.
9. **Retention and return.** Per customer settings; the customer exports and PODFY deletes within the Handover Period and, from backups, within a further 14 days.
10. **Technical and organisational measures.** As in the Security section and the TOMs annex (readiness B): encryption in transit and at rest, tenant separation, role-based access, abuse limits, audit log, daily backups in the EU, reporter e-mail stored encrypted [Phase 3].
11. **Controller's own duties.** The customer informs Reporters and staff, chooses the legal basis, sets retention, and answers data subject requests (Terms section 14).

---

## Part 4. Notice text for customers (sticker or form)

Provided by PODFY as a model text. The customer fills in the placeholders. Available in all 12 languages once the translations are approved; this is the EN master.

**Short version (for the sticker or near the QR code):**

> Scan to report a problem with this item. Your report goes to <customer>. Photos are optional; please avoid showing people. Privacy: <link>

**Form version (shown above the Send button):**

> Your report goes to <customer>, who decides how it is used. A photo is optional. Please avoid showing people or number plates, and do not add personal data that is not needed. We only keep your e-mail address if you ask us to keep you informed. Privacy information: <link>

**With "Keep me informed" (only once the feature is available):**

> [ ] Keep me informed about this report by e-mail. We use your e-mail address only for this report and delete it after it is resolved. You can withdraw at any time.

**Notice for staff (customer to adapt):**

> Reports sent through QR codes can include photos. Photos may show colleagues or visitors. Please do not take photos of people when you report, and tell your manager if you see a photo of yourself in a report.
