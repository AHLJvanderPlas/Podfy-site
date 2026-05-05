# Legacy Pages — Full Assessment, Mesh Architecture & Visual Overhaul Plan

> **Status:** Instruction document for Claude Code
> **Scope:** All 16 legacy `podfy-*.html` pages
> **Action:** Restore as `/solutions/` and `/guides/`, migrate to v2 design, wire bidirectional interlink mesh

---

## 1. Complete Page Inventory

### Group A — Solutions Pages (audience/persona)
These pages target specific buyer personas with product-focused copy and a contact form.

| Current filename | Target URL | Persona | Primary keyword |
|---|---|---|---|
| `podfy-proof-of-delivery-for-carriers.html` | `/solutions/carriers/` | Carriers (1–100 vehicles) | proof of delivery software for carriers |
| `podfy-proof-of-delivery-for-3pl.html` | `/solutions/3pl/` | 3PLs & Logistics Providers | proof of delivery solution for 3PL |
| `podfy-proof-of-delivery-for-shippers.html` | `/solutions/shippers/` | Shippers | proof of delivery for shippers |
| `podfy-retail-delivery-documentation.html` | `/solutions/retail/` | Retail & Store Deliveries | proof of delivery for retail |
| `podfy-construction-delivery-documentation.html` | `/solutions/construction/` | Construction & Project Sites | proof of delivery for construction |
| `podfy-digital-delivery-documentation.html` | `/solutions/facilities/` | Facilities Management | digital delivery documentation |
| `podfy-digital-delivery-document-storage.html` | `/solutions/inbound/` | Inbound & Receiving Teams | digital delivery document storage |
| `podfy-digitize-delivery-documents.html` | `/solutions/digitize/` | Paper Flow Digitization | digitize delivery documents |

### Group B — Guide Pages (topic/concept)
These pages target informational search intent with long-form educational content.

| Current filename | Target URL | Topic | Primary keyword |
|---|---|---|---|
| `podfy-proof-of-delivery.html` | `/guides/proof-of-delivery/` | What is POD — cluster hub | what is proof of delivery |
| `podfy-digital-vs-paper-proof-of-delivery.html` | `/guides/digital-vs-paper/` | Comparison | digital vs paper proof of delivery |
| `podfy-missing-proof-of-delivery.html` | `/guides/missing-pod/` | Problem: missing POD | missing proof of delivery |
| `podfy-proof-of-delivery-disputes.html` | `/guides/pod-disputes/` | Problem: disputes | proof of delivery dispute |
| `podfy-proof-of-delivery-invoicing.html` | `/guides/pod-invoicing/` | Finance angle | proof of delivery invoicing |
| `podfy-proof-of-delivery-compliance.html` | `/guides/pod-compliance/` | Audit & compliance | proof of delivery compliance |
| `podfy-photo-proof-of-delivery.html` | `/guides/photo-pod/` | Photo-specific | photo proof of delivery |
| `podfy-proof-of-delivery-without-app.html` | `/guides/pod-without-app/` | No-app approach | proof of delivery without app |

---

## 2. Content Assessment

### Group A — SEO & Added Value

All 8 Group A pages share the same template: hero + problems + 3-step flow + benefits + use cases + "what it doesn't do" + related use cases + FAQ + contact form. The content is persona-specific throughout.

**Unique value by page:**

- **Carriers** — Fleet size breakdown (1–10 / 10–50 / 50–100 vehicles) is unique. This is the primary commercial landing page for the biggest buyer segment. FAQPage schema is good. 8 FAQ questions. Related use cases: Shippers, No-App, Compliance.
- **3PLs** — Multi-carrier standardization angle. Ad-hoc / subcontracted / last-mile / peak-season use cases are specific and not covered elsewhere. Related use cases: Carriers, No-App, Compliance.
- **Shippers** — "Receive from any carrier" framing is the inverse of the Carriers page. Covers invoicing speed and claims resolution from the shipper side. Related use cases: Carriers, 3PLs, Compliance.
- **Retail** — PO-number-as-reference is retail-specific detail not found elsewhere. Head office vs store-level visibility split. High-staff-turnover and pop-up-store use cases. Related use cases: Inbound, Facilities, Compliance.
- **Construction** — Per-project document separation. Material delivery photos. Audits/claims for project-based delivery. Related use cases: (not shown in snippet but consistent with template).
- **Facilities** — Multi-site / multi-building scope. Reception and security staff framing. Incident log angle beyond just POD. Related use cases: Inbound, Facilities, Compliance.
- **Inbound** — "Inbound teams register the delivery themselves when a driver doesn't upload" is a unique workflow detail. PO-number search. Related use cases: consistent with template.
- **Digitize** — "Replace scanning and email attachments" is the digitization-migration angle. Explicitly positions against paper+email+DMS. This catches the "we haven't gone digital yet" segment.

**Verdict:** All 8 Group A pages have unique persona-specific copy that v2 canonical pages don't replicate. Restore all.

### Group B — SEO & Added Value

