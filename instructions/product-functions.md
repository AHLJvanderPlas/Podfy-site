# PODFY — Product Function Inventory

Derived from changelog v0.1.0 – v0.8.4 (2024-12-20 → 2026-05-01) and direct codebase reading.
Use this file to match implemented functions against the live product during a future audit.

**Products covered**

| ID | Product | Domain | Repo |
|----|---------|--------|------|
| APP | Core upload app | podfy.app | Podfy-app |
| PORTAL | Customer portal | portal.podfy.net | podfy-portal |
| ADMIN | Admin panel | admin.podfy.net | podfy-admin |
| DELIVERY | Delivery portal | delivery.podfy.net | Podfy-delivery |
| SITE | Marketing site | podfy.net | Podfy-site |
| CORE | Shared infrastructure | (all) | — |

---

## APP — Core Upload App (podfy.app)

### Driver upload flow
- [ ] Driver opens single-use URL, no account or app required
- [ ] Upload form pre-fillable with reference number via `?ref=` query param
- [ ] WhatsApp-friendly short URL shareable from admin slug page
- [ ] Upload link enforces 24 h server-side expiry; expired link shows readable error
- [ ] Distinct error screen for expired link vs unknown slug
- [ ] Honeypot field blocks bot submissions

### File capture
- [ ] JPEG photo upload (primary CMR capture method)
- [ ] PDF upload accepted alongside JPEG
- [ ] Multiple files per upload (up to 5 images per transaction)
- [ ] File size validated against MAX_ATTACH_MB env var (default 8 MB total)
- [ ] Large-file direct-to-R2 upload via presigned URL (bypasses Worker payload)
- [ ] Multipart upload for files over 100 MB

### GPS
- [ ] GPS coordinate captured from browser Geolocation API at upload time
- [ ] Fallback to IP geolocation when browser GPS returns null (iOS Safari)
- [ ] Horizontal accuracy validated; uploads over 500 m flagged `GPS_LOW_ACCURACY`
- [ ] GPS accuracy threshold configurable per slug (can be disabled for indoor sites)

### Processing pipeline
- [ ] Two-stage ingest: fast 200 return on receipt, async background task for processing
- [ ] Background task: PDF generation + email notification
- [ ] Upload ID returned immediately; `/status` endpoint for completion polling
- [ ] Process status lifecycle: `received` → `delivered` | `issue_reported` | `error_*`
- [ ] R2 storage key includes slug + timestamp for collision-free naming
- [ ] Transaction record written only after R2 upload completes (atomicity)
- [ ] Deployment reference logged with each transaction for audit trail

### Delivery issue reporting
- [ ] Driver can report issue on upload: delivered, damage (DM), refused (RF), not home (NH), partial (PD)
- [ ] Issue code stored in `transactions.delivery_issue_code`
- [ ] Issue note (free text) stored in `transactions.delivery_issue_notes`
- [ ] Issue photo attachment: up to 2 additional photos stored in R2 alongside main file
- [ ] Re-upload flow: driver can resubmit a rejected upload (`error_*`) without a new link
- [ ] Re-upload validated against original reference number; original archived to `_v1` key

### Duplicate detection
- [ ] Same reference uploaded twice within 1 hour flagged `DUPLICATE`
- [ ] Fallback detection by driver hash + timestamp proximity when reference is empty
- [ ] Duplicate detection scope configurable: per slug or cross-slug

### Branding & localisation
- [ ] Upload page applies per-slug branding: header colour, button colour, logo, tab title
- [ ] Slug name shown in browser title; PODFY logo replaced by custom logo when available
- [ ] Dark mode respects slug accent colour; inversion suppressed for custom logos
- [ ] Maintenance message shown when slug is paused
- [ ] Multi-language upload form: EN and NL
- [ ] Language auto-detected from `Accept-Language` header
- [ ] Manual EN/NL toggle on upload page footer

### Security
- [ ] Rate limiting: 30 uploads per IP per minute via Durable Object counter
- [ ] Rate limit response includes `Retry-After` header
- [ ] IP allowlist per slug bypasses rate limit (known office ranges)
- [ ] CSRF/bot protection via honeypot field on upload form

---

## PORTAL — Customer Portal (portal.podfy.net)

### Authentication
- [ ] Magic link login: email entered, one-tap link sent, no password
- [ ] Email normalised to lowercase before token lookup
- [ ] Magic link tokens stored in `portal_login_tokens`, pruned on login
- [ ] Session cookie: `SameSite=Lax`, `Secure`, 7-day TTL with sliding renewal
- [ ] Active session list: device, IP, last seen; individual session revocation
- [ ] User invite flow: admin sends one-time invite link, valid for 48 h
- [ ] Invite status shown in user management: pending / accepted / expired

