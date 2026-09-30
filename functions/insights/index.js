// GET /insights/?lang=en|nl|de|fr — SSR market-updates list (was a static
// shell that fetched cards client-side; converted for the same reasons as
// article.js: crawlers/LLMs get real content + real links on first byte, and
// the language switcher now has a genuine translated page to land on. The
// client-side search/subject/date filter stays exactly as it was — it's a
// real interactive feature, not an SEO concern — it just hydrates from data
// already embedded in the page instead of an extra fetch() round trip.

import { LANGS, esc, seoTitle, langQS, tabsHtml, htmlResponse } from "../_shared/insights-ssr.js";

const UI = {
  en: { eyebrow: "Insights", heroTitle: "Insights &amp; <em>market updates.</em>",
    heroSub: "Practical writing on proof of delivery, CMR workflows, and digitalisation in transport. No hype. Updated when we have something worth saying.",
    nlHeading: "Newsletter", nlNote: "Weekly summary or every update, in your language.",
    nlEmailPh: "you@company.com", nlFreqWeekly: "Weekly summary", nlFreq3x: "3× per week",
    nlConsent: 'I agree to receive the Podfy newsletter and accept the <a href="/trust" data-u="u1c9c449">privacy policy</a>. Double opt-in: you confirm by email first.',
    nlSubscribe: "Subscribe",
    sectionHeading: "Market updates", searchPh: "Search articles…", allSubjects: "All subjects",
    subjCmr: "CMR & documents", subjRegulation: "Regulations & compliance", subjCapacity: "Capacity & market",
    subjCosts: "Fuel, tolls & costs", subjDisruption: "Safety & disruptions", subjDigital: "Digitalisation",
    allTime: "All time", before: "Before", after: "After", between: "Between", clear: "Clear filters",
    readMore: "Read article →", firstSoon: "First update coming soon.", noMatch: "No articles match these filters.",
    couldNotLoad: "Could not load updates.", result: "result", results: "results" },
  nl: { eyebrow: "Insights", heroTitle: "Insights &amp; <em>marktupdates.</em>",
    heroSub: "Praktisch geschreven over bewijs van aflevering, CMR-workflows en digitalisering in transport. Geen hype. Bijgewerkt als er iets te melden is.",
    nlHeading: "Nieuwsbrief", nlNote: "Wekelijkse samenvatting of elke update, in uw taal.",
    nlEmailPh: "u@bedrijf.nl", nlFreqWeekly: "Wekelijkse samenvatting", nlFreq3x: "3× per week",
    nlConsent: 'Ik ga akkoord met het ontvangen van de Podfy-nieuwsbrief en accepteer het <a href="/nl/trust" data-u="u1c9c449">privacybeleid</a>. Double opt-in: u bevestigt eerst per e-mail.',
    nlSubscribe: "Abonneren",
    sectionHeading: "Marktupdates", searchPh: "Zoek artikelen…", allSubjects: "Alle onderwerpen",
    subjCmr: "CMR & documenten", subjRegulation: "Regelgeving & compliance", subjCapacity: "Capaciteit & markt",
    subjCosts: "Brandstof, tol & kosten", subjDisruption: "Veiligheid & verstoringen", subjDigital: "Digitalisering",
    allTime: "Alle periodes", before: "Voor", after: "Na", between: "Tussen", clear: "Filters wissen",
    readMore: "Lees artikel →", firstSoon: "Eerste update volgt binnenkort.", noMatch: "Geen artikelen komen overeen met deze filters.",
    couldNotLoad: "Kon updates niet laden.", result: "resultaat", results: "resultaten" },
  de: { eyebrow: "Insights", heroTitle: "Insights &amp; <em>Marktupdates.</em>",
    heroSub: "Praktische Beiträge zu Zustellnachweisen, CMR-Workflows und Digitalisierung im Transportwesen. Kein Hype. Aktualisiert, wenn es etwas Relevantes zu sagen gibt.",
    nlHeading: "Newsletter", nlNote: "Wöchentliche Zusammenfassung oder jedes Update, in Ihrer Sprache.",
    nlEmailPh: "sie@unternehmen.de", nlFreqWeekly: "Wöchentliche Zusammenfassung", nlFreq3x: "3× pro Woche",
    nlConsent: 'Ich stimme zu, den Podfy-Newsletter zu erhalten und akzeptiere die <a href="/de/trust" data-u="u1c9c449">Datenschutzerklärung</a>. Double-Opt-in: Sie bestätigen zunächst per E-Mail.',
    nlSubscribe: "Abonnieren",
    sectionHeading: "Marktupdates", searchPh: "Artikel durchsuchen…", allSubjects: "Alle Themen",
    subjCmr: "CMR & Dokumente", subjRegulation: "Vorschriften & Compliance", subjCapacity: "Kapazität & Markt",
    subjCosts: "Kraftstoff, Maut & Kosten", subjDisruption: "Sicherheit & Störungen", subjDigital: "Digitalisierung",
    allTime: "Alle Zeiträume", before: "Vor", after: "Nach", between: "Zwischen", clear: "Filter zurücksetzen",
    readMore: "Artikel lesen →", firstSoon: "Das erste Update folgt in Kürze.", noMatch: "Keine Artikel entsprechen diesen Filtern.",
    couldNotLoad: "Updates konnten nicht geladen werden.", result: "Ergebnis", results: "Ergebnisse" },
  fr: { eyebrow: "Insights", heroTitle: "Insights &amp; <em>actualités du marché.</em>",
    heroSub: "Des articles pratiques sur la preuve de livraison, les flux CMR et la digitalisation du transport. Sans battage médiatique. Mis à jour quand nous avons quelque chose à dire.",
    nlHeading: "Newsletter", nlNote: "Résumé hebdomadaire ou chaque mise à jour, dans votre langue.",
    nlEmailPh: "vous@entreprise.fr", nlFreqWeekly: "Résumé hebdomadaire", nlFreq3x: "3× par semaine",
    nlConsent: 'J’accepte de recevoir la newsletter Podfy et j’accepte la <a href="/fr/trust" data-u="u1c9c449">politique de confidentialité</a>. Double opt-in : vous confirmez d’abord par e-mail.',
    nlSubscribe: "S’abonner",
    sectionHeading: "Actualités du marché", searchPh: "Rechercher des articles…", allSubjects: "Tous les sujets",
    subjCmr: "CMR & documents", subjRegulation: "Réglementation & conformité", subjCapacity: "Capacité & marché",
    subjCosts: "Carburant, péages & coûts", subjDisruption: "Sécurité & perturbations", subjDigital: "Digitalisation",
    allTime: "Toutes périodes", before: "Avant", after: "Après", between: "Entre", clear: "Effacer les filtres",
    readMore: "Lire l'article →", firstSoon: "La première mise à jour arrive bientôt.", noMatch: "Aucun article ne correspond à ces filtres.",
    couldNotLoad: "Impossible de charger les mises à jour.", result: "résultat", results: "résultats" },
};

