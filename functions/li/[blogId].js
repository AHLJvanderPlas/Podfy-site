// GET /li/:blogId — self-healing LinkedIn redirect.
// Newsletter "React on LinkedIn" buttons point here, never at the raw post URL:
// if an auto-post is later replaced by a manual one, every already-sent email
// heals automatically. Falls back to the article page, then the insights index.

export async function onRequestGet(context) {
  const { env, params } = context;
  const row = await env.DB.prepare(
    `SELECT slug, linkedin_post_url FROM blog_posts WHERE id = ?`
  ).bind(String(params.blogId)).first();
  if (row?.linkedin_post_url) return Response.redirect(row.linkedin_post_url, 302);
  if (row?.slug) return Response.redirect(`https://podfy.net/insights/article?slug=${row.slug}`, 302);
  return Response.redirect("https://podfy.net/insights", 302);
}
