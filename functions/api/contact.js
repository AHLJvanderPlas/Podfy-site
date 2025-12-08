// functions/api/contact.js

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) Safety: only accept JSON
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Unsupported content type." }, 415);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const {
    name = "",
    email = "",
    company = "",
    message = "",
    consent = false,
    turnstileToken,
  } = body;

  // 2) Basic validation
  if (!name.trim() || !email.trim() || !message.trim()) {
    return json(
      { ok: false, error: "Name, email and message are required." },
      400
    );
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Invalid email address." }, 400);
  }

  if (!consent) {
    return json(
      {
        ok: false,
        error: "Please confirm that we may contact you about your request.",
      },
      400
    );
  }

  // 3) Verify Turnstile
  try {
    const tsSecret = env.TURNSTILE_SECRET; // add this binding in Cloudflare
    if (!tsSecret) {
      console.warn("TURNSTILE_SECRET not set – skipping verification.");
    } else {
      const formData = new FormData();
      formData.append("secret", tsSecret);
      formData.append("response", turnstileToken || "");

      const tsRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body: formData }
      );
      const tsJson = await tsRes.json();

      if (!tsJson.success) {
        console.warn("Turnstile verification failed:", tsJson);
        return json(
          {
            ok: false,
            error: "Security check failed. Please reload the page and try again.",
          },
          400
        );
      }
    }
  } catch (err) {
    console.error("Turnstile error:", err);
    return json(
      {
        ok: false,
        error:
          "We could not complete the security check. Please wait a moment and try again.",
      },
      500
    );
  }

  // 4) Optionally store in D1 (adjust table/columns to your schema)
  try {
    if (env.SITE_FORM_DB) {
      await env.SITE_FORM_DB.prepare(
        `INSERT INTO Site_Form (name, email, company, message, consent, created_at)
         VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
      )
        .bind(
          name.trim(),
          email.trim(),
          company.trim(),
          message.trim(),
          consent ? 1 : 0
        )
        .run();
    }
  } catch (err) {
    console.error("D1 insert failed:", err);
    // continue anyway; the email is more important
  }

  // 5) Send email via Resend
  try {
    const apiKey = env.RESEND_API_KEY; // add this in Cloudflare
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set – skipping email send.");
    } else {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PODFY Website <support@podfy.net>",
          to: ["support@podfy.net"],
          reply_to: email.trim(),
          subject: `New website contact from ${name}`,
          text: buildPlainText({ name, email, company, message }),
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("Resend API error:", emailRes.status, errText);
        // Do not fail hard; just report a generic message
        return json(
          {
            ok: false,
            error:
              "We could not send the email right now. Please try again later.",
          },
          502
        );
      }
    }
  } catch (err) {
    console.error("Resend error:", err);
    return json(
      {
        ok: false,
        error:
          "We could not send the email right now. Please try again later.",
      },
      502
    );
  }

  // 6) All good
  return json({ ok: true });
}

// Helper: JSON response with status
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// Helper: plain-text email body
function buildPlainText({ name, email, company, message }) {
  return [
    "New PODFY website contact",
    "==========================",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Company: ${company || "-"}`,
    "",
    "Message:",
    message,
    "",
    "--",
    "Sent from podfy.net contact form",
  ].join("\n");
}
