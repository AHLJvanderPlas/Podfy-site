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
    assert set(C[l].HOME_MORE) == set(EN.HOME_MORE) and len(C[l].HOME_MORE["cmp_rows"]) == len(EN.HOME_MORE["cmp_rows"]), f"{l}: home body differs"
    assert set(C[l].CMR) == set(EN.CMR) and set(C[l].DOORS) == set(EN.DOORS), f"{l}: cmr/home keys differ"
    assert set(C[l].LP) == set(EN.LP), f"{l}: landing keys differ {set(C[l].LP) ^ set(EN.LP)}"

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
    for path in ("/cmr/", "/qr/"):
        for lang in LANGS:
            alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{SITE + pre(l) + path}"/>' for l in LANGS)
            block.append(f"  <url>\n    <loc>{SITE + pre(lang) + path}</loc>{alts}\n  </url>")
    block.append("  <!-- /QR Reporting -->")
    s = s.replace("</urlset>", "\n".join(block) + "\n</urlset>")
    if "xmlns:xhtml" not in s:
        s = s.replace("<urlset ", '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ', 1)
    open(p, "w").write(s)
    return len(paths) * len(LANGS)


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
    <div class="v2-inline-cta v2-inline-cta--qr"><div class="container"><div class="v2-inline-cta-inner"><div><p class="v2-inline-cta-label"><span class="v2-badge-new">{esc(ui["badge_new"])}</span> {esc(ui["product"])}</p><p class="v2-inline-cta-text">{esc(SOL_TEXT[lang])}</p></div><a href="{p}/qr/" class="v2-btn v2-btn-primary">{esc(c.DOORS["doors"][1]["cta"])} &rarr;</a></div></div></div>
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


# ── Landing page for introductions: podfy.net/qr/ (+ /nl/qr/, /de/qr/, /fr/qr/) ──
LP_PATH = "/qr/"
lp_url = lambda lang: SITE + pre(lang) + LP_PATH


def lp_form(lang, c):
    """The site contact form (same ids, same script, same /api/contact), narrowed to QR use cases."""
    lp = c.LP
    src = open(os.path.join(ROOT, pre(lang).lstrip("/"), "contact.html")).read()
    a = src.index("<!-- Success state")
    b = src.index("</form>", a) + len("</form>")
    form = src[a:b]
    script = re.findall(r'<script src="(/assets/js/i/[0-9a-f]+\.js)"></script>', src)[-1]
    opts = "".join(f'<option value="report-{s}">{esc(c.CASES[s]["name"])}</option>' for s in c.ORDER)
    other = CONTACT_TEXT[lang][0]
    select = (f'<label for="contact-sector" class="v2-field-label">{esc(lp["sector_label"])}</label>\n'
              f'                <select id="contact-sector" name="sector" class="v2-input"><option value="report-other">{esc(lp["sector_ph"])}</option>{opts}<option value="report-other">{esc(other)}</option></select>')
    form = re.sub(r'<label for="contact-sector"[\s\S]*?</select>', lambda m: select, form)
    form = re.sub(r'(id="contact-message"[\s\S]*?placeholder=")[^"]*(")', lambda m: m.group(1) + esc(lp["msg_ph"]) + m.group(2), form)
    form = re.sub(r"\s*<!--[\s\S]*?-->", "", form)  # contact-page comments are not copy for this page
    return form, script


