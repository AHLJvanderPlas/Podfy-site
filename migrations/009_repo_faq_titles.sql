-- 009: FAQ storage for repository items + shorten 4 over-length titles (SEO)
ALTER TABLE repository_items ADD COLUMN faq_json TEXT;

UPDATE repository_items SET title = 'eFTI Authority Access (Reg. 2024/1942)', updated_at = unixepoch()
  WHERE slug = 'efti-implementing-2024-1942';
UPDATE repository_items SET title = 'eFTI Platform Requirements (Reg. 2025/2243)', updated_at = unixepoch()
  WHERE slug = 'efti-implementing-2025-2243';
UPDATE repository_items SET title = 'Mobility Package I — Driving & Tachograph', updated_at = unixepoch()
  WHERE slug = 'reg-2020-1054-mobility-package';
UPDATE repository_items SET title = 'Mobility Package I — Establishment & Cabotage', updated_at = unixepoch()
  WHERE slug = 'reg-2020-1055-establishment-cabotage';
