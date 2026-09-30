// instructions-bind.js — buttons on /instructions/ (replaces inline onclick="", forbidden by the CSP).
// Only these page functions can be triggered.
const ACTIONS = new Set(["unlock", "lockOut", "loadCompanies"]);
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  const fn = el && el.dataset.action;
  if (ACTIONS.has(fn) && typeof window[fn] === "function") window[fn]();
});