### Record browsing
- [ ] Portal home: 60-day Free View of upload history for active slug
- [ ] Transaction table: reference, date, GPS link, status, file count
- [ ] Live search on reference (debounced)
- [ ] Date range filter (from/to)
- [ ] Status filter: all / delivered / issue reported / pending
- [ ] Issue code filter with human-readable labels (DM / RF / NH / PD)
- [ ] DUPLICATE badge on flagged records
- [ ] GPS_LOW_ACCURACY flag visible on record
- [ ] Total record count in portal header

### Record detail & download
- [ ] PDF download: click record to open or download file via presigned R2 URL (15 min expiry)
- [ ] Issue photos shown in record detail view
- [ ] Download button disabled for records in error state

### Portal Pro (AD and PR subscription tiers)
- [ ] Full-text search across reference, driver identity, and notes fields
- [ ] Advanced filter panel: multi-select status, issue code, GPS accuracy, date range
- [ ] Saved filter presets persisted in session per slug
- [ ] Bulk PDF download: up to 50 records as server-side streamed ZIP
- [ ] Record tagging: custom tags on individual transactions, searchable and filterable
- [ ] REST API with bearer token authentication (generated in settings)
- [ ] API endpoints: `GET /api/transactions`, `GET /api/transactions/:id`, `GET /api/slugs/:slug/stats`
- [ ] API rate limit: 60 requests per minute per token

### Exports
- [ ] CSV export with custom date range and column selection (runs in background)
- [ ] Download link emailed when export is ready
- [ ] Export history visible in settings
- [ ] Export columns restricted to allowed set per subscription tier
- [ ] Issue export: includes issue_code, issue_notes, resolution_note

### Issue management
- [ ] Issue resolution: portal admin can mark issue as resolved with a note
- [ ] Resolution stored as audit log entry linked to transaction
- [ ] Resolved issues excluded from open issue count on dashboard

### Notifications & integrations
- [ ] Per-user notification preferences: immediate or daily digest
- [ ] Unsubscribe link in all notification emails
- [ ] Outbound webhook: HTTP POST to configured URL on delivery or issue event
- [ ] Webhook payload: full transaction record as JSON
- [ ] Webhook secret: HMAC-SHA256 header for receiver verification
- [ ] Webhook delivery retry: up to 3 attempts with secret persisted across retries
- [ ] Email forwarding rule: auto-forward records matching reference prefix or regex
- [ ] Forwarded email uses branded template; duplicate-flagged records skipped

### Reporting
- [ ] SLA report: time from upload to issue resolution per slug per week
- [ ] SLA breach alert when average resolution time exceeds configured threshold
- [ ] SLA metrics included in monthly report email

### Security & session
- [ ] User roles: admin (full access) and user (view only)
- [ ] Role enforced server-side on all endpoints including bulk export
- [ ] IP binding opt-in: session tied to originating IP (configurable as /24 subnet)
- [ ] User-Agent fingerprint check: soft re-auth prompt on device mismatch
- [ ] Security settings panel: IP binding toggle and active session list with device info

### Multi-slug
- [ ] Users linked to multiple slugs can switch via header dropdown
- [ ] Active slug persisted in session across page loads
- [ ] Saved filter presets scoped per slug key in session storage
- [ ] Slug name and logo shown in portal header

### Subscription
- [ ] Usage counter visible on dashboard
- [ ] Volume limit warning indicator when approaching tier cap
- [ ] Subscription upgrade request flow: triggers support notification with current stats

---

## ADMIN — Admin Panel (admin.podfy.net)

### Authentication
- [ ] JWT-cookie authentication for PODFY staff
- [ ] HS256 signed with `JWT_SECRET`, 2-hour session
- [ ] Unauthorised requests return HTTP 401 with login redirect

### Dashboard
- [ ] Total slugs, total uploads, open issues, and error counts at a glance
- [ ] Upload monitoring: live table of recent transactions across all slugs
- [ ] Filterable by date, slug, status, and process_status
- [ ] Transaction detail modal: GPS map link, file checksum, meta JSON viewer
- [ ] Worker CPU time profiling view
- [ ] Slow query log: D1 queries over 10 ms logged with query hash
- [ ] CPU budget alert when p95 CPU time exceeds 30 ms

