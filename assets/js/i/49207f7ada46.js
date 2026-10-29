
    /* Solutions menu: button toggles the panel; Escape or a click outside closes it */
    (function () {
      var btn = document.getElementById("solutionsBtn");
      var menu = document.getElementById("solutionsMenu");
      if (!btn || !menu) return;
      function set(open) { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); }
      btn.addEventListener("click", function (e) { e.stopPropagation(); set(menu.hidden); });
      menu.addEventListener("click", function (e) { e.stopPropagation(); });
      document.addEventListener("click", function () { set(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); }
      });
    })();

    /* Header + footer labels marked data-t, translated for NL / DE / FR (generated from scripts/qr-pages/content) */
    document.addEventListener("DOMContentLoaded", function () {
      var T = {"nl": {"solutions": "Oplossingen", "pod_head": "Afleverbewijs", "overview": "Overzicht", "carriers": "Vervoerders", "3pl": "3PL en fulfilment", "shippers": "Verladers", "retail": "Retail", "construction": "Bouw", "facilities": "Facilitair", "inbound": "Inkomende goederen", "digitize": "Papier naar digitaal", "cmr": "CMR-generator", "all_cases": "Alle toepassingen", "guides": "Gidsen", "pricing": "Tarieven", "contact": "Contact", "trust": "Vertrouwen & Juridisch", "qr_head": "QR-meldingen", "new": "Nieuw", "c-ev-chargers": "Laadpalen", "c-parcel-lockers": "Pakketkluizen", "c-trailers-containers": "Trailers en containers", "c-vending-machines": "Verkoopautomaten", "c-coffee-machines": "Koffiemachines", "c-printers-copiers": "Printers en kopieerapparaten", "c-restrooms-cleaning": "Toiletten en schoonmaak", "c-fitness-equipment": "Fitnessapparatuur", "c-waste-containers": "Afvalcontainers", "c-remote-equipment": "Apparatuur op afstand"}, "de": {"solutions": "Lösungen", "pod_head": "Liefernachweis", "overview": "Übersicht", "carriers": "Spediteure", "3pl": "3PL und Fulfillment", "shippers": "Verlader", "retail": "Einzelhandel", "construction": "Bau", "facilities": "Facility-Management", "inbound": "Wareneingang", "digitize": "Papier zu digital", "cmr": "CMR-Generator", "all_cases": "Alle Anwendungsfälle", "guides": "Leitfäden", "pricing": "Preise", "contact": "Kontakt", "trust": "Vertrauen & Recht", "qr_head": "QR-Meldungen", "new": "Neu", "c-ev-chargers": "Ladestationen", "c-parcel-lockers": "Paketstationen", "c-trailers-containers": "Auflieger und Container", "c-vending-machines": "Verkaufsautomaten", "c-coffee-machines": "Kaffeemaschinen", "c-printers-copiers": "Drucker und Kopierer", "c-restrooms-cleaning": "Sanitärräume und Reinigung", "c-fitness-equipment": "Fitnessgeräte", "c-waste-containers": "Abfallbehälter", "c-remote-equipment": "Geräte im Außeneinsatz"}, "fr": {"solutions": "Solutions", "pod_head": "Preuve de livraison", "overview": "Vue d’ensemble", "carriers": "Transporteurs", "3pl": "3PL et e-logistique", "shippers": "Expéditeurs", "retail": "Commerce de détail", "construction": "Construction", "facilities": "Gestion des installations", "inbound": "Réception marchandises", "digitize": "Papier vers numérique", "cmr": "Générateur CMR", "all_cases": "Tous les cas d’usage", "guides": "Guides", "pricing": "Tarifs", "contact": "Contact", "trust": "Confiance & Légal", "qr_head": "Signalement QR", "new": "Nouveau", "c-ev-chargers": "Bornes de recharge", "c-parcel-lockers": "Consignes à colis", "c-trailers-containers": "Remorques et conteneurs", "c-vending-machines": "Distributeurs automatiques", "c-coffee-machines": "Machines à café", "c-printers-copiers": "Imprimantes et copieurs", "c-restrooms-cleaning": "Sanitaires et nettoyage", "c-fitness-equipment": "Appareils de fitness", "c-waste-containers": "Conteneurs à déchets", "c-remote-equipment": "Équipements sur site"}};
      var lang = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
      var map = T[lang];
      if (!map) return;
      document.querySelectorAll("[data-t]").forEach(function (el) {
        var v = map[el.getAttribute("data-t")];
        if (v) el.textContent = v;
      });
    });
  