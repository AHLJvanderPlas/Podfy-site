# Podfy-site

Marketing one-pager for **PODFY** — “Proof of Delivery, retrieved in seconds”.

- Live site: https://podfy.net
- App: https://podfy.app

This repo hosts a static site (no build step) served via **Cloudflare Pages**. Styling is done with Tailwind via CDN to keep things simple.

---

## Table of contents
- [Overview](#overview)
- [Live URLs](#live-urls)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [How to edit content](#how-to-edit-content)
- [Deployment (Cloudflare Pages)](#deployment-cloudflare-pages)
- [Redirects and special routes](#redirects-and-special-routes)
- [Security headers](#security-headers)
- [SEO & social](#seo--social)
- [Legal & compliance pages](#legal--compliance-pages)
- [Icons & brand assets](#icons--brand-assets)
- [Email & DNS](#email--dns)
- [Security policy](#security-policy)
- [Support](#support)
- [License](#license)

---

## Overview
Podfy.net is a lightweight, fast landing page aimed at **brand owners** who will assign Podfy to drivers. The content focuses on trust, speed, and EU-readiness and links the visitor to the operational app on `podfy.app`.

## Live URLs
- Main: `https://podfy.net/`
- Security: `/security.html`
- Privacy: `/privacy.html`
- Terms: `/terms.html`
- Imprint: `/imprint.html`
- 404: `/404.html`
- Well-known: `/.well-known/security.txt`
- App link page (opens new tab): `/tool/`

## Tech stack
- **Hosting & DNS**: Cloudflare (Pages + Registrar)
- **HTML/CSS**: Static HTML, TailwindCSS via CDN
- **Forms**: placeholder (`submit-form.com`) — replace with your provider
- **No build step** required

## Project structure