- **POD Hub** (4,139 words) — 5 schema types (WebPage, FAQPage, SoftwareApplication, BreadcrumbList, ItemList). 10 content sections. Cross-links to all other legacy pages. This is the cluster anchor; without it the topic cluster has no authority root. **Highest priority restore.**
- **Digital vs Paper** (3,147 words) — FAQPage. Neutral "should we go digital?" framing draws in buyers who haven't decided yet. Covers failed digitization projects, hybrid approaches. Not in any v2 page.
- **Missing POD** (2,966 words) — FAQPage. Targets active problem query ("my POD is missing, what do I do"). Covers recovery workflows and root causes. Not in v2.
- **Disputes** (2,937 words) — FAQPage. "Not delivered", shortage, damage claim resolution. Evidence documentation framing. Not in v2.
- **Invoicing** (2,761 words) — FAQPage. CFO/finance framing. Cash flow impact of missing POD. Days-sales-outstanding angle. Not in v2.
- **Compliance** (2,742 words) — WebPage + FAQPage. Audit trail, regulatory, archival retention. Weaker title/description than others — worth a metadata refresh.
- **Photo POD** (2,955 words) — FAQPage. Photo vs signature specifics. Unattended delivery, damage documentation, chain of custody. Not in v2.
- **Without App** (2,794 words) — WebPage + FAQPage. Core product differentiator. 43-language driver page mentioned. Subcontractor/temp staff framing. **Highest priority restore alongside carriers.**

**Verdict:** All 8 Group B pages contain substantive, unique content that has zero overlap with v2 canonical pages. Restore all. Remove the 301 redirects to `/`.

---

## 3. New URL Structure & Redirects

### Directory layout

```
Podfy-site/
  solutions/
    index.html               ← NEW — solutions index page
    carriers/
      index.html             ← moved from podfy-proof-of-delivery-for-carriers.html
    3pl/
      index.html
    shippers/
      index.html
    retail/
      index.html
    construction/
      index.html
    facilities/
      index.html
    inbound/
      index.html
    digitize/
      index.html
  guides/
    index.html               ← NEW — guides index page
    proof-of-delivery/
      index.html             ← moved from podfy-proof-of-delivery.html
    digital-vs-paper/
      index.html
    missing-pod/
      index.html
    pod-disputes/
      index.html
    pod-invoicing/
      index.html
    pod-compliance/
      index.html
    photo-pod/
      index.html
    pod-without-app/
      index.html
```

Using `directory/index.html` instead of `directory.html` gives clean URLs without `.html` extension automatically on Cloudflare Pages.

### _redirects additions

Add these rules to `_redirects` (above existing rules):

```
# Legacy audience pages → new /solutions/ URLs
/podfy-proof-of-delivery-for-carriers          /solutions/carriers/     301
/podfy-proof-of-delivery-for-carriers.html     /solutions/carriers/     301
/podfy-proof-of-delivery-for-3pl               /solutions/3pl/          301
/podfy-proof-of-delivery-for-3pl.html          /solutions/3pl/          301
/podfy-proof-of-delivery-for-shippers          /solutions/shippers/     301
/podfy-proof-of-delivery-for-shippers.html     /solutions/shippers/     301
/podfy-retail-delivery-documentation           /solutions/retail/       301
/podfy-retail-delivery-documentation.html      /solutions/retail/       301
/podfy-construction-delivery-documentation     /solutions/construction/ 301
/podfy-construction-delivery-documentation.html /solutions/construction/ 301
/podfy-digital-delivery-documentation          /solutions/facilities/   301
/podfy-digital-delivery-documentation.html     /solutions/facilities/   301
/podfy-digital-delivery-document-storage       /solutions/inbound/      301
/podfy-digital-delivery-document-storage.html  /solutions/inbound/      301
/podfy-digitize-delivery-documents             /solutions/digitize/     301
/podfy-digitize-delivery-documents.html        /solutions/digitize/     301

# Legacy topic pages → new /guides/ URLs
/podfy-proof-of-delivery                       /guides/proof-of-delivery/ 301
/podfy-proof-of-delivery.html                  /guides/proof-of-delivery/ 301
/podfy-digital-vs-paper-proof-of-delivery      /guides/digital-vs-paper/  301
/podfy-digital-vs-paper-proof-of-delivery.html /guides/digital-vs-paper/  301
/podfy-missing-proof-of-delivery               /guides/missing-pod/       301
/podfy-missing-proof-of-delivery.html          /guides/missing-pod/       301
/podfy-proof-of-delivery-disputes              /guides/pod-disputes/      301
/podfy-proof-of-delivery-disputes.html         /guides/pod-disputes/      301
/podfy-proof-of-delivery-invoicing             /guides/pod-invoicing/     301
/podfy-proof-of-delivery-invoicing.html        /guides/pod-invoicing/     301
/podfy-proof-of-delivery-compliance            /guides/pod-compliance/    301
/podfy-proof-of-delivery-compliance.html       /guides/pod-compliance/    301
/podfy-photo-proof-of-delivery                 /guides/photo-pod/         301
/podfy-photo-proof-of-delivery.html            /guides/photo-pod/         301
/podfy-proof-of-delivery-without-app           /guides/pod-without-app/   301
/podfy-proof-of-delivery-without-app.html      /guides/pod-without-app/   301
```

Remove the existing broad redirect for these pages (currently they redirect to `/`).

### sitemap.xml additions

Add all 18 new URLs (16 pages + 2 index pages):