def build_landing(lang):
    c, ui, ov, lp, p = C[lang], C[lang].UI, C[lang].OV, C[lang].LP, pre(lang)
    ph = ov["phone"]
    faq = [c.FAQ[k] for k in lp["faq_keys"]]
    form, script = lp_form(lang, c)
    alts = "".join(f'  <link rel="alternate" hreflang="{l}" href="{lp_url(l)}" />\n' for l in LANGS) + f'  <link rel="alternate" hreflang="x-default" href="{lp_url("en")}" />\n'
    t, d = esc(lp["title"]), esc(lp["desc"])
    ld = {"@context": "https://schema.org", "@type": "FAQPage",
          "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
    # Main entry point for QR Reporting (linked from the homepage chooser): indexable
    head_html = f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{t}</title>
  <meta name="description" content="{d}" />
  <link rel="canonical" href="{lp_url(lang)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PODFY" />
  <meta property="og:title" content="{t}" />
  <meta property="og:description" content="{d}" />
  <meta property="og:url" content="{lp_url(lang)}" />
  <meta property="og:image" content="{SITE}/assets/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{t}" />
  <meta name="twitter:description" content="{d}" />
  <meta name="twitter:image" content="{SITE}/assets/og-image.jpg" />
{alts}  <link rel="stylesheet" href="/assets/styles.site.css?v={CSSV}" />
  <script src="/assets/theme.js" defer></script>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <script type="application/ld+json">
  {json.dumps(ld, ensure_ascii=False)}
  </script>
</head>
'''
    trust = "".join(f"<li>{esc(x)}</li>" for x in lp["trust"])
    stats = "".join(f'<li class="v2-stat-band-item"><span class="v2-stat-band-num">{esc(n)}</span><span class="v2-stat-band-label">{esc(l)}</span></li>' for n, l in lp["stats"])
    without = "".join(f"<li>{esc(x)}</li>" for x in lp["without"])
    with_ = "".join(f"<li>{esc(x)}</li>" for x in lp["with"])
    flow = "".join(f'<div class="v2-flow-step"><h3>{esc(h)}</h3><p>{esc(x)}</p></div>' for h, x in ov["flow"])
    labels = lp["ticket_labels"]
    vals = [ph[0], ph[1], ph[4], ph[5], lp["ticket_photo"], lp["ticket_received"], lp["ticket_sent"]]
    rows = "".join(f'<div class="lp-ticket-row"><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k, v in zip(labels, vals))
    payload = json.dumps({"event": "report.created", "asset": ph[0], "location": ph[1], "category": ph[4], "note": ph[5],
                          "photos": 1, "received_at": "2026-10-30T09:24:00+01:00",
                          "url": "https://portal.podfy.net/report/7f3c9a"}, ensure_ascii=False, indent=2)
    points = "".join(f"<li>{esc(x)}</li>" for x in lp["receive_points"])
    roles = "".join(f'<div class="v2-feat"><h3>{esc(h)}</h3><p>{esc(x)}</p></div>' for h, x in lp["roles"])
    nxt = "".join(f'<li><strong>{esc(h)}</strong><span>{esc(x)}</span></li>' for h, x in lp["next"])
    body = f'''
  <main id="main" class="v2-main lp">
    <section class="lp-hero" aria-labelledby="lp-heading">
      <div class="container lp-hero-grid">
        <div>
          <p class="v2-eyebrow"><span class="v2-badge-new">{esc(ui["badge_new"])}</span> {esc(ui["product"])}</p>
          <h1 class="v2-hero-title" id="lp-heading">{esc(lp["h1a"])}<br><em>{esc(lp["h1em"])}</em></h1>
          <p class="v2-hero-sub">{esc(lp["sub"])}</p>
          <div class="v2-hero-actions"><a href="#start" class="v2-btn v2-btn-primary">{esc(lp["cta_demo"])} &rarr;</a><a href="#how" class="v2-btn v2-btn-ghost">{esc(lp["cta_how"])}</a></div>
          <ul class="lp-trust">{trust}</ul>
        </div>
        <div class="v2-qr-band-visual lp-visual">
          {phone(ui, *ph)}
          <div class="rp-sticker" aria-hidden="true"><div class="rp-sticker-head">ACME SERVICE</div><img src="/assets/demo-qr.svg" alt="" width="120" height="120" /><div class="rp-sticker-cta">{esc(ui["sticker_default"])}</div><div class="rp-sticker-id">{esc(ph[0])}</div></div>
        </div>
      </div>
    </section>

    <section class="v2-stat-band-wrap" aria-label="{esc(ui["product"])}"><div class="container"><ul class="v2-stat-band" role="list">{stats}</ul></div></section>

    <section class="v2-section" aria-labelledby="lp-cmp-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(lp["cmp_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-cmp-heading">{esc(lp["cmp_title"])}</h2>
        <div class="lp-cmp">
          <div class="lp-cmp-col lp-cmp-col--without"><h3>{esc(lp["without_h"])}</h3><ul>{without}</ul></div>
          <div class="lp-cmp-col lp-cmp-col--with"><h3>{esc(lp["with_h"])}</h3><ul>{with_}</ul></div>
        </div>
      </div>
    </section>

    <section class="v2-section" id="how" aria-labelledby="lp-how-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["how_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-how-heading">{esc(ov["how_title"])}</h2>
        <div class="v2-flow">{flow}</div>
      </div>
    </section>

    <section class="v2-qr-band lp-receive" aria-labelledby="lp-rec-heading">
      <div class="container v2-qr-band-grid">
        <div>
          <p class="v2-eyebrow">{esc(lp["receive_eyebrow"])}</p>
          <h2 class="v2-qr-band-title" id="lp-rec-heading">{esc(lp["receive_title"])}</h2>
          <p class="v2-qr-band-sub">{esc(lp["receive_text"])}</p>
          <ul class="v2-qr-points">{points}</ul>
        </div>
        <div class="lp-receive-visual">
          <article class="lp-ticket" aria-label="{esc(lp["ticket_head"])}">
            <header class="lp-ticket-head"><span>{esc(lp["ticket_head"])}</span><span class="lp-ticket-id">{esc(ph[0])}</span></header>
            <dl class="lp-ticket-rows">{rows}</dl>
            <span class="v2-stamp-mark lp-ticket-stamp">{esc(lp["ticket_stamp"])}</span>
          </article>
          <figure class="lp-json"><figcaption>{esc(lp["json_caption"])}</figcaption><pre><code>{esc(payload)}</code></pre></figure>
        </div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="lp-roles-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(lp["roles_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-roles-heading">{esc(lp["roles_title"])}</h2>
        <div class="v2-feat-grid lp-roles">{roles}</div>
      </div>
    </section>

    <section class="v2-section" id="cases" aria-labelledby="lp-cases-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["cases_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-cases-heading">{esc(ov["cases_title"])}</h2>
        <div class="v2-aud-grid">{tiles(lang, c, c.ORDER, ui)}</div>
      </div>
    </section>

{asset_section(ui, ph[0], ui["sticker_default"])}

    <section class="v2-section" aria-labelledby="feat-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ov["feat_eyebrow"])}</p>
        <h2 class="v2-section-title" id="feat-heading">{esc(ov["feat_title"])}</h2>
        <p class="v2-prose">{esc(ov["feat_intro"])}</p>
        {features(c)}
      </div>
    </section>

    <section class="v2-section" aria-labelledby="faq-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ui["faq_eyebrow"])}</p>
        <h2 class="v2-section-title" id="faq-heading">{esc(ov["faq_title"])}</h2>
        {faq_html(faq)}
        <div class="v2-safety" role="note">{ov["safety"]}</div>
      </div>
    </section>

    <section class="v2-section lp-start" id="start" aria-labelledby="lp-form-heading">
      <div class="container lp-form-grid">
        <div>
          <p class="v2-eyebrow">{esc(lp["form_eyebrow"])}</p>
          <h2 class="v2-section-title" id="lp-form-heading">{esc(lp["form_title"])}</h2>
          <p class="v2-prose">{esc(lp["form_text"])}</p>
          <h3 class="lp-next-h">{esc(lp["next_h"])}</h3>
          <ol class="lp-next">{nxt}</ol>
        </div>
        <div class="lp-form-card">
            {form}
        </div>
      </div>
    </section>
  </main>'''
    full = head_html + '''<body class="v2">
  <div id="v2-progress"></div>
  <a href="#main" class="sr-only">''' + {"en": "Skip to content", "nl": "Naar inhoud", "de": "Zum Inhalt", "fr": "Aller au contenu"}[lang] + '''</a>
  [[PODFY_HEADER]]
''' + body + f'''

  [[PODFY_FOOTER]]

  <script src="{script}"></script>
</body>
</html>
'''
    out = os.path.join(ROOT, p.lstrip("/"), LP_PATH.strip("/"))
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "index.html"), "w").write(full)


# ── shared shell for the generated landing pages (/, /cmr/, /qr/ per locale) ──
def page_url(lang, path):
    return SITE + pre(lang) + path


def page_shell(lang, path, title, desc, ld, body, script=None, turnstile=False, extra_head=""):
    alts = "".join(f'  <link rel="alternate" hreflang="{l}" href="{page_url(l, path)}" />\n' for l in LANGS) + f'  <link rel="alternate" hreflang="x-default" href="{page_url("en", path)}" />\n'
    t, d = esc(title), esc(desc)
    lds = "".join(f'  <script type="application/ld+json">\n  {json.dumps(x, ensure_ascii=False)}\n  </script>\n' for x in ld)
    ts = '  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>\n' if turnstile else ""
    full = f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{t}</title>
  <meta name="description" content="{d}" />
  <link rel="canonical" href="{page_url(lang, path)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PODFY" />
  <meta property="og:title" content="{t}" />
  <meta property="og:description" content="{d}" />
  <meta property="og:url" content="{page_url(lang, path)}" />
  <meta property="og:image" content="{SITE}/assets/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{t}" />
  <meta name="twitter:description" content="{d}" />
  <meta name="twitter:image" content="{SITE}/assets/og-image.jpg" />
{alts}  <link rel="stylesheet" href="/assets/styles.site.css?v={CSSV}" />
  <script src="/assets/theme.js" defer></script>
{ts}{extra_head}{lds}</head>
<body class="v2">
  <div id="v2-progress"></div>
  <a href="#main" class="sr-only">{ {"en": "Skip to content", "nl": "Naar inhoud", "de": "Zum Inhalt", "fr": "Aller au contenu"}[lang] }</a>
  [[PODFY_HEADER]]
{body}

  [[PODFY_FOOTER]]
{f'  <script src="{script}"></script>' + chr(10) if script else ""}</body>
</html>
'''
    out = os.path.join(ROOT, pre(lang).lstrip("/"), path.strip("/"))
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "index.html"), "w").write(full)


