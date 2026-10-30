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

test("homepage chooser, solutions hub, pricing and contact carry the generated blocks in every locale", () => {
  for (const loc of LOCALES) {
    const home = readFileSync(`${ROOT}${loc}index.html`, "utf8");
    assert.match(home, new RegExp(`class="door door--cmr" href="/${loc}cmr/"`), `${loc}: CMR door`);
    assert.match(home, new RegExp(`class="door door--qr" href="/${loc}qr/"`), `${loc}: QR door`);
    assert.match(home, /"@type": "Organization"/, `${loc}: Organization JSON-LD kept`);
    assert.match(home, /"@type": "FAQPage"/, `${loc}: homepage FAQ`);
    assert.match(home, /class="home-cmp-table"/, `${loc}: comparison table`);
    assert.match(readFileSync(`${ROOT}${loc}solutions/index.html`, "utf8"), /QR Reporting banner \(generated/);
    assert.match(readFileSync(`${ROOT}${loc}pricing.html`, "utf8"), /id="report-pricing"/);
    const contact = readFileSync(`${ROOT}${loc}contact.html`, "utf8");
    for (const c of CASES) assert.match(contact, new RegExp(`value="report-${c}"`), `${loc}contact: ${c}`);
    assert.match(contact, /name="asset_count"/);
  }
});

test("landing pages /qr/ and /cmr/ exist in every locale: indexable, with the demo form", () => {
  for (const loc of LOCALES) for (const lp of ["qr", "cmr"]) {
    const f = `${ROOT}${loc}${lp}/index.html`;
    assert.ok(existsSync(f), `missing ${f}`);
    const s = readFileSync(f, "utf8");
    const title = decode(s.match(/<title>(.*?)<\/title>/)[1]);
    const desc = decode(s.match(/<meta name="description" content="(.*?)"/)[1]);
    assert.ok(title.length <= 60, `${f}: title ${title.length} chars`);
    assert.ok(desc.length <= 155, `${f}: description ${desc.length} chars`);
    assert.match(s, /<meta name="robots" content="index,follow/);
    assert.equal((s.match(/rel="alternate" hreflang="/g) || []).length, 5);
    for (const id of ["contact-form", "contact-name", "contact-email", "contact-sector", "contact-message", "contact-consent", "hp_contact", "contact-turnstile-token", "contact-success", "contact-error"])
      assert.match(s, new RegExp(`id="${id}"`), `${f}: form field ${id}`);
    if (lp === "qr") for (const c of CASES) assert.match(s, new RegExp(`value="report-${c}"`), `${f}: ${c}`);
    if (lp === "cmr") { assert.doesNotMatch(s, /value="report-/, `${f}: QR options on CMR form`); assert.match(s, new RegExp(`href="/${loc}cmr/generator/"`)); }
    const body = s.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<title>.*?<\/title>/, "");
    assert.doesNotMatch(body, /[\u2013\u2014]/, `${f}: em/en dash`);
  }
});

test("CMR generator moved to /cmr/generator/ in every locale, and no link still treats /cmr/ as the generator", () => {
  for (const loc of LOCALES) {
    const g = readFileSync(`${ROOT}${loc}cmr/generator/index.html`, "utf8");
    assert.match(g, new RegExp(`<link rel="canonical" href="https://podfy.net/${loc}cmr/generator/"`));
  }
  for (const f of ["partials/header.html", "partials/footer.html", "pricing.html"]) {
    const s = readFileSync(`${ROOT}${f}`, "utf8");
    assert.doesNotMatch(s, />CMR generator<\/a>/.test(s) ? /href="\/cmr\/"[^>]*>CMR generator/ : /$^/, `${f}: CMR generator link points at /cmr/`);
  }
});

test("sitemap: every URL has a real <lastmod> (stamped from git by tools/sitemap-lastmod.mjs), no duplicates", () => {
  const xml = readFileSync(`${ROOT}sitemap.xml`, "utf8");
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g);
  const locs = blocks.map((b) => b.match(/<loc>([^<]+)<\/loc>/)[1]);
  assert.equal(new Set(locs).size, locs.length, "duplicate <loc>");
  for (const b of blocks) {
    const m = b.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/);
    assert.ok(m, `no lastmod: ${b.match(/<loc>([^<]+)/)[1]}`);
    assert.ok(m[1] <= new Date().toISOString().slice(0, 10), `lastmod in the future: ${m[1]}`);
  }
});

test("QR price list and company facts are consistent in every locale", () => {
  const norm = (s) => s.replace(/ /g, " ").replace(",", ".").replace(/[€ ]/g, "");
  for (const loc of LOCALES) {
    const pricing = readFileSync(`${ROOT}${loc}pricing.html`, "utf8");
    const prices = [...pricing.matchAll(/class="qrp-price">([^<]*)</g)].map((m) => norm(m[1]));
    assert.deepEqual(prices, ["0.75", "0.60", "0.50", "0.40"], `${loc}pricing: QR tiers`);
    assert.match(pricing, /"name": "QR Reporting", "price": "0.75"/, `${loc}pricing: QR offer JSON-LD`);
    const faqPrice = readFileSync(`${ROOT}${loc}qr/index.html`, "utf8");
    assert.match(faqPrice.replace(/ /g, " "), /0[.,]75/, `${loc}qr: price in FAQ`);
    const home = readFileSync(`${ROOT}${loc}index.html`, "utf8");
    assert.match(home, /"legalName": "Lake-Project"/); assert.match(home, /"propertyID": "KvK", "value": "29816688"/);
    const contact = readFileSync(`${ROOT}${loc}contact.html`, "utf8");
    assert.match(contact, /id="company"[\s\S]*29816688[\s\S]*NL001170142B85/, `${loc}contact: company details`);
  }
});
