// /insights list page script (was inline; server values come from #insights-data)
const __D = JSON.parse(document.getElementById("insights-data").textContent);
function onNlTurnstile(token) { document.getElementById("nl-turnstile-token").value = token; }
function esc(s) { return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtDate(unix) {
  if (!unix) return "";
  return new Date(unix * 1000).toLocaleDateString(__D.dateLocale, { day: "numeric", month: "short", year: "numeric" });
}

(function () {
  var pageLang = __D.lang;
  var sel = document.getElementById("nl-lang");
  if (sel && sel.querySelector('option[value="' + pageLang + '"]')) sel.value = pageLang;
})();

// Posts already resolved server-side in the requested language — no
// fetch needed; the filter below re-renders this same data client-side.
var ALL_POSTS = __D.posts;
var PAGE_LANG = __D.lang;
var READ_MORE = __D.readMore;
var NO_MATCH = __D.noMatch;
var RESULT_WORD = __D.result, RESULTS_WORD = __D.results;
// Subject keyword fallback only fires for posts authored before the
// 'category' column existed (English titles at the time) — every
// current post has 'category' set explicitly and skips this entirely.
var SUBJECTS = {
  cmr:        /\b(e-?cmr|cmr|consignment|waybill|vrachtbrief|proof of delivery|pod\b)/i,
  regulation: /\b(regulation|rules?|law|compliance|efti|tachograph|mobility package|ban|verordening|mandat)/i,
  capacity:   /\b(capacity|driver shortage|shortage|market|rates?|volumes?|freight|crunch)/i,
  costs:      /\b(fuel|diesel|toll|maut|tax|costs?|price)/i,
  disruption: /\b(safety|strike|protest|congestion|closure|disruption|roadworks|delay)/i,
  digital:    /\b(digital|digitis|digitiz|ai\b|automation|data|platform|app\b)/i,
};
function cardHtml(p) {
  var url = "/insights/article?slug=" + encodeURIComponent(p.slug) + (PAGE_LANG === "en" ? "" : "&lang=" + PAGE_LANG);
  return '<article class="ins-card">' +
    '<a href="' + url + '" class="ins-card-img" aria-hidden="true" tabindex="-1">' +
      (p.cover_image_key ? '<img src="/api/insights/cover/' + encodeURIComponent(p.id) + '" alt="" loading="lazy">' : '') +
    '</a>' +
    '<div class="ins-card-body">' +
      '<div class="ins-card-meta">' + fmtDate(p.published_at) + '</div>' +
      '<h3><a href="' + url + '">' + esc(p.title) + '</a></h3>' +
      (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') +
      '<a href="' + url + '" class="ins-read">' + READ_MORE + '</a>' +
    '</div></article>';
}
function renderPosts() {
  var el = document.getElementById("insights-posts");
  var q = document.getElementById("flt-q").value.trim().toLowerCase();
  var subject = document.getElementById("flt-subject").value;
  var mode = document.getElementById("flt-mode").value;
  var d1 = document.getElementById("flt-d1").value ? Date.parse(document.getElementById("flt-d1").value) / 1000 : null;
  var d2 = document.getElementById("flt-d2").value ? Date.parse(document.getElementById("flt-d2").value) / 1000 + 86399 : null;
  var items = ALL_POSTS.filter(function (p) {
    var hay = (p.title + " " + (p.excerpt || "")).toLowerCase();
    if (q && hay.indexOf(q) === -1) return false;
    if (subject) {
      if (p.category) { if (p.category !== subject) return false; }
      else if (!SUBJECTS[subject].test(hay)) return false;
    }
    var t = p.published_at || 0;
    if (mode === "before" && d1 && t >= d1) return false;
    if (mode === "after" && d1 && t <= d1) return false;
    if (mode === "between") {
      if (d1 && t < d1) return false;
      if (d2 && t > d2) return false;
    }
    return true;
  });
  var active = !!(q || subject || (mode && (d1 || d2)));
  document.getElementById("flt-count").textContent = active
    ? items.length + " " + (items.length === 1 ? RESULT_WORD : RESULTS_WORD) : "";
  document.getElementById("flt-clear").style.display = active ? "" : "none";
  if (!items.length) { el.innerHTML = '<p data-u="u1993946">' + NO_MATCH + '</p>'; return; }
  el.innerHTML = '<div class="ins-grid">' + items.map(cardHtml).join("") + '</div>';
}
(function wireFilters() {
  var q = document.getElementById("flt-q"), timer;
  q.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(renderPosts, 250); });
  document.getElementById("flt-subject").addEventListener("change", renderPosts);
  document.getElementById("flt-mode").addEventListener("change", function () {
    var mode = this.value;
    document.getElementById("flt-d1").style.display = mode ? "" : "none";
    document.getElementById("flt-d2").style.display = mode === "between" ? "" : "none";
    renderPosts();
  });
  document.getElementById("flt-d1").addEventListener("change", renderPosts);
  document.getElementById("flt-d2").addEventListener("change", renderPosts);
  document.getElementById("flt-clear").addEventListener("click", function () {
    q.value = "";
    document.getElementById("flt-subject").value = "";
    document.getElementById("flt-mode").value = "";
    document.getElementById("flt-d1").value = ""; document.getElementById("flt-d1").style.display = "none";
    document.getElementById("flt-d2").value = ""; document.getElementById("flt-d2").style.display = "none";
    renderPosts();
  });
})();

document.getElementById("nl-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var msg = document.getElementById("nl-msg");
  msg.textContent = "…";
  fetch("/api/insights/subscribe", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("nl-email").value,
      lang: document.getElementById("nl-lang").value,
      frequency: document.getElementById("nl-freq").value,
      consent: document.getElementById("nl-consent").checked,
      hp_sub: document.getElementById("nl-hp").value,
      cf_turnstile_token: document.getElementById("nl-turnstile-token").value,
    }),
  }).then(r => r.json()).then(function (data) {
    if (data.ok && data.message === "already_subscribed") { msg.textContent = "✓"; }
    else if (data.ok) { msg.textContent = "✅"; document.getElementById("nl-form").reset(); }
    else { msg.textContent = data.error || "…"; }
  }).catch(function () { msg.textContent = "…"; });
});
