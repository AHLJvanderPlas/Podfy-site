// The staging rule of deploy.sh: from docs/ only the API reference (page + spec) and the webhook guide are published.
// Runs ./deploy.sh build into a temporary directory (build mode never deploys).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, statSync, rmSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";

const ROOT = new URL("../", import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

test("deploy.sh build publishes exactly the intended docs files and nothing else from docs/", { skip: !existsSync("/usr/bin/rsync") && !existsSync("/opt/homebrew/bin/rsync") && !existsSync("/usr/local/bin/rsync") }, () => {
  const out = join(mkdtempSync(join(tmpdir(), "podfy-stage-")), "dist");
  try {
    execFileSync("bash", [join(ROOT, "deploy.sh"), "build"], { cwd: ROOT, env: { ...process.env, DIST_DIR: out, SKIP_LASTMOD: "1" }, stdio: "pipe" });
    const files = walk(out).map((f) => relative(out, f));
    const docs = files.filter((f) => /(^|\/)docs\//.test(f)).sort();
    assert.deepEqual(docs, ["docs/api/index.html", "docs/api/openapi.json", "docs/webhooks/index.html",
      ...["de", "fr", "nl"].flatMap((l) => [`${l}/docs/api/index.html`, `${l}/docs/webhooks/index.html`])].sort());
    // the locale copies sit outside docs/ and are published
    for (const l of ["nl", "de", "fr"]) {
      assert.ok(files.includes(`${l}/docs/api/index.html`), `${l} api page`);
      assert.ok(files.includes(`${l}/docs/webhooks/index.html`), `${l} webhook page`);
    }
    assert.ok(!files.some((f) => f.startsWith("docs/") && f.endsWith(".md")), "no markdown from docs/");
    assert.ok(!files.some((f) => /settings\.local\.json|wrangler\.toml|CLAUDE\.md/.test(f)));
  } finally { rmSync(join(out, ".."), { recursive: true, force: true }); }
});

test("deploy.sh refuses DIST_DIR outside build mode", () => {
  assert.throws(() => execFileSync("bash", ["-c", "DIST_DIR=/tmp/x SKIP_LASTMOD=1 ./deploy.sh --help"], { cwd: ROOT, stdio: "pipe", env: { ...process.env, PATH: process.env.PATH } }));
});