const DATE_LOCALE = { en: "en-GB", nl: "nl-NL", de: "de-DE", fr: "fr-FR" };

function fmtDate(unix, lang) {
  if (!unix) return "";
  return new Date(unix * 1000).toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "short", year: "numeric" });
}

function cardHtml(p, lang, T) {
  const url = `/insights/article?slug=${encodeURIComponent(p.slug)}${langQS(lang)}`;
  return `<article class="ins-card">
    <a href="${url}" class="ins-card-img" aria-hidden="true" tabindex="-1">
      ${p.cover_image_key ? `<img src="/api/insights/cover/${encodeURIComponent(p.id)}" alt="" loading="lazy">` : ""}
    </a>
    <div class="ins-card-body">
      <div class="ins-card-meta">${fmtDate(p.published_at, lang)}</div>
      <h3><a href="${url}">${esc(p.title)}</a></h3>
      ${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""}
      <a href="${url}" class="ins-read">${T.readMore}</a>
    </div>
  </article>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang") || "en";
  const lang = LANGS.includes(langParam) ? langParam : "en";
  const T = UI[lang];
  const base = "https://podfy.net/insights";
  const canonical = lang === "en" ? `${base}` : `${base}/?lang=${lang}`;

  const { results: rows = [] } = await env.DB.prepare(
    `SELECT id, title, title_nl, title_de, title_fr, excerpt, excerpt_nl, excerpt_de, excerpt_fr,
            slug, cover_image_key, published_at, category
     FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 50`
  ).all();

  // Per-item graceful fallback (like the repository list, not the whole-page
  // gate article.js uses) — a list should always show *something* per card.
  const posts = rows.map(p => ({
    id: p.id, slug: p.slug, cover_image_key: p.cover_image_key,
    published_at: p.published_at, category: p.category,
    title: (lang === "en" ? p.title : p[`title_${lang}`]) || p.title,
    excerpt: (lang === "en" ? p.excerpt : p[`excerpt_${lang}`]) || p.excerpt || "",
  }));

  const alternates = LANGS.map(l =>
    `<link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}/?lang=${l}`}" />`
  ).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${base}" />`;

  const cardsHtml = posts.length
    ? `<div class="ins-grid">${posts.map(p => cardHtml(p, lang, T)).join("")}</div>`
    : `<p data-u="u1993946">${T.firstSoon}</p>`;

  const style = `
  <link rel="stylesheet" href="/assets/css/i/c4026fa5f3ef.css">
  <link rel="preconnect" href="https://challenges.cloudflare.com" crossorigin />`;

  const body = `
  <section class="ins-hero">
    <div class="container ins-hero-grid">
      <div>
        <div class="ins-eyebrow">${esc(T.eyebrow)}</div>
        <h1 class="v2-hero-title" data-u="u04ee30f">${T.heroTitle}</h1>
        <p>${esc(T.heroSub)}</p>
      </div>
      <div class="ins-sub-card" aria-labelledby="nl-heading">
        <div>
          <h2 id="nl-heading">${esc(T.nlHeading)}</h2>
          <p class="ins-sub-note">${esc(T.nlNote)}</p>
        </div>
        <form id="nl-form">
          <div data-u="u5e65218">
            <input type="email" id="nl-email" placeholder="${esc(T.nlEmailPh)}" required data-u="u29f4f27" />
            <select id="nl-freq" data-u="u51b653e">
              <option value="weekly">${esc(T.nlFreqWeekly)}</option>
              <option value="daily">${esc(T.nlFreq3x)}</option>
            </select>
            <select id="nl-lang" data-u="uac6ea07">
              <option value="en">EN</option><option value="nl">NL</option><option value="de">DE</option><option value="fr">FR</option>
            </select>
          </div>
          <input type="text" id="nl-hp" name="hp_sub" value="" autocomplete="off" tabindex="-1" data-u="uf93d128" aria-hidden="true" />
          <label class="ins-sub-consent">
            <input type="checkbox" id="nl-consent" required data-u="ud833699" />
            <span>${T.nlConsent}</span>
          </label>
          <input type="hidden" id="nl-turnstile-token" value="" />
          <div class="cf-turnstile" data-sitekey="0x4AAAAAACFOR78WSLkw_gB7" data-callback="onNlTurnstile" data-size="flexible" data-appearance="interaction-only"></div>
          <button type="submit" class="v2-btn v2-btn-primary" data-u="ub310ca1">${esc(T.nlSubscribe)}</button>
          <span id="nl-msg" data-u="u381e4c2"></span>
        </form>
      </div>
    </div>
  </section>

  <main class="container" data-u="u102e6a6">
    ${tabsHtml(lang, "market")}
    <section aria-labelledby="mu-heading" data-u="u79ef84c">
      <h2 id="mu-heading" data-u="u3ffdc92">${esc(T.sectionHeading)}</h2>
      <div class="ins-filter" role="search">
        <input type="search" id="flt-q" placeholder="${esc(T.searchPh)}" aria-label="${esc(T.searchPh)}" />
        <select id="flt-subject" aria-label="${esc(T.allSubjects)}">
          <option value="">${esc(T.allSubjects)}</option>
          <option value="cmr">${esc(T.subjCmr)}</option>
          <option value="regulation">${esc(T.subjRegulation)}</option>
          <option value="capacity">${esc(T.subjCapacity)}</option>
          <option value="costs">${esc(T.subjCosts)}</option>
          <option value="disruption">${esc(T.subjDisruption)}</option>
          <option value="digital">${esc(T.subjDigital)}</option>
        </select>
        <select id="flt-mode" aria-label="${esc(T.allTime)}">
          <option value="">${esc(T.allTime)}</option>
          <option value="before">${esc(T.before)}</option>
          <option value="after">${esc(T.after)}</option>
          <option value="between">${esc(T.between)}</option>
        </select>
        <input type="date" id="flt-d1" aria-label="Date" data-u="u6b99de8" />
        <input type="date" id="flt-d2" aria-label="End date" data-u="u6b99de8" />
        <span class="ins-filter-count" id="flt-count"></span>
        <button type="button" class="ins-filter-clear" id="flt-clear" data-u="u6b99de8">${esc(T.clear)}</button>
      </div>
      <div id="insights-posts">${cardsHtml}</div>
    </section>
  </main>

  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <script type="application/json" id="insights-data">${JSON.stringify({ dateLocale: DATE_LOCALE[lang], lang, posts, readMore: T.readMore, noMatch: T.noMatch, result: T.result, results: T.results }).replace(/</g, "\\u003c")}</script>
  <script src="/assets/js/i/f7b125f8512c.js"></script>
`;

  return htmlResponse(env, url, body, {
    title: seoTitle(lang === "en" ? "Insights — PODFY" : `${T.sectionHeading} — PODFY Insights`, ""),
    description: "Market updates, whitepapers, and practical guides on proof of delivery, CMR, and logistics digitalisation. Subscribe to the PODFY newsletter.",
    canonical, alternates, lang,
    extraHead: style,
    og: { type: "website", title: "Insights — PODFY", description: "Market updates, whitepapers, and guides on proof of delivery and logistics.", url: canonical, image: "https://podfy.net/assets/og-image.jpg" },
    jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "PODFY insights", description: "Market updates, whitepapers, and guides on proof of delivery and logistics digitalisation.", url: canonical, inLanguage: lang }],
  });
}
