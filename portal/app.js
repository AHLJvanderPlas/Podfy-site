// portal/app.js – demo (no login)
(function () {
  const $ = (id) => document.getElementById(id);
  const rowsEl = $("rows");
  const statusEl = $("status");
  let cursor = null;

  function fmtSize(n) {
    if (n === null || n === undefined) return "";
    const kb = n / 1024, mb = kb / 1024;
    if (mb >= 1) return mb.toFixed(2) + " MB";
    if (kb >= 1) return kb.toFixed(1) + " KB";
    return n + " B";
  }
  function fmtDate(d) { try { return d ? new Date(d).toLocaleString() : ""; } catch { return String(d || ""); } }

  function render(items) {
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
        <td class="right"><a href="/api/portal/get?key=${encodeURIComponent(it.key)}" target="_blank" rel="noopener">View</a></td>
      `;
      rowsEl.appendChild(tr);
    }
  }

  async function load(reset=false) {
    statusEl.textContent = "Loading…";
    if (reset) { rowsEl.innerHTML = ""; cursor = null; }
    const q = $("search").value.trim();
    const url = new URL("/api/portal/list", window.location.origin);
    if (q) url.searchParams.set("q", q);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), { headers: { "Accept": "application/json" }});
    const data = await res.json().catch(() => ({ items: [], cursor: null }));
    render(data.items || []);
    cursor = data.cursor;
    statusEl.textContent = data.items?.length ? `Loaded ${data.items.length} items` : "No items found";
    $("more").disabled = !cursor;
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("refresh").addEventListener("click", () => load(true));
    $("more").addEventListener("click", () => load(false));
    load(true);
  });
})();
