/*
  /assets/vs-scan-apps-content.js
  Single source of truth for ALL copy on the /vs-scan-apps/ page in every locale.

  HOW TO EDIT
  -----------
  • Comparison data  → window.vsScanAppsContent.en.table.rows  (and locale copies)
  • Pricing          → uses data-price-key spans; price comes live from /api/pricing
  • Translate        → copy an 'en' block, change locale key, translate values
  • TODO markers     → search for "TODO:" to find items awaiting verification

  PRICING (auto-updated from Site_Pricing via /api/pricing)
  ---------
  Starter €0.55/POD · Advanced €0.79/POD · Pro €0.99/POD · Basic €0.10/POD
  The "from" price in the cost row uses data-price-key="starter" and is filled
  dynamically. The fallback text matches the current DB value.
*/

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
     CONTENT DATA — one object per locale
     ───────────────────────────────────────────────────────────────────────── */

  var CONTENT = {

    /* ══════════════════════════════════════════════════════════════════════
       ENGLISH
       ══════════════════════════════════════════════════════════════════════ */
    en: {
      meta: {
        title:       'Podfy vs. free scan apps — Collect a CMR, not just a scan | PODFY',
        description: 'CamScanner and Adobe Scan are great at scanning your own paperwork. They do not help when the document is in someone else\'s hands. Here\'s the workflow difference.',
        canonical:   'https://podfy.net/vs-scan-apps/',
        keywords:    'proof of delivery alternative, CMR collection, scan app vs POD, subcontractor delivery proof, CamScanner alternative logistics',
      },
      hero: {
        eyebrow: 'Podfy vs. scan apps',
        h1:      'Free apps are great at scanning your own paperwork.',
        h1em:    'The problem starts when the document is in someone else\'s hands.',
        sub:     'When a charter, subcontractor, or driver holds the signed CMR, you\'re chasing scans across email and WhatsApp before you can invoice. That\'s the gap Podfy closes.',
      },
      context: {
        heading: 'Scan vs. collect: two different problems',
        body: [
          'Scan apps solve a personal productivity problem: you have a document, you want a digital copy. They work beautifully for that. CamScanner, Adobe Scan, and the built-in camera apps are genuinely good tools when the paper is in your hand.',
          'Delivery proof is a different problem. The document — a signed CMR, a countersigned delivery note — is in the driver\'s hand, not yours. You cannot scan it. You have to ask someone else to send it back, and that process has to work reliably for every driver on every run, including subcontractors who work for five different principals and will not install your app.',
          'Podfy is a collection tool, not a scan tool. You send a link; the driver photographs the signed document at the gate; it lands in your portal with a GPS timestamp, archived and searchable. You never touch the paper.',
        ],
        checklist: [
          'Scan apps: you have the paper, you want a copy',
          'Podfy: someone else has the paper, you need it back',
          'No app to install for the driver or charter',
          'Works for subcontractors on any phone, any carrier',
          'GPS timestamp added automatically at upload',
          'One archive per requester, not scattered inboxes',
        ],
      },
      table: {
        caption:  'Comparison: collecting a signed delivery document from a third party',
        noteBelow: 'Competitor information is based on publicly available data. Pricing and features may change — verify with each provider.',
        noteGdpr:  'GPS + cloud sync must be enabled for most data residency risk in scan apps. On-device-only use stores nothing remotely.',
        columns: [
          { key: 'label',    label: 'Factor'                },
          { key: 'scan',     label: 'Free scan apps',     sub: 'CamScanner · Adobe Scan · Genius Scan · built-in', cls: 'v2-col-paper'   },
          { key: 'whatsapp', label: 'WhatsApp + email',   sub: 'The current default',                              cls: ''               },
          { key: 'podfy',    label: 'Podfy',              sub: 'Collection-first POD',                             cls: 'v2-col-digital' },
        ],
        rows: [
          {
            label:    'Cost',
            scan:     { text: 'Free / freemium',        note: 'Free tier adds watermarks or limits exports on some',  type: 'neutral'  },
            whatsapp: { text: 'Free',                   note: '',                                                      type: 'neutral'  },
            podfy:    { text: '', priceKey: 'starter',  note: '/POD · no monthly fee, no seat cost · <a href="/pricing" class="v2-link">full rate card</a>', type: 'positive' },
            // priceKey="starter" → renders <span data-price-key="starter">€0.55</span> filled live from /api/pricing
          },
          {
            label:    'Who initiates the return',
            scan:     { text: 'Driver must remember to scan and send',        note: 'Nothing prompts them',                  type: 'negative' },
            whatsapp: { text: 'Sender-initiated',                             note: 'Still relies on the driver acting',     type: 'negative' },
            podfy:    { text: 'Hiring party sends a request link',            note: 'One tap for the driver',                type: 'positive' },
          },
          {
            label:    'Driver needs an app or account',
            scan:     { text: 'Yes, a scanner app installed',                 note: '',                                      type: 'negative' },
            whatsapp: { text: 'Needs WhatsApp',                               note: 'Most have it, not all',                 type: 'negative' },
            podfy:    { text: 'No app, no account',                           note: 'Opens a link in any browser',           type: 'positive' },
          },
          {
            label:    'Where the document lands',
            scan:     { text: 'Wherever the driver mails it',                 note: 'Scattered inboxes',                     type: 'negative' },
            whatsapp: { text: 'In a chat thread',                             note: 'Buried and hard to export',             type: 'negative' },
            podfy:    { text: 'Back to the requester, one archive',           note: 'Searchable by reference',               type: 'positive' },
          },
          {
            label:    'Manual forwarding to each party',
            scan:     { text: 'Yes',  note: '',   type: 'negative' },
            whatsapp: { text: 'Yes',  note: '',   type: 'negative' },
            podfy:    { text: 'No',   note: 'Returns automatically',           type: 'positive' },
          },
          {
            label:    'GPS + independent timestamp on the proof',
            scan:     { text: 'Device metadata only', note: 'EXIF location/time if not stripped by the sender; no independent server-side capture', type: 'negative' },
            whatsapp: { text: 'Device metadata only', note: 'File EXIF only; WhatsApp may strip metadata', type: 'negative' },
            podfy:    { text: 'Yes',  note: 'Coordinates and timestamp captured server-side at upload, independent of the device', type: 'positive' },
          },
          {
            // Row explicitly scoped to documents collected FROM OTHERS, not personal scanning.
            // Scan apps have cloud for the user's own scans — that is not what this row measures.
            label:    'One archive for documents received from third parties',
            scan:     { text: 'No',   note: 'Scan apps store your own personal scans — for documents collected from someone else, they land wherever the sender chooses to mail them', type: 'negative' },
            whatsapp: { text: 'No',   note: 'Document lands in a chat thread, not the requester\'s system', type: 'negative' },
            podfy:    { text: 'Yes',  note: 'Every collected document lands in the requester\'s portal, indexed by shipment reference', type: 'positive' },
          },
          {
            // IMPORTANT: Podfy runs on Cloudflare (a US company). EU data residency does NOT equal
            // CLOUD Act immunity. Do not claim sovereignty or immunity — state jurisdiction only.
            label:    'Data residency / company jurisdiction',
            scan: {
              text: 'Varies by provider',
              note: 'CamScanner: INTSIG (Shanghai, CN); cloud data under Chinese Cybersecurity Law & DSL. Adobe Scan: Adobe (US); EU transfers via SCCs/DPF, but US CLOUD Act can compel disclosure. Genius Scan: The Grizzly Labs (France, EU); on-device by default, optional cloud sync (region: TODO verify).',
              // TODO: verify Genius Scan cloud-sync region before publishing.
              type: 'neutral',
            },
            whatsapp: {
              text: 'Meta (US)',
              note: 'Subject to US CLOUD Act (18 U.S.C. §2713)',
              type: 'neutral',
            },
            podfy: {
              text: 'EU company (NL)',
              note: 'Data stored in Cloudflare WEUR (Amsterdam, EU). Note: Cloudflare is a US company; EU data residency does not equal CLOUD Act immunity. DPA available on request. TODO: confirm R2 bucket jurisdiction = EU before publishing.',
              // TODO: confirm R2 EU bucket jurisdiction before publishing.
              type: 'neutral',
            },
          },
        ],
      },
      pipeline: {
        heading:   'From the gate to the invoice: where each tool fits',
        intro:     'Getting a signed CMR from the driver to your back-office is an eight-step journey. Scan apps only touch one step of it. Onboard computers and driver-app POD tools cover more — but only for your own drivers, or drivers willing to install something. The gap nobody fills is the middle of the chain for the third party you don\'t control: the subcontractor on his own phone, working for five principals. That\'s where Podfy lives.',
        caption:   'Stage-by-stage: where each tool fits the carrier-to-back-office pipeline',
        noteBelow: 'Partial = covers this step only for own fleet / opted-in drivers, or with manual effort. "Own onboard / TMS" and "Driver-app POD" columns assume the driver has adopted the system.',
        minWidth:  '680px',
        columns: [
          { key: 'label',     label: 'Stage'                                    },
          { key: 'scan',      label: 'Scan apps',        sub: 'CamScanner / Adobe / Genius', cls: 'v2-col-paper'   },
          { key: 'whatsapp',  label: 'WhatsApp + email', sub: 'The current default',         cls: ''               },
          { key: 'onboard',   label: 'Onboard / TMS',    sub: 'Own fleet only',              cls: ''               },
          { key: 'driverapp', label: 'Driver-app POD',   sub: 'If driver uses the app',      cls: ''               },
          { key: 'podfy',     label: 'Podfy',             sub: 'Link-based collection',       cls: 'v2-col-digital' },
        ],
        rows: [
          {
            label:     '1 · Delivery & signing at the gate',
            scan:      { text: '—', note: 'Physical event; no tool covers the signature act itself' },
            whatsapp:  { text: '—', note: 'Physical event' },
            onboard:   { text: '—', note: 'Physical event' },
            driverapp: { text: '—', note: 'Physical event' },
            podfy:     { text: '—', note: 'Physical event; the signed paper exists before Podfy is involved' },
          },
          {
            label:     '2 · Capture (paper to digital)',
            scan:      { text: 'Yes',     note: 'Core function of scan apps' },
            whatsapp:  { text: 'Yes',     note: 'Driver photographs and sends' },
            onboard:   { text: 'Yes',     note: 'Integrated for own fleet' },
            driverapp: { text: 'Yes',     note: 'Core function of driver-app POD' },
            podfy:     { text: 'Yes',     note: 'Driver opens link, photographs at the gate; no app install required' },
          },
          {
            label:     '3 · Hand-back to the party who needs it',
            scan:      { text: 'No',      note: 'Manual; sender chooses where to email or save; requester is passive' },
            whatsapp:  { text: 'Partial', note: 'Lands in a chat; requester must retrieve it manually' },
            onboard:   { text: 'Yes',     note: 'Returns to fleet TMS — own fleet only' },
            driverapp: { text: 'Yes',     note: 'Returns to POD SaaS — if the driver uses the app' },
            podfy:     { text: 'Yes',     note: 'Requester sends the link; document returns to their portal regardless of who the driver works for' },
          },
          {
            label:     '4 · Association to the right trip / order',
            scan:      { text: 'No',      note: 'No trip context; file lands in email unlinked' },
            whatsapp:  { text: 'No',      note: 'No trip context; buried in chat thread' },
            onboard:   { text: 'Yes',     note: 'Tied to trip record in TMS' },
            driverapp: { text: 'Yes',     note: 'Linked to job record in POD SaaS' },
            // HONESTY: Podfy is PARTIAL here — it associates by how the link was sent,
            // but does NOT reconcile against an order list or TMS.
            podfy:     { text: 'Partial', note: 'Associated by how the link is sent; not reconciled against an order list or TMS' },
          },
          {
            label:     '5 · Verification (who / when / where)',
            scan:      { text: 'Device metadata only', note: 'EXIF location and time if not stripped; no independent server capture' },
            whatsapp:  { text: 'Device metadata only', note: 'File metadata only; WhatsApp can strip EXIF' },
            onboard:   { text: 'Partial', note: 'Depends on system integration depth' },
            driverapp: { text: 'Yes',     note: 'GPS and timestamp logged by the app server-side' },
            podfy:     { text: 'Yes',     note: 'GPS coordinates and timestamp captured server-side at upload' },
          },
          {
            label:     '6 · Central archive & retention',
            scan:      { text: 'No',      note: "Sender's personal cloud — not in the requester's system" },
            whatsapp:  { text: 'No',      note: 'Buried in chat history; not a searchable archive for the requester' },
            onboard:   { text: 'Yes',     note: 'Own fleet; held in fleet system' },
            driverapp: { text: 'Yes',     note: 'Centrally held in POD SaaS' },
            podfy:     { text: 'Yes',     note: 'One archive per requester, searchable by reference and date' },
          },
          {
            label:     '7 · Retrieval for dispute or audit',
            scan:      { text: 'No',      note: "Not in the requester's system" },
            whatsapp:  { text: 'No',      note: 'Chat search is not a reliable audit trail' },
            onboard:   { text: 'Yes',     note: 'Own fleet' },
            driverapp: { text: 'Yes',     note: 'Searchable in POD SaaS' },
            podfy:     { text: 'Yes',     note: 'Searchable by reference, driver, date, or shipment' },
          },
          {
            label:     '8 · Invoice hand-off',
            scan:      { text: 'No',      note: 'No connection to invoicing workflow' },
            whatsapp:  { text: 'No',      note: 'No connection to invoicing workflow' },
            onboard:   { text: 'Yes',     note: 'Integrated with TMS billing' },
            driverapp: { text: 'Partial', note: 'PDF available; TMS integration depth varies by provider' },
            // HONESTY: Podfy is PARTIAL here — it hands off an invoice-ready document
            // but is NOT a TMS or invoicing system.
            podfy:     { text: 'Partial', note: 'Delivers a GPS-stamped, invoice-ready PDF; Podfy is not a TMS or invoicing system' },
          },
        ],
      },
      whenScan: {
        heading:    'When scan apps are the right choice',
        body:       'If the document is already in your hands and you need a quick digital copy, a free scan app is the right tool. CamScanner, Adobe Scan, and Genius Scan are genuinely good at what they do. We do not suggest replacing them for personal scanning workflows.',
        listLabel:  'Scan apps are the right tool when:',
        items: [
          'You received a paper document and need a digital copy for your own records',
          'You are scanning your own invoices, contracts, or purchase orders',
          'No third party needs to initiate or return anything to you',
        ],
      },
      faq: [
        {
          q: 'Can\'t I just ask drivers to use a scan app and email me?',
          a: 'You can, and many operations do. The problem is reliability: employed drivers may comply, subcontractors often do not. When a disputed delivery costs more than the freight charge, the missing scan matters. A request-link system means you control the trigger, not the driver.',
        },
        {
          q: 'Is Podfy better at scanning than CamScanner?',
          a: 'No, and that is not the comparison. CamScanner and similar apps are excellent at enhancing scan quality. Podfy is built for a different job: collecting a signed document from someone who is not your employee, at a location you cannot control, on a phone you cannot manage.',
        },
        {
          q: 'What if the driver does not have a smartphone?',
          a: 'Any phone with a browser and a camera works, including basic Android devices from 2017. The upload page is a web form, not an app, so there is no minimum OS requirement beyond a functioning camera and mobile browser.',
        },
        {
          q: 'Does Podfy store documents in the EU?',
          a: 'Yes. All data is stored in Cloudflare\'s EU-WEUR region (Amsterdam, Netherlands). A Data Processing Agreement is available on request for GDPR-compliant processing.',
        },
        {
          q: 'What does GPS stamping actually prove?',
          a: 'The GPS coordinates are captured server-side when the file is received. The record shows where the device was at the time of upload. It does not replace a signature, but it provides independent corroboration of delivery location — evidence a scan app photo cannot supply.',
        },
      ],
      related: {
        heading: 'Related guides and solutions',
        items: [
          { href: '/guides/pod-without-app/',    tag: 'Guide',    title: 'POD without an app',             desc: 'Why link-based collection beats app-based for mixed fleets.' },
          { href: '/guides/subcontractor-pod/',  tag: 'Guide',    title: 'Proof of delivery for subcontractors', desc: 'How to collect GPS-stamped POD with no installation.' },
          { href: '/solutions/carriers/',        tag: 'Solution', title: 'Podfy for carriers',              desc: 'GPS-stamped POD for every driver in your network.' },
          { href: '/pricing',                    tag: 'Pricing',  title: 'Full rate card',                  desc: 'Basic from €0.10/POD · Starter €0.55 · Advanced €0.79.' },
        ],
      },
      cta: {
        stamp:     'No app · Any phone',
        heading:   'See how collection works',
        headingEm: 'in your next dispatch.',
        body:      'Open a real upload link on your phone. No account, no card. The full flow in 30 seconds.',
        primary:   { label: 'Try the live demo',    href: '/demo'    },
        secondary: { label: 'Or book 15 minutes',   href: '/contact' },
      },
    },

    /* ══════════════════════════════════════════════════════════════════════
       DUTCH (NL)
       ══════════════════════════════════════════════════════════════════════ */
    nl: {
      meta: {
        title:       'Podfy vs. gratis scan-apps — CMR ophalen, niet alleen scannen | PODFY',
        description: 'CamScanner en Adobe Scan zijn uitstekend voor het scannen van uw eigen papieren. Ze helpen niet als het document in iemand anders handen is. Dit is het workflowverschil.',
        canonical:   'https://podfy.net/nl/vs-scan-apps/',
        keywords:    'bewijs van aflevering alternatief, CMR ophalen, scan-app vs POD, onderaannemer vrachtbrief, CamScanner alternatief logistiek',
      },
      hero: {
        eyebrow: 'Podfy vs. scan-apps',
        h1:      'Gratis apps zijn uitstekend in het scannen van uw eigen papieren.',
        h1em:    'Het probleem begint wanneer het document in iemand anders handen is.',
        sub:     'Wanneer een charter, onderaannemer of chauffeur de ondertekende vrachtbrief vasthoudt, jaagt u scans na via e-mail en WhatsApp voordat u kunt factureren. Dat is het gat dat Podfy dicht.',
      },
      context: {
        heading: 'Scannen vs. ophalen: twee verschillende problemen',
        body: [
          'Scan-apps lossen een persoonlijk productiviteitsprobleem op: u heeft een document en wilt een digitale kopie. Dat doen ze uitstekend. CamScanner, Adobe Scan en de ingebouwde camera-apps zijn echte goede tools als het papier in uw hand ligt.',
          'Leveringsbewijs is een ander probleem. Het document — een ondertekende vrachtbrief, een gecountersigneerde afleveringsbon — ligt in de handen van de chauffeur, niet uw eigen. U kunt het niet scannen. U moet iemand anders vragen het terug te sturen, en dat proces moet betrouwbaar werken voor elke chauffeur op elke rit, inclusief onderaannemers die voor vijf verschillende opdrachtgevers rijden en uw app niet installeren.',
          'Podfy is een ophaalgereedschap, geen scan-gereedschap. U stuurt een link; de chauffeur fotografeert het ondertekende document bij de poort; het verschijnt in uw portaal met een GPS-tijdstempel, gearchiveerd en doorzoekbaar. U raakt het papier nooit aan.',
        ],
        checklist: [
          'Scan-apps: u heeft het papier en wilt een kopie',
          'Podfy: iemand anders heeft het papier, u heeft het terug nodig',
          'Geen app te installeren voor de chauffeur of het charter',
          'Werkt voor onderaannemers op elke telefoon, elke vervoerder',
          'GPS-tijdstempel automatisch toegevoegd bij upload',
          'Één archief per opdrachtgever, geen verspreide inboxen',
        ],
      },
      table: {
        caption:   'Vergelijking: een ondertekend leveringsdocument ophalen van een derde partij',
        noteBelow: 'Concurrentinformatie is gebaseerd op publiek beschikbare gegevens. Controleer bij elke aanbieder voor actuele informatie.',
        noteGdpr:  'GPS + cloudsync moet ingeschakeld zijn voor het meeste dataresidentierisico bij scan-apps. Alleen lokaal gebruik slaat niets op in de cloud.',
        columns: [
          { key: 'label',    label: 'Factor'              },
          { key: 'scan',     label: 'Gratis scan-apps',   sub: 'CamScanner · Adobe Scan · Genius Scan · ingebouwd', cls: 'v2-col-paper'   },
          { key: 'whatsapp', label: 'WhatsApp + e-mail',  sub: 'De huidige standaard',                              cls: ''               },
          { key: 'podfy',    label: 'Podfy',              sub: 'Ophaalgerichte POD',                                cls: 'v2-col-digital' },
        ],
        rows: [
          {
            label:    'Kosten',
            scan:     { text: 'Gratis / freemium',         note: 'Gratis versie voegt watermerken toe of beperkt exports', type: 'neutral'  },
            whatsapp: { text: 'Gratis',                    note: '',                                                        type: 'neutral'  },
            podfy:    { text: '', priceKey: 'starter',     note: '/POD · geen maandelijkse kosten · <a href="/nl/pricing" class="v2-link">volledige tariefkaart</a>', type: 'positive' },
          },
          {
            label:    'Wie initieert de retour',
            scan:     { text: 'Chauffeur moet zelf onthouden te scannen en te sturen', note: 'Niets herinnert hem eraan', type: 'negative' },
            whatsapp: { text: 'Door de verzender geïnitieerd', note: 'Vertrouwt nog steeds op actie van de chauffeur', type: 'negative' },
            podfy:    { text: 'Inhurende partij stuurt een aanvraaglink', note: 'Één tik voor de chauffeur', type: 'positive' },
          },
          {
            label:    'Chauffeur heeft app of account nodig',
            scan:     { text: 'Ja, een scan-app geïnstalleerd',  note: '', type: 'negative' },
            whatsapp: { text: 'Heeft WhatsApp nodig',            note: 'De meeste hebben het, niet allemaal', type: 'negative' },
            podfy:    { text: 'Geen app, geen account',          note: 'Opent een link in elke browser', type: 'positive' },
          },
          {
            label:    'Waar belandt het document',
            scan:     { text: 'Waar de chauffeur het naartoe mailt', note: 'Verspreid over inboxen', type: 'negative' },
            whatsapp: { text: 'In een chatthread',                    note: 'Begraven en moeilijk te exporteren', type: 'negative' },
            podfy:    { text: 'Terug naar de opdrachtgever, één archief', note: 'Doorzoekbaar op referentie', type: 'positive' },
          },
          {
            label:    'Handmatig doorsturen naar elke partij',
            scan:     { text: 'Ja', note: '', type: 'negative' },
            whatsapp: { text: 'Ja', note: '', type: 'negative' },
            podfy:    { text: 'Nee', note: 'Keert automatisch terug', type: 'positive' },
          },
          {
            label:    'GPS + onafhankelijk tijdstempel op het bewijs',
            scan:     { text: 'Alleen apparaatmetadata', note: 'EXIF-locatie/-tijd als niet verwijderd door de verzender; geen onafhankelijke serverregistratie', type: 'negative' },
            whatsapp: { text: 'Alleen apparaatmetadata', note: 'Alleen bestandsmetadata; WhatsApp kan EXIF verwijderen', type: 'negative' },
            podfy:    { text: 'Ja',  note: 'Coördinaten en tijdstempel serverside vastgelegd bij upload, onafhankelijk van het apparaat', type: 'positive' },
          },
          {
            label:    'Één archief voor ontvangen documenten van derden',
            scan:     { text: 'Nee', note: 'Scan-apps bewaren uw eigen scans — voor documenten van anderen belandt het document waar de verzender het naartoe stuurt', type: 'negative' },
            whatsapp: { text: 'Nee', note: 'Document belandt in een chatthread, niet in het systeem van de opdrachtgever', type: 'negative' },
            podfy:    { text: 'Ja',  note: 'Elk opgehaald document belandt in het portaal van de opdrachtgever, geïndexeerd op zendingsreferentie', type: 'positive' },
          },
          {
            label:    'Dataresidentie / bedrijfsjurisditie',
            scan: {
              text: 'Verschilt per aanbieder',
              note: 'CamScanner: INTSIG (Shanghai, CN); clouddata onder Chinese cybersecuritywet & DSL. Adobe Scan: Adobe (VS); EU-overdrachten via SCC/DPF, maar VS CLOUD Act kan openbaarmaking afdwingen. Genius Scan: The Grizzly Labs (Frankrijk, EU); standaard lokaal, optionele cloudsync (regio: TODO verifiëren).',
              type: 'neutral',
            },
            whatsapp: { text: 'Meta (VS)', note: 'Onderworpen aan de VS CLOUD Act (18 U.S.C. §2713)', type: 'neutral' },
            podfy: {
              text: 'EU-bedrijf (NL)',
              note: 'Data opgeslagen in Cloudflare WEUR (Amsterdam, EU). Let op: Cloudflare is een Amerikaans bedrijf; EU-dataresidentie betekent geen CLOUD Act-immuniteit. VOK beschikbaar op aanvraag. TODO: bevestig R2-bucket-jurisdictie = EU.',
              type: 'neutral',
            },
          },
        ],
      },
      pipeline: null, // TODO: translate pipeline section to Dutch (fall back to EN until done)
      whenScan: {
        heading:   'Wanneer scan-apps de juiste keuze zijn',
        body:      'Als het document al in uw handen is en u een snelle digitale kopie nodig heeft, is een gratis scan-app het juiste gereedschap. CamScanner, Adobe Scan en Genius Scan zijn echt goed in wat ze doen. We adviseren niet ze te vervangen voor persoonlijke scanworkflows.',
        listLabel: 'Scan-apps zijn het juiste gereedschap wanneer:',
        items: [
          'U een papieren document ontvangen heeft en een digitale kopie nodig heeft voor uw eigen administratie',
          'U uw eigen facturen, contracten of inkooporders scant',
          'Geen derde partij iets hoeft te initiëren of terug te sturen',
        ],
      },
      faq: [
        {
          q: 'Kan ik chauffeurs niet gewoon vragen een scan-app te gebruiken en te mailen?',
          a: 'Dat kan, en veel operaties doen dat. Het probleem is betrouwbaarheid: eigen chauffeurs voldoen wellicht, onderaannemers vaak niet. Wanneer een betwiste levering meer kost dan de vrachtprijs, telt de ontbrekende scan. Een aanvraaglink-systeem betekent dat u de trigger beheert, niet de chauffeur.',
        },
        {
          q: 'Is Podfy beter in scannen dan CamScanner?',
          a: 'Nee, en dat is ook niet de vergelijking. CamScanner en soortgelijke apps zijn uitstekend in het verbeteren van scankwaliteit. Podfy is gebouwd voor een andere taak: een ondertekend document ophalen van iemand die niet uw werknemer is, op een locatie die u niet kunt controleren, op een telefoon die u niet beheert.',
        },
        {
          q: 'Wat als de chauffeur geen smartphone heeft?',
          a: 'Elke telefoon met een browser en camera werkt, inclusief eenvoudige Android-apparaten vanaf 2017. De uploadpagina is een webformulier, geen app, dus er is geen minimale OS-vereiste behalve een werkende camera en mobiele browser.',
        },
        {
          q: 'Bewaart Podfy documenten in de EU?',
          a: 'Ja. Alle gegevens worden opgeslagen in de EU-WEUR-regio van Cloudflare (Amsterdam, Nederland). Een verwerkersovereenkomst (VOK) is op verzoek beschikbaar voor AVG-conforme verwerking.',
        },
      ],
      related: {
        heading: 'Gerelateerde gidsen en oplossingen',
        items: [
          { href: '/nl/guides/pod-without-app/',    tag: 'Gids',     title: 'POD zonder app',                   desc: 'Waarom linkgebaseerd ophalen beter werkt voor gemengde wagenparken.' },
          { href: '/nl/guides/subcontractor-pod/',  tag: 'Gids',     title: 'Bewijs van aflevering voor onderaannemers', desc: 'Hoe u GPS-gestempeld bewijs ophaalt zonder installatie.' },
          { href: '/nl/solutions/carriers/',        tag: 'Oplossing', title: 'Podfy voor vervoerders',           desc: 'GPS-gestempeld bewijs voor elke chauffeur in uw netwerk.' },
          { href: '/nl/pricing',                    tag: 'Tarieven', title: 'Volledige tariefkaart',             desc: 'Basic vanaf €0,10/POD · Starter €0,55 · Advanced €0,79.' },
        ],
      },
      cta: {
        stamp:     'Geen app · Elke telefoon',
        heading:   'Zie hoe ophalen werkt',
        headingEm: 'bij uw volgende rit.',
        body:      'Open een echte uploadlink op uw telefoon. Geen account, geen creditcard. De volledige flow in 30 seconden.',
        primary:   { label: 'Probeer de live demo',  href: '/nl/demo'    },
        secondary: { label: 'Of plan 15 minuten',    href: '/nl/contact' },
      },
    },

    /* ══════════════════════════════════════════════════════════════════════
       GERMAN (DE)
       ══════════════════════════════════════════════════════════════════════ */
    de: {
      meta: {
        title:       'Podfy vs. kostenlose Scan-Apps — CMR einsammeln, nicht nur scannen | PODFY',
        description: 'CamScanner und Adobe Scan sind hervorragend beim Scannen eigener Dokumente. Sie helfen nicht, wenn das Dokument in fremden Händen liegt. Hier ist der Workflow-Unterschied.',
        canonical:   'https://podfy.net/de/vs-scan-apps/',
        keywords:    'Liefernachweis Alternative, CMR einsammeln, Scan-App vs POD, Subunternehmer Frachtbrief, CamScanner Alternative Logistik',
      },
      hero: {
        eyebrow: 'Podfy vs. Scan-Apps',
        h1:      'Kostenlose Apps sind hervorragend beim Scannen eigener Dokumente.',
        h1em:    'Das Problem beginnt, wenn das Dokument in fremden Händen liegt.',
        sub:     'Wenn ein Charter, Subunternehmer oder Fahrer den signierten Frachtbrief hält, jagen Sie Scans über E-Mail und WhatsApp, bevor Sie eine Rechnung stellen können. Diese Lücke schließt Podfy.',
      },
      context: {
        heading: 'Scannen vs. Einsammeln: zwei verschiedene Probleme',
        body: [
          'Scan-Apps lösen ein persönliches Produktivitätsproblem: Sie haben ein Dokument und möchten eine digitale Kopie. Dafür funktionieren sie hervorragend. CamScanner, Adobe Scan und die integrierten Kamera-Apps sind wirklich gute Werkzeuge, wenn das Papier in Ihrer Hand liegt.',
          'Liefernachweis ist ein anderes Problem. Das Dokument — ein signierter Frachtbrief, ein gegengezeichneter Lieferschein — liegt in der Hand des Fahrers, nicht Ihrer. Sie können es nicht scannen. Sie müssen jemand anderen bitten, es zurückzuschicken, und dieser Prozess muss zuverlässig für jeden Fahrer auf jeder Tour funktionieren, einschließlich Subunternehmer, die für fünf verschiedene Auftraggeber fahren und Ihre App nicht installieren werden.',
          'Podfy ist ein Sammelwerkzeug, kein Scan-Werkzeug. Sie senden einen Link; der Fahrer fotografiert das signierte Dokument am Tor; es landet in Ihrem Portal mit einem GPS-Zeitstempel, archiviert und durchsuchbar. Sie berühren das Papier nie.',
        ],
        checklist: [
          'Scan-Apps: Sie haben das Papier und möchten eine Kopie',
          'Podfy: jemand anderes hat das Papier, Sie brauchen es zurück',
          'Keine App-Installation für den Fahrer oder das Charter',
          'Funktioniert für Subunternehmer auf jedem Telefon, jedem Spediteur',
          'GPS-Zeitstempel automatisch beim Upload hinzugefügt',
          'Ein Archiv pro Auftraggeber, keine verteilten Posteingänge',
        ],
      },
      table: {
        caption:   'Vergleich: Ein signiertes Lieferdokument von Dritten einsammeln',
        noteBelow: 'Konkurrenteninformationen basieren auf öffentlich verfügbaren Daten. Preise und Funktionen können sich ändern — bei jedem Anbieter prüfen.',
        noteGdpr:  'GPS + Cloud-Sync muss für die meisten Datenresidenzrisiken bei Scan-Apps aktiviert sein. Nur lokale Nutzung speichert nichts in der Cloud.',
        columns: [
          { key: 'label',    label: 'Faktor'              },
          { key: 'scan',     label: 'Kostenlose Scan-Apps', sub: 'CamScanner · Adobe Scan · Genius Scan · integriert', cls: 'v2-col-paper'   },
          { key: 'whatsapp', label: 'WhatsApp + E-Mail',   sub: 'Der aktuelle Standard',                               cls: ''               },
          { key: 'podfy',    label: 'Podfy',               sub: 'Sammelzentrierter Liefernachweis',                    cls: 'v2-col-digital' },
        ],
        rows: [
          {
            label:    'Kosten',
            scan:     { text: 'Kostenlos / Freemium', note: 'Kostenlose Stufe fügt Wasserzeichen hinzu oder begrenzt Exporte', type: 'neutral' },
            whatsapp: { text: 'Kostenlos', note: '', type: 'neutral' },
            podfy:    { text: '', priceKey: 'starter', note: '/POD · keine Grundgebühr · <a href="/de/pricing" class="v2-link">vollständige Preisliste</a>', type: 'positive' },
          },
          {
            label:    'Wer initiiert die Rücksendung',
            scan:     { text: 'Fahrer muss selbst daran denken zu scannen und zu senden', note: 'Nichts erinnert ihn daran', type: 'negative' },
            whatsapp: { text: 'Absender-initiiert', note: 'Vertraut noch auf die Aktion des Fahrers', type: 'negative' },
            podfy:    { text: 'Der Auftraggeber sendet einen Anforderungslink', note: 'Ein Tipp für den Fahrer', type: 'positive' },
          },
          {
            label:    'Fahrer benötigt App oder Konto',
            scan:     { text: 'Ja, eine installierte Scan-App', note: '', type: 'negative' },
            whatsapp: { text: 'Benötigt WhatsApp', note: 'Die meisten haben es, nicht alle', type: 'negative' },
            podfy:    { text: 'Keine App, kein Konto', note: 'Öffnet einen Link in jedem Browser', type: 'positive' },
          },
          {
            label:    'Wo landet das Dokument',
            scan:     { text: 'Wohin der Fahrer es sendet', note: 'Verteilt über Posteingänge', type: 'negative' },
            whatsapp: { text: 'In einem Chat-Thread', note: 'Vergraben und schwer zu exportieren', type: 'negative' },
            podfy:    { text: 'Zurück zum Auftraggeber, ein Archiv', note: 'Durchsuchbar nach Referenz', type: 'positive' },
          },
          {
            label:    'Manuelle Weiterleitung an jede Partei',
            scan:     { text: 'Ja', note: '', type: 'negative' },
            whatsapp: { text: 'Ja', note: '', type: 'negative' },
            podfy:    { text: 'Nein', note: 'Kehrt automatisch zurück', type: 'positive' },
          },
          {
            label:    'GPS + unabhängiger Zeitstempel am Nachweis',
            scan:     { text: 'Nur Gerätemetadaten', note: 'EXIF-Standort/-Zeit falls nicht entfernt; keine unabhängige serverseitige Erfassung', type: 'negative' },
            whatsapp: { text: 'Nur Gerätemetadaten', note: 'Nur Datei-Metadaten; WhatsApp kann EXIF entfernen', type: 'negative' },
            podfy:    { text: 'Ja',   note: 'Koordinaten und Zeitstempel serverseitig beim Upload erfasst, unabhängig vom Gerät', type: 'positive' },
          },
          {
            label:    'Ein Archiv für von Dritten empfangene Dokumente',
            scan:     { text: 'Nein', note: 'Scan-Apps speichern eigene Scans — für Dokumente von anderen landet es dort, wohin der Sender es sendet', type: 'negative' },
            whatsapp: { text: 'Nein', note: 'Dokument landet in einem Chat-Thread, nicht im System des Auftraggebers', type: 'negative' },
            podfy:    { text: 'Ja',   note: 'Jedes gesammelte Dokument landet im Portal des Auftraggebers, indiziert nach Sendungsreferenz', type: 'positive' },
          },
          {
            label:    'Datenresidenz / Unternehmensjurisdiktion',
            scan: {
              text: 'Je nach Anbieter unterschiedlich',
              note: 'CamScanner: INTSIG (Shanghai, CN); Cloud-Daten unterliegen chinesischem Cybersicherheitsgesetz & DSG. Adobe Scan: Adobe (USA); EU-Übertragungen via SCC/DPF, aber US-CLOUD-Act kann Offenlegung erzwingen. Genius Scan: The Grizzly Labs (Frankreich, EU); standardmäßig lokal, optionale Cloud-Sync (Region: TODO prüfen).',
              type: 'neutral',
            },
            whatsapp: { text: 'Meta (USA)', note: 'Unterliegt dem US-CLOUD-Act (18 U.S.C. §2713)', type: 'neutral' },
            podfy: {
              text: 'EU-Unternehmen (NL)',
              note: 'Daten in Cloudflare WEUR (Amsterdam, EU) gespeichert. Hinweis: Cloudflare ist ein US-Unternehmen; EU-Datenspeicherung bedeutet keine Immunität gegenüber dem CLOUD-Act. AVV auf Anfrage verfügbar. TODO: R2-Bucket-Jurisdiktion = EU bestätigen.',
              type: 'neutral',
            },
          },
        ],
      },
      pipeline: null, // TODO: translate pipeline section to German (fall back to EN until done)
      whenScan: {
        heading:   'Wann Scan-Apps die richtige Wahl sind',
        body:      'Wenn das Dokument bereits in Ihren Händen liegt und Sie schnell eine digitale Kopie benötigen, ist eine kostenlose Scan-App das richtige Werkzeug. CamScanner, Adobe Scan und Genius Scan sind wirklich gut in dem, was sie tun. Wir empfehlen nicht, sie für persönliche Scan-Workflows zu ersetzen.',
        listLabel: 'Scan-Apps sind das richtige Werkzeug wenn:',
        items: [
          'Sie ein Papierdokument erhalten haben und eine digitale Kopie für Ihre eigenen Unterlagen benötigen',
          'Sie Ihre eigenen Rechnungen, Verträge oder Bestellungen scannen',
          'Kein Dritter etwas initiieren oder an Sie zurücksenden muss',
        ],
      },
      faq: [
        {
          q: 'Kann ich Fahrer nicht einfach bitten, eine Scan-App zu verwenden und mir zu mailen?',
          a: 'Sie können, und viele Betriebe tun das. Das Problem ist Zuverlässigkeit: Angestellte Fahrer halten sich vielleicht daran, Subunternehmer oft nicht. Wenn eine streitige Lieferung mehr kostet als die Frachtgebühr, zählt der fehlende Scan. Ein Anforderungslink-System bedeutet, dass Sie den Auslöser kontrollieren, nicht der Fahrer.',
        },
        {
          q: 'Ist Podfy besser im Scannen als CamScanner?',
          a: 'Nein, und das ist auch nicht der Vergleich. CamScanner und ähnliche Apps sind ausgezeichnet bei der Verbesserung der Scanqualität. Podfy ist für eine andere Aufgabe entwickelt: ein signiertes Dokument von jemandem einzusammeln, der nicht Ihr Mitarbeiter ist, an einem Ort, den Sie nicht kontrollieren können, auf einem Telefon, das Sie nicht verwalten.',
        },
        {
          q: 'Was wenn der Fahrer kein Smartphone hat?',
          a: 'Jedes Telefon mit einem Browser und einer Kamera funktioniert, einschließlich einfacher Android-Geräte ab 2017. Die Upload-Seite ist ein Webformular, keine App, daher gibt es keine Mindest-OS-Anforderung außer einem funktionierenden Kamera-Browser.',
        },
        {
          q: 'Speichert Podfy Dokumente in der EU?',
          a: 'Ja. Alle Daten werden in der EU-WEUR-Region von Cloudflare (Amsterdam, Niederlande) gespeichert. Ein Auftragsverarbeitungsvertrag (AVV) ist auf Anfrage für DSGVO-konforme Verarbeitung verfügbar.',
        },
      ],
      related: {
        heading: 'Verwandte Leitfäden und Lösungen',
        items: [
          { href: '/de/guides/pod-without-app/',   tag: 'Leitfaden', title: 'Liefernachweis ohne App',             desc: 'Warum linkbasiertes Einsammeln besser funktioniert als app-basiert.' },
          { href: '/de/guides/subcontractor-pod/',  tag: 'Leitfaden', title: 'Liefernachweis für Subunternehmer',   desc: 'GPS-gestempelten Nachweis ohne Installation einsammeln.' },
          { href: '/de/solutions/carriers/',        tag: 'Lösung',    title: 'Podfy für Spediteure',                desc: 'GPS-gestempelter Nachweis für jeden Fahrer in Ihrem Netzwerk.' },
          { href: '/de/pricing',                    tag: 'Preise',    title: 'Vollständige Preisliste',             desc: 'Basic ab €0,10/POD · Starter €0,55 · Advanced €0,79.' },
        ],
      },
      cta: {
        stamp:     'Keine App · Jedes Telefon',
        heading:   'Sehen Sie, wie Einsammeln funktioniert',
        headingEm: 'bei Ihrer nächsten Tour.',
        body:      'Öffnen Sie einen echten Upload-Link auf Ihrem Telefon. Kein Konto, keine Kreditkarte. Der vollständige Ablauf in 30 Sekunden.',
        primary:   { label: 'Live-Demo ausprobieren', href: '/de/demo'    },
        secondary: { label: 'Oder 15 Minuten buchen', href: '/de/contact' },
      },
    },

    /* ══════════════════════════════════════════════════════════════════════
       FRENCH (FR)
       ══════════════════════════════════════════════════════════════════════ */
    fr: {
      meta: {
        title:       'Podfy vs. applications de scan gratuites — Récupérer un CMR, pas juste le scanner | PODFY',
        description: 'CamScanner et Adobe Scan sont excellents pour scanner vos propres documents. Ils n\'aident pas quand le document est dans les mains de quelqu\'un d\'autre. Voici la différence.',
        canonical:   'https://podfy.net/fr/vs-scan-apps/',
        keywords:    'alternative preuve de livraison, récupérer CMR, app scan vs POD, sous-traitant lettre de voiture, alternative CamScanner logistique',
      },
      hero: {
        eyebrow: 'Podfy vs. apps de scan',
        h1:      'Les applications gratuites sont excellentes pour scanner vos propres documents.',
        h1em:    'Le problème commence quand le document est dans les mains de quelqu\'un d\'autre.',
        sub:     'Quand un affréteur, un sous-traitant ou un chauffeur détient la lettre de voiture signée, vous courez après des scans par e-mail et WhatsApp avant de pouvoir facturer. C\'est le manque que Podfy comble.',
      },
      context: {
        heading: 'Scanner vs. collecter : deux problèmes différents',
        body: [
          'Les applications de scan résolvent un problème de productivité personnelle : vous avez un document, vous souhaitez une copie numérique. Elles font cela à merveille. CamScanner, Adobe Scan et les applications caméra intégrées sont de vrais bons outils quand le papier est dans votre main.',
          'La preuve de livraison est un problème différent. Le document — une lettre de voiture signée, un bon de livraison contresigné — est dans la main du chauffeur, pas la vôtre. Vous ne pouvez pas le scanner. Vous devez demander à quelqu\'un d\'autre de le renvoyer, et ce processus doit fonctionner de manière fiable pour chaque chauffeur sur chaque trajet, y compris les sous-traitants qui travaillent pour cinq donneurs d\'ordre différents et n\'installeront pas votre application.',
          'Podfy est un outil de collecte, pas un outil de scan. Vous envoyez un lien ; le chauffeur photographie le document signé au portail ; il arrive dans votre portail avec un horodatage GPS, archivé et consultable. Vous ne touchez jamais le papier.',
        ],
        checklist: [
          'Apps de scan : vous avez le papier et souhaitez une copie',
          'Podfy : quelqu\'un d\'autre a le papier, vous en avez besoin en retour',
          'Aucune application à installer pour le chauffeur ou l\'affréteur',
          'Fonctionne pour les sous-traitants sur tout téléphone, tout transporteur',
          'Horodatage GPS ajouté automatiquement lors du téléversement',
          'Une archive par donneur d\'ordre, pas d\'inboxes dispersées',
        ],
      },
      table: {
        caption:   'Comparaison : collecter un document de livraison signé auprès d\'un tiers',
        noteBelow: 'Les informations sur les concurrents sont basées sur des données publiquement disponibles. Vérifiez auprès de chaque fournisseur pour des informations à jour.',
        noteGdpr:  'La synchronisation cloud doit être activée pour la plupart des risques de résidence des données dans les apps de scan. L\'utilisation locale uniquement ne stocke rien dans le cloud.',
        columns: [
          { key: 'label',    label: 'Facteur'                  },
          { key: 'scan',     label: 'Apps de scan gratuites', sub: 'CamScanner · Adobe Scan · Genius Scan · intégré', cls: 'v2-col-paper'   },
          { key: 'whatsapp', label: 'WhatsApp + e-mail',      sub: 'Le standard actuel',                              cls: ''               },
          { key: 'podfy',    label: 'Podfy',                  sub: 'POD axé sur la collecte',                         cls: 'v2-col-digital' },
        ],
        rows: [
          {
            label:    'Coût',
            scan:     { text: 'Gratuit / freemium', note: 'Le niveau gratuit ajoute des filigranes ou limite les exports', type: 'neutral' },
            whatsapp: { text: 'Gratuit', note: '', type: 'neutral' },
            podfy:    { text: '', priceKey: 'starter', note: '/POD · sans abonnement mensuel · <a href="/fr/pricing" class="v2-link">grille tarifaire complète</a>', type: 'positive' },
          },
          {
            label:    'Qui initie le retour',
            scan:     { text: 'Le chauffeur doit se souvenir de scanner et d\'envoyer', note: 'Rien ne le lui rappelle', type: 'negative' },
            whatsapp: { text: 'Initié par l\'expéditeur', note: 'Repose encore sur l\'action du chauffeur', type: 'negative' },
            podfy:    { text: 'Le donneur d\'ordre envoie un lien de demande', note: 'Un seul geste pour le chauffeur', type: 'positive' },
          },
          {
            label:    'Le chauffeur a besoin d\'une app ou d\'un compte',
            scan:     { text: 'Oui, une app de scan installée', note: '', type: 'negative' },
            whatsapp: { text: 'Besoin de WhatsApp', note: 'La plupart l\'ont, pas tous', type: 'negative' },
            podfy:    { text: 'Aucune app, aucun compte', note: 'Ouvre un lien dans n\'importe quel navigateur', type: 'positive' },
          },
          {
            label:    'Où atterrit le document',
            scan:     { text: 'Où le chauffeur l\'envoie', note: 'Dispersé dans les boîtes e-mail', type: 'negative' },
            whatsapp: { text: 'Dans un fil de discussion', note: 'Enfoui et difficile à exporter', type: 'negative' },
            podfy:    { text: 'Vers le donneur d\'ordre, une archive', note: 'Consultable par référence', type: 'positive' },
          },
          {
            label:    'Transfert manuel à chaque partie',
            scan:     { text: 'Oui', note: '', type: 'negative' },
            whatsapp: { text: 'Oui', note: '', type: 'negative' },
            podfy:    { text: 'Non', note: 'Retourne automatiquement', type: 'positive' },
          },
          {
            label:    'GPS + horodatage indépendant sur la preuve',
            scan:     { text: 'Métadonnées de l\'appareil uniquement', note: 'EXIF de localisation/heure si non supprimé par l\'expéditeur ; aucune capture indépendante côté serveur', type: 'negative' },
            whatsapp: { text: 'Métadonnées de l\'appareil uniquement', note: 'Métadonnées fichier uniquement ; WhatsApp peut supprimer l\'EXIF', type: 'negative' },
            podfy:    { text: 'Oui', note: 'Coordonnées et horodatage capturés côté serveur lors du téléversement, indépendamment de l\'appareil', type: 'positive' },
          },
          {
            label:    'Une archive pour les documents reçus de tiers',
            scan:     { text: 'Non', note: 'Les apps de scan stockent vos propres scans — pour les documents collectés d\'autres personnes, ils atterrissent là où l\'expéditeur choisit de les envoyer', type: 'negative' },
            whatsapp: { text: 'Non', note: 'Le document atterrit dans un fil de discussion, pas dans le système du donneur d\'ordre', type: 'negative' },
            podfy:    { text: 'Oui', note: 'Chaque document collecté atterrit dans le portail du donneur d\'ordre, indexé par référence d\'expédition', type: 'positive' },
          },
          {
            label:    'Résidence des données / juridiction de l\'entreprise',
            scan: {
              text: 'Varie selon le fournisseur',
              note: 'CamScanner : INTSIG (Shanghai, CN) ; données cloud sous loi chinoise de cybersécurité & DSL. Adobe Scan : Adobe (USA) ; transferts UE via CCT/DPF, mais CLOUD Act américain peut imposer la divulgation. Genius Scan : The Grizzly Labs (France, UE) ; sur l\'appareil par défaut, sync cloud optionnelle (région : TODO vérifier).',
              type: 'neutral',
            },
            whatsapp: { text: 'Meta (USA)', note: 'Soumis au CLOUD Act américain (18 U.S.C. §2713)', type: 'neutral' },
            podfy: {
              text: 'Société UE (NL)',
              note: 'Données stockées dans Cloudflare WEUR (Amsterdam, UE). Note : Cloudflare est une société américaine ; la résidence des données en UE n\'équivaut pas à une immunité contre le CLOUD Act. DPA disponible sur demande. TODO : confirmer la juridiction du bucket R2 = UE.',
              type: 'neutral',
            },
          },
        ],
      },
      pipeline: null, // TODO: translate pipeline section to French (fall back to EN until done)
      whenScan: {
        heading:   'Quand les applications de scan sont le bon choix',
        body:      'Si le document est déjà dans vos mains et que vous avez besoin d\'une copie numérique rapide, une application de scan gratuite est le bon outil. CamScanner, Adobe Scan et Genius Scan sont vraiment bons dans ce qu\'ils font. Nous ne suggérons pas de les remplacer pour les flux de travail de scan personnels.',
        listLabel: 'Les apps de scan sont le bon outil quand :',
        items: [
          'Vous avez reçu un document papier et avez besoin d\'une copie numérique pour vos propres archives',
          'Vous scannez vos propres factures, contrats ou bons de commande',
          'Aucun tiers n\'a besoin d\'initier ou de vous renvoyer quoi que ce soit',
        ],
      },
      faq: [
        {
          q: 'Ne puis-je pas simplement demander aux chauffeurs d\'utiliser une app de scan et de m\'envoyer par e-mail ?',
          a: 'Vous pouvez, et beaucoup d\'opérations le font. Le problème est la fiabilité : les chauffeurs employés s\'y conforment peut-être, les sous-traitants souvent pas. Quand une livraison contestée coûte plus que le fret, le scan manquant compte. Un système de lien de demande signifie que vous contrôlez le déclencheur, pas le chauffeur.',
        },
        {
          q: 'Podfy est-il meilleur pour scanner que CamScanner ?',
          a: 'Non, et ce n\'est pas la comparaison. CamScanner et les applications similaires sont excellents pour améliorer la qualité de scan. Podfy est conçu pour une tâche différente : collecter un document signé auprès de quelqu\'un qui n\'est pas votre employé, à un endroit que vous ne pouvez pas contrôler, sur un téléphone que vous ne gérez pas.',
        },
        {
          q: 'Que faire si le chauffeur n\'a pas de smartphone ?',
          a: 'Tout téléphone avec un navigateur et une caméra fonctionne, y compris les appareils Android basiques depuis 2017. La page de téléversement est un formulaire web, pas une app, donc il n\'y a aucune exigence minimale de système d\'exploitation au-delà d\'un navigateur caméra fonctionnel.',
        },
        {
          q: 'Podfy stocke-t-il les documents dans l\'UE ?',
          a: 'Oui. Toutes les données sont stockées dans la région EU-WEUR de Cloudflare (Amsterdam, Pays-Bas). Un accord de traitement des données (DPA) est disponible sur demande pour un traitement conforme au RGPD.',
        },
      ],
      related: {
        heading: 'Guides et solutions connexes',
        items: [
          { href: '/fr/guides/pod-without-app/',   tag: 'Guide',    title: 'POD sans application',                 desc: 'Pourquoi la collecte par lien est meilleure pour les flottes mixtes.' },
          { href: '/fr/guides/subcontractor-pod/',  tag: 'Guide',    title: 'Preuve de livraison pour sous-traitants', desc: 'Collecter des preuves horodatées GPS sans installation.' },
          { href: '/fr/solutions/carriers/',        tag: 'Solution', title: 'Podfy pour transporteurs',              desc: 'Preuve horodatée GPS pour chaque chauffeur de votre réseau.' },
          { href: '/fr/pricing',                    tag: 'Tarifs',   title: 'Grille tarifaire complète',             desc: 'Basic à partir de €0,10/POD · Starter €0,55 · Advanced €0,79.' },
        ],
      },
      cta: {
        stamp:     'Aucune app · Tout téléphone',
        heading:   'Voyez comment la collecte fonctionne',
        headingEm: 'à votre prochain envoi.',
        body:      'Ouvrez un vrai lien de téléversement sur votre téléphone. Aucun compte, aucune carte. Le flux complet en 30 secondes.',
        primary:   { label: 'Essayer la démo',         href: '/fr/demo'    },
        secondary: { label: 'Ou réserver 15 minutes',  href: '/fr/contact' },
      },
    },
  };

  /* ─────────────────────────────────────────────────────────────────────────
     LOCALE DETECTION
     ───────────────────────────────────────────────────────────────────────── */

  function getLocale() {
    var lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    return CONTENT[lang] ? lang : 'en';
  }

  /* ─────────────────────────────────────────────────────────────────────────
     RENDERING
     ───────────────────────────────────────────────────────────────────────── */

  /* Generic table renderer — used for both the comparison table and the pipeline matrix.
     Pass the table/pipeline DATA OBJECT directly (not the full locale object). */
  function renderTable(tableData, rootEl) {
    var cols     = tableData.columns;
    var rows     = tableData.rows;
    var dataKeys = cols.slice(1).map(function (c) { return c.key; }); /* skip label col */
    var minW     = tableData.minWidth || '480px';

    var html = '<div class="v2-price-table-wrap">';
    html += '<table class="v2-comparison-table v2-vs-table" aria-label="' + esc(tableData.caption) + '"';
    html += ' style="min-width:' + minW + '">';

    /* thead */
    html += '<thead><tr>';
    cols.forEach(function (col) {
      var cls = col.cls ? ' class="' + col.cls + '"' : '';
      html += '<th scope="col"' + cls + '>' + esc(col.label);
      if (col.sub) html += '<br><span class="v2-vs-col-sub">' + esc(col.sub) + '</span>';
      html += '</th>';
    });
    html += '</tr></thead>';

    /* tbody */
    html += '<tbody>';
    rows.forEach(function (row) {
      html += '<tr>';
      html += '<td class="v2-price-row-label">' + esc(row.label) + '</td>';

      dataKeys.forEach(function (key, idx) {
        var cell   = row[key] || {};
        var colCls = cols[idx + 1].cls;
        var tdCls  = colCls ? ' class="' + colCls + '"' : '';
        html += '<td' + tdCls + '>';

        /* Podfy cost cell: use dynamic price span */
        if (key === 'podfy' && cell.priceKey) {
          html += '<span class="v2-vs-cell-text">from <span data-price-key="' + cell.priceKey + '">€0.55</span></span>';
        } else {
          html += '<span class="v2-vs-cell-text">' + esc(cell.text || '') + '</span>';
        }

        if (cell.note) {
          html += ' <span class="v2-vs-cell-note">' + cell.note + '</span>';
        }
        html += '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    if (tableData.noteBelow) html += '<p class="v2-vs-table-note">' + esc(tableData.noteBelow) + '</p>';
    if (tableData.noteGdpr)  html += '<p class="v2-vs-table-note">' + esc(tableData.noteGdpr) + '</p>';

    rootEl.innerHTML = html;
  }

  function renderRelated(data, rootEl) {
    var html = '<div class="v2-guide-grid">';
    data.related.items.forEach(function (item) {
      html += '<a class="v2-guide-card" href="' + item.href + '">';
      html += '<span class="v2-guide-tag">' + esc(item.tag) + '</span>';
      html += '<h3 class="v2-guide-title">' + esc(item.title) + '</h3>';
      html += '<p class="v2-guide-desc">' + esc(item.desc) + '</p>';
      html += '<span class="v2-guide-arrow">View &rarr;</span>';
      html += '</a>';
    });
    html += '</div>';
    rootEl.innerHTML = html;
  }

  function renderFaq(data, rootEl) {
    var html = '<div class="v2-faq-accordion">';
    data.faq.forEach(function (item) {
      html += '<div class="v2-faq-acc-item">';
      html += '<button class="v2-faq-btn" type="button">' + esc(item.q) + '</button>';
      html += '<div class="v2-faq-answer"><p>' + esc(item.a) + '</p></div>';
      html += '</div>';
    });
    html += '</div>';
    rootEl.innerHTML = html;
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&(?!(?:amp|lt|gt|quot|#\d+|[a-z]+);)/gi, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     DYNAMIC PRICE FILL (same pattern as pricing pages)
     ───────────────────────────────────────────────────────────────────────── */

  function fillPrices() {
    fetch('/api/pricing')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.items) return;
        var map = {};
        data.items.forEach(function (row) {
          map[row.plan_name.toLowerCase()] = row.default_price;
        });
        document.querySelectorAll('[data-price-key]').forEach(function (el) {
          var key = (el.getAttribute('data-price-key') || '').toLowerCase();
          if (key in map) {
            el.textContent = '€' + Number(map[key]).toLocaleString('nl-NL', {
              minimumFractionDigits: 2, maximumFractionDigits: 2,
            });
          }
        });
      })
      .catch(function () { /* fallback text remains */ });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     INIT
     ───────────────────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    var locale = getLocale();
    var d      = CONTENT[locale];

    /* Expose for potential external use */
    window.vsScanAppsContent = d;

    /* Render dynamic sections */
    var tableRoot    = document.getElementById('vs-table-root');
    var pipelineRoot = document.getElementById('vs-pipeline-root');
    var faqRoot      = document.getElementById('vs-faq-root');
    var relatedRoot  = document.getElementById('vs-related-root');

    if (tableRoot)    renderTable(d.table, tableRoot);
    if (pipelineRoot) {
      /* Fall back to EN pipeline if locale translation not yet done */
      var pipelineData = d.pipeline || CONTENT.en.pipeline;
      if (pipelineData) renderTable(pipelineData, pipelineRoot);
    }
    if (relatedRoot) renderRelated(d, relatedRoot);
    if (faqRoot)     renderFaq(d, faqRoot);

    /* FAQ accordion */
    document.querySelectorAll('.v2-faq-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.closest('.v2-faq-acc-item').classList.toggle('open');
      });
    });

    /* Fill dynamic prices */
    fillPrices();
  });

})();
