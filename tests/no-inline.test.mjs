// The CSP forbids inline script, style and handlers. Guards for the static pages and SSR templates.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const run = (f) => execFileSync("node", [f, "--check"], { cwd: ROOT, stdio: "pipe" });

test("no inline <script>/<style> blocks; content-addressed assets and ?v= wiring current", () => {
  assert.doesNotThrow(() => run("tools/extract-inline.mjs"));
});
test("no style=\"\" attributes; generated inline-styles files current", () => {
  assert.doesNotThrow(() => run("tools/inline-styles.mjs"));
});
test("no inline on*=\"\" handlers in pages or insights templates", () => {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (!["node_modules", ".git", "dist", "tests", "tools", "email", "api"].includes(n)) walk(p); }
    else if (n.endsWith(".html") || (p.includes("/functions/") && n.endsWith(".js"))) files.push(p);
  } };
  walk(ROOT);
  for (const p of files) assert.deepEqual(readFileSync(p, "utf8").match(/\son[a-z]+=["']/g) ?? [], [], p);
});
