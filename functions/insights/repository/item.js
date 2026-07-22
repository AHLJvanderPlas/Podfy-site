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
      <main class="container" style="max-width:720px;margin:0 auto;padding:3rem 1.25rem">
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
        <section aria-label="FAQ" style="margin-top:2.25rem;border-top:1px solid var(--v2-border,#ddd);padding-top:1.1rem">
          <h2 style="font-size:1.1rem">${FAQ_HEADING[lang]}</h2>
          ${faq.map(f => `<h3 style="font-size:.95rem;margin:1rem 0 .3rem">${esc(f.q)}</h3><p style="line-height:1.6">${esc(f.a)}</p>`).join("")}
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
        <section style="margin-top:1.75rem">
          <span style="display:block;font-size:.72rem;color:var(--v2-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.3rem">${RELATED_HEADING[lang]}</span>
          <a href="${rUrl}" style="font-size:.95rem;font-weight:600">${esc(rTitle)} →</a>
        </section>`;
  })() : "";

  let links = [];
  try { links = JSON.parse(item.links_json || "[]"); } catch { /* none */ }
  const sourcesHtml = links.length ? `
        <section style="margin-top:2.25rem;border-top:1px solid var(--v2-border,#ddd);padding-top:1.1rem">
          <h2 style="font-size:.95rem;margin:0 0 .6rem">${T.source}</h2>
          <ul style="margin:0;padding:0;list-style:none">
            ${links.map(l => `<li style="margin:0 0 .45rem;font-size:.9rem">
              <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>
              <span style="font-size:.75rem;color:var(--v2-muted)"> · ${esc(new URL(l.url).hostname)}</span></li>`).join("")}
          </ul>
        </section>` : "";

  const body = `
    <main class="container" style="max-width:760px;margin:0 auto;padding:2rem 1.25rem 4rem">
      <p style="margin:1.5rem 0"><a href="/insights/repository/${lang === "en" ? "" : `?lang=${lang}`}" style="font-size:.9rem">← ${T.back}</a></p>
      <article>
        ${catLabel ? `<span style="display:inline-block;font-family:var(--v2-font-mono);font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;border:1px solid var(--v2-line-2,#ccc);border-radius:4px;padding:2px 9px;color:var(--v2-muted);margin-bottom:.8rem">${esc(catLabel)}</span>` : ""}
        <h1 class="v2-hero-title" style="font-size:1.9rem">${esc(item.title)}</h1>
        <p style="font-size:.85rem;color:var(--v2-muted);margin:.5rem 0 1.5rem">${dateHuman} · ${switcher}</p>
        ${coverUrl ? `<img src="${coverUrl}" alt="" style="max-width:100%;border-radius:4px;margin:0 0 1.5rem" />` : ""}
        <h2 style="font-size:1.1rem">${T.summary}</h2>
        <p style="line-height:1.7">${esc(summary)}</p>
        <div style="margin:2rem 0 0;display:flex;gap:.6rem;flex-wrap:wrap">
          ${item.external_url
            ? `<a class="v2-btn v2-btn-primary" href="${esc(item.external_url)}" target="_blank" rel="noopener noreferrer">${T.open}</a>`
            : `<a class="v2-btn v2-btn-primary" href="${docUrl}">${T.download}${item.file_size ? ` (${(item.file_size / 1048576).toFixed(1)} MB)` : ""}</a>`}
          <button class="v2-btn v2-btn-ghost" style="cursor:pointer"
             onclick="navigator.clipboard.writeText('${canonical}');this.textContent='${T.copied}'">${T.copy}</button>
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