```xml
<!-- Solutions index -->
<url>
  <loc>https://podfy.net/solutions/</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://podfy.net/solutions/" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://podfy.net/solutions/" />
</url>

<!-- Solutions pages (repeat for each) -->
<url><loc>https://podfy.net/solutions/carriers/</loc>...</url>
<url><loc>https://podfy.net/solutions/3pl/</loc>...</url>
<url><loc>https://podfy.net/solutions/shippers/</loc>...</url>
<url><loc>https://podfy.net/solutions/retail/</loc>...</url>
<url><loc>https://podfy.net/solutions/construction/</loc>...</url>
<url><loc>https://podfy.net/solutions/facilities/</loc>...</url>
<url><loc>https://podfy.net/solutions/inbound/</loc>...</url>
<url><loc>https://podfy.net/solutions/digitize/</loc>...</url>

<!-- Guides index -->
<url><loc>https://podfy.net/guides/</loc>...</url>

<!-- Guide pages (repeat for each) -->
<url><loc>https://podfy.net/guides/proof-of-delivery/</loc>...</url>
<url><loc>https://podfy.net/guides/digital-vs-paper/</loc>...</url>
<url><loc>https://podfy.net/guides/missing-pod/</loc>...</url>
<url><loc>https://podfy.net/guides/pod-disputes/</loc>...</url>
<url><loc>https://podfy.net/guides/pod-invoicing/</loc>...</url>
<url><loc>https://podfy.net/guides/pod-compliance/</loc>...</url>
<url><loc>https://podfy.net/guides/photo-pod/</loc>...</url>
<url><loc>https://podfy.net/guides/pod-without-app/</loc>...</url>
```

---

## 4. Interlink Mesh Architecture

The mesh operates across three tiers. Every page links UP to its parent tier index, ACROSS to sibling pages with contextual relevance, and DOWN to related child-tier content. No page should be more than 2 clicks from any other page.

### 4.1 Tier map

```
TIER 0 (V2 canonical)
  /  →  /solutions/  →  /guides/
  /pricing  →  /solutions/
  /demo  →  /solutions/
  /contact  →  /solutions/

TIER 1 (index pages)
  /solutions/  ←→  /guides/
  Both index pages link to each other and to all their children

TIER 2 (solutions pages)
  Each solution page links to:
    - /solutions/ (breadcrumb parent)
    - 2–3 related solution pages (sibling)
    - 2–3 contextually relevant guide pages (cross-tier DOWN)
    - /demo (primary CTA)
    - /contact (secondary CTA)

TIER 3 (guide pages)
  Each guide page links to:
    - /guides/ (breadcrumb parent)
    - /guides/proof-of-delivery/ (hub, always)
    - 2–3 related guide pages (sibling)
    - 2–3 contextually relevant solution pages (cross-tier UP)
    - /demo (inline CTA mid-page)
```

### 4.2 Solutions → Guides mapping

| Solution page | Links to guides |
|---|---|
| `/solutions/carriers/` | `/guides/missing-pod/`, `/guides/pod-disputes/`, `/guides/pod-without-app/` |
| `/solutions/3pl/` | `/guides/pod-compliance/`, `/guides/pod-disputes/`, `/guides/digital-vs-paper/` |
| `/solutions/shippers/` | `/guides/pod-invoicing/`, `/guides/pod-disputes/`, `/guides/missing-pod/` |
| `/solutions/retail/` | `/guides/photo-pod/`, `/guides/missing-pod/`, `/guides/pod-compliance/` |
| `/solutions/construction/` | `/guides/photo-pod/`, `/guides/pod-disputes/`, `/guides/missing-pod/` |
| `/solutions/facilities/` | `/guides/digital-vs-paper/`, `/guides/pod-compliance/`, `/guides/pod-without-app/` |
| `/solutions/inbound/` | `/guides/pod-invoicing/`, `/guides/photo-pod/`, `/guides/missing-pod/` |
| `/solutions/digitize/` | `/guides/digital-vs-paper/`, `/guides/proof-of-delivery/`, `/guides/pod-without-app/` |

### 4.3 Guides → Solutions mapping

| Guide page | Links to solutions |
|---|---|
| `/guides/proof-of-delivery/` | All 8 solution pages (hub — use a 4-column grid) |
| `/guides/digital-vs-paper/` | `/solutions/carriers/`, `/solutions/digitize/`, `/solutions/inbound/` |
| `/guides/missing-pod/` | `/solutions/carriers/`, `/solutions/shippers/`, `/solutions/3pl/` |
| `/guides/pod-disputes/` | `/solutions/carriers/`, `/solutions/shippers/`, `/solutions/retail/` |
| `/guides/pod-invoicing/` | `/solutions/carriers/`, `/solutions/shippers/`, `/solutions/3pl/` |
| `/guides/pod-compliance/` | `/solutions/3pl/`, `/solutions/retail/`, `/solutions/construction/` |
| `/guides/photo-pod/` | `/solutions/carriers/`, `/solutions/retail/`, `/solutions/construction/` |
| `/guides/pod-without-app/` | `/solutions/carriers/`, `/solutions/3pl/`, `/solutions/digitize/` |

### 4.4 Guide-to-guide mesh (concept cluster links)

