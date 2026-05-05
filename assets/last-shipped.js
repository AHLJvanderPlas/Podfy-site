/* last-shipped.js
   Fetches the 3 most recent changelog entries and:
   1. Updates the trust belt "LAST SHIPPED …" link with the most recent date.
   2. Populates #v2-changelog-teaser with up to 3 entry cards.
*/
(function () {
  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function firstLine(text) {
    if (!text) return "";
    return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean)[0] || "";
  }

  function tagsHtml(areaTagsStr) {
    if (!areaTagsStr) return "";
    var tags = areaTagsStr.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    if (!tags.length) return "";
    return '<div class="v2-changelog-tags">' +
      tags.map(function (t) {
        return '<span class="v2-changelog-tag">' + esc(t) + "</span>";
      }).join("") +
      "</div>";
  }

  fetch("/api/releases?page=1&pageSize=3")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      var items = data.items || [];
      if (!items.length) return;

      // 1. Trust belt: most recent release date
      var shipped = document.getElementById("v2-last-shipped");
      if (shipped && items[0] && items[0].release_date) {
        shipped.textContent = items[0].release_date + " \u2192";
      }

      // 2. Changelog teaser
      var teaser = document.getElementById("v2-changelog-teaser");
      if (!teaser) return;

      teaser.innerHTML = items.map(function (r) {
        var desc = firstLine(r.new_features) || firstLine(r.fixes) || "";
        return (
          '<article class="v2-changelog-entry">' +
            '<time class="v2-changelog-date" datetime="' + esc(r.release_date) + '">' +
              esc(r.release_date) +
            "</time>" +
            tagsHtml(r.area_tags) +
            (desc
              ? '<p class="v2-changelog-desc">' + esc(desc) + "</p>"
              : "") +
          "</article>"
        );
      }).join("");
    })
    .catch(function () {
      // Silent fail — changelog teaser simply remains empty
    });
})();
