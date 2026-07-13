// GET /api/profile-badge/photo — streams the mirrored LinkedIn profile photo
// from R2. Same bucket as insights covers (podfy-uploads), marketing/ prefix.

export async function onRequestGet(context) {
  const { env } = context;
  const row = await env.DB.prepare(`SELECT photo_key FROM profile_badge WHERE id = 1`).first();
  if (!row?.photo_key || !row.photo_key.startsWith("marketing/")) {
    return new Response("Not found", { status: 404 });
  }
  const obj = await env.PODFY_BUCKET.get(row.photo_key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType || "image/jpeg",
      "cache-control": "public, max-age=86400",
    },
  });
}
