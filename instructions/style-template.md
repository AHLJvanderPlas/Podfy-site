# PODFY Design System — Style Template

Use this file as the single reference when starting a new Claude Code session on any Podfy-family repo. It captures every token, pattern, and reusable HTML/CSS snippet needed to reproduce the exact visual style without access to the live codebase.

---

## 1. Design Philosophy

- **Warm paper aesthetic.** Background is warm cream (`#F5F2EA`), not white. Cards are off-white. Every surface is slightly aged paper.
- **Stamp orange-red accent.** The single brand colour is `#D24A1F` (like a rubber stamp). Use it sparingly: borders, tags, CTA outlines, hover states, and stamp marks.
- **Mono-first UI chrome.** Navigation labels, data values, eyebrows, badges, and footer copy are all JetBrains Mono. Body copy uses Inter. Headlines use Source Serif 4.
- **Square corners.** Border-radius is 4 px (`--v2-radius`) or 6 px (`--v2-radius-lg`). Never pill/rounded except for locale/theme toggles.
- **No shadows except cards.** The receipt component has a subtle shadow; everything else uses borders only.
- **Dark mode:** fully supported via `html[data-theme="dark"]`. Same token names, different values. Toggle cycles System → Light → Dark.

---

## 2. Colour Tokens

All tokens live on `body {}` as CSS custom properties.

### Light (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--v2-ink` | `#0E1116` | Primary text, headings, strong elements |
| `--v2-ink-2` | `#2A2F37` | Secondary text, list items |
| `--v2-muted` | `#5A6473` | Placeholder text, captions, metadata |
| `--v2-line` | `#E4E2DC` | Borders, dividers (light) |
| `--v2-line-2` | `#CFCBC0` | Dashed lines, perforations |
| `--v2-paper` | `#F5F2EA` | Page background, outer surfaces |
| `--v2-paper-2` | `#EDE8DC` | Subtle tint (hero band, table header rows) |
| `--v2-card` | `#FBF9F3` | Card / panel background |
| `--v2-stamp` | `#D24A1F` | Brand accent — stamp orange-red |
| `--v2-stamp-ink` | `#7A2B12` | Dark variant of stamp (unused in UI, kept for contrast checks) |
| `--v2-delivered` | `#1F6B47` | Success / delivered status |
| `--v2-bad` | `#A33A2A` | Error / issue status |

### Dark overrides (`html[data-theme="dark"] body`)

| Token | Hex |
|-------|-----|
| `--v2-ink` | `#F0EDE5` |
| `--v2-ink-2` | `#D0CBC0` |
| `--v2-muted` | `#8E8880` |
| `--v2-line` | `#2A2720` |
| `--v2-line-2` | `#35302A` |
| `--v2-paper` | `#12100D` |
| `--v2-paper-2` | `#1A1814` |
| `--v2-card` | `#1E1C17` |
| `--v2-stamp` | `#E05A30` |
| `--v2-delivered` | `#2D8A5A` |
| `--v2-bad` | `#C04030` |

### Email template (response.html) — no CSS variables, inline only

| Role | Hex |
|------|-----|
| Outer background | `#F5F2EA` |
| Card background | `#FBF9F3` |
| Card border | `#E4E2DC` |
| Hero band | `#EDE9DF` |
| Primary text | `#0E1116` |
| Secondary text | `#3A4250` |
| Muted text | `#5A6473` |
| Accent (stamp) | `#D24A1F` |
| Primary CTA button | `#D24A1F` (white text) |
| Dark CTA button | `#0E1116` (cream text `#F5F2EA`) |
| Ghost button | `#FBF9F3` bg + `#E4E2DC` border, `#0E1116` text |

---

## 3. Typography

### Google Fonts import

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

Place this as the very first line in any CSS file or as a `<link>` in `<head>` before the site stylesheet.

### Font stacks

| Token | Value |
|-------|-------|
| `--v2-font-serif` | `"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif` |
| `--v2-font-sans` | `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` |
| `--v2-font-mono` | `"JetBrains Mono", ui-monospace, "Menlo", "Consolas", monospace` |

