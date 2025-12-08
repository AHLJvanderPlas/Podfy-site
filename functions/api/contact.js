// functions/api/contact.js
//
// Handles contact form submissions from podfy.net
// - Validates fields + honeypot
// - Verifies Cloudflare Turnstile
// - Logs to D1 (optional)
// - Sends email via Resend -> support@podfy.net

export async function onRequestPost({ request, env }) {
  const BD = env.BD; // D1 binding (optional)
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;

  // Small helper to return JSON
  const json = (status, body) =>
    new Response(JSON.stringify(body, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  // 1) Basic safety: JSON only
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, {
      ok: false,
      code: "UNSUPPORTED_CONTENT_TYPE",
      error: "Expected application/json payload.",
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.error("contact: invalid JSON body", err);
    return json(400, {
      ok: false,
      code: "BAD_JSON",
      error: "Invalid JSON body.",
    });
  }

  // 2) Extract fields (with sensible defaults)
  const {
    name = "",
    email = "",
    company = "",
    message = "",
    hp_contact = "",
    consent,
    page_path = "/",
  } = body;

  // IMPORTANT: accept multiple possible Turnstile field names
  const turnstileToken =
    body["cf-turnstile-response"] ||
    body.turnstile_token ||
    body.turnstileToken ||
    "";

  // 3) Honeypot – if filled, pretend success but do nothing
  if (hp_contact && hp_contact.trim() !== "") {
    console.warn("contact: honeypot triggered, ignoring submission");
    return json(200, {
      ok: true,
      honeypot: true,
      message: "Ignored honeypot submission.",
    });
  }

  // 4) Basic validation (aligns with the form)
  if (!name.trim() || !email.trim()) {
    return json(400, {
      ok: false,
      code: "MISSING_FIELDS",
      error: "Name and email are required.",
    });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return json(400, {
      ok: false,
      code: "INVALID_EMAIL",
      error: "Please enter a valid email address.",
    });
  }

  if (!consent) {
    return json(400, {
      ok: false,
      code: "NO_CONSENT",
      error: "Please confirm that we may contact you about your request.",
    });
  }

  // 5) Turnstile verification (if configured)
  if (TURNSTILE_SECRET) {
    if (!turnstileToken) {
      console.warn("contact: missing Turnstile token in request body");
      return json(400, {
        ok: false,
        code: "MISSING_TURNSTILE",
        error: "Security check failed. Please reload the page and try again.",
      });
    }

    try {
      const params = new URLSearchParams();
      params.append("secret", TURNSTILE_SECRET);
      params.append("response", turnstileToken);

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const verifyJson = await verifyRes.json();
      console.log("contact: Turnstile verify result", verifyJson);

      if (!verifyJson.success) {
        return json(400, {
          ok: false,
          code: "TURNSTILE_FAILED",
          error:
            "Security check failed. Please reload the page and try again.",
          details: verifyJson["error-codes"] || null,
        });
      }
    } catch (err) {
      console.error("contact: error verifying Turnstile", err);
      return json(500, {
        ok: false,
        code: "TURNSTILE_ERROR",
        error:
          "We could not complete the security check. Please wait a moment and try again.",
      });
    }
  } else {
    console.warn("contact: TURNSTILE_SECRET not set – skipping verification");
  }

  // 6) Optional: log to D1
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
        .bind(
          name.trim(),
          email.trim(),
          company.trim(),
          message.trim(),
          page_path
        )
        .run();
    } else {
      console.warn("contact: env.BD not bound – skipping DB insert");
    }
  } catch (err) {
    console.error("contact: D1 insert failed", err);
    // Do not fail the whole request because of logging issues
  }

  // 7) Send email via Resend
  if (!RESEND_API_KEY) {
    console.error("contact: RESEND_API_KEY missing");
    return json(500, {
      ok: false,
      code: "RESEND_MISSING_KEY",
      error: "Email service is not configured.",
    });
  }

  const emailPayload = {
    from: "PODFY Website <support@podfy.net>", // make sure this is verified in Resend
    to: ["support@podfy.net"],
    reply_to: email.trim(),
    subject: `New website contact from ${name.trim()}`,
    text: [
      "New contact form submission from podfy.net:",
      "",
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Company: ${company || "-"}`,
      `Page:    ${page_path}`,
      "",
      "Message:",
      message || "(no message provided)",
      "",
      "--",
      "Sent from the podfy.net contact form",
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
          "We could not send the email right now. Please try again later.",
      });
    }
  } catch (err) {
    console.error("contact: network error calling Resend", err);
    return json(502, {
      ok: false,
      code: "RESEND_ERROR",
      error:
        "We could not send the email right now. Please try again later.",
    });
  }

  // 8) All good
  return json(200, {
    ok: true,
    code: "OK",
    message: "Contact form processed successfully.",
  });
}