def contact_form(lang, c, mode):
    """The site contact form (same ids, locale script, /api/contact). mode 'qr': QR use cases; 'cmr': delivery sectors."""
    if mode == "qr":
        return lp_form(lang, c)
    src = open(os.path.join(ROOT, pre(lang).lstrip("/"), "contact.html")).read()
    a = src.index("<!-- Success state"); b = src.index("</form>", a) + len("</form>")
    form = re.sub(r"\s*<!--[\s\S]*?-->", "", src[a:b])
    form = re.sub(r'\s*<optgroup label="[^"]*">[\s\S]*?</optgroup>', "", form)
    form = re.sub(r'\s*<div class="v2-field">\s*<label for="contact-assets"[\s\S]*?</div>', "", form)
    form = form.replace(" — ", ": ")  # sector labels such as "Logistics — other"
    form = re.sub(r'(id="contact-message"[\s\S]*?placeholder=")[^"]*(")', lambda m: m.group(1) + esc(c.CMR["msg_ph"]) + m.group(2), form)
    script = re.findall(r'<script src="(/assets/js/i/[0-9a-f]+\.js)"></script>', src)[-1]
    return form, script


def ticket(head, ident, labels, vals, stamp):
    rows = "".join(f'<div class="lp-ticket-row"><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k, v in zip(labels, vals))
    return f'''<article class="lp-ticket" aria-label="{esc(head)}">
            <header class="lp-ticket-head"><span>{esc(head)}</span><span class="lp-ticket-id">{esc(ident)}</span></header>
            <dl class="lp-ticket-rows">{rows}</dl>
            <span class="v2-stamp-mark lp-ticket-stamp">{esc(stamp)}</span>
          </article>'''


def pod_phone(ph):
    return f'''<figure class="v2-rp-figure">
          <div class="rp-phone" aria-hidden="true">
            <div class="rp-screen">
              <div class="rp-brand"><span>{esc(ph["brand"])}</span><span>{esc(ph["tag"])}</span></div>
              <div class="rp-asset"><div class="rp-asset-id">{esc(ph["ref"])}</div><div class="rp-asset-loc">{esc(ph["loc"])}</div></div>
              <div class="rp-label">{esc(ph["label"])}</div>
              <div class="lp-shot"><span class="lp-shot-title">CMR</span><span class="lp-shot-line"></span><span class="lp-shot-line"></span><span class="lp-shot-line lp-shot-line--short"></span><span class="lp-shot-sign"></span><span class="lp-shot-file">{esc(ph["shot"])}</span></div>
              <div class="rp-submit">{esc(ph["send"])}</div>
            </div>
          </div>
        </figure>'''


CARD_CTA = {"en": "Scan to send your CMR", "nl": "Scan om uw CMR te versturen", "de": "Scannen, um den CMR zu senden", "fr": "Scannez pour envoyer votre CMR"}
CMR_PATH = "/cmr/"


def build_cmr(lang):
    c, ui, m, p = C[lang], C[lang].UI, C[lang].CMR, pre(lang)
    form, script = contact_form(lang, c, "cmr")
    ph = m["phone"]
    li = lambda xs: "".join(f"<li>{esc(x)}</li>" for x in xs)
    stats = "".join(f'<li class="v2-stat-band-item"><span class="v2-stat-band-num">{esc(n)}</span><span class="v2-stat-band-label">{esc(l)}</span></li>' for n, l in m["stats"])
    flow = "".join(f'<div class="v2-flow-step"><h3>{esc(h)}</h3><p>{esc(x)}</p></div>' for h, x in m["flow"])
    payload = json.dumps({"event": "pod.created", "reference": m["ticket_vals"][0], "podfy_id": "PFY-7Q4K2", "received_at": "2026-10-30T14:37:00+01:00",
                          "location": {"lat": 52.37, "lng": 4.89, "source": "photo"}, "files": ["cmr_0841.pdf"],
                          "url": "https://portal.podfy.net/pod/3b8e1d"}, ensure_ascii=False, indent=2)
    roles = "".join(f'<a class="v2-aud-tile" href="{p}/solutions/{slug}/"><p class="v2-aud-tile-name">{esc(n)}</p><p class="v2-aud-tile-desc">{esc(d)}</p><span class="v2-aud-tile-arrow">{esc(ui["see_how"])} &rarr;</span></a>' for slug, n, d in m["roles"])
    feats = '<div class="v2-feat-grid">' + "".join(f'<div class="v2-feat"><h3>{esc(t)}{" <span class=\"v2-badge-soon\">" + esc(ui["soon"]) + "</span>" if s else ""}</h3><p>{esc(d)}</p></div>' for t, s, d in m["features"]) + "</div>"
    nxt = "".join(f'<li><strong>{esc(h)}</strong><span>{esc(x)}</span></li>' for h, x in m["next"])
    ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in m["faq"]]},
          {"@context": "https://schema.org", "@type": "Service", "name": m["product"], "provider": {"@type": "Organization", "name": "PODFY", "url": SITE},
           "description": m["desc"], "areaServed": ["NL", "BE", "DE", "FR"], "url": page_url(lang, CMR_PATH), "serviceType": "Proof of delivery and CMR management"},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "PODFY", "item": SITE + (p or "") + "/"},
              {"@type": "ListItem", "position": 2, "name": m["product"].replace("PODFY ", ""), "item": page_url(lang, CMR_PATH)}]}]
    body = f'''
  <main id="main" class="v2-main lp">
    <section class="lp-hero" aria-labelledby="lp-heading">
      <div class="container lp-hero-grid">
        <div>
          <p class="v2-eyebrow">{esc(m["product"])}</p>
          <h1 class="v2-hero-title" id="lp-heading">{esc(m["h1a"])}<br><em>{esc(m["h1em"])}</em></h1>
          <p class="v2-hero-sub">{esc(m["sub"])}</p>
          <div class="v2-hero-actions"><a href="#start" class="v2-btn v2-btn-primary">{esc(m["cta_demo"])} &rarr;</a><a href="{p}/demo" class="v2-btn v2-btn-ghost">{esc(m["cta_try"])}</a></div>
          <ul class="lp-trust">{li(m["trust"])}</ul>
        </div>
        <div class="v2-qr-band-visual lp-visual">
          {pod_phone(ph)}
          <div class="rp-sticker" aria-hidden="true"><div class="rp-sticker-head">{esc(ph["brand"])}</div><img src="/assets/demo-qr.svg" alt="" width="120" height="120" /><div class="rp-sticker-cta">{esc(CARD_CTA[lang])}</div><div class="rp-sticker-id">{esc(ph["ref"])}</div></div>
        </div>
      </div>
    </section>

    <section class="v2-stat-band-wrap" aria-label="{esc(m["product"])}"><div class="container"><ul class="v2-stat-band" role="list">{stats}</ul></div></section>

    <section class="v2-section" aria-labelledby="lp-cmp-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(m["cmp_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-cmp-heading">{esc(m["cmp_title"])}</h2>
        <div class="lp-cmp">
          <div class="lp-cmp-col lp-cmp-col--without"><h3>{esc(m["without_h"])}</h3><ul>{li(m["without"])}</ul></div>
          <div class="lp-cmp-col lp-cmp-col--with"><h3>{esc(m["with_h"])}</h3><ul>{li(m["with"])}</ul></div>
        </div>
      </div>
    </section>

    <section class="v2-section" id="how" aria-labelledby="lp-how-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(m["how_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-how-heading">{esc(m["how_title"])}</h2>
        <div class="v2-flow">{flow}</div>
      </div>
    </section>

    <section class="v2-qr-band lp-receive" aria-labelledby="lp-rec-heading">
      <div class="container v2-qr-band-grid">
        <div>
          <p class="v2-eyebrow">{esc(m["rec_eyebrow"])}</p>
          <h2 class="v2-qr-band-title" id="lp-rec-heading">{esc(m["rec_title"])}</h2>
          <p class="v2-qr-band-sub">{esc(m["rec_text"])}</p>
          <ul class="v2-qr-points">{li(m["rec_points"])}</ul>
        </div>
        <div class="lp-receive-visual">
          {ticket(m["ticket_head"], m["ticket_vals"][0], m["ticket_labels"], m["ticket_vals"], m["ticket_stamp"])}
          <figure class="lp-json"><figcaption>{esc(m["json_caption"])}</figcaption><pre><code>{esc(payload)}</code></pre></figure>
        </div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="lp-roles-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(m["roles_eyebrow"])}</p>
        <h2 class="v2-section-title" id="lp-roles-heading">{esc(m["roles_title"])}</h2>
        <div class="v2-aud-grid">{roles}</div>
        <p><a href="{p}/solutions/" class="v2-link">{esc(m["all_solutions"])} &rarr;</a></p>
      </div>
    </section>

    <section class="v2-section" id="cmr-generator" aria-labelledby="lp-gen-heading">
      <div class="container v2-asset-grid">
        <div>
          <p class="v2-eyebrow">{esc(m["gen_eyebrow"])}</p>
          <h2 class="v2-section-title" id="lp-gen-heading">{esc(m["gen_title"])}</h2>
          <p class="v2-prose">{esc(m["gen_text"])}</p>
          <ul class="v2-check-list">{li(m["gen_points"])}</ul>
          <p><a href="{p}/cmr/generator/" class="v2-btn v2-btn-ghost">{esc(m["gen_cta"])} &rarr;</a></p>
        </div>
        {ticket("CMR", "IRU 2007", m["ticket_labels"][:1] + [m["ticket_labels"][3]], [m["ticket_vals"][0], ph["loc"]], "PDF")}
      </div>
    </section>

    <section class="v2-section" aria-labelledby="feat-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(m["feat_eyebrow"])}</p>
        <h2 class="v2-section-title" id="feat-heading">{esc(m["feat_title"])}</h2>
        {feats}
      </div>
    </section>

    <div class="v2-inline-cta"><div class="container"><div class="v2-inline-cta-inner"><div><p class="v2-inline-cta-label">{esc(m["price_eyebrow"])}</p><p class="v2-inline-cta-text"><strong>{esc(m["price_title"])}</strong> {esc(m["price_text"])}</p></div><a href="{p}/pricing" class="v2-btn v2-btn-primary">{esc(m["price_cta"])} &rarr;</a></div></div></div>

    <section class="v2-section" aria-labelledby="faq-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ui["faq_eyebrow"])}</p>
        <h2 class="v2-section-title" id="faq-heading">{esc(m["faq_title"])}</h2>
        {faq_html(m["faq"])}
      </div>
    </section>

    <div class="v2-inline-cta"><div class="container"><div class="v2-inline-cta-inner"><div><p class="v2-inline-cta-label"><span class="v2-badge-new">{esc(ui["badge_new"])}</span> {esc(m["qr_label"])}</p><p class="v2-inline-cta-text">{esc(m["qr_text"])}</p></div><a href="{p}/qr/" class="v2-btn v2-btn-primary">{esc(m["qr_cta"])} &rarr;</a></div></div></div>

    <section class="v2-section lp-start" id="start" aria-labelledby="lp-form-heading">
      <div class="container lp-form-grid">
        <div>
          <p class="v2-eyebrow">{esc(m["form_eyebrow"])}</p>
          <h2 class="v2-section-title" id="lp-form-heading">{esc(m["form_title"])}</h2>
          <p class="v2-prose">{esc(m["form_text"])}</p>
          <h3 class="lp-next-h">{esc(m["next_h"])}</h3>
          <ol class="lp-next">{nxt}</ol>
        </div>
        <div class="lp-form-card">
            {form}
        </div>
      </div>
    </section>
  </main>'''
    page_shell(lang, CMR_PATH, m["title"], m["desc"], ld, body, script=script, turnstile=True)


