
        document.addEventListener('DOMContentLoaded', function(){
          var d = window.vsScanAppsContent;
          if (!d) return;
          var h1 = document.getElementById('vs-heading');
          if (h1) h1.innerHTML = d.hero.h1 + '<br><em>' + d.hero.h1em + '</em>';
          var sub = document.getElementById('vs-sub');
          if (sub) sub.textContent = d.hero.sub;
        });
        