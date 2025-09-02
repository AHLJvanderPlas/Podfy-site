// Minimal helpers for JSON responses (demo mode)

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

export function badrequest(msg = "Bad Request") {
  return json({ error: msg }, { status: 400 });
}

export function unauthorized(msg = "Unauthorized") {
  return json({ error: msg }, { status: 401 });
}
