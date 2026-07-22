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
    : `<p style="color:var(--v2-muted)">${T.empty}</p>`;

  const style = `
  <style>
    .ins-hero{background:#0E1116;border-bottom:1px solid var(--v2-line);padding:52px 0 40px}
    .ins-eyebrow{color:#E05A30;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;font-family:var(--v2-font-sans)}
    .ins-hero .v2-hero-title{color:#F5F2EA}
    .ins-hero p{color:rgba(245,242,234,.65);font-size:1.05rem;max-width:540px;margin:0}
    .ins-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin:0 0 2rem}
    .ins-tabs a{padding:.45rem 1.05rem;border:1px solid var(--v2-line);border-radius:var(--v2-radius);font-size:.88rem;font-weight:500;color:var(--v2-muted);text-decoration:none}
    .ins-tabs a:hover{border-color:var(--v2-ink);color:var(--v2-ink)}
    .ins-tabs a.active{background:var(--v2-ink);color:var(--v2-paper);border-color:var(--v2-ink)}
    .ins-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px}
    .ins-card{background:var(--v2-card);border:1px solid var(--v2-line);border-radius:var(--v2-radius-lg);overflow:hidden;display:flex;flex-direction:column;transition:transform .18s ease,border-color .18s ease}
    .ins-card:hover{transform:translateY(-3px);border-color:var(--v2-line-2)}
    .ins-card-img{display:block;aspect-ratio:16/9;background:var(--v2-paper-2);overflow:hidden}
    .ins-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s ease}
    .ins-card:hover .ins-card-img img{transform:scale(1.04)}
    .ins-card-body{padding:20px 22px 22px;display:flex;flex-direction:column;flex:1}
    .ins-card-body h3{margin:8px 0;font-size:1.08rem;line-height:1.4}
    .ins-card-body h3 a{color:inherit;text-decoration:none}
    .ins-card-body p{margin:0 0 14px;font-size:.9rem;color:var(--v2-muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .ins-read{margin-top:auto;font-size:.88rem;font-weight:600;color:var(--v2-stamp);text-decoration:none}
    .ins-read:hover{text-decoration:underline}
    .ins-chip{display:inline-block;font-family:var(--v2-font-mono);font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;border:1px solid var(--v2-line-2);border-radius:var(--v2-radius);padding:2px 8px;color:var(--v2-muted);align-self:flex-start}
    @media (prefers-reduced-motion: reduce){.ins-card,.ins-card-img img{transition:none}}
  </style>`;

  const body = `
  <section class="ins-hero">
    <div class="container">
      <div class="ins-eyebrow">${esc(T.eyebrow)}</div>
      <h1 class="v2-hero-title" style="max-width:38rem;margin-bottom:.75rem">${T.heroTitle}</h1>
      <p>${esc(T.heroSub)}</p>
    </div>
  </section>

  <main class="container" style="padding:2.25rem 1rem 4rem">
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
