// Webhook receiver guide (/docs/webhooks, x4): page contract, and the code samples proven against the shared signer.
// The signature tests need ../plans/process-core.js (signWebhook) and are skipped when it is absent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { tmpdir } from "node:os";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url).pathname;
const CORE = join(ROOT, "..", "plans", "process-core.js");
const PAGES = { en: "docs/webhooks/index.html", nl: "nl/docs/webhooks/index.html", de: "de/docs/webhooks/index.html", fr: "fr/docs/webhooks/index.html" };
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const unescapeHtml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
const codeById = (html, id) => {
  const m = html.match(new RegExp(`<code id="${id}">([\\s\\S]*?)</code>`));
  assert.ok(m, `code block ${id}`);
  return unescapeHtml(m[1]);
};

test("webhook guide: all locales, limits, hreflang, canonical, no dashes, no inline code, no third-party script", () => {
  for (const [lang, f] of Object.entries(PAGES)) {
    const s = read(f);
    const title = unescapeHtml(s.match(/<title>(.*?)<\/title>/)[1]);
    const desc = unescapeHtml(s.match(/<meta name="description" content="(.*?)"/)[1]);
    assert.ok(title.length <= 60, `${lang} title ${title.length}`);
    assert.ok(desc.length <= 155, `${lang} description ${desc.length}`);
    assert.match(s, new RegExp(`<html lang="${lang}"`));
    assert.match(s, new RegExp(`rel="canonical" href="https://podfy.net${lang === "en" ? "" : "/" + lang}/docs/webhooks/"`));
    for (const l of ["en", "nl", "de", "fr", "x-default"]) assert.match(s, new RegExp(`hreflang="${l}"`));
    assert.doesNotMatch(s, /<script(?![^>]*\bsrc=)(?![^>]*ld\+json)/);
    assert.doesNotMatch(s, /<script[^>]+src="https?:/);
    assert.doesNotMatch(s, /style="/);
    const prose = s.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<title>[\s\S]*?<\/title>/, "");
    assert.doesNotMatch(prose, /[—–]/, `${lang}: em/en dash in copy`);
    for (const ev of ["pod.created", "report.created", "record.status_changed", "record.updated", "webhook.test", "refund.approved", "refund.updated"]) assert.ok(s.includes(ev), `${lang} ${ev}`);
    for (const h of ["Podfy-Signature", "Podfy-Delivery", "record.updated_at", "5 minutes", "1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours and 12 hours", "10 seconds", "24 hours"]) assert.ok(s.includes(h), `${lang}: ${h}`);
  }
});

test("webhook guide: registers (NL u, DE Sie, FR vous) and wiring (sitemap, llms, footer, api link)", () => {
  assert.match(read(PAGES.nl), /\bu\b/); assert.doesNotMatch(read(PAGES.nl), /\b(jouw|je kunt|jullie)\b/i);
  assert.match(read(PAGES.de), /\bSie\b/); assert.doesNotMatch(read(PAGES.de), /\b(du kannst|dein|euer)\b/i);
  assert.match(read(PAGES.fr), /\bvous\b/); assert.doesNotMatch(read(PAGES.fr), /\b(tu peux|ton |ta )\b/i);
  const sm = read("sitemap.xml");
  for (const u of ["https://podfy.net/docs/webhooks/", "https://podfy.net/nl/docs/webhooks/", "https://podfy.net/de/docs/webhooks/", "https://podfy.net/fr/docs/webhooks/"]) assert.equal(sm.split(`<loc>${u}</loc>`).length - 1, 1, u);
  assert.match(read("llms.txt"), /podfy\.net\/docs\/webhooks\//);
  assert.match(read("llms-full.txt"), /Source: https:\/\/podfy\.net\/docs\/webhooks\//);
  assert.match(read("partials/footer.html"), /href="\/docs\/webhooks\/">Webhook guide/);
  for (const [lang, f] of Object.entries({ en: "docs/api/index.html", nl: "nl/docs/api/index.html", de: "de/docs/api/index.html", fr: "fr/docs/api/index.html" }))
    assert.ok(read(f).includes(`href="${lang === "en" ? "" : "/" + lang}/docs/webhooks/"`), `${lang}: /docs/api links to the webhook guide`);
});

// ── code samples ──────────────────────────────────────────────────────────────────────────────
const en = read(PAGES.en);
const nodeSource = codeById(en, "sample-node");
const pySource = codeById(en, "sample-python");

test("webhook guide: the samples are syntactically valid (receivers included)", () => {
  new vm.Script(codeById(en, "sample-node-server"));
  new vm.Script(nodeSource);
  const dir = mkdtempSync(join(tmpdir(), "whdoc-"));
  try {
    writeFileSync(join(dir, "s.py"), codeById(en, "sample-python-server").replace(/^HTTPServer.*$/m, "pass"));
    execFileSync("python3", ["-I", "-c", "import ast,sys;ast.parse(open(sys.argv[1]).read())", join(dir, "s.py")]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

const core = existsSync(CORE) ? await import(CORE) : null;
const SKIP = core ? false : "../plans/process-core.js not found";
const verifyNode = (() => {
  const dir = mkdtempSync(join(tmpdir(), "whdoc-"));
  writeFileSync(join(dir, "verify.cjs"), nodeSource);
  return createRequire(join(dir, "x.cjs"))("./verify.cjs").verifyPodfyWebhook;
})();
const verifyPy = (secret, header, delivery, body, now) => {
  const dir = mkdtempSync(join(tmpdir(), "whdoc-"));
  try {
    writeFileSync(join(dir, "verify.py"), pySource);
    const out = execFileSync("python3", ["-I", "-c", "import sys,json;sys.path.insert(0,sys.argv[1]);from verify import verify_podfy_webhook as v;a=json.load(sys.stdin);print(v(a['s'],a['h'],a['d'],a['b'].encode(),now=a['n']))", dir],
      { input: JSON.stringify({ s: secret, h: header, d: delivery, b: body, n: now }) }).toString().trim();
    return out === "True";
  } finally { rmSync(dir, { recursive: true, force: true }); }
};

const SECRET = "whsec_test_secret_0123456789", PREVIOUS = "whsec_previous_secret_9876543210";
const BODY = '{"id":"evt_1","version":1,"event":"report.created","record":{"podfy_id":"PFY-1","updated_at":"2026-11-16T09:24:00Z","note":"café — ok"}}';
const DELIVERY = "dlv_0a1b2c3d4e5f60718293";
const T = 1795000000;

for (const [name, verify] of [["Node.js", (...a) => verifyNode(...a)], ["Python", verifyPy]]) {
  test(`webhook guide: ${name} sample against signWebhook (v1, v2, rotation, tamper, age)`, { skip: SKIP }, async () => {
    const bodyArg = name === "Node.js" ? Buffer.from(BODY) : BODY;
    const v = (secret, header, delivery, body, now) => verify(secret, header, delivery, name === "Node.js" ? Buffer.from(body) : body, now);
    const v1only = await core.signWebhook(SECRET, BODY, T);                                   // t=..,v1=..
    const both = await core.signWebhook(SECRET, BODY, T, { deliveryId: DELIVERY });           // t=..,v1=..,v2=..
    const rotated = await core.signWebhook(SECRET, BODY, T, { deliveryId: DELIVERY, previousSecret: PREVIOUS });
    assert.ok(v(SECRET, v1only, DELIVERY, BODY, T), "v1 only");
    assert.ok(v(SECRET, v1only, "", BODY, T), "v1 without delivery id");
    assert.ok(v(SECRET, both, DELIVERY, BODY, T), "v2");
    assert.ok(v(SECRET, both, DELIVERY, BODY, T + 299), "within 5 minutes");
    assert.ok(v(SECRET, rotated, DELIVERY, BODY, T), "rotation: new secret");
    assert.ok(v(PREVIOUS, rotated, DELIVERY, BODY, T), "rotation: previous secret");
    assert.ok(!v(SECRET, both, DELIVERY, BODY.replace("PFY-1", "PFY-2"), T), "tampered body");
    assert.ok(!v(SECRET, both, DELIVERY, BODY, T + 301), "old timestamp");
    assert.ok(!v(SECRET, both, DELIVERY, BODY, T - 301), "timestamp in the future");
    assert.ok(!v("whsec_wrong", both, DELIVERY, BODY, T), "wrong secret");
    assert.ok(!v(SECRET, both, "dlv_other", BODY, T), "v2 binds the delivery id");
    assert.ok(!v(SECRET, "", DELIVERY, BODY, T), "missing header");
    assert.ok(!v(SECRET, "garbage", DELIVERY, BODY, T), "garbage header");
    // the sample agrees with the shared verifier
    assert.equal(await core.verifyWebhookSignature(SECRET, both, BODY, T, 300, { deliveryId: DELIVERY }), "valid");
    void bodyArg;
  });
}

test("webhook guide: the worked example on the page is a real signature the samples accept", { skip: SKIP }, async () => {
  const secret = codeById(en, "we-secret"), t = Number(codeById(en, "we-t")), delivery = codeById(en, "we-delivery");
  const body = codeById(en, "we-body"), header = codeById(en, "we-header");
  assert.equal(await core.signWebhook(secret, body, t, { deliveryId: delivery }), header);
  assert.ok(verifyNode(secret, header, delivery, Buffer.from(body), t));
  assert.ok(verifyPy(secret, header, delivery, body, t));
  assert.ok(!verifyNode(secret, header, delivery, Buffer.from(body + " "), t));
  assert.ok(JSON.parse(body).version === 1 && JSON.parse(body).record.updated_at);
});