def home_org_ld(lang):
    """Keep the homepage's existing Organization / WebSite JSON-LD blocks (hand-maintained) as they are."""
    f = os.path.join(ROOT, pre(lang).lstrip("/"), "index.html")
    s = open(f).read()
    head = s[:s.index("</head>")]
    blocks = re.findall(r'<script type="application/ld\+json">\s*([\s\S]*?)\s*</script>', head)
    keep = []
    for b in blocks:
        try:
            d = json.loads(b)
        except ValueError:
            continue
        if (d.get("@type") if isinstance(d, dict) else None) in ("Organization", "WebSite", "SoftwareApplication") or (isinstance(d, dict) and "@graph" in d):
            keep.append(d)
    return keep


def build_home(lang):
    c, ui, d, p = C[lang], C[lang].UI, C[lang].DOORS, pre(lang)
    ld = home_org_ld(lang)
    doors = ""
    for i, door in enumerate(d["doors"]):
        pts = "".join(f"<li>{esc(x)}</li>" for x in door["points"])
        vis = ('<div class="door-vis door-vis--cmr" aria-hidden="true"><span class="door-ref">TDV-2026-0841</span><span class="door-doc"><span></span><span></span><span></span></span><span class="v2-stamp-mark">' + esc(c.CMR["ticket_stamp"]) + '</span></div>') if i == 0 else \
              ('<div class="door-vis door-vis--qr" aria-hidden="true"><img src="/assets/demo-qr.svg" alt="" width="84" height="84" /><span class="door-sticker-cta">' + esc(ui["sticker_default"]) + '</span></div>')
        doors += f'''
          <a class="door door--{"cmr" if i == 0 else "qr"}" href="{p}{door["href"]}">
            {vis}
            <span class="door-kicker">{esc(door["kicker"])}{' <span class="v2-badge-new">' + esc(ui["badge_new"]) + '</span>' if i == 1 else ""}</span>
            <span class="door-title">{esc(door["title"])}</span>
            <span class="door-text">{esc(door["text"])}</span>
            <ul class="door-points">{pts}</ul>
            <span class="door-cta">{esc(door["cta"])} &rarr;</span>
          </a>'''
    shared = "".join(f"<li>{esc(x)}</li>" for x in d["shared"])
    hm = c.HOME_MORE
    cols = hm["cmp_cols"]
    cmp_rows = "".join(f'<tr><th scope="row">{esc(a)}</th><td>{esc(b)}</td><td>{esc(q)}</td></tr>' for a, b, q in hm["cmp_rows"])
    examples = "".join(f'''<article class="home-ex home-ex--{"cmr" if i == 0 else "qr"}"><p class="home-ex-tag">{esc(x["tag"])}</p><h3>{esc(x["title"])}</h3><p class="home-ex-before">{esc(x["before"])}</p><ul class="v2-check-list">{"".join(f"<li>{esc(y)}</li>" for y in x["after"])}</ul><a class="v2-link" href="{p}{x["href"]}">{esc(x["cta"])} &rarr;</a></article>''' for i, x in enumerate(hm["examples"]))
    uc_cmr = "".join(f'<li><a href="{p}/solutions/{slug}/">{esc(n)}</a></li>' for slug, n in hm["uc_cmr"])
    uc_qr = "".join(f'<li><a href="{p}{SECTION}{slug}/">{esc(c.CASES[slug]["name"])}</a></li>' for slug in c.ORDER[:6])
    steps = "".join(f'<div class="v2-flow-step"><h3>{esc(h)}</h3><p>{esc(t)}</p></div>' for h, t in hm["steps"])
    ld = ld + [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in hm["faq"]]}]
    body = f'''
  <main id="main" class="v2-main home">
    <section class="home-hero" aria-labelledby="home-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(d["eyebrow"])}</p>
        <h1 class="v2-hero-title home-title" id="home-heading">{esc(d["h1a"])} <em>{esc(d["h1em"])}</em></h1>
        <p class="v2-hero-sub home-sub">{esc(d["sub"])}</p>
        <div class="doors">{doors}
        </div>
      </div>
    </section>

    <section class="v2-section home-cmp" aria-labelledby="home-cmp-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(hm["cmp_eyebrow"])}</p>
        <h2 class="v2-section-title" id="home-cmp-heading">{esc(hm["cmp_title"])}</h2>
        <p class="v2-prose">{esc(hm["cmp_intro"])}</p>
        <div class="home-cmp-wrap"><table class="home-cmp-table"><thead><tr><th scope="col"><span class="sr-only">{esc(hm["cmp_eyebrow"])}</span></th><th scope="col"><a href="{p}/cmr/">{esc(cols[1])}</a></th><th scope="col"><a href="{p}/qr/">{esc(cols[2])}</a></th></tr></thead><tbody>{cmp_rows}</tbody></table></div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="home-ex-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(hm["ex_eyebrow"])}</p>
        <h2 class="v2-section-title" id="home-ex-heading">{esc(hm["ex_title"])}</h2>
        <div class="home-ex-grid">{examples}</div>
        <p class="home-ex-note">{esc(hm["ex_note"])}</p>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="home-steps-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(hm["steps_eyebrow"])}</p>
        <h2 class="v2-section-title" id="home-steps-heading">{esc(hm["steps_title"])}</h2>
        <div class="v2-flow">{steps}</div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="home-uc-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(hm["uc_eyebrow"])}</p>
        <h2 class="v2-section-title" id="home-uc-heading">{esc(hm["uc_title"])}</h2>
        <div class="home-uc-grid">
          <div class="home-uc"><h3><a href="{p}/cmr/">{esc(hm["uc_cmr_h"])}</a></h3><ul>{uc_cmr}</ul><a class="v2-link" href="{p}/solutions/">{esc(hm["uc_all_cmr"])} &rarr;</a></div>
          <div class="home-uc"><h3><a href="{p}/qr/">{esc(hm["uc_qr_h"])}</a></h3><ul>{uc_qr}</ul><a class="v2-link" href="{p}{SECTION}#cases">{esc(hm["uc_all_qr"])} &rarr;</a></div>
        </div>
      </div>
    </section>

    <section class="v2-section" aria-labelledby="faq-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(ui["faq_eyebrow"])}</p>
        <h2 class="v2-section-title" id="faq-heading">{esc(hm["faq_title"])}</h2>
        {faq_html(hm["faq"])}
      </div>
    </section>

    <section class="v2-section home-shared" aria-labelledby="home-shared-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(d["shared_eyebrow"])}</p>
        <h2 class="v2-section-title" id="home-shared-heading">{esc(d["shared_title"])}</h2>
        <ul class="home-shared-list">{shared}</ul>
        <p class="home-help">{esc(d["help_text"])} <a href="{p}/contact" class="v2-link">{esc(d["help_cta"])} &rarr;</a></p>
      </div>
    </section>
  </main>'''
    page_shell(lang, "/", d["title"], d["desc"], ld, body)


