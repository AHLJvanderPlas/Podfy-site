// tools/inline-styles.mjs — replaces static style="…" attributes with data-u="<key>" so the
// Content-Security-Policy can forbid inline styles (style-src without 'unsafe-inline').
//
//   node tools/inline-styles.mjs          convert + regenerate outputs (idempotent)
//   node tools/inline-styles.mjs --check  exit 1 if a conversion is pending or outputs are stale
//
// How the behaviour stays identical:
//  • public/inline-styles.css renders every key from first paint: [data-u="k"]{… !important}
//  • public/inline-styles.js (loaded before the app) moves each key's declarations onto the element
//    as inline CSSOM style (allowed by CSP) and drops data-u — at start-up for the static HTML and
//    via a MutationObserver for markup inserted later. From then on the element behaves exactly as
//    with the old attribute, incl. JS clearing a value (el.style.display = "").
//  • runtime values: data-u="${sty(`width:${pct}%`)}" registers the declarations under a key.
// Injected markup cannot bring CSS: data-u only selects from this fixed map (+ sty() registrations).
// Keep this file identical in podfy-portal and podfy-admin; per-repo settings in inline-styles.config.json.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(join(ROOT, "tools/inline-styles.config.json"), "utf8"));
const check = process.argv.includes("--check");

// cfg.htmlDirs: directories scanned recursively for .html (skipping cfg.skipDirs), e.g. a static site
const walkHtml = (dir) => readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? ((cfg.skipDirs || []).includes(e.name) ? [] : walkHtml(join(dir, e.name)))
                  : e.name.endsWith(".html") ? [join(dir, e.name)] : []);
const files = [
  ...cfg.html,
  ...(cfg.htmlDirs || []).flatMap(walkHtml).sort(),
  ...cfg.jsDirs.flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith(".js")).sort().map((f) => join(d, f))),
  ...(cfg.jsFiles || []),
];

const keyOf = (decl) => "u" + createHash("sha1").update(decl).digest("hex").slice(0, 7);
const norm = (v) => v.replace(/\s+/g, " ").trim().replace(/;\s*$/, "");

// Existing map (keys stay stable across runs, so reruns only add)
const MAP_FILE = join(ROOT, cfg.outJs);
const map = {};
if (existsSync(MAP_FILE)) {
  const m = readFileSync(MAP_FILE, "utf8").match(/const U = (\{[\s\S]*?\});\n/);
  if (m) Object.assign(map, JSON.parse(m[1]));
}

// A value is static when it has no template/concatenation parts
const isDynamic = (v) => /\$\{|'\s*\+|\+\s*'|"\s*\+|\+\s*"/.test(v);

let converted = 0, skippedDynamic = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  const src = readFileSync(path, "utf8");
  // @inline-styles:off … @inline-styles:on marks regions that must keep real style attributes
  // (documents rendered in the export frame, which allows inline styles)
  const parts = src.split(/(\/\/ @inline-styles:off[\s\S]*?\/\/ @inline-styles:on)/);
  const out = parts.map((part) => {
    if (part.startsWith("// @inline-styles:off")) return part;
    return part.replace(/(^|[\s])style=(?:"([^"]{0,600})"|'([^'\n]{0,600})')/g, (m, pre, dq, sq) => {
      const q = dq !== undefined ? '"' : "'", val = dq !== undefined ? dq : sq;
      if (isDynamic(val)) { skippedDynamic++; return m; }
      const decl = norm(val);
      if (!decl) return pre.trimEnd() + pre.slice(pre.trimEnd().length);   // style="" → drop
      const k = keyOf(decl);
      if (map[k] && map[k] !== decl) throw new Error(`key collision ${k}`);
      map[k] = decl; converted++;
      return `${pre}data-u=${q}${k}${q}`;
    });
  }).join("");
  if (out !== src) {
    if (check) { console.error(`✖ ${rel}: static style="" attributes left — run node tools/inline-styles.mjs`); process.exitCode = 1; }
    else writeFileSync(path, out);
  }
}