```
proof-of-delivery (hub)
  → digital-vs-paper, missing-pod, pod-disputes, pod-invoicing,
    pod-compliance, photo-pod, pod-without-app

digital-vs-paper  →  pod-without-app, proof-of-delivery
missing-pod       →  pod-disputes, pod-invoicing
pod-disputes      →  missing-pod, photo-pod, pod-invoicing
pod-invoicing     →  pod-disputes, missing-pod, pod-compliance
pod-compliance    →  pod-invoicing, pod-disputes
photo-pod         →  pod-disputes, missing-pod
pod-without-app   →  digital-vs-paper, proof-of-delivery
```

### 4.5 Solution-to-solution clusters

Group pages by operational relationship for cross-links:

```
Supply chain cluster (outbound):
  carriers ←→ 3pl ←→ shippers

Receiving cluster (inbound):
  retail ←→ inbound ←→ facilities

Digitization cluster:
  digitize ←→ inbound ←→ facilities
  digitize ←→ carriers (for small ops)

Project-based cluster:
  construction ←→ facilities
```

### 4.6 V2 canonical → Solutions/Guides links

Add these to existing v2 pages as part of the mesh:

- **Homepage (`/`)**: Add a "Who uses Podfy?" section before the CTA section. Display 4 audience cards (carriers, 3PLs, retail, shippers) linking to `/solutions/`. Include a "See all use cases →" link to `/solutions/`.
- **Pricing (`/pricing`)**: Add a "Find the right fit" section below the pricing table. 3 cards: Carriers, 3PLs, Shippers, each with a line about how Podfy saves them time.
- **Demo page (`/demo`)**: Add "See how it works for your team" below the demo embed. 3–4 audience tiles linking to solution pages.
- **Changelog (`/changelog`)**: Add "New to Podfy?" callout in the sidebar → `/guides/proof-of-delivery/`.

---

## 5. V2 Visual Overhaul

### 5.1 What to keep from v1

The v1 pages have good content structure and working schema markup. Keep:
- All HTML copy (headings, body text, FAQ answers)
- All `<script type="application/ld+json">` schema blocks
- The contact form logic (`/api/contact`, Turnstile)
- The honeypot and source_page hidden inputs

Replace:
- `body class="home-body"` → `body class="v2"`
- `styles.css` only → add `styles.v2.css` (keep `styles.css` for fallback or remove)
- `class="home-section"` layouts → v2 section/grid classes
- All `btn btn-primary` → `v2-btn v2-btn-primary`
- All `card card-glass` → v2 card tokens
- `/free-tier-demo.html` → `/demo`
- `/privacy.html` → `/trust#privacy`
- Absolute `https://podfy.net/podfy-*` links → new relative `/solutions/*/` or `/guides/*/` paths

### 5.2 Page template — Solutions pages

Every solutions page should follow this v2 section sequence:

```
1. BREADCRUMB BAR         — "Solutions → [Persona Name]" with links
2. HERO SECTION           — v2-hero with receipt visual (persona-specific receipt content)
3. TRUST BELT             — 4 stats relevant to the persona
4. PROBLEM SECTION        — 4-column grid, v2 problem cards (dark accent border)
5. HOW IT WORKS           — 3-step v2-how-grid with animated step numbers
6. BENEFITS GRID          — 4-column v2 cards
7. VISUAL: BEFORE/AFTER   — side-by-side contrast strip (paper chaos vs Podfy)
8. USE CASES              — 3-column cards, persona-specific scenarios
9. GUIDE CALLOUTS         — 2–3 inline guide recommendation cards (cross-tier links)
10. RELATED SOLUTIONS     — 3 sibling audience card links
11. FAQ                   — 2-column grid (existing FAQ content)
12. CTA + CONTACT FORM    — existing form, updated styling
```

### 5.3 Page template — Guide pages

Every guide page should follow this v2 section sequence:

```
1. BREADCRUMB BAR         — "Guides → [Topic]" with links
2. GUIDE HERO             — text-only, no receipt; eyebrow label "Guide", large title
3. TOC STRIP              — horizontal pill links to in-page anchors (#section-id)
4. CONTENT SECTIONS       — long-form copy with v2 section dividers
5. INLINE DEMO CTA        — mid-page: stamp-colored banner, "See Podfy in action → /demo"
6. RELATED PROBLEMS       — 2–3 guide cards (sibling guides)
7. WHO THIS AFFECTS       — 2–3 solution audience cards (cross-tier links)
8. FAQ                    — 2-column accordion (existing FAQ content)
9. GUIDE HUB LINK         — if not the hub: "Back to: What is Proof of Delivery →"
10. SUBSCRIPTION CTA      — changelog subscription form ("Stay updated as Podfy evolves")
```

### 5.4 Index page templates

#### `/solutions/index.html`

```
1. HERO          — "Proof of delivery, built for your operation"
                   Subtitle: "Every team works differently. Find how Podfy fits yours."
2. GRID          — 8 audience cards in 4×2 grid
                   Each card: eyebrow (industry), title (persona name), 3 bullet points, "See how →" link
3. GUIDE CALLOUT — "Not sure what you need? Start with our guide →" → /guides/proof-of-delivery/
4. CTA STRIP     — "Every use case, one demo" → /demo
```

