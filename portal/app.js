// /portal/app.js  — demo mode (no login required)

(function () {
  // DOM helpers
  const $ = (id) => document.getElementById(id);

  // Elements
  const searchInput = $("search");
  const refreshBtn  = $("refresh");
  const loadMoreBtn = $("more");
  const rowsEl      = $("rows");
  const statusEl    = $("status");

  // State
  let cursor = null;
  let isLoading = false;

  // Utils
  function fmtSize(n) {
    if (n === null || n === undefined) return "";
    const kb = n / 1024, mb = kb / 1024;
    if (mb >= 1) return mb.toFixed(2) + " MB";
    if (kb >= 1) return kb.toFixed(1) + " KB";
    return n + " B";
  }

  function fmtDate(d) {
    try { return d ? new Date(d).toLocaleString() : ""; }
    catch { return String(d || ""); }
  }

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function setLoading(loading) {
    isLoading = loading;
    refreshBtn.disabled = loading;
    loadMoreBtn.disabled = loading || !cursor;
    setStatus(loading ? "Loading…" : "");
  }

  function clearTable() {
    rowsEl.innerHTML = "";
  }

  function render(items) {
    const frag = document.createDocumentFragment();
    for (const it of items) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${it.key}</td>
        <td>${it.httpMetadata?.contentType || ""}</td>
        <td>${fmtSize(it.size)}</td>
        <td>${fmtDate(it.uploaded)}</td>
        <td><span class="badge">${it.customMetadata?.slug || ""}</span></td>
        <td>${it.customMetadata?.orig_name || ""}</td>
        <td>${it.customMetadata?.uploader_email || ""}</td>
        <td class="right">
          <a href="/api/portal/get?key=${encodeURIComponent(it.key)}" target="_blank" rel="noopener">View</a>
        </td>
      `;
      frag.appendChild(tr);
    }
    rowsEl.appendChild(frag);
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
    return { ok: res.ok, status: res.status, data, raw: text };
  }

  async function load(reset = false) {
    if (isLoading) return;
    setLoading(true);

    try {
      if (reset) {
        clearTable();
        cursor = null;
      }

      const q = searchInput.value.trim();
      const u = new URL("/api/portal/list", window.location.origin);
      if (q) u.searchParams.set("q", q);
      if (cursor) u.searchParams.set("cursor", cursor);

      const { ok, status, data, raw } = await fetchJson(u.toString());

      if (!ok) {
        setStatus(`Error ${status}: ${data?.error || raw || "Unknown error"}`);
        loadMoreBtn.disabled = true;
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      render(items);

      cursor = data.cursor || null;
      loadMoreBtn.disabled = !cursor;

      setStatus(items.length ? `Loaded ${items.length} item(s)` : (reset ? "No items found" : "No more items"));
    } catch (e) {
      setStatus(`Client error: ${String(e?.message || e)}`);
      loadMoreBtn.disabled = true;
    } finally {
      setLoading(false);
    }
  }

  // Event wiring
  document.addEventListener("DOMContentLoaded", () => {
    refreshBtn.addEventListener("click", () => load(true));
    loadMoreBtn.addEventListener("click", () => load(false));

    // Trigger search on Enter
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        load(true);
      }
    });

    // Initial load
    load(true);
  });
})();
