
  (function(){
    var bar = document.getElementById('v2-progress');
    if (!bar) return;
    function upd() {
      var s = document.documentElement, b = document.body;
      var h = s.scrollHeight - s.clientHeight || b.scrollHeight - b.clientHeight;
      var pct = h > 0 ? Math.round((s.scrollTop || b.scrollTop) / h * 100) : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', upd, {passive: true});
    upd();
  })();
  