### Font role rules

| Use case | Font | Notes |
|----------|------|-------|
| Page headlines (`h1`, `h2`) | Serif | `font-weight: 500`, `letter-spacing: -0.02em` |
| Section titles | Serif | `1.5rem`, `font-weight: 500` |
| Body copy | Sans | `font-size: 0.9–1rem`, `line-height: 1.65–1.75` |
| Nav items, labels, UI chrome | Sans | `0.875rem`, `font-weight: 500` |
| Eyebrows, tags, metadata | Mono | `0.68–0.72rem`, `text-transform: uppercase`, `letter-spacing: 0.06–0.12em` |
| Code, data values | Mono | — |
| Quote text | Serif | `font-style: italic` |

### Type scale (key sizes)

```
Hero h1:       clamp(2.1rem, 4.5vw, 3.25rem)  — serif 500
Section h2:    1.5rem                           — serif 500
Subsection h3: 1.05rem                          — serif 500
Body:          0.9–1rem                         — sans
Small body:    0.875rem                         — sans
Caption/meta:  0.8–0.85rem                      — sans or mono
Eyebrow:       0.68–0.72rem uppercase           — mono
Nano:          0.62–0.67rem uppercase            — mono
```

---

## 4. Layout & Spacing

```css
:root { --container-6xl: 72rem; }

.container {
  max-width: var(--container-6xl);
  margin: 0 auto;
  padding: 0 1rem;
}
```

- Max content width: **72 rem** (1152 px)
- Side padding: `1rem` (scales down naturally on mobile)
- Section vertical padding: `3rem 0` with `border-top: 1px solid var(--v2-line)`
- Page bottom padding: `4rem`

### Radii

| Token | Value |
|-------|-------|
| `--v2-radius` | `4px` — standard corners |
| `--v2-radius-lg` | `6px` — cards, receipt |

---

## 5. Stylesheet Reference

**Single CSS file:** `/assets/styles.site.css`
**Cache-bust query string:** `?v=v3-r1`

```html
<link rel="stylesheet" href="/assets/styles.site.css?v=v3-r1" />
```

All active pages use this one file. Do not create additional stylesheets — extend this file or add `<style>` blocks inline in the page. Never use the old `styles.css` or `styles.v2.css` (deleted).

---

## 6. Page HTML Shell

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />

  <title>PAGE TITLE — PODFY</title>
  <meta name="description" content="..." />
  <link rel="canonical" href="https://podfy.net/PAGE-PATH/" />

  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5F2EA" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#12100D" />

  <link rel="icon" type="image/svg+xml" href="/assets/podfy-favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />

  <link rel="stylesheet" href="/assets/styles.site.css?v=v3-r1" />
  <script src="/assets/theme.js" defer></script>
</head>

<body class="v2">
  <a href="#main" class="sr-only">Skip to content</a>

  [[PODFY_HEADER]]   <!-- injected by build step from partials/header.html -->

  <main id="main" class="v2-main">
    <!-- page content -->
  </main>

  [[PODFY_FOOTER]]   <!-- injected from partials/footer.html -->
