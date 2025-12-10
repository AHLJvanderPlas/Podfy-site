# Podfy-site

Public marketing site for **PODFY** — *“Proof of Delivery, retrieved in seconds.”*
Serves as the lightweight, EU-ready companion to the operational platform at **podfy.app**.

* Live site: [https://podfy.net](https://podfy.net)
* App: [https://podfy.app](https://podfy.app)

This repository hosts a **static HTML site** (no build step) deployed on **Cloudflare Pages**, using a minimal bespoke design system with Tailwind tokens.

---

## Table of contents

* [Overview](#overview)
* [Live URLs](#live-urls)
* [Tech stack](#tech-stack)
* [Project structure](#project-structure)
* [Content editing](#content-editing)
* [Brand components](#brand-components)
* [Deployment (Cloudflare Pages)](#deployment-cloudflare-pages)
* [Routing, redirects & special endpoints](#routing-redirects--special-endpoints)
* [Security headers & hardening](#security-headers--hardening)
* [Legal & compliance pages](#legal--compliance-pages)
* [Email, DNS & well-known files](#email-dns--well-known-files)
* [Security policy](#security-policy)
* [Contributions](#contributions)
* [License](#license)

---

# Overview

**podfy.net** is the marketing + trust layer of PODFY.
Its goals:

1. Explain what PODFY does in seconds.
2. Provide clear CTAs to the operational product at **podfy.app**.
3. Offer a full legal and security documentation surface for auditors, partners, authorities, and enterprise buyers.
4. Stay extremely light: no frameworks, no bundler, no JS beyond essentials.

The site uses the same brand primitives as the app (colors, typography, spacing, header/footer injection) for seamless continuity.

---

# Live URLs

### Public pages

* Homepage: `/`
* Pricing: `/pricing`
* Tool page (opens app): `/tool/`
* Security overview: `/security`
* Privacy Policy: `/privacy`
* Terms of Service: `/terms`
* Cookie Policy: `/cookie`
* Imprint / Impressum: `/imprint`
* Releases (auto-maintained content): `/releases`
* Custom 404: `/404.html`

### Well-known endpoints

* Responsible disclosure metadata: `/.well-known/security.txt`

### External

* Operational product: [https://podfy.app](https://podfy.app)

---

# Tech stack

| Component | Choice                                  | Notes                                        |
| --------- | --------------------------------------- | -------------------------------------------- |
| Hosting   | Cloudflare Pages                        | Zero-build static hosting                    |
| DNS       | Cloudflare Registrar + DNS              | DNSSEC enabled                               |
| Runtime   | Pure HTML + CSS                         | Faster than Tailwind CLI for small footprint |
| Styling   | PODFY design system (`styles.css`)      | Tailwind tokens, utilities, and custom rules |
| Forms     | Backend Worker or external provider     | Replace placeholder endpoint with actual     |
| JS        | Only for theme toggle and small helpers | No dependency chain                          |

No frameworks, no build tooling, no Node required.

---

# Project structure

```
/
├─ index.html                – homepage
├─ pricing/                  – pricing calculator + WTP logic
├─ security.html             – security posture
├─ privacy.html              – privacy policy
├─ terms.html                – terms of service
├─ cookie.html               – cookie policy
├─ imprint.html              – legal imprint / Impressum
├─ releases.html             – auto-updated release notes
├─ 404.html                  – custom 404 with tiles
│
├─ assets/
│  ├─ styles.css             – design system & UI primitives
│  ├─ theme.js               – color-mode toggler
│  ├─ podfy.svg              – logo
│  └─ podfy-favicon.svg      – favicon set
│
├─ tool/                     – redirect helper for app usage
└─ .well-known/
   └─ security.txt          – disclosure policy
```

---

# Content editing

**No build step** means any change is live once committed.

### Most modified content:

* `index.html` → hero, value props, CTAs
* `pricing/` → plan logic, WTP multiplier, responsive layout
* `releases.html` → auto-injected entries from the PODFY release workflow
* Legal pages → security/privacy/terms/cookie/imprint

### Styling

All brand styling lives in:

```
/assets/styles.css
```

The file defines:

* brand color tokens
* spacing rules
* layout utilities
* typography
* header/footer injection sections
* card, tile, and page-shell patterns (used in Security/Terms/404)

---

# Brand components

Shared across the site:

* **Header / navigation** injected via `[[PODFY_HEADER]]`
* **Footer** with:

  * Releases
  * Privacy
  * Terms
  * Cookie Policy
  * Security
  * Imprint
  * © auto-updating year

This ensures perfect consistency even across static HTML pages.

Logos come from `/assets/podfy.svg` and `/assets/podfy-favicon.svg`.

---

# Deployment (Cloudflare Pages)

1. Connect repository to Cloudflare Pages.
2. Set **Build command: none**.
3. Set **Output directory: `/`** (root).
4. Enable:

   * HTTP/3
   * Brotli compression
   * Automatic HTTPS rewrites
   * HSTS (Strict Transport Security)

### Branch previews

Cloudflare creates preview deployments for pull requests automatically.

---

# Routing, redirects & special endpoints

### Redirects

Handled via `_redirects` or Cloudflare Pages project rules.

Common examples:

```
/tool  -> https://podfy.app
/pricing -> /pricing/index.html
```

### Special pages

* `404.html`: automatically picked up by Cloudflare Pages
* `/.well-known/security.txt`: served verbatim
* `/releases`: populated by the internal release update script

---

# Security headers & hardening

Cloudflare Pages + Workers apply:

* Strict HTTPS
* HSTS (`.app` is HSTS-preloaded)
* TLS 1.2+
* Modern cipher suites
* Content Security Policy (CSP baseline)
* X-Content-Type-Options: nosniff
* Referrer-Policy: `strict-origin-when-cross-origin`

The **Security page** describes the full posture:
tenant isolation, token-based portals, storage design, R2/D1 usage, logging practices, and incident response model.

---

# Legal & compliance pages

| Page                 | URL         | Purpose                                             |
| -------------------- | ----------- | --------------------------------------------------- |
| **Security**         | `/security` | Technical & governance security posture             |
| **Privacy Policy**   | `/privacy`  | GDPR-aligned transparency for data processing       |
| **Terms of Service** | `/terms`    | Contractual obligations for podfy.app & podfy.net   |
| **Cookie Policy**    | `/cookie`   | Current cookie-free model + future consent handling |
| **Imprint**          | `/imprint`  | EU legal identity disclosure (Impressum)            |

Each page uses the shared PODFY layout and cards.

---

# Email, DNS & well-known files

### Domain setup

* `podfy.net` → marketing site
* `podfy.app` → operational app
* DNSSEC enabled
* TXT/SPF/DMARC/DKIM configured at Cloudflare

### Email flows

* Auto-replies for web forms
* Driver portal links
* Copy-to-customer flows
* All rendered with the shared branded email template system

### Well-known

`/.well-known/security.txt` publishes our vulnerability-reporting metadata.

---

# Security policy

The full researcher policy lives at:

```
SECURITY.md
```

It describes:

* Contact details
* Safe harbour rules
* Testing scope
* Response timeline
* Disclosure process
* Remediation severity matrix

This is linked from both:

* `/security`
* `/.well-known/security.txt`

---

# Contributions

Internal contributors only.
Changes are deployed automatically via Cloudflare Pages after merge to `main`.

---

# License

© PODFY — All rights reserved.
This site and its content may not be redistributed without permission.

---

If you'd like, I can also create:

✓ A **CHANGELOG.md**
✓ A **CONTRIBUTING.md**
✓ A **release script** description
✓ A **developer setup guide** (for designers, copywriters, and engineers)

Want those added?
