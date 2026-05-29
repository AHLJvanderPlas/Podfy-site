/* /assets/advisor.js — Podfy Plan Advisor
   Self-contained IIFE. No framework, no external deps.
   Mounts into <div id="advisor-root"> on all 4 /pricing locale pages.
*/
(function () {
  'use strict';

  /* =========================================================================
     CONSTANTS
     ========================================================================= */

  var TOTAL_STEPS = 5;

  /* Plan base rates per POD */
  var PLAN_RATES = { basic: 0.10, starter: 0.39, advanced: 0.69, pro: 0.99 };

  /* Volume midpoints (PODs used for estimate) */
  var VOLUME_MAP = { vol_50: 30, vol_200: 125, vol_600: 400, vol_600plus: 700 };

  /* Add-on rates for Basic only (all included in paid plans) */
  var BASIC_ADDON = {
    feat_gps:       0.15,
    feat_portal:    0.10,
    feat_damage:    0.15,
    feat_brand:     0.12,
    feat_cmr:       0.08,
    feat_retention: 0.13
  };

  /* Plan feature inclusion matrix — 8 features in order:
     0: GPS  1: Email  2: Brand link  3: Portal  4: Roles  5: Damage  6: CMR  7: Retention */
  var PLAN_FEATURES = {
    basic:    [true,  true,  false, false, false, false, false, false],
    starter:  [true,  true,  true,  false, false, false, false, false],
    advanced: [true,  true,  true,  true,  true,  true,  false, false],
    pro:      [true,  true,  true,  true,  true,  true,  true,  true ]
  };

  /* =========================================================================
     TRANSLATIONS
     ========================================================================= */

  var I18N = {
    en: {
      teaser_label: 'Not sure which plan fits?',
      teaser_cta:   'Find out in 60 seconds',
      step_of:      'Step {n} of 5',
      back:         'Back',
      next:         'Next',
      see_result:   'See my plan',

      q1:      'How many deliveries do you handle per month?',
      q1_hint: 'Pick the range closest to your current volume.',
      opt_vol_50:       'Up to 50',
      opt_vol_200:      '50 – 200',
      opt_vol_600:      '200 – 600',
      opt_vol_600plus:  '600 or more',

      q2:      'Why do you need proof of delivery?',
      q2_hint: 'Select all that apply.',
      opt_reason_invoice:     'Faster invoicing',
      opt_reason_invoice_sub: 'Get paid sooner with documented delivery',
      opt_reason_dispute:     'Dispute protection',
      opt_reason_dispute_sub: 'Defend claims with GPS-timestamped evidence',
      opt_reason_audit:       'Audit / tax compliance',
      opt_reason_audit_sub:   'Meet Belastingdienst or legal retention rules',
      opt_reason_shipper:     'Shipper requires it',
      opt_reason_shipper_sub: 'Your clients insist on digital POD',

      q3:      'Who manages deliveries at your company?',
      q3_hint: 'Pick the description closest to your setup.',
      opt_org_solo:       'Just me',
      opt_org_solo_sub:   'I drive and manage everything myself',
      opt_org_office:     'Me + office staff',
      opt_org_office_sub: 'One or two people handle admin and reporting',
      opt_org_team:       'A team of planners and drivers',
      opt_org_team_sub:   'Multiple roles need access to delivery records',

      q4:      'What matters most to you?',
      q4_hint: 'Select all that apply.',
      opt_feat_gps:       'GPS-stamped, legally defensible PODs',
      opt_feat_portal:    'Search and archive past deliveries',
      opt_feat_damage:    'Damage / exception reporting',
      opt_feat_brand:     'Branded PDFs with company logo',
      opt_feat_cmr:       'Generate CMR waybills',
      opt_feat_retention: 'Long-term storage (5–7 years)',

      q5:      'How do you prefer to pay?',
      q5_hint: 'Choose the billing model that feels right.',
      opt_pay_flexible:        'Pay per delivery',
      opt_pay_flexible_sub:    'Full control — pay only for what you upload',
      opt_pay_predictable:     'One simple price',
      opt_pay_predictable_sub: 'Everything included, easy to budget',

      result_eyebrow:      'Your recommendation',
      result_desc_basic:   'A lean entry point for small operations. Pay per POD, GPS-stamped, email notification on every upload.',
      result_desc_starter: 'The right foundation for growing carriers. Branded upload link, GPS timestamps, email routing — all for a simple per-POD price.',
      result_desc_advanced:'Full portal access for teams. Search, filter, and audit deliveries. Multi-user roles, damage reporting, and branded PDFs.',
      result_desc_pro:     'Everything in Advanced plus long-term archiving and built-in compliance. Designed for operations where documentation must be defensible for years.',
      result_est_label:    'month · based on {n} PODs',
      result_retention_lbl:'Document retention:',
      result_retention_basic:   '30 days',
      result_retention_starter: '120 days',
      result_retention_advanced:'1 year',
      result_retention_pro:     '5 years',

      feat_gps:       'GPS-stamped, timestamped PODs',
      feat_email:     'Email notification on upload',
      feat_brand:     'Branded upload link',
      feat_portal:    'Delivery portal access',
      feat_roles:     'Multi-user portal roles',
      feat_damage:    'Damage / exception reporting',
      feat_cmr:       'CMR waybill generator',
      feat_retention: 'Long-term retention (5–7 years)',

      cta_trial:   'Start free trial',
      cta_restart: 'Restart',

      plan_basic:    'Basic',
      plan_starter:  'Starter',
      plan_advanced: 'Advanced',
      plan_pro:      'Pro'
    },

    nl: {
      teaser_label: 'Weet u niet welk abonnement bij u past?',
      teaser_cta:   'Ontdek het in 60 seconden',
      step_of:      'Stap {n} van 5',
      back:         'Terug',
      next:         'Volgende',
      see_result:   'Zie mijn plan',

      q1:      'Hoeveel leveringen verwerkt u per maand?',
      q1_hint: 'Kies het bereik dat het dichtst bij uw huidige volume ligt.',
      opt_vol_50:       'Tot 50',
      opt_vol_200:      '50 – 200',
      opt_vol_600:      '200 – 600',
      opt_vol_600plus:  '600 of meer',

      q2:      'Waarom heeft u een afleveringsbewijs nodig?',
      q2_hint: 'Selecteer alles wat van toepassing is.',
      opt_reason_invoice:     'Sneller factureren',
      opt_reason_invoice_sub: 'Sneller betaald worden met gedocumenteerde levering',
      opt_reason_dispute:     'Bescherming bij geschillen',
      opt_reason_dispute_sub: 'Verdedig claims met GPS-tijdgestempeld bewijs',
      opt_reason_audit:       'Audit / belastingnaleving',
      opt_reason_audit_sub:   'Voldoen aan Belastingdienst of wettelijke bewaartermijnen',
      opt_reason_shipper:     'Opdrachtgever vereist het',
      opt_reason_shipper_sub: 'Uw klanten staan op digitale afleveringsbewijzen',

      q3:      'Wie beheert leveringen in uw bedrijf?',
      q3_hint: 'Kies de beschrijving die het beste bij uw situatie past.',
      opt_org_solo:       'Alleen ik',
      opt_org_solo_sub:   'Ik rijd en beheer alles zelf',
      opt_org_office:     'Ik + kantoorbemanning',
      opt_org_office_sub: 'Één of twee mensen regelen administratie en rapportage',
      opt_org_team:       'Een team van planners en chauffeurs',
      opt_org_team_sub:   'Meerdere rollen hebben toegang nodig tot afleveringsregistraties',

      q4:      'Wat is het belangrijkst voor u?',
      q4_hint: 'Selecteer alles wat van toepassing is.',
      opt_feat_gps:       'GPS-gestempelde, juridisch verdedigbare PODs',
      opt_feat_portal:    'Zoeken en archiveren van eerdere leveringen',
      opt_feat_damage:    'Schade- / uitzonderingsrapportage',
      opt_feat_brand:     'Gepersonaliseerde PDF\'s met bedrijfslogo',
      opt_feat_cmr:       'CMR-vrachtbrieven genereren',
      opt_feat_retention: 'Langdurige opslag (5–7 jaar)',

      q5:      'Hoe betaalt u het liefst?',
      q5_hint: 'Kies het factureringsmodel dat het beste bij u past.',
      opt_pay_flexible:        'Betaal per levering',
      opt_pay_flexible_sub:    'Volledige controle — betaal alleen voor wat u uploadt',
      opt_pay_predictable:     'Één eenvoudige prijs',
      opt_pay_predictable_sub: 'Alles inbegrepen, eenvoudig te budgetteren',

      result_eyebrow:      'Uw aanbeveling',
      result_desc_basic:   'Een compacte instap voor kleine operaties. Betaal per POD, GPS-gestempeld, e-mailmelding bij elke upload.',
      result_desc_starter: 'De juiste basis voor groeiende vervoerders. Gepersonaliseerde uploadlink, GPS-tijdstempels, e-mailroutering — voor een eenvoudige prijs per POD.',
      result_desc_advanced:'Volledige portaaltoegang voor teams. Zoek, filter en auditeer leveringen. Meerdere gebruikersrollen, schademelding en gepersonaliseerde PDF\'s.',
      result_desc_pro:     'Alles uit Advanced plus langdurige archivering en ingebouwde compliance. Ontworpen voor operaties waarbij documentatie jarenlang verdedigbaar moet zijn.',
      result_est_label:    'maand · gebaseerd op {n} PODs',
      result_retention_lbl:'Documentbewaartermijn:',
      result_retention_basic:   '30 dagen',
      result_retention_starter: '120 dagen',
      result_retention_advanced:'1 jaar',
      result_retention_pro:     '5 jaar',

      feat_gps:       'GPS-gestempelde, tijdgestempelde PODs',
      feat_email:     'E-mailmelding bij upload',
      feat_brand:     'Gepersonaliseerde uploadlink',
      feat_portal:    'Toegang leveringsportal',
      feat_roles:     'Meerdere portalrollen',
      feat_damage:    'Schade- / uitzonderingsrapportage',
      feat_cmr:       'CMR-vrachtbrief generator',
      feat_retention: 'Langdurige bewaring (5–7 jaar)',

      cta_trial:   'Gratis proefperiode starten',
      cta_restart: 'Opnieuw beginnen',

      plan_basic:    'Basic',
      plan_starter:  'Starter',
      plan_advanced: 'Advanced',
      plan_pro:      'Pro'
    },

    de: {
      teaser_label: 'Unsicher, welcher Tarif zu Ihnen passt?',
      teaser_cta:   'In 60 Sekunden herausfinden',
      step_of:      'Schritt {n} von 5',
      back:         'Zurück',
      next:         'Weiter',
      see_result:   'Mein Tarif anzeigen',

      q1:      'Wie viele Lieferungen bearbeiten Sie pro Monat?',
      q1_hint: 'Wählen Sie den Bereich, der Ihrem aktuellen Volumen am nächsten kommt.',
      opt_vol_50:       'Bis zu 50',
      opt_vol_200:      '50 – 200',
      opt_vol_600:      '200 – 600',
      opt_vol_600plus:  '600 oder mehr',

      q2:      'Warum benötigen Sie einen Liefernachweis?',
      q2_hint: 'Wählen Sie alles Zutreffende aus.',
      opt_reason_invoice:     'Schnellere Rechnungsstellung',
      opt_reason_invoice_sub: 'Schneller bezahlt werden mit dokumentierter Lieferung',
      opt_reason_dispute:     'Reklamationsschutz',
      opt_reason_dispute_sub: 'Ansprüche mit GPS-zeitgestempelten Nachweisen verteidigen',
      opt_reason_audit:       'GoBD / Steuerkonformität',
      opt_reason_audit_sub:   'GoBD-Aufbewahrungspflichten und Betriebsprüfungen erfüllen',
      opt_reason_shipper:     'Auftraggeber verlangt es',
      opt_reason_shipper_sub: 'Ihre Kunden bestehen auf digitalen Liefernachweisen',

      q3:      'Wer verwaltet Lieferungen in Ihrem Unternehmen?',
      q3_hint: 'Wählen Sie die Beschreibung, die am besten zu Ihrer Situation passt.',
      opt_org_solo:       'Nur ich',
      opt_org_solo_sub:   'Ich fahre und verwalte alles selbst',
      opt_org_office:     'Ich + Büropersonal',
      opt_org_office_sub: 'Eine oder zwei Personen kümmern sich um Verwaltung und Berichte',
      opt_org_team:       'Ein Team aus Disponenten und Fahrern',
      opt_org_team_sub:   'Mehrere Rollen benötigen Zugriff auf Lieferdaten',

      q4:      'Was ist Ihnen am wichtigsten?',
      q4_hint: 'Wählen Sie alles Zutreffende aus.',
      opt_feat_gps:       'GPS-gestempelte, rechtssichere Liefernachweise',
      opt_feat_portal:    'Frühere Lieferungen suchen und archivieren',
      opt_feat_damage:    'Schaden- / Ausnahmemeldung',
      opt_feat_brand:     'Markierte PDFs mit Firmenlogo',
      opt_feat_cmr:       'CMR-Frachtbriefe erstellen',
      opt_feat_retention: 'Langzeitarchivierung (5–10 Jahre, GoBD)',

      q5:      'Wie möchten Sie bezahlen?',
      q5_hint: 'Wählen Sie das Abrechnungsmodell, das für Sie passt.',
      opt_pay_flexible:        'Pro Lieferung zahlen',
      opt_pay_flexible_sub:    'Volle Kontrolle — zahlen Sie nur für das, was Sie hochladen',
      opt_pay_predictable:     'Ein einfacher Preis',
      opt_pay_predictable_sub: 'Alles inklusive, einfach zu budgetieren',

      result_eyebrow:      'Ihre Empfehlung',
      result_desc_basic:   'Ein schlanker Einstieg für kleine Betriebe. Bezahlen Sie pro Liefernachweis, GPS-gestempelt, E-Mail-Benachrichtigung bei jedem Upload.',
      result_desc_starter: 'Die richtige Grundlage für wachsende Transportunternehmen. Markierter Upload-Link, GPS-Zeitstempel, E-Mail-Weiterleitung — zu einem einfachen Preis pro POD.',
      result_desc_advanced:'Vollständiger Portalzugang für Teams. Lieferungen suchen, filtern und prüfen. Mehrere Benutzerrollen, Schadensmeldung und markierte PDFs.',
      result_desc_pro:     'Alles aus Advanced plus Langzeitarchivierung und eingebauter GoBD-Konformität. Entwickelt für Betriebe, bei denen Dokumentation jahrelang rechtssicher sein muss.',
      result_est_label:    'Monat · basierend auf {n} PODs',
      result_retention_lbl:'Aufbewahrungsfrist:',
      result_retention_basic:   '30 Tage',
      result_retention_starter: '120 Tage',
      result_retention_advanced:'1 Jahr',
      result_retention_pro:     '10 Jahre (GoBD)',

      feat_gps:       'GPS-gestempelte, zeitgestempelte Liefernachweise',
      feat_email:     'E-Mail-Benachrichtigung bei Upload',
      feat_brand:     'Markierter Upload-Link',
      feat_portal:    'Lieferungsportal-Zugang',
      feat_roles:     'Mehrere Portalrollen',
      feat_damage:    'Schaden- / Ausnahmemeldung',
      feat_cmr:       'CMR-Frachtbrief-Generator',
      feat_retention: 'Langzeitarchivierung (GoBD 10 Jahre)',

      cta_trial:   'Kostenlos testen',
      cta_restart: 'Neu starten',

      plan_basic:    'Basic',
      plan_starter:  'Starter',
      plan_advanced: 'Advanced',
      plan_pro:      'Pro'
    },

    fr: {
      teaser_label: 'Vous ne savez pas quelle formule choisir ?',
      teaser_cta:   'Trouvez-le en 60 secondes',
      step_of:      'Étape {n} sur 5',
      back:         'Retour',
      next:         'Suivant',
      see_result:   'Voir ma formule',

      q1:      'Combien de livraisons traitez-vous par mois ?',
      q1_hint: 'Choisissez la fourchette la plus proche de votre volume actuel.',
      opt_vol_50:       'Jusqu’à 50',
      opt_vol_200:      '50 – 200',
      opt_vol_600:      '200 – 600',
      opt_vol_600plus:  '600 ou plus',

      q2:      'Pourquoi avez-vous besoin d’une preuve de livraison ?',
      q2_hint: 'Sélectionnez tout ce qui s’applique.',
      opt_reason_invoice:     'Facturation plus rapide',
      opt_reason_invoice_sub: 'Être payé plus vite grâce à une livraison documentée',
      opt_reason_dispute:     'Protection contre les litiges',
      opt_reason_dispute_sub: 'Défendez vos droits avec des preuves horodatées GPS',
      opt_reason_audit:       'Conformité fiscale et audit',
      opt_reason_audit_sub:   'Respecter les obligations légales de conservation (code de commerce)',
      opt_reason_shipper:     'Votre donneur d’ordre l’exige',
      opt_reason_shipper_sub: 'Vos clients insistent sur les preuves de livraison numériques',

      q3:      'Qui gère les livraisons dans votre entreprise ?',
      q3_hint: 'Choisissez la description la plus proche de votre situation.',
      opt_org_solo:       'Rien que moi',
      opt_org_solo_sub:   'Je conduis et gère tout moi-même',
      opt_org_office:     'Moi et mon équipe admin',
      opt_org_office_sub: 'Une ou deux personnes gèrent l’administration et les rapports',
      opt_org_team:       'Une équipe de planificateurs et chauffeurs',
      opt_org_team_sub:   'Plusieurs rôles ont besoin d’accès aux données de livraison',

      q4:      'Qu’est-ce qui compte le plus pour vous ?',
      q4_hint: 'Sélectionnez tout ce qui s’applique.',
      opt_feat_gps:       'PODs horodatées GPS, juridiquement opposables',
      opt_feat_portal:    'Recherche et archivage des livraisons passées',
      opt_feat_damage:    'Rapport d’avarie / d’exception',
      opt_feat_brand:     'PDF personalisés avec logo de l’entreprise',
      opt_feat_cmr:       'Générer des lettres de voiture CMR',
      opt_feat_retention: 'Conservation longue durée (5–7 ans)',

      q5:      'Comment préférez-vous payer ?',
      q5_hint: 'Choisissez le modèle de facturation qui vous convient.',
      opt_pay_flexible:        'Payer par livraison',
      opt_pay_flexible_sub:    'Contrôle total — ne payez que ce que vous téléversez',
      opt_pay_predictable:     'Un prix tout inclus',
      opt_pay_predictable_sub: 'Tout inclus, facile à budgétiser',

      result_eyebrow:      'Votre recommandation',
      result_desc_basic:   'Un point d’entrée sobre pour les petites opérations. Payez par POD, horodaté GPS, notification e-mail à chaque téléversement.',
      result_desc_starter: 'La bonne base pour les transporteurs en croissance. Lien d’envoi personnalisé, horodatage GPS, routage e-mail — le tout à un tarif simple par POD.',
      result_desc_advanced:'Accès complet au portail pour les équipes. Recherchez, filtrez et auditez les livraisons. Rôles multi-utilisateurs, rapports d’avarie et PDF personnalisés.',
      result_desc_pro:     'Tout l’Advanced plus l’archivage longue durée et la conformité intégrée. Conçu pour les opérations où la documentation doit rester opposable pendant des années.',
      result_est_label:    'mois · basé sur {n} PODs',
      result_retention_lbl:'Conservation des documents :',
      result_retention_basic:   '30 jours',
      result_retention_starter: '120 jours',
      result_retention_advanced:'1 an',
      result_retention_pro:     '5 ans',

      feat_gps:       'PODs horodatées GPS et datées',
      feat_email:     'Notification e-mail à l’upload',
      feat_brand:     'Lien d’envoi personnalisé',
      feat_portal:    'Accès au portail de livraison',
      feat_roles:     'Rôles multi-utilisateurs',
      feat_damage:    'Rapport d’avarie / d’exception',
      feat_cmr:       'Générateur de lettres de voiture CMR',
      feat_retention: 'Conservation longue durée (5–7 ans)',

      cta_trial:   'Démarrer l’essai gratuit',
      cta_restart: 'Recommencer',

      plan_basic:    'Basic',
      plan_starter:  'Starter',
      plan_advanced: 'Advanced',
      plan_pro:      'Pro'
    }
  };

  /* =========================================================================
     STEP DEFINITIONS
     ========================================================================= */

  var STEPS = [
    {
      qKey: 'q1', hintKey: 'q1_hint', multi: false, cols: 4,
      options: [
        { key: 'vol_50',      label: 'opt_vol_50' },
        { key: 'vol_200',     label: 'opt_vol_200' },
        { key: 'vol_600',     label: 'opt_vol_600' },
        { key: 'vol_600plus', label: 'opt_vol_600plus' }
      ]
    },
    {
      qKey: 'q2', hintKey: 'q2_hint', multi: true, cols: 2,
      options: [
        { key: 'reason_invoice', label: 'opt_reason_invoice', sub: 'opt_reason_invoice_sub' },
        { key: 'reason_dispute', label: 'opt_reason_dispute', sub: 'opt_reason_dispute_sub' },
        { key: 'reason_audit',   label: 'opt_reason_audit',   sub: 'opt_reason_audit_sub' },
        { key: 'reason_shipper', label: 'opt_reason_shipper', sub: 'opt_reason_shipper_sub' }
      ]
    },
    {
      qKey: 'q3', hintKey: 'q3_hint', multi: false, cols: 3,
      options: [
        { key: 'org_solo',   label: 'opt_org_solo',   sub: 'opt_org_solo_sub' },
        { key: 'org_office', label: 'opt_org_office', sub: 'opt_org_office_sub' },
        { key: 'org_team',   label: 'opt_org_team',   sub: 'opt_org_team_sub' }
      ]
    },
    {
      qKey: 'q4', hintKey: 'q4_hint', multi: true, cols: 3,
      options: [
        { key: 'feat_gps',       label: 'opt_feat_gps' },
        { key: 'feat_portal',    label: 'opt_feat_portal' },
        { key: 'feat_damage',    label: 'opt_feat_damage' },
        { key: 'feat_brand',     label: 'opt_feat_brand' },
        { key: 'feat_cmr',       label: 'opt_feat_cmr' },
        { key: 'feat_retention', label: 'opt_feat_retention' }
      ]
    },
    {
      qKey: 'q5', hintKey: 'q5_hint', multi: false, cols: 2,
      options: [
        { key: 'pay_flexible',    label: 'opt_pay_flexible',    sub: 'opt_pay_flexible_sub' },
        { key: 'pay_predictable', label: 'opt_pay_predictable', sub: 'opt_pay_predictable_sub' }
      ]
    }
  ];

  /* Feature checklist keys in order (matching PLAN_FEATURES index) */
  var FEAT_KEYS = ['feat_gps','feat_email','feat_brand','feat_portal',
                   'feat_roles','feat_damage','feat_cmr','feat_retention'];

  /* =========================================================================
     LOCALE DETECTION
     ========================================================================= */

  var _path = window.location.pathname;
  var locale = /^\/nl(\/|$)/.test(_path) ? 'nl'
             : /^\/de(\/|$)/.test(_path) ? 'de'
             : /^\/fr(\/|$)/.test(_path) ? 'fr' : 'en';

  function tr(key) {
    var lc = I18N[locale];
    return (lc && lc[key] !== undefined) ? lc[key] : (I18N.en[key] || key);
  }

  /* =========================================================================
     STATE
     ========================================================================= */

  var state = {
    open:   false,
    step:   1,
    answers: { 1: null, 2: [], 3: null, 4: [], 5: null },
    result: null
  };

  /* =========================================================================
     RECOMMENDATION LOGIC
     ========================================================================= */

  function recommend() {
    var reasons  = state.answers[2];
    var org      = state.answers[3];
    var features = state.answers[4];
    var vol      = state.answers[1];
    var pay      = state.answers[5];

    function has(arr, v) { return arr.indexOf(v) >= 0; }

    if (has(reasons, 'reason_audit') ||
        has(features, 'feat_retention') ||
        (has(features, 'feat_cmr') && has(features, 'feat_brand')) ||
        (vol === 'vol_600plus' && pay === 'pay_predictable')) {
      return 'pro';
    }
    if (has(features, 'feat_brand') ||
        has(features, 'feat_cmr') ||
        org === 'org_team' ||
        (vol === 'vol_600' && pay === 'pay_predictable')) {
      return 'advanced';
    }
    if (has(features, 'feat_portal') ||
        has(features, 'feat_damage') ||
        has(features, 'feat_gps') ||
        vol === 'vol_200' || vol === 'vol_600' ||
        pay === 'pay_predictable') {
      return 'starter';
    }
    return 'basic';
  }

  function computeEstimate(plan, vol, features) {
    var pods = VOLUME_MAP[vol] || 30;
    var rate = PLAN_RATES[plan] || 0;
    if (plan === 'basic') {
      for (var i = 0; i < features.length; i++) {
        rate += BASIC_ADDON[features[i]] || 0;
      }
    }
    return Math.round(rate * pods);
  }

  /* =========================================================================
     DOM HELPERS
     ========================================================================= */

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function btn(cls, txt, onClick) {
    var b = el('button', cls, txt);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  /* =========================================================================
     RENDER
     ========================================================================= */

  function getRoot() { return document.getElementById('advisor-root'); }

  function focusFirst(container, sel) {
    var found = container.querySelector(sel || '.v2-advisor-card');
    if (found) { found.focus(); }
  }

  function render() {
    var root = getRoot();
    if (!root) return;

    /* Keep reference to previously focused element to restore after re-render */
    var activeKey = null;
    var activeFocused = document.activeElement;
    if (activeFocused && activeFocused.dataset && activeFocused.dataset.advKey) {
      activeKey = activeFocused.dataset.advKey;
    }

    root.innerHTML = '';

    if (!state.open) {
      root.appendChild(renderTeaser());
      return;
    }
    if (state.result) {
      var resultEl = renderResult();
      root.appendChild(resultEl);
      /* Move focus to result heading */
      var heading = root.querySelector('.v2-advisor-result-name');
      if (heading) { setTimeout(function () { heading.focus(); }, 50); }
      return;
    }

    var stepEl = renderStep(state.step);
    root.appendChild(stepEl);

    /* Restore focus to re-rendered card if we just toggled selection */
    if (activeKey) {
      var match = root.querySelector('[data-adv-key="' + activeKey + '"]');
      if (match) { match.focus(); return; }
    }
  }

  /* ---- Teaser ---- */
  function renderTeaser() {
    var b = el('button', 'v2-advisor-teaser');
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'advisor-body');

    var txt = el('span', 'v2-advisor-teaser-text', tr('teaser_label'));
    var arr = el('span', 'v2-advisor-teaser-arrow', tr('teaser_cta') + ' →');
    b.appendChild(txt);
    b.appendChild(arr);

    b.addEventListener('click', function () {
      state.open = true;
      render();
      /* Focus first option */
      setTimeout(function () { focusFirst(getRoot()); }, 50);
    });
    return b;
  }

  /* ---- Progress indicator ---- */
  function renderProgress(current) {
    var wrap = el('div', 'v2-advisor-progress');
    var label = tr('step_of').replace('{n}', current);
    wrap.setAttribute('aria-label', label);

    var txt = el('span', 'v2-advisor-progress-text', label);
    txt.setAttribute('aria-hidden', 'true');
    wrap.appendChild(txt);

    var dots = el('div', 'v2-advisor-dots');
    dots.setAttribute('aria-hidden', 'true');
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var cls = 'v2-advisor-dot'
        + (i === current ? ' adv-active' : '')
        + (i < current  ? ' adv-done'   : '');
      dots.appendChild(el('span', cls));
    }
    wrap.appendChild(dots);
    return wrap;
  }

  /* ---- Step ---- */
  function renderStep(n) {
    var def = STEPS[n - 1];
    var wrap = el('div', 'v2-advisor-body');
    wrap.id = 'advisor-body';

    /* Progress */
    wrap.appendChild(renderProgress(n));

    /* Question */
    var qId = 'adv-q-' + n;
    var q = el('h2', 'v2-advisor-question', tr(def.qKey));
    q.id = qId;
    wrap.appendChild(q);

    /* Hint */
    if (def.hintKey) {
      wrap.appendChild(el('p', 'v2-advisor-hint', tr(def.hintKey)));
    }

    /* Options grid */
    var grid = el('div', 'v2-advisor-grid adv-cols-' + def.cols);
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-labelledby', qId);

    var current = state.answers[n];
    var isMulti = def.multi;

    def.options.forEach(function (opt) {
      var pressed = isMulti
        ? current.indexOf(opt.key) >= 0
        : current === opt.key;

      var card = el('button', 'v2-advisor-card');
      card.type = 'button';
      card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      card.dataset.value = opt.key;
      card.dataset.advKey = 'step' + n + '-' + opt.key;

      card.appendChild(el('span', 'v2-advisor-card-label', tr(opt.label)));
      if (opt.sub) {
        card.appendChild(el('span', 'v2-advisor-card-sub', tr(opt.sub)));
      }

      card.addEventListener('click', function () {
        if (isMulti) {
          var arr = state.answers[n];
          var idx = arr.indexOf(opt.key);
          if (idx >= 0) { arr.splice(idx, 1); } else { arr.push(opt.key); }
        } else {
          state.answers[n] = opt.key;
        }
        render();
      });

      grid.appendChild(card);
    });

    wrap.appendChild(grid);

    /* Actions */
    wrap.appendChild(renderActions(n, def.multi));

    return wrap;
  }

  /* ---- Actions bar ---- */
  function renderActions(n, isMulti) {
    var div = el('div', 'v2-advisor-actions');

    if (n > 1) {
      div.appendChild(btn('v2-advisor-btn-back', tr('back'), function () {
        state.step--;
        render();
        setTimeout(function () { focusFirst(getRoot()); }, 50);
      }));
    }

    var isLast = n === TOTAL_STEPS;
    var hasSel = hasSelection(n);

    var next = btn('v2-advisor-btn-next',
      isLast ? tr('see_result') : tr('next'),
      function () {
        if (!hasSelection(n)) return;
        if (isLast) {
          state.result = recommend();
          render();
        } else {
          state.step++;
          render();
          setTimeout(function () { focusFirst(getRoot()); }, 50);
        }
      }
    );
    next.disabled = !hasSel;
    div.appendChild(next);
    return div;
  }

  function hasSelection(step) {
    var a = state.answers[step];
    return Array.isArray(a) ? a.length > 0 : a !== null;
  }

  /* ---- Result ---- */
  function renderResult() {
    var plan     = state.result;
    var vol      = state.answers[1];
    var features = state.answers[4];
    var estimate = computeEstimate(plan, vol, features);
    var pods     = VOLUME_MAP[vol] || 30;

    var localePrefix = locale === 'en' ? '' : '/' + locale;
    var contactUrl   = localePrefix + '/contact';

    var wrap = el('div', 'v2-advisor-result');

    /* Eyebrow */
    wrap.appendChild(el('p', 'v2-advisor-result-eyebrow', tr('result_eyebrow')));

    /* Plan name — receives focus */
    var nameEl = el('h2', 'v2-advisor-result-name', tr('plan_' + plan));
    nameEl.tabIndex = -1;
    wrap.appendChild(nameEl);

    /* Description */
    wrap.appendChild(el('p', 'v2-advisor-result-desc', tr('result_desc_' + plan)));

    /* Estimate chip */
    var chip = el('div', 'v2-advisor-result-estimate');
    chip.appendChild(el('span', 'v2-advisor-result-amount',
      '≈ €' + estimate));
    chip.appendChild(el('span', 'v2-advisor-result-est-label',
      tr('result_est_label').replace('{n}', pods)));
    wrap.appendChild(chip);

    /* Retention */
    wrap.appendChild(el('span', 'v2-advisor-result-retention',
      tr('result_retention_lbl') + ' ' + tr('result_retention_' + plan)));

    /* Feature checklist — split into 2 columns of 4 */
    var grid = el('div', 'v2-advisor-feat-grid');
    var included = PLAN_FEATURES[plan];

    [0, 4].forEach(function (start) {
      var ul = el('ul', 'v2-advisor-feat-list');
      for (var i = start; i < start + 4; i++) {
        var cls = 'v2-advisor-feat-item ' + (included[i] ? 'adv-inc' : 'adv-exc');
        ul.appendChild(el('li', cls, tr(FEAT_KEYS[i])));
      }
      grid.appendChild(ul);
    });
    wrap.appendChild(grid);

    /* CTA row */
    var actions = el('div', 'v2-advisor-result-actions');

    var trial = el('a', 'v2-btn v2-btn-primary',
      tr('cta_trial') + ' →');
    trial.href = contactUrl;
    actions.appendChild(trial);

    actions.appendChild(btn('v2-advisor-btn-restart', tr('cta_restart'), function () {
      state.step    = 1;
      state.answers = { 1: null, 2: [], 3: null, 4: [], 5: null };
      state.result  = null;
      render();
      setTimeout(function () { focusFirst(getRoot()); }, 50);
    }));

    wrap.appendChild(actions);
    return wrap;
  }

  /* =========================================================================
     INIT
     ========================================================================= */

  function init() {
    var root = document.getElementById('advisor-root');
    if (!root) return;
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
