
  (function(){
    var p = window.location.pathname;
    var lc = /^\/nl(\/|$)/.test(p) ? 'nl'
           : /^\/de(\/|$)/.test(p) ? 'de'
           : /^\/fr(\/|$)/.test(p) ? 'fr' : '';
    if (!lc) return;
    document.addEventListener('DOMContentLoaded', function(){
      ['primaryNav','mobileNav'].forEach(function(id){
        var nav = document.getElementById(id);
        if (!nav) return;
        nav.querySelectorAll('a[href="/pricing"]').forEach(function(a){
          a.setAttribute('href', '/' + lc + '/pricing');
        });
      });
    });
  })();
  