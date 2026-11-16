"""Webhook receiver guide (podfy.net/docs/webhooks, /nl/, /de/, /fr/).

Called by build.py (`build_webhooks`). The intro (what a webhook is here, set up and test, allowed targets) is translated
per language (INTRO below); the reference (events, headers, payload, verification, samples, rotation, retries,
idempotency) stays in English, like the API reference. Static HTML, no third-party script.

The Node.js and Python verification samples are plain strings (NODE_VERIFY, PY_VERIFY) rendered into the page.
tests/webhook-docs.test.mjs extracts the Node sample from the generated page and proves it against the shared signing
implementation (plans/process-core.js `signWebhook`). The worked example is computed here with the Python standard
library, so the signature on the page is a real one.
"""
import hashlib, hmac, json, re

import apidocs
from apidocs import esc, inline, table, code_block

PATH = "/docs/webhooks/"
EVENTS = [
    ("pod.created", "A new record of a brand in delivery mode (a proof of delivery was uploaded).", ""),
    ("report.created", "A new record of a brand in report mode (a QR report was submitted).", ""),
    ("record.status_changed", "The work status of a record changed (portal, bulk change or API).", "Adds `change`."),
    ("record.updated", "Another field of a record changed: `assignee`, `priority` or `duplicate_of`. One event per changed field. A comment alone sends nothing.", "Adds `change`."),
    ("webhook.test", "A brand admin pressed Send test in the portal.", "A sample or the latest record, with the real headers and signature."),
    ("refund.approved", "A refund request was approved. PODFY records and forwards the request; it never pays out.", "Only when the webhook lists it by name. Adds `record.refund`."),
    ("refund.updated", "A refund was rejected, or its payout result (`paid` or `failed`) was recorded through the API.", "Only when the webhook lists it by name. Adds `record.refund`."),
]

# ── the worked example: a real signature, computed with the standard library ──────────────────
EX_SECRET = "whsec_0123456789abcdef0123456789abcdef0123456789abcdef"
EX_T = 1795000000
EX_DELIVERY = "dlv_3f9a0c1d2e4b5a69c0de"
EX_PAYLOAD = {
    "id": "evt_5d1e8a07b3c94f2a61d0e7f8", "version": 1, "event": "report.created",
    "created_at": "2026-11-16T09:24:00Z", "brand": "acme",
    "record": {
        "podfy_id": "PFY-7Q4K2-1", "mode": "report", "reference": "COFFEE-1",
        "asset": {"name": "Coffee machine", "location": "Floor 2", "group": "B"},
        "category": "NOT_WORKING", "priority": "high", "work_status": "new", "note": "Makes a grinding noise",
        "fields": {"floor": "2"}, "group_id": "PFY-7Q4K2",
        "files": [{"name": "photo.jpg", "url": "https://portal.podfy.net/api/public/pod/3f9a0c1d2e4b5a69/file"}],
        "location": None, "duplicate_of": None, "url": "https://portal.podfy.net/pod/3f9a0c1d2e4b5a69",
        "updated_at": "2026-11-16T09:24:00Z",
    },
}
EX_BODY = json.dumps(EX_PAYLOAD, separators=(",", ":"), ensure_ascii=False)


def _hmac(secret, text):
    return hmac.new(secret.encode(), text.encode(), hashlib.sha256).hexdigest()


def example_header(secret=EX_SECRET, previous=None):
    parts = [f"t={EX_T}"]
    for s in [secret] + ([previous] if previous else []):
        parts.append("v1=" + _hmac(s, f"{EX_T}.{EX_BODY}"))
        parts.append("v2=" + _hmac(s, f"{EX_T}.{EX_DELIVERY}.{EX_BODY}"))
    return ",".join(parts)