#### `/guides/index.html`

```
1. HERO           — "Everything you need to know about proof of delivery"
                    Subtitle: "Guides, comparisons, and answers to common questions."
2. HUB CARD       — large featured card: /guides/proof-of-delivery/ (the hub)
3. PROBLEM GUIDES — 3-column: missing-pod, pod-disputes, pod-invoicing
4. OPERATIONAL    — 3-column: pod-compliance, photo-pod, pod-without-app
5. COMPARISON     — full-width card: digital-vs-paper
6. SOLUTION CTA   — "Know what you need? Find your use case →" → /solutions/
```

---

## 6. New Visual Components

These are net-new v2 components to build for the solutions and guides pages. All use existing CSS tokens (`--v2-paper`, `--v2-stamp`, `--v2-delivered`, `--v2-ink`, `--v2-muted`, `--v2-border`, `--v2-font-mono`).

### Component A — Breadcrumb bar
```html
<!-- v2-breadcrumb -->
<nav class="v2-breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <ol class="v2-breadcrumb-list">
      <li><a href="/">PODFY</a></li>
      <li><a href="/solutions/">Solutions</a></li>
      <li aria-current="page">Carriers</li>
    </ol>
  </div>
</nav>
```
CSS: `font-family: var(--v2-font-mono); font-size: .75rem; color: var(--v2-muted);`
Separator: `·` with thin spacing. Sticky below header.

### Component B — Before/After contrast strip
Two-column strip showing "Today" (paper chaos) vs "With Podfy" (clean digital flow).

```html
<!-- v2-contrast -->
<section class="v2-contrast-strip">
  <div class="v2-contrast-before">
    <p class="v2-contrast-label">Today</p>
    <ul class="v2-contrast-list v2-contrast-bad">
      <li>Driver keeps paper CMR in the cab</li>
      <li>Office calls at end of week to chase</li>
      <li>POD arrives 5 days late (if at all)</li>
    </ul>
  </div>
  <div class="v2-contrast-divider" aria-hidden="true"></div>
  <div class="v2-contrast-after">
    <p class="v2-contrast-label">With Podfy</p>
    <ul class="v2-contrast-list v2-contrast-good">
      <li>Driver uploads via link at delivery</li>
      <li>Office gets notification in seconds</li>
      <li>POD searchable and ready to share</li>
    </ul>
  </div>
</section>
```

CSS: Before column uses `--v2-muted` background, faded text; after column uses `--v2-delivered` accent border. Divider is a stamp-colored dashed vertical line.

### Component C — Inline guide recommendation cards
Used in solutions pages to cross-link to guides. 3-column card row:

```html
<!-- v2-guide-cards -->
<section class="v2-section v2-section-guides">
  <div class="container">
    <p class="v2-eyebrow">Relevant reading</p>
    <h2 class="v2-section-title">Common challenges for carriers</h2>
    <div class="v2-guide-grid">
      <a class="v2-guide-card" href="/guides/missing-pod/">
        <span class="v2-guide-tag">Guide</span>
        <h3 class="v2-guide-title">What to do when a POD goes missing</h3>
        <p class="v2-guide-desc">Recovery steps, root causes, and how to prevent it.</p>
        <span class="v2-guide-arrow">Read guide &rarr;</span>
      </a>
      <!-- repeat -->
    </div>
  </div>
</section>
```

CSS: Cards have `border-left: 3px solid var(--v2-stamp)`, hover lifts with subtle shadow.

### Component D — In-page TOC strip (guide pages only)
Horizontal scrollable pill bar for long guides:

```html
<!-- v2-toc-strip -->
<nav class="v2-toc" aria-label="On this page">
  <div class="container">
    <ul class="v2-toc-list">
      <li><a class="v2-toc-pill" href="#what-is-pod">What is POD?</a></li>
      <li><a class="v2-toc-pill" href="#why-it-matters">Why it matters</a></li>
      <li><a class="v2-toc-pill" href="#modern-vs-paper">Modern vs paper</a></li>
      <!-- ... -->
    </ul>
  </div>
</nav>
```

CSS: `display: flex; gap: .5rem; overflow-x: auto; scrollbar-width: none;`
Pills: `border: 1px solid var(--v2-border); border-radius: 2rem; padding: .3rem .8rem;`
Active pill (JS scroll spy): `background: var(--v2-stamp); color: white;`

### Component E — Audience selector (solutions index and homepage)
An 8-tile grid that acts as a "find your use case" navigator:

```html
<!-- v2-audience-grid -->
<div class="v2-audience-grid">
  <a class="v2-audience-tile" href="/solutions/carriers/">
    <p class="v2-audience-industry">Transport</p>
    <h3 class="v2-audience-role">Carriers</h3>
    <p class="v2-audience-quote">"I run a carrier and need PODs without driver apps."</p>
  </a>
  <!-- 7 more tiles -->
</div>
```

CSS: `display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));`
Each tile: receipt-style border, stamp accent on hover, `cursor: pointer`.

### Component F — Mid-page demo CTA banner (guide pages)
Full-width ink-background banner mid-way through long guides:

