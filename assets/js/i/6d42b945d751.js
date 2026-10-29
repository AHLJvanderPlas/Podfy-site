
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
  