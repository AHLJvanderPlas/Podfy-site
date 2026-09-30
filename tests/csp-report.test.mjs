// CSP report intake: tokens never stored, rows aggregated and capped.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeD1 } from "./d1.mjs";
import { cleanPath, normalise, handleCspReport } from "../functions/_shared/csp-report.js";

const schema = readFileSync(new URL("./fixtures/csp_reports.sql", import.meta.url), "utf8");
const post = (body) => new Request("https://x.test/csp-report", { method: "POST", body: JSON.stringify(body) });

test("tokens and ids are stripped from paths", () => {
  assert.equal(cleanPath("https://portal.podfy.net/auth/login/3f9aKd82LmQ0pZx7Yt1W?x=1#y"), "/auth/login/:id");
  assert.equal(cleanPath("https://portal.podfy.net/pod/9b1c2d3e-aaaa-bbbb-cccc-123456789abc"), "/pod/:id");
  assert.equal(cleanPath("https://portal.podfy.net/login"), "/login");
});

test("report-uri and Reporting API formats are both understood", () => {
  const a = normalise("portal", { "csp-report": { "document-uri": "https://portal.podfy.net/", "effective-directive": "script-src-elem", "blocked-uri": "inline", "source-file": "https://portal.podfy.net/public/app.js?v=1", "line-number": 12 } });
  assert.deepEqual([a.directive, a.blocked, a.source, a.document], ["script-src-elem", "inline", "/public/app.js:12", "/"]);
  const b = normalise("portal", { type: "csp-violation", body: { documentURL: "https://portal.podfy.net/pod/abcdefghijklmnop", effectiveDirective: "img-src", blockedURL: "https://tile.example.org/1/2/3.png" } });
  assert.deepEqual([b.directive, b.blocked, b.document], ["img-src", "https://tile.example.org", "/pod/:id"]);
});

test("aggregates repeats and caps distinct rows", async () => {
  const db = makeD1(schema);
  const rep = (i) => ({ "csp-report": { "document-uri": "https://p.test/", "effective-directive": "img-src", "blocked-uri": `https://h${i}.test/x` } });
  await handleCspReport(post(rep(1)), db, "portal");
  await handleCspReport(post(rep(1)), db, "portal");
  assert.equal((await db.prepare("SELECT count FROM csp_reports").first()).count, 2);
  for (let i = 2; i < 1100; i++) await handleCspReport(post(rep(i)), db, "portal");
  assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM csp_reports").first()).n, 1000);
});
