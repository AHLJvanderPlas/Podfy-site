(function () {
  var STORAGE_KEY = "podfy_site_theme"; // "light" | "dark" | null
  var root = document.documentElement;
  var currentMode = "system";

  function getSystemMode() {
    if (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function apply(mode) {
    // mode: "light" | "dark" | "system"
    var effective = mode === "system" ? getSystemMode() : mode;
    root.setAttribute("data-theme", effective);
    currentMode = mode;

    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    var label = btn.querySelector(".site-theme-label");
    btn.setAttribute("data-mode", mode);

    if (label) {
      if (mode === "light") label.textContent = "Light";
      else if (mode === "dark") label.textContent = "Dark";
      else label.textContent = "System";
    }
  }

  function loadInitial() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    if (stored === "light" || stored === "dark") {
      apply(stored);
    } else {
      apply("system");
    }
  }

  function cycleMode() {
    // system → light → dark → system
    if (currentMode === "system") return "light";
    if (currentMode === "light") return "dark";
    return "system";
  }

  loadInitial();

  window.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var next = cycleMode();
      currentMode = next;

      if (next === "system") {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      } else {
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      }

      apply(next);
    });
  });
})();
