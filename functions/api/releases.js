export async function onRequestGet({ env }) {
  try {
    const db = env.BD;

    const { results } = await db.prepare(`
      SELECT
        id, release_date, version, deployment_ref,
        fixes, new_features, area_tags, is_published
      FROM Site_Releases
      WHERE is_published = 1
      ORDER BY release_date DESC, id DESC
      LIMIT 200
    `).all();

    return new Response(JSON.stringify({ items: results, error: null }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      items: [],
      error: String(err)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
