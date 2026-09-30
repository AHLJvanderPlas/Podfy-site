
    /* Reading progress bar */
    window.addEventListener('scroll', function () {
      var p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      var el = document.getElementById('v2-progress');
      if (el) el.style.width = Math.min(p * 100, 100) + '%';
    });
  