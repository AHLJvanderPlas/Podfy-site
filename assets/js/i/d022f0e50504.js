
    /* FOUC prevention: apply saved theme immediately, before paint */
    (function () {
      try {
        var stored = localStorage.getItem("podfy-theme");
        var effective = (stored === "light" || stored === "dark")
          ? stored
          : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", effective);
      } catch (e) {}
    })();

    /* Mobile nav + locale switcher, progressive enhancement */
    document.addEventListener("DOMContentLoaded", function () {

      /* Mobile menu toggle */
      var menuBtn  = document.getElementById("menuBtn");
      var mobileNav = document.getElementById("mobileNav");
      if (menuBtn && mobileNav) {
        menuBtn.addEventListener("click", function () {
          var open = mobileNav.classList.toggle("open");
          menuBtn.setAttribute("aria-expanded", String(open));
        });
      }

      /* Locale switcher toggle */
      var localeBtn  = document.getElementById("localeBtn");
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

      /* ── Locale-aware navigation ── */
      (function () {
        // Every page on the site (static locale homepages AND the dynamic
        // /insights/article|repository/item SSR pages, which carry their
        // language in ?lang= rather than a path prefix) sets <html lang>
        // correctly — read that instead of guessing from the URL path.
        // A path-only check left the whole switcher (active-state, header/
        // mobile-nav link rewriting, footer translation) blind on every
        // insights page: it always "detected" no locale, so it silently
        // pointed the FR/DE/NL menu items and quietly rewrote all other
        // nav + footer links back to their English targets even while
        // viewing a French or German article.
        var htmlLang = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
        var locale = ["nl", "de", "fr"].indexOf(htmlLang) !== -1 ? htmlLang : "";

        /* Update button label */
        if (localeBtn && locale) {
          localeBtn.innerHTML = locale.toUpperCase() + " &#9662;";
        }

        /* Use hreflang <link> tags so each locale item points to the
           equivalent page, not just the locale home page */
        var hreflangs = {};
        document.querySelectorAll("link[rel='alternate'][hreflang]").forEach(function (el) {
          hreflangs[el.getAttribute("hreflang")] = el.getAttribute("href");
        });
        document.querySelectorAll("#localeMenu [data-lang]").forEach(function (el) {
          var lang = el.getAttribute("data-lang");
          var isActive = (lang === locale) || (lang === "en" && !locale);
          el.classList.toggle("site-locale-active", isActive);
          if (el.tagName === "A") {
            var target = hreflangs[lang] || (lang === "en" ? "/" : "/" + lang + "/");
            el.setAttribute("href", target);
            el.setAttribute("aria-selected", String(isActive));
          }
        });

        /* Rewrite header + mobile nav links for NL/DE locales */
        if (locale) {
          var pfx = "/" + locale;
          ["primaryNav", "mobileNav"].forEach(function (navId) {
            var nav = document.getElementById(navId);
            if (!nav) return;
            nav.querySelectorAll("a[href]").forEach(function (a) {
              var h = a.getAttribute("href");
              if (h && h.charAt(0) === "/" && !/^\/(nl|de|fr)(\/|$)/.test(h)) {
                a.setAttribute("href", pfx + h);
              }
            });
          });
        }
      })();

    });
  