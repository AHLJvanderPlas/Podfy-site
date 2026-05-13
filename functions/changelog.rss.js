// functions/changelog.rss.js
// Serves /changelog.rss — RSS 2.0 feed from Site_Releases (D1)
// Queries the same table as /api/releases; returns 20 most recent published entries.

export async function onRequestGet({ env }) {
  const db = env.DB;

  try {
    const { results } = await db
      .prepare(
        `SELECT id, release_date, version, new_features, fixes, area_tags
         FROM Site_Releases
         WHERE is_published = 1
           AND release_date <= DATE('now')
         ORDER BY release_date DESC, id DESC
         LIMIT 20`
      )
      .all();

    const items = results || [];
    const buildDate = rfcDate(new Date());

    const itemsXml = items.map((r) => {
      const title = r.version
        ? esc(r.version)
        : esc("Release " + (r.release_date || ""));
      const slug = "v-" + (r.version || r.release_date || String(r.id))
        .replace(/[^0-9a-z]/gi, "-")
        .toLowerCase();
      const link = "https://podfy.net/changelog#" + slug;
      const description = buildDescription(r);
      const pubDate = rfcDate(new Date(r.release_date || ""));

      return [
        "    <item>",
        `      <title>${title}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description><![CDATA[${description}]]></description>`,
        "    </item>",
      ].join("\n");
    }).join("\n");

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      "  <channel>",
      "    <title>PODFY Changelog</title>",
      "    <link>https://podfy.net/changelog</link>",
      "    <description>Every PODFY release: new features, fixes, and platform updates.</description>",
      '    <atom:link href="https://podfy.net/changelog.rss" rel="self" type="application/rss+xml" />',
      "    <language>en</language>",
      "    <copyright>PODFY</copyright>",
      `    <lastBuildDate>${buildDate}</lastBuildDate>`,
      itemsXml,
      "  </channel>",
      "</rss>",
    ].join("\n");

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900",
      },
    });
  } catch (err) {
    console.error("changelog.rss: error", err);
    return new Response("Feed unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// ---------- helpers ----------

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDescription(r) {
  const parts = [];
  if (r.new_features && r.new_features.trim()) {
    parts.push(
      "<strong>New</strong><br>" +
      r.new_features
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .map((l) => "• " + l.trim())
        .join("<br>")
    );
  }
  if (r.fixes && r.fixes.trim()) {
    parts.push(
      "<strong>Fixes</strong><br>" +
      r.fixes
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .map((l) => "• " + l.trim())
        .join("<br>")
    );
  }
  return parts.join("<br><br>") || "(No details provided.)";
}

const RFC_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RFC_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function rfcDate(d) {
  if (isNaN(d.getTime())) return "Thu, 01 Jan 2026 00:00:00 GMT";
  const day = RFC_DAYS[d.getUTCDay()];
  const date = String(d.getUTCDate()).padStart(2, "0");
  const month = RFC_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${day}, ${date} ${month} ${year} ${hh}:${mm}:${ss} GMT`;
}
