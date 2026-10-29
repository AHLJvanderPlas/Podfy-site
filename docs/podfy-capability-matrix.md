# PODFY capability matrix: QR Reporting vs. what exists (updated 2026-10-29)

Owner decisions 2026-10-29: QR Reporting gets **exactly the same functions as Proof of Delivery**, described differently.
The site may overpromise a little: features below marked **claimed** are shown as available and are built before
or with the first customers. Only the open API is labelled "Soon".

Legend: **live** in production · **claimed** on the site, still to build · **soon** labelled "Soon" on the site.

| Capability | Today | To build | Site status |
|---|---|---|---|
| QR per asset, no app or login | podfy.app/{slug}/{ref}; Dispatch QR cards | — | live |
| Asset pre-filled from QR | `ref1` in URL, locked field | — | live |
| Asset register via template | none | download template (CSV/XLSX) → upload; asset number = reference; per-asset QR | claimed |
| QR stickers with custom text | Dispatch label (CMR sticker layout) | same sticker, text set per brand (e.g. "Scan to report an issue") | claimed |
| Own issue categories, per language | 6 fixed delivery codes | per-brand category list | claimed |
| Photo required / optional / off | file always required | feature toggle in the function menu (both solutions) | claimed |
| E-mail notifications | brand recipients + custom templates | report wording | live (wording: claimed) |
| Webhook to ticketing / maintenance | none (only Mollie → Podfy) | signed `report.created` / `pod.created`, retries, endpoint settings; **target live end of November 2026**, built together with the first customer | claimed |
| Open (DIY) API | none | read/receive API for custom integrations | soon |
| History per asset | portal list, search by reference | category filter, per-asset view | claimed |
| Branding, 12 languages, EU storage | live | — | live |
| Abuse protection | upload challenge + rate limits | review for anonymous reporters | live |
| Pricing | per POD / plan | per project (assets + reports) | "on request" |
