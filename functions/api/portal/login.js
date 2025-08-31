// functions/api/portal/login.js
// Hard-coded login (no slug). Returns explicit error reasons.

import { createSessionCookie, json, badrequest } from "./_utils";

// Hard-coded credentials
const HARDCODED_EMAIL = "ahlj.vd.plas@gmail.com";
const HARDCODED_PASSWORD = "Rodenrijselaan10a!";

function error(status, code, message, extra = {}) {
  return json({ error: message, code, ...extra }, { status });
}

export async function onRequestPost({ request, env }) {
  const secret = env.PORTAL_SESSION_SECRET;
  if (!secret) {
    return error(500, "missing_secret", "PORTAL_SESSION_SECRET is not set on the server");
  }

  let body = null;
  try {
    body = await request.json();
  } catch {
    return error(400, "invalid_json", "Request body must be valid JSON with fields: email, password");
  }

  const missing = [];
  const emailIn = body?.email;
  const passwordIn = body?.password;
  if (!emailIn) missing.push("email");
  if (!passwordIn) missing.push("password");
  if (missing.length) {
    return error(400, "missing_fields", "Missing required fields", { missing });
  }

  const email = String(emailIn).trim().toLowerCase();
  const password = String(passwordIn);

  if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
    return error(401, "invalid_credentials", "Email or password is incorrect", {
      hint: "Ensure the email matches exactly and the password is typed correctly"
    });
  }

  // No slug in the session; show all after login
  const payload = { email, scope: "all" };

  try {
    const setCookie = await createSessionCookie(payload, secret);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Set-Cookie": setCookie },
      status: 200
    });
  } catch (e) {
    return error(500, "session_create_failed", "Failed to create session cookie", {
      details: String(e?.message || e || "unknown")
    });
  }
}
