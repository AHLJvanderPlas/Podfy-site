
    /* Populate last-shipped date in stat band */
    (function () {
      fetch('/api/releases?limit=1')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var el = document.getElementById('v2-last-shipped-num');
          if (!el) return;
          var rel = d && d.releases && d.releases[0];
          if (rel && rel.release_date) el.textContent = rel.release_date;
        })
        .catch(function () {});
    })();
    