# ── code samples (standard library only) ───────────────────────────────────────────────────────
NODE_VERIFY = '''const crypto = require("node:crypto");

// rawBody: the request body exactly as received (Buffer), never re-serialised JSON.
// For a GET webhook pass the full request URL instead of a body.
function verifyPodfyWebhook(secret, signatureHeader, deliveryId, rawBody, nowSeconds = Math.floor(Date.now() / 1000)) {
  let t = null;
  const v1 = [];
  const v2 = [];
  for (const part of String(signatureHeader || "").split(",")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key === "t") t = value;
    else if (key === "v1") v1.push(value);
    else if (key === "v2") v2.push(value);
  }
  const timestamp = Number(t);
  if (!t || !Number.isFinite(timestamp)) return false;
  if (Math.abs(nowSeconds - timestamp) > 300) return false; // older (or newer) than 5 minutes

  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), "utf8");
  const sign = (prefix) =>
    crypto.createHmac("sha256", secret).update(prefix).update(body).digest("hex");
  const equal = (a, b) =>
    a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

  // v2 also binds the delivery id (recommended). During a secret rotation the header holds two pairs:
  // accept the request when any of them matches.
  if (deliveryId && v2.length) {
    const expected = sign(`${t}.${deliveryId}.`);
    return v2.some((candidate) => equal(expected, candidate));
  }
  const expected = sign(`${t}.`);
  return v1.some((candidate) => equal(expected, candidate));
}

module.exports = { verifyPodfyWebhook };
'''

NODE_SERVER = '''const http = require("node:http");
const { verifyPodfyWebhook } = require("./verify");

const secret = process.env.PODFY_WEBHOOK_SECRET;
const seen = new Set(); // use a database or cache with an expiry in production

http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const rawBody = Buffer.concat(chunks);
    const ok = verifyPodfyWebhook(secret, req.headers["podfy-signature"], req.headers["podfy-delivery"], rawBody);
    if (!ok) { res.writeHead(400).end(); return; }

    res.writeHead(200).end("ok"); // answer within 10 seconds, then process
    const event = JSON.parse(rawBody.toString("utf8"));
    if (seen.has(event.id)) return; // a retry of an event you already handled
    seen.add(event.id);
    console.log(event.event, event.record.podfy_id);
  });
}).listen(3000);
'''

PY_VERIFY = '''import hashlib
import hmac
import time


def verify_podfy_webhook(secret, signature_header, delivery_id, raw_body, now=None):
    """raw_body: the request body as bytes, exactly as received (for a GET webhook: the full URL as bytes)."""
    t, v1, v2 = None, [], []
    for part in (signature_header or "").split(","):
        key, _, value = part.strip().partition("=")
        if key == "t":
            t = value
        elif key == "v1":
            v1.append(value)
        elif key == "v2":
            v2.append(value)
    try:
        timestamp = int(t)
    except (TypeError, ValueError):
        return False
    if abs((time.time() if now is None else now) - timestamp) > 300:  # older (or newer) than 5 minutes
        return False

    def sign(prefix):
        return hmac.new(secret.encode(), prefix.encode() + raw_body, hashlib.sha256).hexdigest()

    # v2 also binds the delivery id (recommended). During a secret rotation the header holds two pairs:
    # accept the request when any of them matches.
    if delivery_id and v2:
        expected, candidates = sign(f"{t}.{delivery_id}."), v2
    else:
        expected, candidates = sign(f"{t}."), v1
    return any(hmac.compare_digest(expected, c) for c in candidates)
'''

PY_SERVER = '''from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os

SECRET = os.environ["PODFY_WEBHOOK_SECRET"]
seen = set()  # use a database or cache with an expiry in production


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        raw_body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        ok = verify_podfy_webhook(SECRET, self.headers.get("Podfy-Signature"), self.headers.get("Podfy-Delivery"), raw_body)
        self.send_response(200 if ok else 400)
        self.end_headers()
        if not ok:
            return
        event = json.loads(raw_body)  # answered first in real code: queue the work
        if event["id"] in seen:  # a retry of an event you already handled
            return
        seen.add(event["id"])
        print(event["event"], event["record"]["podfy_id"])


HTTPServer(("", 3000), Handler).serve_forever()
'''

