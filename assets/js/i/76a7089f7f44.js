
    /* EU storage badge: NL / DE / FR label + aria-label (hand-written; the data-t map is generated) */
    document.addEventListener("DOMContentLoaded", function () {
      var L = {
        nl: ["Opslag in de EU", "Gegevens opgeslagen in de EU (Cloudflare EU-jurisdictie)"],
        de: ["Speicherung in der EU", "Daten in der EU gespeichert (Cloudflare-EU-Jurisdiktion)"],
        fr: ["Stockage dans l\u2019UE", "Donn\u00e9es stock\u00e9es dans l\u2019UE (juridiction UE de Cloudflare)"]
      };
      var lang = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
      var el = document.querySelector(".site-eu-mark");
      if (el && L[lang]) { el.textContent = L[lang][0]; el.setAttribute("aria-label", L[lang][1]); }
    });
  