LLMS_START, LLMS_END = "<!-- generated by scripts/qr-pages/build.py -->", "<!-- /generated -->"


def _put_block(path, block, anchor):
    s = open(path).read()
    s = re.sub(r"\n*" + re.escape(LLMS_START) + r"[\s\S]*?" + re.escape(LLMS_END) + r"\n*", "\n\n", s)
    i = s.index(anchor) if anchor in s else len(s)
    s = s[:i].rstrip("\n") + "\n\n" + LLMS_START + "\n" + block.strip() + "\n" + LLMS_END + "\n\n" + s[i:].lstrip("\n")
    open(path, "w").write(s.rstrip("\n") + "\n")


def sync_llms():
    e, m = EN, EN.CMR
    cases = "\n".join(f"- {e.CASES[s]['name']}: {SITE}{SECTION}{s}/" for s in e.ORDER)
    index = f"""## Site structure: two solutions on one platform

- Homepage {SITE}/ : chooser between the two solutions (also /nl/, /de/, /fr/)
- CMR and delivery proof: {SITE}/cmr/ (main page for transport and logistics; also /nl/cmr/, /de/cmr/, /fr/cmr/)
- CMR generator (create CMR/AVC consignment notes in the portal): {SITE}/cmr/generator/
- Delivery solutions by role: {SITE}/solutions/ (carriers, 3PL, shippers, retail, construction, facilities, inbound, paper to digital)
- QR Reporting: {SITE}/qr/ (main page) and {SITE}{SECTION} (overview with all use cases)

## PODFY QR Reporting (second solution)

PODFY QR Reporting puts a QR code on every machine or asset. Anyone (customers, staff, technicians, contractors) scans it with a phone camera, chooses what is wrong from the brand's own categories, optionally adds a note and photo, and sends it. No app and no account. The report reaches the responsible team by e-mail and by webhook to their ticketing or maintenance system; an open API is coming. Every report is stored per asset in the PODFY portal.

- Same platform and same functions as PODFY CMR and delivery proof: branding, 12 languages, notifications, webhooks, EU storage, searchable portal
- Asset list via a downloadable template; each asset number becomes the reference behind its own QR code
- Printable QR stickers per asset with the brand's logo and custom text, e.g. "Scan to report an issue"
- Photo per form: required, optional or off
- Not an emergency channel; repair planning and ticket follow-up stay in the customer's own tools
- Pricing per project, based on the number of assets and reports

Use cases:
{cases}"""
    _put_block(os.path.join(ROOT, "llms.txt"), index, "## Who uses PODFY")

    qa = lambda pairs: "\n\n".join(f"Q: {q}\nA: {a}" for q, a in pairs)
    full = [f"""---

# CMR and delivery proof: PODFY
Source: {SITE}/cmr/

{m["h1a"]} {m["h1em"]}

{m["sub"]}

## {m["cmp_title"]}
Today:
{chr(10).join("- " + x for x in m["without"])}
With PODFY:
{chr(10).join("- " + x for x in m["with"])}

## {m["how_title"]}
{chr(10).join(f"{i + 1}. {h}: {t}" for i, (h, t) in enumerate(m["flow"]))}

## {m["rec_title"]}
{m["rec_text"]}

## {m["gen_title"]}
{m["gen_text"]}
{chr(10).join("- " + x for x in m["gen_points"])}

## {m["feat_title"]}
{chr(10).join(f"- {t}{' (coming soon)' if s else ''}: {d}" for t, s, d in m["features"])}

## {m["price_title"]}
{m["price_text"]}

## {m["faq_title"]}
{qa(m["faq"])}
""", f"""---

# PODFY QR Reporting
Source: {SITE}/qr/ and {SITE}{SECTION}

{e.LP["h1a"]} {e.LP["h1em"]}

{e.LP["sub"]}

{chr(10).join(e.OV["prob"])}

## {e.OV["how_title"]}
{chr(10).join(f"{i + 1}. {h}: {t}" for i, (h, t) in enumerate(e.OV["flow"]))}

## {e.LP["receive_title"]}
{e.LP["receive_text"]}

## {e.UI["asset_title"]}
{chr(10).join(re.sub("<[^>]+>", "", x).replace("{cta}", e.UI["sticker_default"]) for x in e.UI["asset_steps"])}

## {e.OV["feat_title"]}
{chr(10).join(f"- {t}{' (coming soon)' if s else ''}: {d}" for t, s, d in e.FEATURES)}

## {e.OV["faq_title"]}
{qa([e.FAQ[k] for k in e.OV["faq_keys"]])}
"""]
    for s in e.ORDER:
        v = e.CASES[s]
        faq = [resolve(e, f) for f in v["faq"]]
        full.append(f"""---

# {v["title"].replace(" | PODFY", "")}
Source: {SITE}{SECTION}{s}/

{v["h1a"]} {v["h1b"]}

{v["sub"]}

{chr(10).join(v["prob"])}

{chr(10).join(f"- {h}: {t}" for _, h, t in v["uses"])}

{v["safety"]}

{qa(faq)}
""")
    _put_block(os.path.join(ROOT, "llms-full.txt"), "\n".join(full), "\n---\n\n# About PODFY")


if __name__ == "__main__":
    for lang in LANGS:
        build(lang)
    n = sync_sitemap()
    sync_solutions_hub()
    sync_pricing()
    sync_contact()
    sync_llms()
    for lang in LANGS:
        build_landing(lang)
        build_cmr(lang)
        build_home(lang)
    # regenerated pages lose their asset wiring: re-run the site tools so `npm test` stays green
    import subprocess
    for tool in ("tools/extract-inline.mjs", "tools/inline-styles.mjs", "tools/sitemap-lastmod.mjs"):
        subprocess.run(["node", tool], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    print(f"built {len(LANGS)} languages × {1 + len(EN.ORDER)} pages; sitemap QR block: {n} URLs")
