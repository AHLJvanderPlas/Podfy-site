export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // ============================================================
  // 1) CRITICAL: Let all function-handled routes skip this middleware.
  // Without next(), ASSETS.fetch swallows the route and the function
  // never runs (this is why /changelog.rss 404'd).
  // ============================================================
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/li/") ||
    url.pathname === "/changelog.rss" ||
    url.pathname === "/insights/confirm" ||
    url.pathname === "/insights/unsubscribe" ||
    url.pathname === "/insights/preferences" ||
    url.pathname === "/insights/article" ||
    url.pathname === "/insights/repository/item" ||
    // Section list pages are SSR Functions too (2026-07-22) — each does its
    // own header/footer ASSETS.fetch + injection (see insights-ssr.js),
    // mirroring article.js. Both slash forms excluded: unclear in advance
    // which one Cloudflare Pages routes to functions/insights/index.js /
    // functions/insights/repository/index.js / functions/insights/linkedin/index.js.
    url.pathname === "/insights" ||
    url.pathname === "/insights/" ||
    url.pathname === "/insights/repository" ||
    url.pathname === "/insights/repository/" ||
    url.pathname === "/insights/linkedin" ||
    url.pathname === "/insights/linkedin/" ||
    url.pathname === "/sitemap-insights.xml" ||
    url.pathname === "/llms-insights.txt"
  ) {
    return next();
  }

  // ============================================================
  // 2) Fetch the original static asset
  // ============================================================
  const originResponse = await env.ASSETS.fetch(request);

  // Only transform HTML pages
  const contentType = originResponse.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) {
    return originResponse;
  }

  // Read original HTML
  const html = await originResponse.text();

  // ============================================================
  // 3) Load header and footer partials
  // ============================================================
  const [headerRes, footerRes] = await Promise.all([
    env.ASSETS.fetch(new URL("/partials/header.html", url)),
    env.ASSETS.fetch(new URL("/partials/footer.html", url)),
  ]);

  const [headerHtml, footerHtml] = await Promise.all([
    headerRes.text(),
    footerRes.text(),
  ]);

  // ============================================================
  // 4) Inject header/footer placeholders
  // ============================================================
  let transformed = html.replace("[[PODFY_HEADER]]", headerHtml);
  transformed = transformed.replace("[[PODFY_FOOTER]]", footerHtml);

  // ============================================================
  // 5) Return updated HTML with original headers + status
  // ============================================================
  return new Response(transformed, originResponse);
}
