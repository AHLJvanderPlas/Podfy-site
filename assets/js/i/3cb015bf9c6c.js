
  /* Fill all locale-rendered sections after content.js fires */
  document.addEventListener('DOMContentLoaded', function() {
    var d = window.vsScanAppsContent;
    if (!d) return;

    function setText(id, txt) { var el=document.getElementById(id); if(el) el.textContent=txt; }
    function setHTML(id, html) { var el=document.getElementById(id); if(el) el.innerHTML=html; }

    /* Context */
    setText('vs-ctx-h', d.context.heading);
    setHTML('vs-ctx-body', d.context.body.map(function(p){return '<p>'+p+'</p>';}).join(''));
    setHTML('vs-ctx-list', d.context.checklist.map(function(i){return '<li>'+i+'</li>';}).join(''));

    /* Table heading + note */
    setText('vs-tbl-h', 'Side-by-side comparison');
    setText('vs-tbl-note', 'All rows are about collecting a signed document from a third party. This is not a scan quality comparison.');

    /* When scan */
    setText('vs-ws-h', d.whenScan.heading);
    setHTML('vs-ws-body', '<p>'+d.whenScan.body+'</p><p><strong>'+d.whenScan.listLabel+'</strong></p>');
    setHTML('vs-ws-list', d.whenScan.items.map(function(i){return '<li>'+i+'</li>';}).join(''));

    /* FAQ heading */
    setText('vs-faq-h', 'FAQ');

    /* Related heading */
    setText('vs-rel-h', d.related.heading);

    /* CTA */
    setText('vs-stamp', d.cta.stamp);
    setHTML('vs-cta-h', d.cta.heading+'<br><em>'+d.cta.headingEm+'</em>');
    setText('vs-cta-body', d.cta.body);
    setHTML('vs-cta-actions',
      '<a href="'+d.cta.primary.href+'" class="v2-btn v2-btn-primary">'+d.cta.primary.label+' &rarr;</a>'+
      '<a href="'+d.cta.secondary.href+'" class="v2-btn v2-btn-ghost">'+d.cta.secondary.label+'</a>'
    );
  });
  window.addEventListener('scroll', function(){
    var p=window.scrollY/(document.body.scrollHeight-window.innerHeight);
    var el=document.getElementById('v2-progress');
    if(el) el.style.width=Math.min(p*100,100)+'%';
  });
  