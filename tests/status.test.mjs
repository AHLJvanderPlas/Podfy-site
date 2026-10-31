// Guard for the status page: render, states, percentages, no inline styles, no dashes in copy
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

// Import the status page handler for unit testing
import { onRequestGet } from "../functions/status/index.js";

const LANGS = ["en", "nl", "de", "fr"];

// Mock environment and context
function createMockEnv(db) {
  return {
    DB: db,
    ASSETS: {
      fetch: async (url) => {
        const path = new URL(url).pathname;
        let content = "";
        if (path === "/partials/header.html") {
          content = '<header class="site-header"><p>Header</p></header>';
        } else if (path === "/partials/footer.html") {
          content = '<footer class="site-footer"><p>Footer</p></footer>';
        }
        return new Response(content, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    },
  };
}

function createMockDB(results = {}) {
  const prepare = (sql) => ({
    bind: (...args) => ({
      all: async () => ({
        results: results[sql.substring(0, 50)] || [],
      }),
      first: async () => (results[sql.substring(0, 50)] || [{}])[0],
    }),
  });
  return { prepare };
}

test("Status page renders with default language (EN)", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Service Status/i);
  assert.match(html, /Service status/i);
  assert.match(html, /Current status and 90-day uptime/i);
});

test("Status page renders with all language parameters", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);

  for (const lang of LANGS) {
    const url = lang === "en" ? "https://podfy.net/status" : `https://podfy.net/status?lang=${lang}`;
    const request = new Request(url);
    const context = { request, env };

    const response = await onRequestGet(context);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<html lang="[a-z]{2}"/);
  }
});

test("Status page contains no inline style attributes", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();

  // Check for inline style attributes (not allowed per CLAUDE.md)
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  assert.doesNotMatch(body, /\bstyle\s*=\s*"[^"]*"/i, "Found inline style attributes");
});

test("Status page copy contains no em/en dashes", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();

  // Remove script tags and title tags (may contain dashes in metadata)
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<title>.*?<\/title>/g, "");

  assert.doesNotMatch(body, /[–—]/g, "Found em or en dashes in content");
});

test("Status page with sample data renders states and percentages correctly", async () => {
  // Create a smarter mock that tracks which query is being run
  let callCount = 0;
  const mockDB = {
    prepare: (sql) => {
      return {
        bind: (...args) => {
          const queryType = sql.substring(0, 60);
          return {
            all: async () => {
              // Return data based on which query this is
              if (queryType.includes("SUM(ok)") && queryType.includes("COUNT(*)")) {
                // Recent checks query
                return {
                  results: [
                    { target: "site", ok: 10, checks: 10 },
                    { target: "app", ok: 9, checks: 10 }, // 90%
                    { target: "portal", ok: 10, checks: 10 },
                    { target: "delivery", ok: 10, checks: 10 },
                    { target: "api", ok: 10, checks: 10 },
                  ],
                };
              } else if (queryType.includes("uptime_daily") && queryType.includes("ORDER BY day")) {
                // Daily data query
                return {
                  results: [
                    { day: "2026-10-31", target: "site", checks: 288, ok: 288 },
                    { day: "2026-10-31", target: "app", checks: 288, ok: 273 },
                    { day: "2026-10-31", target: "portal", checks: 288, ok: 288 },
                    { day: "2026-10-31", target: "delivery", checks: 288, ok: 288 },
                    { day: "2026-10-31", target: "api", checks: 288, ok: 288 },
                  ],
                };
              } else if (queryType.includes("SUM(ok)") && queryType.includes("< DATE")) {
                // Monthly data query
                return {
                  results: [
                    { target: "site", ok: 8640, checks: 8640 }, // 100%
                    { target: "app", ok: 8208, checks: 8640 }, // 95.0%
                    { target: "portal", ok: 8640, checks: 8640 },
                    { target: "delivery", ok: 8640, checks: 8640 },
                    { target: "api", ok: 8640, checks: 8640 },
                  ],
                };
              } else {
                // Last 90 days query
                return {
                  results: [
                    { target: "site", ok: 25920, checks: 25920 },
                    { target: "app", ok: 25920, checks: 25920 },
                    { target: "portal", ok: 25920, checks: 25920 },
                    { target: "delivery", ok: 25920, checks: 25920 },
                    { target: "api", ok: 25920, checks: 25920 },
                  ],
                };
              }
            },
            first: async () => ({ }),
          };
        },
      };
    },
  };

  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();

  // Check for percentage values and status labels
  assert.match(html, /100\.0%/);

  // Check for status labels - app with 90% should show as degraded/outage
  assert.match(html, /Degraded|Outage/i);
});

test("Status page with empty database shows 'No data yet'", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();

  assert.match(html, /[Nn]o data yet|[Nn]o uptime data/i);
});

test("Status page title is <= 60 characters", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/);

  assert.ok(titleMatch, "Title tag found");
  const title = titleMatch[1]
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  assert.ok(title.length <= 60, `Title is ${title.length} characters (max 60)`);
});

test("Status page description is <= 155 characters", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);

  assert.ok(descMatch, "Description meta tag found");
  const desc = descMatch[1]
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  assert.ok(desc.length <= 155, `Description is ${desc.length} characters (max 155)`);
});

test("Status page has correct hreflang links for all languages", async () => {
  const mockDB = createMockDB({});
  const env = createMockEnv(mockDB);
  const request = new Request("https://podfy.net/status");
  const context = { request, env };

  const response = await onRequestGet(context);
  const html = await response.text();

  // Check for all language hreflang links
  assert.match(html, /rel="alternate" hreflang="en"/);
  assert.match(html, /rel="alternate" hreflang="nl"/);
  assert.match(html, /rel="alternate" hreflang="de"/);
  assert.match(html, /rel="alternate" hreflang="fr"/);
  assert.match(html, /rel="alternate" hreflang="x-default"/);
});
