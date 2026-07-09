// Insights API (podfy.net):
//   GET  /api/insights/posts            — published blog posts (list)
//   GET  /api/insights/posts/:slug      — single post
//   GET  /api/insights/repo             — published PUBLIC repository items
//   GET  /api/insights/file/:item_id    — stream a public repository file from R2
//   POST /api/insights/subscribe        — newsletter double opt-in (Turnstile + honeypot)
//
// Subscriptions are brand_users rows under the 'newsletter' brand in podfy-main
// (MAIN_DB binding). Confirm + unsubscribe handled by /insights/confirm and
// /insights/unsubscribe page functions using newsletter_token.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

export async function onRequest(context) {
  const { request, env, params } = context;
  const route = Array.isArray(params.route) ? params.route : [];
  const method = request.method;

  try {
    if (method === "GET" && route[0] === "posts" && !route[1]) {
      const { results = [] } = await env.DB.prepare(
        `SELECT id, title, slug, excerpt, cover_image_key, language, published_at
         FROM blog_posts WHERE status = 'published'
         ORDER BY published_at DESC LIMIT 50`
      ).all();
      return json({ ok: true, items: results });
    }

    if (method === "GET" && route[0] === "posts" && route[1]) {
      const row = await env.DB.prepare(
        `SELECT id, title, slug, excerpt, content, cover_image_key, language, published_at,
                title_nl, excerpt_nl, content_nl, title_de, excerpt_de, content_de,
                title_fr, excerpt_fr, content_fr, faq_json
         FROM blog_posts WHERE status = 'published' AND slug = ?`
      ).bind(route[1]).first();
      if (!row) return json({ ok: false, error: "not_found" }, 404);
      return json({ ok: true, item: row });
    }

    if (method === "GET" && route[0] === "cover" && route[1]) {
      const row = await env.DB.prepare(
        `SELECT cover_image_key FROM blog_posts WHERE id = ? AND status = 'published'`
      ).bind(route[1]).first();
      // Serve ONLY the marketing/covers/ prefix — never POD files
      if (!row?.cover_image_key || !row.cover_image_key.startsWith("marketing/covers/")) {
        return new Response("Not found", { status: 404 });
      }
      const obj = await env.PODFY_BUCKET.get(row.cover_image_key);
      if (!obj) return new Response("Not found", { status: 404 });
      return new Response(obj.body, {
        headers: {
          "content-type": obj.httpMetadata?.contentType || "image/jpeg",
          "cache-control": "public, max-age=86400",
        },
      });
    }

    if (method === "GET" && route[0] === "repo") {
      // PUBLIC items only — subscriber/group items are never listed on the site
      const { results = [] } = await env.DB.prepare(
        `SELECT item_id, title, description, mime_type, file_size, created_at
         FROM repository_items WHERE published = 1 AND access_level = 'public'
         ORDER BY created_at DESC LIMIT 50`
      ).all();
      return json({ ok: true, items: results });
    }

    if (method === "GET" && route[0] === "file" && route[1]) {
      const row = await env.DB.prepare(
        `SELECT file_key, mime_type FROM repository_items
         WHERE item_id = ? AND published = 1 AND access_level = 'public'`
      ).bind(route[1]).first();
      if (!row) return new Response("Not found", { status: 404 });
      // Serve ONLY the marketing/ prefix — never POD files
      if (!row.file_key.startsWith("marketing/")) return new Response("Not found", { status: 404 });
      const obj = await env.PODFY_BUCKET.get(row.file_key);
      if (!obj) return new Response("Not found", { status: 404 });
      return new Response(obj.body, {
        headers: {
          "content-type": row.mime_type || "application/octet-stream",
          "content-disposition": `inline; filename="${row.file_key.split("/").pop()}"`,
          "cache-control": "public, max-age=3600",
        },
      });
    }

    if (method === "POST" && route[0] === "subscribe") {
      return handleSubscribe(request, env);
    }

    return json({ ok: false, error: "not_found" }, 404);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

async function handleSubscribe(request, env) {
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return json({ ok: false, error: "Expected JSON." }, 415);
  const body = await request.json().catch(() => null);
  if (!body) return json({ ok: false, error: "Invalid JSON." }, 400);

  const { email = "", lang = "en", consent, hp_sub = "", cf_turnstile_token = "" } = body;
  if (hp_sub && hp_sub.trim()) return json({ ok: true, skipped: true }); // honeypot
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "A valid email address is required." }, 400);
  if (consent !== true && consent !== "on") return json({ ok: false, error: "You must accept the privacy policy." }, 400);
  const language = ["nl", "de", "fr"].includes(lang) ? lang : "en";

  // Turnstile
  const secretKey = env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET || "";
  if (secretKey) {
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: cf_turnstile_token,
        remoteip: request.headers.get("cf-connecting-ip") || "",
      }),
    }).then(r => r.json()).catch(() => ({ success: false }));
    if (!verify.success) return json({ ok: false, error: "Verification failed. Please retry." }, 400);
  }

  const addr = email.trim().toLowerCase();
  const existing = await env.MAIN_DB.prepare(
    `SELECT id, newsletter, newsletter_confirmed_at, newsletter_token FROM brand_users
     WHERE slug = 'newsletter' AND lower(email) = ? AND deleted_at IS NULL`
  ).bind(addr).first();

  if (existing && existing.newsletter === 1 && existing.newsletter_confirmed_at) {
    return json({ ok: true, message: "already_subscribed" }); // soft success, no enumeration detail
  }

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  if (existing) {
    await env.MAIN_DB.prepare(
      `UPDATE brand_users SET newsletter = 1, newsletter_lang = ?, newsletter_token = ?,
         newsletter_confirmed_at = NULL, updated_at = datetime('now') WHERE id = ?`
    ).bind(language, token, existing.id).run();
  } else {
    // No operational access: 'newsletter' brand is starter (portal_access=0);
    // status 'paused' additionally blocks portal login outright.
    await env.MAIN_DB.prepare(
      `INSERT INTO brand_users (slug, email, role, status, newsletter, newsletter_lang, newsletter_token,
                                is_to, is_cc, is_bcc, invoice_to, invoice_cc, invoice_bcc)
       VALUES ('newsletter', ?, 'user', 'paused', 1, ?, ?, 0, 0, 0, 0, 0, 0)`
    ).bind(addr, language, token).run();
  }

  // Double opt-in confirmation email (per language)
  const confirmUrl = `https://podfy.net/insights/confirm?token=${token}`;
  const STRINGS = {
    en: { subject: "Confirm your Podfy newsletter subscription", btn: "Confirm subscription",
      body: "Click the button to confirm your subscription to Podfy market updates. If this wasn't you, no action is needed." },
    nl: { subject: "Bevestig je Podfy nieuwsbrief-inschrijving", btn: "Bevestig inschrijving",
      body: "Klik op de knop om je inschrijving voor Podfy market updates te bevestigen. Geen actie nodig als jij dit niet was." },
    de: { subject: "Bestätigen Sie Ihr Podfy Newsletter-Abonnement", btn: "Abonnement bestätigen",
      body: "Klicken Sie auf die Schaltfläche, um Ihr Abonnement der Podfy Market Updates zu bestätigen. Falls Sie das nicht waren, ist keine Aktion nötig." },
    fr: { subject: "Confirmez votre abonnement à la newsletter Podfy", btn: "Confirmer l'abonnement",
      body: "Cliquez sur le bouton pour confirmer votre abonnement aux market updates de Podfy. Si ce n'était pas vous, aucune action n'est requise." },
  };
  const { subject, btn, body: bodyTxt } = STRINGS[language] || STRINGS.en;
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Podfy <noreply@podfy.net>",
      to: [addr],
      subject,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <p>${bodyTxt}</p>
        <p style="margin:24px 0"><a href="${confirmUrl}" style="background:#0E1116;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none">${btn}</a></p>
        <p style="font-size:12px;color:#888">Podfy · podfy.net</p></div>`,
    }),
  });
  if (!sent.ok) return json({ ok: false, error: "Could not send confirmation email." }, 502);
  return json({ ok: true, message: "confirmation_sent" });
}