# ── translated intro ───────────────────────────────────────────────────────────────────────────
INTRO = {
    "en": {
        "title": "Webhook receiver guide | PODFY",
        "desc": "How to receive and verify PODFY webhooks: events, payload, signature (v1, v2), retries, idempotency and code samples in Node.js and Python.",
        "crumb_home": "Home", "crumb": "Webhook guide",
        "eyebrow": "For developers", "h1": "Webhook", "h1em": "receiver guide",
        "sub": "Receive PODFY events on your own server and check that every request is genuine: signature, retries and code samples.",
        "api_btn": "API reference", "toc": "On this page", "toc_ref": "Reference",
        "sections": [
            ("overview", "What a webhook is here", [
                "A webhook is a request that PODFY sends to your server when something happens: a proof of delivery or a report arrives, a work status changes, or a refund is approved. You do not have to poll the API. Every request is signed, so your server can check that it really comes from PODFY and was not changed on the way.",
                "This page explains how to receive webhooks. The events and the format of the body are listed in the reference below, in English like the API reference. The REST API is described in the API reference."]),
            ("setup", "Set up and test a webhook", [
                "A brand admin adds a webhook in the portal under Settings → Integrations → Webhooks (Add webhook). Enter the HTTPS address of your receiver and choose the events. The secret PODFY signs with is shown once, so store it in your secrets manager. With New secret you create a new one: the old secret keeps working for 24 hours, so you can switch your receiver without missing a request.",
                "Send test sends a webhook.test event with the real headers and signature to your address, so you can test your verification before real events arrive. The delivery log in the portal shows the response code of every attempt, and Resend sends a delivery again.",
                "If you have no receiver yet, ask PODFY support for a test inbox address. It accepts the signed requests and shows what arrived. A webhook receives either production records or only test records from qa.podfy.app, depending on its QA setting."]),
            ("targets", "Where PODFY sends", [
                "PODFY only sends to HTTPS addresses with a public host name on port 443. IP addresses, addresses with a user name or password, hosts of PODFY itself and hosts under workers.dev or pages.dev are refused when you save the webhook. PODFY does not follow redirects, so enter the final address.",
                "A webhook can also use GET with its own query string (custom payload). The signature then covers the full URL, see the reference."]),
        ],
        "ref_eyebrow": "Reference", "ref_title": "Receiving webhooks",
        "ref_note": "The reference below is in English in every language, like the API reference.",
    },
    "nl": {
        "title": "Webhooks ontvangen | PODFY",
        "desc": "Zo ontvangt en verifieert u PODFY-webhooks: events, payload, handtekening (v1, v2), nieuwe pogingen en codevoorbeelden in Node.js en Python.",
        "crumb_home": "Home", "crumb": "Webhooks ontvangen",
        "eyebrow": "Voor ontwikkelaars", "h1": "Webhooks", "h1em": "ontvangen",
        "sub": "Ontvang PODFY-events op uw eigen server en controleer dat elk verzoek echt is: handtekening, nieuwe pogingen en codevoorbeelden.",
        "api_btn": "API-documentatie", "toc": "Op deze pagina", "toc_ref": "Referentie",
        "sections": [
            ("overview", "Wat een webhook hier is", [
                "Een webhook is een verzoek dat PODFY naar uw server stuurt zodra er iets gebeurt: er komt een afleverbewijs of een melding binnen, een werkstatus verandert of een terugbetaling wordt goedgekeurd. U hoeft de API niet steeds te bevragen. Elk verzoek is ondertekend, zodat uw server kan controleren dat het echt van PODFY komt en onderweg niet is gewijzigd.",
                "Deze pagina laat zien hoe u webhooks ontvangt. De events en de opbouw van de body staan in de referentie hieronder, in het Engels, net als de API-documentatie. De REST API staat in de API-documentatie."]),
            ("setup", "Een webhook instellen en testen", [
                "Een beheerder van uw merk voegt een webhook toe in het portaal (dat in het Engels is) onder Settings → Integrations → Webhooks, met Add webhook. Vul het HTTPS-adres van uw ontvanger in en kies de events. Het geheim waarmee PODFY ondertekent wordt één keer getoond, dus bewaar het in uw secretsbeheer. Met New secret maakt u een nieuw geheim aan: het oude blijft 24 uur werken, zodat u uw ontvanger kunt omzetten zonder een verzoek te missen.",
                "Met Send test stuurt PODFY een webhook.test-event met de echte headers en handtekening naar uw adres, zodat u uw verificatie kunt testen voordat echte events binnenkomen. Het afleverlogboek in het portaal toont per poging de responscode, en met Resend verstuurt u een aflevering opnieuw.",
                "Heeft u nog geen ontvanger, vraag dan de support van PODFY om een testinbox. Die accepteert de ondertekende verzoeken en toont wat er is aangekomen. Een webhook ontvangt ofwel productierecords, ofwel alleen testrecords van qa.podfy.app, afhankelijk van de QA-instelling."]),
            ("targets", "Waarheen PODFY verstuurt", [
                "PODFY verstuurt alleen naar HTTPS-adressen met een publieke hostnaam op poort 443. IP-adressen, adressen met gebruikersnaam of wachtwoord, hosts van PODFY zelf en hosts onder workers.dev of pages.dev worden bij het opslaan geweigerd. PODFY volgt geen redirects: geef dus het uiteindelijke adres op.",
                "Een webhook kan ook GET gebruiken met een eigen querystring (aangepaste payload). De handtekening dekt dan de volledige URL, zie de referentie."]),
        ],
        "ref_eyebrow": "Referentie", "ref_title": "Webhooks ontvangen",
        "ref_note": "De referentie hieronder staat in elke taal in het Engels, net als de API-documentatie.",
    },
    "de": {
        "title": "Webhooks empfangen | PODFY",
        "desc": "So empfangen und prüfen Sie PODFY-Webhooks: Ereignisse, Payload, Signatur (v1, v2), Wiederholungen und Codebeispiele in Node.js und Python.",
        "crumb_home": "Startseite", "crumb": "Webhooks empfangen",
        "eyebrow": "Für Entwickler", "h1": "Webhooks", "h1em": "empfangen",
        "sub": "Empfangen Sie PODFY-Ereignisse auf Ihrem eigenen Server und prüfen Sie, dass jede Anfrage echt ist: Signatur, Wiederholungen und Codebeispiele.",
        "api_btn": "API-Referenz", "toc": "Auf dieser Seite", "toc_ref": "Referenz",
        "sections": [
            ("overview", "Was ein Webhook hier ist", [
                "Ein Webhook ist eine Anfrage, die PODFY an Ihren Server sendet, sobald etwas passiert: Ein Liefernachweis oder eine Meldung geht ein, ein Bearbeitungsstatus ändert sich oder eine Erstattung wird freigegeben. Sie müssen die API nicht ständig abfragen. Jede Anfrage ist signiert, sodass Ihr Server prüfen kann, dass sie wirklich von PODFY kommt und unterwegs nicht verändert wurde.",
                "Diese Seite zeigt, wie Sie Webhooks empfangen. Die Ereignisse und der Aufbau des Bodys stehen in der Referenz weiter unten, auf Englisch wie die API-Referenz. Die REST-API ist in der API-Referenz beschrieben."]),
            ("setup", "Webhook einrichten und testen", [
                "Ein Administrator Ihrer Marke legt einen Webhook im Portal (das auf Englisch ist) unter Settings → Integrations → Webhooks an, mit Add webhook. Tragen Sie die HTTPS-Adresse Ihres Empfängers ein und wählen Sie die Ereignisse. Das Geheimnis, mit dem PODFY signiert, wird nur einmal angezeigt, speichern Sie es daher in Ihrer Geheimnisverwaltung. Mit New secret erzeugen Sie ein neues Geheimnis: Das alte funktioniert noch 24 Stunden, sodass Sie Ihren Empfänger umstellen können, ohne eine Anfrage zu verpassen.",
                "Mit Send test sendet PODFY ein webhook.test-Ereignis mit den echten Headern und der echten Signatur an Ihre Adresse, damit Sie Ihre Prüfung testen können, bevor echte Ereignisse eintreffen. Das Zustellprotokoll im Portal zeigt den Antwortcode jedes Versuchs, und mit Resend senden Sie eine Zustellung erneut.",
                "Haben Sie noch keinen Empfänger, bitten Sie den PODFY-Support um eine Test-Inbox. Sie nimmt die signierten Anfragen an und zeigt, was angekommen ist. Ein Webhook erhält je nach QA-Einstellung entweder Produktivdatensätze oder nur Testdatensätze von qa.podfy.app."]),
            ("targets", "Wohin PODFY sendet", [
                "PODFY sendet nur an HTTPS-Adressen mit öffentlichem Hostnamen auf Port 443. IP-Adressen, Adressen mit Benutzername oder Passwort, Hosts von PODFY selbst sowie Hosts unter workers.dev oder pages.dev werden beim Speichern abgelehnt. PODFY folgt keinen Weiterleitungen: Tragen Sie daher die endgültige Adresse ein.",
                "Ein Webhook kann auch GET mit einer eigenen Query-Zeichenfolge verwenden (benutzerdefinierte Payload). Die Signatur deckt dann die vollständige URL ab, siehe Referenz."]),
        ],
        "ref_eyebrow": "Referenz", "ref_title": "Webhooks empfangen",
        "ref_note": "Die Referenz weiter unten ist in jeder Sprache auf Englisch, wie die API-Referenz.",
    },
    "fr": {
        "title": "Recevoir les webhooks | PODFY",
        "desc": "Comment recevoir et vérifier les webhooks PODFY : événements, payload, signature (v1, v2), nouvelles tentatives et exemples en Node.js et Python.",
        "crumb_home": "Accueil", "crumb": "Guide des webhooks",
        "eyebrow": "Pour les développeurs", "h1": "Guide des", "h1em": "webhooks",
        "sub": "Recevez les événements PODFY sur votre propre serveur et vérifiez que chaque requête est authentique : signature, nouvelles tentatives et exemples de code.",
        "api_btn": "Référence de l'API", "toc": "Sur cette page", "toc_ref": "Référence",
        "sections": [
            ("overview", "Ce qu'est un webhook ici", [
                "Un webhook est une requête que PODFY envoie à votre serveur dès qu'il se passe quelque chose : une preuve de livraison ou un signalement arrive, un statut de traitement change ou un remboursement est approuvé. Vous n'avez pas à interroger l'API en continu. Chaque requête est signée : votre serveur peut ainsi vérifier qu'elle vient bien de PODFY et n'a pas été modifiée en chemin.",
                "Cette page explique comment recevoir les webhooks. Les événements et le format du corps de la requête figurent dans la référence ci-dessous, en anglais, comme la référence de l'API. L'API REST est décrite dans la référence de l'API."]),
            ("setup", "Configurer et tester un webhook", [
                "Un administrateur de votre marque ajoute un webhook dans le portail (en anglais), sous Settings → Integrations → Webhooks, avec Add webhook. Saisissez l'adresse HTTPS de votre récepteur et choisissez les événements. Le secret avec lequel PODFY signe n'est affiché qu'une fois : conservez-le dans votre gestionnaire de secrets. Avec New secret, vous créez un nouveau secret : l'ancien reste valable 24 heures, ce qui vous laisse le temps de basculer votre récepteur sans manquer une requête.",
                "Avec Send test, PODFY envoie un événement webhook.test avec les vrais en-têtes et la vraie signature à votre adresse, pour que vous puissiez tester votre vérification avant l'arrivée d'événements réels. Le journal des envois du portail affiche le code de réponse de chaque tentative, et Resend renvoie un envoi.",
                "Si vous n'avez pas encore de récepteur, demandez au support PODFY une boîte de test. Elle accepte les requêtes signées et montre ce qui est arrivé. Selon son réglage QA, un webhook reçoit soit les enregistrements de production, soit uniquement les enregistrements de test de qa.podfy.app."]),
            ("targets", "Où PODFY envoie", [
                "PODFY n'envoie qu'à des adresses HTTPS dont le nom d'hôte est public, sur le port 443. Les adresses IP, les adresses avec identifiant ou mot de passe, les hôtes de PODFY lui-même et les hôtes sous workers.dev ou pages.dev sont refusés à l'enregistrement. PODFY ne suit pas les redirections : indiquez donc l'adresse finale.",
                "Un webhook peut aussi utiliser GET avec sa propre chaîne de requête (charge utile personnalisée). La signature couvre alors l'URL complète, voir la référence."]),
        ],
        "ref_eyebrow": "Référence", "ref_title": "Recevoir les webhooks",
        "ref_note": "La référence ci-dessous reste en anglais dans toutes les langues, comme la référence de l'API.",
    },
}

