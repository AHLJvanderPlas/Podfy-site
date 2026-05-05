// functions/api/subscribe.js
//
// Handles changelog email subscription:
// - Verifies Cloudflare Turnstile
// - Stores subscription in D1 (Site_Form, sector = 'changelog-subscription')
// - Sends internal notification email via Resend
// Returns JSON { ok, message }

export const onRequestPost = async (context) => {
  const { request, env } = context;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ ok: false, error: "Expected JSON." }, 415);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }

    const {
      name = "",
      email = "",
      hp_sub = "",
      cf_turnstile_token = "",
    } = body;

    // Honeypot
    if (hp_sub && hp_sub.trim().length > 0) {
      return json({ ok: true, skipped: true });
    }

    if (!email || !email.includes("@")) {
      return json({ ok: false, error: "A valid email address is required." }, 400);
    }

    // ---------- Turnstile ----------
    const secretKey = env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET || "";
    if (!secretKey) {
      return json({ ok: false, error: "Turnstile not configured." }, 500);
    }

    const token = cf_turnstile_token || body.turnstileToken || "";
    if (!token) {
      return json({ ok: false, error: "Missing Turnstile token." }, 400);
    }

    const ip = request.headers.get("cf-connecting-ip") || "";
    const tsRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: secretKey, response: token, remoteip: ip }),
      }
    );
    const tsJson = await tsRes.json().catch(() => ({}));
    if (!tsJson.success) {
      return json({ ok: false, error: "Security check failed. Please try again." }, 400);
    }

    // ---------- D1 insert ----------
    try {
      const db = env.DB;
      if (db) {
        const now = new Date().toISOString();
        const ua = request.headers.get("user-agent") || "";
        await db
          .prepare(
            `INSERT INTO Site_Form
              (name, email, company, sector, message, consent,
               hp_contact, turnstile_score, user_agent, ip,
               source_path, created, first_response, status, created_at)
             VALUES (?1,?2,?3,?4,?5,1,?6,?7,?8,?9,?10,?11,NULL,'new',?11)`
          )
          .bind(
            name.trim() || "Subscriber",
            email.trim().toLowerCase(),
            "",
            "changelog-subscription",
            "",
            "",
            typeof tsJson.score === "number" ? tsJson.score : null,
            ua,
            ip,
            "/changelog",
            now
          )
          .run();
      }
    } catch (err) {
      console.error("subscribe: D1 insert failed:", err);
      // Continue — don't fail the request over a DB error
    }

    // ---------- Internal notification ----------
    const apiKey = env.RESEND_API_KEY;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PODFY <support@podfy.net>",
          to: ["support@podfy.net"],
          subject: "New changelog subscriber — podfy.net",
          text: [
            "New changelog subscription from podfy.net",
            "",
            `Name:  ${name || "(not provided)"}`,
            `Email: ${email}`,
            `IP:    ${ip}`,
            `Time:  ${new Date().toISOString()}`,
          ].join("\n"),
        }),
      }).catch((e) => console.error("subscribe: Resend notify failed:", e));
    }

    return json({ ok: true, message: "Subscribed." });
  } catch (err) {
    console.error("subscribe: unexpected error:", err);
    return json({ ok: false, error: "Unexpected server error." }, 500);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
