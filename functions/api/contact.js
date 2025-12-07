// functions/api/contact.js
//
// Handles contact form submissions from the homepage.
// - Validates basic fields + honeypot.
// - Verifies Cloudflare Turnstile token.
// - Stores the submission in D1 (Site_Form table).
// - Sends an email via Resend.
// - Returns structured JSON so the frontend can show clear messages.

export async function onRequestPost({ request, env }) {
  const BD = env.BD; // D1 binding
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;

  // Helper to build JSON responses
  const json = (status, body) =>
    new Response(JSON.stringify(body, null, 2), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.error("contact: invalid JSON body", err);
    return json(400, {
      ok: false,
      code: "BAD_REQUEST",
      error: "Invalid JSON payload",
    });
  }

  const {
    name = "",
    email = "",
    company = "",
    message = "",
    hp_contact = "",
    consent,
    ["cf-turnstile-response"]: turnstileToken,
    page_path = "/",
  } = body;

  // 1) Honeypot – if filled out, pretend success but do nothing.
  if (hp_contact && hp_contact.trim() !== "") {
    console.warn("contact: honeypot triggered, ignoring submission");
    return json(200, {
      ok: true,
      honeypot: true,
      message: "Ignored honeypot submission.",
    });
  }

  // 2) Basic validation
  if (!name.trim() || !email.trim()) {
    return json(400, {
      ok: false,
      code: "MISSING_FIELDS",
      error: "Name and email are required.",
    });
  }

  if (!consent) {
    return json(400, {
      ok: false,
      code: "NO_CONSENT",
      error: "Privacy consent checkbox not ticked.",
    });
  }

  // 3) Turnstile verification (if configured)
  if (TURNSTILE_SECRET) {
    if (!turnstileToken) {
      console.warn("contact: missing Turnstile token");
      return json(400, {
        ok: false,
        code: "MISSING_TURNSTILE",
        error: "Missing Turnstile token.",
      });
    }

    try {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET,
            response: turnstileToken,
            // remoteip is optional in Workers
          }),
        }
      );

      const verifyJson = await verifyRes.json();
      console.log("contact: Turnstile verify result", verifyJson);

      if (!verifyJson.success) {
        return json(400, {
          ok: false,
          code: "TURNSTILE_FAILED",
          error: "Turnstile verification failed.",
          details: verifyJson["error-codes"] || null,
        });
      }
    } catch (err) {
      console.error("contact: error verifying Turnstile", err);
      return json(500, {
        ok: false,
        code: "TURNSTILE_ERROR",
        error: "Error contacting Turnstile.",
      });
    }
  } else {
    console.warn("contact: TURNSTILE_SECRET not set, skipping verification");
  }

  // 4) Insert into D1 (optional but recommended)
  try {
    if (BD) {
      await BD.prepare(
        `
        INSERT INTO Site_Form
          (created_at, name, email, company, message, page_path)
        VALUES
          (strftime('%Y-%m-%dT%H:%M:%fZ','now'), ?, ?, ?, ?, ?)
      `
      )
        .bind(name.trim(), email.trim(), company.trim(), message.trim(), page_path)
        .run();
    } else {
      console.warn("contact: no D1 binding (env.BD), skipping DB insert");
    }
  } catch (err) {
    console.error("contact: D1 insert failed", err);
    // Do not hard-fail the whole request if logging to DB fails
  }

  // 5) Send email via Resend
  if (!RESEND_API_KEY) {
    console.error("contact: RESEND_API_KEY missing");
    return json(500, {
      ok: false,
      code: "RESEND_MISSING_KEY",
      error: "Resend API key not configured.",
    });
  }

  const emailPayload = {
    from: "PODFY <info@podfy.net>", // make sure this domain/address is verified in Resend
    to: ["info@podfy.net"],
    subject: `PODFY contact form: ${name.trim()} (${email.trim()})`,
    reply_to: email.trim(),
    text: [
      "New contact form submission from podfy.net:",
      "",
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Company: ${company}`,
      `Page:    ${page_path}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  };

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendJson = await resendRes.json().catch(() => null);

    console.log(
      "contact: Resend response",
      resendRes.status,
      resendJson || "<no JSON>"
    );

    if (!resendRes.ok) {
      return json(resendRes.status, {
        ok: false,
        code: "RESEND_ERROR",
        error:
          (resendJson && (resendJson.message || resendJson.error)) ||
          "Resend API returned an error.",
        status: resendRes.status,
      });
    }
  } catch (err) {
    console.error("contact: network error calling Resend", err);
    return json(502, {
      ok: false,
      code: "RESEND_ERROR",
      error: "Network error calling Resend.",
    });
  }

  // 6) All good
  return json(200, {
    ok: true,
    code: "OK",
    message: "Contact form processed successfully.",
  });
}
