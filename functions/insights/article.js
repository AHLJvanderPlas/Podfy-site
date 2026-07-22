// GET /insights/article?slug=...&lang=en|nl|de|fr — server-side rendered article.
// SSR (not client JS) so crawlers and LLMs get full content, BlogPosting +
// FAQPage JSON-LD, per-language meta description, canonical + hreflang.
// Header/footer partials injected from ASSETS (mirrors _middleware.js).

import { LANGS, esc, md, seoTitle, langQS, htmlResponse } from "../_shared/insights-ssr.js";

const UI = {
  en: { back: "All insights", faq: "Frequently asked questions", notfound: "This article does not exist or is not published.", prev: "Previous", next: "Next", source: "Source document", prevSeries: "Previous in series", nextSeries: "Next in series", partOf: (n, t) => `Part ${n} of ${t} in this series` },
  nl: { back: "Alle insights", faq: "Veelgestelde vragen", notfound: "Dit artikel bestaat niet of is niet gepubliceerd.", prev: "Vorige", next: "Volgende", source: "Brondocument", prevSeries: "Vorige in serie", nextSeries: "Volgende in serie", partOf: (n, t) => `Deel ${n} van ${t} in deze serie` },
  de: { back: "Alle Insights", faq: "Häufig gestellte Fragen", notfound: "Dieser Artikel existiert nicht oder ist nicht veröffentlicht.", prev: "Zurück", next: "Weiter", source: "Quelldokument", prevSeries: "Vorheriger Teil der Serie", nextSeries: "Nächster Teil der Serie", partOf: (n, t) => `Teil ${n} von ${t} dieser Serie` },
  fr: { back: "Tous les articles", faq: "Questions fréquentes", notfound: "Cet article n'existe pas ou n'est pas publié.", prev: "Précédent", next: "Suivant", source: "Document source", prevSeries: "Précédent dans la série", nextSeries: "Suivant dans la série", partOf: (n, t) => `Partie ${n} sur ${t} de cette série` },
};

