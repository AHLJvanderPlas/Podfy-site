// GET /insights/confirm?token=... — double opt-in confirmation.
// Sets newsletter_confirmed_at on the matching brand_users row.

const page = (title, body, status = 200) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title} | PODFY</title></head>
     <body style="font-family:Inter,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;color:#0E1116">
       ${body}
       <p style="margin-top:32px"><a href="/insights" style="color:#D24A1F">← Podfy Insights</a></p>
     </body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token || token.length < 32) return page("Invalid link", "<h2>Invalid confirmation link</h2>", 400);

  const row = await env.MAIN_DB.prepare(
    `SELECT id, newsletter_confirmed_at, newsletter_lang FROM brand_users
     WHERE newsletter_token = ? AND newsletter = 1 AND deleted_at IS NULL`
  ).bind(token).first();
  if (!row) return page("Invalid link", "<h2>This link is not valid or was already used</h2>", 404);

  const nl = row.newsletter_lang === "nl";
  if (row.newsletter_confirmed_at) {
    return page("Already confirmed", nl
      ? "<h2>✅ Je was al bevestigd</h2><p>Je ontvangt de Podfy market updates.</p>"
      : "<h2>✅ Already confirmed</h2><p>You are receiving Podfy market updates.</p>");
  }
  await env.MAIN_DB.prepare(
    `UPDATE brand_users SET newsletter_confirmed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  ).bind(row.id).run();
  return page("Confirmed", nl
    ? "<h2>✅ Inschrijving bevestigd</h2><p>Je ontvangt vanaf nu de Podfy market updates. Uitschrijven kan onderaan elke mail.</p>"
    : "<h2>✅ Subscription confirmed</h2><p>You will now receive Podfy market updates. You can unsubscribe at the bottom of every email.</p>");
}
