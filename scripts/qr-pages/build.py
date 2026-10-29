#!/usr/bin/env python3
"""Build the PODFY QR Reporting pages in every locale (EN root, /nl, /de, /fr).

    python3 scripts/qr-pages/build.py

Content lives in scripts/qr-pages/content/{en,nl,de,fr}.py (same structure in every language).
Writes <prefix>/solutions/qr-issue-reporting/index.html + one page per use case, with hreflang
between all four languages, and keeps the QR block of sitemap.xml in sync. Re-run after editing
any content file; then `node tools/inline-styles.mjs` (no-op here: no style attributes) and deploy.
scripts/ is not published (deploy.sh excludes it).
"""
import html, importlib.util, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
LANGS = ["en", "nl", "de", "fr"]
CSSV = re.search(r"styles\.site\.css\?v=([\w-]+)", open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "index.html")).read()).group(1)  # follow the site-wide version
SITE = "https://podfy.net"
SECTION = "/solutions/qr-issue-reporting/"


def load(lang):
    spec = importlib.util.spec_from_file_location(f"content_{lang}", os.path.join(HERE, "content", f"{lang}.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


C = {l: load(l) for l in LANGS}
EN = C["en"]
for l in LANGS[1:]:  # every language must cover exactly the same pages and keys
    assert list(C[l].CASES) == list(EN.CASES), f"{l}: cases differ"
    assert set(C[l].FAQ) == set(EN.FAQ), f"{l}: FAQ keys differ"
    assert len(C[l].FEATURES) == len(EN.FEATURES), f"{l}: features differ"
    missing = set(EN.UI) - set(C[l].UI) | set(EN.OV) - set(C[l].OV)
    assert not missing, f"{l}: missing keys {missing}"
    for slug, v in EN.CASES.items():
        miss = set(v) - set(C[l].CASES[slug])
        assert not miss, f"{l}/{slug}: missing {miss}"

esc = lambda s: html.escape(s, quote=True)
pre = lambda lang: "" if lang == "en" else "/" + lang
url = lambda lang, path="": SITE + pre(lang) + SECTION + path


def alternates(path):
    out = "".join(f'  <link rel="alternate" hreflang="{l}" href="{url(l, path)}" />\n' for l in LANGS)
    return out + f'  <link rel="alternate" hreflang="x-default" href="{url("en", path)}" />\n'


def head(lang, title, desc, path, crumbs, faq, service_desc, name, ui):
    page_url = url(lang, path)
    ld = [
        {"@context": "https://schema.org", "@type": "BreadcrumbList",
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]},
        {"@context": "https://schema.org", "@type": "FAQPage",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]},
        {"@context": "https://schema.org", "@type": "Service", "name": name,
         "provider": {"@type": "Organization", "name": "PODFY", "url": SITE},
         "description": service_desc, "areaServed": ["NL", "BE", "DE", "FR"], "url": page_url, "serviceType": ui["service_type"]},
    ]
    t, d = esc(title), esc(desc)
    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{t}</title>
  <meta name="description" content="{d}" />
  <link rel="canonical" href="{page_url}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PODFY" />
  <meta property="og:title" content="{t}" />
  <meta property="og:description" content="{d}" />
  <meta property="og:url" content="{page_url}" />
  <meta property="og:image" content="{SITE}/assets/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{t}" />
  <meta name="twitter:description" content="{d}" />
  <meta name="twitter:image" content="{SITE}/assets/og-image.jpg" />
{alternates(path)}  <link rel="stylesheet" href="/assets/styles.site.css?v={CSSV}" />
  <script src="/assets/theme.js" defer></script>
