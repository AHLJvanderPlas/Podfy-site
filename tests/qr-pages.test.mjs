// Guard for the generated QR Reporting pages (scripts/qr-pages/build.py): every locale has the
// overview + every case page, with SEO limits, hreflang ×4 and no em/en dashes in the copy.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const ROOT = new URL("../", import.meta.url).pathname;
const CASES = ["ev-chargers", "parcel-lockers", "trailers-containers", "vending-machines", "coffee-machines",
  "printers-copiers", "restrooms-cleaning", "fitness-equipment", "waste-containers", "remote-equipment"];
const LOCALES = ["", "nl/", "de/", "fr/"];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

test("QR Reporting pages exist in every locale and meet the SEO and copy rules", () => {
  for (const loc of LOCALES) {
    for (const path of ["", ...CASES.map((c) => c + "/")]) {
      const f = `${ROOT}${loc}solutions/qr-issue-reporting/${path}index.html`;
      assert.ok(existsSync(f), `missing ${f}`);
      const s = readFileSync(f, "utf8");
      const title = decode(s.match(/<title>(.*?)<\/title>/)[1]);
      const desc = decode(s.match(/<meta name="description" content="(.*?)"/)[1]);
      assert.ok(title.length <= 60, `${f}: title ${title.length} chars`);
      assert.ok(desc.length <= 155, `${f}: description ${desc.length} chars`);
      assert.equal((s.match(/rel="alternate" hreflang="/g) || []).length, 5, `${f}: hreflang en/nl/de/fr + x-default`);
      assert.doesNotMatch(s, /noindex/, `${f}: noindex`);
      const body = s.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<title>.*?<\/title>/, "");
      assert.doesNotMatch(body, /[–—]/, `${f}: em/en dash in copy`);
    }
  }
});

test("homepage, solutions hub, pricing and contact carry the generated QR blocks in every locale", () => {
  for (const loc of LOCALES) {
    assert.match(readFileSync(`${ROOT}${loc}index.html`, "utf8"), /QR Reporting band \(generated/);
    assert.match(readFileSync(`${ROOT}${loc}solutions/index.html`, "utf8"), /QR Reporting banner \(generated/);
    assert.match(readFileSync(`${ROOT}${loc}pricing.html`, "utf8"), /id="report-pricing"/);
    const contact = readFileSync(`${ROOT}${loc}contact.html`, "utf8");
    for (const c of CASES) assert.match(contact, new RegExp(`value="report-${c}"`), `${loc}contact: ${c}`);
    assert.match(contact, /name="asset_count"/);
  }
});
