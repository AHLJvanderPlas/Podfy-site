// functions/api/releases.js

// sha256("Podfy2026!") — same hash used by instructions/index.html lock screen
const ADMIN_HASH = "96a67fef8cc3b05cf7c2e3da71889a97c0ddf0c4a18e4a9a66e9e2882a26e37b";

export async function onRequestPost({ env, request }) {
  let body;
  try { body = await request.json(); } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (body.auth !== ADMIN_HASH) return json({ error: "Unauthorized" }, 401);

  const { release_date, version, deployment_ref, new_features, fixes, area_tags, is_published } = body;
  if (!release_date || !version) return json({ error: "release_date and version are required" }, 400);

  try {
    const result = await env.DB.prepare(
      `INSERT INTO Site_Releases (release_date, version, deployment_ref, new_features, fixes, area_tags, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      release_date,
      version,
      deployment_ref || "",
      new_features   || "",
      fixes          || "",
      area_tags      || "",
      is_published ? 1 : 0
    ).run();
    return json({ success: true, id: result.meta?.last_row_id ?? null });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function onRequestGet({ env, request }) {
  const db = env.DB;
  const url = new URL(request.url);

  // Query params: ?page=1&pageSize=25
  const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
  const sizeParam = parseInt(url.searchParams.get("pageSize") || "25", 10);

  const pageSize = Math.min(Math.max(sizeParam, 5), 100); // clamp 5–100
  const page = pageParam > 0 ? pageParam : 1;
  const offset = (page - 1) * pageSize;

  try {
    // Main page of results
    const dataSql = `
      SELECT
        id,
        release_date,
        version,
        deployment_ref,
        fixes,
        new_features,
        area_tags,
        is_published
      FROM Site_Releases
      WHERE is_published = 1
      ORDER BY release_date DESC, id DESC
      LIMIT ? OFFSET ?
    `;

    const dataResult = await db.prepare(dataSql).bind(pageSize, offset).all();
    const items = dataResult.results || [];

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*) AS total
      FROM Site_Releases
      WHERE is_published = 1
    `;
    const countRow = await db.prepare(countSql).first();
    const total = countRow ? countRow.total : 0;
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

    return new Response(
      JSON.stringify({
        items,
        page,
        pageSize,
        total,
        totalPages,
        error: null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  } catch (err) {
    console.error("Error in /api/releases:", err);

    return new Response(
      JSON.stringify({
        items: [],
        page: 1,
        pageSize: 25,
        total: 0,
        totalPages: 1,
        error: String(err && err.message ? err.message : err),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}
