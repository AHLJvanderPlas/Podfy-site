
        document.addEventListener('DOMContentLoaded', function(){
          var links = [
            ['#scan-vs-collect', document.getElementById('vs-ctx-h')],
            ['#comparison',      document.getElementById('vs-tbl-h')],
            ['#when-scan-apps-win', document.getElementById('vs-ws-h')],
            ['#faq',             document.getElementById('vs-faq-h')],
          ];
          var ul = document.getElementById('vs-toc');
          if (!ul) return;
          links.forEach(function(pair) {
            if (!pair[1]) return;
            var li = document.createElement('li');
            var a  = document.createElement('a');
            a.className = 'v2-toc-pill';
            a.href = pair[0];
            a.textContent = pair[1].textContent;
            li.appendChild(a);
            ul.appendChild(li);
          });
        });
        