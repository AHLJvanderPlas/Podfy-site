// functions/api/contact.js
//
// Handles POST /api/contact
// - Honeypot check (website field)
// - Cloudflare Turnstile verification
// - Stores submission into D1 (Site_Form)
// - Sends email via Resend to info@podfy.net

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json().catch(() => ({}));

    const {
      name = "",
      email = "",
      company = "",
      message = "",
      website = "", // honeypot (should stay empty)
      page_path = "/" // optional, can be set from frontend later
    } = data;

    const ip = request.headers.get("CF-Connecting-IP") || "";
    const userAgent = request.headers.get("User-Agent") || "";

    // 1) Honeypot: if "website" is filled, treat as spam and short-circuit
    if (website && website.trim() !== "") {
      // We pretend everything is OK, but do not send email or write to DB.
      return jsonResponse({ ok: true });
    }

    // 2) Basic validation
    if (!name.trim() || !email.trim()) {
      return jsonResponse(
        { ok: false, error: "Missing name or email" },
        400
      );
    }

    // 3) Turnstile verification
    const turnstileToken =
      data["cf-turnstile-response"] ||
      data["cf_turnstile_response"] ||
      data.turnstileToken ||
      "";

    if (!turnstileToken) {
      return jsonResponse(
        { ok: false, error: "Missing Turnstile token" },
        400
      );
    }

    const verifyBody = new URLSearchParams();
    verifyBody.set("secret", env.TURNSTILE_SECRET);
    verifyBody.set("response", turnstileToken);
    if (ip) verifyBody.set("remoteip", ip);

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: verifyBody
      }
    );

    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) {
      return jsonResponse(
        { ok: false, error: "Turnstile validation failed" },
        400
      );
    }

    // 4) Store in D1 (Site_Form)
    try {
      const db = env.BD; // D1 binding (adjust if your binding name differs)

      await db
        .prepare(
          `
          INSERT INTO Site_Form (
            name,
            email,
            company,
            message,
            ip,
            user_agent,
            page_path
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        )
        .bind(
          name.trim(),
          email.trim(),
          company || "",
          message || "",
          ip,
          userAgent,
          page_path || "/"
        )
        .run();
    } catch (dbErr) {
      // Don't kill the request if DB insert fails; just log.
      console.error("Site_Form insert failed:", dbErr);
    }

    // 5) Send email via Resend
    const subject = `[PODFY] Website enquiry from ${name}`;
    const plainText = `
Name: ${name}
Email: ${email}
Company: ${company || "-"}
Page: ${page_path || "/"}
IP: ${ip || "-"}
User-Agent: ${userAgent || "-"}

Message:
${message || "-"}
`.trim();

    const html = `
<h2>New website enquiry</h2>
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>
<p><strong>Page:</strong> ${escapeHtml(page_path || "/")}</p>
<p><strong>IP:</strong> ${escapeHtml(ip || "-")}</p>
<p><strong>User-Agent:</strong> ${escapeHtml(userAgent || "-")}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(message || "-").replace(/\n/g, "<br>")}</p>
`.trim();

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "PODFY Website <no-reply@podfy.net>",
        to: ["info@podfy.net"],
        reply_to: email,
        subject,
        text: plainText,
        html
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      console.error("Resend error:", errText);
      // We still return 500 to the frontend so you can show a proper message.
      return jsonResponse(
        { ok: false, error: "Resend API error" },
        500
      );
    }

    // 6) Final OK
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("Unexpected /api/contact error:", err);
    return jsonResponse(
      { ok: false, error: "Unexpected error" },
      500
    );
  }
}

// Small helpers

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
