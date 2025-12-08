// /assets/contact.js
// Handles the homepage contact form + Cloudflare Turnstile token

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-status");
  const submitBtn = form.querySelector(".home-submit");

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message || "";
    }
  }

  function setSubmitting(isSubmitting) {
    if (submitBtn) {
      submitBtn.disabled = !!isSubmitting;
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    // Basic HTML5 validation first
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSubmitting(true);
    setStatus("Sending...");

    // Collect form data, including any hidden inputs
    const formData = new FormData(form);

    // Read Turnstile token. Cloudflare will inject a hidden input
    // named "cf-turnstile-response" into the form, or you may have
    // added it manually.
    const tokenInput =
      form.querySelector('input[name="cf-turnstile-response"]');
    let turnstileToken = tokenInput ? tokenInput.value : null;

    if (!turnstileToken) {
      // Fallback: if for some reason it was only in FormData
      const fdToken = formData.get("cf-turnstile-response");
      if (typeof fdToken === "string" && fdToken.length > 0) {
        turnstileToken = fdToken;
      }
    }

    if (!turnstileToken) {
      setStatus(
        "Security check failed. Please wait a moment and try again."
      );
      setSubmitting(false);
      return;
    }

    // Make sure the payload contains the exact key the Worker expects
    formData.set("cf-turnstile-response", turnstileToken);

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }

      if (!res.ok || !data || data.ok === false) {
        const msg =
          (data && data.error) ||
          "We could not send the email right now. Please try again later.";
        setStatus(msg);
      } else {
        setStatus(
          "Thanks! If this was a real request, we will get back to you shortly."
        );
        form.reset();

        // Clear honeypot, just in case
        const hp = form.querySelector("#hp_contact");
        if (hp) hp.value = "";
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus(
        "We could not send the email right now. Please try again later."
      );
    } finally {
      setSubmitting(false);

      // Reset Turnstile widget so the user can submit again
      if (window.turnstile && typeof window.turnstile.reset === "function") {
        try {
          window.turnstile.reset();
        } catch {
          // ignore
        }
      }
    }
  }

  form.addEventListener("submit", handleSubmit);
});
