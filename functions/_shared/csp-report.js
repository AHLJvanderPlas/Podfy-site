// csp-report.js — shared by portal, admin, delivery and site (keep the copies identical;
// tests/csp-report.test.mjs in each repo). Receives browser CSP violation reports (report-uri
// format and Reporting API format), strips tokens, and upserts an aggregated row in csp_reports.

const MAX_ROWS_PER_APP = 1000;   // a flood of made-up reports can never grow the table past this
const MAX_BODY = 16 * 1024;

// Paths carry credentials (/auth/login/<token>, /pod/<share token>, /invoice/<token>): any segment
// that looks like an id or token becomes :id. Query strings and fragments are dropped.
export function cleanPath(url) {
  let p = "";
  try { p = new URL(url).pathname; } catch { p = String(url || "").split(/[?#]/)[0]; }
  return p.split("/").map((seg) => (/^[A-Za-z0-9_-]{12,}$/.test(seg) || /\d{4,}/.test(seg) ? ":id" : seg)).join("/").slice(0, 200);
}

export function cleanBlocked(blocked, documentUrl) {
  const b = String(blocked || "").trim();
  if (!b || b === "inline" || b === "eval" || b === "wasm-eval" || b === "data" || b === "blob") return b || "inline";
  try {
    const u = new URL(b), d = new URL(documentUrl);
    return u.origin === d.origin ? cleanPath(b) : u.origin;
  } catch { return b.slice(0, 100); }
}

// One report → normalised row, or null when it is not a usable CSP report.
export function normalise(app, raw) {
  const r = raw?.["csp-report"] || (raw?.type === "csp-violation" ? raw.body : null) || raw;
  if (!r || typeof r !== "object") return null;
  const doc = r["document-uri"] || r.documentURL || "";
  const directive = String(r["effective-directive"] || r.effectiveDirective || r["violated-directive"] || "").split(" ")[0];
  if (!directive || !doc) return null;
  const src = r["source-file"] || r.sourceFile || "";
  const line = r["line-number"] || r.lineNumber || "";
  return {
    app,
    directive: directive.slice(0, 60),
    blocked: cleanBlocked(r["blocked-uri"] ?? r.blockedURL, doc),
    source: src ? `${cleanPath(src)}${line ? ":" + line : ""}` : "",
    document: cleanPath(doc),
    sample: String(r["script-sample"] || r.sample || "").slice(0, 80) || null,
  };
}

export async function handleCspReport(request, db, app) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const text = (await request.text()).slice(0, MAX_BODY);
  let payload; try { payload = JSON.parse(text); } catch { return new Response(null, { status: 204 }); }
  const rows = (Array.isArray(payload) ? payload : [payload]).map((p) => normalise(app, p)).filter(Boolean).slice(0, 10);
  const now = new Date().toISOString();
  for (const row of rows) {
    const exists = await db.prepare(
      "SELECT 1 FROM csp_reports WHERE app=? AND directive=? AND blocked=? AND source=? AND document=?"
    ).bind(row.app, row.directive, row.blocked, row.source, row.document).first();
    if (!exists) {
      const { n } = await db.prepare("SELECT COUNT(*) AS n FROM csp_reports WHERE app = ?").bind(app).first();
      if (Number(n) >= MAX_ROWS_PER_APP) continue;
    }
    await db.prepare(
      `INSERT INTO csp_reports (app, directive, blocked, source, document, sample, count, first_seen, last_seen)
       VALUES (?,?,?,?,?,?,1,?,?)
       ON CONFLICT (app, directive, blocked, source, document) DO UPDATE SET count = count + 1, last_seen = excluded.last_seen`
    ).bind(row.app, row.directive, row.blocked, row.source, row.document, row.sample, now, now).run();
  }
  return new Response(null, { status: 204 });
}
