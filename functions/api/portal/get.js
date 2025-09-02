// Public demo: stream any object by key.
import { badrequest } from "./_utils.js";

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
    const inline = ct.startsWith("image/");
    const cd = inline ? "inline" : "attachment";
    const filename = key.split("/").pop() || "file";

    return new Response(obj.body, {
      headers: {
        "Content-Type": ct,
        "Content-Disposition": `${cd}; filename="${filename}"`,
      },
    });
  } catch (e) {
    return new Response(`Get failed: ${String(e?.message || e)}`, { status: 500 });
  }
}

