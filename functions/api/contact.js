// Cloudflare Pages Function for POST /api/contact
// Requires environment bindings:
// - RESEND_API_KEY     (secret from Resend)
// - TURNSTILE_SECRET   (secret key from Cloudflare Turnstile)
// - DB_SITE_FORM       (optional D1 binding for storing submissions)

export async function onRequestPost(context) {
  const { request, env } = context;

  // Helper to send JSON responses
  const json = (data, init = {}) =>
    new Response(JSON.stringify(data), {
      status: init.status || 200,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {})
      }
    });

  // Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const {
    name,
    email,
    company,
    message,
    consent,
    hp_contact,
    // Turnstile token coming from the form
    "cf-turnstile-response": turnstileToken
  } = body || {};

  // Honeypot: if filled, silently treat as spam
  if (hp_contact && String(hp_contact).trim() !== "") {
    // Do not reveal anything special to bots
    return json({ ok: true, spam: true });
  }

  // Basic validation
  if (!name || !email || !consent) {
    return json(
      { ok: false, error: "Name, email and consent are required." },
      { status: 400 }
    );
  }

  if (!turnstileToken) {
    return json(
      { ok: false, error: "Missing Turnstile token." },
      { status: 400 }
    );
  }

  // Verify Turnstile
  try {
    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("x-real-ip") ||
      "";

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: turnstileToken,
          remoteip: ip
        })
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      console.warn("Turnstile verification failed:", verifyData);
      return json(
        {
          ok: false,
          error:
            "Security check failed. Please wait a moment and try again."
        },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return json(
      {
        ok: false,
        error:
          "Security check failed. Please wait a moment and try again."
      },
      { status: 400 }
    );
  }

  // Optional: store in D1 if binding is configured
  try {
    if (env.DB_SITE_FORM) {
      const now = new Date().toISOString();
      await env.DB_SITE_FORM.prepare(
        `
        INSERT INTO Site_Form (
          created_at,
          name,
          email,
          company,
          message,
          consent
        ) VALUES (?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          now,
          name,
          email,
          company || "",
          message || "",
          consent ? 1 : 0
        )
        .run();
    }
  } catch (err) {
    console.error("D1 insert failed:", err);
    // Do not fail the whole request because of logging
  }

  // Send email via Resend
  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Podfy <support@podfy.net>",
        to: ["support@podfy.net"],
        subject: "New contact request from podfy.net",
        reply_to: email,
        html: `
          <h1>New contact request</h1>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company || "")}</p>
          <p><strong>Consent:</strong> ${consent ? "Yes" : "No"}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message || "").replace(/\n/g, "<br>")}</p>
        `
      })
    });

    if (!resendRes.ok) {
      const text = await resendRes.text();
      console.error("Resend error:", resendRes.status, text);
      return json(
        {
          ok: false,
          error:
            "We could not send the email right now. Please try again later."
        },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Resend exception:", err);
    return json(
      {
        ok: false,
        error:
          "We could not send the email right now. Please try again later."
      },
      { status: 502 }
    );
  }

  return json({ ok: true });
}

// Simple HTML-escaping helper
function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch])
  );
}
