// functions/api/contact.js
//
// Handles PODFY contact form submissions:
// - Validates input + consent + honeypot
// - Verifies Cloudflare Turnstile
// - Stores submission in D1 (table: Site_Form)
// - Sends internal notification email via Resend
// - Sends rich auto-reply using functions/email/autoReplyTemplate.js,
//   with support@podfy.net in BCC.

import { buildAutoReply } from "../email/autoReplyTemplate.js";

export const onRequestPost = async (context) => {
  const { request, env } = context;

  try {
    // ---------- Parse & validate content type ----------
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json(
        { ok: false, error: "Unsupported content type. Expected JSON." },
        415
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }

    // ---------- Extract fields from JSON ----------
    const {
      name = "",
      email = "",
      company = "",
      sector = "",
      message = "",
      consent,
      hp_contact = "",
      cf_turnstile_token = "",
    } = body;

    // Honeypot check (bot trap)
    if (hp_contact && hp_contact.trim().length > 0) {
      // Treat as a "success" but skip everything else
      return json({ ok: true, skipped: true });
    }

    // Basic required fields
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

    // Accept multiple possible token field names to be robust
    const turnstileToken =
      cf_turnstile_token ||
      body.turnstileToken ||
      body["cf-turnstile-response"] ||
      "";

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
      const db = env.DB; // D1 binding name in Cloudflare Pages
      if (db) {
        const ua = request.headers.get("user-agent") || "";
        const path = new URL(request.url).pathname;
        const now = new Date().toISOString();

        await db
          .prepare(
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
            now                                          // ?15 created_at
          )
          .run();
      } else {
        console.warn("contact: env.DB (D1) not configured, skipping DB write");
      }
    } catch (err) {
      console.error("contact: D1 insert failed:", err);
      dbError = err;
    }

    // ---------- Send emails via Resend ----------
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("contact: RESEND_API_KEY not configured, skipping email");
      // We still consider the request "ok", but with a warning.
      return json({
        ok: true,
        message:
          "Contact request stored, but email service is not configured.",
        dbStored: !dbError,
        emailSent: false,
      });
    }

    let emailError = null;

    // Internal notification email
    try {
      const internalHtml = buildInternalHtmlEmail({
        name,
        email,
        company,
        sector,
        message,
      });
      const internalText = buildInternalTextEmail({
        name,
        email,
        company,
        sector,
        message,
      });

      const internalRes = await fetch("https://api.resend.com/emails", {
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
          html: internalHtml,
          text: internalText,
          tags: [{ name: "source", value: "podfy-site-contact" }],
        }),
      });

      if (!internalRes.ok) {
        const body = await safeJson(internalRes);
        console.error(
          "contact: Resend internal error:",
          internalRes.status,
          body
        );
        emailError = new Error(
          `Resend internal error ${internalRes.status}: ${JSON.stringify(
            body
          )}`
        );
      }
    } catch (err) {
      console.error("contact: Resend internal request failed:", err);
      emailError = err;
    }

    // Auto-reply to user (only try if we still have a valid email)
    if (!emailError && email) {
      try {
        // Use the shared template module
        const { subject, html, text } = buildAutoReply({
          name,
          email,
          company,
          message,
        });

        const autoRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "PODFY <support@podfy.net>",
            to: [email],
            bcc: ["support@podfy.net"],
            reply_to: ["support@podfy.net"],
            subject,
            html,
            text,
            tags: [{ name: "type", value: "podfy-auto-reply" }],
          }),
        });

        if (!autoRes.ok) {
          const body = await safeJson(autoRes);
          console.error(
            "contact: Resend auto-reply error:",
            autoRes.status,
            body
          );
          emailError = new Error(
            `Resend auto-reply error ${autoRes.status}: ${JSON.stringify(
              body
            )}`
          );
        }
      } catch (err) {
        console.error("contact: Resend auto-reply request failed:", err);
        emailError = err;
      }
    }

    if (emailError) {
      return json(
        {
          ok: false,
          error:
            "We could not send the email right now. Please try again later.",
          dbStored: !dbError,
        },
        502
      );
    }

    // ---------- Success ----------
    return json({
      ok: true,
      message: "Contact request received.",
      dbStored: !dbError,
      emailSent: true,
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
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}

// Internal notification email (HTML)
function buildInternalHtmlEmail({ name, email, company, sector, message }) {
  const esc = escapeHtml;
  return `
    <h2>New contact request from podfy.net</h2>
    <p><strong>Name:</strong> ${esc(name || "")}</p>
    <p><strong>Email:</strong> ${esc(email || "")}</p>
    <p><strong>Company:</strong> ${esc(company || "")}</p>
    <p><strong>Sector:</strong> ${esc(sector || "")}</p>
    <p><strong>Message:</strong></p>
    <p>${esc(message || "").replace(/\n/g, "<br />")}</p>
  `;
}

// Internal notification email (plain-text fallback)
function buildInternalTextEmail({ name, email, company, sector, message }) {
  return [
    "New contact request from podfy.net",
    "",
    `Name: ${name || ""}`,
    `Email: ${email || ""}`,
    `Company: ${company || ""}`,
    `Sector: ${sector || ""}`,
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
