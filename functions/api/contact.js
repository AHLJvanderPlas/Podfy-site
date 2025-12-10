// functions/api/contact.js
//
// Cloudflare Pages Function handling the contact form:
// - Validates input
// - Verifies Cloudflare Turnstile
// - Stores submission in D1 (table: Site_Form)
// - Sends a branded auto-reply via Resend (to user, BCC to support)
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
//   "turnstileToken": "…"     // from front-end
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

    // ---------- Send branded auto-reply via Resend ----------
    let emailError = null;
    try {
      const apiKey = env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn("contact: RESEND_API_KEY not configured, skipping email");
      } else {
        const { subject, html, text } = buildAutoReply({
          name,
          email,
          company,
          message,
        });

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "PODFY <support@podfy.net>",
            to: [email],                 // send to customer
            bcc: ["support@podfy.net"],  // internal copy
            reply_to: ["support@podfy.net"],
            subject,
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

// ---------- Auto-reply template (HTML + text) ----------

// Full HTML template with {{name}}, {{companyBlock}}, {{message}} tokens.
// Uses inline styles for email client compatibility.
const EMAIL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PODFY – Contact received</title>
</head>

<body style="margin:0; padding:0; background:#020617;">
<center style="width:100%; background:#020617;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:32px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">

        <!-- Main card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:680px; background:#0b1220; border-radius:18px; border:1px solid #1e293b; box-shadow:0 10px 32px rgba(15,23,42,0.7);">

          <!-- HEADER -->
          <tr>
            <td style="padding:20px 28px 14px 28px;">
              <table role="presentation" width="100%">
                <tr>
                  <td valign="middle" align="left" style="font-family:Arial, sans-serif;">

                    <!-- Fallback PNG for Outlook -->
                    <!--[if mso]>
                    <img src="https://podfy.net/assets/podfy-logo-light.png"
                         width="96" height="24"
                         alt="PODFY"
                         style="display:block; border:0; margin-bottom:6px;" />
                    <![endif]-->

                    <!-- Inline SVG for modern clients -->
                    <!--[if !mso]><!-->
                    <svg width="96" height="24" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"
                         aria-label="PODFY" style="display:block; margin-bottom:6px;">
                      <rect width="120" height="30" rx="6" ry="6" fill="none"/>
                      <text x="0" y="21"
                            font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
                            font-size="18" font-weight="700" fill="#9ca3af">
                        PODFY
                      </text>
                    </svg>
                    <!--<![endif]-->

                    <span style="display:block; font-size:12px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#94a3b8;">
                      Zero-friction Proof of Delivery
                    </span>

                  </td>
                  <td valign="middle" align="right"
                      style="font-family:Arial, sans-serif; font-size:12px; color:#64748b;">
                    podfy.net
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="
              padding:24px 28px;
              background:#020617;
              background-image:linear-gradient(135deg, rgba(37,99,235,0.35), rgba(15,23,42,0.95));
              border-top:1px solid #1e293b;
              border-bottom:1px solid #1e293b;
            ">

              <p style="margin:0 0 10px 0; font-family:Arial, sans-serif; font-size:15px; color:#e5e7eb;">
                Hi <span style="color:#38bdf8; font-weight:bold;">{{name}}</span>,
              </p>

              {{companyBlock}}

              <h1 style="margin:0 0 10px 0; font-family:Arial, sans-serif; font-weight:700; font-size:24px; line-height:1.3; color:#f9fafb;">
                We’ve received your message about PODFY.
              </h1>

              <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; line-height:1.7; color:#cbd5e1;">
                Thanks for reaching out. Your request is safely in our inbox and will be reviewed by a person, not a bot.
                We usually respond within one business day, often sooner.
              </p>

            </td>
          </tr>

          <!-- STATUS PILL -->
          <tr>
            <td style="padding:18px 28px 8px 28px;">
              <table role="presentation">
                <tr>
                  <td style="
                    padding:9px 18px;
                    border-radius:999px;
                    border:1px solid #1d4ed8;
                    background:#020617;
                    font-family:Arial, sans-serif;
                    font-size:12px;
                    color:#bfdbfe;
                  ">
                    <span style="display:inline-block; width:9px; height:9px; background:#38bdf8; border-radius:999px; margin-right:8px;"></span>
                    <strong style="color:#e5e7eb;">We have received your request</strong>
                    &nbsp;· We’ll get back to you as soon as we can.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WHILE YOU WAIT -->
          <tr>
            <td style="padding:8px 28px 4px 28px;">
              <p style="margin:0 0 6px 0; font-family:Arial, sans-serif; font-size:12px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">
                While you wait
              </p>
              <p style="margin:0 0 14px 0; font-family:Arial, sans-serif; font-size:14px; line-height:1.6; color:#cbd5e1;">
                Although we’ll respond shortly, you can already explore how PODFY simplifies Proof of Delivery for your operation:
              </p>
            </td>
          </tr>

          <!-- FEATURE PANEL -->
          <tr>
            <td style="padding:0 28px 18px 28px;">
              <table role="presentation" width="100%" style="background:#020617; border-radius:14px; border:1px solid #1f2937;">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 8px 0; font-family:Arial, sans-serif; font-size:13px; color:#e5e7eb; font-weight:600;">
                      What you can try today (no commitment)
                    </p>
                    <ul style="margin:0 0 8px 18px; padding:0; font-family:Arial, sans-serif; font-size:13px; line-height:1.6; color:#94a3b8;">
                      <li><strong style="color:#e5e7eb;">Free View · 60 days:</strong> instantly view recent PODs in the delivery portal.</li>
                      <li><strong style="color:#e5e7eb;">Magic link access:</strong> no passwords, no setup — open from your inbox.</li>
                      <li><strong style="color:#e5e7eb;">Driver-friendly upload:</strong> CMR ⇒ photo ⇒ done. Zero friction.</li>
                    </ul>
                    <p style="margin:0; font-family:Arial, sans-serif; font-size:13px; color:#9ca3af;">
                      These features help you evaluate PODFY before selecting a plan.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRIMARY CTAs -->
          <tr>
            <td style="padding:4px 28px 10px 28px;">
              <table role="presentation">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="https://podfy.net/free-tier-demo.html"
                       style="display:inline-block; padding:11px 20px; background:#2563eb; border-radius:999px; color:#ffffff; font-family:Arial, sans-serif; font-size:13px; font-weight:600; text-decoration:none;">
                      Try the free-tier demo
                    </a>
                  </td>

                  <td>
                    <a href="https://podfy.app"
                       style="display:inline-block; padding:11px 20px; background:#020617; border:1px solid #38bdf8; border-radius:999px; color:#e5e7eb; font-family:Arial, sans-serif; font-size:13px; font-weight:500; text-decoration:none;">
                      Try a sample upload
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRICING CTA -->
          <tr>
            <td style="padding:0 28px 20px 28px;">
              <a href="https://podfy.net/pricing"
                 style="display:inline-block; padding:11px 20px; background:#1e293b; border-radius:999px; border:1px solid #334155; color:#e2e8f0; font-family:Arial, sans-serif; font-size:13px; font-weight:600; text-decoration:none;">
                Explore plans that match your needs
              </a>
              <p style="margin:8px 0 0 0; font-family:Arial, sans-serif; font-size:12px; color:#64748b;">
                Compare features and choose what fits your operation — from simple uploads to full delivery portal access.
              </p>
            </td>
          </tr>

          <!-- HELP US PREPARE -->
          <tr>
            <td style="padding:0 28px 18px 28px;">
              <p style="margin:0 0 6px 0; font-family:Arial, sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; color:#64748b;">
                Help us prepare the best answer
              </p>
              <p style="margin:0 0 10px 0; font-family:Arial, sans-serif; font-size:14px; line-height:1.6; color:#cbd5e1;">
                If you'd like us to tailor our advice, simply reply to this email and share:
              </p>
              <ul style="margin:0 0 0 18px; padding:0; font-family:Arial, sans-serif; font-size:13px; line-height:1.6; color:#94a3b8;">
                <li>Your typical POD volume per day or per week.</li>
                <li>If drivers are internal, partner-based, or a mix.</li>
                <li>Where PODs should end up (email, TMS/WMS, shared folders, etc.).</li>
              </ul>
            </td>
          </tr>

          <!-- MESSAGE ECHO -->
          <tr>
            <td style="padding:6px 28px 24px 28px;">
              <table role="presentation" width="100%" style="background:#020617; border-radius:12px; border:1px solid #1f2937;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 6px 0; font-family:Arial, sans-serif; font-size:13px; color:#9ca3af;">
                      <strong style="color:#e5e7eb;">Your message</strong> (for reference):
                    </p>
                    <p style="margin:0; white-space:pre-wrap; font-family:Arial, sans-serif; font-size:13px; line-height:1.6; color:#94a3b8;">
                      {{message}}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:0 28px 26px 28px;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="border-top:1px solid #1e293b; padding-top:12px;
                             font-family:Arial, sans-serif; font-size:11px; line-height:1.6; color:#6b7280;">

                    <p style="margin:0 0 4px 0;">
                      You received this email because you contacted us via
                      <a href="https://podfy.net" style="color:#93c5fd; text-decoration:none;">podfy.net</a>.
                    </p>

                    <p style="margin:0 0 4px 0;">PODFY – Proof of Delivery, without the headaches.</p>

                    <p style="margin:0;">
                      <a href="https://podfy.net/privacy.html" style="color:#6b7280; text-decoration:none;">Privacy & Terms</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:support@podfy.net" style="color:#6b7280; text-decoration:none;">support@podfy.net</a>
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End main card -->

      </td>
    </tr>
  </table>

</center>
</body>
</html>`;

// Build HTML + text + subject for the auto-reply
function buildAutoReply({ name, email, company, message }) {
  const safeName = (name || "").trim() || "there";
  const safeCompany = (company || "").trim();
  const safeMessage = (message || "").trim();

  const companyBlock = safeCompany
    ? `<p style="margin:0 0 14px 0; font-family:Arial, sans-serif; font-size:13px; color:#94a3b8; line-height:1.4;">
         <span style="color:#64748b;">Company:</span>
         <span style="color:#cbd5e1; font-weight:600;">${escapeHtml(safeCompany)}</span>
       </p>`
    : "";

  let html = EMAIL_HTML_TEMPLATE
    .replace(/{{name}}/g, escapeHtml(safeName))
    .replace("{{companyBlock}}", companyBlock)
    .replace("{{message}}", escapeHtml(safeMessage));

  const text = buildTextAutoReply({
    name: safeName,
    email,
    company: safeCompany,
    message: safeMessage,
  });

  const subjectBase = "We received your message";
  const subject = safeCompany
    ? `${subjectBase} from ${safeCompany}`
    : subjectBase;

  return { subject, html, text };
}

// Plain-text fallback for clients that don't render HTML
function buildTextAutoReply({ name, company, message }) {
  return [
    `Hi ${name},`,
    "",
    company ? `Company: ${company}` : "",
    "We’ve received your message about PODFY.",
    "",
    "Thanks for reaching out. Your request is safely in our inbox and will be reviewed by a person, not a bot.",
    "We usually respond within one business day, often sooner.",
    "",
    "While you wait, you can:",
    "- Try the free-tier demo: https://podfy.net/free-tier-demo.html",
    "- Try a sample upload: https://podfy.app",
    "- Explore plans: https://podfy.net/pricing",
    "",
    "Your message (for reference):",
    message || "(no message provided)",
    "",
    "PODFY – Proof of Delivery, without the headaches.",
    "https://podfy.net",
  ]
    .filter(Boolean)
    .join("\n");
}

// Basic HTML escaping for safe injection
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
