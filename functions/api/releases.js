/**
 * GET /api/releases
 *
 * Returns published release notes from the Site_Releases table.
 */

export async function onRequestGet({ env, request }) {
  const db = env.BD;

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;

  try {
    // Main data query
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
      ORDER BY release_date DESC, version DESC
      LIMIT ? OFFSET ?
    `;

    const dataResult = await db.prepare(dataSql).bind(limit, offset).all();

    // Count query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM Site_Releases
      WHERE is_published = 1
    `;
    const countRow = await db.prepare(countSql).first();
    const total = countRow ? countRow.total : 0;

    return new Response(
      JSON.stringify({
        items: dataResult.results || [],
        total,
        error: null
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  } catch (err) {
    // Log for Cloudflare logs and return structured error
    console.error("D1 error in /api/releases:", err);

    return new Response(
      JSON.stringify({
        items: [],
        total: 0,
        error: String(err && err.message ? err.message : err)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
