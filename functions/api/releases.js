// functions/api/releases.js
// Read-only: releases are managed via podfy-admin Changelog tab.

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
        AND release_date <= DATE('now')
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
        AND release_date <= DATE('now')
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
