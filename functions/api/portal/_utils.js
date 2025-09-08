// functions/api/portal/_utils.js
// Minimal utility helpers for Cloudflare Pages Functions (ESM).

/** JSON response helper */
export function json(status = 200, data = {}, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

/** Text response helper */
export function text(status = 200, body = "", extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...extraHeaders },
  });
}

/** HTML response helper */
export function html(status = 200, body = "", extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...extraHeaders },
  });
}

/** Common JSON responses (names used around the codebase) */
export const ok           = (data = {}, h) => json(200, data, h);
export const created      = (data = {}, h) => json(201, data, h);
export const nocontent    = (h)            => new Response(null, { status: 204, headers: h });

/** Error JSON responses (lowercase names to match existing imports) */
export const badrequest   = (message = "Bad Request", details = null, h = {}) =>
  json(400, { error: "bad_request", message, ...(details ? { details } : {}) }, h);

export const unauthorized = (message = "Unauthorized", h = {}) =>
  json(401, { error: "unauthorized", message }, { "WWW-Authenticate": "Bearer", ...h });

export const forbidden    = (message = "Forbidden", h = {}) =>
  json(403, { error: "forbidden", message }, h);

export const notfound     = (message = "Not Found", h = {}) =>
  json(404, { error: "not_found", message }, h);

export const conflict     = (message = "Conflict", h = {}) =>
  json(409, { error: "conflict", message }, h);

export const internal     = (message = "Internal Server Error", h = {}) =>
  json(500, { error: "internal", message }, h);

/** Redirect helper */
export function redirect(location, status = 302, h = {}) {
  return new Response(null, { status, headers: { Location: location, ...h } });
}

/** Parse JSON body safely with optional size guard */
export async function parseJsonBody(req, maxBytes = 1_000_000) {
  const ctype = req.headers.get("content-type") || "";
  if (!ctype.toLowerCase().includes("application/json")) {
    throw badrequest("Expected application/json");
  }
  const buf = await req.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw badrequest("Payload too large");
  }
  try {
    return JSON.parse(new TextDecoder().decode(buf));
  } catch {
    throw badrequest("Invalid JSON");
  }
}

/** Method guard */
export function requireMethod(req, methods = ["GET"]) {
  const allowed = Array.isArray(methods) ? methods : [methods];
  if (!allowed.includes(req.method)) {
    return new Response(null, { status: 405, headers: { "Allow": allowed.join(", ") } });
  }
  return null; // OK
}

/** Create a secure session cookie string */
export function createSessionCookie(
  value,
  { name = "session", days = 7, secure = true, sameSite = "Lax", path = "/" } = {}
) {
  const maxAge = Math.max(1, Math.floor(days * 86400));
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    "HttpOnly",
    secure ? "Secure" : "",
    `SameSite=${sameSite}`,
    `Max-Age=${maxAge}`,
    `Expires=${expires}`,
  ].filter(Boolean);
  return parts.join("; ");
}

/** Clear the session cookie */
export function clearSessionCookie(
  { name = "session", path = "/" } = {}
) {
  const parts = [
    `${name}=`,
    `Path=${path}`,
    "HttpOnly",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "SameSite=Lax",
    "Secure",
  ];
  return parts.join("; ");
}
