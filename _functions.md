# podfy-site — Functions Assessment
> Generated 2026-05-06 | podfy.net | Cloudflare Pages + D1 (podfy-public) | No auth (public marketing site)

---

## Overview

Marketing site: changelog/releases, contact form, pricing configurator, changelog RSS feed, and newsletter subscription. Uses a separate D1 database (`podfy-public`) with three tables: `Site_Releases`, `Site_Buyer`, `Site_Form`. Middleware injects shared header/footer partials. ~7 function files.

---

## Route Inventory

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/releases` | None | Paginated published releases (15 min cache) |
| POST | `/api/releases` | Hardcoded SHA256 hash | Create/publish a new release entry |
| POST | `/api/contact` | Turnstile + honeypot | Contact form → D1 + Resend notification/auto-reply |
| GET | `/api/pricing-factor` | None | Look up WTP multiplier by buyer segment keyword |
| POST | `/api/pricing-selection` | None (Turnstile disabled) | Email pricing config snapshot via Resend |
| POST | `/api/subscribe` | Turnstile + honeypot | Changelog subscription → D1 + Resend notification |
| GET | `/changelog.rss` | None | RSS 2.0 feed of last 20 published releases |
| * | `*` (non-API) | None | `_middleware.js` injects shared header/footer partials |

---

## Prioritised Issues

### P0 — Critical (fix before next code review / open-source)

**P0-1 · Admin auth token hardcoded in source** (`functions/api/releases.js`)
`POST /api/releases` authenticates against a hardcoded SHA256 hash (`sha256("Podfy2026!")`) stored directly in the source file. Anyone who reads the code — or sees it on GitHub — knows the password.
- Fix: Move the expected hash to an environment secret (`RELEASE_ADMIN_KEY`). Compare `sha256(incomingToken) === env.RELEASE_ADMIN_KEY` where `env.RELEASE_ADMIN_KEY` is the hash stored as a Cloudflare Pages secret.

---

### P1 — High

**P1-1 · No rate limiting on the admin releases endpoint** (`functions/api/releases.js`)
The auth check is brute-forceable with no throttle. Even with a correctly-managed secret, unlimited guesses are allowed.
- Fix: Add a per-IP request counter (Cloudflare WAF rate-limiting rule, or KV-based counter). 5 failed attempts per hour per IP should be sufficient.

**P1-2 · No input validation on `release_date`** (`functions/api/releases.js`)
`release_date` is inserted as-is without validating ISO 8601 format. Invalid or malformed dates end up in `Site_Releases` and break the RSS feed's `<pubDate>` generation.
- Fix: Validate with `/^\d{4}-\d{2}-\d{2}$/` and reject with 400 if the pattern doesn't match.

**P1-3 · Turnstile verification disabled on `/api/pricing-selection`** (`functions/api/pricing-selection.js`)
The Turnstile verification call is commented out. Any actor can POST to this endpoint and trigger unlimited Resend emails to arbitrary email addresses with no bot protection.
- Fix: Uncomment and re-enable the `verifyTurnstile()` call. This is a one-line change.

---

### P2 — Medium

**P2-1 · No rate limiting on `/api/contact`**
Turnstile provides light protection but valid Turnstile tokens are reusable within their validity window. No per-IP throttle exists.
- Fix: Add a Cloudflare WAF rate-limiting rule: max 5 requests per hour per IP to `/api/contact`.

**P2-2 · No deduplication on `/api/contact` and `/api/subscribe`**
The same email can submit contact requests or subscribe to the newsletter multiple times in rapid succession, filling `Site_Form` with duplicates and spamming the support inbox.
- Fix: Query `Site_Form` for an existing row with the same email in the last 24 hours before inserting. Return a soft success if found (`ok: true, skipped: true`).

**P2-3 · Weak email validation on `/api/subscribe`**
Only checks that the string contains `@`. Addresses like `a@` or `@example.com` are accepted and stored.
- Fix: Apply `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` validation; return 400 on failure.

**P2-4 · No rate limiting on `/api/pricing-selection` and `/api/pricing-factor`**
`pricing-selection` can generate unlimited Resend emails to any address per IP. `pricing-factor` allows enumeration of all `Site_Buyer` keywords (buyer segment codes, WTP percentages) with no throttle.
- Fix: 5 requests/hour per IP on `pricing-selection`; 60 requests/hour per IP on `pricing-factor`.

**P2-5 · `/api/subscribe` has no consent validation — GDPR gap** (`functions/api/subscribe.js`)
The contact endpoint validates a `consent` boolean before inserting and emailing. The subscribe endpoint does not — any POST without an explicit consent flag is stored and triggers a notification email. This is inconsistent and potentially non-compliant.
- Fix: Require `consent === true` in the subscribe body; return 400 if absent.

**P2-6 · No email format validation on `/api/pricing-selection`**
`email` is passed to Resend without regex validation. Bounces are not handled and Resend errors are swallowed.
- Fix: Same regex as P2-3.

---

### P3 — Low / Nice-to-have

| ID | Issue |
|----|-------|
| P3-1 | `POST /api/releases` — no audit trail: no record of who created each release (no IP, no timestamp beyond `release_date`) |
| P3-2 | `POST /api/contact` — honeypot field value is stored in `Site_Form` even when the honeypot is triggered; harmless but noisy |
| P3-3 | `POST /api/subscribe` + `pricing-selection` — `name` field has no length cap; very long strings stored and rendered in emails |
| P3-4 | `GET /api/pricing-factor` — silent failure if D1 binding is missing; returns `{ factor: 1, found: false }` with no log |
| P3-5 | Middleware fetches two additional assets per HTML page (header.html + footer.html); could be prewarmed at the edge |

---

## What's Good

- `GET /api/releases`, `GET /changelog.rss`: No user input, correctly paginated, safe parameterised SQL, proper XML escaping.
- `POST /api/contact`: Full Turnstile server-side verification (including IP), honeypot, `escapeHtml` on all user fields in email templates, graceful degradation if D1 or Resend is unavailable.
- `POST /api/subscribe`: Same Turnstile + honeypot pattern, silently passes on honeypot triggers.
- All SQL across the site is parameterised — no injection risk.
- RSS feed uses CDATA sections and proper RFC date formatting.
- Middleware has no user input and produces no injection risk.

---

## Recommended Action Order

1. Move releases admin token to env secret (P0-1)
2. Enable Turnstile on pricing-selection (P1-3)
3. Add rate limiting to releases admin endpoint (P1-1)
4. Validate `release_date` format (P1-2)
5. Add per-IP rate limiting to contact, subscribe, pricing-selection, pricing-factor (P2-1, P2-4)
6. Add email deduplication to contact and subscribe (P2-2)
7. Add email format validation to subscribe and pricing-selection (P2-3, P2-5)
