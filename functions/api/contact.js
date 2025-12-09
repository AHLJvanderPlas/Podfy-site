// functions/api/contact.js
//
// Cloudflare Pages Function handling the contact form:
// - Validates input
// - Verifies Cloudflare Turnstile
// - Stores submission in D1 (table: Site_Form)
// - Sends notification email via Resend
//
// Expected JSON body from the browser:
//
// {
//   "name": "...",
//   "email": "...",
//   "company": "...",
//   "message": "...",
//   "consent": true | "on",
//   "hp_contact": "",
//   "sector": "...",          // optional
//   "turnstileToken": "…"     // from hidden field
// }

export const onRequestPost = async (context) => {
  const { request, env } = context;

  try {
    // ---------- Parse request ----------
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json(
        { ok: false, error: "Unsupported content type" },
        415
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Invalid JSON body" }, 400);
    }

    const {
      name = "",
      email = "",
      company = "",
      message = "",
      consent,
      hp_contact = "",
      sector = "",
    } = body;

    // Accept multiple possible token field names, but front-end uses "turnstileToken"
    const turnstileToken =
      body.turnstileToken ||
      body.cf_turnstile_token ||
      body["cf-turnstile-response"] ||
      "";

    // ---------- Basic validation ----------
    if (hp_contact && hp_contact.trim().length > 0) {
      // Honeypot filled → very likely a bot
      return json({ ok: true, skipped: true });
    }

    if (!name || !email) {
      return json(
        { ok: false, error: "Name and email are required." },
        400
      );
    }

    if (consent !== true && consent !== "on") {
      return json(
        { ok: false, error: "You must accept the privacy policy." },
        400
      );
    }

    // ---------- Turnstile verification ----------
    const secretKey =
      env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET || "";

    if (!secretKey) {
      console.warn("contact: TURNSTILE_SECRET(_KEY) not configured");
      return json(
        { ok: false, error: "Turnstile is not configured server-side." },
        500
      );
    }

    if (!turnstileToken || typeof turnstileToken !== "string") {
      console.warn("contact: missing Turnstile token in request body");
      return json(
        { ok: false, error: "Missing Turnstile token." },
        400
      );
    }

    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "";

    const turnstileRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
          remoteip: ip,
        }),
      }
    );

    const turnstileJson = await turnstileRes.json().catch(() => ({}));

    if (!turnstileJson.success) {
      console.warn("Turnstile verification failed:", turnstileJson);
      return json(
        { ok: false, error: "Security check failed. Please try again." },
        400
      );
    }

    const score =
      typeof turnstileJson.score === "number"
        ? turnstileJson.score
        : null;

    // ---------- Store in D1 ----------
    let dbError = null;
    try {
      if (env.DB) {
        const ua = request.headers.get("user-agent") || "";
        const path = new URL(request.url).pathname;
        const now = new Date().toISOString();

        await env.DB.prepare(
          `INSERT INTO Site_Form
            (name,
             email,
             company,
             sector,
             message,
             consent,
             hp_contact,
             turnstile_score,
             user_agent,
             ip,
             source_path,
             created,
             first_response,
             status,
             created_at)
           VALUES (?1, ?2, ?3, ?4, ?5,
                   ?6, ?7, ?8, ?9, ?10,
                   ?11, ?12, ?13, ?14, ?15)`
        )
          .bind(
            name,                                        // ?1
            email,                                       // ?2
            company,                                     // ?3
            sector || null,                              // ?4
            message,                                     // ?5
            consent === true || consent === "on" ? 1 : 0,// ?6
            hp_contact,                                  // ?7
            score,                                       // ?8
            ua,                                          // ?9
            ip,                                          // ?10
            path,                                        // ?11
            now,                                         // ?12 created
            null,                                        // ?13 first_response
            "new",                                       // ?14 status
            now                                          // ?15 created_at (existing)
          )
          .run();
      } else {
        console.warn("contact: env.DB (D1) not configured, skipping DB write");
      }
    } catch (err) {
      console.error("contact: D1 insert failed:", err);
      dbError = err;
    }

    // ---------- Send email via Resend ----------
    let emailError = null;
    try {
      const apiKey = env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn("contact: RESEND_API_KEY not configured, skipping email");
      } else {
        const html = buildHtmlEmail({ name, email, company, message });
        const text = buildTextEmail({ name, email, company, message });

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "PODFY <support@podfy.net>",
            to: ["support@podfy.net"],
            reply_to: [email],
            subject: "New contact request from podfy.net",
            html,
            text,
            tags: [{ name: "source", value: "podfy-site-contact" }],
          }),
        });

        if (!resendRes.ok) {
          const body = await safeJson(resendRes);
          console.error("contact: Resend error:", resendRes.status, body);
          emailError = new Error(
            `Resend error ${resendRes.status}: ${JSON.stringify(body)}`
          );
        }
      }
    } catch (err) {
      console.error("contact: Resend request failed:", err);
      emailError = err;
    }

    if (emailError) {
      return json(
        {
          ok: false,
          error:
            "We could not send the email right now. Please try again later.",
        },
        502
      );
    }

    return json({
      ok: true,
      message: "Contact request received.",
      dbStored: !dbError,
    });
  } catch (err) {
    console.error("contact: unexpected error:", err);
    return json(
      { ok: false, error: "Unexpected server error." },
      500
    );
  }
};

// ---------- Helpers ----------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return await res.text().catch(() => null);
  }
}

function buildHtmlEmail({ name, email, company, message }) {
  const esc = escapeHtml;
  return `
    <h2>New contact request from podfy.net</h2>
    <p><strong>Name:</strong> ${esc(name || "")}</p>
    <p><strong>Email:</strong> ${esc(email || "")}</p>
    <p><strong>Company:</strong> ${esc(company || "")}</p>
    <p><strong>Message:</strong></p>
    <p>${esc(message || "").replace(/\n/g, "<br />")}</p>
  `;
}

function buildTextEmail({ name, email, company, message }) {
  return [
    "New contact request from podfy.net",
    "",
    `Name: ${name || ""}`,
    `Email: ${email || ""}`,
    `Company: ${company || ""}`,
    "",
    "Message:",
    message || "",
    "",
  ].join("\n");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}