</body>
</html>
```

The `[[PODFY_HEADER]]` and `[[PODFY_FOOTER]]` tokens are replaced at build time. If rendering a standalone page without the build step, paste the partial content directly.

---

## 7. Header Partial (`partials/header.html`)

Sticky, `z-index: 40`, `border-bottom: 1px solid var(--v2-line)`.

```html
<header class="site-header-shell">
  <div class="site-header-inner">

    <a href="/" class="site-brand" aria-label="PODFY home">
      <img src="/assets/podfy.svg" alt="PODFY" width="72" height="20" />
    </a>

    <nav id="primaryNav" class="site-nav" aria-label="Primary navigation">
      <a href="/demo">Demo</a>
      <a href="/solutions/">Solutions</a>
      <a href="/guides/">Guides</a>
      <a href="/pricing">Pricing</a>
      <a href="/contact">Contact</a>
    </nav>

    <div class="site-header-actions">
      <span class="site-trust-pill" aria-label="Hosted in EU, Cloudflare WEUR region">EU&thinsp;&middot;&thinsp;WEUR</span>

      <div class="site-locale" id="localeWrapper" aria-label="Language">
        <button class="site-locale-btn" id="localeBtn" type="button"
          aria-haspopup="listbox" aria-expanded="false" aria-controls="localeMenu">EN &#9662;</button>
        <div class="site-locale-menu" id="localeMenu" role="listbox" aria-label="Select language">
          <a href="/" class="site-locale-item site-locale-active" role="option" aria-selected="true">EN</a>
          <span class="site-locale-item site-locale-disabled" role="option" aria-disabled="true" title="Dutch — coming soon">NL</span>
          <span class="site-locale-item site-locale-disabled" role="option" aria-disabled="true" title="German — coming soon">DE</span>
        </div>
      </div>

      <button type="button" class="site-theme-toggle" id="themeToggle" data-mode="system" aria-label="Toggle colour mode">
        <span class="site-theme-dot"></span>
        <span class="site-theme-label">System</span>
      </button>

      <button type="button" id="menuBtn" class="site-menu-btn" aria-label="Open navigation menu"
        aria-expanded="false" aria-controls="mobileNav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <nav id="mobileNav" class="site-mobile-nav" aria-label="Mobile navigation">
    <a href="/demo">Demo</a>
    <a href="/solutions/">Solutions</a>
    <a href="/guides/">Guides</a>
    <a href="/pricing">Pricing</a>
    <a href="/contact">Contact</a>
    <a href="/trust" style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid var(--v2-line);">Trust &amp; Legal</a>
  </nav>

  <script>
    /* FOUC prevention */
    (function () {
      try {
        var stored = localStorage.getItem("podfy-theme");
        var effective = (stored === "light" || stored === "dark") ? stored
          : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", effective);
      } catch (e) {}
    })();
    document.addEventListener("DOMContentLoaded", function () {
      var menuBtn = document.getElementById("menuBtn");
      var mobileNav = document.getElementById("mobileNav");
      if (menuBtn && mobileNav) {
        menuBtn.addEventListener("click", function () {
          var open = mobileNav.classList.toggle("open");
          menuBtn.setAttribute("aria-expanded", String(open));
        });
      }
      var localeBtn = document.getElementById("localeBtn");
      var localeMenu = document.getElementById("localeMenu");
      if (localeBtn && localeMenu) {
        localeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var open = localeMenu.classList.toggle("open");
          localeBtn.setAttribute("aria-expanded", String(open));
        });
        document.addEventListener("click", function () {
          localeMenu.classList.remove("open");
          if (localeBtn) localeBtn.setAttribute("aria-expanded", "false");
        });
      }
    });
  </script>