''' + "".join(f'  <script type="application/ld+json">\n  {json.dumps(x, ensure_ascii=False)}\n  </script>\n' for x in ld) + "</head>\n"


def phone(ui, asset_id, asset_loc, label, chips, active, note):
    ch = "".join(f'<span class="rp-chip{" rp-chip--on" if c == active else ""}">{esc(c)}</span>' for c in chips)
    return f'''<figure class="v2-rp-figure">
          <div class="rp-phone" aria-hidden="true">
            <div class="rp-screen">
              <div class="rp-brand"><span>ACME SERVICE</span><span>{esc(ui["phone_tag"])}</span></div>
              <div class="rp-asset"><div class="rp-asset-id">{esc(asset_id)}</div><div class="rp-asset-loc">{esc(asset_loc)}</div></div>
              <div class="rp-label">{esc(label)}</div>
              <div class="rp-chips">{ch}</div>
              <div class="rp-field">{esc(note)}</div>
              <div class="rp-photo">{esc(ui["photo_optional"])}</div>
              <div class="rp-submit">{esc(ui["send_report"])}</div>
            </div>
          </div>
          <figcaption class="rp-caption">{esc(ui["example_caption"])}</figcaption>
        </figure>'''


def crumbs_nav(items):
    lis = "".join(f'<li><a href="{u}">{esc(n)}</a></li>' for n, u in items[:-1]) + f'<li aria-current="page">{esc(items[-1][0])}</li>'
    return f'<nav class="v2-breadcrumb" aria-label="Breadcrumb"><div class="container"><ol class="v2-breadcrumb-list">{lis}</ol></div></nav>'


def faq_html(faq):
    return '<div class="v2-faq">' + "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in faq) + "</div>"


def cta_block(lang, ui, h2a, h2b):
    p = pre(lang)
    return f'''    <section class="v2-cta-block" aria-label="{esc(ui["req_demo"])}"><div class="container"><span class="v2-stamp-mark" aria-hidden="true">{esc(ui["cta_stamp"])}</span><h2>{esc(h2a)}<br><em>{esc(h2b)}</em></h2><p>{esc(ui["cta_text"])}</p><div class="v2-cta-actions"><a href="{p}/contact?solution=report" class="v2-btn v2-btn-primary">{esc(ui["req_demo"])} &rarr;</a><a href="{p}/pricing#report-pricing" class="v2-btn v2-btn-ghost">{esc(ui["see_pricing"])}</a></div></div></section>'''


def asset_section(ui, asset_id, cta):
    steps = "".join(f"<li>{s.replace('{cta}', esc(cta))}</li>" for s in ui["asset_steps"])
    return f'''    <section class="v2-section" aria-labelledby="asset-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ui["asset_eyebrow"])}</p>
        <h2 class="v2-section-title" id="asset-heading">{esc(ui["asset_title"])}</h2>
        <div class="v2-asset-grid">
          <ol class="v2-asset-steps">{steps}</ol>
          <div class="rp-sticker" aria-hidden="true"><div class="rp-sticker-head">ACME SERVICE</div><img src="/assets/demo-qr.svg" alt="" width="120" height="120" /><div class="rp-sticker-cta">{esc(cta)}</div><div class="rp-sticker-id">{esc(asset_id)}</div></div>
        </div>
      </div>
    </section>'''


def tiles(lang, c, slugs, ui):
    return "".join(
        f'<a class="v2-aud-tile" href="{pre(lang)}{SECTION}{s}/"><p class="v2-aud-tile-industry">{esc(c.CASES[s]["eyebrow"])}</p>'
        f'<p class="v2-aud-tile-name">{esc(c.CASES[s]["name"])}</p><p class="v2-aud-tile-desc">{esc(c.CASES[s]["tile"])}</p>'
        f'<span class="v2-aud-tile-arrow">{esc(ui["see_how"])} &rarr;</span></a>' for s in slugs)


def features(c):
    soon = c.UI["soon"]
    return '<div class="v2-feat-grid">' + "".join(
        f'<div class="v2-feat"><h3>{esc(t)}{f" <span class=\"v2-badge-soon\">{esc(soon)}</span>" if s else ""}</h3><p>{esc(d)}</p></div>'
        for t, s, d in c.FEATURES) + "</div>"


def write(lang, path, head_html, body):
    full = head_html + '''<body class="v2">
  <div id="v2-progress"></div>
  <a href="#main" class="sr-only">''' + {"en": "Skip to content", "nl": "Naar inhoud", "de": "Zum Inhalt", "fr": "Aller au contenu"}[lang] + '''</a>
  [[PODFY_HEADER]]
