
  /* Highlight active TOC link on scroll */
  (function () {
    var links = document.querySelectorAll(".v2-trust-toc-list a");
    if (!links.length || !window.IntersectionObserver) return;

    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, a: a });
    });

    var active = null;
    function setActive(id) {
      if (active === id) return;
      active = id;
      links.forEach(function (a) { a.classList.remove("active"); });
      var found = sections.find(function (s) { return s.id === id; });
      if (found) found.a.classList.add("active");
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-20% 0px -70% 0px" });

    sections.forEach(function (s) { obs.observe(s.el); });
  })();
  