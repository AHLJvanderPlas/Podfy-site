// GET /insights/linkedin/?lang=en|nl|de|fr — SSR LinkedIn post card grid.
// Was a static shell fetching cards client-side; converted for the same
// reasons as article.js / insights/index.js — see insights/index.js header.
// The LinkedIn posts themselves are always Dutch (by design — see the hero
// copy below, translated into every language); only the page CHROME and the
// underlying blog title/excerpt shown on each card are localized here.

import { LANGS, esc, seoTitle, tabsHtml, htmlResponse } from "../../_shared/insights-ssr.js";

const UI = {
  en: { eyebrow: "Insights", heroTitle: "On <em>LinkedIn.</em>",
    heroSub: "Where the conversation happens. Every article lands on LinkedIn in Dutch, written for carriers and planners. React, disagree, add your view.",
    viewPost: "View post on LinkedIn ↗", empty: "The first post is on its way. Check back after Monday morning.", couldNotLoad: "Could not load posts.",
    metaDesc: "Our latest LinkedIn posts on European road transport, regulations and proof of delivery. Join the conversation." },
  nl: { eyebrow: "Insights", heroTitle: "Op <em>LinkedIn.</em>",
    heroSub: "Waar het gesprek plaatsvindt. Elk artikel verschijnt in het Nederlands op LinkedIn, geschreven voor vervoerders en planners. Reageer, wees het oneens, deel uw kijk.",
    viewPost: "Bekijk post op LinkedIn ↗", empty: "De eerste post komt eraan. Kijk na maandagochtend nog eens.", couldNotLoad: "Kon posts niet laden.",
    metaDesc: "Onze laatste LinkedIn-posts over Europees wegtransport, regelgeving en bewijs van aflevering. Doe mee aan het gesprek." },
  de: { eyebrow: "Insights", heroTitle: "Auf <em>LinkedIn.</em>",
    heroSub: "Wo das Gespräch stattfindet. Jeder Beitrag erscheint auf Niederländisch auf LinkedIn, geschrieben für Spediteure und Disponenten. Reagieren Sie, widersprechen Sie, teilen Sie Ihre Sicht.",
    viewPost: "Beitrag auf LinkedIn ansehen ↗", empty: "Der erste Beitrag ist unterwegs. Schauen Sie nach Montagvormittag wieder vorbei.", couldNotLoad: "Beiträge konnten nicht geladen werden.",
    metaDesc: "Unsere neuesten LinkedIn-Beiträge zu europäischem Straßentransport, Vorschriften und Zustellnachweisen. Diskutieren Sie mit." },
  fr: { eyebrow: "Insights", heroTitle: "Sur <em>LinkedIn.</em>",
    heroSub: "Là où la conversation a lieu. Chaque article est publié en néerlandais sur LinkedIn, écrit pour les transporteurs et planificateurs. Réagissez, exprimez votre désaccord, partagez votre avis.",
    viewPost: "Voir le post sur LinkedIn ↗", empty: "Le premier post arrive bientôt. Revenez après lundi matin.", couldNotLoad: "Impossible de charger les posts.",
    metaDesc: "Nos derniers posts LinkedIn sur le transport routier européen, la réglementation et la preuve de livraison. Rejoignez la conversation." },
};

const DATE_LOCALE = { en: "en-GB", nl: "nl-NL", de: "de-DE", fr: "fr-FR" };
function fmtDate(unix, lang) {
  if (!unix) return "";
  return new Date(unix * 1000).toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "short", year: "numeric" });
}

function cardHtml(p, lang, T) {
  const url = `/li/${encodeURIComponent(p.id)}?src=site`;
  return `<article class="ins-card">
    <a href="${url}" target="_blank" rel="noopener" class="ins-card-img" aria-hidden="true" tabindex="-1">
      ${p.cover_image_key ? `<img src="/api/insights/cover/${encodeURIComponent(p.id)}" alt="" loading="lazy">` : ""}
    </a>
    <div class="ins-card-body">
      <div class="ins-card-meta">${fmtDate(p.published_at, lang)}</div>
      <h3><a href="${url}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
      ${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""}
      <a href="${url}" target="_blank" rel="noopener" class="ins-read">${T.viewPost}</a>
    </div>
  </article>`;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang") || "en";
  const lang = LANGS.includes(langParam) ? langParam : "en";
  const T = UI[lang];
  const base = "https://podfy.net/insights/linkedin";
  const canonical = lang === "en" ? base : `${base}/?lang=${lang}`;

  const { results: rows = [] } = await env.DB.prepare(
    `SELECT id, title, title_nl, title_de, title_fr, excerpt, excerpt_nl, excerpt_de, excerpt_fr,
            cover_image_key, published_at
     FROM blog_posts WHERE status = 'published' AND linkedin_post_url IS NOT NULL
     ORDER BY published_at DESC LIMIT 50`
  ).all();

  const items = rows.map(p => ({
    id: p.id, cover_image_key: p.cover_image_key, published_at: p.published_at,
    title: (lang === "en" ? p.title : p[`title_${lang}`]) || p.title,
    excerpt: (lang === "en" ? p.excerpt : p[`excerpt_${lang}`]) || p.excerpt || "",
  }));

  const alternates = LANGS.map(l =>
    `<link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}/?lang=${l}`}" />`
  ).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${base}" />`;

  const cardsHtml = items.length
    ? `<div class="ins-grid">${items.map(p => cardHtml(p, lang, T)).join("")}</div>`
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
    .ins-card-meta{font-size:.78rem;color:var(--v2-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em}
    .ins-card-body h3{margin:0 0 8px;font-size:1.08rem;line-height:1.4}
    .ins-card-body h3 a{color:inherit;text-decoration:none}
    .ins-card-body p{margin:0 0 14px;font-size:.9rem;color:var(--v2-muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .ins-read{margin-top:auto;font-size:.88rem;font-weight:600;color:var(--v2-stamp);text-decoration:none}
    .ins-read:hover{text-decoration:underline}
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
    ${tabsHtml(lang, "linkedin")}
    <div id="li-cards">${cardsHtml}</div>
  </main>`;

  return htmlResponse(env, url, body, {
    title: seoTitle("LinkedIn — PODFY Insights", ""),
    description: T.metaDesc,
    canonical, alternates, lang,
    extraHead: style,
    og: { type: "website", title: "LinkedIn — PODFY Insights", description: "Our latest LinkedIn posts on European transport. Join the conversation.", url: canonical, image: "https://podfy.net/assets/og-image.jpg" },
    jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "PODFY on LinkedIn", description: T.metaDesc, url: canonical, inLanguage: lang }],
  });
}
