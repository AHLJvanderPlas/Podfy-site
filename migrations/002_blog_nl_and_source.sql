-- 002 (podfy-public): Dutch blog translation columns + ingest source tracking.
-- One canonical post per article (EN primary); NL rendition served on the same
-- page via ?lang=nl. Keeps the LinkedIn fill pipeline single-post (the NL text
-- is never independently schedulable).

ALTER TABLE blog_posts ADD COLUMN title_nl   TEXT;
ALTER TABLE blog_posts ADD COLUMN excerpt_nl TEXT;
ALTER TABLE blog_posts ADD COLUMN content_nl TEXT;
ALTER TABLE blog_posts ADD COLUMN source     TEXT NOT NULL DEFAULT 'admin'; -- admin | email
