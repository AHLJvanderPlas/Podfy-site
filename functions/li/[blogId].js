// GET /li/:blogId?src= — self-healing LinkedIn redirect + passthrough logging.
// Newsletter/digest buttons point here, never at the raw post URL: replacing
// an auto-post with a manual one heals every already-sent email. Every hit is
// logged (blog_id + src only) — the email→LinkedIn side of the click funnel.

export async function onRequestGet(context) {
  const { request, env, params, waitUntil } = context;
  const blogId = String(params.blogId);
  const src = new URL(request.url).searchParams.get("src") || "direct";
  const log = env.DB.prepare(
    `INSERT INTO passthrough_events (id, blog_id, src) VALUES (?, ?, ?)`
  ).bind(crypto.randomUUID(), blogId, src.slice(0, 20)).run().catch(() => {});
  (waitUntil || context.ctx?.waitUntil || ((p) => p))(log);

  const row = await env.DB.prepare(
    `SELECT slug, linkedin_post_url FROM blog_posts WHERE id = ?`
  ).bind(blogId).first();
  if (row?.linkedin_post_url) return Response.redirect(row.linkedin_post_url, 302);
  if (row?.slug) return Response.redirect(`https://podfy.net/insights/article?slug=${row.slug}`, 302);
  return Response.redirect("https://podfy.net/insights", 302);
}
