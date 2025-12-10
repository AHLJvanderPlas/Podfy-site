// functions/email/pricingSelectionTemplate.js
//
// Builds the pricing configuration email (HTML + text) for the pricing form.
// Inspired by functions/email/autoReplyTemplate.js

const EMAIL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PODFY – Pricing configuration</title>

  <!-- Light/dark hint -->
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />

  <style>
    .logo-light { display: block; }
    .logo-dark { display: none; }

    @media (prefers-color-scheme: dark) {
      .logo-light { display: none !important; }
      .logo-dark { display: block !important; }
    }

    @media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
      .logo-light { display: block !important; }
      .logo-dark { display: none !important; }
    }

    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin:0; padding:0; background:#020617;">
<center style="width:100%; background:#020617;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:32px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:680px; background:#0b1220; border-radius:18px; border:1px solid #1e293b; box-shadow:0 10px 32px rgba(15,23,42,0.7);">

          <!-- HEADER -->
          <tr>
            <td style="padding:20px 28px 14px 28px;">
              <table role="presentation" width="100%">
                <tr>
                  <td valign="middle" align="left" style="font-family:Arial, sans-serif;">

                    <!--[if mso]>
                    <img src="https://podfy.net/assets/podfy-logo-light.png"
                         width="96" height="24"
                         alt="PODFY"
                         style="display:block; border:0; margin-bottom:6px;" />
                    <![endif]-->

                    <!--[if !mso]><!-->
                    <span style="display:inline-block; margin-bottom:6px;">
                      <!-- Light-mode logo -->
                      <svg class="logo-light"
                           xmlns="http://www.w3.org/2000/svg"
                           width="120" height="28"
                           viewBox="0 0 120 30"
                           aria-label="PODFY">
                        <rect width="120" height="30" rx="6" ry="6" fill="none" />
                        <text x="0" y="22"
                              font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
                              font-size="20"
                              font-weight="700"
                              fill="#1D3557">
                          PODFY
                        </text>
                      </svg>

                      <!-- Dark-mode logo -->
                      <svg class="logo-dark"
                           xmlns="http://www.w3.org/2000/svg"
                           width="120" height="28"
                           viewBox="0 0 120 30"
                           aria-label="PODFY">
                        <rect width="120" height="30" rx="6" ry="6" fill="none" />
                        <text x="0" y="22"
                              font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
                              font-size="20"
                              font-weight="700"
                              fill="#E5E7EB">
                          PODFY
                        </text>
                      </svg>
                    </span>
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

              <h1 style="margin:0 0 10px 0; font-family:Arial, sans-serif; font-weight:700; font-size:23px; line-height:1.3; color:#f9fafb;">
                Here’s your PODFY pricing configuration.
              </h1>

              <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; line-height:1.7; color:#cbd5e1;">
                Below is a snapshot of the plan and add-ons you selected in the pricing configurator.
                This is not a formal quote yet, but it gives us a clear starting point to tailor
                the final rate to your volumes and requirements.
              </p>

            </td>
          </tr>

          <!-- STATUS PILL -->
          <tr>
            <td style="padding:18px 28px 10px 28px;">
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
                    <span style="display:inline-block; width:9px; height:9px; background:#22c55e; border-radius:999px; margin-right:8px;"></span>
                    <strong style="color:#e5e7eb;">Configuration captured</strong>
                    &nbsp;· Fill in the form on podfy.net to get things running.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SELECTED PLAN SUMMARY -->
          <tr>
            <td style="padding:6px 28px 14px 28px;">
              <p style="margin:0 0 6px 0; font-family:Arial, sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; color:#64748b;">
                Your selection
              </p>
              <table role="presentation" width="100%"
                     style="background:#020617; border-radius:14px; border:1px solid #1f2937;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px 0; font-family:Arial, sans-serif; font-size:14px; color:#e5e7eb;">
                      <strong>Plan:</strong> {{planName}}
                    </p>
                    <p style="margin:0 0 4px 0; font-family:Arial, sans-serif; font-size:14px; color:#e5e7eb;">
                      <strong>Estimated rate:</strong> €{{pricePerPod}} per POD
                    </p>
                    <p style="margin:0 0 4px 0; font-family:Arial, sans-serif; font-size:13px; color:#e5e7eb;">
                      <strong>Retention setting:</strong> {{retention}}
                    </p>
                    <p style="margin:8px 0 4px 0; font-family:Arial, sans-serif; font-size:13px; color:#e5e7eb;">
                      <strong>Add-ons:</strong> {{upsellsList}}
                    </p>
                    <p style="margin:8px 0 0 0; font-family:Arial, sans-serif; font-size:12px; color:#9ca3af;">
                      Final pricing will be adjusted for volume, billing model and any integrations you need.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PLAN SNAPSHOT TABLE -->
          <tr>
            <td style="padding:0 28px 18px 28px;">
              <p style="margin:0 0 6px 0; font-family:Arial, sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; color:#64748b;">
                Plan comparison snapshot
              </p>
              {{plansTable}}
            </td>
          </tr>

          <!-- NEXT STEPS -->
          <tr>
            <td style="padding:0 28px 18px 28px;">
              <p style="margin:0 0 8px 0; font-family:Arial, sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; color:#64748b;">
                Next steps
              </p>
              <p style="margin:0 0 8px 0; font-family:Arial, sans-serif; font-size:13px; line-height:1.6; color:#cbd5e1;">
                When you are ready to move forward, please fill in the short form on the main PODFY page. This configuration
                email helps you explain which plan and options you prefer.
              </p>
              <ul style="margin:0 0 0 18px; padding:0; font-family:Arial, sans-serif; font-size:13px; line-height:1.6; color:#94a3b8;">
                <li>Go to <a href="https://podfy.net/#contact" style="color:#93c5fd; text-decoration:none;">podfy.net</a> and open the contact form.</li>
                <li>Mention this configuration (plan name, rate and add-ons) in your message.</li>
                <li>We will then prepare a tailored proposal based on your volumes and legal retention requirements.</li>
              </ul>
            </td>
          </tr>

          <!-- CTA BUTTONS -->
          <tr>
            <td style="padding:0 28px 22px 28px;">
              <table role="presentation">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="https://podfy.net/pricing"
                       style="display:inline-block; padding:11px 20px; background:#2563eb; border-radius:999px; color:#ffffff; font-family:Arial, sans-serif; font-size:13px; font-weight:600; text-decoration:none;">
                      Reopen the configurator
                    </a>
                  </td>

                  <td>
                    <a href="https://podfy.net/#contact"
                       style="display:inline-block; padding:11px 20px; background:#020617; border:1px solid #38bdf8; border-radius:999px; color:#e5e7eb; font-family:Arial, sans-serif; font-size:13px; font-weight:500; text-decoration:none;">
                      Fill in the main form
                    </a>
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
                      You received this email because you requested a pricing configuration on
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

      </td>
    </tr>
  </table>

