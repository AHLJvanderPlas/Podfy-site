// functions/api/contact.js
//
// Handles POST /api/contact
// - Honeypot check
// - Cloudflare Turnstile verification
// - Stores submission into D1 (Site_Form)
// - Sends email via Resend to support@podfy.net

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json().catch(() => ({}));

    const {
      name = "",
      email = "",
      company = "",
      message = "",
      hp_contact = "",   // honeypot
      page_path = "/"    // optional, set by frontend
    } = data;

    const ip = request.headers.get("CF-Connecting-IP") || "";
    const userAgent = request.headers.get("User-Agent") || "";

    // 1) Honeypot: if "website" is filled, silently accept but do nothing else
    if (hp_contact && hp_contact.trim() !== "") {
      return jsonResponse({ ok: true, code: "HONEYPOT_TRIGGERED" });
    }

    // 2) Basic validation
    if (!name.trim() || !email.trim()) {
      return errorResponse("MISSING_FIELDS", "Missing name or email", 400);
    }

    // 3) Turnstile verification
    const turnstileToken =
      data["cf-turnstile-response"] ||
      data["cf_turnstile_response"] ||
      data.turnstileToken ||
      "";

    if (!turnstileToken) {
      return errorResponse("MISSING_TURNSTILE", "Missing Turnstile token", 400);
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
      return errorResponse("TURNSTILE_FAILED", "Turnstile validation failed", 400);
    }

    // 4) Store in D1 (Site_Form)
    try {
      const db = env.BD; // adjust if your binding name differs

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
      console.error("Site_Form insert failed:", dbErr);
      // We log the error but still continue with email sending
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
        to: ["support@podfy.net"],
        reply_to: email,
        subject,
        text: plainText,
        html
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      console.error("Resend error:", errText);
      return errorResponse("RESEND_ERROR", "Resend API error", 500);
    }

    // 6) Final OK
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("Unexpected /api/contact error:", err);
    return errorResponse("UNEXPECTED_ERROR", "Unexpected error", 500);
  }
}

// Helpers

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function errorResponse(code, message, status) {
  return jsonResponse({ ok: false, code, error: message }, status);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
