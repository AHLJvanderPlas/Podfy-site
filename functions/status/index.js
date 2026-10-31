// GET /status?lang=en|nl|de|fr — uptime monitoring dashboard.
// Shows current operational state, per-service status, 90-day uptime bars, and SLA info.

import { esc, htmlResponse } from "../_shared/insights-ssr.js";

const LANGS = ["en", "nl", "de", "fr"];
const PUBLIC_TARGETS = ["site", "app", "portal", "delivery", "api"];

const UI = {
  en: {
    title: "Service status", description: "Current status and 90-day uptime of the PODFY app, portal, website and API, measured every 5 minutes.",
    heading: "Service status", operational: "All systems operational", degraded: "Degraded performance", outage: "Outage",
    noData: "No data yet", currentState: "Current state", days90: "Last 90 days", thisMonth: "This month",
    service: "Service", history: "Daily uptime, last 90 days",
    slaText: "Uptime target 99.5% per month, measured every 5 minutes.", servicesSLA: "Service levels and terms",
    notFound: "No uptime data recorded yet.", error: "The status could not be loaded. Please try again in a minute.",
  },
  nl: {
    title: "Servicestatus", description: "Actuele status en beschikbaarheid over 90 dagen van de PODFY app, portal, website en API, elke 5 minuten gemeten.",
    heading: "Servicestatus", operational: "Alle systemen werken", degraded: "Verminderde prestaties", outage: "Storing",
    noData: "Nog geen gegevens", currentState: "Huidige status", days90: "Laatste 90 dagen", thisMonth: "Deze maand",
    service: "Dienst", history: "Beschikbaarheid per dag, laatste 90 dagen",
    slaText: "Beschikbaarheidsdoel 99,5% per maand, elke 5 minuten gemeten.", servicesSLA: "Serviceniveaus en voorwaarden",
    notFound: "Nog geen beschikbaarheidsgegevens vastgelegd.", error: "De status kon niet worden geladen. Probeer het over een minuut opnieuw.",
  },
  de: {
    title: "Systemstatus", description: "Aktueller Status und Verfügbarkeit der letzten 90 Tage von PODFY App, Portal, Website und API, alle 5 Minuten gemessen.",
    heading: "Systemstatus", operational: "Alle Systeme in Betrieb", degraded: "Eingeschränkte Leistung", outage: "Ausfall",
    noData: "Noch keine Daten", currentState: "Aktueller Status", days90: "Letzte 90 Tage", thisMonth: "Dieser Monat",
    service: "Dienst", history: "Verfügbarkeit pro Tag, letzte 90 Tage",
    slaText: "Verfügbarkeitsziel 99,5 % pro Monat, alle 5 Minuten gemessen.", servicesSLA: "Servicelevel und Bedingungen",
    notFound: "Noch keine Verfügbarkeitsdaten erfasst.", error: "Der Status konnte nicht geladen werden. Bitte versuchen Sie es in einer Minute erneut.",
  },
  fr: {
    title: "État des services", description: "État actuel et disponibilité sur 90 jours de l'app, du portail, du site et de l'API PODFY, mesurés toutes les 5 minutes.",
    heading: "État des services", operational: "Tous les systèmes fonctionnent", degraded: "Performances dégradées", outage: "Panne",
    noData: "Pas encore de données", currentState: "État actuel", days90: "90 derniers jours", thisMonth: "Ce mois-ci",
    service: "Service", history: "Disponibilité par jour, 90 derniers jours",
    slaText: "Objectif de disponibilité de 99,5 % par mois, mesuré toutes les 5 minutes.", servicesSLA: "Niveaux de service et conditions",
    notFound: "Aucune donnée de disponibilité enregistrée pour le moment.", error: "L'état n'a pas pu être chargé. Réessayez dans une minute.",
  },
};

const SERVICE_NAMES = {
  en: { site: "Website (podfy.net)", app: "App (podfy.app)", portal: "Customer portal", delivery: "Driver portal", api: "API" },
  nl: { site: "Website (podfy.net)", app: "App (podfy.app)", portal: "Klantportal", delivery: "Chauffeursportal", api: "API" },
  de: { site: "Website (podfy.net)", app: "App (podfy.app)", portal: "Kundenportal", delivery: "Fahrerportal", api: "API" },
  fr: { site: "Site (podfy.net)", app: "App (podfy.app)", portal: "Portail client", delivery: "Portail chauffeur", api: "API" },
};

function getStateColor(ok, checks) {
  if (!checks) return "#ccc"; // grey: no data
  const pct = (ok / checks) * 100;
  if (pct >= 99.5) return "#1F6B47"; // green
  if (pct >= 95) return "#E8A735"; // amber
  return "#D24A1F"; // red
}

function getStateLabel(ok, checks, lang) {
  if (!checks) return UI[lang].noData;
  const pct = (ok / checks) * 100;
  if (pct >= 99.5) return UI[lang].operational;
  if (pct >= 95) return UI[lang].degraded;
  return UI[lang].outage;
}

