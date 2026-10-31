# Support Process

Internal process. Version: draft 1, 2026-10-31. Owner: the owner of Lake-Project (PODFY). Customer-facing commitments are in service-description.md; this document says how they are kept.

Labels: **Live** operating today; **Planned (date)** not built; **[OWNER]** fact only the owner can supply; **[DECIDE]** policy choice with a recommendation.

## 1. Intake channels

| Channel | Address | Status | Notes |
|---|---|---|---|
| E-mail | support@podfy.net | Live (inbox). Automatic acknowledgement not yet in place. | Main channel for customers, drivers and reporters. The same address is the Reply-To of PODFY notification e-mails, so drivers and recipients often write here. |
| Contact form | podfy.net/contact | Live | Protected by Turnstile; forwards to e-mail. |
| Privacy requests | support@podfy.net, subject "Privacy request" or "DPA request" | Live | Route to section 7. |
| Security reports | security@podfy.net | Live | Not handled as support. Follow the Responsible Disclosure commitments (acknowledge within 3 business days, triage within 7). |
| Phone for critical incidents | [OWNER: number] | Not in place | Needed for the 4-business-hour promise with Advanced (Phase 0 readiness item F). Recommendation: a mobile number forwarded to the owner, then to the backup person, given only to Advanced customers. |
| Status page | podfy.net/status | Planned, Phase 1 (by 27 November 2026) | Read-only communication. |

## 2. Hours and targets

[DECIDE] Support hours: business days 09:00 to 17:00 CET/CEST, excluding Dutch public holidays.

| Severity | First response target |
|---|---|
| Critical | Within 4 business hours with the Advanced plan; otherwise within 1 business day |
| High | Within 1 business day |
| Normal | Within 1 business day |
| Low | Within 1 business day |

First response means a human reply that shows the request is understood and states the next step. The one business day promise also applies to the auto-acknowledged mail: the auto-reply is not the first response.

Business hours counting: a request arriving after 17:00 or on a non-business day starts counting at 09:00 on the next business day. For a critical request arriving at 15:00, the response is due by 10:00 the next business day (2 hours that day, 2 hours the next).

## 3. Triage

Within the first business hour of each business day (and after every alert) the owner or backup:

1. Reads all new mail in support@podfy.net.
2. Assigns a severity using the definitions in service-description.md section 3.4. A subject beginning with "CRITICAL" or a phone call from an Advanced customer is treated as critical until checked.
3. Checks the customer's plan (Advanced: critical clock of 4 business hours).
4. Checks for a live incident: if the report matches an open incident, link it and use the incident communication (incident-and-breach-procedure.md).
5. Labels the thread (severity, customer, product) and replies, or sets the next step and a date.
6. A suspected personal data breach or security issue is always treated as critical and handled with the incident procedure.

Tools to look up context (admin application): brand, plan, users, recent uploads, notification logs, audit log. Never ask a customer to send passwords or documents containing sensitive data by e-mail; use the portal.

## 4. Handling and closing

- Reply in the language of the customer where possible (the site is available in 12 languages; support replies in Dutch, English, and, with care, German and French [OWNER: confirm languages offered]).
- State what was checked, what was found, and what happens next. Give a date for the next update when the issue is not resolved.
- Close with the customer's confirmation or after 5 business days without reply (one reminder before closing).
- Record recurring issues and feed them into the roadmap and the changelog.
- Keep a simple log of all critical and high requests (date, customer, severity, first response time, resolution). Use it for the monthly service review and for service credit claims. [DECIDE: recommend a spreadsheet or mail labels; a ticket tool is not needed at this volume.]

## 5. Escalation

| Trigger | Action |
|---|---|
| Critical request not acknowledged within 2 business hours | Backup person is alerted by phone. |
| Owner unavailable (holiday, illness) | Backup person covers support from the shared mailbox. Announce the cover period to Advanced customers. [OWNER: backup person named, with access to support@podfy.net, the admin application, and the Cloudflare account.] |
| Technical cause unknown after 2 hours (critical) | Open an incident, send an initial notice (template 7.1 in the incident procedure), involve external help if available. |
| Provider outage | Incident with provider reference; link to the provider status page. |
| Complaint or dispute | Owner handles personally; reply within 1 business day with a proposed route and date. |

## 6. Reporting

