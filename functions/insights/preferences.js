// /insights/preferences?token= — tokenized self-service: language + frequency
// + unsubscribe link. Every change is audit-logged (old → new).

const LANGS = ["en", "nl", "de", "fr"];
const FREQS = ["daily", "weekly"];

const page = (title, body, status = 200) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title} | PODFY</title></head>
     <body style="font-family:Inter,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;color:#0E1116">
       ${body}<p style="margin-top:32px"><a href="/insights" style="color:#D24A1F">&larr; Podfy Insights</a></p>
     </body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } });

async function findSub(env, token) {
  if (!token || token.length < 32) return null;
  return env.MAIN_DB.prepare(
    `SELECT id, email, newsletter, newsletter_lang, newsletter_frequency FROM brand_users
     WHERE newsletter_token = ? AND deleted_at IS NULL`
  ).bind(token).first();
}

function form(row, token, msg = "") {
  const langOpts = { en: "English", nl: "Nederlands", de: "Deutsch", fr: "Fran\u00e7ais" };
  return `
    <h2>Newsletter preferences</h2>
    ${msg ? `<p style="color:#1F6B47">${msg}</p>` : ""}
    <form method="POST">
      <label style="display:block;margin:14px 0 4px;font-weight:600">Language</label>
      <select name="lang" style="padding:8px;width:100%">${LANGS.map(l =>
        `<option value="${l}"${row.newsletter_lang === l ? " selected" : ""}>${langOpts[l]}</option>`).join("")}</select>
      <label style="display:block;margin:14px 0 4px;font-weight:600">Frequency</label>
      <select name="freq" style="padding:8px;width:100%">
        <option value="weekly"${row.newsletter_frequency !== "daily" ? " selected" : ""}>Weekly digest (Monday)</option>
        <option value="daily"${row.newsletter_frequency === "daily" ? " selected" : ""}>Every new article (max 1/day)</option>
      </select>
      <button type="submit" style="margin-top:18px;background:#0E1116;color:#fff;border:0;padding:10px 22px;border-radius:4px;cursor:pointer">Save</button>
    </form>
    <p style="margin-top:22px;font-size:13px"><a href="/insights/unsubscribe?token=${encodeURIComponent(token)}" style="color:#888">Unsubscribe from all updates</a></p>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = new URL(request.url).searchParams.get("token") || "";
  const row = await findSub(env, token);
  if (!row) return page("Invalid link", "<h2>This link is not valid</h2>", 404);
  return page("Preferences", form(row, token));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = new URL(request.url).searchParams.get("token") || "";
  const row = await findSub(env, token);
  if (!row) return page("Invalid link", "<h2>This link is not valid</h2>", 404);
  const data = await request.formData().catch(() => null);
  const lang = LANGS.includes(data?.get("lang")) ? data.get("lang") : "en";
  const freq = FREQS.includes(data?.get("freq")) ? data.get("freq") : "weekly";
  await env.MAIN_DB.prepare(
    `UPDATE brand_users SET newsletter_lang = ?, newsletter_frequency = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(lang, freq, row.id).run();
  await env.MAIN_DB.prepare(
    `INSERT INTO audit_log (actor_user_id, action, target, payload) VALUES ('self-service','newsletter.preferences',?,?)`
  ).bind(String(row.id), JSON.stringify({ from: [row.newsletter_lang, row.newsletter_frequency], to: [lang, freq] })).run().catch(() => {});
  return page("Saved", form({ ...row, newsletter_lang: lang, newsletter_frequency: freq }, token, "Preferences saved \u2705"));
}
