
    /* Populate last-shipped date in stat band + changelog teaser */
    (function () {
      function clFirstLine(text) {
        if (!text) return '';
        var lines = String(text).split('\n');
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i].trim().replace(/^[-\u00b7\u2022*]\s*/, '');
          if (l) return l;
        }
        return '';
      }

      document.addEventListener('DOMContentLoaded', function () {
        fetch('/api/releases?page=1&pageSize=3')
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) {
            /* Stat band: last-shipped date */
            var el = document.getElementById('v2-last-shipped-num');
            if (el && d && d.items && d.items[0] && d.items[0].release_date) {
              el.textContent = d.items[0].release_date;
            }

            /* Changelog teaser */
            var list = document.getElementById('cl-teaser-list');
            var section = document.getElementById('v2-changelog-teaser');
            if (!list || !section) return;
            var items = d && d.items;
            if (!items || !items.length) { section.style.display = 'none'; return; }
            var html = '';
            for (var i = 0; i < items.length; i++) {
              var rel = items[i];
              var summary = clFirstLine(rel.new_features) || clFirstLine(rel.fixes) || '';
              html += '<div class="v2-cl-teaser-row">'
                + '<span class="v2-cl-teaser-date">' + escHtml(rel.release_date || '') + '</span>'
                + '<span class="v2-cl-teaser-version">' + escHtml(rel.version || '') + '</span>'
                + '<span class="v2-cl-teaser-summary">' + escHtml(summary) + '</span>'
                + '</div>';
            }
            list.innerHTML = html;
          })
          .catch(function () {
            var section = document.getElementById('v2-changelog-teaser');
            if (section) section.style.display = 'none';
          });
      });

      function escHtml(s) {
        return String(s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
    })();
    