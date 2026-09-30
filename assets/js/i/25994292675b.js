
    /* Turnstile callbacks */
    function onTurnstileCompleted(token) {
      var el = document.getElementById("contact-turnstile-token");
      if (el) el.value = token;
    }
    function onTurnstileExpired() {
      var el = document.getElementById("contact-turnstile-token");
      if (el) el.value = "";
    }
    function onTurnstileError() {
      var el = document.getElementById("contact-turnstile-token");
      if (el) el.value = "";
    }

    /* Contact form submission */
    document.addEventListener("DOMContentLoaded", function () {
      var form    = document.getElementById("contact-form");
      var submit  = document.getElementById("contact-submit");
      var success = document.getElementById("contact-success");
      var errBanner = document.getElementById("contact-error");

      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        errBanner.style.display = "none";
        errBanner.textContent = "";

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var token = document.getElementById("contact-turnstile-token").value;
        if (!token) {
          showError("Bitte Sicherheitsprüfung abschließen, bevor Sie absenden.");
          return;
        }

        var data = {
          name:               (form.querySelector("#contact-name").value || "").trim(),
          email:              (form.querySelector("#contact-email").value || "").trim(),
          company:            (form.querySelector("#contact-company").value || "").trim(),
          sector:             (form.querySelector("#contact-sector").value || "").trim(),
          message:            (form.querySelector("#contact-message").value || "").trim(),
          consent:            form.querySelector("#contact-consent").checked,
          hp_contact:         (form.querySelector("#hp_contact").value || "").trim(),
          cf_turnstile_token: token,
        };

        submit.disabled = true;
        submit.textContent = "Senden\u2026";

        fetch("/api/contact", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(data),
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res.ok) {
              form.style.display = "none";
              var emailEl = document.getElementById("contact-success-email");
              if (emailEl) emailEl.textContent = data.email;
              success.style.display = "block";
            } else {
              showError(res.error || "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
              resetSubmit();
              if (window.turnstile && typeof window.turnstile.reset === "function") {
                window.turnstile.reset();
              }
            }
          })
          .catch(function () {
            showError("Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.");
            resetSubmit();
          });
      });

      function showError(msg) {
        errBanner.textContent = msg;
        errBanner.style.display = "block";
        // respect "reduce motion" (the CSS covers transitions; smooth scrolling is script-driven)
        errBanner.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
      }

      function resetSubmit() {
        submit.disabled = false;
        submit.textContent = "Nachricht senden \u2192";
      }
    });
  