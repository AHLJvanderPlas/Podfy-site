// GET /insights/article?slug=...&lang=en|nl|de|fr — server-side rendered article.
// SSR (not client JS) so crawlers and LLMs get full content, BlogPosting +
// FAQPage JSON-LD, per-language meta description, canonical + hreflang.
// Header/footer partials injected from ASSETS (mirrors _middleware.js).

const LANGS = ["en", "nl", "de", "fr"];
const UI = {
  en: { back: "All insights", faq: "Frequently asked questions", notfound: "This article does not exist or is not published." },
  nl: { back: "Alle insights", faq: "Veelgestelde vragen", notfound: "Dit artikel bestaat niet of is niet gepubliceerd." },
  de: { back: "Alle Insights", faq: "Häufig gestellte Fragen", notfound: "Dieser Artikel existiert nicht oder ist nicht veröffentlicht." },
  fr: { back: "Tous les articles", faq: "Questions fréquentes", notfound: "Cet article n'existe pas ou n'est pas publié." },
};

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
        <h1>Not found</h1><p>${UI[lang].notfound} <a href="/insights">→ /insights</a></p>
      </main>`, { title: "Not found — PODFY", status: 404, noindex: true });
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

  const body = `
    <main class="container" style="max-width:720px;margin:0 auto;padding:2rem 1.25rem 4rem">
      <p style="margin:1.5rem 0"><a href="/insights" style="font-size:.9rem">← ${UI[effLang].back}</a></p>
      <article>
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
      </article>
    </main>`;

  return htmlResponse(env, url, body, {
    title: `${title} — PODFY`,
    description: excerpt,
    canonical,
    alternates,
    og: { title, description: excerpt, url: canonical, image: coverUrl || "https://podfy.net/assets/og-image.jpg" },
    jsonLd: ld,
    lang: effLang,
  });
}

// ── Page shell (injects header/footer partials like _middleware.js) ──────────

async function htmlResponse(env, url, body, opts) {
  const [headerRes, footerRes] = await Promise.all([
    env.ASSETS.fetch(new URL("/partials/header.html", url)),
    env.ASSETS.fetch(new URL("/partials/footer.html", url)),
  ]);
  const [headerHtml, footerHtml] = await Promise.all([
    headerRes.text().catch(() => ""), footerRes.text().catch(() => ""),
  ]);
  const html = `<!doctype html>
<html lang="${opts.lang || "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(opts.title)}</title>
  ${opts.description ? `<meta name="description" content="${esc(opts.description)}" />` : ""}
  ${opts.noindex ? `<meta name="robots" content="noindex" />` : `<meta name="robots" content="index,follow,max-image-preview:large" />`}
  ${opts.canonical ? `<link rel="canonical" href="${opts.canonical}" />` : ""}
  ${opts.alternates || ""}
  ${opts.og ? `<meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(opts.og.title)}" />
  <meta property="og:description" content="${esc(opts.og.description)}" />
  <meta property="og:url" content="${opts.og.url}" />
  <meta property="og:image" content="${opts.og.image}" />
  <meta name="twitter:card" content="summary_large_image" />` : ""}
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5F2EA" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#12100D" />
  <link rel="icon" type="image/svg+xml" href="/assets/podfy-favicon.svg" />
  <link rel="stylesheet" href="/assets/styles.site.css?v=v3-r2" />
  <script src="/assets/theme.js" defer></script>
  ${(opts.jsonLd || []).map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n  ")}
</head>
<body>
  ${headerHtml}
  ${body}
  ${footerHtml}
</body>
</html>`;
  return new Response(html, {
    status: opts.status || 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}

// ── Minimal markdown (matches the generator's output surface) ─────────────────

function md(src) {
  let html = esc(src || "");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Internal links plain; external (news sources) open in a new tab, nofollow.
  html = html.replace(/\[([^\]]+)\]\((https:\/\/[^\s)"]+)\)/g, (m, txt, url) =>
    /^https:\/\/(?:www\.)?podfy\.(?:net|app)([/?#]|$)/.test(url)
      ? `<a href="${url}">${txt}</a>`
      : `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${txt}</a>`);
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
  return html.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return "";
    if (/^<(h2|h3|ul)/.test(block)) return block;
    return "<p>" + block.replace(/\n/g, "<br>") + "</p>";
  }).join("\n");
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