Monthly: number of requests per severity, first response times against targets, incidents, uptime figure (from Phase 1, the monthly figure on the status page), service credit requests. Share with Advanced customers on request. [DECIDE]

## 7. Privacy and data subject requests

1. Log the request with the date received. The statutory period for the controller is one month, so forward customer data requests to the customer within 2 business days.
2. If the sender is a data subject of a customer's data, do not answer on the merits; tell the sender that the customer is the controller and forward the request to the customer's privacy contact.
3. If the data is PODFY's own controller data (website, account, billing), answer within one month after identifying the requester.
4. For the customer's instruction to erase or export, use the admin tools; confirm in writing when done. Details in the TOMs annex section 10.

## 8. Auto-acknowledgement for support@podfy.net

### 8.1 Auto-reply texts

Rules for the texts: short, no dashes, state that this is an automatic message, reference the response targets, explain how to mark a critical incident. Send only one auto-reply per sender per day, and never reply to automated mail (see 8.2). Replace the bracketed items. Time zone: Amsterdam.

**English**

> Subject: We have received your message (PODFY support)
>
> Hello,
>
> This is an automatic confirmation. Your message to PODFY support has been received. A person will reply within one business day (Monday to Friday, 09:00 to 17:00 Amsterdam time, excluding Dutch public holidays).
>
> If this is a critical incident, for example uploads or sign-in do not work for everyone, please send a new message with CRITICAL at the start of the subject line. Customers with the Advanced plan receive a first response within 4 business hours[, and can also call [phone number]].
>
> For security issues, please write to security@podfy.net. For privacy requests, use the subject "Privacy request".
>
> Please do not send passwords or sensitive documents by e-mail.
>
> Kind regards,
> PODFY support

**Nederlands**

> Onderwerp: We hebben uw bericht ontvangen (PODFY support)
>
> Beste,
>
> Dit is een automatische bevestiging. Uw bericht aan PODFY support is ontvangen. Een medewerker reageert binnen één werkdag (maandag tot en met vrijdag, 09:00 tot 17:00 uur Nederlandse tijd, behalve op Nederlandse feestdagen).
>
> Gaat het om een kritieke storing, bijvoorbeeld uploaden of inloggen werkt niet voor iedereen? Stuur dan een nieuw bericht met KRITIEK aan het begin van de onderwerpregel. Klanten met het Advanced-abonnement krijgen binnen 4 werkuren een eerste reactie[, en kunnen ook bellen naar [telefoonnummer]].
>
> Voor beveiligingsmeldingen kunt u schrijven aan security@podfy.net. Voor privacyverzoeken gebruikt u als onderwerp "Privacyverzoek".
>
> Stuur geen wachtwoorden of gevoelige documenten per e-mail.
>
> Met vriendelijke groet,
> PODFY support

**Deutsch**

> Betreff: Wir haben Ihre Nachricht erhalten (PODFY Support)
>
> Guten Tag,
>
> Dies ist eine automatische Bestätigung. Ihre Nachricht an den PODFY Support ist bei uns eingegangen. Eine Person antwortet Ihnen innerhalb von einem Werktag (Montag bis Freitag, 09:00 bis 17:00 Uhr niederländische Zeit, außer an niederländischen Feiertagen).
>
> Handelt es sich um eine kritische Störung, zum Beispiel funktionieren Upload oder Anmeldung für niemanden, senden Sie bitte eine neue Nachricht mit KRITISCH am Anfang der Betreffzeile. Kunden mit dem Advanced-Tarif erhalten innerhalb von 4 Arbeitsstunden eine erste Antwort[, und können auch anrufen: [Telefonnummer]].
>
> Sicherheitsmeldungen senden Sie bitte an security@podfy.net. Für Datenschutzanfragen verwenden Sie bitte den Betreff "Datenschutzanfrage".
>
> Bitte senden Sie keine Passwörter oder sensiblen Dokumente per E-Mail.
>
> Freundliche Grüße
> PODFY Support

**Français**

