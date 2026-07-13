// GET /api/profile-badge — self-hosted LinkedIn badge data (name/headline/
// linkedin_url/photo). Populated by a weekly podfy-admin cron sync, NEVER by
// a client-side call to LinkedIn — this endpoint only ever talks to our own
// D1/R2, so a visitor loading podfy.net/about never triggers a request to
// LinkedIn's servers.

export async function onRequestGet(context) {
  const { env } = context;
  const row = await env.DB.prepare(`SELECT name, headline, linkedin_url, photo_key, synced_at FROM profile_badge WHERE id = 1`).first();
  if (!row) return new Response(JSON.stringify({ ok: false }), { status: 404, headers: { "content-type": "application/json" } });
  return new Response(JSON.stringify({
    ok: true,
    name: row.name, headline: row.headline, linkedin_url: row.linkedin_url,
    photo_url: row.photo_key ? `/api/profile-badge/photo?v=${row.synced_at || 0}` : null,
    synced_at: row.synced_at,
  }), { headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" } });
}
