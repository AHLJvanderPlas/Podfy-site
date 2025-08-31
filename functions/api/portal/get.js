// Public demo: streams any object (no auth).
import { badrequest } from "./_utils.js"; // <-- explicit .js

export async function onRequestGet({ request, env }) {
  try {
    const bucket = env.PODFY_BUCKET || env.P0DFY_BUCKET;
    if (!bucket) return new Response("R2 binding not found", { status: 500 });

    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (!key) return badrequest("key required");

    const head = await bucket.head(key);
    if (!head) return new Response("Not Found", { status: 404 });

    const obj = await bucket.get(key);
    if (!obj) return new Response("Not Found", { status: 404 });

    const ct = head.httpMetadata?.contentType || "application/octet-stream";
    const cd = ct.startsWith("image/") ? "inline" : "attachment";
    const filename = key.split("/").pop() || "file";

    return new Response(obj.body, {
      headers: { "Content-Type": ct, "Content-Disposition": `${cd}; filename="${filename}"` }
    });
  } catch (e) {
    return new Response(`Get failed: ${String(e?.message || e)}`, { status: 500 });
  }
}
