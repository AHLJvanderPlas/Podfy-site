-- Migration 074: csp_reports — Content-Security-Policy violation reports (report-only phase)
-- Written by /csp-report on portal.podfy.net and admin.podfy.net. Aggregated: one row per distinct
-- (app, directive, blocked, source, document) with a counter, capped per app by the endpoint.
-- Tokens in URLs (sign-in links, POD/invoice links) are stripped before storage.
CREATE TABLE IF NOT EXISTS csp_reports (
  app        TEXT    NOT NULL,          -- 'portal' | 'admin'
  directive  TEXT    NOT NULL,          -- effective directive, e.g. script-src-elem
  blocked    TEXT    NOT NULL,          -- 'inline' | 'eval' | origin | same-origin path
  source     TEXT    NOT NULL DEFAULT '', -- script file (path only) + line
  document   TEXT    NOT NULL DEFAULT '', -- page path with ids/tokens replaced by :id
  sample     TEXT,                      -- first 80 chars of the script sample, when the browser sends one
  count      INTEGER NOT NULL DEFAULT 1,
  first_seen TEXT    NOT NULL,
  last_seen  TEXT    NOT NULL,
  PRIMARY KEY (app, directive, blocked, source, document)
);