```html
<!-- v2-inline-cta -->
<div class="v2-inline-cta">
  <div class="container">
    <div class="v2-inline-cta-inner">
      <p class="v2-inline-cta-label">See it in action</p>
      <p class="v2-inline-cta-text">A driver uploads a CMR in 11 seconds. Watch the live demo.</p>
      <a href="/demo" class="v2-btn v2-btn-primary">Try the demo &rarr;</a>
    </div>
  </div>
</div>
```

CSS: `background: var(--v2-ink); color: var(--v2-paper);` — dark ink strip contrasts against the white guide content. Uses stamp color for the CTA button accent.

### Component G — Problem flow strip (guide: missing-pod, disputes)
SVG-based timeline showing what happens when something goes wrong:

```
[Delivery] → [No POD uploaded] → [Office chases driver] → [3 days lost] → [Customer dispute] → [Invoice delayed]
```

Use the same SVG box style as the EU data lifecycle diagram in `trust.html`. Each node is a box with `--v2-border` stroke. The "bad" nodes use `--v2-stamp` (red-orange) stroke; the resolution node uses `--v2-delivered` (green).

### Component H — Comparison table (guide: digital-vs-paper)
A 3-column table: Feature | Paper | Digital (Podfy).

```html
<table class="v2-comparison-table">
  <thead>
    <tr>
      <th>Area</th>
      <th class="v2-col-paper">Paper</th>
      <th class="v2-col-digital">Digital (Podfy)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Driver effort</td>
      <td class="v2-col-paper">Fill form manually</td>
      <td class="v2-col-digital">Photo or upload via link</td>
    </tr>
    <!-- ... -->
  </tbody>
</table>
```

CSS: Paper column: `color: var(--v2-muted)`. Digital column: `background: color-mix(in srgb, var(--v2-delivered) 8%, transparent); font-weight: 500;`

---

## 7. Visitor Retention Mechanics

### 7.1 Cross-page momentum

**"You might also need" panels**: Each solutions page ends with 2–3 guide recommendations framed as problems the persona encounters. Example on `/solutions/carriers/`: "Carriers often face these challenges → [Missing POD guide] [Disputes guide] [Without-app guide]". This reframes guides as resources for buyers already on solutions pages, not just for informational searches.

**"Who this affects" on guides**: Each guide page shows 2–3 audience cards after the main content. A visitor who arrived at "what is proof of delivery" from a Google search can immediately self-identify and navigate to their solutions page without leaving.

### 7.2 Depth signals (keeping visitors reading)

**TOC strip** (Component D): Visible horizontal anchor navigation keeps visitors oriented in long guide pages and shows them how much is left — reducing premature exit.

**FAQ accordion expand/collapse**: Replace the static 2-column FAQ cards on all pages with expandable accordion items. First 2 visible; rest collapsed. This reduces perceived page length while keeping full content present for SEO.

Implementation:
```javascript
// Lightweight accordion — no library
document.querySelectorAll('.v2-faq-item').forEach(item => {
  item.querySelector('.v2-faq-question').addEventListener('click', () => {
    item.classList.toggle('v2-faq-open');
  });
});
```

**Progress reading indicator**: Thin `--v2-stamp`-colored bar at top of long guide pages that fills as the user scrolls. Keeps them aware of progress without interrupting reading.

```javascript
window.addEventListener('scroll', () => {
  const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  document.getElementById('v2-progress').style.width = (progress * 100) + '%';
});
```

### 7.3 Conversion entry points

**Inline demo CTA** (Component F): Placed after the "problems" section on guide pages, before the resolution content. Captures buyers who recognize the problem before reading the solution.

**"See this in your context" card**: At the bottom of each guide, after the FAQ, a single card that says: "This applies to you if you're a [carrier / 3PL / shipper]" with 3 audience tiles linking to solutions pages. Converts informational readers into solution evaluators.

**Changelog subscription on guides**: Below the FAQ on each guide page, add the changelog subscription form with the headline: "See how Podfy is evolving → get release notes by email." This captures the "I'm interested but not ready to contact" segment.

### 7.4 No-exit zones

**Contact form on every solutions page**: Already present in v1. Keep it. In v2, make the contact form visually lighter — move from a full card to an inline form below the final CTA section. Reduce friction.

**Demo link everywhere**: Every section that ends with "Podfy does X" should have an underlinked "See a live example →" or "Try it now →" pointing to `/demo`. This should appear at least 3 times per solutions page.

---

## 8. Implementation Order

Work in this sequence to maximize early impact:

### Sprint A — Foundation (no visual change)
1. Update `_redirects`: add all 32 legacy-to-new-URL rules, remove the catch-all-to-`/` rules
2. Create `solutions/` and `guides/` directory structure with placeholder `index.html` files
3. Move all 16 legacy `.html` files into directory structure as `index.html`
4. Update `sitemap.xml` with 18 new URLs
5. Fix all internal links inside the 16 pages (old `podfy-*.html` hrefs → new `/solutions/*/` or `/guides/*/`)
6. Fix `/free-tier-demo.html` → `/demo` and `/privacy.html` → `/trust#privacy` in all 16 pages

### Sprint B — Guide pages v2 overhaul
Priority order: hub first, then highest-traffic queries

