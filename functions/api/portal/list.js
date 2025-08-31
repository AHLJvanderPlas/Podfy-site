// functions/api/portal/list.js
import { json } from "./_utils";

function matchSearch(item, q) {
  if (!q) return true;
  q = q.toLowerCase();
  const fields = [
    item.key || "",
    item.httpMetadata?.contentType || "",
    item.customMetadata?.slug || "",
    item.customMetadata?.orig_name || ""
  ];
  return fields.some(v => v.toLowerCase().includes(q));
}

export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 1000);

  // Use prefix = "" (all keys) and recursive listing
  const list = await env.PODFY_BUCKET.list({
    limit,
    cursor,
    prefix: "",             // root
    delimiter: undefined,   // don’t collapse into “folders”
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