</header>
```

**Logo rule:** In light mode, render `/assets/podfy.svg` as-is (dark mark). In dark mode, CSS applies `filter: brightness(0) invert(1)` automatically via `.site-brand img`.

---

## 8. Footer Partial (`partials/footer.html`)

5-column grid. Background `--v2-paper-2`, top border `--v2-line`.

```html
<footer class="site-footer-v2">
  <div class="site-footer-grid">

    <!-- Col 1: Product -->
    <div class="site-footer-col">
      <p class="site-footer-col-heading">Product</p>
      <ul>
        <li><a href="/demo">Demo</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/changelog">Release notes</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>

    <!-- Col 2: Solutions -->
    <div class="site-footer-col">
      <p class="site-footer-col-heading">Solutions</p>
      <ul>
        <li><a href="/solutions/carriers/">Carriers</a></li>
        <li><a href="/solutions/3pl/">3PLs</a></li>
        <li><a href="/solutions/shippers/">Shippers</a></li>
        <li><a href="/solutions/retail/">Retail</a></li>
        <li><a href="/solutions/">All solutions &rarr;</a></li>
      </ul>
    </div>

    <!-- Col 3: Guides -->
    <div class="site-footer-col">
      <p class="site-footer-col-heading">Guides</p>
      <ul>
        <li><a href="/guides/proof-of-delivery/">What is POD?</a></li>
        <li><a href="/guides/digital-vs-paper/">Digital vs paper</a></li>
        <li><a href="/guides/">All guides &rarr;</a></li>
      </ul>
    </div>

    <!-- Col 4: Trust & Legal -->
    <div class="site-footer-col">
      <p class="site-footer-col-heading">Trust &amp; Legal</p>
      <ul>
        <li><a href="/trust#security">Security</a></li>
        <li><a href="/trust#privacy">Privacy &amp; GDPR</a></li>
        <li><a href="/trust#terms">Terms</a></li>
        <li><a href="/trust#cookies">Cookies</a></li>
        <li><a href="/trust#imprint">Imprint</a></li>
      </ul>
    </div>

    <!-- Col 5: Contact + locale -->
    <div class="site-footer-col">
      <p class="site-footer-col-heading">Contact</p>
      <p><a href="mailto:support@podfy.net">support@podfy.net</a></p>
      <div class="site-footer-locale-row" aria-label="Language">
        <a href="/" class="site-footer-locale-active">EN</a>
        <span class="site-footer-locale-inactive" title="Dutch — coming soon">NL</span>
        <span class="site-footer-locale-inactive" title="German — coming soon">DE</span>
      </div>
    </div>

  </div>

  <div class="site-footer-bottom-bar">
    <p class="site-footer-company">
      PODFY &nbsp;&middot;&nbsp; KVK 83714200 &nbsp;&middot;&nbsp; VAT NL862966851B01
      &nbsp;&middot;&nbsp; Van Weede van Dijkveldstraat 25, 2582KP 's-Gravenhage, NL
      &nbsp;&middot;&nbsp; GDPR: <a href="mailto:support@podfy.net">support@podfy.net</a>
    </p>
    <p class="site-footer-copy">
      &copy; <span class="v2-footer-year"></span> PODFY. All rights reserved.
      <span class="site-footer-eu-badge">EU &middot; WEUR</span>
    </p>
  </div>

  <script>
    var yEl = document.querySelector(".v2-footer-year");
    if (yEl) yEl.textContent = new Date().getFullYear();
  </script>
</footer>
```

---

## 9. Component Snippets

### 9.1 Buttons

```html
<!-- Primary: dark ink background, cream text -->
<a href="/demo" class="v2-btn v2-btn-primary">Try the live demo &rarr;</a>

<!-- Ghost: transparent with border -->
<a href="/contact" class="v2-btn v2-btn-ghost">15-min walkthrough</a>
```

CSS summary:
- Radius: `4px`
- Padding: `0.6rem 1.4rem`
- Font: Inter 600, `0.875rem`
- Primary bg: `var(--v2-ink)`, color: `var(--v2-paper)`
- Ghost: transparent, `border: 1px solid var(--v2-line-2)`, hover → `border-color: var(--v2-ink)`
- Hover: `opacity: 0.8` on primary; border tightens on ghost

---

### 9.2 Eyebrow Label

Small mono uppercase label placed above a headline.

```html
<p class="v2-eyebrow" aria-hidden="true">Proof of delivery · without the app</p>
<h1 class="v2-hero-title">...</h1>
```

CSS: `font-family: mono`, `0.7rem`, `uppercase`, `letter-spacing: 0.06em`, `color: var(--v2-muted)`.

---

### 9.3 Hero Stamp — inline stamp mark inside headline

```html
<h1 class="v2-hero-title">
  Get the CMR back <span class="v2-hero-stamp">the same day.</span>
</h1>
```

CSS: inline-block, mono, `0.72em` relative, border `1.5px solid var(--v2-stamp)`, `color: var(--v2-stamp)`, `transform: rotate(-2deg)`, `padding: 4px 14px 4px 12px`.

---

### 9.4 Section layout pattern

```html
<section class="v2-section" aria-labelledby="section-id">
  <div class="container">
    <div class="v2-section-header">
      <h2 class="v2-section-title" id="section-id">Section title</h2>
      <a href="/more" class="v2-link">View all &rarr;</a>
    </div>
    <!-- content -->
  </div>