function formatPercent(ok, checks) {
  if (!checks) return "n/a";
  return ((ok / checks) * 100).toFixed(1) + "%";
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang") || "en";
  const lang = LANGS.includes(langParam) ? langParam : "en";
  const ui = UI[lang];
  const serviceNames = SERVICE_NAMES[lang];

  try {
    // Fetch last 15 minutes of checks for current state
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const recentChecks = await env.DB.prepare(`
      SELECT target, SUM(ok) as ok, COUNT(*) as checks
      FROM uptime_checks
      WHERE checked_at >= ?
      GROUP BY target
    `).bind(fifteenMinutesAgo).all();

    // Fetch last 90 days of daily data
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];
    const dailyData = await env.DB.prepare(`
      SELECT * FROM uptime_daily
      WHERE day >= ?
      ORDER BY day, target
    `).bind(ninetyDaysAgo).all();

    // Fetch current month data
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split("T")[0];
    const monthlyData = await env.DB.prepare(`
      SELECT target, SUM(ok) as ok, SUM(checks) as checks
      FROM uptime_daily
      WHERE day >= ?
      GROUP BY target
    `).bind(monthStartStr).all();

    // Fetch last 90 days aggregate
    const last90Data = await env.DB.prepare(`
      SELECT target, SUM(ok) as ok, SUM(checks) as checks
      FROM uptime_daily
      WHERE day >= ?
      GROUP BY target
    `).bind(ninetyDaysAgo).all();

    // Build maps for quick lookup
    const recentMap = new Map();
    (recentChecks.results || []).forEach(row => {
      recentMap.set(row.target, row);
    });

    const dailyMap = new Map();
    (dailyData.results || []).forEach(row => {
      if (!dailyMap.has(row.target)) dailyMap.set(row.target, []);
      dailyMap.get(row.target).push(row);
    });

    const monthlyMap = new Map();
    (monthlyData.results || []).forEach(row => {
      monthlyMap.set(row.target, row);
    });

    const last90Map = new Map();
    (last90Data.results || []).forEach(row => {
      last90Map.set(row.target, row);
    });

    // Determine overall state (all recent checks)
    let allOk = 0, allChecks = 0;
    recentMap.forEach(row => {
      allOk += row.ok || 0;
      allChecks += (row.checks || 0);
    });

    const anyDown = [...recentMap.values()].some((r) => r.checks > 0 && !r.ok);
    const overallState = allChecks === 0
      ? ui.noData
      : anyDown ? ui.outage : (allOk / allChecks) >= 0.995 ? ui.operational : ui.degraded;

    // Build per-service rows
    const services = PUBLIC_TARGETS.map(target => {
      const recent = recentMap.get(target) || { ok: 0, checks: 0 };
      const days = dailyMap.get(target) || [];
      const monthly = monthlyMap.get(target) || { ok: 0, checks: 0 };
      const last90 = last90Map.get(target) || { ok: 0, checks: 0 };

      // Build 90-day bar SVG (90 boxes, 7px each, 4px gap = 90*7 + 89*4 = 630 + 356 = 986px)
      const bars = [];
      const dayMap = new Map(days.map(d => [d.day, d]));

      // Generate list of last 90 days
      const dates = [];
      for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
      }

      let barsSvg = '<svg viewBox="0 0 986 20" preserveAspectRatio="none" role="img" aria-label="${esc(ui.history)}">';
      dates.forEach((day, idx) => {
        const dayData = dayMap.get(day);
        const color = getStateColor(dayData?.ok || 0, dayData?.checks || 0);
        const x = idx * 11; // 7px + 4px gap
        barsSvg += `<rect x="${x}" y="0" width="7" height="20" fill="${color}" />`;
      });
      barsSvg += '</svg>';

      return {
        target,
        name: serviceNames[target],
        currentState: getStateLabel(recent.ok, recent.checks, lang),
        bars: barsSvg,
        monthlyPercent: formatPercent(monthly.ok, monthly.checks),
        last90Percent: formatPercent(last90.ok, last90.checks),
      };
    });

    // Build the HTML body
    const body = `
<main class="v2-container">
  <h1>${esc(ui.heading)}</h1>

  <section class="v2-status-overall">
    <p class="v2-status-label">${ui.currentState}</p>
    <p class="v2-status-value">${esc(overallState)}</p>
  </section>

  <section class="v2-status-services">
    ${allChecks === 0 ? `<p>${esc(ui.notFound)}</p>` : `
      <div class="v2-status-table-wrapper">
        <table class="v2-status-table">
          <thead>
            <tr>
              <th>${esc(ui.service)}</th>
              <th>${ui.currentState}</th>
              <th>${ui.thisMonth}</th>
              <th>${ui.days90}</th>
              <th>${esc(ui.history)}</th>
            </tr>
          </thead>
          <tbody>
            ${services.map(s => `
              <tr>
                <td>${esc(s.name)}</td>
                <td>${esc(s.currentState)}</td>
                <td class="v2-status-percent">${s.monthlyPercent}</td>
                <td class="v2-status-percent">${s.last90Percent}</td>
                <td class="v2-status-bars">${s.bars}</td>
              </tr>
            `).join('\n')}
          </tbody>
        </table>
      </div>
    `}
  </section>

  <section class="v2-status-footer">
    <p>${esc(ui.slaText)}</p>
    <p><a href="/trust#terms">${esc(ui.servicesSLA)}</a></p>
  </section>
</main>
    `;

    // Build canonical and hreflang
    const base = "https://podfy.net/status";
    const canonical = lang === "en" ? base : `${base}?lang=${lang}`;
    const alternates = LANGS.map(l =>
      `<link rel="alternate" hreflang="${l}" href="${l === "en" ? base : `${base}?lang=${l}`}" />`
    ).join("\n  ") + `\n  <link rel="alternate" hreflang="x-default" href="${base}" />`;

    return htmlResponse(env, url, body, {
      lang,
      title: ui.title,
      description: ui.description,
      canonical,
      alternates,
    });
  } catch (err) {
    console.error("Status page error:", err);
    return htmlResponse(env, url, `<main class="v2-container"><h1>${esc(ui.heading)}</h1><p>${esc(ui.error)}</p></main>`, {
      lang,
      title: ui.title,
      noindex: true,
      status: 500,
    });
  }
}
