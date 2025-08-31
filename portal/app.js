// portal/app.js
(function () {
  const $ = (id) => document.getElementById(id);

  const loginEl = $("login");
  const appEl = $("app");
  const signinBtn = $("signin");
  const refreshBtn = $("refresh");
  const logoutBtn = $("logout");
  const loginMsg = $("loginMsg");
  const rowsEl = $("rows");
  const statusEl = $("status");
  const moreBtn = $("more");

  let cursor = null;

  function setMsg(kind, heading, details) {
    loginMsg.className = kind === "error" ? "err" : "ok";
    loginMsg.classList.remove("hidden");
    loginMsg.innerHTML = `<strong>${heading}</strong>${details ? "<br>" + details : ""}`;
  }

  function clearMsg() {
    loginMsg.classList.add("hidden");
    loginMsg.textContent = "";
  }

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

  async function login() {
    clearMsg();
    const email = $("email").value.trim();
    const password = $("password").value;
    if (!email || !password) {
      setMsg("error", "Missing required fields", "Please fill in email and password.");
      return;
    }
    signinBtn.disabled = true;

    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        const status = res.status;
        const code = data.code || "unknown_error";
        const err = data.error || (text || "Login failed");
        const extra = data.missing ? `Missing fields: ${data.missing.join(", ")}` : (data.hint || "");
        setMsg("error", `Login failed (${status} / ${code})`, [err, extra].filter(Boolean).join("<br>"));
        return;
      }

      setMsg("ok", "Login successful", "");
      loginEl.classList.add("hidden");
      appEl.classList.remove("hidden");
      await load(true);
    } catch (e) {
      setMsg("error", "Network or client error", String(e?.message || e || "unknown"));
    } finally {
      signinBtn.disabled = false;
    }
  }

  async function logout() {
    try { await fetch("/api/portal/logout", { method: "POST" }); } catch {}
    rowsEl.innerHTML = "";
    appEl.classList.add("hidden");
    loginEl.classList.remove("hidden");
    setMsg("ok", "Signed out", "");
  }

  async function load(reset=false) {
    statusEl.textContent = "Loading…";
    if (reset) { rowsEl.innerHTML = ""; cursor = null; }
    const q = $("search").value.trim();
    const url = new URL("/api/portal/list", window.location.origin);
    if (q) url.searchParams.set("q", q);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), { headers: { "Accept": "application/json" }});
    if (res.status === 401) {
      await logout();
      setMsg("error", "Session expired or unauthorized", "Please sign in again.");
      return;
    }
    const data = await res.json().catch(() => ({ items: [], cursor: null }));
    render(data.items || []);
    cursor = data.cursor;
    statusEl.textContent = data.items?.length ? `Loaded ${data.items.length} items` : "No items found";
    moreBtn.disabled = !cursor;
  }

  // Wire up events once DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    signinBtn.addEventListener("click", login);
    logoutBtn.addEventListener("click", logout);
    $("refresh").addEventListener("click", () => load(true));
    $("more").addEventListener("click", () => load(false));
  });
})();
