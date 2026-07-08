// /insights/unsubscribe?token=...
// GET  — confirmation page (email scanners prefetching GETs cannot unsubscribe)
// POST — performs the unsubscribe (newsletter = 0)

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

async function findSub(env, token) {
  if (!token || token.length < 32) return null;
  return env.MAIN_DB.prepare(
    `SELECT id, newsletter, newsletter_lang FROM brand_users
     WHERE newsletter_token = ? AND deleted_at IS NULL`
  ).bind(token).first();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = new URL(request.url).searchParams.get("token") || "";
  const row = await findSub(env, token);
  if (!row) return page("Invalid link", "<h2>This link is not valid</h2>", 404);
  const nl = row.newsletter_lang === "nl";
  if (row.newsletter === 0) {
    return page("Unsubscribed", nl ? "<h2>Je bent al uitgeschreven</h2>" : "<h2>You are already unsubscribed</h2>");
  }
  return page("Unsubscribe", `
    <h2>${nl ? "Uitschrijven van Podfy market updates?" : "Unsubscribe from Podfy market updates?"}</h2>
    <form method="POST">
      <button type="submit" style="background:#0E1116;color:#fff;border:0;padding:12px 24px;border-radius:4px;font-size:15px;cursor:pointer">
        ${nl ? "Ja, schrijf me uit" : "Yes, unsubscribe me"}
      </button>
    </form>`);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = new URL(request.url).searchParams.get("token") || "";
  const row = await findSub(env, token);
  if (!row) return page("Invalid link", "<h2>This link is not valid</h2>", 404);
  await env.MAIN_DB.prepare(
    `UPDATE brand_users SET newsletter = 0, updated_at = datetime('now') WHERE id = ?`
  ).bind(row.id).run();
  const nl = row.newsletter_lang === "nl";
  return page("Unsubscribed", nl
    ? "<h2>✅ Uitgeschreven</h2><p>Je ontvangt geen market updates meer.</p>"
    : "<h2>✅ Unsubscribed</h2><p>You will no longer receive market updates.</p>");
}
