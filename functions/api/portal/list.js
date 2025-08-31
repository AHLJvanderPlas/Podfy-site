// Public demo: lists ALL objects, with search & pagination. NO AUTH.
import { json, badrequest } from "./_utils";

function matchSearch(item, q) {
  if (!q) return true;
  q = q.toLowerCase();
  const fields = [
    item.key || "",
    item.size?.toString() || "",
    item.uploaded?.toString() || "",
    item.httpMetadata?.contentType || "",
    item.customMetadata?.slug || "",
    item.customMetadata?.slug_original || "",
    item.customMetadata?.uploader_email || "",
    item.customMetadata?.orig_name || "",
    item.customMetadata?.orig_type || ""
  ];
  return fields.some(v => v.toLowerCase().includes(q));
}

export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 1000);

  const list = await env.PODFY_BUCKET.list({
    limit,
    cursor,
    include: ["customMetadata", "httpMetadata"]
  });

  const filtered = (list.objects || [])
    .filter(obj => matchSearch(obj, q))
    .map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      httpMetadata: obj.httpMetadata || {},
      customMetadata: obj.customMetadata || {}
    }));

  return json({
    items: filtered,
    cursor: list.truncated ? list.cursor : null
  });
}
