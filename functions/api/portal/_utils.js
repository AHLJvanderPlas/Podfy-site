// functions/api/portal/_utils.js
export const SESSION_COOKIE = "pf_session";

async function hmac(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function createSessionCookie({ email, slug }, secret) {
  const payload = JSON.stringify({ email, slug, iat: Date.now() });
  const sig = await hmac(payload, secret);
  const value = btoa(payload) + "." + sig;
  // 1 day
  const expires = new Date(Date.now() + 86400 * 1000).toUTCString();
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
}

export async function readSession(request, secret) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const [payloadB64, sig] = match[1].split(".");
  if (!payloadB64 || !sig) return null;
  const payload = atob(payloadB64);
  const expected = await hmac(payload, secret);
  if (expected !== sig) return null;
  try { return JSON.parse(payload); } catch { return null; }
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    status: init.status || 200
  });
}

export function unauthorized() {
  return json({ error: "Unauthorized" }, { status: 401 });
}

export function badrequest(msg = "Bad Request") {
  return json({ error: msg }, { status: 400 });
}