### Slug management
- [ ] Create, view, and update slug_details rows
- [ ] Feature flag toggles: GPS, copy, clean, ref, mail_notification, multi_file, pdf_header, pdf_footer
- [ ] Feature flag dependency enforcement server-side (multi_file requires mail_notification)
- [ ] Colour picker for primary, accent, and text colours per slug
- [ ] Logo upload for per-slug branding
- [ ] Branding preview before saving
- [ ] Slug status toggle: active / paused
- [ ] Subscription code assignment (TR / BA / AD / PR / PM / EN / UN)
- [ ] Slug analytics: upload volume chart, delivery rate, issue rate per week; exportable as JSON
- [ ] Subscription upgrade request trigger from portal

### User management
- [ ] Add, remove, and update users in slug_users
- [ ] Bulk user invite by CSV (email and role columns)
- [ ] User status toggle: active / paused
- [ ] User list scoped to selected slug only

### Email configuration
- [ ] Recipient configuration per slug: TO, CC, BCC for delivery notifications
- [ ] Recipients stored as JSON in slug_settings.email_recipients
- [ ] BCC recipients configurable separately; deduplicated before send
- [ ] Custom from-name per slug (RFC 5322 encoded)
- [ ] Reply-To set to slug-level contact email when configured
- [ ] Test email preview: send test notification to admin address
- [ ] Issue-specific recipient list configurable separately from delivery recipients

### GPS view
- [ ] Map showing last 50 upload coordinates per slug (OpenStreetMap, no third-party JS)
- [ ] Coordinate cluster detection flags repeated GPS positions as potential spoofing

### Reporting & alerts
- [ ] Monthly volume report auto-generated per slug (emailed 1st of month, 06:00 UTC)
- [ ] Report CSV attached to monthly email
- [ ] Volume limit enforcement: TR tier capped at 50 uploads/month
- [ ] Volume warning email at 80% usage (debounced, sent once per threshold crossing)
- [ ] Issue statistics dashboard: breakdown by code, slug, and date range; bar chart per week; CSV export
- [ ] Recurring issue alert: 3+ issues from same driver within 7 days; threshold configurable per slug
- [ ] SLA breach alert configurable threshold per slug

### Bulk export
- [ ] Download all transactions for a slug as CSV with configurable date range
- [ ] Export streamed for large datasets (D1 cursor-based pagination)
- [ ] Export columns: reference, date, GPS, status, process_status, file checksum

### Audit log
- [ ] All admin panel actions logged: actor email, action type, target slug, timestamp
- [ ] Audit events: slug create/update, user add/remove/role-change, export download, flag change, status change
- [ ] Audit log searchable and paginated in admin UI

---

## DELIVERY — Delivery Portal (delivery.podfy.net)

### Authentication
- [ ] Magic link login: driver enters email, receives one-tap link
- [ ] Magic link token isolated from portal tokens by token type field
- [ ] Session TTL: 7 days (configurable via SESSION_TTL_DAYS)

### Upload history
- [ ] Driver views own upload history scoped to copy_email_hash
- [ ] History shows 60 days for free tier, 90 days for subscribed slugs (MAX_HISTORY_DAYS_FREE)
- [ ] Record columns: reference, date, status, GPS thumbnail link, file size
- [ ] Status page: current system health indicator and last maintenance window

### Re-upload
- [ ] Driver can resubmit a rejected upload (error_* status) without a new upload link
- [ ] Re-upload validated against original reference number
- [ ] Original R2 object archived to `_v1` key; new file stored at original key
- [ ] Admin notified with both original and replacement file details

### Mobile UX
- [ ] Bottom navigation bar with touch-optimised tap targets
- [ ] Pull-to-refresh on history list
- [ ] Offline indicator when device has no network connection

---

## SITE — Marketing Site (podfy.net)

### Public pages
- [ ] Homepage with hero, proof strip (3 artifacts), how-it-works, trust belt, stat band, quote, CTA
- [ ] Solutions hub and 8 audience pages: carriers, 3PL, shippers, retail, construction, inbound, facilities, paper-to-digital
- [ ] Guides hub and 8 guide pages: POD definition, digital vs paper, compliance, disputes, photo POD, missing POD, invoicing, without app
- [ ] Pricing page with feature comparison table, add-ons, and worked examples
- [ ] Demo page
- [ ] Contact form with Cloudflare Turnstile bot protection
- [ ] Trust & legal page (single source of truth for all legal content, anchor navigation)
- [ ] 404 page

