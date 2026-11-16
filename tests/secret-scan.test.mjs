// Secret scan: fails when a tracked file holds a literal that looks like a real credential.
// Identical copy in every PODFY repo (plans/80-hardening.md step 0). Secrets live in Worker/Pages
// secrets and the vault outside the repos, never in a tracked file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Prefix + enough key material, so documentation such as "pk_live_…" or "re_xxx" does not match.
export const PATTERNS = [
  ["Cloudflare API token", /cfat_[A-Za-z0-9_-]{20,}/],
  ["Resend API key", /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{12,}/],
  ["Mollie live key", /\blive_[A-Za-z0-9]{20,}/],
  ["Anthropic API key", /sk-ant-[A-Za-z0-9_-]{16,}/],
  ["PODFY live API key", /pk_live_[A-Za-z0-9]{16,}/],
];

export function findSecrets(text) {
  const hits = [];
  for (const [name, re] of PATTERNS) if (re.test(text)) hits.push(name);
  return hits;
}

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
    .toString("utf8").split("\0").filter(Boolean);
}

test("no credential literals in tracked files", () => {
  const found = [];
  for (const rel of trackedFiles()) {
    const abs = join(ROOT, rel);
    let st;
    try { st = statSync(abs); } catch { continue; }      // deleted in the working tree
    if (!st.isFile() || st.size > 8 * 1024 * 1024) continue;
    const buf = readFileSync(abs);
    if (buf.subarray(0, 8000).includes(0)) continue;       // binary
    for (const name of findSecrets(buf.toString("utf8"))) found.push(`${rel}: ${name}`);
  }
  assert.deepEqual(found, [], "credential-looking literal in a tracked file (move it to a secret + the vault)");
});

test("the scanner recognises every credential shape", () => {
  // Built at run time so this file never contains a matching literal itself.
  const body = "A1b2C3d4E5f6G7h8J9k0L1m2N3p4Q5r6";
  const samples = ["cfat" + "_" + body, "re" + "_" + "AbCd1234" + "_" + body, "live" + "_" + body,
    "sk-ant" + "-" + body, "pk_live" + "_" + body];
  samples.forEach((s, i) => assert.deepEqual(findSecrets(`key = "${s}"`), [PATTERNS[i][0]]));
  assert.deepEqual(findSecrets("Bearer pk_live_… or re_xxx, live_ mode, sk-ant-<key>"), []);
});
