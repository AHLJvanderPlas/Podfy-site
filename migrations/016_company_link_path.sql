-- 016: per-blog override for the company-page twin's link target (site path,
-- e.g. "/solutions/retail"). Set by generateCaseStudyBlog from the matched
-- solution direction; NULL means the publish flow derives the link itself
-- (repository item page for document-sourced blogs, else the article page).
ALTER TABLE blog_posts ADD COLUMN company_link_path TEXT;