</section>
```

---

### 9.5 Thermal Receipt Component

Used in hero and proof strip. Monospace font, perforation dots, dashed separator.

```html
<div class="v2-receipt v2-hero-receipt">
  <div class="v2-receipt-perforation"></div>
  <div class="v2-receipt-inner">
    <p class="v2-receipt-brand">PODFY</p>
    <p class="v2-receipt-ref">REF · CMR-2024-00419</p>
    <hr class="v2-receipt-hr">
    <div class="v2-receipt-row">
      <span class="v2-receipt-label">Date</span>
      <span class="v2-receipt-value">2024-11-14 · 14:09</span>
    </div>
    <div class="v2-receipt-row">
      <span class="v2-receipt-label">Driver</span>
      <span class="v2-receipt-value">J. Bakker</span>
    </div>
    <div class="v2-receipt-row">
      <span class="v2-receipt-label">GPS</span>
      <span class="v2-receipt-value" data-type="gps">51.9225° N · 4.4792° E</span>
    </div>
    <hr class="v2-receipt-hr">
    <div class="v2-receipt-status">
      <span class="v2-stamp-mark">Delivered</span>
    </div>
  </div>
  <div class="v2-receipt-perforation"></div>
</div>
```

Key CSS details:
- `background: var(--v2-card)`, `border: 1px solid var(--v2-line)`, `border-radius: 6px`
- Perforation: `radial-gradient(circle, var(--v2-line-2) 2.5px, transparent 2.5px)`, `background-size: 14px 10px`
- HR: `border-top: 1px dashed var(--v2-line-2)`
- Box shadow (light): `0 8px 24px rgba(14,17,22,0.07), 0 2px 6px rgba(14,17,22,0.04)`

---

### 9.6 Stamp Mark (standalone)

```html
<span class="v2-stamp-mark">Delivered</span>
```

CSS: `border: 1.5px solid var(--v2-stamp)`, `color: var(--v2-stamp)`, mono `0.72rem`, `letter-spacing: 0.14em`, `transform: rotate(-2deg)`, `padding: 3px 10px`.

In CTA blocks: `font-size: 0.8rem`, `transform: rotate(-1.5deg)`.

---

### 9.7 Trust Belt

Row of short mono facts between hero and first section.

```html
<div class="v2-trust-belt">
  <div class="container">
    <ul class="v2-trust-list">
      <li class="v2-trust-item">11s median upload</li>
      <li class="v2-trust-item">0 apps installed</li>
      <li class="v2-trust-item">EU-WEUR hosting</li>
      <li class="v2-trust-item">
        Last shipped: <a href="/changelog" class="v2-trust-link">v3.1 · 2025-04-14</a>
      </li>
    </ul>
  </div>
</div>
```

Dots between items via CSS `::before { content: "·" }`.

---

### 9.8 Stat Band (4-column)

```html
<div class="v2-stat-band">
  <div class="v2-stat-band-item">
    <span class="v2-stat-band-num">11s</span>
    <span class="v2-stat-band-label">Median upload time</span>
  </div>
  <div class="v2-stat-band-item">
    <span class="v2-stat-band-num">0</span>
    <span class="v2-stat-band-label">Apps required</span>
  </div>
  <div class="v2-stat-band-item v2-stat-band-live">
    <span class="v2-stat-band-num">59</span>
    <span class="v2-stat-band-label"><a href="/changelog">Releases</a></span>
  </div>
  <div class="v2-stat-band-item">
    <span class="v2-stat-band-num">EU</span>
    <span class="v2-stat-band-label">WEUR · GDPR</span>
  </div>
