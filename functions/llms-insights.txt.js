// GET /llms-insights.txt — dynamic, auto-updated LLM-ingestion index of the
// Insights section: every published repository item + recent market-update
// articles. Exists so llms.txt never needs manual edits as content is added
// (the sitemap-insights.xml pattern, applied to LLM discovery instead of
// search-engine discovery). Referenced from llms.txt.

export async function onRequestGet(context) {
  const { env } = context;

  const { results: repo = [] } = await env.DB.prepare(
    `SELECT title, category, description, summary_en, external_url, slug
     FROM repository_items WHERE published = 1 AND access_level = 'public'
     ORDER BY category, title LIMIT 300`
  ).all();

  const { results: posts = [] } = await env.DB.prepare(
    `SELECT title, excerpt, slug, published_at FROM blog_posts
     WHERE status = 'published' ORDER BY published_at DESC LIMIT 100`
  ).all();

  const lines = [];
  lines.push("# PODFY Insights — repository and market updates index");
  lines.push("");
  lines.push("Auto-generated from the live database. Do not hand-edit; this file always");
  lines.push("reflects current content. Human-readable pages: https://podfy.net/insights/");
  lines.push("");
  lines.push("## Repository — official transport conventions and regulations");
  lines.push("");
  let lastCat = null;
  for (const r of repo) {
    if (r.category !== lastCat) {
      lines.push(`### ${categoryLabel(r.category)}`);
      lastCat = r.category;
    }
    const url = `https://podfy.net/insights/repository/item?slug=${encodeURIComponent(r.slug)}`;
    lines.push(`- ${r.title}`);
    lines.push(`  ${(r.summary_en || r.description || "").trim()}`);
    lines.push(`  Page: ${url}${r.external_url ? ` | Official source: ${r.external_url}` : ""}`);
  }
  lines.push("");
  lines.push("## Market updates — recent articles");
  lines.push("");
  for (const p of posts) {
    const date = p.published_at ? new Date(p.published_at * 1000).toISOString().slice(0, 10) : "";
    lines.push(`- [${date}] ${p.title}`);
    if (p.excerpt) lines.push(`  ${p.excerpt}`);
    lines.push(`  https://podfy.net/insights/article?slug=${encodeURIComponent(p.slug)}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

function categoryLabel(cat) {
  return {
    convention: "Conventions", protocol: "Protocols", regulation: "EU regulations",
    handbook: "Handbooks", reference: "Reference", whitepaper: "Whitepapers", guide: "Guides",
  }[cat] || (cat ? cat[0].toUpperCase() + cat.slice(1) : "Other");
}
