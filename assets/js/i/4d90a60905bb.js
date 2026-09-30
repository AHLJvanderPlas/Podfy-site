
    (function () {
      /* Year */
      var yEl = document.querySelector(".v2-footer-year");
      if (yEl) yEl.textContent = new Date().getFullYear();

      /* Locale detection — from <html lang>, not the URL path (see
         header.html for why: path-only detection is blind on the dynamic
         /insights/* pages, which carry language via ?lang= not a prefix). */
      var htmlLang = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
      var locale = ["nl", "de", "fr"].indexOf(htmlLang) !== -1 ? htmlLang : "";

      /* Locale row: use hreflang <link> tags for equivalent-page links */
      var hreflangs = {};
      document.querySelectorAll("link[rel='alternate'][hreflang]").forEach(function (el) {
        hreflangs[el.getAttribute("hreflang")] = el.getAttribute("href");
      });
      document.querySelectorAll(".site-footer-locale-row [data-lang]").forEach(function (el) {
        var lang = el.getAttribute("data-lang");
        var isActive = (lang === locale) || (lang === "en" && !locale);
        el.classList.toggle("site-footer-locale-active", isActive);
        el.classList.toggle("site-footer-locale-inactive", !isActive);
        if (el.tagName === "A") {
          var target = hreflangs[lang] || (lang === "en" ? "/" : "/" + lang + "/");
          el.setAttribute("href", target);
        }
      });

      /* Translate footer labels for NL / DE / FR */
      var FOOTER_LABELS = {
        nl: {
          "Product":"Product","Solutions":"Oplossingen","Guides":"Gidsen",
          "Trust & Legal":"Vertrouwen & Juridisch","Contact":"Contact",
          "Pricing":"Tarieven","CMR generator":"CMR-generator",
          "Release notes":"Versiegeschiedenis",
          "Carriers":"Vervoerders","3PLs":"3PL-dienstverleners",
          "Shippers":"Verladers","Retail":"Retail",
          "Construction":"Bouw","Inbound":"Inkomende goederen",
          "Facilities":"Facilitair","Paper to digital":"Papier naar digitaal",
          "All solutions →":"Alle oplossingen →",
          "What is POD?":"Wat is een POD?",
          "Digital vs paper":"Digitaal vs. papier",
          "Compliance & retention":"Compliance & bewaartermijn",
          "Dispute resolution":"Geschillenbeslechting",
          "Photo POD":"Foto-POD","Missing POD":"Ontbrekende POD",
          "POD & invoicing":"POD & facturering",
          "POD without an app":"POD zonder app",
          "All guides →":"Alle gidsen →",
          "About":"Over ons",
          "Vs. scan apps":"Vs. scan-apps",
          "Security":"Beveiliging","Privacy & GDPR":"Privacy & AVG",
          "Terms":"Voorwaarden","Cookies":"Cookies",
          "Imprint":"Impressum","Disclosure":"Openbaarmaking"
        },
        de: {
          "Product":"Produkt","Solutions":"Lösungen","Guides":"Leitfäden",
          "Trust & Legal":"Vertrauen & Recht","Contact":"Kontakt",
          "Pricing":"Preise","CMR generator":"CMR-Generator",
          "Release notes":"Versionshinweise",
          "Carriers":"Spediteure","3PLs":"Logistikdienstleister",
          "Shippers":"Verlader","Retail":"Einzelhandel",
          "Construction":"Bau","Inbound":"Wareneingang",
          "Facilities":"Facility-Management","Paper to digital":"Papier zu digital",
          "All solutions →":"Alle Lösungen →",
          "What is POD?":"Was ist ein POD?",
          "Digital vs paper":"Digital vs. Papier",
          "Compliance & retention":"Compliance & Aufbewahrung",
          "Dispute resolution":"Streitbeilegung",
          "Photo POD":"Foto-Liefernachweis","Missing POD":"Fehlender POD",
          "POD & invoicing":"POD & Rechnungsstellung",
          "POD without an app":"POD ohne App",
          "All guides →":"Alle Leitfäden →",
          "About":"Über uns",
          "Vs. scan apps":"Vs. Scan-Apps",
          "Security":"Sicherheit","Privacy & GDPR":"Datenschutz & DSGVO",
          "Terms":"AGB","Cookies":"Cookies",
          "Imprint":"Impressum","Disclosure":"Offenlegung"
        },
        fr: {
          "Product":"Produit","Solutions":"Solutions","Guides":"Guides",
          "Trust & Legal":"Confiance & Légal","Contact":"Contact",
          "Pricing":"Tarifs","CMR generator":"Générateur CMR",
          "Release notes":"Notes de version",
          "Carriers":"Transporteurs","3PLs":"Prestataires logistiques",
          "Shippers":"Expéditeurs","Retail":"Commerce de détail",
          "Construction":"Construction","Inbound":"Réception marchandises",
          "Facilities":"Gestion des installations",
          "Paper to digital":"Papier vers numérique",
          "All solutions →":"Toutes les solutions →",
          "What is POD?":"Qu’est-ce qu’un POD ?",
          "Digital vs paper":"Numérique vs papier",
          "Compliance & retention":"Conformité & conservation",
          "Dispute resolution":"Résolution des litiges",
          "Photo POD":"Photo POD","Missing POD":"POD manquant",
          "POD & invoicing":"POD & facturation",
          "POD without an app":"POD sans application",
          "All guides →":"Tous les guides →",
          "About":"À propos",
          "Vs. scan apps":"Vs. apps de scan",
          "Security":"Sécurité","Privacy & GDPR":"Confidentialité & RGPD",
          "Terms":"CGU","Cookies":"Cookies",
          "Imprint":"Mentions légales","Disclosure":"Divulgation"
        }
      };
      if (locale && FOOTER_LABELS[locale]) {
        var lmap = FOOTER_LABELS[locale];
        document.querySelectorAll(".site-footer-grid a, .site-footer-col-heading").forEach(function(el) {
          var txt = el.textContent.trim();
          if (lmap[txt]) el.textContent = lmap[txt];
        });
      }

      /* Rewrite footer column links for NL/DE locales */
      if (locale) {
        var pfx = "/" + locale;
        document.querySelectorAll(".site-footer-grid a[href]").forEach(function (a) {
          var h = a.getAttribute("href");
          if (!h || h.charAt(0) !== "/") return;
          if (/^\/(nl|de|fr)(\/|$)/.test(h)) return;  /* already prefixed */
          if (h === "/changelog" || h.startsWith("/changelog")) return;  /* EN-only page */
          if (h.startsWith("/.")) return;  /* /.well-known etc */
          a.setAttribute("href", pfx + h);
        });
      }
    })();
  