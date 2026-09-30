// subscribe-bind.js — newsletter forms: <form data-subscribe> calls the page's handleSubscribe(event)
// (replaces inline onsubmit="" handlers, which a strict Content-Security-Policy forbids).
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (f instanceof HTMLFormElement && f.hasAttribute("data-subscribe") && typeof window.handleSubscribe === "function") {
    window.handleSubscribe(e);
  }
});