function seriesLabel(seriesId) {
  return String(seriesId || "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const langParam = url.searchParams.get("lang") || "en";
  const lang = LANGS.includes(langParam) ? langParam : "en";

  const p = await env.DB.prepare(
    `SELECT * FROM blog_posts WHERE status = 'published' AND slug = ?`
  ).bind(slug).first();

  if (!p) {
    return htmlResponse(env, url, `
      <main class="container" style="max-width:720px;margin:0 auto;padding:3rem 1.25rem">
        <h1>Not found</h1><p>${UI[lang].notfound} <a href="/insights/${lang === "en" ? "" : `?lang=${lang}`}">→ /insights</a></p>
      </main>`, { title: "Not found — PODFY", status: 404, noindex: true, lang });
  }

  const has = (l) => l === "en" ? true : !!(p[`content_${l}`] && p[`title_${l}`]);
  const effLang = has(lang) ? lang : "en";
  const title = effLang === "en" ? p.title : p[`title_${effLang}`];
  const excerpt = (effLang === "en" ? p.excerpt : p[`excerpt_${effLang}`]) || p.excerpt || "";
  const content = effLang === "en" ? (p.content || "") : p[`content_${effLang}`];
  const dateIso = p.published_at ? new Date(p.published_at * 1000).toISOString().slice(0, 10) : "";
  const modIso = p.updated_at ? new Date(p.updated_at * 1000).toISOString().slice(0, 10) : dateIso;
  const base = "https://podfy.net/insights/article?slug=" + encodeURIComponent(p.slug);
  const canonical = effLang === "en" ? base : `${base}&lang=${effLang}`;

  // FAQ for this language
  let faq = [];
  try {
    const all = JSON.parse(p.faq_json || "null");
    faq = (all && Array.isArray(all[effLang]) ? all[effLang] : (all?.en || [])) || [];
  } catch { /* no faq */ }

  // hreflang alternates (only languages that exist)
  const alternates = LANGS.filter(has).map(l =>
    `<link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}&lang=${l}`}" />`
  ).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${base}" />`;

  // Language switcher
  const switcher = LANGS.filter(has).length > 1
    ? LANGS.filter(has).map(l => l === effLang
        ? `<strong>${l.toUpperCase()}</strong>`
        : `<a href="${l === "en" ? base : `${base}&lang=${l}`}">${l.toUpperCase()}</a>`
      ).join(" · ")
    : "";

  const coverUrl = p.cover_image_key ? `https://podfy.net/api/insights/cover/${encodeURIComponent(p.id)}` : "";

  // JSON-LD: BlogPosting (+ FAQPage when FAQ exists)
  const ld = [{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    inLanguage: effLang,
    datePublished: dateIso,
    dateModified: modIso,
    mainEntityOfPage: canonical,
    ...(coverUrl ? { image: coverUrl } : {}),
    author: { "@type": "Person", name: "Alexander van der Plas", url: "https://podfy.net/about" },
    publisher: { "@type": "Organization", name: "PODFY", url: "https://podfy.net",
      logo: { "@type": "ImageObject", url: "https://podfy.net/assets/og-image.jpg" } },
  }];
  if (faq.length) {
    ld.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(f => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const dateHuman = p.published_at
    ? new Date(p.published_at * 1000).toLocaleDateString(
        { en: "en-GB", nl: "nl-NL", de: "de-DE", fr: "fr-FR" }[effLang],
        { day: "numeric", month: "long", year: "numeric" })
    : "";

  const faqHtml = faq.length ? `
    <section aria-label="FAQ" style="margin-top:3rem;border-top:1px solid var(--v2-border,#ddd);padding-top:1.5rem">
      <h2>${UI[effLang].faq}</h2>
      ${faq.map(f => `<h3 style="font-size:1.05rem">${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}
    </section>` : "";

  // Previous/next navigation: within the same series when this post belongs to
  // one (ordered by series_position), otherwise by publish date as before.
  let prevPost, nextPost, seriesBadgeHtml = "";
  if (p.series_id) {
    const pos = p.series_position || 0;
    const [seriesPrev, seriesNext, seriesCount] = await Promise.all([
      env.DB.prepare(
        `SELECT slug, title, title_nl, title_de, title_fr FROM blog_posts
         WHERE status = 'published' AND series_id = ? AND series_position < ? ORDER BY series_position DESC LIMIT 1`
      ).bind(p.series_id, pos).first(),
      env.DB.prepare(
        `SELECT slug, title, title_nl, title_de, title_fr FROM blog_posts
         WHERE status = 'published' AND series_id = ? AND series_position > ? ORDER BY series_position ASC LIMIT 1`
      ).bind(p.series_id, pos).first(),
      env.DB.prepare(
        `SELECT COUNT(*) c FROM blog_posts WHERE status = 'published' AND series_id = ?`
      ).bind(p.series_id).first(),
    ]);
    prevPost = seriesPrev; nextPost = seriesNext;
    if (pos && seriesCount?.c) {
      // Real authored title/excerpt (NL written by the operator, EN/DE/FR
      // AI-translated — see podfy-admin series.ts) when available; a series
      // that only has an id set (no metadata entered yet) falls back to a
      // title-cased slug so the badge is never blank.
      const meta = await env.DB.prepare(`SELECT * FROM series WHERE id = ?`).bind(p.series_id).first();
      const label = (meta && meta[`title_${effLang}`]) || (meta && meta.title_nl) || seriesLabel(p.series_id);
      const excerpt = meta && (meta[`excerpt_${effLang}`] || meta.excerpt_nl);
      seriesBadgeHtml = `<p style="margin:0 0 .3rem;font-size:.78rem;color:var(--v2-stamp);text-transform:uppercase;letter-spacing:.05em;font-weight:600">${esc(label)} · ${esc(UI[effLang].partOf(pos, seriesCount.c))}</p>`
        + (excerpt ? `<p style="margin:0 0 .8rem;font-size:.85rem;color:var(--v2-muted)">${esc(excerpt)}</p>` : "");
    }
  } else {
    [prevPost, nextPost] = await Promise.all([
      env.DB.prepare(
        `SELECT slug, title, title_nl, title_de, title_fr FROM blog_posts
         WHERE status = 'published' AND published_at < ? ORDER BY published_at DESC LIMIT 1`
      ).bind(p.published_at).first(),
      env.DB.prepare(
        `SELECT slug, title, title_nl, title_de, title_fr FROM blog_posts
         WHERE status = 'published' AND published_at > ? ORDER BY published_at ASC LIMIT 1`
      ).bind(p.published_at).first(),
    ]);
  }
  const inSeries = !!p.series_id;
  const navUrl = (row) => `/insights/article?slug=${encodeURIComponent(row.slug)}${langQS(effLang)}`;
  const navTitle = (row) => (effLang === "en" ? row.title : row[`title_${effLang}`]) || row.title;
  const navCard = (row, label, align, arrow) => row ? `
    <a href="${navUrl(row)}" style="display:block;border:1px solid var(--v2-line,#ddd);border-radius:6px;padding:.9rem 1.1rem;text-decoration:none;color:inherit;text-align:${align}">
      <span style="display:block;font-size:.75rem;color:var(--v2-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.3rem">${arrow === "l" ? "← " : ""}${label}${arrow === "r" ? " →" : ""}</span>
      <span style="font-size:.92rem;font-weight:600;line-height:1.4">${esc(navTitle(row))}</span>
    </a>` : "<span></span>";
  const prevNextHtml = (prevPost || nextPost) ? `
    <nav aria-label="${inSeries ? "More in this series" : "More insights"}" style="margin-top:2.5rem;border-top:1px solid var(--v2-border,#ddd);padding-top:1.25rem;display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      ${navCard(prevPost, inSeries ? UI[effLang].prevSeries : UI[effLang].prev, "left", "l")}
      ${navCard(nextPost, inSeries ? UI[effLang].nextSeries : UI[effLang].next, "right", "r")}
    </nav>` : "";

  // Cross-link: when this article was generated FROM a repository item (the
  // "Generate insight" button on a repository item sets source_item_id), link
  // back to the official source. Automatic for every future repo-generated article.
  let sourceHtml = "";
  if (p.source_item_id) {
    const src = await env.DB.prepare(
      `SELECT title, slug FROM repository_items WHERE item_id = ? AND published = 1 AND access_level = 'public'`
    ).bind(p.source_item_id).first();
    if (src?.slug) {
      const srcUrl = `/insights/repository/item?slug=${encodeURIComponent(src.slug)}${langQS(effLang)}`;
      sourceHtml = `
        <p style="margin:2rem 0 0;font-size:.85rem;color:var(--v2-muted)">${UI[effLang].source}: <a href="${srcUrl}">${esc(src.title)} →</a></p>`;
    }
  }

  const body = `
    <main class="container" style="max-width:720px;margin:0 auto;padding:2rem 1.25rem 4rem">
      <p style="margin:1.5rem 0"><a href="/insights/${effLang === "en" ? "" : `?lang=${effLang}`}" style="font-size:.9rem">← ${UI[effLang].back}</a></p>
      <article>
        ${seriesBadgeHtml}
        <h1 class="v2-hero-title" style="font-size:2rem">${esc(title)}</h1>
        <p style="font-size:.85rem;color:var(--v2-muted);margin:.5rem 0 1.5rem">${dateHuman}${switcher ? " · " + switcher : ""}</p>
        ${coverUrl ? `<img src="${coverUrl}" alt="" style="max-width:100%;border-radius:4px;margin:0 0 1.5rem" />` : ""}
        ${md(content)}
        ${faqHtml}
        <div style="margin-top:2.5rem;display:flex;gap:.6rem">
          <a class="v2-btn v2-btn-ghost" target="_blank" rel="noopener"
             href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}"
             onclick="fetch('/api/insights/share',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entity_type:'blog_post',entity_id:'${esc(p.id)}',channel:'linkedin_share'})})">Share on LinkedIn</a>
          <button class="v2-btn v2-btn-ghost" style="cursor:pointer"
             onclick="navigator.clipboard.writeText('${canonical}');this.textContent='Copied ✓';fetch('/api/insights/share',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({entity_type:'blog_post',entity_id:'${esc(p.id)}',channel:'copy_text'})})">Copy link</button>
        </div>
        ${sourceHtml}
        ${prevNextHtml}
      </article>
    </main>`;

  return htmlResponse(env, url, body, {
    title: seoTitle(title, " — PODFY"),
    description: excerpt,
    canonical,
    alternates,
    og: { title, description: excerpt, url: canonical, image: coverUrl || "https://podfy.net/assets/og-image.jpg" },
    jsonLd: ld,
    lang: effLang,
  });
}
