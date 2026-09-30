// tests/d1.mjs — minimal D1-compatible wrapper over node:sqlite for tests (no Cloudflare needed)
import { DatabaseSync } from "node:sqlite";

export function makeD1(schemaSql = "") {
  const db = new DatabaseSync(":memory:");
  if (schemaSql) db.exec(schemaSql);
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async (col) => { const r = db.prepare(sql).get(...args); return r == null ? null : col ? r[col] : { ...r }; },
    all: async () => ({ results: db.prepare(sql).all(...args).map((r) => ({ ...r })), success: true }),
    run: async () => { const r = db.prepare(sql).run(...args); return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => Promise.all(stmts.map((s) => s.all ? s.all() : s.run())),
    exec: async (sql) => db.exec(sql),
    raw: db,
  };
}
