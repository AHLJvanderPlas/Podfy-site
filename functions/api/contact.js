// /assets/contact.js
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const tokenInput = document.getElementById("cf_turnstile_token");

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    // optional hook for styling via [data-status]
    if (type) {
      statusEl.dataset.status = type;
    } else {
      delete statusEl.dataset.status;
    }
  }

  // ---- Turnstile callbacks (referenced from data-* attributes) ----

  // Called when Turnstile successfully issues a token
  window.onTurnstileCompleted = function (token) {
    if (tokenInput) {
      tokenInput.value = token || "";
    }
  };

  // Called when Turnstile hit an error
  window.onTurnstileError = function () {
    if (tokenInput) tokenInput.value = "";
    setStatus(
      "Security check failed. Please reload the page and try again.",
      "error"
    );
  };

  // Called when the token expires
  window.onTurnstileExpired = function () {
    if (tokenInput) tokenInput.value = "";
  };

  // ---- Form submit handler ----

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Let the browser highlight missing required fields
    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }

    // Ensure we actually have a token from Turnstile
    if (!tokenInput || !tokenInput.value) {
      setStatus(
        "Missing Turnstile token. Please wait for the security check and then try again.",
        "error"
      );
      // try to reset the widget so it can re-issue a token
      try {
        if (window.turnstile) {
          window.turnstile.reset();
        }
      } catch (_) {}
      return;
    }

    const originalLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }
    setStatus("Sending...", "info");

    try {
      // FormData will include cf_turnstile_token because of the hidden input
      const formData = new FormData(form);

      // make absolutely sure the value matches the latest token
      formData.set("cf_turnstile_token", tokenInput.value);

      const payload = Object.fromEntries(formData.entries());

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        // backend might return plain text – ignore JSON errors
      }

      const ok = res.ok && (!data || data.ok !== false);

      if (!ok) {
        const msg =
          (data && (data.error || data.message)) ||
          "We could not send the email right now. Please try again later.";
        setStatus(msg, "error");

        // reset token so the user gets a fresh challenge
        if (tokenInput) tokenInput.value = "";
        try {
          if (window.turnstile) {
            window.turnstile.reset();
          }
        } catch (_) {}
        return;
      }

      setStatus(
        "Thanks! If this was a real request, we will get back to you shortly.",
        "success"
      );
      form.reset();

      // clear token + reset widget after a successful send
      if (tokenInput) tokenInput.value = "";
      try {
        if (window.turnstile) {
          window.turnstile.reset();
        }
      } catch (_) {}
    } catch (err) {
      console.error("Contact form error", err);
      setStatus(
        "We could not send the email right now. Please try again later.",
        "error"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
})();
