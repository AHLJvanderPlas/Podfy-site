-- 003 (podfy-public): DE + FR blog/newsletter columns + FAQ storage.
-- Blog + newsletter now publish in all four site locales (EN canonical).
-- faq_json: {"en":[{"q","a"}...],"nl":[...],"de":[...],"fr":[...]} — rendered
-- as an FAQ section + FAQPage JSON-LD on the article page.

ALTER TABLE blog_posts ADD COLUMN title_de   TEXT;
ALTER TABLE blog_posts ADD COLUMN excerpt_de TEXT;
ALTER TABLE blog_posts ADD COLUMN content_de TEXT;
ALTER TABLE blog_posts ADD COLUMN title_fr   TEXT;
ALTER TABLE blog_posts ADD COLUMN excerpt_fr TEXT;
ALTER TABLE blog_posts ADD COLUMN content_fr TEXT;
ALTER TABLE blog_posts ADD COLUMN newsletter_subject_de TEXT;
ALTER TABLE blog_posts ADD COLUMN newsletter_body_de    TEXT;
ALTER TABLE blog_posts ADD COLUMN newsletter_subject_fr TEXT;
ALTER TABLE blog_posts ADD COLUMN newsletter_body_fr    TEXT;
ALTER TABLE blog_posts ADD COLUMN faq_json TEXT;
