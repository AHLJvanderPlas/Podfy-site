// Shared helpers for every SSR page under /insights/* (article, repository
// item, and the three section-list pages). Not a route itself — no
// onRequest* export, so Pages routing never matches this file directly.

export const LANGS = ["en", "nl", "de", "fr"];

export const CAT_LABELS = {
  convention: { en: "Convention", nl: "Verdrag", de: "Übereinkommen", fr: "Convention" },
  protocol:   { en: "Protocol", nl: "Protocol", de: "Protokoll", fr: "Protocole" },
  regulation: { en: "EU regulation", nl: "EU-verordening", de: "EU-Verordnung", fr: "Règlement UE" },
  handbook:   { en: "Handbook", nl: "Handboek", de: "Handbuch", fr: "Manuel" },
  reference:  { en: "Reference", nl: "Naslag", de: "Referenz", fr: "Référence" },
  whitepaper: { en: "Whitepaper", nl: "Whitepaper", de: "Whitepaper", fr: "Livre blanc" },
  guide:      { en: "Guide", nl: "Gids", de: "Leitfaden", fr: "Guide" },
};

// SEO safety net: a <title> tag over ~60 chars gets truncated by Google
// regardless of how the source title was authored.
export function seoTitle(title, suffix, max = 60) {
  const full = title + suffix;
  if (full.length <= max) return full;
  const budget = max - suffix.length - 1;
  if (budget > 15) return title.slice(0, budget).replace(/\s+\S*$/, "") + "…" + suffix;
  return title.slice(0, max - 1) + "…";
}

export function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Minimal markdown (matches the generator's output surface).
export function md(src) {
  let html = esc(src || "");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
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

// Builds `?lang=xx` (nothing for English) — the one URL-construction rule
// every insights link on the site follows.
export function langQS(lang) {
  return lang === "en" ? "" : `&lang=${lang}`;
}

// The three insights section tabs — identical nav on all three list pages,
// staying on the current language when switching sections.
const TAB_LABELS = {
  en: ["Market updates", "Repository", "LinkedIn"],
  nl: ["Marktupdates", "Repository", "LinkedIn"],
  de: ["Marktupdates", "Repository", "LinkedIn"],
  fr: ["Actualités", "Repository", "LinkedIn"],
};
export function tabsHtml(lang, active) {
  const qs = lang === "en" ? "" : `?lang=${lang}`;
  const [mu, repo, li] = TAB_LABELS[lang] || TAB_LABELS.en;
  const items = [
    ["market", `/insights/${qs}`, mu],
    ["repository", `/insights/repository/${qs}`, repo],
    ["linkedin", `/insights/linkedin/${qs}`, li],
  ];
  return `<nav class="ins-tabs" aria-label="Insights sections">
      ${items.map(([key, href, label]) => `<a href="${href}"${key === active ? ` class="active"` : ""}>${esc(label)}</a>`).join("\n      ")}
    </nav>`;
}

// Page shell: injects header/footer partials (mirrors _middleware.js's own
// injection for every other route) and all standard <head> SEO plumbing.
export async function htmlResponse(env, url, body, opts) {
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
  ${opts.og ? `<meta property="og:type" content="${opts.og.type || "article"}" />
  <meta property="og:title" content="${esc(opts.og.title)}" />
  <meta property="og:description" content="${esc(opts.og.description)}" />
  <meta property="og:url" content="${opts.og.url}" />
  <meta property="og:image" content="${opts.og.image}" />
  <meta name="twitter:card" content="summary_large_image" />` : ""}
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5F2EA" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#12100D" />
  <link rel="icon" type="image/svg+xml" href="/assets/podfy-favicon.svg" />
  ${opts.extraHead || ""}
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
