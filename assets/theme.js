(function () {
  var STORAGE_KEY = "podfy-theme";
  var root = document.documentElement;
  var current = "system";

  function getSystemMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function apply(mode) {
    var effective = mode === "system" ? getSystemMode() : mode;
    root.setAttribute("data-theme", effective);

    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.dataset.mode = mode;

    var label = btn.querySelector(".site-theme-label");
    if (label) label.textContent =
      mode === "system" ? "System" :
      mode === "light"  ? "Light"  :
                          "Dark";
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
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    init();

    btn.addEventListener("click", function () {
      current = cycle();
      apply(current);
      if (current === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, current);
    });
  });
})();