### Changelog
- [ ] Public changelog page at `/changelog` with paginated release history (20 per page)
- [ ] Search by version, feature, or tag
- [ ] RSS feed at `/changelog.rss`
- [ ] Changelog subscription: one email per release via `/api/subscribe`

### API endpoints (public)
- [ ] `GET /api/releases` — paginated release notes (is_published=1 only)

### API endpoints (admin-gated, same domain)
- [ ] `POST /api/releases` — create changelog entry (auth: SHA-256 hash in request body)
- [ ] `POST /api/subscribe` — subscribe email to changelog notifications (Turnstile-verified)
- [ ] `POST /api/contact` — contact form submission (Turnstile-verified, writes to Site_Form)

### Internal tools (`/instructions`, password-locked)
- [ ] Changelog entry form: create new Site_Releases entry via POST /api/releases
- [ ] Companies viewer: fetches themes.json from podfy.app, renders slug branding with colour cells

### Infrastructure
- [ ] Single stylesheet: `/assets/styles.site.css` (all design tokens and components)
- [ ] Light / dark / system theme toggle with FOUC prevention
- [ ] Partials: header and footer injected at build time via [[PODFY_HEADER]] / [[PODFY_FOOTER]] tokens
- [ ] `_redirects` file: all legacy URLs and standalone legal paths redirect to canonical pages
- [ ] Transactional email template: `assets/response.html` (inline CSS, warm cream palette)
- [ ] `/.well-known/security.txt`

---

## CORE — Shared Infrastructure

### Databases
- [ ] `podfy-main` (D1) — production, bound as DB in app / admin / portal / delivery
- [ ] `podfy-themes-staging` (D1) — staging, identical schema, no production data
- [ ] `podfy-public` (D1) — site only; tables: Site_Releases, Site_Buyer, Site_Form

### R2 storage
- [ ] `podfy-uploads` (PODFY_BUCKET) — POD files; path: `{slug}/{date}_{time}_{id}_{slug}_{ref}.{ext}`
- [ ] `podfy-logos` (PODFY_LOGOS) — brand logos; path: `logos/{slug}.png`

### Data model (key tables)
- [ ] `slug_details` — one row per client brand; colours, feature flags, subscription type
- [ ] `slug_settings` — per-slug config; email_recipients JSON, branding JSON
- [ ] `slug_users` — portal user memberships with role and status
- [ ] `transactions` — core upload records; full lifecycle from received to delivered/issue/error
- [ ] `portal_login_tokens` — magic link tokens for portal and delivery auth
- [ ] `portal_sessions` — active sessions
- [ ] `audit_log` — admin actions log

### Email (Resend)
- [ ] Retry on 429 or 5xx: up to 3 attempts, delays 2 s / 10 s / 30 s with jitter
- [ ] Send failure written to audit log with HTTP status code
- [ ] Email templates: delivered notification, issue notification, monthly report, invite, upgrade confirmation, re-upload notification

### Performance
- [ ] D1 composite index on (slug, upload_date DESC) for transaction queries
- [ ] D1 prepared statement pool for all hot paths
- [ ] Pagination on all list endpoints (page + pageSize, max 100)
- [ ] Worker CPU time target: p95 < 30 ms on upload path
- [ ] Cache-Control: max-age=31536000 immutable on all static assets

### Slug system
- [ ] Slug = unique brand identifier (e.g. `acme`, `dhl-be`)
- [ ] Upload URL pattern: `podfy.app/{slug}`
- [ ] All R2 objects namespaced under `{slug}/`
- [ ] Subscription codes: TR (trial) / BA (basic) / AD (advanced) / PR (pro) / PM (premium) / EN (enterprise) / UN (unknown)

### Transaction lifecycle
- [ ] Status field: `received` → `delivered` | `issue_reported` | `error_*`
- [ ] `month_key` virtual column (auto: YYYY-MM) used for volume counting and billing
- [ ] `copy_email_hash` — hashed driver identity for privacy-safe deduplication and recurring issue detection
- [ ] `presented_loc_url` + `presented_label` — GPS/IMG/IP/UNKNOWN source tracking

### Security patterns
- [ ] Upload app: no auth (bot-protected by honeypot + timing check + origin allowlist)
- [ ] Admin: JWT cookie (HS256, JWT_SECRET)
- [ ] Portal: magic link → portal_login_tokens → portal_sessions cookie
- [ ] Delivery: magic link → email → portal_login_tokens → session cookie
- [ ] Site internal tools: SHA-256 client-side hash (sessionStorage unlock)
- [ ] API bearer tokens for REST API access (portal-generated)
- [ ] Webhook HMAC-SHA256 signature for outbound events
