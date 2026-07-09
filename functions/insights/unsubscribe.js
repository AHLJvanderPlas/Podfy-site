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
  const S = {
    en: { already: "You are already unsubscribed", q: "Unsubscribe from Podfy market updates?", btn: "Yes, unsubscribe me" },
    nl: { already: "Je bent al uitgeschreven", q: "Uitschrijven van Podfy market updates?", btn: "Ja, schrijf me uit" },
    de: { already: "Sie sind bereits abgemeldet", q: "Von den Podfy Market Updates abmelden?", btn: "Ja, abmelden" },
    fr: { already: "Vous êtes déjà désabonné", q: "Se désabonner des market updates de Podfy ?", btn: "Oui, me désabonner" },
  }[["nl", "de", "fr"].includes(row.newsletter_lang) ? row.newsletter_lang : "en"];
  if (row.newsletter === 0) {
    return page("Unsubscribed", `<h2>${S.already}</h2>`);
  }
  return page("Unsubscribe", `
    <h2>${S.q}</h2>
    <form method="POST">
      <button type="submit" style="background:#0E1116;color:#fff;border:0;padding:12px 24px;border-radius:4px;font-size:15px;cursor:pointer">
        ${S.btn}
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
  const done = {
    en: "<h2>✅ Unsubscribed</h2><p>You will no longer receive market updates.</p>",
    nl: "<h2>✅ Uitgeschreven</h2><p>Je ontvangt geen market updates meer.</p>",
    de: "<h2>✅ Abgemeldet</h2><p>Sie erhalten keine Market Updates mehr.</p>",
    fr: "<h2>✅ Désabonné</h2><p>Vous ne recevrez plus de market updates.</p>",
  }[["nl", "de", "fr"].includes(row.newsletter_lang) ? row.newsletter_lang : "en"];
  return page("Unsubscribed", done);
}
