// Claims that were corrected in the 2026-11 hardening round must not come back (docs/podfy-claims-register.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const SKIP = new Set(["node_modules", "dist", ".git", ".wrangler", "migrations", "tests", "docs", "instructions", "scripts", "tools"]);
const walk = (d) => readdirSync(d).flatMap((f) => {
  if (SKIP.has(f)) return [];
  const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p];
});
const FILES = walk(ROOT).filter((f) => /\.(html|txt)$/.test(f)).map((f) => [f.replace(ROOT, ""), readFileSync(f, "utf8")]);
const SRC = ["scripts/qr-pages/build.py", ...["en", "nl", "de", "fr"].map((l) => `scripts/qr-pages/content/${l}.py`)]
  .map((f) => [f, readFileSync(join(ROOT, f), "utf8")]);
const none = (re, files = FILES) => assert.deepEqual(files.filter(([, s]) => re.test(s)).map(([f]) => f), []);

test("the 7-year archive is never claimed for all plans or as included", () => {
  none(/7[- ]?(year|jaar|jarig|ans|jahre)[^<\n]{0,40}(\(all plans\)|\(alle abonnementen\)|\(toutes formules\)|all plans|included(?! on Enterprise)|inbegrepen(?! bij Enterprise)|inclus(?! avec Enterprise)|incluse)|7yr archive|any plan as a retention add-on/i);
  none(/7[- ]?(year|jaar|ans)[^<\n]{0,40}(\(all plans\)|all plans|included\b)/i, SRC);
});

test("footer badge says EU storage, not 'EU only'", () => {
  none(/EU (&middot;|·) only/i, [...FILES, ["partials/footer.html", readFileSync(join(ROOT, "partials/footer.html"), "utf8")]]);
});

test("backups are described as database backups (files are not in the nightly backup)", () => {
  none(/daily backups|dagelijkse back-ups|tägliche backups|sauvegardes quotidiennes[^ ]/i);
  none(/daily backups|"Dagelijkse back-ups"|"Tägliche Backups"|"Sauvegardes quotidiennes"/i, SRC);
});

test("the restore-tested claim only appears on the trust pages, with the drill date", () => {
  const hits = FILES.filter(([, s]) => /restore was tested|herstel is getest|Wiederherstellung wurde|restauration a été testée/.test(s)).map(([f]) => f).sort();
  assert.deepEqual(hits, ["de/trust.html", "fr/trust.html", "nl/trust.html", "trust.html"]);
});

test("the pricing FAQ explains the volume bands with the real numbers from QR_TIERS", () => {
  const src = readFileSync(join(ROOT, "scripts/qr-pages/build.py"), "utf8");
  const tiers = [...src.match(/QR_TIERS = \[(.*)\]/)[1].matchAll(/\((\d+), (\d+|None), ([\d.]+)\)/g)].map((m) => [+m[1], m[2] === "None" ? null : +m[2], +m[3]]);
  const [n1, p1] = [tiers[0][1], tiers[0][2]], [n2, p2] = [tiers[1][0], tiers[1][2]];
  const c1 = (n1 * p1).toFixed(2), c2 = (n2 * p2).toFixed(2);
  assert.ok(+c2 < +c1, "the example only works while the next band is cheaper in total");
  const fmt = (v, de) => { const s = +v % 1 ? (+v).toFixed(2) : String(+v); return de ? s.replace(".", ",") : s; };
  for (const [file, de] of [["pricing.html", false], ["nl/pricing.html", true], ["de/pricing.html", true], ["fr/pricing.html", true]]) {
    const s = readFileSync(join(ROOT, file), "utf8");
    const block = s.match(/id="report-pricing-bands">([\s\S]*?)<\/div>/);
    assert.ok(block, `${file}: band question present`);
    assert.ok(block[1].includes(fmt(c1, de)) && block[1].includes(fmt(c2, de)), `${file}: totals ${c1} and ${c2} in the answer`);
    assert.ok(block[1].includes(String(n1)) && block[1].includes(String(n2)), `${file}: ${n1} and ${n2} assets in the answer`);
  }
});
