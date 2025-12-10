// functions/api/pricing-factor.js
//
// Returns a price factor for a given keyword so /pricing/<keyword>
// can adjust all prices on the page.
//
// Expected D1 schema (adjust column names if needed):
//   TABLE Site_Buyer (
//     id INTEGER PRIMARY KEY,
//     keyword TEXT UNIQUE,        -- e.g. "acme", "demo1"
//     buyer_name TEXT,            -- optional, for display
//     wtp_percent REAL NOT NULL   -- e.g. 120 = 1.20x, 80 = 0.80x
//   )
//
// D1 binding name below assumes env.DB – change if yours is env.PODFY_DB, etc.

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const rawCode = (url.searchParams.get("code") || "").trim();

  // No code -> neutral factor
  if (!rawCode) {
    return jsonOk({ factor: 1, buyer: null, code: null });
  }

  const db = env.DB; // <--- adjust to your D1 binding name if different

  try {
    const stmt = db
      .prepare(
        "SELECT wtp_percent, buyer_name FROM Site_Buyer WHERE keyword = ?1"
      )
      .bind(rawCode);

    const row = await stmt.first();

    if (!row) {
      // Unknown keyword -> fall back to 1x
      return jsonOk({ factor: 1, buyer: null, code: rawCode, found: false });
    }

    const pct = Number(row.wtp_percent);
    const factor = Number.isFinite(pct) ? pct / 100 : 1;

    return jsonOk({
      factor,
      buyer: row.buyer_name || null,
      code: rawCode,
      found: true,
    });
  } catch (err) {
    console.error("pricing-factor error", err);
    // On error, fail soft with factor 1 so the page still works.
    return jsonError("Database error", 500, { factor: 1 });
  }
}

function jsonOk(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message, status = 500, extra = {}) {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
