// GET /insights/repository/?lang=en|nl|de|fr — SSR repository card grid.
// Was a static shell fetching cards client-side; converted for the same
// reasons as article.js / insights/index.js — see insights/index.js header.

import { LANGS, CAT_LABELS, esc, seoTitle, langQS, tabsHtml, htmlResponse } from "../../_shared/insights-ssr.js";

const UI = {
  en: { eyebrow: "Insights", heroTitle: "The <em>repository.</em>",
    heroSub: "The conventions and regulations that govern transport in Europe, with practical summaries. Straight to the official texts.",
    readMore: "View details →", empty: "No documents published yet.", couldNotLoad: "Could not load documents.",
    metaDesc: "Official conventions, regulations and documents for transport and logistics: CMR, e-CMR, CIM, CMNI, TIR and eFTI, with practical summaries in four languages." },
  nl: { eyebrow: "Insights", heroTitle: "De <em>repository.</em>",
    heroSub: "De verdragen en verordeningen die transport in Europa regelen, met praktische samenvattingen. Direct naar de officiële teksten.",
    readMore: "Bekijk details →", empty: "Nog geen documenten gepubliceerd.", couldNotLoad: "Kon documenten niet laden.",
    metaDesc: "Officiële verdragen, verordeningen en documenten voor transport en logistiek: CMR, e-CMR, CIM, CMNI, TIR en eFTI, met praktische samenvattingen in vier talen." },
  de: { eyebrow: "Insights", heroTitle: "Das <em>Repository.</em>",
    heroSub: "Die Übereinkommen und Verordnungen, die den Transport in Europa regeln, mit praktischen Zusammenfassungen. Direkt zu den offiziellen Texten.",
    readMore: "Details ansehen →", empty: "Noch keine Dokumente veröffentlicht.", couldNotLoad: "Dokumente konnten nicht geladen werden.",
    metaDesc: "Offizielle Übereinkommen, Verordnungen und Dokumente für Transport und Logistik: CMR, e-CMR, CIM, CMNI, TIR und eFTI, mit praktischen Zusammenfassungen in vier Sprachen." },
  fr: { eyebrow: "Insights", heroTitle: "Le <em>repository.</em>",
    heroSub: "Les conventions et règlements qui régissent le transport en Europe, avec des résumés pratiques. Accès direct aux textes officiels.",
    readMore: "Voir les détails →", empty: "Aucun document publié pour le moment.", couldNotLoad: "Impossible de charger les documents.",
    metaDesc: "Conventions, règlements et documents officiels pour le transport et la logistique : CMR, e-CMR, CIM, CMNI, TIR et eFTI, avec des résumés pratiques en quatre langues." },
};

function cardHtml(d, lang, T) {
  const url = d.slug ? `/insights/repository/item?slug=${encodeURIComponent(d.slug)}${langQS(lang)}` : (d.external_url || "#");
  const catLabel = (CAT_LABELS[d.category] || {})[lang] || d.category || "";
  return `<article class="ins-card">
    <a href="${url}" class="ins-card-img" aria-hidden="true" tabindex="-1">
      ${d.cover_image_key ? `<img src="/api/insights/repocover/${encodeURIComponent(d.item_id)}" alt="" loading="lazy">` : ""}
    </a>
    <div class="ins-card-body">
      ${catLabel ? `<span class="ins-chip">${esc(catLabel)}</span>` : ""}
      <h3><a href="${url}">${esc(d.title)}</a></h3>
      ${d.summary ? `<p>${esc(d.summary)}</p>` : ""}
      <a href="${url}" class="ins-read">${T.readMore}</a>
    </div>
  </article>`;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang") || "en";
  const lang = LANGS.includes(langParam) ? langParam : "en";
  const T = UI[lang];
  const base = "https://podfy.net/insights/repository";
  const canonical = lang === "en" ? base : `${base}/?lang=${lang}`;

  const { results: rows = [] } = await env.DB.prepare(
    `SELECT item_id, title, description, external_url, slug, category, cover_image_key,
            summary_en, summary_nl, summary_de, summary_fr
     FROM repository_items WHERE published = 1 AND access_level = 'public'
     ORDER BY created_at DESC LIMIT 50`
  ).all();

  const items = rows.map(d => ({
    item_id: d.item_id, title: d.title, external_url: d.external_url, slug: d.slug,
    category: d.category, cover_image_key: d.cover_image_key,
    summary: d[`summary_${lang}`] || d.summary_en || d.description || "",
  }));

  const alternates = LANGS.map(l =>
    `<link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}/?lang=${l}`}" />`
  ).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${base}" />`;

  const cardsHtml = items.length
    ? `<div class="ins-grid">${items.map(d => cardHtml(d, lang, T)).join("")}</div>`
    : `<p data-u="u1993946">${T.empty}</p>`;

  const style = `
  <link rel="stylesheet" href="/assets/css/i/cc8f7b5a6ffc.css">
`;

  const body = `
  <section class="ins-hero">
    <div class="container">
      <div class="ins-eyebrow">${esc(T.eyebrow)}</div>
      <h1 class="v2-hero-title" data-u="u04ee30f">${T.heroTitle}</h1>
      <p>${esc(T.heroSub)}</p>
    </div>
  </section>

  <main class="container" data-u="u102e6a6">
    ${tabsHtml(lang, "repository")}
    <div id="repo-cards">${cardsHtml}</div>
  </main>`;

  return htmlResponse(env, url, body, {
    title: seoTitle("Repository — PODFY Insights", ""),
    description: T.metaDesc,
    canonical, alternates, lang,
    extraHead: style,
    og: { type: "website", title: "Repository — PODFY Insights", description: "Official transport conventions and regulations with practical summaries.", url: canonical, image: "https://podfy.net/assets/og-image.jpg" },
    jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "PODFY repository", description: T.metaDesc, url: canonical, inLanguage: lang }],
  });
}
