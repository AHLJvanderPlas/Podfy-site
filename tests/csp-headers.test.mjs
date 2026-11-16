// Hardening H6: the strict Content-Security-Policy is ENFORCED on podfy.net and fonts stay self-hosted.
//  - no Google font host anywhere in the source (fonts: assets/fonts/ + @font-face in assets/styles.site.css);
//  - _headers: exactly one enforced CSP for /*, no 'unsafe-inline'/'unsafe-eval', no report-only twin;
//  - every other rule that sets a CSP unsets the /* one first (Pages COMBINES all matching rules);
//  - functions/_middleware.js gives Function-rendered HTML the SAME policy, exactly once;
//  - podfy.net stays indexable (no site-wide noindex).
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { onRequest as middleware } from "../functions/_middleware.js";

const ROOT = new URL("../", import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), "utf8");
// Built from parts so this file does not match itself
const GOOGLE_FONT_HOST = new RegExp(["fonts\\.googleapis\\.com", "fonts\\.gstatic\\.com"].join("|"), "i");
const SKIP_DIRS = new Set([".git", "node_modules", "dist", ".wrangler", ".claude"]);
const TEXT = /\.(html?|css|m?js|ts|json|txt|toml|sh|xml|svg)$|^_headers$|^_redirects$/;

function sourceFiles() {
  const out = [];
  (function walk(d) {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(n)) walk(p); continue; }
      if (TEXT.test(n) && n !== "package-lock.json") out.push(p);
    }
  })(ROOT);
  return out;
}

// _headers → [{ path, lines: [indented lines, trimmed] }] (comments and blank lines dropped)
export function parseHeaders(text) {
  const rules = [];
  for (const raw of text.split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    if (!/^\s/.test(raw)) rules.push({ path: raw.trim(), lines: [] });
    else rules.at(-1).lines.push(raw.trim());
  }
  return rules;
}

const isCsp = (l) => /^Content-Security-Policy\s*:/i.test(l);
const isReportOnly = (l) => /^Content-Security-Policy-Report-Only\s*:/i.test(l);
const value = (l) => l.slice(l.indexOf(":") + 1).trim();

export function checkHeaders(text) {
  const problems = [];
  const rules = parseHeaders(text);
  // several "/*" blocks would all apply (Pages combines matching rules): judge them together
  const star = rules.filter((r) => r.path === "/*");
  if (!star.length) return ["no /* rule"];
  const all = { path: "/*", lines: star.flatMap((r) => r.lines) };
  const csp = all.lines.filter(isCsp);
  if (csp.length !== 1) problems.push(`/*: ${csp.length} enforced Content-Security-Policy lines (want 1)`);
  for (const r of rules) if (r.lines.some(isReportOnly) || r.lines.some((l) => /^! Content-Security-Policy-Report-Only/i.test(l)))
    problems.push(`${r.path}: report-only CSP line (the strict policy is enforced now)`);
  const policy = csp[0] ? value(csp[0]) : "";
  if (/'unsafe-inline'|'unsafe-eval'/.test(policy)) problems.push(`/*: CSP allows 'unsafe-inline'/'unsafe-eval'`);
  if (!/(^|;\s*)report-uri \/csp-report(;|$)/.test(policy)) problems.push("/*: CSP lost report-uri /csp-report");
  for (const r of rules) {
    if (r.path === "/*") continue;
    const at = r.lines.findIndex(isCsp);
    if (at === -1) continue;
    const unset = r.lines.findIndex((l) => /^! Content-Security-Policy\s*$/i.test(l));
    if (unset === -1 || unset > at) problems.push(`${r.path}: sets a CSP without "! Content-Security-Policy" before it`);
    if (r.lines.filter(isCsp).length > 1) problems.push(`${r.path}: more than one CSP line`);
  }
  return problems;
}

const SITE_POLICY = () => value(parseHeaders(read("_headers")).find((r) => r.path === "/*").lines.find(isCsp));

