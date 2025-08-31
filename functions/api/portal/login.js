import { createSessionCookie, json, badrequest } from "./_utils";

const HARDCODED_EMAIL = "ahlj.vd.plas@gmail.com";
const HARDCODED_PASSWORD = "Rodenrijselaan10a!";

export async function onRequestPost({ request, env }) {
  const secret = env.PORTAL_SESSION_SECRET;
  if (!secret) return badrequest("Missing PORTAL_SESSION_SECRET");

  let body;
  try { body = await request.json(); } catch { return badrequest("Invalid JSON"); }
  let { email, password, slug } = body || {};
  if (!email || !password || !slug) return badrequest("email, password, slug required");

  email = String(email).trim().toLowerCase();           // normalize
  if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  const setCookie = await createSessionCookie({ email, slug: String(slug).trim().toLowerCase() }, secret);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": setCookie },
    status: 200
  });
}