</div>
```

`.v2-stat-band-live` makes the number and label link use `--v2-stamp` colour.

---

### 9.9 How It Works (3-step grid)

```html
<div class="v2-how-grid">
  <div class="v2-how-step">
    <p class="v2-how-step-num">Step 01</p>
    <h3>Driver opens link</h3>
    <p>Send a URL by WhatsApp, SMS, or email. Any phone, any carrier. No account, no download.</p>
  </div>
  <div class="v2-how-step">
    <p class="v2-how-step-num">Step 02</p>
    <h3>Snaps the CMR</h3>
    <p>Photo, PDF, or scan. GPS stamp added automatically.</p>
  </div>
  <div class="v2-how-step">
    <p class="v2-how-step-num">Step 03</p>
    <h3>Office gets stamped PDF</h3>
    <p>Email notification in seconds. Document searchable in the portal.</p>
  </div>
</div>
```

Step number: mono `0.67rem` uppercase, `border-bottom: 1px solid var(--v2-line)`, `margin-bottom: 0.85rem`.

---

### 9.10 Quote Block

```html
<blockquote class="v2-quote-block">
  <p class="v2-quote-text">"We get the signed CMR before the truck is back."</p>
  <footer class="v2-quote-attr">
    <span class="v2-quote-name">Jan de Vries</span>
    <span>Operations Manager, Freight NL</span>
  </footer>
</blockquote>
```

CSS: `border-left: 2px solid var(--v2-stamp)`, `padding-left: 1.75rem`. Quote text: Serif italic.

---

### 9.11 Before / After Contrast Strip

```html
<div class="v2-contrast-strip">
  <div class="v2-contrast-before">
    <p class="v2-contrast-label">Before</p>
    <ul class="v2-contrast-list">
      <li>Paper CMR lost in transit</li>
      <li>Disputed deliveries with no proof</li>
    </ul>
  </div>
  <div class="v2-contrast-divider"></div>
  <div class="v2-contrast-after">
    <p class="v2-contrast-label">With PODFY</p>
    <ul class="v2-contrast-list">
      <li>GPS-stamped photo stored in 11s</li>
      <li>Disputes resolved in seconds</li>
    </ul>
  </div>
</div>
```

Before label: `color: var(--v2-stamp)`, `✗` bullets. After label: `color: var(--v2-delivered)`, `✓` bullets.

---

### 9.12 Guide Card Grid

```html
<div class="v2-guide-grid">
  <a href="/guides/proof-of-delivery/" class="v2-guide-card">
    <span class="v2-guide-tag">Guide</span>
    <h3 class="v2-guide-title">What is Proof of Delivery?</h3>
    <p class="v2-guide-desc">A complete overview of POD requirements for carriers and 3PLs.</p>
    <span class="v2-guide-arrow">Read &rarr;</span>
  </a>
</div>
```

Card: `border-left: 3px solid var(--v2-stamp)`, `background: var(--v2-card)`, `border-radius: 4px`.

---

### 9.13 TOC Pills (horizontal scrolling)

Used on guide pages as a sticky sub-navigation.

```html
<nav class="v2-toc" aria-label="On this page">
  <div class="container">
    <ul class="v2-toc-list">
      <li><a href="#definition" class="v2-toc-pill active">Definition</a></li>
      <li><a href="#requirements" class="v2-toc-pill">Requirements</a></li>
      <li><a href="#formats" class="v2-toc-pill">Formats</a></li>
    </ul>
  </div>
</nav>
```

Active / hover: `background: var(--v2-stamp)`, `color: var(--v2-paper)`. Border-radius: `2rem` (only component with pill shape).

---

### 9.14 Inline CTA Band

Full-width ink band, used mid-page on solution/guide pages.

```html
<div class="v2-inline-cta">
  <div class="container">
    <div class="v2-inline-cta-inner">
      <div>
        <p class="v2-inline-cta-label">Ready to try it?</p>
        <p class="v2-inline-cta-text">Send your first POD link in under 60 seconds.</p>
      </div>
      <a href="/demo" class="v2-btn" style="background:var(--v2-paper);color:var(--v2-ink);">Try the demo &rarr;</a>
    </div>
  </div>
