-- podfy-main-eu schema (tables + indexes, no data) from the 2026-09-29 export — for local smoke databases
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, role TEXT NOT NULL DEFAULT 'customer', is_active INTEGER NOT NULL DEFAULT 1, password_hash TEXT, provider TEXT DEFAULT 'magic', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, actor_user_id TEXT, action TEXT NOT NULL, target TEXT, payload TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE portal_login_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, token_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, consumed_at INTEGER, created_at INTEGER NOT NULL, request_ip TEXT, user_agent TEXT, issuer TEXT);
CREATE TABLE portal_sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, last_accessed_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, ip TEXT, user_agent TEXT);
CREATE TABLE IF NOT EXISTS "brand_users" (id INTEGER PRIMARY KEY, slug TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('user','admin')) DEFAULT 'user', status TEXT NOT NULL CHECK (status IN ('active','paused')) DEFAULT 'active', last_session_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, deleted_at TEXT DEFAULT NULL, deleted_by TEXT DEFAULT NULL, is_to INTEGER NOT NULL DEFAULT 0, is_cc INTEGER NOT NULL DEFAULT 0, is_bcc INTEGER NOT NULL DEFAULT 0, receives_invoice INTEGER NOT NULL DEFAULT 0, passkey_credentials TEXT DEFAULT NULL, passkey_challenge TEXT DEFAULT NULL, visible_tabs TEXT, invoice_to  INTEGER NOT NULL DEFAULT 0, invoice_cc  INTEGER NOT NULL DEFAULT 0, invoice_bcc INTEGER NOT NULL DEFAULT 0, can_delete INTEGER NOT NULL DEFAULT 0, newsletter INTEGER NOT NULL DEFAULT 0, newsletter_lang TEXT NOT NULL DEFAULT 'en', newsletter_confirmed_at TEXT, newsletter_token TEXT, newsletter_frequency TEXT NOT NULL DEFAULT 'weekly', newsletter_last_post_mail_at TEXT);
CREATE TABLE IF NOT EXISTS "brand_details" (slug TEXT PRIMARY KEY, brand_name TEXT NOT NULL, logo TEXT NOT NULL, color_primary TEXT NOT NULL, color_accent TEXT NOT NULL, color_text TEXT NOT NULL, color_muted TEXT NOT NULL, color_border TEXT NOT NULL, color_button_text TEXT NOT NULL, header_bg TEXT NOT NULL DEFAULT '#FFFFFF', notes_internal TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, check_gps INTEGER NOT NULL DEFAULT 1, check_copy INTEGER NOT NULL DEFAULT 1, check_clean INTEGER NOT NULL DEFAULT 1, check_ref INTEGER NOT NULL DEFAULT 1, check_funct_5 INTEGER NOT NULL DEFAULT 1, check_funct_6 INTEGER NOT NULL DEFAULT 1, mail_notification INTEGER NOT NULL DEFAULT 1, multi_file INTEGER NOT NULL DEFAULT 1, pdf_header INTEGER NOT NULL DEFAULT 1, pdf_footer INTEGER DEFAULT 1, funct_11 INTEGER DEFAULT 1, funct_12 INTEGER DEFAULT 1, email_recipients TEXT NOT NULL DEFAULT '{"to":[],"cc":[],"bcc":[]}', data_ttl_hours INTEGER, is_active INTEGER NOT NULL DEFAULT 1, vat_rate       REAL NOT NULL DEFAULT 0.21, billing_period TEXT NOT NULL DEFAULT 'monthly', billing_company  TEXT, billing_contact  TEXT, billing_address  TEXT, billing_city     TEXT, billing_postcode TEXT, billing_country  TEXT NOT NULL DEFAULT 'NL', billing_kvk      TEXT, billing_vat      TEXT, billing_po       TEXT, billing_email    TEXT, billing_meta     TEXT, billing_due_days INTEGER NOT NULL DEFAULT 30, billing_notes TEXT, delivery_history_days INTEGER DEFAULT 60, stats_panel_visibility TEXT DEFAULT NULL, check_ref_scan   INTEGER DEFAULT 0, check_ref_manual INTEGER DEFAULT 0, billing_invoice_cc TEXT DEFAULT '', billing_invoice_bcc TEXT DEFAULT '', subscription TEXT, pdf_merge INTEGER DEFAULT 1, check_ref_required INTEGER NOT NULL DEFAULT 0);
CREATE TABLE transactions (id INTEGER PRIMARY KEY, podfy_id TEXT NOT NULL, slug TEXT NOT NULL, upload_date TEXT NOT NULL, upload_time TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT, reference TEXT, presented_loc_url TEXT, presented_label TEXT, storage_key TEXT, copy_email_hash TEXT, process_status TEXT, delivery_issue_code TEXT, delivery_issue_notes TEXT, plan TEXT, app_version TEXT, deleted_at TEXT, deleted_by TEXT, deleted_reason TEXT, expires_at      TEXT, reference_2 TEXT, gps_fetch TEXT, price    REAL DEFAULT NULL, invoiced REAL NOT NULL DEFAULT 0, share_token TEXT, addons_snapshot TEXT, UNIQUE (podfy_id) ON CONFLICT REPLACE);
CREATE TABLE billing_rates (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT    NOT NULL,
  price_per_upload  REAL    NOT NULL DEFAULT 0,
  currency          TEXT    NOT NULL DEFAULT 'EUR',
  effective_from    TEXT    NOT NULL DEFAULT (date('now')),
  is_active         INTEGER NOT NULL DEFAULT 1,
  notes             TEXT,   -- describe any add-ons included in this rate
  created_at        TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
, subscription TEXT);
CREATE TABLE passkey_credentials (
  id           TEXT PRIMARY KEY,            -- credential ID (base64url), sent by browser
  user_id      TEXT NOT NULL,               -- references users.id
  public_key   TEXT NOT NULL,               -- COSE public key stored as base64url
  sign_count   INTEGER NOT NULL DEFAULT 0,
  aaguid       TEXT,                        -- authenticator AAGUID (e.g. Apple iCloud Keychain)
  transports   TEXT,                        -- JSON array: ["internal","hybrid"] etc.
  friendly_name TEXT,                       -- user-supplied label, e.g. "MacBook Pro"
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used_at TEXT
);
CREATE TABLE passkey_challenges (
  id         TEXT PRIMARY KEY,              -- random base64url challenge
  user_id    TEXT,                          -- NULL for authentication (user unknown yet)
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE billing_plan_catalog (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_name    TEXT    NOT NULL UNIQUE,
  default_price REAL   NOT NULL DEFAULT 0,
  currency     TEXT    NOT NULL DEFAULT 'EUR',
  is_active    INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
, validity_days INTEGER, type TEXT NOT NULL DEFAULT 'plan', feature_key TEXT, activation TEXT DEFAULT 'plan', config_schema TEXT, requires_feature_key TEXT, pricing_mode TEXT DEFAULT 'per_use', description TEXT, visibility TEXT NOT NULL DEFAULT 'public');
CREATE TABLE contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'customer',  -- customer | supplier | both
  email      TEXT,
  country    TEXT NOT NULL DEFAULT 'NL',
  vat_number TEXT,
  kvk        TEXT,
  address    TEXT,
  city       TEXT,
  postcode   TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE brand_cmr_relations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL,
  category    TEXT NOT NULL,
  name        TEXT NOT NULL,
  addr        TEXT DEFAULT '',
  zip         TEXT DEFAULT '',
  city        TEXT DEFAULT '',
  country     TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  UNIQUE(slug, category, name)
);
CREATE TABLE IF NOT EXISTS "brand_cmr_transactions" (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  addon_id           TEXT    NOT NULL UNIQUE,           -- e.g. CMR-acme-20260511-A7F2
  slug             TEXT    NOT NULL,
  mode             TEXT    NOT NULL DEFAULT 'CMR',    -- CMR | AVC
  status           TEXT    NOT NULL DEFAULT 'exported',
  transport_ref    TEXT    NOT NULL DEFAULT '',
  sender_name      TEXT    NOT NULL DEFAULT '',
  sender_country   TEXT    NOT NULL DEFAULT '',
  consignee_name   TEXT    NOT NULL DEFAULT '',
  consignee_country TEXT   NOT NULL DEFAULT '',
  delivery_city    TEXT    NOT NULL DEFAULT '',
  delivery_country TEXT    NOT NULL DEFAULT '',
  carrier_name     TEXT    NOT NULL DEFAULT '',
  takeover_date    TEXT    NOT NULL DEFAULT '',
  established_date TEXT    NOT NULL DEFAULT '',
  charges          TEXT    NOT NULL DEFAULT 'franco', -- franco | unfrei
  form_data_json   TEXT,                              -- full state JSON for audit/reload
  r2_pdf_key       TEXT,                              -- PODFY_BUCKET key (null until PDF uploaded)
  export_count     INTEGER NOT NULL DEFAULT 1,
  last_exported_at TEXT    NOT NULL DEFAULT (datetime('now')),
  created_by       TEXT    NOT NULL DEFAULT '',       -- portal user email
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
, type TEXT NOT NULL DEFAULT 'cmr', price    REAL, invoiced REAL NOT NULL DEFAULT 0);
CREATE TABLE plan_features (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription    TEXT NOT NULL,
  feature_key  TEXT NOT NULL,
  is_included  INTEGER NOT NULL DEFAULT 1,
  UNIQUE (subscription, feature_key)
);
CREATE TABLE brand_feature_configs (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                  TEXT NOT NULL,
  feature_key           TEXT NOT NULL,
  is_active             INTEGER NOT NULL DEFAULT 0,
  config_json           TEXT,               -- current config (zone layout, etc.)
  suspended_config_json TEXT,               -- preserved on downgrade; restored on re-upgrade
  activated_at          TEXT,
  activated_by          TEXT,               -- brand_users.email
  deactivated_at        TEXT,
  accepted_rate         TEXT,               -- rate shown/accepted at activation
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now')),
  UNIQUE (slug, feature_key)
);
CREATE TABLE admin_login_tokens (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL,
  token_hash   TEXT    NOT NULL,
  expires_at   INTEGER NOT NULL,
  consumed_at  INTEGER,
  request_ip   TEXT,
  created_at   INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE TABLE transaction_ocr (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  podfy_id     TEXT NOT NULL,
  ocr_text     TEXT,
  ocr_status   TEXT DEFAULT 'pending',  -- pending | done | failed
  language     TEXT DEFAULT 'eng+nld',
  processed_at INTEGER,
  created_at   INTEGER DEFAULT (unixepoch()), attempts INTEGER DEFAULT 0,
  UNIQUE(podfy_id)
);
CREATE TABLE IF NOT EXISTS "invoices" (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number    TEXT    NOT NULL UNIQUE,
  slug              TEXT    NOT NULL,
  period            TEXT    NOT NULL,
  period_start      TEXT    NOT NULL,
  period_end        TEXT    NOT NULL,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  correction_count  INTEGER NOT NULL DEFAULT 0,
  subtotal          REAL    NOT NULL DEFAULT 0,
  vat_rate          REAL    NOT NULL DEFAULT 0.21,
  vat_amount        REAL    NOT NULL DEFAULT 0,
  total             REAL    NOT NULL DEFAULT 0,
  currency          TEXT    NOT NULL DEFAULT 'EUR',
  status            TEXT    NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','unpaid','paid','void','credited')),
  lines_json        TEXT,
  covered_ids       TEXT,
  r2_invoice_key    TEXT,
  r2_dataset_key    TEXT,
  notes             TEXT,
  finalised_at      TEXT,
  sent_at           TEXT,
  paid_at           TEXT,
  voided_at         TEXT,
  created_at        TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  invoice_po        TEXT,
  emailed_at        TEXT,
  emailed_to        TEXT,
  credit_note_for   TEXT,
  direction         TEXT NOT NULL DEFAULT 'out',
  type              TEXT NOT NULL DEFAULT 'auto',
  contact_id        INTEGER,
  invoice_date      DATE,
  due_date          DATE,
  attachment_key    TEXT,
  btw_verlegd       INTEGER NOT NULL DEFAULT 0,
  alert_early_sent_at TEXT,
  alert_due_sent_at   TEXT,
  covered_addon_ids   TEXT,
  addon_count         INTEGER NOT NULL DEFAULT 0,
  public_token        TEXT,
  r2_pdf_key          TEXT
);
CREATE TABLE brand_qr_generations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  addon_id     TEXT    NOT NULL UNIQUE,          -- QR-[slug]-[YYYYMMDD]-[rand4]
  slug         TEXT    NOT NULL,
  ref1         TEXT    NOT NULL,                 -- reference encoded in the QR URL
  export_type  TEXT    NOT NULL DEFAULT 'png',   -- png | label | a5
  export_count INTEGER NOT NULL DEFAULT 1,       -- increments on re-export of same session
  created_by   TEXT    NOT NULL DEFAULT '',      -- portal user email
  price        REAL,                             -- NULL = free; stamped when billing activated
  invoiced     REAL    NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE action_plan_tasks (
  id          INTEGER PRIMARY KEY,
  phase       TEXT    NOT NULL CHECK(phase IN ('phase1','phase2','phase3')),
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL CHECK(category IN ('site','mkt','ops','biz')),
  due_date    TEXT    NOT NULL,
  is_critical INTEGER NOT NULL DEFAULT 0,
  is_done     INTEGER NOT NULL DEFAULT 0,
  done_at     TEXT,
  done_by     TEXT,
  criteria    TEXT    NOT NULL,
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE kpi_targets (
  id            INTEGER PRIMARY KEY,
  slug          TEXT    NOT NULL UNIQUE,
  name          TEXT    NOT NULL,
  unit          TEXT    NOT NULL CHECK(unit IN ('count','eur','pct')),
  is_inverse    INTEGER NOT NULL DEFAULT 0,
  target_m1     REAL,
  target_m3     REAL,
  target_m6     REAL,
  actual        REAL    NOT NULL DEFAULT 0,
  actual_source TEXT    NOT NULL DEFAULT 'manual'
                        CHECK(actual_source IN ('manual','computed')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by    TEXT
);
CREATE TABLE kpi_snapshots (
  id            INTEGER PRIMARY KEY,
  kpi_slug      TEXT    NOT NULL,
  snapshot_date TEXT    NOT NULL,
  value         REAL    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(kpi_slug, snapshot_date)
);
CREATE TABLE channel_advice (
  id            INTEGER PRIMARY KEY,
  channel_type  TEXT    NOT NULL CHECK(channel_type IN
                  ('facebook','linkedin','forum','association','event','other')),
  country       TEXT    NOT NULL DEFAULT 'NL',
  name          TEXT    NOT NULL,
  url           TEXT    NOT NULL,
  audience      TEXT    NOT NULL,
  pitch_notes   TEXT,
  size_estimate TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  last_posted   TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE backlink_items (
  id          INTEGER PRIMARY KEY,
  tier        INTEGER NOT NULL CHECK(tier BETWEEN 1 AND 6),
  platform    TEXT    NOT NULL,
  url         TEXT    NOT NULL,
  link_type   TEXT    NOT NULL DEFAULT 'unknown'
                      CHECK(link_type IN ('dofollow','nofollow','varies','unknown')),
  description TEXT,
  is_done     INTEGER NOT NULL DEFAULT 0,
  done_at     TEXT,
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE prospects (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name      TEXT    NOT NULL,
  website           TEXT,
  country           TEXT    NOT NULL DEFAULT 'NL',
  language          TEXT    NOT NULL DEFAULT 'nl',
  segment           TEXT    NOT NULL DEFAULT 'carrier'
                    CHECK(segment IN ('carrier','3pl','shipper','retail','construction','facilities','inbound','digitize')),
  fleet_size        TEXT,
  pod_method        TEXT    NOT NULL DEFAULT 'unknown'
                    CHECK(pod_method IN ('paper_only','mixed','existing_app','none','unknown')),
  pain_tags         TEXT,   -- JSON array of tag keys
  stage             TEXT    NOT NULL DEFAULT 'lead'
                    CHECK(stage IN ('lead','contacted','demo','pilot','customer','lost')),
  likely_plan       TEXT    NOT NULL DEFAULT 'unknown'
                    CHECK(likely_plan IN ('basic','starter','advanced','enterprise','unknown')),
  decision_timeline TEXT    NOT NULL DEFAULT 'unknown'
                    CHECK(decision_timeline IN ('immediate','this_quarter','roadmap','unknown')),
  source            TEXT    NOT NULL DEFAULT 'other'
                    CHECK(source IN ('whatsapp','linkedin','vern','referral','inbound','event','other')),
  referral_by       TEXT,
  pilot_slug        TEXT,
  outcome_reason    TEXT,
  competitor_name   TEXT,
  next_followup     TEXT,   -- YYYY-MM-DD
  notes             TEXT,
  is_deleted        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE prospect_contacts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id   INTEGER NOT NULL REFERENCES prospects(id),
  name          TEXT    NOT NULL,
  role          TEXT,
  is_primary    INTEGER NOT NULL DEFAULT 0,
  platform      TEXT    NOT NULL DEFAULT 'email'
                CHECK(platform IN ('whatsapp','linkedin','email','phone','other')),
  phone         TEXT,
  email         TEXT,
  linkedin_url  TEXT,
  language      TEXT    NOT NULL DEFAULT 'nl',
  preferred_time TEXT,
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE prospect_interactions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id  INTEGER NOT NULL REFERENCES prospects(id),
  contact_id   INTEGER REFERENCES prospect_contacts(id),
  date         TEXT    NOT NULL,
  channel      TEXT    NOT NULL DEFAULT 'email'
               CHECK(channel IN ('whatsapp','linkedin','email','phone','meeting','other')),
  summary      TEXT    NOT NULL,
  outcome      TEXT    NOT NULL DEFAULT 'neutral'
               CHECK(outcome IN ('positive','neutral','no_reply','negative')),
  demo_sent    INTEGER NOT NULL DEFAULT 0,
  materials    TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  created_by   TEXT
);
CREATE TABLE prospect_milestones (
  prospect_id           INTEGER PRIMARY KEY REFERENCES prospects(id),
  demo_link_opened_at   TEXT,
  trial_created_at      TEXT,
  dpa_requested_at      TEXT,
  pricing_discussed_at  TEXT,
  updated_at            TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE brand_email_notification_templates (
  id                           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                         TEXT NOT NULL UNIQUE,
  is_active                    INTEGER NOT NULL DEFAULT 0,
  to_template                  TEXT NOT NULL DEFAULT '',
  cc_template                  TEXT NOT NULL DEFAULT '',
  bcc_template                 TEXT NOT NULL DEFAULT '',
  subject_template             TEXT NOT NULL DEFAULT 'POD | {brand_name} | {reference}',
  body_template                TEXT NOT NULL DEFAULT 'A new POD was uploaded for {brand_name}.\n\nReference: {reference}\nPODFY ID: {podfy_id}\nUploaded: {uploaded_at}\n\n{pod_url}',
  attachment_filename_template TEXT NOT NULL DEFAULT '{slug}_{reference}_{yyyy}{MM}{dd}{HH}{mm}{ss}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
CREATE TABLE brand_email_notification_logs (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                TEXT NOT NULL,
  podfy_id            TEXT NOT NULL,
  template_id         INTEGER,
  to_rendered         TEXT,
  cc_rendered         TEXT,
  bcc_rendered        TEXT,
  subject_rendered    TEXT,
  attachment_filename TEXT,
  status              TEXT NOT NULL,
  error_message       TEXT,
  provider_message_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE erasure_requests (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL,
  requested_by     TEXT    NOT NULL,  -- brand_users.email
  request_type     TEXT    NOT NULL
                   CHECK(request_type IN ('bulk_before_date', 'single_record', 'brand_user')),
  -- bulk_before_date: delete all delivery records (+ R2 files) uploaded before scope_date
  -- single_record:    delete one specific transaction by podfy_id
  -- brand_user:       remove a specific portal user's personal data (sessions, tokens, email)
  scope_date       TEXT,   -- YYYY-MM-DD, used for bulk_before_date
  scope_podfy_id   TEXT,   -- used for single_record
  scope_email      TEXT,   -- used for brand_user
  reason           TEXT,   -- requestor's stated reason (optional)
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending', 'approved', 'rejected', 'executed')),
  reviewed_by      TEXT,   -- admin users.email
  reviewed_at      TEXT,
  rejection_reason TEXT,
  executed_at      TEXT,
  records_deleted  INTEGER,
  r2_objects_deleted INTEGER,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE transaction_ai_scan (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  podfy_id     TEXT NOT NULL,
  ai_status    TEXT DEFAULT 'pending',  -- pending | done | failed
  ai_json      TEXT,                    -- structured result (doc_type, references_found, reference_match, signature_present, ...)
  model        TEXT,                    -- model id that produced the result
  attempts     INTEGER DEFAULT 0,
  processed_at INTEGER,
  created_at   INTEGER DEFAULT (unixepoch()),
  UNIQUE(podfy_id)
);
CREATE TABLE linkedin_schedule (
  id                TEXT    PRIMARY KEY,
  week              TEXT    NOT NULL,
  slot              TEXT    NOT NULL CHECK(slot IN
                     ('monday','tuesday','wednesday','thursday','friday')),
  blog_id           TEXT,
  post_text         TEXT,
  hashtags          TEXT,
  status            TEXT    NOT NULL DEFAULT 'empty',
  linkedin_post_id  TEXT,
  attempt_count     INTEGER NOT NULL DEFAULT 0,
  last_error        TEXT,
  last_attempt_at   INTEGER,
  published_at      INTEGER,
  newsletter_sent   INTEGER NOT NULL DEFAULT 0,
  newsletter_error  TEXT,
  post_type         TEXT,
  post_format       TEXT,
  link_strategy     TEXT,
  hashtag_count     INTEGER,
  word_count        INTEGER,
  content_source    TEXT    NOT NULL DEFAULT 'generated',
  value_gate_result TEXT,
  document_urn      TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch()), attachment_override TEXT, repo_item_id TEXT, org_post_id TEXT, org_post_url TEXT, scheduled_publish_at INTEGER,
  UNIQUE(week, slot)
);
CREATE TABLE linkedin_performance (
  id                   TEXT    PRIMARY KEY,
  schedule_id          TEXT    NOT NULL REFERENCES linkedin_schedule(id) ON DELETE CASCADE,
  measured_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  auto_fetched_at      INTEGER,
  impressions          INTEGER,
  unique_viewers       INTEGER,
  reactions            INTEGER,
  comments             INTEGER,
  substantive_comments INTEGER,
  reposts              INTEGER,
  link_clicks          INTEGER,
  profile_visits       INTEGER,
  newsletter_clicks    INTEGER,
  inquiries            INTEGER,
  source               TEXT    NOT NULL DEFAULT 'manual',
  notes                TEXT
, org_reactions INTEGER, org_comments INTEGER, org_fetched_at INTEGER);
CREATE TABLE linkedin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE linkedin_ops_log (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE newsletter_digests (
  week_key   TEXT PRIMARY KEY,           -- ISO week, one digest per week EVER
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE email_log (
  id         TEXT PRIMARY KEY,
  category   TEXT NOT NULL,              -- newsletter | digest | linkedin | system
  recipients INTEGER NOT NULL DEFAULT 1,
  status     TEXT NOT NULL,              -- sent | failed
  detail     TEXT,                       -- never content or addresses
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE api_usage_log (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at                    TEXT NOT NULL DEFAULT (datetime('now')),
  repo                          TEXT NOT NULL,   -- 'podfy-cron' | 'podfy-admin'
  call_site                     TEXT NOT NULL,   -- e.g. 'ocr_sweep', 'ai_scan_sweep', 'biweekly_regulation_deep_research'
  model                         TEXT NOT NULL,
  input_tokens                  INTEGER NOT NULL DEFAULT 0,
  output_tokens                 INTEGER NOT NULL DEFAULT 0,
  cache_creation_input_tokens   INTEGER NOT NULL DEFAULT 0,
  cache_read_input_tokens       INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd            REAL NOT NULL DEFAULT 0,
  ok                            INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE portal_login_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL,
  code_hash   TEXT    NOT NULL,          -- SHA-256 of "email:code"
  expires_at  INTEGER NOT NULL,          -- unix
  consumed_at INTEGER,                   -- unix; also set when superseded or locked out
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,          -- unix
  request_ip  TEXT
);
CREATE TABLE upload_guard (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT    NOT NULL,
  key        TEXT    NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_transactions_expires_at
  ON transactions (expires_at)
  WHERE expires_at IS NOT NULL;
CREATE INDEX idx_brand_users_deleted_at
  ON brand_users (deleted_at)
  WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_billing_rates_slug      ON billing_rates(slug);
CREATE INDEX idx_billing_rates_effective ON billing_rates(slug, effective_from);
CREATE INDEX idx_pk_creds_user ON passkey_credentials(user_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE UNIQUE INDEX idx_plt_token_hash
  ON portal_login_tokens(token_hash);
CREATE INDEX idx_plt_email_expires
  ON portal_login_tokens(email, expires_at);
CREATE INDEX idx_bcr_slug_cat ON brand_cmr_relations(slug, category);
CREATE INDEX idx_bat_slug_type_date
  ON "brand_cmr_transactions"(slug, type, established_date DESC);
CREATE INDEX idx_bat_slug_type_ref
  ON "brand_cmr_transactions"(slug, type, transport_ref);
CREATE INDEX idx_bat_billing
  ON "brand_cmr_transactions"(slug, price, invoiced);
CREATE INDEX idx_pf_plan ON plan_features (subscription);
CREATE INDEX idx_bfc_slug ON brand_feature_configs (slug);
CREATE UNIQUE INDEX idx_alt_token_hash
  ON admin_login_tokens(token_hash);
CREATE INDEX idx_alt_email_expires
  ON admin_login_tokens(email, expires_at);
CREATE UNIQUE INDEX idx_transactions_share_token ON transactions(share_token);
CREATE INDEX idx_ocr_podfy_id ON transaction_ocr(podfy_id);
CREATE INDEX idx_invoices_slug          ON invoices(slug);
CREATE INDEX idx_invoices_period        ON invoices(period);
CREATE INDEX idx_invoices_status        ON invoices(status);
CREATE INDEX idx_invoices_credit_note_for ON invoices(credit_note_for);
CREATE INDEX idx_invoices_direction     ON invoices(direction);
CREATE INDEX idx_invoices_type          ON invoices(type);
CREATE INDEX idx_invoices_contact_id    ON invoices(contact_id);
CREATE INDEX idx_invoices_due_date      ON invoices(due_date);
CREATE UNIQUE INDEX idx_invoices_public_token
  ON invoices(public_token) WHERE public_token IS NOT NULL;
CREATE INDEX idx_qr_slug_created  ON brand_qr_generations(slug, created_at DESC);
CREATE INDEX idx_qr_slug_ref      ON brand_qr_generations(slug, ref1);
CREATE INDEX idx_qr_price_invoiced ON brand_qr_generations(slug, price, invoiced);
CREATE INDEX idx_prospects_stage     ON prospects(stage);
CREATE INDEX idx_prospects_followup  ON prospects(next_followup) WHERE is_deleted = 0;
CREATE INDEX idx_pcontacts_pid       ON prospect_contacts(prospect_id);
CREATE INDEX idx_pinteractions_pid   ON prospect_interactions(prospect_id);
CREATE INDEX idx_cnlogs_slug_podfy ON brand_email_notification_logs(slug, podfy_id);
CREATE INDEX idx_cnlogs_created    ON brand_email_notification_logs(created_at DESC);
CREATE INDEX idx_erasure_slug   ON erasure_requests(slug, status);
CREATE INDEX idx_erasure_status ON erasure_requests(status, created_at DESC);
CREATE INDEX idx_ai_scan_pending ON transaction_ai_scan (ai_status, attempts);
CREATE INDEX idx_ocr_pending ON transaction_ocr (ocr_status, attempts);
CREATE INDEX idx_li_week      ON linkedin_schedule(week);
CREATE INDEX idx_li_status    ON linkedin_schedule(status);
CREATE INDEX idx_li_published ON linkedin_schedule(published_at DESC)
  WHERE published_at IS NOT NULL;
CREATE UNIQUE INDEX idx_li_perf_unique_schedule
  ON linkedin_performance(schedule_id);
CREATE INDEX idx_bu_newsletter
  ON brand_users(newsletter, newsletter_confirmed_at)
  WHERE newsletter = 1;
CREATE INDEX idx_email_log_time ON email_log(created_at DESC);
CREATE INDEX idx_api_usage_log_created   ON api_usage_log(created_at);
CREATE INDEX idx_api_usage_log_call_site ON api_usage_log(call_site);
CREATE INDEX idx_plc_email_created ON portal_login_codes(email, created_at);
CREATE UNIQUE INDEX idx_upload_guard_challenge ON upload_guard(key) WHERE kind = 'challenge';
CREATE INDEX idx_upload_guard_kind_key_time ON upload_guard(kind, key, created_at);
CREATE INDEX idx_upload_guard_time ON upload_guard(created_at);

-- migration 073
ALTER TABLE brand_details ADD COLUMN qa_email_recipients TEXT NOT NULL DEFAULT '';

-- migration 074
CREATE TABLE IF NOT EXISTS csp_reports (
  app        TEXT    NOT NULL,
  directive  TEXT    NOT NULL,
  blocked    TEXT    NOT NULL,
  source     TEXT    NOT NULL DEFAULT '',
  document   TEXT    NOT NULL DEFAULT '',
  sample     TEXT,
  count      INTEGER NOT NULL DEFAULT 1,
  first_seen TEXT    NOT NULL,
  last_seen  TEXT    NOT NULL,
  PRIMARY KEY (app, directive, blocked, source, document)
);
