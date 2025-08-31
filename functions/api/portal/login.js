// functions/api/portal/login.js
import { createSessionCookie, json, badrequest } from "./_utils";

const HARDCODED_EMAIL = "ahlj.vd.plas@gmail.com";
const HARDCODED_PASSWORD = "Rodenrijselaan10a!";

// We let the user choose the slug for now (e.g., "fender").
// For production, map users -> slugs server-side and ignore client input.
export async function onRequestPost({ request, env }) {
  const { PORTAL_SESSION_SECRET } = env;
  if (!PORTAL_SESSION_SECRET) return badrequest("Missing PORTAL_SESSION_SECRET");

  let body;
  try { body = await request.json(); } catch { return badrequest("Invalid JSON"); }
  const { email, password, slug } = body || {};
  if (!email || !password || !slug) return badrequest("email, password, slug required");

  if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  const setCookie = await createSessionCookie({ email, slug: String(slug).toLowerCase() }, PORTAL_SESSION_SECRET);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": setCookie },
    status: 200
  });
}