</div>
```

Background: `var(--v2-ink)` (dark). Button inverts to cream. Font: Serif.

---

### 9.15 Bottom CTA Block

Centered, placed above the footer.

```html
<section class="v2-cta-block">
  <div class="container">
    <span class="v2-stamp-mark">Zero friction</span>
    <h2>Ready when your drivers are.</h2>
    <p>No app. No account. No training.</p>
    <div class="v2-cta-actions">
      <a href="/demo" class="v2-btn v2-btn-primary">Try the live demo &rarr;</a>
      <a href="/contact" class="v2-btn v2-btn-ghost">Talk to us</a>
    </div>
  </div>
</section>
```

---

### 9.16 Check List

```html
<ul class="v2-check-list">
  <li>No app to install</li>
  <li>Works on any phone</li>
  <li>GPS stamp automatic</li>
</ul>
```

`✓` bullet: `color: var(--v2-delivered)`, mono `0.8rem`.

---

### 9.17 Contact / Generic Form

```html
<form class="v2-form" method="POST" action="/api/contact">
  <div class="v2-field">
    <label class="v2-label" for="name">Name</label>
    <input class="v2-input" type="text" id="name" name="name" required autocomplete="name" />
  </div>
  <div class="v2-field">
    <label class="v2-label" for="message">Message</label>
    <textarea class="v2-textarea" id="message" name="message" rows="4"></textarea>
  </div>
  <label class="v2-consent">
    <input type="checkbox" required />
    I agree to the <a href="/trust#privacy">privacy policy</a>.
  </label>
  <button type="submit" class="v2-btn v2-btn-primary">Send message</button>
  <p class="v2-status" id="formStatus" aria-live="polite"></p>
</form>
```

Focus ring: `outline: 2px solid var(--v2-stamp)`. Checkbox accent: `var(--v2-stamp)`.

---

### 9.18 Breadcrumb

```html
<nav class="v2-breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <ol class="v2-breadcrumb-list">
      <li><a href="/">Home</a></li>
      <li><a href="/solutions/">Solutions</a></li>
      <li>Carriers</li>
    </ol>
  </div>
</nav>
```

Separator: mono `·` via `::before`. Font: mono `0.72rem`.

---

### 9.19 Proof Strip (3-artifact grid)

Three side-by-side mockups showing phone upload, PDF output, portal row. Each artifact uses `.v2-proof-artifact`:

```html
<div class="v2-proof-grid">

  <!-- Artifact 1: Phone upload mock -->
  <div class="v2-proof-artifact">
    <p class="v2-proof-artifact-label">Driver · Phone upload</p>
    <div class="v2-proof-phone-body">
      <p class="v2-proof-phone-brand">PODFY</p>
      <p class="v2-proof-phone-ref">CMR-2024-00419</p>
      <div class="v2-proof-phone-cambtn">&#128247; Tap to photograph CMR</div>
    </div>
  </div>

  <!-- Artifact 2: PDF document mock -->
  <div class="v2-proof-artifact">
    <p class="v2-proof-artifact-label">Output · PDF record</p>
    <div class="v2-proof-pdf-body">
      <p class="v2-proof-pdf-heading">Delivery Record</p>
      <div class="v2-proof-pdf-row">
        <span class="v2-proof-pdf-row-label">Ref</span>
        <span class="v2-proof-pdf-row-val">CMR-2024-00419</span>
      </div>
      <hr class="v2-proof-pdf-hr">
      <div class="v2-proof-pdf-stamp-row"><span class="v2-stamp-mark">Delivered</span></div>
    </div>
  </div>

  <!-- Artifact 3: Portal row mock -->
  <div class="v2-proof-artifact">
    <p class="v2-proof-artifact-label">Portal · Searchable records</p>
    <div class="v2-proof-portal-head">
      <span>Reference</span><span>Date</span><span>Driver</span><span>Status</span>
    </div>
    <div class="v2-proof-portal-row">
      <span>CMR-00419</span><span>14 Nov</span><span>J. Bakker</span>
      <span class="v2-stamp-mark">Delivered</span>
    </div>
  </div>

</div>
```

---

### 9.20 FAQ Accordion

```html
<div class="v2-faq-accordion">
  <div class="v2-faq-acc-item">
    <button class="v2-faq-btn" type="button" aria-expanded="false">
      Do drivers need an account?
    </button>
    <div class="v2-faq-answer">
      No. Drivers receive a single-use link and upload directly from their phone browser.
    </div>
  </div>
