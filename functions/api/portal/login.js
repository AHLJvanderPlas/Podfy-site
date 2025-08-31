// functions/api/portal/login.js
// Robust handler: POST = login, OPTIONS allowed, all others -> explicit 405.

import { createSessionCookie, json } from "./_utils";

// Hard-coded credentials
const HARDCODED_EMAIL = "ahlj.vd.plas@gmail.com";
const HARDCODED_PASSWORD = "Rodenrijselaan10a!";

function err(status, code, message, extra = {}) {
  return json({ error: message, code, ...extra }, { status });
}

// --- Core login logic used by both exports ---
async function handlePost({ request, env }) {
  const secret = env.PORTAL_SESSION_SECRET;
  if (!secret) return err(500, "missing_secret", "PORTAL_SESSION_SECRET is not set on the server");

  let body;
  try { body = await request.json(); }
  catch { return err(400, "invalid_json", "Request body must be valid JSON with fields: email, password"); }

  const missing = [];
  const emailIn = body?.email;
  const passwordIn = body?.password;
  if (!emailIn) missing.push("email");
  if (!passwordIn) missing.push("password");
  if (missing.length) return err(400, "missing_fields", "Missing required fields", { missing });

  const email = String(emailIn).trim().toLowerCase();
  const password = String(passwordIn);

  if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
    return err(401, "invalid_credentials", "Email or password is incorrect", {
      hint: "Ensure the email matches exactly and the password is typed correctly"
    });
  }

  // No slug for now — show all
  const setCookie = await createSessionCookie({ email, scope: "all" }, secret);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": setCookie },
    status: 200,
  });
}

// Handle POST explicitly (preferred by Pages)
export async function onRequestPost(ctx) {
  try { return await handlePost(ctx); }
  catch (e) { return err(500, "unexpected_error", "Unhandled server error", { details: String(e?.message || e) }); }
}

// Allow CORS/preflight if a browser decides to preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Fallback for accidental GET/HEAD/etc. (prevents opaque 405s)
export async function onRequest(context) {
  const method = context.request.method || "GET";
  if (method.toUpperCase() === "POST") return onRequestPost(context);
  if (method.toUpperCase() === "OPTIONS") return onRequestOptions(context);
  return err(405, "method_not_allowed", `Use POST for /api/portal/login (got ${method})`, {
    allow: ["POST", "OPTIONS"],
  });
}
