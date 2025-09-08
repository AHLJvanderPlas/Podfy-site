// Minimal JSON helper
export function json(status, data, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders }
  });
}

// Add this: create a secure session cookie string
export function createSessionCookie(
  value,
  { name = 'session', days = 7, secure = true, sameSite = 'Lax' } = {}
) {
  const maxAge = Math.max(1, Math.floor(days * 86400));
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    secure ? 'Secure' : '',
    `SameSite=${sameSite}`,
    `Max-Age=${maxAge}`,
    `Expires=${expires}`
  ].filter(Boolean);
  return parts.join('; ');
}
