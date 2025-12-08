// /assets/contact.js
// Lazy-loaded Cloudflare Turnstile + contact form handler

(() => {
  "use strict";

  const TURNSTILE_SITE_KEY = "0x4AAAAAACFOR78WSLkw_gB7";

  const form = document.querySelector("#contact-form");
  if (!form) return;

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const companyInput = form.querySelector('input[name="company"]');
  const messageInput = form.querySelector('textarea[name="message"]');
  const consentInput = form.querySelector('input[name="consent"]');
  const honeypotInput = form.querySelector('input[name="hp_contact"]'); // hidden via CSS
  const statusBar = document.querySelector("#contact-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  let isSubmitting = false;
  let turnstilePromise = null;

  // ---- Helpers -------------------------------------------------------------

  function setStatus(message, type) {
    if (!statusBar) return;
    statusBar.textContent = message;
    statusBar.classList.remove("is-error", "is-success", "is-info");
    if (type) statusBar.classList.add(`is-${type}`);
  }

  function clearStatus() {
    if (!statusBar) return;
    statusBar.textContent = "";
    statusBar.classList.remove("is-error", "is-success", "is-info");
  }

  function setSubmittingState(submitting) {
    if (!submitBtn) return;
    if (submitting) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending…";
    } else {
      submitBtn.disabled = false;
      if (submitBtn.dataset.originalText) {
        submitBtn.textContent = submitBtn.dataset.originalText;
      }
    }
  }

  function validateForm() {
    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const message = (messageInput?.value || "").trim();

    if (!name || !email || !message) {
      setStatus("Please fill in your name, email, and message.", "error");
      return false;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      return false;
    }

    if (consentInput && !consentInput.checked) {
      setStatus(
        "Please confirm that we may contact you about your request.",
        "error"
      );
      return false;
    }

    // Honeypot: should remain empty; if not, silently pretend it worked.
    if (honeypotInput && honeypotInput.value.trim() !== "") {
      setStatus(
        "Thanks! If this was a real request, we will get back to you shortly.",
        "success"
      );
      return false;
    }

    return true;
  }

  // ---- Turnstile lazy loader ----------------------------------------------

  function loadTurnstileScript() {
    if (window.turnstile) {
      return Promise.resolve(window.turnstile);
    }
    if (turnstilePromise) return turnstilePromise;

    turnstilePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.turnstile) {
          resolve(window.turnstile);
        } else {
          reject(
            new Error("Turnstile loaded but window.turnstile is missing.")
          );
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load Turnstile security script."));
      };

      document.head.appendChild(script);
    });

    return turnstilePromise;
  }

  function ensureTurnstileContainer() {
    let container = document.querySelector("#cf-turnstile-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "cf-turnstile-container";
      container.style.display = "none"; // invisible, no layout shift
      form.appendChild(container);
    }
    return container;
  }

  function getTurnstileToken(turnstile) {
    const container = ensureTurnstileContainer();

    return new Promise((resolve, reject) => {
      let widgetId = container.dataset.widgetId;

      const options = {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "auto",
        size: "invisible",
        callback(token) {
          resolve(token);
        },
        "error-callback"() {
          reject(
            new Error("Security verification failed. Please try again.")
          );
        },
        "timeout-callback"() {
          reject(
            new Error("Security verification timed out. Please try again.")
          );
        }
      };

      if (!widgetId) {
        widgetId = turnstile.render(container, options);
        container.dataset.widgetId = widgetId;
      } else {
        // Trigger a new challenge; callback will fire again
        turnstile.reset(widgetId);
      }
    });
  }

  // ---- Submit handler ------------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    clearStatus();

    if (!validateForm()) {
      return;
    }

    isSubmitting = true;
    setSubmittingState(true);
    setStatus("Checking security…", "info");

    try {
      const turnstile = await loadTurnstileScript();
      const token = await getTurnstileToken(turnstile);

      setStatus("Sending your request…", "info");

      const payload = {
        name: nameInput?.value.trim() || "",
        email: emailInput?.value.trim() || "",
        company: companyInput?.value.trim() || "",
        message: messageInput?.value.trim() || "",
        consent: !!(consentInput && consentInput.checked),
        turnstileToken: token
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const msg =
          data && data.error
            ? String(data.error)
            : "We could not send the email right now. Please try again later.";
        console.error("Contact API error:", data);
        setStatus(msg, "error");
      } else {
        setStatus("Thanks! We will get back to you shortly.", "success");
        form.reset();
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus(
        err && err.message
          ? err.message
          : "Something went wrong while sending your request. Please try again.",
        "error"
      );
    } finally {
      isSubmitting = false;
      setSubmittingState(false);
    }
  }

  form.addEventListener("submit", handleSubmit);
})();
