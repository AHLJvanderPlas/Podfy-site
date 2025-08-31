// functions/api/portal/login.js
// Single-export handler for Cloudflare Pages Functions.

import { createSessionCookie, json } from "./_utils";

// Hard-coded credentials
const HARDCODED_EMAIL = "ahlj.vd.plas@gmail.com";
const HARDCODED_PASSWORD = "Rodenrijselaan10a!";

function err(status, code, message, extra = {}) {
  return json({ error: message, code, ...extra }, { status });
}

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

  const setCookie = await createSessionCookie({ email, scope: "all" }, secret);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": setCookie
    },
    status: 200
  });
}

export async function onRequest(context) {
  const method = (context.request.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (method === "POST") {
    try {
      return await handlePost(context);
    } catch (e) {
      return err(500, "unexpected_error", "Unhandled server error", { details: String(e?.message || e) });
    }
  }

  return err(405, "method_not_allowed", `Use POST for /api/portal/login (got ${method})`, {
    allow: ["POST", "OPTIONS"]
  });
}
