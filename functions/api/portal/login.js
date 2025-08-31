// functions/api/portal/login.js
// Cloudflare Pages Function – hard-coded login with explicit error reasons

import { createSessionCookie, json, badrequest } from "./_utils";

// Hard-coded credentials (as requested)
const HARDCODED_EMAIL = "ahlj.vd.plas@gmail.com";
const HARDCODED_PASSWORD = "Rodenrijselaan10a!";

function error(status, code, message, extra = {}) {
  return json({ error: message, code, ...extra }, { status });
}

export async function onRequestPost({ request, env }) {
  // 1) Required secret for signing the session cookie
  const secret = env.PORTAL_SESSION_SECRET;
  if (!secret) {
    // 500 because this is a server misconfiguration, not a client mistake
    return error(500, "missing_secret", "PORTAL_SESSION_SECRET is not set on the server");
  }

  // 2) Parse JSON body
  let body = null;
  try {
    body = await request.json();
  } catch {
    return error(400, "invalid_json", "Request body must be valid JSON with fields: email, password, slug");
  }

  // 3) Validate required fields
  const missing = [];
  const emailIn = body?.email;
  const passwordIn = body?.password;
  const slugIn = body?.slug;

  if (!emailIn) missing.push("email");
  if (!passwordIn) missing.push("password");
  if (!slugIn) missing.push("slug");

  if (missing.length) {
    return error(400, "missing_fields", "Missing required fields", { missing });
  }

  // 4) Normalization
  const email = String(emailIn).trim().toLowerCase();
  const password = String(passwordIn);
  const slug = String(slugIn).trim().toLowerCase();

  // 5) Credential check
  if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
    return error(401, "invalid_credentials", "Email or password is incorrect", {
      hint: "Ensure the email matches exactly and the password is typed correctly"
    });
  }

  // 6) Create signed session cookie
  try {
    const setCookie = await createSessionCookie({ email, slug }, secret);
    return new Response(JSON.stringify({ ok: true, slug }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookie
      },
      status: 200
    });
  } catch (e) {
    // Very unlikely; surfaces unexpected signing issues
    return error(500, "session_create_failed", "Failed to create session cookie", {
      details: String(e && e.message || e || "unknown")
    });
  }
}
