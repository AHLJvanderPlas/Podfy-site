// functions/api/pricing-factor.js
//
// Looks up a buyer-specific multiplier for the pricing page.
// URL: /api/pricing-factor?code=<keyword>
//
// Site_Buyer schema (from your screenshot):
//   id, segment, keyword, wtp_percent
//
// Here we treat wtp_percent as the MULTIPLIER directly.
// Example: Elite → wtp_percent = 29.7 → factor = 29.7

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const rawCode = (url.searchParams.get("code") || "").trim();

  if (!rawCode) {
    return jsonOk({ factor: 1, buyer: null, code: null, found: false });
  }

  // CHANGE THIS to match your binding name from the Pages/D1 config
  const db = env.DB_THEMES || env.DB || env.PODFY_THEMES_QA;

  if (!db) {
    // Binding not configured – fail soft but tell you why in the payload
    return jsonOk({
      factor: 1,
      buyer: null,
      code: rawCode,
      found: false,
      error: "D1 binding not found on env",
    });
  }

  try {
    const stmt = db
      .prepare("SELECT wtp_percent, segment FROM Site_Buyer WHERE keyword = ?1")
      .bind(rawCode);

    const row = await stmt.first();

    if (!row) {
      return jsonOk({
        factor: 1,
        buyer: null,
        code: rawCode,
        found: false,
      });
    }

    const pct = Number(row.wtp_percent);
    const factor = Number.isFinite(pct) && pct > 0 ? pct : 1;

    return jsonOk({
      factor,
      buyer: row.segment || null, // show segment label (e.g. Ultra high-risk cargo shippers)
      code: rawCode,
      found: true,
    });
  } catch (err) {
    console.error("pricing-factor D1 error", err);
    // Fail soft but keep status 200 so the frontend can show a hint
    return jsonOk({
      factor: 1,
      buyer: null,
      code: rawCode,
      found: false,
      error: "D1 query failed",
    });
  }
}

function jsonOk(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
