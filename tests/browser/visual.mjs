// Visual regression check for the site (every page, desktop + mobile) — run before and after a
// styling/markup refactor:
//   node tests/browser/visual.mjs capture <dir>      (builds dist/, serves it locally on local D1)
//   node tests/browser/visual.mjs compare <a> <b>    (pixel-exact; exit 1 on any difference)
// Also fails the capture on page errors and CSP violations (report-only included).
import { spawn, execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("../../", import.meta.url).pathname;
const PORT = 8794, BASE = `http://localhost:${PORT}`;
const FIXED = new Date("2026-09-30T10:00:00Z");
const [mode, a, b] = process.argv.slice(2);

function pages() {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (!["partials", "node_modules", "instructions"].includes(n)) walk(p); continue; }
    if (n.endsWith(".html") && n !== "404.html") out.push("/" + relative(join(ROOT, "dist"), p).replace(/index\.html$/, "").replace(/\.html$/, ""));
  } };
  walk(join(ROOT, "dist"));
  return [...out.sort(), "/insights", "/insights/repository", "/insights/linkedin"];
}

async function serve() {
  if (!process.env.NO_BUILD) execSync("./deploy.sh build", { cwd: ROOT, stdio: "ignore" });
  const state = mkdtempSync(join(tmpdir(), "site-visual-"));
  const { getPlatformProxy } = await import("wrangler");
  const proxy = await getPlatformProxy({ configPath: join(ROOT, "wrangler.toml"), persist: { path: join(state, "v3") } });
  for (const [db, file] of [[proxy.env.DB, "schema-public.sql"], [proxy.env.MAIN_DB, "schema-main.sql"]])
    for (const stmt of readFileSync(new URL(file, import.meta.url), "utf8").split(/;\s*\n/)) {
      const sql = stmt.replace(/^\s*--.*$/gm, "").trim(); if (sql) await db.prepare(sql).run();
    }
  await proxy.dispose();
  try { await fetch(BASE + "/"); throw new Error(`port ${PORT} busy`); } catch (e) { if (e.message.startsWith("port")) throw e; }
  const server = spawn("npx", ["wrangler", "pages", "dev", "dist", "--port", String(PORT), "--persist-to", state, "--log-level", "error"],
    { cwd: ROOT, stdio: "ignore", detached: true });
  const stop = () => { try { process.kill(-server.pid); } catch {} rmSync(state, { recursive: true, force: true }); };
  process.once("exit", stop);
  for (let i = 0; ; i++) { try { if ((await fetch(BASE + "/")).ok) break; } catch {} if (i > 60) throw new Error("server did not start"); await new Promise((r) => setTimeout(r, 1000)); }
  return stop;
}

if (mode === "capture") {
  mkdirSync(a, { recursive: true });
  const stop = await serve();
  const browser = await chromium.launch();
  const problems = [];
  for (const [label, viewport] of [["d", { width: 1280, height: 900 }], ["m", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
    await ctx.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) =>
      console.error(`CSP ${e.disposition} ${e.effectiveDirective} ${e.blockedURI || "inline"} ${e.sourceFile}:${e.lineNumber}`)));
    const page = await ctx.newPage(); await page.clock.setFixedTime(FIXED);
    // Turnstile refuses localhost (error 110200) — expected locally, not a code problem
    page.on("pageerror", (e) => { if (!/Turnstile/.test(e.message)) problems.push(`[pageerror] ${page.url()} ${e.message}`); });
    page.on("console", (m) => { if (m.type() === "error" && /^CSP /.test(m.text())) problems.push(`[csp] ${page.url()} ${m.text()}`); });
    const list = label === "d" ? pages() : pages().filter((p) => p.split("/").length <= 3);
    for (const path of list) {
      await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(250);
      const name = `${label}${path.replace(/\//g, "_") || "_root"}.png`;
      await page.screenshot({ path: join(a, name), fullPage: true, animations: "disabled",
        mask: [page.locator('.cf-turnstile, iframe[src*="challenges.cloudflare.com"]')] });
    }
    await ctx.close();
  }
  await browser.close(); stop();
  console.log(`captured ${readdirSync(a).length} images → ${a}`);
  if (problems.length) { console.log(`\n${problems.length} problem(s):\n` + [...new Set(problems)].slice(0, 40).join("\n")); process.exitCode = 1; }
} else if (mode === "compare") {
  const files = readdirSync(a).filter((f) => f.endsWith(".png")).sort();
  const browser = await chromium.launch(); const page = await browser.newPage(); let failed = 0;
  for (const f of files) {
    let other; try { other = readFileSync(join(b, f)); } catch { console.log(`✖ ${f}: missing`); failed++; continue; }
    const r = await page.evaluate(async ([x, y]) => {
      const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
      const [ia, ib] = await Promise.all([load(x), load(y)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { size: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
      const px = (img) => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
      const da = px(ia), db = px(ib); let diff = 0, y0 = 1e9, y1 = -1;
      for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i+1] !== db[i+1] || da[i+2] !== db[i+2] || da[i+3] !== db[i+3]) { diff++; const yy = Math.floor(i / 4 / ia.width); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy); }
      return { diff, rows: diff ? `${y0}-${y1}` : "" };
    }, [readFileSync(join(a, f)).toString("base64"), other.toString("base64")]);
    if (r.size) { console.log(`✖ ${f}: size ${r.size}`); failed++; }
    else if (r.diff) { console.log(`✖ ${f}: ${r.diff} px differ (rows ${r.rows})`); failed++; }
  }
  await browser.close();
  console.log(failed ? `\n${failed} of ${files.length} differ` : `all ${files.length} identical`);
  if (failed) process.exit(1);
}
