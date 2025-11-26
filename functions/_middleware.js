export async function onRequest(context) {
  const { request, env } = context;

  // 1) Get the original static asset (HTML, CSS, etc.)
  const originResponse = await env.ASSETS.fetch(request);

  // Only touch HTML responses
  const contentType = originResponse.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) {
    return originResponse;
  }

  // 2) Read the HTML body
  const html = await originResponse.text();

  // 3) Fetch header and footer partials from your static assets
  const url = new URL(request.url);

  const [headerRes, footerRes] = await Promise.all([
    env.ASSETS.fetch(new URL("/partials/header.html", url)),
    env.ASSETS.fetch(new URL("/partials/footer.html", url)),
  ]);

  const [headerHtml, footerHtml] = await Promise.all([
    headerRes.text(),
    footerRes.text(),
  ]);

  // 4) Replace placeholders in the HTML
  let transformed = html.replace("[[PODFY_HEADER]]", headerHtml);
  transformed = transformed.replace("[[PODFY_FOOTER]]", footerHtml);

  // 5) Return new response with same headers/status, but modified body
  return new Response(transformed, originResponse);
}
