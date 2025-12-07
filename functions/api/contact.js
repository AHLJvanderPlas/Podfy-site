// functions/api/contact.js

export async function onRequestPost({ request, env, cf }) {
  try {
    const data = await request.json().catch(() => ({}));

    const {
      name = "",
      email = "",
      company = "",
      message = "",
      website = "" // honeypot
    } = data;

    // 1) Honeypot: if "website" is filled, silently return success
    if (website && website.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!email || !name) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing name or email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2) Turnstile verification
    const turnstileToken =
      data["cf-turnstile-response"] ||
      data["cf_turnstile_response"] ||
      data.turnstileToken ||
      "";

    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing Turnstile token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ip = request.headers.get("CF-Connecting-IP") || "";

    const formData = new URLSearchParams();
    formData.set("secret", env.TURNSTILE_SECRET);
    formData.set("response", turnstileToken);
    if (ip) formData.set("remoteip", ip);

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData
      }
    );

    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) {
      return new Response(
        JSON.stringify({ ok: false, error: "Turnstile validation failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3) Build email payload for Resend
    const subject = `[PODFY] Website enquiry from ${name}`;
    const plainText = `
Name: ${name}
Email: ${email}
Company: ${company || "-"}
IP: ${ip || "-"}

Message:
${message || "-"}
`.trim();

    const html = `
<h2>New website enquiry</h2>
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>
<p><strong>IP:</strong> ${escapeHtml(ip || "-")}</p>
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
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Resend API error",
          details: errText
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Minimal HTML-escape helper
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
