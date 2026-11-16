// Static accessibility guards (Wave D, 2026-11-16). The full axe-core run needs a browser; these keep the causes out.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const ROOT = new URL("../", import.meta.url).pathname;
const read = (f) => readFileSync(`${ROOT}${f}`, "utf8");
const css = read("assets/styles.site.css") + read("assets/advisor.css");

const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const token = (block, name) => block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const light = css.slice(css.indexOf(":root"), css.indexOf('html[data-theme="dark"] body'));
const dark = css.slice(css.indexOf('html[data-theme="dark"] body'), css.indexOf("2) BASE RESETS"));

test("small orange text: --v2-stamp-text is at least 4.5:1 on every light and dark surface it sits on", () => {
  for (const bg of ["paper", "card", "paper-2"]) {
    assert.ok(ratio(token(light, "v2-stamp-text"), token(light, `v2-${bg}`)) >= 4.5, `light ${bg}`);
    assert.ok(ratio(token(dark, "v2-stamp-text"), token(dark, `v2-${bg}`)) >= 4.5, `dark ${bg}`);
  }
  assert.ok(ratio(token(light, "v2-stamp-text"), "#FFFFFF") >= 4.5 && ratio(token(light, "v2-stamp-text"), "#F8EBE2") >= 4.5);
  assert.ok(ratio("#FFFFFF", token(light, "v2-stamp-button")) >= 4.5 && ratio("#FFFFFF", token(dark, "v2-stamp-button")) >= 4.5, "white text on button fill");
  assert.ok(ratio(token(light, "v2-stamp-on-ink"), token(light, "v2-ink")) >= 4.5, "orange text on the light-theme ink band");
  assert.ok(ratio(token(dark, "v2-stamp-on-ink"), token(dark, "v2-ink")) >= 4.5, "orange text on the dark-theme ink band");
  assert.ok(ratio(token(light, "v2-paper"), token(light, "v2-stamp-solid")) >= 4.5 && ratio(token(dark, "v2-paper"), token(dark, "v2-stamp-solid")) >= 4.5, "paper text on the badge fill");
  assert.ok(ratio(token(light, "v2-muted"), token(light, "v2-paper-2")) >= 4.5 && ratio(token(dark, "v2-muted"), token(dark, "v2-card")) >= 4.5, "footer links in muted");
});

test("no text colour uses the brand orange directly (text uses --v2-stamp-text / --v2-stamp-on-ink)", () => {
  assert.deepEqual(css.match(/(?<![\w-])color:\s*var\(--v2-stamp\)/g) || [], []);
});

test("footer locale links are not faded with opacity", () => {
  assert.doesNotMatch(css, /\.site-footer-locale-inactive\s*\{[^}]*opacity/);
});

test("header partial carries one skip link, translated; no other hidden skip links remain", () => {
  const h = read("partials/header.html");
  assert.equal((h.match(/class="site-skip"/g) || []).length, 1);
  const mapFile = readdirSync(`${ROOT}assets/js/i`).find((f) => read(`assets/js/i/${f}`).includes("\"pod_head\""));
  const map = read(`assets/js/i/${mapFile}`);
  for (const l of ["nl", "de", "fr"]) assert.match(map, new RegExp(`"${l}": \\{"skip": "`));
  assert.match(css, /\.site-skip:focus/);
  for (const f of ["index.html", "pricing.html", "nl/pricing.html", "de/contact.html", "fr/qr/index.html", "docs/api/index.html"]) assert.doesNotMatch(read(f), /href="#main" class="sr-only"/, f);
  for (const f of ["functions/status/index.js", "functions/insights/article.js"]) assert.match(read(f), /<main id="main"/, f);
});

test("theme toggle: the accessible name contains the visible label, in every language", () => {
  const h = read("partials/header.html");
  assert.match(h, /aria-label="Colour mode: System"/);
  const js = read("assets/theme.js");
  assert.match(js, /setAttribute\("aria-label", \(NAME\[lang\] \|\| NAME\.en\) \+ ": " \+ text\)/);
  assert.match(js, /label\.textContent = text/);
});

test("keyboard focus is visible and scroll regions are focusable with a label", () => {
  assert.match(css, /a:focus-visible, button:focus-visible[\s\S]*?outline: 2px solid var\(--v2-focus\)/);
  for (const f of ["pricing.html", "nl/pricing.html", "de/pricing.html", "fr/pricing.html"]) assert.match(read(f), /class="v2-price-table-wrap" tabindex="0" role="region" aria-label="[^"]+"/, f);
  assert.match(read("docs/api/index.html"), /class="api-table-wrap" tabindex="0" role="region" aria-label="Table: /);
  assert.match(read("docs/api/index.html"), /<pre class="api-code" tabindex="0" role="region" aria-label="Code example">/);
  assert.match(read("cmr/index.html"), /<pre tabindex="0" role="region" aria-label="[^"]+"><code>/);
});
