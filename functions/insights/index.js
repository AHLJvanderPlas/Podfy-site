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
    nlConsent: 'I agree to receive the Podfy newsletter and accept the <a href="/trust" style="color:inherit">privacy policy</a>. Double opt-in: you confirm by email first.',
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
    nlConsent: 'Ik ga akkoord met het ontvangen van de Podfy-nieuwsbrief en accepteer het <a href="/nl/trust" style="color:inherit">privacybeleid</a>. Double opt-in: u bevestigt eerst per e-mail.',
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
    nlConsent: 'Ich stimme zu, den Podfy-Newsletter zu erhalten und akzeptiere die <a href="/de/trust" style="color:inherit">Datenschutzerklärung</a>. Double-Opt-in: Sie bestätigen zunächst per E-Mail.',
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
    nlConsent: 'J’accepte de recevoir la newsletter Podfy et j’accepte la <a href="/fr/trust" style="color:inherit">politique de confidentialité</a>. Double opt-in : vous confirmez d’abord par e-mail.',
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
    : `<p style="color:var(--v2-muted)">${T.firstSoon}</p>`;

  const style = `
  <style>
    .ins-hero{background:#0E1116;border-bottom:1px solid var(--v2-line);padding:64px 0 52px}
    .ins-eyebrow{color:#E05A30;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;font-family:var(--v2-font-sans)}
    .ins-hero .v2-hero-title{color:#F5F2EA}
    .ins-hero p{color:rgba(245,242,234,.65);font-size:1.05rem;max-width:540px;margin:0}
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
    .ins-hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:3rem;align-items:center}
    @media (max-width:860px){.ins-hero-grid{grid-template-columns:1fr;gap:2rem}}
    .ins-sub-card{background:rgba(255,255,255,.045);border:1px solid rgba(245,242,234,.16);border-radius:6px;padding:1rem 1.1rem}
    .ins-sub-card h2{margin:0 0 .2rem;font-size:.95rem;color:#F5F2EA;display:inline}
    .ins-sub-card .ins-sub-note{display:inline;margin:0 0 0 .4rem;font-size:.78rem;color:rgba(245,242,234,.55)}
    .ins-sub-card form{margin-top:.6rem}
    .ins-sub-card input[type=email],.ins-sub-card select{background:rgba(255,255,255,.07);border:1px solid rgba(245,242,234,.22);border-radius:4px;color:#F5F2EA;padding:.45rem .6rem;font-size:.85rem;font-family:var(--v2-font-sans)}
    .ins-sub-card input[type=email]::placeholder{color:rgba(245,242,234,.4)}
    .ins-sub-card select option{color:#0E1116;background:#F5F2EA}
    .ins-sub-consent{display:flex;gap:.45rem;align-items:flex-start;font-size:.68rem;line-height:1.4;color:rgba(245,242,234,.55);margin:.55rem 0 .4rem}
    .ins-sub-card .cf-turnstile{margin:0}
    .ins-sub-card .cf-turnstile:empty{display:none}
    .ins-filter{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin:0 0 1.75rem}
    .ins-filter input,.ins-filter select{background:var(--v2-card);border:1px solid var(--v2-line);border-radius:4px;color:var(--v2-ink);padding:.55rem .7rem;font-size:.88rem;font-family:var(--v2-font-sans)}
    .ins-filter input[type=search]{flex:1 1 220px;max-width:340px}
    .ins-filter input[type=date]{min-width:140px}
    .ins-filter-count{font-size:.85rem;color:var(--v2-muted)}
    .ins-filter-clear{font-size:.85rem;color:var(--v2-stamp);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0}
    .ins-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin:0 0 2rem}
    .ins-tabs a{padding:.45rem 1.05rem;border:1px solid var(--v2-line);border-radius:var(--v2-radius);font-size:.88rem;font-weight:500;color:var(--v2-muted);text-decoration:none}
    .ins-tabs a:hover{border-color:var(--v2-ink);color:var(--v2-ink)}
    .ins-tabs a.active{background:var(--v2-ink);color:var(--v2-paper);border-color:var(--v2-ink)}
    @media (prefers-reduced-motion: reduce){.ins-card,.ins-card-img img{transition:none}}
  </style>
  <link rel="preconnect" href="https://challenges.cloudflare.com" crossorigin />`;

  const body = `
  <section class="ins-hero">
    <div class="container ins-hero-grid">
      <div>
        <div class="ins-eyebrow">${esc(T.eyebrow)}</div>
        <h1 class="v2-hero-title" style="max-width:38rem;margin-bottom:.75rem">${T.heroTitle}</h1>
        <p>${esc(T.heroSub)}</p>
      </div>
      <div class="ins-sub-card" aria-labelledby="nl-heading">
        <div>
          <h2 id="nl-heading">${esc(T.nlHeading)}</h2>
          <p class="ins-sub-note">${esc(T.nlNote)}</p>
        </div>
        <form id="nl-form">
          <div style="display:flex;gap:.45rem;flex-wrap:wrap">
            <input type="email" id="nl-email" placeholder="${esc(T.nlEmailPh)}" required style="flex:2;min-width:170px" />
            <select id="nl-freq" style="flex:1;min-width:125px">
              <option value="weekly">${esc(T.nlFreqWeekly)}</option>
              <option value="daily">${esc(T.nlFreq3x)}</option>
            </select>
            <select id="nl-lang" style="flex:0 0 auto">
              <option value="en">EN</option><option value="nl">NL</option><option value="de">DE</option><option value="fr">FR</option>
            </select>
          </div>
          <input type="text" id="nl-hp" name="hp_sub" value="" autocomplete="off" tabindex="-1" style="position:absolute;left:-9999px" aria-hidden="true" />
          <label class="ins-sub-consent">
            <input type="checkbox" id="nl-consent" required style="margin-top:.1rem" />
            <span>${T.nlConsent}</span>
          </label>
          <input type="hidden" id="nl-turnstile-token" value="" />
          <div class="cf-turnstile" data-sitekey="0x4AAAAAACFOR78WSLkw_gB7" data-callback="onNlTurnstile" data-size="flexible" data-appearance="interaction-only"></div>
          <button type="submit" class="v2-btn v2-btn-primary" style="margin-top:.5rem">${esc(T.nlSubscribe)}</button>
          <span id="nl-msg" style="font-size:.8rem;margin-left:.6rem;color:rgba(245,242,234,.75)"></span>
        </form>
      </div>
    </div>
  </section>

  <main class="container" style="padding:2.25rem 1rem 4rem">
    ${tabsHtml(lang, "market")}
    <section aria-labelledby="mu-heading" style="margin-bottom:4rem">
      <h2 id="mu-heading" style="margin-bottom:1.25rem">${esc(T.sectionHeading)}</h2>
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
        <input type="date" id="flt-d1" aria-label="Date" style="display:none" />
        <input type="date" id="flt-d2" aria-label="End date" style="display:none" />
        <span class="ins-filter-count" id="flt-count"></span>
        <button type="button" class="ins-filter-clear" id="flt-clear" style="display:none">${esc(T.clear)}</button>
      </div>
      <div id="insights-posts">${cardsHtml}</div>
    </section>
  </main>

  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <script>
    function onNlTurnstile(token) { document.getElementById("nl-turnstile-token").value = token; }
    function esc(s) { return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function fmtDate(unix) {
      if (!unix) return "";
      return new Date(unix * 1000).toLocaleDateString(${JSON.stringify(DATE_LOCALE[lang])}, { day: "numeric", month: "short", year: "numeric" });
    }

    (function () {
      var pageLang = ${JSON.stringify(lang)};
      var sel = document.getElementById("nl-lang");
      if (sel && sel.querySelector('option[value="' + pageLang + '"]')) sel.value = pageLang;
    })();

    // Posts already resolved server-side in the requested language — no
    // fetch needed; the filter below re-renders this same data client-side.
    var ALL_POSTS = ${JSON.stringify(posts)};
    var PAGE_LANG = ${JSON.stringify(lang)};
    var READ_MORE = ${JSON.stringify(T.readMore)};
    var NO_MATCH = ${JSON.stringify(T.noMatch)};
    var RESULT_WORD = ${JSON.stringify(T.result)}, RESULTS_WORD = ${JSON.stringify(T.results)};
    // Subject keyword fallback only fires for posts authored before the
    // 'category' column existed (English titles at the time) — every
    // current post has 'category' set explicitly and skips this entirely.
    var SUBJECTS = {
      cmr:        /\\b(e-?cmr|cmr|consignment|waybill|vrachtbrief|proof of delivery|pod\\b)/i,
      regulation: /\\b(regulation|rules?|law|compliance|efti|tachograph|mobility package|ban|verordening|mandat)/i,
      capacity:   /\\b(capacity|driver shortage|shortage|market|rates?|volumes?|freight|crunch)/i,
      costs:      /\\b(fuel|diesel|toll|maut|tax|costs?|price)/i,
      disruption: /\\b(safety|strike|protest|congestion|closure|disruption|roadworks|delay)/i,
      digital:    /\\b(digital|digitis|digitiz|ai\\b|automation|data|platform|app\\b)/i,
    };
    function cardHtml(p) {
      var url = "/insights/article?slug=" + encodeURIComponent(p.slug) + (PAGE_LANG === "en" ? "" : "&lang=" + PAGE_LANG);
      return '<article class="ins-card">' +
        '<a href="' + url + '" class="ins-card-img" aria-hidden="true" tabindex="-1">' +
          (p.cover_image_key ? '<img src="/api/insights/cover/' + encodeURIComponent(p.id) + '" alt="" loading="lazy">' : '') +
        '</a>' +
        '<div class="ins-card-body">' +
          '<div class="ins-card-meta">' + fmtDate(p.published_at) + '</div>' +
          '<h3><a href="' + url + '">' + esc(p.title) + '</a></h3>' +
          (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') +
          '<a href="' + url + '" class="ins-read">' + READ_MORE + '</a>' +
        '</div></article>';
    }
    function renderPosts() {
      var el = document.getElementById("insights-posts");
      var q = document.getElementById("flt-q").value.trim().toLowerCase();
      var subject = document.getElementById("flt-subject").value;
      var mode = document.getElementById("flt-mode").value;
      var d1 = document.getElementById("flt-d1").value ? Date.parse(document.getElementById("flt-d1").value) / 1000 : null;
      var d2 = document.getElementById("flt-d2").value ? Date.parse(document.getElementById("flt-d2").value) / 1000 + 86399 : null;
      var items = ALL_POSTS.filter(function (p) {
        var hay = (p.title + " " + (p.excerpt || "")).toLowerCase();
        if (q && hay.indexOf(q) === -1) return false;
        if (subject) {
          if (p.category) { if (p.category !== subject) return false; }
          else if (!SUBJECTS[subject].test(hay)) return false;
        }
        var t = p.published_at || 0;
        if (mode === "before" && d1 && t >= d1) return false;
        if (mode === "after" && d1 && t <= d1) return false;
        if (mode === "between") {
          if (d1 && t < d1) return false;
          if (d2 && t > d2) return false;
        }
        return true;
      });
      var active = !!(q || subject || (mode && (d1 || d2)));
      document.getElementById("flt-count").textContent = active
        ? items.length + " " + (items.length === 1 ? RESULT_WORD : RESULTS_WORD) : "";
      document.getElementById("flt-clear").style.display = active ? "" : "none";
      if (!items.length) { el.innerHTML = '<p style="color:var(--v2-muted)">' + NO_MATCH + '</p>'; return; }
      el.innerHTML = '<div class="ins-grid">' + items.map(cardHtml).join("") + '</div>';
    }
    (function wireFilters() {
      var q = document.getElementById("flt-q"), timer;
      q.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(renderPosts, 250); });
      document.getElementById("flt-subject").addEventListener("change", renderPosts);
      document.getElementById("flt-mode").addEventListener("change", function () {
        var mode = this.value;
        document.getElementById("flt-d1").style.display = mode ? "" : "none";
        document.getElementById("flt-d2").style.display = mode === "between" ? "" : "none";
        renderPosts();
      });
      document.getElementById("flt-d1").addEventListener("change", renderPosts);
      document.getElementById("flt-d2").addEventListener("change", renderPosts);
      document.getElementById("flt-clear").addEventListener("click", function () {
        q.value = "";
        document.getElementById("flt-subject").value = "";
        document.getElementById("flt-mode").value = "";
        document.getElementById("flt-d1").value = ""; document.getElementById("flt-d1").style.display = "none";
        document.getElementById("flt-d2").value = ""; document.getElementById("flt-d2").style.display = "none";
        renderPosts();
      });
    })();

    document.getElementById("nl-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("nl-msg");
      msg.textContent = "…";
      fetch("/api/insights/subscribe", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("nl-email").value,
          lang: document.getElementById("nl-lang").value,
          frequency: document.getElementById("nl-freq").value,
          consent: document.getElementById("nl-consent").checked,
          hp_sub: document.getElementById("nl-hp").value,
          cf_turnstile_token: document.getElementById("nl-turnstile-token").value,
        }),
      }).then(r => r.json()).then(function (data) {
        if (data.ok && data.message === "already_subscribed") { msg.textContent = "✓"; }
        else if (data.ok) { msg.textContent = "✅"; document.getElementById("nl-form").reset(); }
        else { msg.textContent = data.error || "…"; }
      }).catch(function () { msg.textContent = "…"; });
    });
  </script>`;

  return htmlResponse(env, url, body, {
    title: seoTitle(lang === "en" ? "Insights — PODFY" : `${T.sectionHeading} — PODFY Insights`, ""),
    description: "Market updates, whitepapers, and practical guides on proof of delivery, CMR, and logistics digitalisation. Subscribe to the PODFY newsletter.",
    canonical, alternates, lang,
    extraHead: style,
    og: { type: "website", title: "Insights — PODFY", description: "Market updates, whitepapers, and guides on proof of delivery and logistics.", url: canonical, image: "https://podfy.net/assets/og-image.jpg" },
    jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "PODFY insights", description: "Market updates, whitepapers, and guides on proof of delivery and logistics digitalisation.", url: canonical, inLanguage: lang }],
  });
}