</div>

<script>
document.querySelectorAll(".v2-faq-btn").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var item = btn.closest(".v2-faq-acc-item");
    var open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
});
</script>
```

`::after` content `"+"` rotates `45deg` when open. Answer uses `max-height` transition.

---

## 10. Dark Mode Implementation

Theme is controlled by `html[data-theme="dark"|"light"]`. Script cycles: System → Light → Dark.

```js
// theme.js (defer loaded)
(function () {
  var toggle = document.getElementById("themeToggle");
  var label  = toggle ? toggle.querySelector(".site-theme-label") : null;
  var modes  = ["system", "light", "dark"];

  function apply(mode) {
    var effective = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    document.documentElement.setAttribute("data-theme", effective);
    try { localStorage.setItem("podfy-theme", mode === "system" ? "" : mode); } catch(e) {}
    if (label) label.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    if (toggle) toggle.dataset.mode = mode;
  }

  if (toggle) {
    toggle.addEventListener("click", function() {
      var cur = modes.indexOf(toggle.dataset.mode || "system");
      apply(modes[(cur + 1) % modes.length]);
    });
    apply(toggle.dataset.mode || "system");
  }
})();
```

FOUC prevention script (inline in `<head>` before CSS) is included in the header partial.

---

## 11. Naming Conventions

| Prefix | Used for |
|--------|----------|
| `v2-` | All design-system classes in `styles.site.css` |
| `site-` | Header, footer, global chrome |
| `v2-hero-*` | Hero section elements |
| `v2-receipt-*` | Thermal receipt component |
| `v2-proof-*` | Proof strip artifacts |
| `v2-trust-*` | Trust belt and trust/legal page |
| `v2-changelog-*` | Changelog page entries |
| `v2-aud-*` | Audience/solutions tiles |
| `v2-sol-*` | Solution page tiles |
| `v2-guide-*` | Guide card grid |
| `v2-faq-*` | FAQ list and accordion |
| `v2-cta-*` | CTA blocks |
| `v2-stat-band-*` | 4-column stat strip |

---

## 12. Assets Reference

| File | Purpose |
|------|---------|
| `/assets/podfy.svg` | Logo — dark mark, works in light mode; dark mode auto-inverted via CSS filter |
| `/assets/podfy-favicon.svg` | SVG favicon |
| `/assets/favicon-32x32.png` | PNG favicon 32 px |
| `/assets/favicon-16x16.png` | PNG favicon 16 px |
| `/assets/apple-touch-icon.png` | 180 × 180 touch icon |
| `/assets/og-image.png` | Open Graph 1200 × 630 social share image |
| `/assets/styles.site.css` | **Single stylesheet — all design tokens and components** |
| `/assets/theme.js` | Dark/light/system theme toggle script |
| `/assets/response.html` | Transactional email template (warm cream palette, inline CSS) |

---

## 13. Key Rules to Never Break

1. **One stylesheet.** Always `styles.site.css`. Never create `styles2.css` or page-specific sheets unless adding isolated `<style>` blocks inline.
2. **Tokens only.** Use `var(--v2-*)` in CSS. Never hardcode a hex value in a new rule.
3. **Stamp accent sparingly.** `--v2-stamp` is for accents — borders, tags, hover states. Not for fill colours on large areas.
4. **Square corners everywhere** except TOC pills (`border-radius: 2rem`).
5. **Serif for headlines, Mono for chrome, Sans for body.** Don't mix roles.
6. **Dark mode must work.** Any new component needs to be verified against `html[data-theme="dark"]` tokens.
7. **All legal URLs point to `/trust` with anchor.** Never create standalone legal pages. `/trust#privacy`, `/trust#terms`, `/trust#cookies`, `/trust#imprint`, `/trust#security`, `/trust#disclosure`.
8. **Email templates are inline CSS only.** No external stylesheet. Use the email palette from section 2 (no CSS variables).