test("no Google font host in any source file (fonts are self-hosted in assets/fonts/)", () => {
  const hits = sourceFiles().filter((f) => GOOGLE_FONT_HOST.test(readFileSync(f, "utf8"))).map((f) => relative(ROOT, f));
  assert.deepEqual(hits, []);
});

test("_headers: one enforced strict CSP for /*, no report-only twin, every per-path CSP unsets /* first", () => {
  assert.deepEqual(checkHeaders(read("_headers")), []);
  const policy = SITE_POLICY();
  assert.match(policy, /(^|; )script-src 'self' https:\/\/challenges\.cloudflare\.com;/);   // Turnstile (/contact)
  assert.match(policy, /(^|; )frame-src 'self' https:\/\/challenges\.cloudflare\.com;/);
  assert.match(policy, /(^|; )style-src 'self';/);
  assert.match(policy, /(^|; )font-src 'self';/);
  assert.match(policy, /(^|; )object-src 'none'/);
  assert.match(policy, /(^|; )frame-ancestors 'none'/);
});

test("Function pages: the middleware sends the same policy as _headers, exactly once, no report-only", async () => {
  assert.equal(read("functions/_middleware.js").match(/const PAGE_CSP = "([^"]+)"/)[1], SITE_POLICY());
  assert.doesNotMatch(read("functions/_middleware.js"), /Report-Only/i);
  const call = async (path, res) => middleware({ request: new Request("https://podfy.net" + path), env: {}, next: async () => res });
  // an SSR page that already carries a CSP of its own still leaves with exactly one: the site policy
  const html = await call("/insights/article", new Response("<p>x</p>", { headers: { "content-type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src *" } }));
  const csp = [...html.headers].filter(([k]) => k === "content-security-policy");
  assert.deepEqual(csp, [["content-security-policy", SITE_POLICY()]]);
  assert.equal(html.headers.get("content-security-policy-report-only"), null);
  // non-HTML Function responses are passed through untouched
  const json = new Response("{}", { headers: { "content-type": "application/json" } });
  assert.equal(await call("/api/pricing", json), json);
});

test("the checker catches each broken rule (break-it proof)", () => {
  const good = read("_headers");
  const csp = good.split("\n").find((l) => isCsp(l.trim()));
  assert.ok(checkHeaders(good.replace("style-src 'self'", "style-src 'self' 'unsafe-inline'")).some((p) => /unsafe-inline/.test(p)));
  assert.ok(checkHeaders(good.replace(csp, `${csp}\n${csp.replace("Content-Security-Policy:", "Content-Security-Policy-Report-Only:")}`)).some((p) => /report-only/.test(p)));
  assert.ok(checkHeaders(good.replace(csp, `${csp}\n${csp}`)).some((p) => /2 enforced/.test(p)));
  assert.ok(checkHeaders(`${good}\n/x\n  Content-Security-Policy: default-src 'none'\n`).some((p) => /^\/x: sets a CSP without/.test(p)));
  assert.deepEqual(checkHeaders(`${good}\n/x\n  ! Content-Security-Policy\n  Content-Security-Policy: default-src 'none'\n`), []);
  assert.ok(GOOGLE_FONT_HOST.test(`<link href="https://fonts.${"gstatic"}.com/s/inter.woff2">`));
});

test("podfy.net stays indexable: no site-wide noindex, robots.txt allows crawling", () => {
  const star = parseHeaders(read("_headers")).filter((r) => r.path === "/*");
  assert.ok(!star.some((r) => r.lines.some((l) => /^X-Robots-Tag/i.test(l))));
  assert.doesNotMatch(read("robots.txt"), /^Disallow: \/\s*$/m);
});

test("every @font-face points at a font file that exists in assets/fonts/", () => {
  const urls = [...read("assets/styles.site.css").matchAll(/@font-face\s*{[^}]*url\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.equal(urls.length, 10);
  for (const u of urls) {
    assert.match(u, /^\/assets\/fonts\/[a-z0-9-]+\.woff2$/);
    assert.ok(existsSync(join(ROOT, u)), u);
  }
});
