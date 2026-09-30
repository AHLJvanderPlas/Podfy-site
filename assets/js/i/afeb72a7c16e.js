
  /* Subscription form */
  (function () {
    function onSubTurnstileCompleted(token) {
      var el = document.getElementById("sub-turnstile-token");
      if (el) el.value = token;
      var btn = document.getElementById("sub-btn");
      if (btn) btn.disabled = false;
    }
    window.onSubTurnstileCompleted = onSubTurnstileCompleted;

    var form    = document.getElementById("sub-form");
    var btn     = document.getElementById("sub-btn");
    var errorEl = document.getElementById("sub-error");
    var success = document.getElementById("sub-success");

    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (document.getElementById("sub-email") || {}).value || "";
      var name  = (document.getElementById("sub-name")  || {}).value || "";
      var token = (document.getElementById("sub-turnstile-token") || {}).value || "";
      var hp    = (document.getElementById("hp_sub") || {}).value || "";

      if (!email) {
        showError("Please enter your email address.");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Sending\u2026";
      if (errorEl) errorEl.style.display = "none";

      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, hp_sub: hp, cf_turnstile_token: token }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) {
            form.style.display = "none";
            if (success) success.style.display = "block";
          } else {
            showError(data.error || "Something went wrong. Please try again.");
            btn.disabled = false;
            btn.textContent = "Yes please \u2192";
          }
        })
        .catch(function () {
          showError("Unable to subscribe right now. Please try again.");
          btn.disabled = false;
          btn.textContent = "Yes please \u2192";
        });
    });

    function showError(msg) {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
      }
    }
  })();
  