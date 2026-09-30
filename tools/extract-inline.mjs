// tools/extract-inline.mjs — moves inline <script> and <style> blocks out of the static pages into
// content-addressed files (assets/js/i/<hash>.js, assets/css/i/<hash>.css), loaded at the exact
// same position, so execution order and the cascade stay identical. Content-addressed names are
// cache-safe (a changed block gets a new URL). JSON(-LD) data blocks stay inline (never executed).
//   node tools/extract-inline.mjs          convert (idempotent)
//   node tools/extract-inline.mjs --check  exit 1 if an inline block is left
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const check = process.argv.includes("--check");
const SKIP = new Set(["node_modules", ".git", "dist", ".wrangler", "tests", "functions", "tools"]);
const html = [];
(function walk(d) { for (const n of readdirSync(d)) {
  const p = join(d, n);
  if (statSync(p).isDirectory()) { if (!SKIP.has(n)) walk(p); } else if (n.endsWith(".html")) html.push(p);
} })(ROOT);

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);
const emit = (dir, ext, body) => {
  const name = `${hash(body)}.${ext}`, abs = join(ROOT, dir, name);
  if (!check) { mkdirSync(join(ROOT, dir), { recursive: true }); if (!existsSync(abs)) writeFileSync(abs, body); }
  return `/${dir}/${name}`;
};
let scripts = 0, styles = 0, left = 0;
for (const p of html) {
  const src = readFileSync(p, "utf8");
  let out = src.replace(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")>([\s\S]*?)<\/script>/g, (m, body) => {
    scripts++; return `<script src="${emit("assets/js/i", "js", body)}"></script>`;
  });
  out = out.replace(/<style>([\s\S]*?)<\/style>/g, (m, body) => {
    styles++; return `<link rel="stylesheet" href="${emit("assets/css/i", "css", body)}">`;
  });
  if (out !== src) { if (check) { left++; console.error(`✖ ${relative(ROOT, p)}: inline <script>/<style> left`); } else writeFileSync(p, out); }
}
// ── Asset wiring (idempotent) ──────────────────────────────────────────────────
// 1) Content-addressed files whose content changed (e.g. style attributes converted by
//    tools/inline-styles.mjs) get their new hash name; references are updated everywhere.
// 2) Every page <head> loads the generated inline-styles.css + .js (tools/inline-styles.mjs),
//    stamped ?v=<content hash> — also in the SSR head template (functions/_shared/insights-ssr.js).
const fnDir = (d) => readdirSync(join(ROOT, d)).filter((n) => n.endsWith(".js")).map((n) => join(ROOT, d, n));
const refFiles = [...html, ...["functions/_shared", "functions/insights", "functions/insights/repository", "functions/insights/linkedin"].flatMap(fnDir)];
const renames = [];
for (const [dir, ext] of [["assets/js/i", "js"], ["assets/css/i", "css"]]) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const n of readdirSync(join(ROOT, dir))) {
    const body = readFileSync(join(ROOT, dir, n), "utf8"), want = `${hash(body)}.${ext}`;
    if (n !== want) renames.push([`/${dir}/${n}`, `/${dir}/${want}`, join(ROOT, dir, n), join(ROOT, dir, want), body]);
  }
}
const ver = (f) => hash(readFileSync(join(ROOT, f), "utf8"));
const IS_CSS = "assets/inline-styles.css", IS_JS = "assets/inline-styles.js";
const wiring = `<link rel="stylesheet" href="/${IS_CSS}?v=${ver(IS_CSS)}">\n<script src="/${IS_JS}?v=${ver(IS_JS)}"></script>\n`;
let stale = 0;
for (const p of refFiles) {
  const src = readFileSync(p, "utf8");
  let out = src;
  for (const [from, to] of renames) out = out.split(from).join(to);
  out = out.replace(/\/assets\/inline-styles\.css\?v=[0-9a-f]+/g, `/${IS_CSS}?v=${ver(IS_CSS)}`)
           .replace(/\/assets\/inline-styles\.js\?v=[0-9a-f]+/g, `/${IS_JS}?v=${ver(IS_JS)}`);
  if (out.includes("</head>") && !out.includes(`/${IS_JS}?v=`)) out = out.replace("</head>", wiring + "</head>");
  if (out !== src) { stale++; if (check) console.error(`✖ ${relative(ROOT, p)}: asset wiring out of date`); else writeFileSync(p, out); }
}
if (!check) for (const [, , oldAbs, newAbs, body] of renames) { writeFileSync(newAbs, body); if (oldAbs !== newAbs) (await import("node:fs")).unlinkSync(oldAbs); }
else if (renames.length) { console.error(`✖ ${renames.length} content-addressed file(s) need a new name`); stale++; }

console.log(check ? (left || stale ? `${left} file(s) with inline blocks, ${stale} with stale wiring` : "no inline <script>/<style> blocks; asset wiring current")
                  : `extracted ${scripts} scripts, ${styles} style blocks · renamed ${renames.length} · wired ${stale} files`);
if (check && (left || stale)) process.exitCode = 1;