> Objet : Nous avons bien reçu votre message (support PODFY)
>
> Bonjour,
>
> Ceci est une confirmation automatique. Votre message au support PODFY a bien été reçu. Une personne vous répondra dans un délai d'un jour ouvré (du lundi au vendredi, de 09:00 à 17:00, heure des Pays-Bas, hors jours fériés néerlandais).
>
> S'il s'agit d'un incident critique, par exemple si l'envoi de documents ou la connexion ne fonctionne pour personne, envoyez un nouveau message avec CRITIQUE au début de l'objet. Les clients ayant l'offre Advanced reçoivent une première réponse dans un délai de 4 heures ouvrées[, et peuvent aussi appeler le [numéro de téléphone]].
>
> Pour les problèmes de sécurité, écrivez à security@podfy.net. Pour les demandes relatives aux données personnelles, utilisez l'objet « Demande de confidentialité ».
>
> N'envoyez pas de mots de passe ni de documents sensibles par e-mail.
>
> Cordialement,
> Support PODFY

Notes: the bracketed phone sentence is removed until a phone line exists [OWNER]. The Advanced sentence is accurate only when the 4-business-hour response is in place; remove it for any sender not on Advanced if the auto-reply can be targeted, otherwise keep it as written since it describes the plan, not the sender. Dutch and French texts should be checked by a native speaker before use. A reference number line ("Reference: PS-2026-0001") can be added only with the Worker option below.

### 8.2 How to set it up (the owner chooses)

Do not assume how support@podfy.net is routed today. Check first where the address delivers (a mailbox, a forwarding rule in Cloudflare Email Routing, or a catch-all) and whether the zone has a catch-all rule that drops mail. [OWNER: confirm the current routing.]

| Option | How | Pros | Cons |
|---|---|---|---|
| A. Gmail or Google Workspace vacation responder or canned response with filter | If support@podfy.net delivers to a Google mailbox: turn on an auto-reply for that mailbox (Settings, vacation responder, set for all days, restricted to once per sender per 4 days), or create a filter for mail to support@podfy.net that sends a canned response. | No code. Live in minutes. Replies come from the same address. | One language per canned response; the filter cannot choose by sender language. The vacation responder skips some senders and mailing lists. No reference number. |
| B. Cloudflare Email Routing to an Email Worker | Route support@podfy.net to a Worker that (1) forwards the mail to the support mailbox, (2) checks that the sender is not automated (`Auto-Submitted`, `Precedence: bulk`, `List-Id`, or `no-reply` sender), (3) rate-limits per sender (for example once per 24 hours, state in KV or D1), (4) sends the auto-reply through Resend in the language detected from the sender's customer record or the message, with a reference number. | Language per customer, reference numbers, rate limit, log of acknowledgements, can mark critical by subject keyword. | Needs a small build and test (about a day). A fault can lose or loop mail; forwarding must happen first and errors must fail open. Adds a processing step for support mail (Cloudflare and Resend are already sub-processors). |
| C. Helpdesk tool | A hosted helpdesk with e-mail intake and automatic replies. | Tickets, reference numbers, SLA timers, templates. | Cost; a new sub-processor to add to the DPA list; more tooling than the volume needs. |

Recommendation [DECIDE]: option A now, to have an acknowledgement before the first pilot (from 1 December 2026), with the English text; move to option B when the number of customers makes language and reference numbers worth a day of work. Choose C only if support volume grows beyond what the owner can handle in a shared mailbox.

Safeguards for every option:

- Never auto-reply to automated mail, bounces, newsletters, or to the PODFY notification addresses; reply once per sender per day at most. This prevents loops.
- The sender domain of the auto-reply must pass SPF, DKIM and DMARC. Keep DMARC alignment relaxed when a provider sends from a subdomain, as for Resend.
- Do not point a reporting address at a mailbox that has no routing rule if the zone has a catch-all drop.
- Test with a mail from an external account, from a no-reply sender (no answer expected), and with a critical subject.
- Record the date the auto-reply went live and the text version.

## 9. Open points for the owner

| # | Item | Type |
|---|---|---|
| 1 | Support hours 09:00 to 17:00 CET/CEST, business days, Dutch holidays | [DECIDE] recommend yes |
| 2 | Phone line for critical incidents; who may use it | [OWNER] |
| 3 | Backup person, with access | [OWNER] |
| 4 | Current routing of support@podfy.net; choice of auto-reply option (A recommended now) | [OWNER] and [DECIDE] |
| 5 | Languages in which support replies | [OWNER] |
| 6 | Native check of the Dutch and French auto-replies | [OWNER] |
| 7 | Monthly service report to Advanced customers | [DECIDE] |
