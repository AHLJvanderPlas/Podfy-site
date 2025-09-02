// Public demo: list ALL objects with optional full-text search and pagination.
import { json } from "./_utils.js";

function matchSearch(item, q) {
  if (!q) return true;
  q = q.toLowerCase();
  const fields = [
    item.key || "",
    item.httpMetadata?.contentType || "",
    item.customMetadata?.slug || "",
    item.customMetadata?.slug_original || "",
    item.customMetadata?.orig_name || "",
    item.customMetadata?.orig_type || "",
    item.customMetadata?.uploader_email || "",
  ];
  return fields.some(v => v.toLowerCase().includes(q));
}

export async function onRequestGet({ request, env }) {
  try {
    // Accept either binding name (typos happen)
    const bucket = env.PODFY_BUCKET || env.P0DFY_BUCKET;
    if (!bucket) return json({ error: "R2 binding not found: set PODFY_BUCKET" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 1000);
    // Optional “folder filter” by prefix; when absent we list everything.
    const prefix = searchParams.get("prefix") || "";

    const list = await bucket.list({
      limit,
      cursor,
      prefix, // e.g. "dhl/" if you want to scope
      include: ["customMetadata", "httpMetadata"],
    });

    const items = (list.objects || [])
      .filter(o => matchSearch(o, q))
      .map(o => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded,
        httpMetadata: o.httpMetadata || {},
        customMetadata: o.customMetadata || {},
      }));

    return json({ items, cursor: list.truncated ? list.cursor : null });
  } catch (e) {
    return json({ error: `List failed: ${String(e?.message || e)}` }, { status: 500 });
  }
}