1. `/guides/proof-of-delivery/` — v2 migration + breadcrumb + TOC strip + guide cross-links + audience grid
2. `/guides/pod-without-app/` — v2 migration + comparison table-lite + mid-page demo CTA
3. `/guides/missing-pod/` — v2 migration + problem flow strip (Component G) + sibling links
4. `/guides/pod-disputes/` — v2 migration + comparison table + sibling links
5. `/guides/digital-vs-paper/` — v2 migration + full comparison table (Component H)
6. `/guides/pod-invoicing/` — v2 migration + problem flow strip
7. `/guides/pod-compliance/` — v2 migration + metadata refresh (title/description were thin)
8. `/guides/photo-pod/` — v2 migration + photo-specific receipt visual

### Sprint C — Solutions pages v2 overhaul
Priority order: highest commercial intent first

1. `/solutions/carriers/` — v2 migration + before/after strip + guide callouts
2. `/solutions/3pl/` — v2 migration + before/after strip + guide callouts
3. `/solutions/shippers/` — v2 migration + guide callouts
4. `/solutions/retail/` — v2 migration + guide callouts
5. `/solutions/construction/` — v2 migration + guide callouts
6. `/solutions/facilities/` — v2 migration + guide callouts
7. `/solutions/inbound/` — v2 migration + guide callouts
8. `/solutions/digitize/` — v2 migration + guide callouts

### Sprint D — Index pages
1. `/solutions/index.html` — audience selector grid (Component E) + guide callout
2. `/guides/index.html` — hub card + problem cluster + comparison featured card

### Sprint E — V2 canonical page updates
1. Homepage: add "Who uses Podfy?" audience section (4 tiles + "all use cases" link)
2. Pricing: add "Find your fit" use-case section
3. Demo: add audience selector below demo embed
4. Changelog: add "New to Podfy?" sidebar callout → guide hub

---

## 9. Meta & Schema Fixes

Apply to all 16 pages during v2 migration:

### Canonical URLs
Update all `<link rel="canonical">` to new clean URLs:
```html
<!-- was: href="https://podfy.net/podfy-proof-of-delivery-for-carriers" -->
<link rel="canonical" href="https://podfy.net/solutions/carriers/" />
```

### Schema @id references
Update any absolute URLs in `ld+json` blocks:
```json
{
  "@id": "https://podfy.net/solutions/carriers/",
  "url": "https://podfy.net/solutions/carriers/"
}
```

### BreadcrumbList schema (add to all pages)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "PODFY", "item": "https://podfy.net/" },
    { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://podfy.net/solutions/" },
    { "@type": "ListItem", "position": 3, "name": "Carriers", "item": "https://podfy.net/solutions/carriers/" }
  ]
}
```

### hreflang
Add hreflang to all new pages (EN only for now, x-default to EN):
```html
<link rel="alternate" hreflang="en" href="https://podfy.net/solutions/carriers/" />
<link rel="alternate" hreflang="x-default" href="https://podfy.net/solutions/carriers/" />
```

---

## 10. CSS Additions Required

Add these new class groups to `styles.v2.css`:

```css
/* ── Breadcrumb ──────────────────────────── */
.v2-breadcrumb { border-bottom: 1px solid var(--v2-border); padding: .5rem 0; }
.v2-breadcrumb-list { display: flex; align-items: center; gap: .5rem; list-style: none; margin: 0; padding: 0; font-family: var(--v2-font-mono); font-size: .75rem; color: var(--v2-muted); }
.v2-breadcrumb-list li + li::before { content: "·"; margin-right: .5rem; }
.v2-breadcrumb-list a { color: var(--v2-muted); text-decoration: none; }
.v2-breadcrumb-list a:hover { color: var(--v2-ink); }

/* ── Before/After contrast strip ─────────── */
.v2-contrast-strip { display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; padding: 2.5rem 0; }
.v2-contrast-label { font-family: var(--v2-font-mono); font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .75rem; }
.v2-contrast-bad .v2-contrast-label { color: var(--v2-stamp); }
.v2-contrast-good .v2-contrast-label { color: var(--v2-delivered); }
.v2-contrast-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
.v2-contrast-bad li::before { content: "✗ "; color: var(--v2-stamp); }
.v2-contrast-good li::before { content: "✓ "; color: var(--v2-delivered); }
.v2-contrast-divider { width: 1px; background: var(--v2-border); align-self: stretch; }

/* ── Guide cards ─────────────────────────── */
.v2-guide-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
.v2-guide-card { display: flex; flex-direction: column; gap: .5rem; padding: 1.25rem; border: 1px solid var(--v2-border); border-left: 3px solid var(--v2-stamp); border-radius: .25rem; background: var(--v2-surface); text-decoration: none; color: var(--v2-ink); transition: box-shadow .15s; }
.v2-guide-card:hover { box-shadow: 0 2px 12px color-mix(in srgb, var(--v2-stamp) 15%, transparent); }
.v2-guide-tag { font-family: var(--v2-font-mono); font-size: .7rem; text-transform: uppercase; color: var(--v2-stamp); }
.v2-guide-title { font-size: 1rem; font-weight: 600; line-height: 1.3; }
.v2-guide-desc { font-size: .875rem; color: var(--v2-muted); flex: 1; }
.v2-guide-arrow { font-family: var(--v2-font-mono); font-size: .78rem; color: var(--v2-stamp); margin-top: auto; }

