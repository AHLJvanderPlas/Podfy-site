// Public demo: streams any object. NO AUTH.
import { badrequest } from "./_utils";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) return badrequest("key required");

  const head = await env.PODFY_BUCKET.head(key);
  if (!head) return new Response("Not Found", { status: 404 });

  const object = await env.PODFY_BUCKET.get(key);
  if (!object) return new Response("Not Found", { status: 404 });

  const ct = head.httpMetadata?.contentType || "application/octet-stream";
  const cd = ct.startsWith("image/") ? "inline" : "attachment";
  const filename = key.split("/").pop() || "file";

  return new Response(object.body, {
    headers: {
      "Content-Type": ct,
      "Content-Disposition": `${cd}; filename="${filename}"`
    }
  });
}