# Technical tokens that stay as <code> in the translated intro (same idea as apidocs.TOKEN).
INTRO_TOKEN = re.compile(r"(Settings → Integrations → Webhooks|Add webhook|New secret|Send test|Resend|webhook\.test|qa\.podfy\.app|workers\.dev|pages\.dev|\bGET\b|\bQA\b(?=-))")


def intro_inline(text):
    return INTRO_TOKEN.sub(lambda m: "<code>" + m.group(1) + "</code>", esc(apidocs.clean(text)))


def intro_html(t):
    out = []
    for sid, h, ps in t["sections"]:
        body = "".join(f"<p>{intro_inline(p)}</p>" for p in ps)
        out.append(f'''    <section class="v2-section" id="{sid}" aria-labelledby="{sid}-h">
      <div class="container">
        <h2 class="v2-section-title" id="{sid}-h">{esc(h)}</h2>
        <div class="v2-prose api-intro">{body}</div>
      </div>
    </section>''')
    return "\n\n".join(out)


# ── English reference ──────────────────────────────────────────────────────────────────────────
def pre_block(text, ident=None):
    i = f' id="{ident}"' if ident else ""
    return f'<pre class="api-code" tabindex="0"><code{i}>{esc(text)}</code></pre>'


def sub(ident, title, *parts):
    return f'<h3 class="api-sub" id="{ident}">{esc(title)}</h3>' + "".join(parts)


