/* /assets/theme.js
   PODFY theme toggle (system → light → dark) + Cloudflare Turnstile theme sync
   Requires:
   - Turnstile script: .../api.js?render=explicit
   - Widget element: id="turnstile-widget" and data-sitekey="..."
*/
(function () {
  var STORAGE_KEY = "podfy-theme";
  var root = document.documentElement;
  var current = "system";

  // Keep the last rendered Turnstile widget id so we can remove it before re-render.
  var turnstileWidgetId = null;

  function getSystemMode() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function safeFn(name) {
    if (!name) return null;
    var fn = window[name];
    return typeof fn === "function" ? fn : null;
  }

  function renderTurnstile(theme) {
    // Must have the Turnstile API loaded
    if (!window.turnstile) return;

    var el = document.getElementById("turnstile-widget");
    if (!el) return;

    // If we previously rendered a widget, remove it cleanly
    if (turnstileWidgetId !== null) {
      try { window.turnstile.remove(turnstileWidgetId); } catch (e) {}
      turnstileWidgetId = null;
    }

    // Ensure container is empty before rendering
    el.innerHTML = "";

    // Resolve callback functions from data attributes (optional but recommended)
    var cbName = el.getAttribute("data-callback");
    var expiredName = el.getAttribute("data-expired-callback");
    var errorName = el.getAttribute("data-error-callback");

    // Render explicitly with the theme that matches our site toggle
    turnstileWidgetId = window.turnstile.render(el, {
      sitekey: el.dataset.sitekey,
      theme: theme, // "light" or "dark"
      callback: safeFn(cbName) || undefined,
      "expired-callback": safeFn(expiredName) || undefined,
      "error-callback": safeFn(errorName) || undefined
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

    // Sync Turnstile with the effective theme
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

    // If user is on "system", react to OS theme changes live
    if (window.matchMedia) {
      var mql = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () {
        if (current === "system") apply("system");
      };

      if (typeof mql.addEventListener === "function") mql.addEventListener("change", onChange);
      else if (typeof mql.addListener === "function") mql.addListener(onChange);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();

    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.addEventListener("click", function () {
      current = cycle();
      apply(current);

      if (current === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, current);
    });
  });
})();
