// GET /insights/repository/item?slug=...&lang=en|nl|de|fr — SSR repository item
// detail: 4-language summary + classification, deeplink, preview and download.
// Mirrors functions/insights/article.js (SSR for crawlers, header/footer from ASSETS).

import { LANGS, CAT_LABELS, esc, seoTitle, langQS, htmlResponse } from "../../_shared/insights-ssr.js";

const UI = {
  en: { back: "Repository", open: "Open the official text ↗", download: "Download", copy: "Copy link",
        copied: "Copied ✓", summary: "Summary", source: "Official sources", notfound: "This document does not exist or is not published." },
  nl: { back: "Repository", open: "Open de officiële tekst ↗", download: "Downloaden", copy: "Kopieer link",
        copied: "Gekopieerd ✓", summary: "Samenvatting", source: "Officiële bronnen", notfound: "Dit document bestaat niet of is niet gepubliceerd." },
  de: { back: "Repository", open: "Offiziellen Text öffnen ↗", download: "Herunterladen", copy: "Link kopieren",
        copied: "Kopiert ✓", summary: "Zusammenfassung", source: "Offizielle Quellen", notfound: "Dieses Dokument existiert nicht oder ist nicht veröffentlicht." },
  fr: { back: "Repository", open: "Ouvrir le texte officiel ↗", download: "Télécharger", copy: "Copier le lien",
        copied: "Copié ✓", summary: "Résumé", source: "Sources officielles", notfound: "Ce document n'existe pas ou n'est pas publié." },
};
const FAQ_HEADING = { en: "Frequently asked questions", nl: "Veelgestelde vragen", de: "Häufig gestellte Fragen", fr: "Questions fréquentes" };
const RELATED_HEADING = { en: "Related insight", nl: "Gerelateerd inzicht", de: "Verwandter Beitrag", fr: "Article associé" };

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const langParam = url.searchParams.get("lang") || "en";
  const lang = LANGS.includes(langParam) ? langParam : "en";
  const T = UI[lang];

  const item = await env.DB.prepare(
    `SELECT * FROM repository_items WHERE published = 1 AND access_level = 'public' AND slug = ?`
  ).bind(slug).first();
  if (!item) {
    return htmlResponse(env, url, `
      <main class="container" data-u="u1ffd077">
        <h1>Not found</h1><p>${T.notfound} <a href="/insights/repository/${lang === "en" ? "" : `?lang=${lang}`}">→ /insights/repository</a></p>
      </main>`, { title: "Not found — PODFY", status: 404, noindex: true, lang });
  }

  const summary = item[`summary_${lang}`] || item.summary_en || item.description || "";
  const catLabel = (CAT_LABELS[item.category] || {})[lang] || item.category || "";
  const base = `https://podfy.net/insights/repository/item?slug=${encodeURIComponent(item.slug)}`;
  const canonical = lang === "en" ? base : `${base}&lang=${lang}`;
  const coverUrl = item.cover_image_key ? `/api/insights/repocover/${encodeURIComponent(item.item_id)}` : "";
  const docUrl = item.external_url || `/api/insights/file/${encodeURIComponent(item.item_id)}`;
  const dateHuman = item.created_at
    ? new Date(item.created_at * 1000).toLocaleDateString(
        { en: "en-GB", nl: "nl-NL", de: "de-DE", fr: "fr-FR" }[lang],
        { day: "numeric", month: "long", year: "numeric" })
    : "";

  const alternates = LANGS.map(l =>
    `<link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}&lang=${l}`}" />`
  ).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${base}" />`;
  const switcher = LANGS.map(l => l === lang
    ? `<strong>${l.toUpperCase()}</strong>`
    : `<a href="${l === "en" ? base : `${base}&lang=${l}`}">${l.toUpperCase()}</a>`).join(" · ");

  const ld = [{
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: item.title,
    description: summary.slice(0, 250),
    inLanguage: lang,
    url: canonical,
    ...(coverUrl ? { image: `https://podfy.net${coverUrl}` } : {}),
    ...(item.external_url ? { sameAs: item.external_url } : {}),
    encodingFormat: item.mime_type || "application/pdf",
    publisher: { "@type": "Organization", name: "PODFY", url: "https://podfy.net" },
  }];

  // FAQPage: the structured Q&A pattern that makes a page LLM-citable, not
  // just human-readable. Falls back to English when a language has no FAQ yet
  // (e.g. mid-backfill) rather than showing nothing.
  let faq = [];
  try {
    const allFaq = JSON.parse(item.faq_json || "null");
    faq = (allFaq && Array.isArray(allFaq[lang]) ? allFaq[lang] : allFaq?.en) || [];
  } catch { /* no faq yet */ }
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
  const faqHtml = faq.length ? `
        <section aria-label="FAQ" data-u="u4500e60">
          <h2 data-u="uf15bdb6">${FAQ_HEADING[lang]}</h2>
          ${faq.map(f => `<h3 data-u="u24b1ef5">${esc(f.q)}</h3><p data-u="u93cc9ee">${esc(f.a)}</p>`).join("")}
        </section>` : "";

  // Cross-link: when this item was the source of a generated insight article
  // (repo "Generate insight" button sets blog_posts.source_item_id), surface
  // it here. Runs automatically for every future insight, no manual linking.
  const relatedBlog = await env.DB.prepare(
    `SELECT title, slug, title_nl, title_de, title_fr FROM blog_posts
     WHERE source_item_id = ? AND status = 'published' ORDER BY published_at DESC LIMIT 1`
  ).bind(item.item_id).first();
  const relatedHtml = relatedBlog ? (() => {
    const rTitle = (lang === "en" ? relatedBlog.title : relatedBlog[`title_${lang}`]) || relatedBlog.title;
    const rUrl = `/insights/article?slug=${encodeURIComponent(relatedBlog.slug)}${langQS(lang)}`;
    return `
        <section data-u="uea2d862">
          <span data-u="ub60ac87">${RELATED_HEADING[lang]}</span>
          <a href="${rUrl}" data-u="u6841d7f">${esc(rTitle)} →</a>
        </section>`;
  })() : "";

  let links = [];
  try { links = JSON.parse(item.links_json || "[]"); } catch { /* none */ }
  const sourcesHtml = links.length ? `
        <section data-u="u4500e60">
          <h2 data-u="u0a29ca1">${T.source}</h2>
          <ul data-u="u0478ebb">
            ${links.map(l => `<li data-u="u08f09b5">
              <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>
              <span data-u="u4cc0014"> · ${esc(new URL(l.url).hostname)}</span></li>`).join("")}
          </ul>
        </section>` : "";

  const body = `
    <main class="container" data-u="u06a9470">
      <p data-u="ub89cfb0"><a href="/insights/repository/${lang === "en" ? "" : `?lang=${lang}`}" data-u="ud6e47aa">← ${T.back}</a></p>
      <article>
        ${catLabel ? `<span data-u="uc792b58">${esc(catLabel)}</span>` : ""}
        <h1 class="v2-hero-title" data-u="ua23b426">${esc(item.title)}</h1>
        <p data-u="u9929d3c">${dateHuman} · ${switcher}</p>
        ${coverUrl ? `<img src="${coverUrl}" alt="" data-u="uaba939e" />` : ""}
        <h2 data-u="uf15bdb6">${T.summary}</h2>
        <p data-u="uf04e97f">${esc(summary)}</p>
        <div data-u="u74b03fa">
          ${item.external_url
            ? `<a class="v2-btn v2-btn-primary" href="${esc(item.external_url)}" target="_blank" rel="noopener noreferrer">${T.open}</a>`
            : `<a class="v2-btn v2-btn-primary" href="${docUrl}">${T.download}${item.file_size ? ` (${(item.file_size / 1048576).toFixed(1)} MB)` : ""}</a>`}
          <button class="v2-btn v2-btn-ghost" data-u="u3b6a3a6"
             data-copy-link="${esc(canonical)}" data-copied-text="${esc(T.copied)}">${T.copy}</button><script src="/assets/js/i/dbad8c72751b.js"></script>
        </div>
        ${faqHtml}
        ${relatedHtml}
        ${sourcesHtml}
      </article>
    </main>`;

  return htmlResponse(env, url, body, {
    title: seoTitle(item.title, " — PODFY Repository"),
    description: summary.slice(0, 155),
    canonical, alternates, jsonLd: ld, lang,
    og: { title: item.title, description: summary.slice(0, 200), url: canonical,
          image: coverUrl ? `https://podfy.net${coverUrl}` : "https://podfy.net/assets/og-image.jpg" },
  });
}
