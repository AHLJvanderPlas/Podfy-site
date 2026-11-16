// The site names PODFY's legal entity as Lake-Project (KvK 29816688, Rodenrijselaan 10A, Rotterdam).
// Fails if an old address or registry number reappears in a page or the llms files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const SKIP = new Set(["node_modules", "dist", ".git", ".wrangler", "migrations", "tests"]);
const OLD = /Van Weede|Weede van Dijkveld|Koperslager|83714200|93270440|NL862966851B01|NL005041714B60|2582 ?KP|5223 ?AL/;
const walk = (d) => readdirSync(d).flatMap((f) => {
  if (SKIP.has(f)) return [];
  const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p];
});

test("no old company address or KvK/VAT numbers on the site", () => {
  const hits = walk(ROOT).filter((f) => /\.(html|txt|md|js)$/.test(f) && OLD.test(readFileSync(f, "utf8")));
  assert.deepEqual(hits.map((f) => f.replace(ROOT, "")), []);
});

// The company was founded in 2021 and sits at Rodenrijselaan 10A, Rotterdam. The Hague only appears as the
// court of jurisdiction (terms) and the address of the Dutch data protection authority; never as a founding place.
const HAGUE_FOUNDING = /founded in The Hague|opgericht in Den Haag|gegründet in Den Haag|fondée à La Haye|foundingLocation[^}]*(Hague|Gravenhage|Den Haag|La Haye)|in 's-Gravenhage/i;
test("no page or llms file says the company was founded in The Hague", () => {
  const hits = walk(ROOT).filter((f) => /\.(html|txt)$/.test(f) && HAGUE_FOUNDING.test(readFileSync(f, "utf8")));
  assert.deepEqual(hits.map((f) => f.replace(ROOT, "")), []);
});
