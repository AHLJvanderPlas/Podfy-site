// tools/sitemap-lastmod.mjs — sets <lastmod> on every sitemap.xml entry to the date the page's source
// file last changed: its last git commit date, or today when the file has uncommitted changes.
// Google only trusts lastmod when it is consistently accurate; hand-maintained dates drifted months
// behind (the homepage said 2026-05-30 after its 2026-10-30 rebuild). Run by deploy.sh and by
// scripts/qr-pages/build.py, so it never needs maintaining by hand.
//   node tools/sitemap-lastmod.mjs
// URLs without a static file (Pages Functions such as /insights/) keep the lastmod they have.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const SITE = "https://podfy.net";
const today = new Date().toISOString().slice(0, 10);
const git = (...args) => { try { return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return ""; } };

function sourceFile(loc) {
  const path = loc.slice(SITE.length).replace(/^\//, "");
  const candidates = path === "" ? ["index.html"]
    : path.endsWith("/") ? [path + "index.html", path.slice(0, -1) + ".html"]
    : [path + ".html", path + "/index.html", path];
  return candidates.find((f) => existsSync(join(ROOT, f)));
}

// A line that only re-wires assets (stylesheet ?v= bumps, content-addressed script/style files) is
// not a content change: otherwise one CSS fix would mark every page as changed today.
const WIRING = /\?v=|\/assets\/(?:js|css)\/i\//;
const meaningful = (diff) => diff.split("\n").some((l) => /^[+-](?![+-])/.test(l) && l.slice(1).trim() && !WIRING.test(l));

function changed(file) {
  if (meaningful(git("diff", "HEAD", "-U0", "--", file))) return today;
  for (const row of git("log", "--format=%H %cs", "--", file).split("\n").filter(Boolean)) {
    const [sha, date] = row.split(" ");
    if (meaningful(git("show", "--format=", "-U0", sha, "--", file))) return date;
  }
  return git("log", "-1", "--format=%cs", "--", file) || today;
}

const p = join(ROOT, "sitemap.xml");
const xml = readFileSync(p, "utf8");
let stamped = 0, kept = 0;
const out = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  const loc = (inner.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  const file = loc && loc.startsWith(SITE) && sourceFile(loc);
  if (!file) { kept++; return block; }
  const date = changed(file);
  stamped++;
  if (/<lastmod>[^<]*<\/lastmod>/.test(inner)) return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`);
  return block.replace(/(<loc>[^<]+<\/loc>)/, `$1<lastmod>${date}</lastmod>`);
});
if (out !== xml) writeFileSync(p, out);
console.log(`sitemap lastmod: ${stamped} stamped from git, ${kept} kept (no static file)`);