''' + body + '''
  [[PODFY_FOOTER]]
</body>
</html>
'''
    out = os.path.join(ROOT, pre(lang).lstrip("/"), SECTION.strip("/"), path)
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "index.html"), "w").write(full)


def resolve(c, f):
    return c.FAQ[f] if isinstance(f, str) else tuple(f)


def build(lang):
    c, ui, ov, p = C[lang], C[lang].UI, C[lang].OV, pre(lang)
    home = (p or "") + "/"
    # ── overview / QR Reporting solutions page ──
    faq = [c.FAQ[k] for k in ov["faq_keys"]]
    crumbs = [(ui["crumb_home"], SITE + home), (ui["crumb_qr"], url(lang))]
    flow = "".join(f'<div class="v2-flow-step"><h3>{esc(h)}</h3><p>{esc(t)}</p></div>' for h, t in ov["flow"])
    body = crumbs_nav([(ui["crumb_home"], home), (ui["crumb_qr"], p + SECTION)]) + f'''

  <main id="main" class="v2-main">
    <section class="v2-aud-hero" aria-labelledby="rp-heading">
      <div class="container v2-rp-hero-grid">
        <div>
          <p class="v2-eyebrow">{esc(ui["product"])} <span class="v2-badge-new">{esc(ui["badge_new"])}</span></p>
          <h1 class="v2-hero-title" id="rp-heading">{esc(ov["h1a"])}<br><em>{esc(ov["h1b"])}</em></h1>
          <p class="v2-hero-sub">{esc(ov["sub"])}</p>
          <div class="v2-rp-actions"><a href="{p}/contact?solution=report" class="v2-btn v2-btn-primary">{esc(ui["req_demo"])} &rarr;</a><a href="#cases" class="v2-btn v2-btn-ghost">{esc(ui["see_cases"])}</a></div>
        </div>
        {phone(ui, *ov["phone"])}
      </div>
    </section>

    <section class="v2-section" aria-labelledby="prob-heading">
      <div class="container">
        <h2 class="v2-section-title" id="prob-heading">{esc(ov["prob_h"])}</h2>
        <div class="v2-two-col">
          <div class="v2-prose">{"".join(f"<p>{esc(x)}</p>" for x in ov["prob"])}</div>
          <div><ul class="v2-check-list">{"".join(f"<li>{esc(x)}</li>" for x in ov["checks"])}</ul></div>
        </div>
      </div>
    </section>

    <section class="v2-section" id="how" aria-labelledby="how-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["how_eyebrow"])}</p>
        <h2 class="v2-section-title" id="how-heading">{esc(ov["how_title"])}</h2>
        <div class="v2-flow">{flow}</div>
      </div>
    </section>

    <section class="v2-section" id="cases" aria-labelledby="ind-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["cases_eyebrow"])}</p>
        <h2 class="v2-section-title" id="ind-heading">{esc(ov["cases_title"])}</h2>
        <div class="v2-aud-grid">{tiles(lang, c, c.ORDER, ui)}</div>
      </div>
    </section>

{asset_section(ui, "COFFEE-0042", ui["sticker_default"])}

    <section class="v2-section" aria-labelledby="feat-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["feat_eyebrow"])}</p>
        <h2 class="v2-section-title" id="feat-heading">{esc(ov["feat_title"])}</h2>
        <p class="v2-prose">{esc(ov["feat_intro"])}</p>
        {features(c)}
      </div>
    </section>

    <section class="v2-section" aria-labelledby="int-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["int_eyebrow"])}</p>
        <h2 class="v2-section-title" id="int-heading">{esc(ov["int_title"])}</h2>
        <div class="v2-bound-grid">
          <div class="v2-bound"><h3>{esc(ov["does_h"])}</h3><ul>{"".join(f"<li>{esc(x)}</li>" for x in ov["does"])}</ul></div>
          <div class="v2-bound"><h3>{esc(ov["stays_h"])}</h3><ul>{"".join(f"<li>{esc(x)}</li>" for x in ov["stays"])}</ul></div>
        </div>
        <div class="v2-safety" role="note">{ov["safety"]}</div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="faq-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ui["faq_eyebrow"])}</p>
        <h2 class="v2-section-title" id="faq-heading">{esc(ov["faq_title"])}</h2>
        {faq_html(faq)}
      </div>
    </section>