// Split declarations on ';' outside quotes/parentheses
function declarations(text) {
  const out = []; let cur = "", depth = 0, quote = null;
  for (const ch of text) {
    if (quote) { cur += ch; if (ch === quote) quote = null; continue; }
    if (ch === "'" || ch === '"') { quote = ch; cur += ch; continue; }
    if (ch === "(") depth++; if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { if (cur.trim()) out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// Pass 2 — runtime values inside template literals: style="…${x}…" → data-u="${sty(`…${x}…`)}".
// A small scanner finds the closing quote of the attribute while skipping over ${…} expressions
// (which may hold strings, conditionals and nested template literals).
function skipString(t, i, q) { for (i++; i < t.length; i++) { if (t[i] === "\\") { i++; continue; } if (t[i] === q) return i + 1; } throw new Error("unterminated string"); }
function skipTemplate(t, i) {           // i is just after the opening backtick
  for (; i < t.length; i++) {
    if (t[i] === "\\") { i++; continue; }
    if (t[i] === "`") return i + 1;
    if (t.startsWith("${", i)) { i = skipExpr(t, i + 2) - 1; }
  }
  throw new Error("unterminated template");
}
function skipExpr(t, i) {               // i is just after "${" or "{"; returns index after the matching "}"
  for (; i < t.length; ) {
    const c = t[i];
    if (c === "}") return i + 1;
    if (c === "{") { i = skipExpr(t, i + 1); continue; }
    if (c === '"' || c === "'") { i = skipString(t, i, c); continue; }
    if (c === "`") { i = skipTemplate(t, i + 1); continue; }
    i++;
  }
  throw new Error("unterminated expression");
}
let convertedDynamic = 0;
function convertDynamic(text) {
  let out = "", i = 0;
  const re = /(^|[\s])style="/g; let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[1].length, valStart = re.lastIndex;
    let j = valStart;
    while (j < text.length && text[j] !== '"') j = text.startsWith("${", j) ? skipExpr(text, j + 2) : j + 1;
    const val = text.slice(valStart, j);
    if (!val.includes("${")) continue;          // static (pass 1) or not ours
    out += text.slice(i, start) + "data-u=\"${sty(`" + val.trim() + "`)}\"";
    i = j + 1; re.lastIndex = j + 1; convertedDynamic++;
  }
  return out + text.slice(i);
}
for (const d of cfg.jsDirs) for (const f of readdirSync(join(ROOT, d)).filter((f) => f.endsWith(".js"))) {
  const path = join(ROOT, d, f), src = readFileSync(path, "utf8");
  const out = src.split(/(\/\/ @inline-styles:off[\s\S]*?\/\/ @inline-styles:on)/)
    .map((part) => part.startsWith("// @inline-styles:off") ? part : convertDynamic(part)).join("");
  if (out !== src) {
    if (check) { console.error(`✖ ${d}/${f}: runtime style="" attributes left — run node tools/inline-styles.mjs`); process.exitCode = 1; }
    else writeFileSync(path, out);
  }
}

const keys = Object.keys(map).sort();
const css = `/* GENERATED by tools/inline-styles.mjs — do not edit. Renders data-u keys until
   public/inline-styles.js moves them onto the element (see the tool's header). */
${keys.map((k) => `[data-u="${k}"]{${declarations(map[k]).map((d) => /!important\s*$/i.test(d) ? d : d + " !important").join(";")}}`).join("\n")}
`;
const js = `// GENERATED by tools/inline-styles.mjs — do not edit (see the tool's header for how this works).
(function () {
const U = ${JSON.stringify(Object.fromEntries(keys.map((k) => [k, map[k]])), null, 0)};
// Declarations as written (prop, value, priority). Shorthands are kept whole: a shorthand holding
// var() reports empty longhands, so copying longhand by longhand would lose it.
const parsed = new Map();
function decls(k) {
  let d = parsed.get(k);
  if (!d) {
    d = [];
    let cur = "", depth = 0, quote = null;
    const push = () => {
      const t = cur.trim(); cur = "";
      const i = t.indexOf(":"); if (i < 1) return;
      let v = t.slice(i + 1).trim(), prio = "";
      if (/!important$/i.test(v)) { prio = "important"; v = v.replace(/\s*!important$/i, ""); }
      d.push([t.slice(0, i).trim().toLowerCase(), v, prio]);
    };
    for (const ch of U[k] || "") {
      if (quote) { cur += ch; if (ch === quote) quote = null; continue; }
      if (ch === "'" || ch === '"') quote = ch;
      if (ch === "(") depth++; if (ch === ")") depth--;
      if (ch === ";" && depth === 0) { push(); continue; }
      cur += ch;
    }
    push();
    parsed.set(k, d);
  }
  return d;
}
// Same result as the old style attribute. Normally the element has no inline style yet and gets the
// declarations verbatim; if script already set some properties, those are kept (script ran after
// the attribute before, too).
function apply(el) {
  const k = el.getAttribute("data-u");
  if (!k || !(k in U)) return;
  if (!el.style.length) el.style.cssText = U[k];
  else for (const [p, v, prio] of decls(k)) if (!el.style.getPropertyValue(p)) el.style.setProperty(p, v, prio);
  el.removeAttribute("data-u");
}
function applyAll(root) {
  if (root.nodeType !== 1) return;
  if (root.hasAttribute("data-u")) apply(root);
  root.querySelectorAll("[data-u]").forEach(apply);
}
// Runtime values: data-u="\${sty(\`width:\${pct}%\`)}" — registers the declarations, returns the key
let n = 0; const byDecl = new Map();
window.sty = function sty(decl) {
  decl = String(decl);
  let k = byDecl.get(decl);
  if (!k) { k = "d" + (n++).toString(36); U[k] = decl; byDecl.set(decl, k); }
  return k;
};
applyAll(document.documentElement);
// Apply at the moment markup is parsed — exactly when the old attribute took effect — so script
// that runs right after (el.style.cssText = …, measuring layout) sees the same state as before.
const hook = (proto, prop, after) => {
  const d = Object.getOwnPropertyDescriptor(proto, prop);
  Object.defineProperty(proto, prop, { ...d, set(v) { d.set.call(this, v); after(this); } });
};
hook(Element.prototype, "innerHTML", (el) => applyAll(el));
hook(Element.prototype, "outerHTML", () => applyAll(document.documentElement));
const iah = Element.prototype.insertAdjacentHTML;
Element.prototype.insertAdjacentHTML = function (pos, html) {
  iah.call(this, pos, html);
  applyAll(pos === "beforebegin" || pos === "afterend" ? (this.parentElement || document.documentElement) : this);
};
// Backstop for anything else that inserts markup (DOMParser + adoptNode, templates, …)
new MutationObserver((records) => {
  for (const r of records) for (const node of r.addedNodes) applyAll(node);
}).observe(document.documentElement, { childList: true, subtree: true });
})();
`;
for (const [file, content] of [[cfg.outCss, css], [cfg.outJs, js]]) {
  const p = join(ROOT, file);
  const old = existsSync(p) ? readFileSync(p, "utf8") : "";
  if (old !== content) {
    if (check) { console.error(`✖ ${file} is stale — run node tools/inline-styles.mjs`); process.exitCode = 1; }
    else writeFileSync(p, content);
  }
}
console.log(`${check ? "checked" : "converted"} ${converted} static attributes (${keys.length} keys) · ${convertedDynamic} runtime-valued → sty()`);
