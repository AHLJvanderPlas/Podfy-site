/**
 * GET /api/releases
 *
 * This Pages Function returns the public release notes stored in the D1 database.
 * The result is used by the new Podfy /releases page to dynamically
 * load and display the latest “Site_Releases” entries.
 *
 * The endpoint supports:
 *  - limit (optional): how many rows to return, default 50
 *  - offset (optional): for pagination
 *
 * Only rows with `is_published = 1` are returned.
 *
 * Returned JSON:
 * {
 *   items: [ ...list of releases... ],
 *   total: <number of published releases>
 * }
 */

export async function onRequestGet({ env, request }) {
  // Access the D1 database binding.
  // In Cloudflare Pages → Settings → Functions, this binding is named "BD".
  const db = env.BD;

  // Parse URL parameters for pagination:
  // Example: /api/releases?limit=20&offset=40
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit")) || 50;   // default limit
  const offset = parseInt(url.searchParams.get("offset")) || 0;  // default offset

  /**
   * MAIN SELECT QUERY
   *
   * We load only published releases, ordered with the newest at the top.
   * The query uses LIMIT + OFFSET for pagination.
   *
   * Columns returned from Site_Releases:
   *  - id
   *  - release_date (YYYY-MM-DD)
   *  - version (string)
   *  - deployment_ref (optional)
   *  - fixes (multiline plain text or markdown)
   *  - new_features (multiline plain text or markdown)
   *  - area_tags (comma-separated strings)
   *  - is_published (1 or 0)
   */
  const query = `
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

  // Execute the main SELECT query
  const results = await db
    .prepare(query)
    .bind(limit, offset)
    .all();

  /**
   * COUNT QUERY
   *
   * Needed so the frontend knows:
   *  - total number of releases
   *  - how many pages there could be
   *
   * This allows infinite-scroll, pagination, "load more", etc.
   */
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Site_Releases
    WHERE is_published = 1
  `;
  const countResult = await db.prepare(countQuery).first();
  const total = countResult ? countResult.total : 0;

  /**
   * RETURN JSON RESPONSE
   *
   * items:    array of releases (already ordered and paginated)
   * total:    total number of available official releases
   *
   * Response headers:
   * - Content-Type: JSON (important for browser + frontend logic)
   */
  return new Response(
    JSON.stringify({
      items: results.results,
      total
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // Optional: allow cross-origin use in your preview environments
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
