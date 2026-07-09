// GET /sitemap-insights.xml — dynamic sitemap for published insights articles.
// Referenced from robots.txt. Lists every language variant with xhtml:link
// hreflang alternates so all four renditions are indexable.

const LANGS = ["en", "nl", "de", "fr"];

export async function onRequestGet(context) {
  const { env } = context;
  const { results = [] } = await env.DB.prepare(
    `SELECT slug, published_at, updated_at, content_nl, content_de, content_fr
     FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 500`
  ).all();

  const urls = [];
  for (const p of results) {
    const base = `https://podfy.net/insights/article?slug=${encodeURIComponent(p.slug)}`;
    const has = (l) => l === "en" || !!p[`content_${l}`];
    const langs = LANGS.filter(has);
    const lastmod = new Date((p.updated_at || p.published_at) * 1000).toISOString().slice(0, 10);
    const alternates = langs.map(l =>
      `<xhtml:link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}&amp;lang=${l}`}"/>`
    ).join("");
    for (const l of langs) {
      urls.push(`<url><loc>${l === "en" ? base : `${base}&amp;lang=${l}`}</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
