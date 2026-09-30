
    (function () {
      var BASE    = 'https://podfy.app/demo';
      var input   = document.getElementById('demo-ref-input');
      var preview = document.getElementById('demo-url-preview');
      var links   = document.querySelectorAll('[data-demo-link]');
      if (!input) return;

      function update() {
        var ref = input.value.replace(/[^A-Za-z0-9._-]/g, '').slice(0, 40);
        var url = ref ? BASE + '/' + encodeURIComponent(ref) : BASE;
        if (preview) preview.textContent = url.replace('https://', '');
        links.forEach(function (a) { a.href = url; });
      }
      input.addEventListener('input', update);

      var qrBtn = document.getElementById('demo-qr-toggle');
      var qrBox = document.getElementById('demo-qr');
      if (qrBtn && qrBox) {
        qrBtn.addEventListener('click', function () {
          var open = !qrBox.hasAttribute('hidden');
          if (open) { qrBox.setAttribute('hidden', ''); qrBtn.setAttribute('aria-expanded', 'false'); }
          else      { qrBox.removeAttribute('hidden');  qrBtn.setAttribute('aria-expanded', 'true'); }
        });
      }
    })();

    document.querySelectorAll('.v2-faq-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.v2-faq-acc-item');
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  