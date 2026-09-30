
  (function () {
    var API = "/api/releases";
    var PAGE_SIZE = 20;

    var allEntries = [];
    var totalEntries = 0;
    var currentPage = 1;
    var totalPages = 1;
    var currentFilter = "";

    var loadingEl  = document.getElementById("changelog-loading");
    var emptyEl    = document.getElementById("changelog-empty");
    var errorEl    = document.getElementById("changelog-error");
    var metaEl     = document.getElementById("changelog-meta");
    var entriesEl  = document.getElementById("changelog-entries");
    var searchEl   = document.getElementById("changelog-search");
    var paginEl    = document.getElementById("changelog-pagination");
    var prevBtn    = document.getElementById("changelog-prev");
    var nextBtn    = document.getElementById("changelog-next");
    var pageInfoEl = document.getElementById("changelog-page-info");

    function esc(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function toListItems(text) {
      if (!text) return "";
      return text
        .split(/\r?\n/)
        .map(function (l) { return l.trim(); })
        .filter(Boolean)
        .map(function (l) { return "<li>" + esc(l) + "</li>"; })
        .join("");
    }

    function tagsFrom(str) {
      if (!str) return [];
      return str.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    }

    function renderEntries(list) {
      if (!list.length) {
        entriesEl.innerHTML = "";
        return;
      }

      entriesEl.innerHTML = list.map(function (r) {
        var tags = tagsFrom(r.area_tags);
        var tagsHtml = tags.map(function (t) {
          return '<span class="v2-changelog-tag">' + esc(t) + "</span>";
        }).join(" ");

        var newItems = toListItems(r.new_features);
        var fixItems = toListItems(r.fixes);

        var newCol = newItems
          ? '<div class="v2-changelog-col"><p class="v2-changelog-col-label">New</p><ul>' + newItems + "</ul></div>"
          : "";
        var fixCol = fixItems
          ? '<div class="v2-changelog-col"><p class="v2-changelog-col-label">Fixes</p><ul>' + fixItems + "</ul></div>"
          : "";

        var bodyHtml = (newCol || fixCol)
          ? '<div class="v2-changelog-body">' + newCol + fixCol + "</div>"
          : "";

        var buildRef = r.deployment_ref
          ? ' &middot; Build: <span data-u="u2a1f67e">' + esc(r.deployment_ref) + "</span>"
          : "";

        return [
          '<article class="v2-changelog-entry" id="v-' + esc(r.version || "").replace(/[^0-9a-z]/gi, "-") + '">',
            '<div class="v2-changelog-meta">',
              '<span class="v2-changelog-date">' + esc(r.release_date || "") + '</span>',
              r.version ? '<span class="v2-changelog-version">' + esc(r.version) + '</span>' : "",
              tagsHtml,
              '<span data-u="u09e80d3">' + buildRef + "</span>",
            '</div>',
            bodyHtml,
          '</article>'
        ].join("");
      }).join("");
    }

    function updatePagination() {
      if (!paginEl) return;
      if (totalEntries <= PAGE_SIZE && currentPage === 1) {
        paginEl.style.display = "none";
        return;
      }
      paginEl.style.display = "flex";
      if (pageInfoEl) pageInfoEl.textContent = "Page " + currentPage + " of " + (totalPages || 1);
      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    function applyFilter(filter) {
      filter = (typeof filter === "string" ? filter : currentFilter).toLowerCase().trim();
      currentFilter = filter;

      var filtered = allEntries.filter(function (r) {
        if (!filter) return true;
        var blob = [r.version, r.release_date, r.deployment_ref, r.fixes, r.new_features, r.area_tags]
          .join(" ").toLowerCase();
        return blob.indexOf(filter) !== -1;
      });

      loadingEl.style.display = "none";

      if (!filtered.length) {
        emptyEl.style.display = "block";
        entriesEl.innerHTML = "";
        if (metaEl) metaEl.textContent = "No results on page " + currentPage + " of " + (totalPages || 1) + ".";
        updatePagination();
        return;
      }

      emptyEl.style.display = "none";
      if (metaEl) metaEl.textContent = filtered.length + " of " + totalEntries + " releases (page " + currentPage + " of " + (totalPages || 1) + ")";

      renderEntries(filtered);
      updatePagination();
    }

    function loadPage(page) {
      currentPage = page || 1;
      loadingEl.style.display = "block";
      emptyEl.style.display = "none";
      errorEl.style.display = "none";
      entriesEl.innerHTML = "";

      fetch(API + "?page=" + currentPage + "&pageSize=" + PAGE_SIZE)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          allEntries = data.items || [];
          totalEntries = data.total || allEntries.length;
          totalPages = data.totalPages || 1;
          currentPage = data.page || currentPage;
          applyFilter(currentFilter);
        })
        .catch(function () {
          loadingEl.style.display = "none";
          errorEl.style.display = "block";
          if (metaEl) metaEl.textContent = "Unable to load.";
        });
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        applyFilter(searchEl.value || "");
      });
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { if (currentPage > 1) loadPage(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { if (currentPage < totalPages) loadPage(currentPage + 1); });

    loadPage(1);
  })();
  