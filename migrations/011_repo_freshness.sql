-- 011: repository source freshness tracking (monthly check) + priority promotion
ALTER TABLE repository_items ADD COLUMN pending_update_note TEXT;
ALTER TABLE repository_items ADD COLUMN source_last_checked_at INTEGER;
ALTER TABLE repository_items ADD COLUMN source_etag TEXT;
ALTER TABLE repository_items ADD COLUMN source_content_length INTEGER;
