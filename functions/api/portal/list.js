// functions/api/portal/list.js
import { readSession, unauthorized, json, badrequest } from "./_utils";

// Search helper over key + selected metadata fields
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
  const session = await readSession(request, env.PORTAL_SESSION_SECRET);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 1000);

  // We cannot prefix by slug because keys currently don't contain slug.
  // Use include: ["customMetadata","httpMetadata"] and filter on metadata.slug.
  const list = await env.PODFY_BUCKET.list({
    limit,
    cursor,
    include: ["customMetadata", "httpMetadata"]
  });

  // Filter to this tenant's slug and apply free-text search
  const filtered = (list.objects || [])
    .filter(obj => (obj.customMetadata?.slug || "").toLowerCase() === session.slug.toLowerCase())
    .filter(obj => matchSearch(obj, q))
    .map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded, // Date
      httpMetadata: obj.httpMetadata || {},
      customMetadata: obj.customMetadata || {}
    }));

  return json({
    items: filtered,
    cursor: list.truncated ? list.cursor : null
  });
}
