// functions/email/autoReplyTemplate.js
//
// Builds the auto-reply email (HTML + text) for the contact form.
// Used by functions/api/contact.js

const EMAIL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PODFY – Contact received</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F5F2EA;font-family:system-ui,-apple-system,BlinkMacSystemFont,’Segoe UI’,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#F5F2EA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px;background:#FBF9F3;border:1px solid #E4E2DC;border-radius:4px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="padding:14px 22px;border-bottom:1px solid #E4E2DC;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#0E1116;">PODFY</span>
                    <span style="font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:10px;letter-spacing:0.07em;text-transform:uppercase;color:#5A6473;margin-left:4px;">/ Contact</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <a href="https://podfy.net" style="font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:10px;color:#5A6473;text-decoration:none;letter-spacing:0.05em;">podfy.net</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px 22px 20px;color:#0E1116;">

              <h1 style="margin:0 0 6px;font-size:22px;font-weight:600;line-height:1.25;letter-spacing:-0.02em;color:#0E1116;">
                Hi {{name}},
              </h1>

              {{companyBlock}}

              <p style="margin:0 0 6px;font-size:14px;color:#0E1116;line-height:1.65;font-weight:600;">
                We’ve received your message about PODFY.
              </p>
              <p style="margin:0 0 22px;font-size:14px;color:#5A6473;line-height:1.65;">
                Thanks for reaching out. Your request is safely in our inbox and will be reviewed by a person, not a bot.
                We usually respond within one business day, often sooner.
              </p>

              <!-- STATUS CARD -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 22px;">
                <tr>
                  <td style="background:#EDE8DC;border:1px solid #E4E2DC;border-left:3px solid #D24A1F;border-radius:4px;padding:12px 14px;">
                    <p style="margin:0;font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:11px;color:#0E1116;line-height:1.6;">
                      <strong>Request received</strong> — We’ll get back to you as soon as we can.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- WHILE YOU WAIT -->
              <p style="margin:0 0 4px;font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#5A6473;">
                While you wait
              </p>
              <p style="margin:0 0 12px;font-size:13px;color:#5A6473;line-height:1.65;">
                Although we’ll respond shortly, you can already explore how PODFY simplifies Proof of Delivery for your operation:
              </p>

              <!-- FEATURE CARD -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 22px;">
                <tr>
                  <td style="background:#EDE8DC;border:1px solid #E4E2DC;border-left:3px solid #D24A1F;border-radius:4px;padding:12px 14px;">
                    <p style="margin:0 0 8px;font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#0E1116;">
                      What you can try today (no commitment)
                    </p>
                    <p style="margin:0 0 4px;font-size:12px;color:#5A6473;line-height:1.6;">· <strong style="color:#0E1116;">Free View · 60 days:</strong> instantly view recent PODs in the delivery portal.</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#5A6473;line-height:1.6;">· <strong style="color:#0E1116;">Magic link access:</strong> no passwords, no setup — open from your inbox.</p>
                    <p style="margin:0 0 8px;font-size:12px;color:#5A6473;line-height:1.6;">· <strong style="color:#0E1116;">Driver-friendly upload:</strong> CMR → photo → done. Zero friction.</p>
                    <p style="margin:0;font-size:12px;color:#5A6473;line-height:1.6;">These features help you evaluate PODFY before selecting a plan.</p>
                  </td>
                </tr>
              </table>

              <!-- CTAs -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 10px;">
                <tr>
                  <td style="background:#0E1116;border-radius:4px;padding-right:8px;">
                    <a href="https://podfy.net/free-tier-demo.html" style="display:inline-block;padding:11px 22px;color:#F5F2EA;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;">
                      FREE TIER DEMO
                    </a>
                  </td>
                  <td style="padding-left:0;">
                    <a href="https://podfy.app" style="display:inline-block;padding:10px 20px;color:#0E1116;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;border:1px solid #CFCBC0;border-radius:4px;">
                      SAMPLE UPLOAD
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px;">
                <tr>
                  <td>
                    <a href="https://podfy.net/pricing" style="display:inline-block;padding:10px 20px;color:#0E1116;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;border:1px solid #CFCBC0;border-radius:4px;">
                      EXPLORE PLANS
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:-14px 0 22px;font-size:11px;color:#5A6473;line-height:1.6;">
                Compare features and choose what fits your operation — from simple uploads to full delivery portal access.
              </p>

              <!-- HELP US PREPARE -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 22px;">
                <tr>
                  <td style="background:#EDE8DC;border:1px solid #E4E2DC;border-left:3px solid #D24A1F;border-radius:4px;padding:12px 14px;">
                    <p style="margin:0 0 8px;font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#0E1116;">
                      Help us prepare the best answer
                    </p>
                    <p style="margin:0 0 8px;font-size:12px;color:#5A6473;line-height:1.6;">If you’d like us to tailor our advice, simply reply to this email and share:</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#5A6473;line-height:1.6;">· Your typical POD volume per day or per week.</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#5A6473;line-height:1.6;">· If drivers are internal, partner-based, or a mix.</p>
                    <p style="margin:0;font-size:12px;color:#5A6473;line-height:1.6;">· Where PODs should end up (email, TMS/WMS, shared folders, etc.).</p>
                  </td>
                </tr>
              </table>

              <!-- MESSAGE ECHO -->
              <p style="margin:0 0 6px;font-size:12px;color:#5A6473;">
                Your message (for reference):
              </p>
              <p style="margin:0;white-space:pre-wrap;">
                <span style="display:block;padding:9px 11px;background:#EDE8DC;border:1px solid #CFCBC0;border-radius:4px;font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:11px;color:#0E1116;word-break:break-word;line-height:1.5;">{{message}}</span>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:12px 22px 16px;background:#EDE8DC;border-top:1px solid #E4E2DC;">
              <p style="margin:0 0 4px;font-size:11px;color:#5A6473;line-height:1.6;">
                You received this email because you contacted us via
                <a href="https://podfy.net" style="color:#5A6473;">podfy.net</a>.
              </p>
              <p style="margin:0 0 4px;font-size:11px;color:#5A6473;line-height:1.6;">
                <a href="https://podfy.net/privacy.html" style="color:#5A6473;">Privacy &amp; Terms</a>
                &nbsp;·&nbsp;
                <a href="mailto:support@podfy.net" style="color:#5A6473;">support@podfy.net</a>
              </p>
              <p style="margin:0;font-family:SFMono-Regular,Menlo,Consolas,’Courier New’,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.07em;color:#8A8278;">
                © ${new Date().getFullYear()} PODFY · Zero-friction POD capture.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// --- PUBLIC API ---

export function buildAutoReply({ name, email, company, message }) {
  const safeName = (name || "").trim() || "there";
  const safeCompany = (company || "").trim();
  const safeMessage = (message || "").trim();

  const companyBlock = safeCompany
    ? `<p style="margin:0 0 14px;font-size:13px;color:#5A6473;line-height:1.4;">Company: <strong style="color:#0E1116;">${escapeHtml(safeCompany)}</strong></p>`
    : "";

  const html = EMAIL_HTML_TEMPLATE
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

// --- TEXT VERSION ---

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

// --- ESCAPE ---

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return ch;
    }
  });
}
