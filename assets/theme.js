/* /assets/theme.js
   PODFY theme toggle (system → light → dark) + Cloudflare Turnstile theme sync
*/
(function () {
  var STORAGE_KEY = "podfy-theme";
  var root = document.documentElement;
  var current = "system";

  function getSystemMode() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Render or re-render Cloudflare Turnstile using the current effective theme.
  // Requires the widget container to have: id="turnstile-widget" and data-sitekey="..."
  function renderTurnstile(theme) {
    if (!window.turnstile) return;

    var el = document.getElementById("turnstile-widget");
    if (!el) return;

    // Clear any previous render so we can re-render cleanly.
    el.innerHTML = "";

    // Render with theme explicitly set to light/dark
    window.turnstile.render(el, {
      sitekey: el.dataset.sitekey,
      theme: theme
      // callbacks are still read from the element's data-* attributes
      // (data-callback, data-expired-callback, data-error-callback)
    });
  }

  function apply(mode) {
    var effective = mode === "system" ? getSystemMode() : mode;
    root.setAttribute("data-theme", effective);

    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.dataset.mode = mode;

      var label = btn.querySelector(".site-theme-label");
      if (label) {
        label.textContent =
          mode === "system" ? "System" :
          mode === "light"  ? "Light"  :
                              "Dark";
      }
    }

    // Keep Turnstile in sync (light/dark). Safe no-op if widget/script not present.
    renderTurnstile(effective);
  }

  function cycle() {
    return current === "system"
      ? "light"
      : current === "light"
      ? "dark"
      : "system";
  }

  function init() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") current = stored;

    apply(current);

    // If user is on "system", also react to OS theme changes live.
    if (window.matchMedia) {
      var mql = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () {
        if (current === "system") apply("system");
      };

      // Support older Safari
      if (typeof mql.addEventListener === "function") mql.addEventListener("change", onChange);
      else if (typeof mql.addListener === "function") mql.addListener(onChange);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeToggle");

    // Always init theme, even if button is not present on this page.
    init();

    if (!btn) return;

    btn.addEventListener("click", function () {
      current = cycle();
      apply(current);

      if (current === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, current);
    });
  });
})();
