
  /* Dynamic pricing — fills [data-price-key] spans from /api/pricing */
  (function () {
    function fmtPrice(n) {
      return '\u20ac' + Number(n).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    fetch('/api/pricing')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.items) return;
        var map = {};
        data.items.forEach(function (row) { map[row.plan_name.toLowerCase()] = row.default_price; });
        document.querySelectorAll('[data-price-key]').forEach(function (el) {
          var key = (el.getAttribute('data-price-key') || '').toLowerCase();
          if (key in map) el.textContent = fmtPrice(map[key]);
        });
      })
      .catch(function () { /* fallback text remains */ });
  })();
  