</center>
</body>
</html>`;

// --- PUBLIC API ------------------------------------------------------------

export function buildPricingSelectionEmail({
  email,
  name,
  selectedPlan,
  upsellLabels,
  plansSnapshot,
}) {
  const safeName = (name || "").trim() || "there";
  const planName = selectedPlan?.name || selectedPlan?.id || "Unknown plan";
  const pricePerPod = Number(selectedPlan?.pricePerPod || 0).toFixed(2);
  const retention = selectedPlan?.retention || "N/A";

  const upsellsList = (upsellLabels && upsellLabels.length)
    ? upsellLabels.join(", ")
    : "None selected";

  const plansTableHtml = Array.isArray(plansSnapshot) && plansSnapshot.length
    ? buildPlansTable(plansSnapshot)
    : `<p style="margin:0; font-family:Arial, sans-serif; font-size:13px; color:#9ca3af;">
         No comparison snapshot was provided.
       </p>`;

  const html = EMAIL_HTML_TEMPLATE
    .replace(/{{name}}/g, escapeHtml(safeName))
    .replace(/{{planName}}/g, escapeHtml(planName))
    .replace(/{{pricePerPod}}/g, escapeHtml(pricePerPod))
    .replace(/{{retention}}/g, escapeHtml(retention))
    .replace(/{{upsellsList}}/g, escapeHtml(upsellsList))
    .replace("{{plansTable}}", plansTableHtml);

  const text = buildTextEmail({
    name: safeName,
    planName,
    pricePerPod,
    retention,
    upsellsList,
    plansSnapshot,
  });

  const subject = `Your PODFY pricing configuration – ${planName}`;

  return { subject, html, text, to: email };
}

// --- TEXT VERSION ----------------------------------------------------------

function buildTextEmail({ name, planName, pricePerPod, retention, upsellsList, plansSnapshot }) {
  const lines = [
    `Hi ${name},`,
    "",
    "Here’s your PODFY pricing configuration.",
    "",
    "This is not a binding quote, but a snapshot of what you selected in the pricing configurator.",
    "",
    "Selected plan:",
    `- Plan: ${planName}`,
    `- Estimated rate: €${pricePerPod} per POD`,
    `- Retention: ${retention}`,
    `- Add-ons: ${upsellsList}`,
    "",
    "Plan comparison snapshot:",
  ];

  if (Array.isArray(plansSnapshot) && plansSnapshot.length) {
    plansSnapshot.forEach((p) => {
      lines.push(
        `- ${p.name || p.id}: €${Number(p.pricePerPod || 0).toFixed(2)} per POD · Retention: ${p.retention || "N/A"}`
      );
    });
  } else {
    lines.push("- (no snapshot provided)");
  }

  lines.push(
    "",
    "Next steps:",
    "- We will review this configuration and contact you to confirm volumes and requirements.",
    "- You can reply to this email with your estimated POD volume or questions.",
    "",
    "Links:",
    "- Reopen configurator: https://podfy.net/pricing",
    "- Try the free portal: https://podfy.net/free-tier-demo.html",
    "",
    "PODFY – Proof of Delivery, without the headaches.",
    "https://podfy.net"
  );

  return lines.join("\n");
}

// --- HELPERS ----------------------------------------------------------------

function buildPlansTable(plansSnapshot) {
  const rows = plansSnapshot
    .map((p) => {
      const name = escapeHtml(p.name || p.id || "Unknown");
      const price = "€" + Number(p.pricePerPod || 0).toFixed(2);
      const retention = escapeHtml(p.retention || "N/A");

      return `
        <tr>
          <td style="padding:6px 8px; border-bottom:1px solid #111827; color:#e5e7eb;">${name}</td>
          <td style="padding:6px 8px; border-bottom:1px solid #111827; color:#e5e7eb;">${price}</td>
          <td style="padding:6px 8px; border-bottom:1px solid #111827; color:#e5e7eb;">${retention}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table role="presentation" width="100%"
           style="background:#020617; border-radius:14px; border:1px solid #1f2937; font-family:Arial, sans-serif; font-size:13px; color:#e5e7eb;">
      <thead>
        <tr>
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #111827; font-weight:600; color:#cbd5e1;">Plan</th>
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #111827; font-weight:600; color:#cbd5e1;">Rate per POD</th>
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #111827; font-weight:600; color:#cbd5e1;">Retention</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

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
