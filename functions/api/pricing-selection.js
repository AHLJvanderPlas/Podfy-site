// functions/api/pricing-selection.js
//
// Handles POST from the pricing configurator and sends an email via Resend.
// Sends the configuration to the user and BCCs support@podfy.net.

import { buildPricingSelectionEmail } from "../email/pricingSelectionTemplate.js";

/**
 * Cloudflare Pages / Workers entrypoint
 */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response("Expected JSON body", { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    email,
    name,               // optional: can be null/undefined
    selectedPlan,
    upsellLabels,
    plansSnapshot,
    upsells,            // optional, for internal reference
    turnstileToken,     // optional: can be used for server-side Turnstile verification
  } = body || {};

  if (!email || !selectedPlan) {
    return new Response("Missing email or selection", { status: 400 });
  }

  // Optional: server-side Turnstile validation
  // if (env.TURNSTILE_SECRET && turnstileToken) {
  //   const ok = await verifyTurnstile(env.TURNSTILE_SECRET, turnstileToken, request);
  //   if (!ok) {
  //     return new Response("Turnstile validation failed", { status: 400 });
  //   }
  // }

  const { subject, html, text, to } = buildPricingSelectionEmail({
    email,
    name,
    selectedPlan,
    upsellLabels,
    plansSnapshot,
  });

  try {
    await sendEmailWithResend(env, {
      to,
      bcc: "support@podfy.net",
      subject,
      html,
      text,
    });

    // Optionally log upsells / payload to analytics or KV here

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Pricing selection mail error", err);
    return new Response("Error sending email", { status: 500 });
  }
}

// --- Resend helper ---------------------------------------------------------

async function sendEmailWithResend(env, { to, bcc, subject, html, text }) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const payload = {
    from: "PODFY <no-reply@podfy.net>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  };

  if (bcc) {
    payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error (${res.status}): ${body}`);
  }

  return res.json();
}

// --- Optional Turnstile verification ---------------------------------------
// You can uncomment this and wire TURNSTILE_SECRET in your env if you want
// server-side verification in addition to the client integration.

/*
async function verifyTurnstile(secret, token, request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) return false;

  const data = await resp.json();
  return !!data.success;
}
*/
