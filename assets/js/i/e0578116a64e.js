
  const HASH = "96a67fef8cc3b05cf7c2e3da71889a97c0ddf0c4a18e4a9a66e9e2882a26e37b"; // sha256 of "Podfy2026!"

  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function unlock() {
    const pw = document.getElementById("lock-pw").value;
    const h = await sha256(pw);
    if (h === HASH) {
      sessionStorage.setItem("pod_inst", "1");
      show();
    } else {
      document.getElementById("lock-err").style.display = "block";
    }
  }

  function show() {
    document.getElementById("lock").style.display = "none";
    document.getElementById("content").style.display = "block";
  }

  function lockOut() {
    sessionStorage.removeItem("pod_inst");
    document.getElementById("content").style.display = "none";
    document.getElementById("lock").style.display = "flex";
    document.getElementById("lock-pw").value = "";
  }

  // Allow Enter key
  document.getElementById("lock-pw")?.addEventListener("keydown", e => {
    if (e.key === "Enter") unlock();
  });

  // Auto-unlock if session is valid
  if (sessionStorage.getItem("pod_inst") === "1") show();

  // ── Changelog form ──────────────────────────────────────────────
  // Pre-fill today's date
  (function () {
    var d = document.getElementById("f-date");
    if (d) d.value = new Date().toISOString().slice(0, 10);
  })();

  document.getElementById("release-form")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("release-btn");
    var res = document.getElementById("release-result");
    btn.disabled = true;
    res.textContent = "Submitting…";
    res.className = "f-result";

    // Collect checked tags + custom tags
    var checked = [...document.querySelectorAll(".tags-row input:checked")].map(el => el.value);
    var custom = (document.getElementById("f-tags-custom").value || "")
                  .split(",").map(t => t.trim()).filter(Boolean);
    var tags = [...new Set([...checked, ...custom])].join(",");

    try {
      var r = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth:           HASH,
          release_date:   document.getElementById("f-date").value,
          version:        document.getElementById("f-version").value.trim(),
          deployment_ref: document.getElementById("f-ref").value.trim(),
          new_features:   document.getElementById("f-features").value.trim(),
          fixes:          document.getElementById("f-fixes").value.trim(),
          area_tags:      tags,
          is_published:   document.getElementById("f-published").checked,
        }),
      });
      var data = await r.json();
      if (data.success) {
        res.textContent = "✓ Added, entry id " + data.id + ". Visible on /changelog immediately.";
        res.className = "f-result ok";
        e.target.reset();
        document.getElementById("f-date").value = new Date().toISOString().slice(0, 10);
      } else {
        res.textContent = "Error: " + (data.error || "Unknown error");
        res.className = "f-result err";
      }
    } catch (err) {
      res.textContent = "Network error: " + err.message;
      res.className = "f-result err";
    }
    btn.disabled = false;
  });

  // ── Companies viewer ────────────────────────────────────────────
  var _companies = [];
  var HEX_RE  = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  var RGB_RE  = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;
  var RGBA_RE = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)$/i;
  var HSL_RE  = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i;
  function isColor(v) { return typeof v === "string" && (HEX_RE.test(v)||RGB_RE.test(v)||RGBA_RE.test(v)||HSL_RE.test(v)); }
  function hexToRgb(h) { h = h.replace("#",""); if(h.length===3)h=[...h].map(c=>c+c).join(""); var n=parseInt(h,16); return{r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
  function lumFromRgb(c) { var s=[c.r,c.g,c.b].map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);}); return .2126*s[0]+.7152*s[1]+.0722*s[2]; }
  function bestText(bg) { var rgb=hexToRgb(HEX_RE.test(bg)?bg:"#888"); return lumFromRgb(rgb)>.4?"#111":"#fff"; }

  function flatObj(obj, pre, out) {
    out = out||{}; pre = pre||"";
    Object.entries(obj||{}).forEach(function([k,v]){
      var key = pre?pre+"."+k:k;
      if(v&&typeof v==="object"&&!Array.isArray(v)) flatObj(v,key,out); else out[key]=v;
    });
    return out;
  }
  var CO_HIDDEN = new Set(["logo","favicon","mailTo","__logoAbs","__faviconAbs","email_recipients","notes_internal"]);
  function renderCompanies() {
    var q = (document.getElementById("co-search")?.value||"").toLowerCase();
    var rows = _companies.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
    var cols = [];
    var seen = new Set();
    rows.forEach(r=>Object.keys(r).forEach(k=>{if(!CO_HIDDEN.has(k)&&k.toLowerCase()!=="mailto"&&!seen.has(k)){seen.add(k);cols.push(k);}}));
    cols.sort(function(a,b){
      var s=function(k){return k==="slug"?-999:k.match(/name|brand/i)?-900:k.match(/color/i)?-800:0;};
      return s(a)-s(b)||a.localeCompare(b);
    });
    var tbl = document.getElementById("co-tbl");
    tbl.querySelector("thead").innerHTML = "<tr>"+cols.map(c=>"<th>"+c+"</th>").join("")+"</tr>";
    tbl.querySelector("tbody").innerHTML = rows.map(function(r){
      return "<tr>"+cols.map(function(c){
        var v = r[c];
        if(isColor(v)){
          var txt=bestText(v);
          return '<td class="color-cell" data-u="'+sty('background:'+v+';color:'+txt)+'"><code>'+v+'</code></td>';
        }
        if(v&&typeof v==="object"){try{v=JSON.stringify(v);}catch(e){v=String(v);}}
        if(v==null)v="";
        return "<td>"+String(v)+"</td>";
      }).join("")+"</tr>";
    }).join("");
    document.getElementById("co-status").textContent = rows.length+" compan"+(rows.length===1?"y":"ies")+" shown";
  }
  async function loadCompanies() {
    document.getElementById("co-status").textContent = "Loading…";
    try {
      throw new Error("moved to admin.podfy.net → Brands");
      var json = [];
      _companies = Array.isArray(json)
        ? json.map(function(row){return flatObj(row);})
        : Object.entries(json).map(function([slug,cfg]){return flatObj(Object.assign({slug},cfg));});
      renderCompanies();
    } catch(err) {
      document.getElementById("co-status").textContent = "Could not load: "+(err.message||err);
    }
  }
  document.getElementById("co-search")?.addEventListener("input", function(){renderCompanies();});
  // Load companies after unlock
  var _origShow = show;
  show = function(){ _origShow(); loadCompanies(); };
  if (sessionStorage.getItem("pod_inst") === "1") loadCompanies();
