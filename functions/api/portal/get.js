// functions/api/portal/get.js
import { readSession, unauthorized, badrequest } from "./_utils";

export async function onRequestGet({ request, env }) {
  const session = await readSession(request, env.PORTAL_SESSION_SECRET);
  if (!session) return unauthorized();

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) return badrequest("key required");

  // Head the object to check metadata
  const obj = await env.PODFY_BUCKET.head(key);
  if (!obj) return new Response("Not Found", { status: 404 });

  const slugMeta = (obj.customMetadata?.slug || "").toLowerCase();
  if (slugMeta !== session.slug.toLowerCase()) return unauthorized();

  // Stream the object
  const body = await env.PODFY_BUCKET.get(key);
  if (!body) return new Response("Not Found", { status: 404 });

  // Inline if image, otherwise attachment
  const ct = obj.httpMetadata?.contentType || "application/octet-stream";
  const cd = ct.startsWith("image/") ? "inline" : "attachment";
  const filename = key.split("/").pop() || "file";

  return new Response(body.body, {
    headers: {
      "Content-Type": ct,
      "Content-Disposition": `${cd}; filename="${filename}"`
    }
  });
}