{cta_block(lang, ui, ov["cta_a"], ov["cta_b"])}
  </main>'''
    write(lang, "", head(lang, ov["title"], ov["desc"], "", crumbs, faq, ov["service_desc"], ui["product"], ui), body)

    # ── use-case pages ──
    for slug in c.ORDER:
        v = c.CASES[slug]
        path = slug + "/"
        faq = [resolve(c, f) for f in v["faq"]]
        crumbs = [(ui["crumb_home"], SITE + home), (ui["crumb_qr"], url(lang)), (v["name"], url(lang, path))]
        uses = "".join(f'<div class="v2-how-step"><p class="v2-how-step-num">{esc(a)}</p><h3>{esc(b)}</h3><p>{esc(d)}</p></div>' for a, b, d in v["uses"])
        body = crumbs_nav([(ui["crumb_home"], home), (ui["crumb_qr"], p + SECTION), (v["name"], p + SECTION + path)]) + f'''

  <main id="main" class="v2-main">
    <section class="v2-aud-hero" aria-labelledby="sol-heading">
      <div class="container v2-rp-hero-grid">
        <div>
          <p class="v2-eyebrow">{esc(ui["product"])} &middot; {esc(v["eyebrow"])}</p>
          <h1 class="v2-hero-title" id="sol-heading">{esc(v["h1a"])}<br><em>{esc(v["h1b"])}</em></h1>
          <p class="v2-hero-sub">{esc(v["sub"])}</p>
          <div class="v2-rp-actions"><a href="{p}/contact?solution=report&amp;industry={slug}" class="v2-btn v2-btn-primary">{esc(ui["req_demo"])} &rarr;</a><a href="{p}{SECTION}" class="v2-btn v2-btn-ghost">{esc(ui["how_works"])}</a></div>
        </div>
        {phone(ui, v["asset"][0], v["asset"][1], v["label"], v["chips"], v["active"], v["note"])}
      </div>
    </section>

    <section class="v2-section" aria-labelledby="prob-heading">
      <div class="container">
        <h2 class="v2-section-title" id="prob-heading">{esc(v["prob_h"])}</h2>
        <div class="v2-two-col"><div class="v2-prose">{"".join(f"<p>{esc(x)}</p>" for x in v["prob"])}</div><div><ul class="v2-check-list">{"".join(f"<li>{esc(x)}</li>" for x in v["checks"])}</ul></div></div>
        <div class="v2-safety" role="note">{esc(v["safety"])}</div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="how-heading">
      <div class="container">
        <h2 class="v2-section-title" id="how-heading">{esc(ui["how_case_title"])}</h2>
        <div class="v2-how-grid">{uses}</div>
      </div>
    </section>

{asset_section(ui, v["asset"][0].split(" · ")[0], v["sticker"])}

    <section class="v2-section" aria-labelledby="faq-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ui["faq_eyebrow"])}</p>
        <h2 class="v2-section-title" id="faq-heading">{esc(ui["faq_case_title"].format(name=v["name_lc"] if "name_lc" in v else v["name"].lower()))}</h2>
        {faq_html(faq)}
      </div>
    </section>

    <section class="v2-section" aria-labelledby="rel-heading"><div class="container"><p class="v2-eyebrow">{esc(ui["more_eyebrow"])}</p><h2 class="v2-section-title" id="rel-heading">{esc(ui["more_title"])}</h2><div class="v2-aud-grid">{tiles(lang, c, v["related"], ui)}</div><p><a href="{p}{SECTION}#cases" class="v2-link">{esc(ui["all_cases"])} &rarr;</a></p></div></section>