/* ── TOC strip ───────────────────────────── */
.v2-toc { border-bottom: 1px solid var(--v2-border); padding: .75rem 0; position: sticky; top: 0; background: var(--v2-paper); z-index: 10; }
.v2-toc-list { display: flex; gap: .5rem; overflow-x: auto; scrollbar-width: none; list-style: none; margin: 0; padding: 0; }
.v2-toc-pill { display: inline-block; padding: .3rem .85rem; border: 1px solid var(--v2-border); border-radius: 2rem; font-family: var(--v2-font-mono); font-size: .75rem; color: var(--v2-muted); text-decoration: none; white-space: nowrap; transition: background .12s, color .12s, border-color .12s; }
.v2-toc-pill:hover, .v2-toc-pill.active { background: var(--v2-stamp); color: white; border-color: var(--v2-stamp); }

/* ── Audience selector grid ──────────────── */
.v2-audience-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
.v2-audience-tile { display: flex; flex-direction: column; gap: .4rem; padding: 1.25rem; border: 1px solid var(--v2-border); border-radius: .25rem; background: var(--v2-surface); text-decoration: none; color: var(--v2-ink); transition: border-color .12s, box-shadow .12s; }
.v2-audience-tile:hover { border-color: var(--v2-stamp); box-shadow: 0 2px 8px color-mix(in srgb, var(--v2-stamp) 12%, transparent); }
.v2-audience-industry { font-family: var(--v2-font-mono); font-size: .7rem; text-transform: uppercase; color: var(--v2-muted); }
.v2-audience-role { font-size: 1.05rem; font-weight: 700; }
.v2-audience-quote { font-size: .8rem; color: var(--v2-muted); font-style: italic; }

/* ── Inline CTA banner ───────────────────── */
.v2-inline-cta { background: var(--v2-ink); color: var(--v2-paper); padding: 2.5rem 0; margin: 3rem 0; }
.v2-inline-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; }
.v2-inline-cta-label { font-family: var(--v2-font-mono); font-size: .75rem; text-transform: uppercase; opacity: .6; }
.v2-inline-cta-text { font-size: 1.2rem; font-weight: 600; flex: 1; }

/* ── Comparison table ────────────────────── */
.v2-comparison-table { width: 100%; border-collapse: collapse; font-size: .9rem; }
.v2-comparison-table th, .v2-comparison-table td { padding: .75rem 1rem; border-bottom: 1px solid var(--v2-border); text-align: left; }
.v2-comparison-table th { font-family: var(--v2-font-mono); font-size: .75rem; text-transform: uppercase; color: var(--v2-muted); }
.v2-col-paper { color: var(--v2-muted); }
.v2-col-digital { background: color-mix(in srgb, var(--v2-delivered) 6%, transparent); font-weight: 500; }

/* ── Reading progress bar ────────────────── */
#v2-progress { position: fixed; top: 0; left: 0; height: 2px; background: var(--v2-stamp); width: 0%; z-index: 999; transition: width .1s linear; pointer-events: none; }

/* ── FAQ accordion ───────────────────────── */
.v2-faq-item { border-bottom: 1px solid var(--v2-border); }
.v2-faq-question { width: 100%; text-align: left; background: none; border: none; padding: 1rem 0; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--v2-ink); }
.v2-faq-question::after { content: "+"; font-size: 1.25rem; color: var(--v2-muted); transition: transform .15s; }
.v2-faq-open .v2-faq-question::after { transform: rotate(45deg); }
.v2-faq-answer { max-height: 0; overflow: hidden; transition: max-height .2s ease; font-size: .9375rem; color: var(--v2-muted); line-height: 1.65; }
.v2-faq-open .v2-faq-answer { max-height: 600px; padding-bottom: 1rem; }
```

---

## 11. Acceptance Criteria

Before deploying, verify:

- [ ] All 32 old `podfy-*.html` URLs redirect with 301 to their new `/solutions/*/` or `/guides/*/` equivalent
- [ ] All 16 pages have updated canonical URLs pointing to the new paths
- [ ] All internal links on all pages use new clean URLs (no `podfy-*.html` hrefs remain)
- [ ] `sitemap.xml` contains all 18 new URLs (16 pages + 2 index pages), no old `podfy-*` URLs
- [ ] All pages render with `body.v2` (no v1 CSS artifacts)
- [ ] All contact forms still post to `/api/contact` and work
- [ ] Turnstile sitekey `0x4AAAAAACFOR78WSLkw_gB7` present on all pages with forms
- [ ] Schema markup validates on all pages (Google Rich Results Test)
- [ ] Breadcrumb bar visible and linked correctly on all 16 pages
- [ ] Guide pages have TOC strip with working anchor links
- [ ] Solutions pages have before/after contrast strip
- [ ] Solutions pages have 2–3 guide recommendation cards
- [ ] Guide pages have 2–3 solution audience cards
- [ ] `/solutions/index.html` audience grid links to all 8 solutions pages
- [ ] `/guides/index.html` hub card links to `/guides/proof-of-delivery/`
- [ ] Homepage has "Who uses Podfy?" audience section with 4+ audience tiles
- [ ] Reading progress bar visible on guide pages
- [ ] FAQ accordion works (expand/collapse) on all pages
