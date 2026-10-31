-- 017_uptime.sql (podfy-public-eu) — uptime data for podfy.net/status (plans/50-cron.md §2).
-- podfy-cron writes via PUBLIC_DB every 5 minutes; the site reads via DB. Public data only.

CREATE TABLE IF NOT EXISTS uptime_checks (          -- raw checks, kept 35 days
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checked_at TEXT NOT NULL,                         -- ISO 8601 UTC
  target TEXT NOT NULL,                             -- site | app | portal | admin | delivery | api
  ok INTEGER NOT NULL,
  status_code INTEGER,
  ms INTEGER,
  error TEXT
);
CREATE INDEX IF NOT EXISTS idx_upc_target_time ON uptime_checks(target, checked_at);

CREATE TABLE IF NOT EXISTS uptime_daily (           -- one row per UTC day and target, kept 400 days
  day TEXT NOT NULL,                                -- YYYY-MM-DD
  target TEXT NOT NULL,
  checks INTEGER NOT NULL DEFAULT 0,
  ok INTEGER NOT NULL DEFAULT 0,
  total_ms INTEGER NOT NULL DEFAULT 0,
  avg_ms INTEGER,
  PRIMARY KEY (day, target)
);