{cta_block(lang, ui, ui["cta_case_a"], ui["cta_case_b"].format(name=v["name_lc"] if "name_lc" in v else v["name"].lower()))}
  </main>'''
        write(lang, path, head(lang, v["title"], v["desc"], path, crumbs, faq, v["desc"], ui["product"] + " · " + v["name"], ui), body)


def sync_sitemap():
    p = os.path.join(ROOT, "sitemap.xml")
    s = open(p).read()
    s = re.sub(r"\n?  <!-- QR Reporting \(generated\) -->[\s\S]*?<!-- /QR Reporting -->\n?", "\n", s)
    paths = [""] + [slug + "/" for slug in EN.ORDER]
    block = ["  <!-- QR Reporting (generated) -->"]
    for path in paths:
        for lang in LANGS:
            alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{url(l, path)}"/>' for l in LANGS)
            block.append(f"  <url>\n    <loc>{url(lang, path)}</loc>{alts}\n  </url>")
    block.append("  <!-- /QR Reporting -->")
    s = s.replace("</urlset>", "\n".join(block) + "\n</urlset>")
    if "xmlns:xhtml" not in s:
        s = s.replace("<urlset ", '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ', 1)
    open(p, "w").write(s)
    return len(paths) * len(LANGS)


HOME_START = "    <!-- QR Reporting band (generated by scripts/qr-pages/build.py) -->"
HOME_END = "    <!-- /QR Reporting band -->"


def home_band(lang):
    c = load(lang); ui, h, ov = c.UI, c.HOME, c.OV
    p = pre(lang)
    ph = ov["phone"]
    pts = "".join(f"<li>{esc(t)}</li>" for t in h["points"])
    cases = "".join(f'<li><a href="{p}{SECTION}{slug}/">{esc(c.CASES[slug]["name"])}</a></li>' for slug in c.ORDER)
    return f"""{HOME_START}
    <section class="v2-qr-band" aria-labelledby="qr-band-heading">
      <div class="container v2-qr-band-grid">
        <div>
          <p class="v2-eyebrow"><span class="v2-badge-new">{esc(ui["badge_new"])}</span> {esc(ui["product"])}</p>
          <h2 class="v2-qr-band-title" id="qr-band-heading">{esc(h["title_a"])}<br><em>{esc(h["title_em"])}</em></h2>
          <p class="v2-qr-band-sub">{esc(h["sub"])}</p>
          <ul class="v2-qr-points">{pts}</ul>
          <p class="v2-qr-cases-label">{esc(h["cases_label"])}</p>
          <ul class="v2-qr-cases">{cases}</ul>
          <div class="v2-hero-actions"><a href="{p}{SECTION}" class="v2-btn v2-btn-primary">{esc(h["cta"])} &rarr;</a><a href="{p}/contact?solution=report" class="v2-btn v2-btn-ghost">{esc(ui["req_demo"])}</a></div>
        </div>
        <div class="v2-qr-band-visual">
          {phone(ui, ph[0], ph[1], ph[2], ph[3], ph[4], ph[5])}
          <div class="rp-sticker" aria-hidden="true"><div class="rp-sticker-head">ACME SERVICE</div><img src="/assets/demo-qr.svg" alt="" width="120" height="120" /><div class="rp-sticker-cta">{esc(ui["sticker_default"])}</div><div class="rp-sticker-id">{esc(ph[0])}</div></div>
        </div>
      </div>
    </section>
{HOME_END}"""


def sync_homepages():
    for lang in LANGS:
        f = os.path.join(ROOT, pre(lang).lstrip("/"), "index.html")
        s = open(f).read()
        band = home_band(lang)
        if HOME_START in s:
            s = re.sub(re.escape(HOME_START) + r"[\s\S]*?" + re.escape(HOME_END), lambda m: band, s)
        else:
            # first run: EN replaces the two-card preview module, other locales insert after the stat band
            two = re.search(r"    <!-- =+\s*TWO SOLUTIONS[\s\S]*?</section>", s)
            if two:
                s = s[:two.start()] + band + s[two.end():]
            else:
                m = re.search(r'<section class="v2-(?:trust-belt|stat-band-wrap)"[\s\S]*?</section>\n', s)
                assert m, f"no stat band in {f}"
                s = s[:m.end()] + "\n" + band + "\n" + s[m.end():]
        open(f, "w").write(s)


SOL_START = "    <!-- QR Reporting banner (generated by scripts/qr-pages/build.py) -->"
SOL_END = "    <!-- /QR Reporting banner -->"
SOL_TEXT = {
    "en": "Looking for something else? PODFY QR Reporting lets anyone report a problem with a machine or asset by scanning its QR code. Same platform, same functions.",
    "nl": "Zoekt u iets anders? Met PODFY QR-meldingen meldt iedereen een probleem met een machine of object door de QR-code te scannen. Zelfde platform, zelfde functies.",
    "de": "Suchen Sie etwas anderes? Mit PODFY QR-Meldungen meldet jeder ein Problem an einer Maschine oder einem Objekt per QR-Code. Gleiche Plattform, gleiche Funktionen.",
    "fr": "Vous cherchez autre chose ? Avec PODFY Signalement QR, chacun signale un problème sur une machine ou un équipement en scannant son QR code. Même plateforme, mêmes fonctions.",
}


def sync_solutions_hub():
    for lang in LANGS:
        c = load(lang); ui = c.UI; p = pre(lang)
        f = os.path.join(ROOT, p.lstrip("/"), "solutions", "index.html")
        s = open(f).read()
        band = f"""{SOL_START}
    <div class="v2-inline-cta v2-inline-cta--qr"><div class="container"><div class="v2-inline-cta-inner"><div><p class="v2-inline-cta-label"><span class="v2-badge-new">{esc(ui["badge_new"])}</span> {esc(ui["product"])}</p><p class="v2-inline-cta-text">{esc(SOL_TEXT[lang])}</p></div><a href="{p}{SECTION}" class="v2-btn v2-btn-primary">{esc(c.HOME["cta"])} &rarr;</a></div></div></div>
{SOL_END}"""
        if SOL_START in s:
            s = re.sub(re.escape(SOL_START) + r"[\s\S]*?" + re.escape(SOL_END), lambda m: band, s)
        else:
            old = re.search(r'    <section class="v2-section" aria-labelledby="report-sol-heading">[\s\S]*?</section>\n', s)
            if old:
                s = s[:old.start()] + band + "\n" + s[old.end():]
            else:
                i = s.index('    <section class="v2-section" aria-labelledby="guides-heading">')
                s = s[:i] + band + "\n\n" + s[i:]
        open(f, "w").write(s)


PRICE_START = "    <!-- QR Reporting pricing (generated by scripts/qr-pages/build.py) -->"
PRICE_END = "    <!-- /QR Reporting pricing -->"
PRICE_TEXT = {
    "en": ("The rate card above is for Proof of Delivery. QR Reporting is priced per project, based on the number of assets and reports, with the same platform features included.", "Request a proposal"),
    "nl": ("De tarieven hierboven gelden voor afleverbewijs. QR-meldingen prijzen we per project, op basis van het aantal objecten en meldingen, met dezelfde platformfuncties inbegrepen.", "Offerte aanvragen"),
    "de": ("Die Preise oben gelten für den Liefernachweis. QR-Meldungen werden pro Projekt bepreist, nach Anzahl der Objekte und Meldungen, mit denselben Plattformfunktionen.", "Angebot anfordern"),
    "fr": ("Les tarifs ci-dessus concernent la preuve de livraison. Le signalement QR est tarifé par projet, selon le nombre d'équipements et de signalements, avec les mêmes fonctions de plateforme incluses.", "Demander une proposition"),
}


def sync_pricing():
    for lang in LANGS:
        c = load(lang); ui = c.UI; p = pre(lang)
        f = os.path.join(ROOT, p.lstrip("/"), "pricing.html")
        s = open(f).read()
        text, btn = PRICE_TEXT[lang]
        block = f"""{PRICE_START}
    <section class="v2-section" aria-labelledby="report-pricing-heading" id="report-pricing">
      <div class="container">
        <div class="v2-inline-cta-inner">
          <div>
            <p class="v2-inline-cta-label" id="report-pricing-heading"><span class="v2-badge-new">{esc(ui["badge_new"])}</span> {esc(ui["product"])}</p>
            <p class="v2-inline-cta-text">{esc(text)}</p>
          </div>
          <a href="{p}/contact?solution=report" class="v2-btn v2-btn-ghost">{esc(btn)} &rarr;</a>
        </div>
      </div>
    </section>
{PRICE_END}"""
        if PRICE_START in s:
            s = re.sub(re.escape(PRICE_START) + r"[\s\S]*?" + re.escape(PRICE_END), lambda m: block, s)
        else:
            s = re.sub(r'    <section class="v2-section" aria-labelledby="report-pricing-heading" id="report-pricing">[\s\S]*?</section>\n\n', "", s)
            i = s.index('    <section class="v2-section" aria-labelledby="examples-heading" id="examples">')
            j = s.rfind("    <!-- WORKED EXAMPLES -->", 0, i)
            i = j if j != -1 and j > i - 60 else i
            s = s[:i] + block + "\n\n" + s[i:]
        open(f, "w").write(s)


CONTACT_TEXT = {
    "en": ("Other equipment", "Approx. number of machines or sites", "(optional, for QR Reporting)"),
    "nl": ("Overige apparatuur", "Ongeveer aantal machines of locaties", "(optioneel, voor QR-meldingen)"),
    "de": ("Sonstige Geräte", "Ungefähre Anzahl Maschinen oder Standorte", "(optional, für QR-Meldungen)"),
    "fr": ("Autres équipements", "Nombre approximatif de machines ou de sites", "(facultatif, pour le signalement QR)"),
}


def sync_contact():
    for lang in LANGS:
        c = load(lang); p = pre(lang)
        f = os.path.join(ROOT, p.lstrip("/"), "contact.html")
        s = open(f).read()
        other, label, hint = CONTACT_TEXT[lang]
        opts = "".join(f'\n                    <option value="report-{slug}">{esc(c.CASES[slug]["name"])}</option>' for slug in c.ORDER)
        group = (f'                  <optgroup label="{esc(c.UI["product"])}">{opts}\n'
                 f'                    <option value="report-other">{esc(other)}</option>\n'
                 '                  </optgroup>\n')
        s = re.sub(r'                  <optgroup label="(?:PODFY Report|' + re.escape(esc(c.UI["product"])) + r')[^"]*">[\s\S]*?</optgroup>\n', "", s)
        sel = s.index('<select id="contact-sector"')
        i = s.index('                  <option value="other">', sel)
        s = s[:i] + group + s[i:]
        field = ('              <div class="v2-field">\n'
                 f'                <label for="contact-assets" class="v2-field-label">{esc(label)} <span class="v2-field-hint">{esc(hint)}</span></label>\n'
                 '                <input type="number" id="contact-assets" name="asset_count" class="v2-input" min="1" max="1000000" step="1" inputmode="numeric" />\n'
                 '              </div>\n\n')
        s = re.sub(r'              <div class="v2-field">\n                <label for="contact-assets"[\s\S]*?</div>\n\n', "", s)
        j = s.index("</select>", sel)
        k = s.index("</div>", j) + len("</div>\n\n")
        s = s[:k] + field + s[k:]
        open(f, "w").write(s)


if __name__ == "__main__":
    for lang in LANGS:
        build(lang)
    n = sync_sitemap()
    sync_homepages()
    sync_solutions_hub()
    sync_pricing()
    sync_contact()
    print(f"built {len(LANGS)} languages × {1 + len(EN.ORDER)} pages; sitemap QR block: {n} URLs")
