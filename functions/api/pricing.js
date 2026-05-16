// functions/api/pricing.js
// Read-only: returns default prices from Site_Pricing (synced from
// billing_plan_catalog by podfy-cron every 6 h and on every admin price update).

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT plan_name, type, default_price, currency, synced_at
       FROM Site_Pricing
       ORDER BY type, plan_name`
    ).all();

    return new Response(JSON.stringify({ items: results || [] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ items: [], error: String(err?.message ?? err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
}
