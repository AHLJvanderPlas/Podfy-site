/*
  /assets/vs-scan-apps-content.js
  Single source of truth for all copy on the /vs-scan-apps/ page.
  Edit here — the page renders from this data automatically.

  PRICE:     Replace the placeholder with Podfy's per-POD rate.
  TODO items are marked inline.
*/

(function () {
  'use strict';

  window.vsScanAppsContent = {

    /* ── Meta ─────────────────────────────────────────── */
    meta: {
      title:       'Podfy vs. free scan apps — Collect a CMR, not just a scan | PODFY',
      description: 'CamScanner and Adobe Scan are great at scanning your own paperwork. They do not help when the document is in someone else\'s hands. Here\'s the workflow difference.',
      canonical:   'https://podfy.net/vs-scan-apps/',
      keywords:    'proof of delivery alternative, CMR collection, afleverbewijs app, scan app vs POD, subcontractor delivery proof, CamScanner alternative logistics',
    },

    /* ── Hero section ─────────────────────────────────── */
    hero: {
      eyebrow: 'Podfy vs. scan apps',
      h1:      'Free apps are great at scanning your own paperwork.',
      h1em:    'The problem starts when the document is in someone else\'s hands.',
      sub:     'When a charter, subcontractor, or driver holds the signed CMR, you\'re chasing scans across email and WhatsApp before you can invoice. That\'s the gap Podfy closes.',
    },

    /* ── Context section ──────────────────────────────── */
    context: {
      heading: 'Scan vs. collect: two different problems',
      body: [
        'Scan apps solve a personal productivity problem: you have a document, you want a digital copy. They work beautifully for that. CamScanner, Adobe Scan, and the built-in camera apps are genuinely good tools when the paper is in your hand.',
        'Delivery proof is a different problem. The document — a signed CMR, a countersigned delivery note — is in the driver\'s hand, not yours. You cannot scan it. You have to ask someone else to send it back to you, and that process has to work reliably for every driver on every run, including subcontractors who work for five different principals and will not install your app.',
        'Podfy is a collection tool, not a scan tool. You send a link; the driver photographs the signed document at the gate; it lands in your portal with a GPS timestamp, archived and searchable. You never touch the paper.',
      ],
    },

    /* ── Comparison table ─────────────────────────────── */
    table: {
      caption: 'Comparison: collecting a signed delivery document from a third party',
      columns: [
        { key: 'label',      label: 'Factor'                                    },
        { key: 'scan',       label: 'Free scan apps',       sub: 'CamScanner · Adobe Scan · Genius Scan · built-in camera', class: 'v2-col-paper' },
        { key: 'whatsapp',   label: 'WhatsApp + email',     sub: 'The current default',                                     class: ''             },
        { key: 'podfy',      label: 'Podfy',                sub: 'Collection-first POD',                                    class: 'v2-col-digital' },
      ],
      rows: [
        {
          label:    'Cost',
          scan:     { text: 'Free / freemium',       note: 'Free tier adds watermarks or limits exports', type: 'neutral' },
          whatsapp: { text: 'Free',                  note: '',                                            type: 'neutral' },
          podfy:    { text: 'PRICE per POD',         note: 'No monthly fee, no seat cost',               type: 'positive' },
          // TODO: replace PRICE with the actual per-POD rate before publishing
        },
        {
          label:    'Who initiates the return',
          scan:     { text: 'Driver must remember to scan and send',           note: 'Nothing prompts them',   type: 'negative' },
          whatsapp: { text: 'Sender-initiated',                               note: 'Still relies on the driver acting', type: 'negative' },
          podfy:    { text: 'Hiring party sends a request link',              note: 'One tap for the driver',            type: 'positive' },
        },
        {
          label:    'Driver needs an app or account',
          scan:     { text: 'Yes, a scanner app installed',                   note: '',                        type: 'negative' },
          whatsapp: { text: 'Needs WhatsApp',                                note: 'Most have it, not all',    type: 'negative' },
          podfy:    { text: 'No app, no account',                            note: 'Opens a link in any browser', type: 'positive' },
        },
        {
          label:    'Where the document lands',
          scan:     { text: 'Wherever the driver mails it',                  note: 'Scatter into inboxes',     type: 'negative' },
          whatsapp: { text: 'In a chat thread',                              note: 'Buried and hard to export', type: 'negative' },
          podfy:    { text: 'Back to the requester, one archive',            note: 'Searchable by reference',   type: 'positive' },
        },
        {
          label:    'Manual forwarding to each party',
          scan:     { text: 'Yes',                                           note: '',                          type: 'negative' },
          whatsapp: { text: 'Yes',                                           note: '',                          type: 'negative' },
          podfy:    { text: 'No',                                            note: 'Returns automatically',     type: 'positive' },
        },
        {
          label:    'GPS + timestamp on the proof',
          scan:     { text: 'No',                                            note: '',                          type: 'negative' },
          whatsapp: { text: 'No',                                            note: 'Photo metadata only if enabled', type: 'negative' },
          podfy:    { text: 'Yes, captured at upload',                       note: 'Tamper-evident, server-side', type: 'positive' },
        },
        {
          label:    'One place for the hiring party',
          scan:     { text: 'No',                                            note: 'Scattered across email',    type: 'negative' },
          whatsapp: { text: 'No',                                            note: 'Buried in chats',           type: 'negative' },
          podfy:    { text: 'Yes',                                           note: 'Collected per request, per shipment', type: 'positive' },
        },
        {
          label:    'EU-hosted / GDPR',
          scan:     { text: 'Varies by provider',                            note: 'Check each app\'s data policy', type: 'neutral' },
          // TODO: verify current data-residency claims for CamScanner (CN parent company), Adobe Scan (US), Genius Scan (FR)
          whatsapp: { text: 'US-owned',                                      note: 'Meta; data may leave EU',   type: 'neutral' },
          podfy:    { text: 'EU-hosted',                                     note: 'Cloudflare WEUR, DPA available', type: 'positive' },
        },
      ],
    },

    /* ── "When scan apps are the right choice" ────────── */
    whenScan: {
      heading:   'When scan apps are the right choice',
      body:      'If the document is already in your hands and you need a quick digital copy, a free scan app is the right tool. They are fast, accurate, and genuinely good at what they do. We do not suggest replacing them for personal scanning workflows.',
      listLabel: 'Scan apps are the right tool when:',
      items: [
        'You received a paper document and need a digital copy for your own records',
        'You are scanning your own invoices, contracts, or purchase orders',
        'No third party needs to initiate or return anything',
      ],
    },

    /* ── FAQ ──────────────────────────────────────────── */
    faq: [
      {
        q: 'Can\'t I just ask drivers to use a scan app and email me?',
        a: 'You can, and many operations do. The problem is reliability: employed drivers may do it, subcontractors often do not. When a disputed delivery costs more than the freight charge, the missing scan matters. A request-link system means you control the trigger, not the driver.',
      },
      {
        q: 'Is Podfy better at scanning than CamScanner?',
        a: 'No, and that is not the comparison. CamScanner and similar apps are excellent at enhancing scan quality and processing your own documents. Podfy is built for a different job: collecting a signed document from someone who is not your employee, at a location you cannot control, on a phone you cannot manage.',
      },
      {
        q: 'What if the driver does not have a smartphone?',
        a: 'Any phone with a browser and a camera works, including basic Android devices from 2017. The upload page is a web form, not an app, so there is no minimum OS requirement beyond having a functioning camera browser.',
      },
      {
        q: 'Does Podfy store documents in the EU?',
        a: 'Yes. All data is stored in Cloudflare\'s EU-WEUR region (Amsterdam). A Data Processing Agreement is available on request.',
      },
      {
        q: 'What does GPS stamping actually prove?',
        a: 'The GPS coordinates are captured server-side when the file is received and cross-referenced with the device\'s reported location at the moment of upload. The record shows where the device was at the time of upload. It does not replace a signature, but it provides independent corroboration of delivery location that a scan app photo cannot.',
      },
    ],

    /* ── CTA ──────────────────────────────────────────── */
    cta: {
      stamp:    'No app · Any phone',
      heading:  'See how collection works',
      headingEm: 'in your next dispatch.',
      body:     'Open a real upload link on your phone. No account, no card. The full flow in 30 seconds.',
      primary:  { label: 'Try the live demo',   href: '/demo'    },
      secondary: { label: 'Or book 15 minutes', href: '/contact' },
    },

  };

  /* ── Rendering ────────────────────────────────────── */

  function check()  { return '<span class="v2-price-check" aria-label="Yes">✓</span>'; }
  function dash()   { return '<span class="v2-price-dash"  aria-label="No">—</span>';  }
  function cellIcon(type) {
    return type === 'positive' ? check() : type === 'negative' ? dash() : '';
  }

  function renderTable(data, rootEl) {
    var cols  = data.table.columns;
    var rows  = data.table.rows;

    var html = '';

    /* scroll wrapper — matches v2-price-table-wrap pattern */
    html += '<div class="v2-price-table-wrap">';
    html += '<table class="v2-comparison-table v2-vs-table" aria-label="' + data.table.caption + '">';

    /* thead */
    html += '<thead><tr>';
    cols.forEach(function (col) {
      var cls = col.class ? (' class="' + col.class + '"') : '';
      html += '<th scope="col"' + cls + '>';
      html += col.label;
      if (col.sub) html += '<br><span class="v2-vs-col-sub">' + col.sub + '</span>';
      html += '</th>';
    });
    html += '</tr></thead>';

    /* tbody */
    html += '<tbody>';
    rows.forEach(function (row) {
      html += '<tr>';
      /* first cell: row label */
      html += '<td class="v2-price-row-label">' + row.label + '</td>';
      /* data cells */
      ['scan', 'whatsapp', 'podfy'].forEach(function (key, idx) {
        var cell = row[key];
        var colCls = cols[idx + 1].class;
        var tdCls  = colCls ? (' class="' + colCls + '"') : '';
        html += '<td' + tdCls + '>';
        html += '<span class="v2-vs-cell-text">' + cell.text + '</span>';
        if (cell.note) html += ' <span class="v2-vs-cell-note">' + cell.note + '</span>';
        html += '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody>';
    html += '</table></div>';

    rootEl.innerHTML = html;
  }

  function renderFaq(data, rootEl) {
    var html = '<div class="v2-faq-accordion">';
    data.faq.forEach(function (item) {
      html += '<div class="v2-faq-acc-item">';
      html += '<button class="v2-faq-btn" type="button">' + item.q + '</button>';
      html += '<div class="v2-faq-answer"><p>' + item.a + '</p></div>';
      html += '</div>';
    });
    html += '</div>';
    rootEl.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var d = window.vsScanAppsContent;

    var tableRoot = document.getElementById('vs-table-root');
    if (tableRoot) renderTable(d, tableRoot);

    var faqRoot = document.getElementById('vs-faq-root');
    if (faqRoot) renderFaq(d, faqRoot);

    /* FAQ accordion toggle */
    document.querySelectorAll('.v2-faq-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.closest('.v2-faq-acc-item').classList.toggle('open');
      });
    });
  });

})();