def p(text):
    return f"<p>{inline(text)}</p>"


def ul(items):
    return '<ul class="v2-check-list">' + "".join(f"<li>{inline(i)}</li>" for i in items) + "</ul>"


def ol(items):
    return "<ol>" + "".join(f"<li>{inline(i)}</li>" for i in items) + "</ol>"


def reference_html(t):
    ev = table(["Event", "Sent when", "Notes"], [[f"<code>{esc(e)}</code>", inline(w), inline(n)] for e, w, n in EVENTS])
    hdr = table(["Header", "Value"], [
        ["<code>Podfy-Signature</code>", inline("`t=<unix seconds>,v1=<hex>,v2=<hex>`. See Verify the signature.")],
        ["<code>Podfy-Delivery</code>", inline("Unique delivery id (`dlv_…`). Identical on every retry of the same delivery.")],
        ["<code>Podfy-Event</code>", inline("The event name, as in the body.")],
        ["<code>Content-Type</code>", inline("`application/json` for the standard payload. A custom webhook sends the content type you chose.")],
        ["<code>User-Agent</code>", inline("`PODFY-Webhooks/1.0`")],
    ])
    fields = table(["Field", "Type", "Description"], [
        ["<code>id</code>", "string", inline("Event id (`evt_…`). Use it as an idempotency key.")],
        ["<code>version</code>", "integer", inline("Payload format version, `1`. Bumped only for a breaking change; new fields do not bump it.")],
        ["<code>event</code>", "string", inline("One of the events above.")],
        ["<code>created_at</code>", "string", inline("ISO 8601 time of the event.")],
        ["<code>brand</code>", "string", inline("The brand slug.")],
        ["<code>record</code>", "object", inline("The record: `podfy_id`, `mode`, `reference`, `asset`, `category`, `priority`, `work_status`, `note`, `fields`, `group_id`, `files`, `location`, `duplicate_of`, `url` and `updated_at` (time of the last change of the record).")],
        ["<code>change</code>", "object", inline("Only on `record.status_changed` and `record.updated`: `{field, from, to}`.")],
        ["<code>record.refund</code>", "object", inline("Only on `refund.approved` and `refund.updated`: `{id, amount, currency, pay_ref, status, decided_at, result}`. Use `refund.id` as your idempotency key. The approver's e-mail is never included.")],
    ])
    pretty = json.dumps(EX_PAYLOAD, indent=2, ensure_ascii=False)
    worked = (
        p("Secret, delivery id and body below are an example you can run your code against. The body is the exact string that was signed. Every character counts, so use the raw bytes you receive.")
        + table(["Part", "Value"], [
            ["Secret", f'<code id="we-secret">{esc(EX_SECRET)}</code>'],
            ["<code>t</code>", f'<code id="we-t">{EX_T}</code>'],
            ["<code>Podfy-Delivery</code>", f'<code id="we-delivery">{esc(EX_DELIVERY)}</code>'],
        ])
        + "<p><strong>Body</strong></p>" + pre_block(EX_BODY, "we-body")
        + "<p><strong>Podfy-Signature</strong></p>" + pre_block(example_header(), "we-header")
        + p("With a rotation in progress the header holds a second `v1`/`v2` pair made with the previous secret, for example `t=…,v1=A,v2=A,v1=B,v2=B`.")
    )
    verify = sub("verify", "Verify the signature",
        p("Check every request before you trust it. You need the secret of the webhook, the `Podfy-Signature` and `Podfy-Delivery` headers and the raw request body."),
        ol([
            "Split `Podfy-Signature` at the commas. Take `t` and every `v1` and `v2` value.",
            "Reject the request when `t` is more than 5 minutes (300 seconds) away from your clock.",
            "Compute `v2` = HMAC-SHA256 (hex) with your secret of `t + \".\" + delivery id + \".\" + raw body`, where the delivery id is the `Podfy-Delivery` header. This is recommended: it also binds the delivery id, so a captured request cannot be replayed under another one.",
            "`v1` = HMAC-SHA256 (hex) of `t + \".\" + raw body`. It stays valid and is what you check when you do not use the delivery id.",
            "Compare your value with the received one in constant time. Accept the request when any received pair matches (during a rotation there are two pairs).",
            "Answer with a 2xx status. A request that fails verification should get a 4xx and no further processing.",
        ]),
        p("Sign the raw bytes. Parsing the JSON and serialising it again changes spacing and key order, and the signature will not match. A GET webhook has no body: the signed content is the full request URL as sent, including the query string."),
        sub("worked-example", "Worked example", worked))
    samples = sub("samples", "Code samples",
        p("Both samples use only the standard library of the language. They check the timestamp, compare in constant time, prefer `v2` when the delivery id is available and accept any matching pair."),
        '<h4 class="api-sample-h">Node.js: verify.js</h4>' + pre_block(NODE_VERIFY, "sample-node"),
        '<h4 class="api-sample-h">Node.js: a receiver</h4>' + pre_block(NODE_SERVER, "sample-node-server"),
        '<h4 class="api-sample-h">Python: verify.py</h4>' + pre_block(PY_VERIFY, "sample-python"),
        '<h4 class="api-sample-h">Python: a receiver</h4>' + pre_block(PY_SERVER, "sample-python-server"))
    rotation = sub("rotation", "Secret rotation",
        p("When a brand admin creates a new secret (New secret in the portal), the previous secret stays valid for 24 hours. During that time every request carries a second `v1`/`v2` pair signed with the previous secret. Accept the request when any pair matches: a receiver that still has the old secret and one that already has the new secret both verify. After 24 hours only the new secret signs."))
    delivery = sub("delivery", "Delivery, retries and idempotency",
        ul([
            "Answer with any 2xx status within 10 seconds. Anything else, a timeout or a network error counts as a failure. Redirects are not followed. Answer first and process afterwards.",
            "A failed delivery is tried again after 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours and 12 hours. After that it is marked `failed`. A delivery that stays `pending` is put back in the queue automatically. The delivery log in the portal shows every attempt, and Resend sends a delivery again by hand.",
            "A delivery can arrive more than once (a retry after a timeout, or a resend). Treat the event `id` (and the `Podfy-Delivery` header) as the idempotency key: store the ids you handled and ignore a repeat. For refunds use `record.refund.id`.",
            "Events of one record can arrive out of order. Use `record.updated_at` to ignore an older event.",
            "Receivers must tolerate new fields. New fields are added without a new `version`; only a breaking change raises `version`.",
            "A webhook with a custom payload sends your own body and content type. The headers and the signature are the same, and the signature covers the body as sent.",
        ]))
    targets = sub("targets", "Allowed targets",
        ul(["HTTPS only, on port 443, with a public host name. No IP addresses, no user name or password in the URL, no `podfy.app` or `podfy.net` hosts (except a PODFY test inbox address), no `workers.dev` or `pages.dev`, no local or internal host names.",
            "The address is checked when you save the webhook. Variables of a custom payload are allowed in the query string and the body only, never in the scheme, host or path."]))
    return f'''    <section class="v2-section" id="reference" aria-labelledby="ref-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(t["ref_eyebrow"])}</p>
        <h2 class="v2-section-title" id="ref-heading">{esc(t["ref_title"])}</h2>
        <p class="v2-prose api-note">{esc(t["ref_note"])}</p>
        {sub("events", "Events", p("A webhook subscribes to the events it lists, or to all standard events with `*`. `*` never matches the refund events: list `refund.approved` and `refund.updated` by name."), ev)}
        {sub("request", "The request", p("PODFY sends a signed request to your URL for every event (POST with a JSON body, or GET for a custom webhook)."), hdr)}
        {sub("payload", "The payload", p("This is the standard body. A custom webhook sends the body you built from the template."), fields, "<p><strong>Example: report.created</strong></p>", pre_block(pretty))}
        {verify}
        {samples}
        {rotation}
        {delivery}
        {targets}
      </div>
    </section>'''


def llms_text():
    lines = [f"- {e}: {w}" for e, w, _n in EVENTS]
    return "\n".join(lines)
