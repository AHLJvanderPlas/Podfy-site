"""API reference page (podfy.net/docs/api, /nl/, /de/, /fr/) generated from docs/api/openapi.json.

Called by build.py (`build_api`). The intro is translated per language (INTRO below); the reference
(operations, parameters, fields, errors, curl examples) is generated from the OpenAPI file and stays
in English. Static HTML only: no Swagger UI / Redoc, no third-party scripts.

Refresh the spec copy with:  node tools/sync-openapi.mjs   (copies ../podfy-portal/public/openapi.json)
"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SPEC_PATH = os.path.join(ROOT, "docs", "api", "openapi.json")
PATH = "/docs/api/"
METHODS = ("get", "post", "put", "patch", "delete")
esc = lambda s: html.escape(str(s), quote=True)


def load_spec():
    return json.load(open(SPEC_PATH, encoding="utf-8"))


# ── copy hygiene: the site bans em/en dashes in prose ─────────────────────────────────────────
def clean(s):
    s = re.sub(r"(?<=\d)[–—](?=\d)", "-", s)
    return re.sub(r"\s*[–—]\s*", ", ", s)


def inline(s):
    """Escape, then turn `code` and **bold** into tags."""
    s = esc(clean(s))
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)


def paras(text):
    return "".join(f"<p>{inline(p.strip())}</p>" for p in (text or "").split("\n\n") if p.strip())


# ── spec helpers ───────────────────────────────────────────────────────────────────────────────
def ref(spec, node):
    while isinstance(node, dict) and "$ref" in node:
        cur = spec
        for part in node["$ref"][2:].split("/"):
            cur = cur[part]
        node = cur
    return node


def merged(spec, schema):
    """Resolve $ref and allOf into one object schema."""
    schema = ref(spec, schema)
    if "allOf" in schema:
        out = {"type": "object", "properties": {}, "required": []}
        for part in schema["allOf"]:
            p = merged(spec, part)
            for name, prop in p.get("properties", {}).items():
                old = out["properties"].get(name)
                # a later part may only narrow a property (for example `event: {const: ...}`): keep the earlier detail
                out["properties"][name] = {**ref(spec, old), **ref(spec, prop)} if old else prop
            out["required"] += [r for r in p.get("required", []) if r not in out["required"]]
        if schema.get("description"):
            out["description"] = schema["description"]
        return out
    return schema


def type_str(spec, s):
    s = ref(spec, s)
    if "allOf" in s:
        s = {**merged(spec, s), **{k: v for k, v in s.items() if k != "allOf"}}
    t = s.get("type", "object" if "properties" in s else "")
    if not t and "const" in s:
        t = {bool: "boolean", int: "integer", float: "number"}.get(type(s["const"]), "string")
    t = " or ".join(t) if isinstance(t, list) else t
    if t == "array":
        it = ref(spec, s.get("items", {}))
        t = f"array of {type_str(spec, it)[0]}"
    extra = []
    if s.get("enum"):
        extra.append("one of " + ", ".join(f"`{v}`" if v is not None else "`null`" for v in s["enum"] if v is not None))
    if "const" in s:
        extra.append(f"always `{s['const']}`")
    if s.get("format"):
        extra.append(s["format"])
    if "maxLength" in s:
        extra.append(f"max {s['maxLength']} characters")
    if "minimum" in s or "maximum" in s:
        extra.append(f"{s.get('minimum', '')}-{s.get('maximum', '')}")
    if "default" in s:
        extra.append(f"default {s['default']}")
    if s.get("pattern"):
        extra.append(f"pattern `{s['pattern']}`")
    return t, extra


def fields(spec, schema, prefix=""):
    """Flatten an object schema into rows (name, type, extra, required, description)."""
    schema = merged(spec, schema)
    req = set(schema.get("required", []))
    rows = []
    for name, raw in schema.get("properties", {}).items():
        s = ref(spec, raw)
        t, extra = type_str(spec, s)
        rows.append((prefix + name, t, extra, name in req, s.get("description", "")))
        sub = s
        if s.get("type") == "array" and isinstance(s.get("items"), dict):
            sub, name = ref(spec, s["items"]), name + "[]"
        subtypes = sub.get("type")
        if "properties" in sub or "allOf" in sub:
            if subtypes in (None, "object") or (isinstance(subtypes, list) and "object" in subtypes):
                rows += fields(spec, sub, prefix + name + ".")
    return rows


def operations(spec):
    ops = []
    for path, item in spec["paths"].items():
        shared = [ref(spec, p) for p in item.get("parameters", [])]
        for m in METHODS:
            if m not in item:
                continue
            o = item[m]
            params = shared + [ref(spec, p) for p in o.get("parameters", [])]
            ops.append({"method": m.upper(), "path": path, "id": o["operationId"], "summary": o["summary"],
                        "description": o.get("description", ""), "scope": o.get("x-podfy-scope", ""),
                        "params": params, "body": o.get("requestBody"), "responses": o["responses"]})
    return ops


def server(spec):
    return spec["servers"][0]["url"]


def example_value(spec, name, s):
    s = ref(spec, s)
    if s.get("examples"):
        return s["examples"][0]
    if s.get("enum"):
        vals = [v for v in s["enum"] if v is not None]
        return vals[1] if len(vals) > 1 else vals[0]
    t = s.get("type")
    t = [x for x in t if x != "null"][0] if isinstance(t, list) else t
    if s.get("format") == "email":
        return "name@example.com"
    return {"integer": 1, "number": 1, "boolean": True}.get(t, "example")


def path_example(spec, p):
    s = ref(spec, p.get("schema", {}))
    if s.get("examples"):
        return s["examples"][0]
    for sc in spec["components"]["schemas"].values():  # same property elsewhere in the spec
        ex = sc.get("properties", {}).get(p["name"], {}).get("examples")
        if ex:
            return ex[0]
    return "YOUR_" + p["name"].upper()


def curl(spec, op):
    path = op["path"]
    for p in op["params"]:
        if p["in"] == "path":
            path = path.replace("{" + p["name"] + "}", str(path_example(spec, p)))
    query = [f"{p['name']}={ref(spec, p.get('schema', {})).get('default')}" for p in op["params"]
             if p["in"] == "query" and "default" in ref(spec, p.get("schema", {}))]
    url = server(spec) + path + ("?" + "&".join(query) if query else "")
    lines = [f"curl -X {op['method']} \\" if op["method"] != "GET" else "curl \\", f'  -H "Authorization: Bearer $PODFY_API_KEY" \\']
    etag = None
    for r in op["responses"].values():
        h = ref(spec, r).get("headers", {}).get("ETag")
        if h:
            etag = ref(spec, h).get("example")
    for prm in op["params"]:
        if prm["in"] == "header":
            val = prm.get("example") or (etag if prm["name"] in ("If-Match", "If-None-Match") else None)
            if val:
                lines.append(f'  -H "{prm["name"]}: {str(val).replace(chr(34), chr(92) + chr(34))}" \\')
    if op["body"]:
        schema = merged(spec, op["body"]["content"]["application/json"]["schema"])
        props, req = schema.get("properties", {}), schema.get("required", [])
        names = req + [n for n in props if n not in req][: 1 if req else 2]
        body = {n: example_value(spec, n, props[n]) for n in names}
        lines.append('  -H "Content-Type: application/json" \\')
        lines.append("  -d '" + json.dumps(body, ensure_ascii=False) + "' \\")
    lines.append(f'  "{url}"')
    return "\n".join(lines)


def error_rows(spec, op):
    out = []
    for status, r in op["responses"].items():
        if not status.startswith(("4", "5")):
            continue
        r = ref(spec, r)
        m = re.search(r"Codes?: ([^.]*)\.?$", r["description"])
        codes = re.findall(r"`([^`]+)`", m.group(1)) if m else []
        out.append((status, codes, re.sub(r"\s*Codes?: .*$", "", r["description"])))
    return out


def all_error_rows(spec, ops):
    seen = {}
    for op in ops:
        for status, codes, text in error_rows(spec, op):
            seen.setdefault((status, tuple(codes)), text)
    return sorted((s, list(c), t) for (s, c), t in seen.items())


def response_headers(spec, r):
    """[(name, type, description)] of a response's headers ($ref resolved)."""
    out = []
    for name, h in (r.get("headers") or {}).items():
        h = ref(spec, h)
        out.append((name, type_str(spec, h.get("schema", {}))[0], h.get("description", "")))
    return out


def examples_of(spec, r):
    """[(summary, value)] of the JSON examples of a response."""
    media = (r.get("content") or {}).get("application/json") or {}
    out = [(e.get("summary", name), e["value"]) for name, e in (media.get("examples") or {}).items() if "value" in e]
    if not out and "example" in media:
        out = [("Example", media["example"])]
    return out


def error_code_rows(spec):
    """(code, status, meaning) parsed from the description of the Error schema's `code` enum."""
    err = spec["components"]["schemas"].get("Error", {})
    code = err.get("properties", {}).get("error", {}).get("properties", {}).get("code", {})
    desc = code.get("description", "")
    rows = []
    for m in re.finditer(r"`([a-z_]+)`: (\d{3})\. (.*?)(?= `[a-z_]+`: \d{3}\.|$)", desc):
        rows.append((m.group(1), m.group(2), m.group(3).strip()))
    return rows or [(c, "", "") for c in code.get("enum", [])]


# ── HTML ───────────────────────────────────────────────────────────────────────────────────────
def table(head, rows, cls="api-table"):
    th = "".join(f'<th scope="col">{esc(h)}</th>' for h in head)
    tr = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<div class="api-table-wrap" tabindex="0" role="region" aria-label="{esc("Table: " + ", ".join(head))}"><table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'


def code_block(text):
    return f'<pre class="api-code" tabindex="0" role="region" aria-label="Code example"><code>{esc(text)}</code></pre>'


def field_cells(spec, rows):
    out = []
    for name, t, extra, req, desc in rows:
        meta = f'<span class="api-type">{esc(t)}</span>' + ("".join(f' <span class="api-meta">{inline(e)}</span>' for e in extra))
        out.append([f"<code>{esc(name)}</code>", meta, "required" if req else "optional", inline(desc)])
    return out


def op_html(spec, op, labels):
    anchor = "op-" + op["id"]
    parts = [f'<article class="api-op" id="{anchor}" aria-labelledby="{anchor}-h">',
             f'<h3 class="api-op-title" id="{anchor}-h"><span class="api-method api-method-{op["method"].lower()}">{op["method"]}</span> <code>{esc(op["path"])}</code></h3>',
             f'<p class="api-op-summary"><strong>{esc(clean(op["summary"]))}</strong> <span class="api-scope">{esc(labels["scope"])}: <code>{esc(op["scope"])}</code></span></p>',
             f'<div class="v2-prose api-op-desc">{paras(re.sub(r"Required scope: `[^`]+`( \([^)]*\))?\.?\s*", "", op["description"]))}</div>']
    if op["params"]:
        rows = []
        for p in op["params"]:
            t, extra = type_str(spec, p.get("schema", {}))
            meta = f'<span class="api-type">{esc(t)}</span>' + "".join(f' <span class="api-meta">{inline(e)}</span>' for e in extra)
            rows.append([f"<code>{esc(p['name'])}</code>", esc(p["in"]), meta, "required" if p.get("required") else "optional", inline(p.get("description", ""))])
        parts.append(f"<h4>{esc(labels['params'])}</h4>" + table(["Name", "In", "Type", "Required", "Description"], rows))
    if op["body"]:
        schema = op["body"]["content"]["application/json"]["schema"]
        parts.append(f"<h4>{esc(labels['body'])}</h4>" + table(["Field", "Type", "Required", "Description"], field_cells(spec, fields(spec, schema))))
    ok = [(s, ref(spec, r)) for s, r in op["responses"].items() if s.startswith(("2", "3"))]
    for status, r in ok:
        schema = r.get("content", {}).get("application/json", {}).get("schema")
        parts.append(f"<h4>{esc(labels['response'])} <code>{esc(status)}</code></h4><p>{inline(r.get('description', ''))}</p>")
        if schema:
            parts.append(table(["Field", "Type", "Required", "Description"], field_cells(spec, fields(spec, schema))))
        hdrs = response_headers(spec, r)
        if hdrs:
            parts.append(f"<h5>{esc(labels['headers'])}</h5>" + table(["Header", "Type", "Description"], [[f"<code>{esc(n)}</code>", esc(t), inline(d)] for n, t, d in hdrs]))
        for summary, value in examples_of(spec, r)[:1]:
            parts.append(f"<h5>{esc(labels['resp_example'])}</h5>" + code_block(json.dumps(value, indent=2, ensure_ascii=False)))
    errs = error_rows(spec, op)
    parts.append(f"<h4>{esc(labels['errors'])}</h4>" + table(["Status", "Codes", "Meaning"], [[f"<code>{esc(s)}</code>", " ".join(f"<code>{esc(c)}</code>" for c in codes), inline(t)] for s, codes, t in errs]))
    parts.append(f"<h4>{esc(labels['example'])}</h4>" + code_block(curl(spec, op)))
    parts.append("</article>")
    return "".join(parts)


def error_shape_html(spec, labels):
    """The Error schema: shape, the `code` list with status and meaning, and the optional `detail`."""
    rows = error_code_rows(spec)
    if not rows or "Error" not in spec["components"]["schemas"]:
        return ""
    props = spec["components"]["schemas"]["Error"]["properties"]["error"]["properties"]
    detail = props.get("detail", {}).get("description", "")
    msg = props.get("message", {}).get("description", "")
    shape = code_block('{"error": {"code": "invalid_request", "message": "limit: must be a whole number from 1 to 200", "detail": "invalid_parameter"}}')
    t = table(["Code", "Status", "Meaning"], [[f"<code>{esc(c)}</code>", f"<code>{esc(st)}</code>", inline(m)] for c, st, m in rows])
    return (f'<h3 class="api-sub" id="error-shape">{esc(labels["error_schema"])}</h3>' + shape
            + f"<p>{inline('`code` is always one of the values below (use it for logic). `message`: ' + msg)}</p>" + t
            + (f"<p>{inline('`detail` (optional): ' + detail)}</p>" if detail else ""))


def webhooks_html(spec, labels):
    """A short list of the webhook events of the spec; the guide has the rest."""
    hooks = spec.get("webhooks")
    if not hooks:
        return ""
    rows = []
    for name, item in hooks.items():
        op = item.get("post") or next(iter(item.values()))
        rows.append([f"<code>{esc(name)}</code>", inline(op.get("summary", "")), inline(op.get("description", ""))])
    href = labels.get("wh_href", "/docs/webhooks/")
    return (f'<h3 class="api-sub" id="webhooks">{esc(labels["webhooks"])}</h3>'
            f'<p>{inline("PODFY pushes these events to your HTTPS endpoint, signed with `Podfy-Signature`. Payload, headers, signature verification, retries and code samples are in the")} '
            f'<a href="{esc(href)}">webhook receiver guide</a>.</p>'
            + table(["Event", "Summary", "Description"], rows))


def reference_html(spec, labels):
    ops = operations(spec)
    nav = "".join(f'<li><a href="#op-{o["id"]}"><span class="api-method api-method-{o["method"].lower()}">{o["method"]}</span> <code>{esc(o["path"])}</code> <span class="api-nav-sum">{esc(clean(o["summary"]))}</span></a></li>' for o in ops)
    errs = table(["Status", "Codes", "Meaning"], [[f"<code>{esc(s)}</code>", " ".join(f"<code>{esc(c)}</code>" for c in codes), inline(t)] for s, codes, t in all_error_rows(spec, ops)])
    shape = error_shape_html(spec, labels)
    hooks = webhooks_html(spec, labels)
    return f'''    <section class="v2-section" id="reference" aria-labelledby="ref-heading">
      <div class="container">
        <p class="v2-eyebrow">{esc(labels["ref_eyebrow"])}</p>
        <h2 class="v2-section-title" id="ref-heading">{esc(labels["ref_title"])}</h2>
        <p class="v2-prose api-note">{esc(labels["ref_note"])} <a href="{PATH}openapi.json" download>openapi.json</a></p>
        <nav class="api-nav" aria-label="{esc(labels["ops_nav"])}"><ul>{nav}</ul></nav>
        <h3 class="api-sub" id="error-codes">{esc(labels["all_errors"])}</h3>
        {errs}
        {shape}
        {hooks}
        <div class="api-ops">{"".join(op_html(spec, o, labels) for o in ops)}</div>
      </div>
    </section>'''


def llms_text(spec):
    """Plain-text summary of the operations for llms-full.txt."""
    lines = []
    for o in operations(spec):
        lines.append(f"- {o['method']} {o['path']} (scope {o['scope']}): {clean(o['summary'])}")
    return "\n".join(lines)


# ── translated intro ───────────────────────────────────────────────────────────────────────────
# Each section: (id, heading, [paragraphs], [bullets], code?)  code: "auth" -> curl with the key
INTRO = {
    "en": {
        "title": "Open API reference | PODFY",
        "desc": "Reference for the PODFY Open API: fetch proofs of delivery and QR reports, update their status and manage assets from your own systems. Part of Advanced.",
        "crumb_home": "Home", "crumb": "API reference",
        "eyebrow": "For developers", "h1": "PODFY Open API", "h1em": "reference",
        "sub": "Fetch records, update their status and manage your reference register from your own systems. A JSON REST API, part of PODFY Advanced.",
        "wh_link": "Read the webhook receiver guide",
        "download": "Download openapi.json", "contact": "Ask about Advanced", "toc": "On this page", "toc_ref": "API reference",
        "sections": [
            ("overview", "What the API is", [
                "The PODFY Open API lets your own systems read records (proofs of delivery and QR reports), update their work status and manage the reference (asset) register. It is a JSON REST API for server to server use. There is no CORS: call it from your backend, never from a browser.",
                "The Open API is part of PODFY Advanced. When it is not active for your brand, every call answers 403 feature_not_active. The specification is OpenAPI 3.1 and the reference below is generated from the same file."], [], None),
            ("keys", "Get an API key", [
                "A brand admin creates keys in the portal under Settings → Integrations → API keys. Give the key a name and choose its scopes. The key is shown once, so store it in your secrets manager. You can revoke a key at any time, and a revoked key stops working immediately."],
             ["records:read: read records", "records:write: update records (also allows reading them)", "references:read: read the reference register", "references:write: create and change references (also allows reading them)"], None),
            ("auth", "Base URL and authentication", [
                "The base URL is https://portal.podfy.net/api/v1. Send your key as a Bearer token in the Authorization header on every request. A key never works in a query parameter.",
                "A missing, malformed, unknown or revoked key always gets the same answer, 401 invalid_key. A key without the required scope gets 403 insufficient_scope."], [], "auth"),
            ("environments", "Live and test keys", [
                "Keys starting with pk_live_ see only production records. Keys starting with pk_test_ (QA records only) see only test records from qa.podfy.app, whose PODFY IDs start with QA-. The two environments never mix.",
                "The reference register is shared with production, so test keys cannot create or change references (403 read_only_key). A record or reference of another brand, or a record of the other environment, answers 404 not_found, never 403."], [], None),
            ("limits", "Rate limit", [
                "Each key may make 600 requests per minute, counted in fixed one-minute windows. Every answer for an authenticated key carries X-RateLimit-Limit, X-RateLimit-Remaining and X-RateLimit-Reset (unix seconds when the window ends).",
                "Before the key is even looked up, a second limit of 1,200 requests per minute per IP address applies. Above either limit you get 429 rate_limited with a Retry-After header (seconds). Wait that long and try again."], [], None),
            ("errors", "Errors", [
                "Every error is JSON in the same shape: {\"error\":{\"code\":\"…\",\"message\":\"…\",\"detail\":\"…\"}}. The code is one of a fixed list (the Error shape in the reference): use it for your logic. The message is for people. The optional detail names a specific reason behind a general code, for example ref_exists or invalid_transition. It is absent when there is nothing more specific, and new values may appear, so treat an unknown detail like none. Responses are never cached (Cache-Control: no-store). The full list of codes is in the reference below."], [], None),
            ("paging", "Pagination", [
                "List endpoints return {\"data\": [...], \"next_cursor\": \"…\"}. Pass next_cursor back as the cursor parameter to get the next page, until it is null. Cursors are opaque: do not build or change them. Records are listed newest first. The page size is set with limit (1 to 200, default 50)."], [], None),
            ("idempotency", "Idempotency", ["Send an Idempotency-Key header (1 to 255 visible characters) on POST and PATCH to make a retry safe. The first request with a key runs. A repeat with the same key, method, path and body returns the stored answer, marked with Idempotent-Replayed: true, and changes nothing. While the first request is still running, a repeat gets 409 idempotency_in_progress. The same key with a different request gets 422 idempotency_key_reused. Keys are kept for 24 hours per API key. After a 5xx answer the key is released, so you can retry."], [], None),
            ("conditional", "Conditional requests", ["A GET of one record, reference or refund returns an ETag. Send it back as If-None-Match to get 304 Not Modified when nothing changed. Send it as If-Match on a PATCH to change the resource only if it is still the version you read, otherwise you get 412 precondition_failed and nothing changes. If-Match is optional."], [], None),
            ("webhooks", "Webhooks", ["PODFY can also push events to your server, so you do not have to poll the API. The events are listed in the reference below, and the guide explains how to receive and verify them."], [], "webhooks"),
        ],
        "ref_eyebrow": "Reference", "ref_title": "Operations",
        "ref_note": "The reference below is generated from the OpenAPI file and is in English in every language. Download the specification:",
        "ops_nav": "Operations", "all_errors": "Error codes", "scope": "Required scope",
    },
    "nl": {
        "title": "Open API-documentatie | PODFY",
        "desc": "Documentatie van de PODFY Open API: haal bewijs en QR-meldingen op, werk de status bij en beheer objecten vanuit uw eigen systemen. Onderdeel van Advanced.",
        "crumb_home": "Home", "crumb": "API-documentatie",
        "eyebrow": "Voor ontwikkelaars", "h1": "PODFY Open API", "h1em": "documentatie",
        "sub": "Haal meldingen en bewijs op, werk de status bij en beheer uw referentieregister vanuit uw eigen systemen. Een JSON REST API, onderdeel van PODFY Advanced.",
        "wh_link": "Lees de gids voor het ontvangen van webhooks",
        "download": "Download openapi.json", "contact": "Vraag naar Advanced", "toc": "Op deze pagina", "toc_ref": "API-referentie",
        "sections": [
            ("overview", "Wat de API is", [
                "Met de PODFY Open API lezen uw eigen systemen records (afleverbewijzen en QR-meldingen), werken ze de werkstatus bij en beheren ze het referentieregister (objecten). Het is een JSON REST API voor gebruik van server naar server. Er is geen CORS: roep de API aan vanuit uw backend, nooit vanuit een browser.",
                "De Open API is onderdeel van PODFY Advanced. Is hij niet actief voor uw merk, dan antwoordt elke aanroep met 403 feature_not_active. De specificatie is OpenAPI 3.1 en de referentie hieronder is uit hetzelfde bestand gegenereerd."], [], None),
            ("keys", "Een API-sleutel aanmaken", [
                "Een beheerder van uw merk maakt sleutels aan in het portaal (dat in het Engels is) onder Settings → Integrations → API keys. Geef de sleutel een naam en kies de scopes. De sleutel wordt één keer getoond, dus bewaar hem in uw wachtwoord- of secretsbeheer. U kunt een sleutel altijd intrekken, en een ingetrokken sleutel werkt meteen niet meer."],
             ["records:read: records lezen", "records:write: records bijwerken (staat ook lezen toe)", "references:read: het referentieregister lezen", "references:write: referenties aanmaken en wijzigen (staat ook lezen toe)"], None),
            ("auth", "Basis-URL en authenticatie", [
                "De basis-URL is https://portal.podfy.net/api/v1. Stuur uw sleutel bij elk verzoek mee als Bearer-token in de Authorization-header. Een sleutel werkt nooit als queryparameter.",
                "Een ontbrekende, onjuiste, onbekende of ingetrokken sleutel krijgt altijd hetzelfde antwoord: 401 invalid_key. Een sleutel zonder de vereiste scope krijgt 403 insufficient_scope."], [], "auth"),
            ("environments", "Live- en testsleutels", [
                "Sleutels die beginnen met pk_live_ zien alleen productierecords. Sleutels die beginnen met pk_test_ (alleen QA-records) zien alleen testrecords van qa.podfy.app, waarvan de PODFY-ID's met QA- beginnen. De twee omgevingen mengen nooit.",
                "Het referentieregister wordt gedeeld met productie, dus testsleutels kunnen geen referenties aanmaken of wijzigen (403 read_only_key). Een record of referentie van een ander merk, of een record uit de andere omgeving, geeft 404 not_found, nooit 403."], [], None),
            ("limits", "Rate limit", [
                "Elke sleutel mag 600 verzoeken per minuut doen, geteld in vaste vensters van een minuut. Elk antwoord voor een geauthenticeerde sleutel bevat X-RateLimit-Limit, X-RateLimit-Remaining en X-RateLimit-Reset (unix-seconden waarop het venster eindigt).",
                "Nog voordat de sleutel wordt opgezocht geldt een tweede limiet van 1.200 verzoeken per minuut per IP-adres. Boven een van beide limieten krijgt u 429 rate_limited met een Retry-After-header (seconden). Wacht zo lang en probeer het opnieuw."], [], None),
            ("errors", "Foutmeldingen", [
                "Elke fout is JSON in dezelfde vorm: {\"error\":{\"code\":\"…\",\"message\":\"…\",\"detail\":\"…\"}}. De code komt uit een vaste lijst (de foutvorm in de referentie): gebruik die voor uw logica. Het bericht is voor mensen. Het optionele detail noemt een specifieke reden achter een algemene code, bijvoorbeeld ref_exists of invalid_transition. Het ontbreekt als er niets specifiekers is, en er kunnen nieuwe waarden bijkomen, behandel een onbekend detail dus als geen detail. Antwoorden worden nooit gecachet (Cache-Control: no-store). De volledige lijst met codes staat in de referentie hieronder."], [], None),
            ("paging", "Paginering", [
                "Lijstendpoints geven {\"data\": [...], \"next_cursor\": \"…\"} terug. Geef next_cursor door als parameter cursor om de volgende pagina te krijgen, tot hij null is. Cursors zijn ondoorzichtig: bouw of wijzig ze niet. Records staan met de nieuwste eerst. De paginagrootte stelt u in met limit (1 tot 200, standaard 50)."], [], None),
            ("idempotency", "Idempotentie", ["Stuur een Idempotency-Key-header (1 tot 255 zichtbare tekens) mee bij POST en PATCH om een nieuwe poging veilig te maken. Het eerste verzoek met een sleutel wordt uitgevoerd. Een herhaling met dezelfde sleutel, methode, pad en body geeft het opgeslagen antwoord terug, gemarkeerd met Idempotent-Replayed: true, en wijzigt niets. Terwijl het eerste verzoek nog loopt, krijgt een herhaling 409 idempotency_in_progress. Dezelfde sleutel met een ander verzoek geeft 422 idempotency_key_reused. Sleutels blijven 24 uur bewaard per API-sleutel. Na een 5xx-antwoord wordt de sleutel vrijgegeven, zodat u het opnieuw kunt proberen."], [], None),
            ("conditional", "Voorwaardelijke verzoeken", ["Een GET van één record, referentie of terugbetaling geeft een ETag terug. Stuur die terug als If-None-Match om 304 Not Modified te krijgen wanneer er niets is veranderd. Stuur hem als If-Match mee bij een PATCH om de resource alleen te wijzigen als het nog de versie is die u las, anders krijgt u 412 precondition_failed en verandert er niets. If-Match is optioneel."], [], None),
            ("webhooks", "Webhooks", ["PODFY kan ook zelf events naar uw server sturen, zodat u de API niet hoeft te bevragen. De events staan in de referentie hieronder en de gids legt uit hoe u ze ontvangt en verifieert."], [], "webhooks"),
        ],
        "ref_eyebrow": "Referentie", "ref_title": "Operaties",
        "ref_note": "De referentie hieronder is gegenereerd uit het OpenAPI-bestand en staat in elke taal in het Engels. Download de specificatie:",
        "ops_nav": "Operaties", "all_errors": "Foutcodes", "scope": "Vereiste scope",
    },
    "de": {
        "title": "Open-API-Referenz | PODFY",
        "desc": "Referenz der PODFY Open API: Liefernachweise und QR-Meldungen abrufen, Status aktualisieren und Objekte verwalten, aus Ihren Systemen. Teil von Advanced.",
        "crumb_home": "Startseite", "crumb": "API-Referenz",
        "eyebrow": "Für Entwickler", "h1": "PODFY Open API", "h1em": "Referenz",
        "sub": "Rufen Sie Meldungen und Nachweise ab, aktualisieren Sie deren Status und verwalten Sie Ihr Referenzregister aus Ihren eigenen Systemen. Eine JSON-REST-API, Teil von PODFY Advanced.",
        "wh_link": "Zum Leitfaden: Webhooks empfangen",
        "download": "openapi.json herunterladen", "contact": "Fragen zu Advanced", "toc": "Auf dieser Seite", "toc_ref": "API-Referenz",
        "sections": [
            ("overview", "Was die API ist", [
                "Mit der PODFY Open API lesen Ihre eigenen Systeme Datensätze (Liefernachweise und QR-Meldungen), aktualisieren deren Bearbeitungsstatus und verwalten das Referenzregister (Objekte). Es ist eine JSON-REST-API für den Betrieb von Server zu Server. Es gibt kein CORS: Rufen Sie die API aus Ihrem Backend auf, nie aus einem Browser.",
                "Die Open API ist Teil von PODFY Advanced. Ist sie für Ihre Marke nicht aktiv, antwortet jeder Aufruf mit 403 feature_not_active. Die Spezifikation ist OpenAPI 3.1, und die Referenz weiter unten wird aus derselben Datei erzeugt."], [], None),
            ("keys", "API-Schlüssel erstellen", [
                "Ein Administrator Ihrer Marke erstellt Schlüssel im Portal (das auf Englisch ist) unter Settings → Integrations → API keys. Geben Sie dem Schlüssel einen Namen und wählen Sie seine Scopes. Der Schlüssel wird nur einmal angezeigt, speichern Sie ihn daher in Ihrer Geheimnisverwaltung. Sie können einen Schlüssel jederzeit widerrufen, und ein widerrufener Schlüssel funktioniert sofort nicht mehr."],
             ["records:read: Datensätze lesen", "records:write: Datensätze aktualisieren (erlaubt auch Lesen)", "references:read: das Referenzregister lesen", "references:write: Referenzen anlegen und ändern (erlaubt auch Lesen)"], None),
            ("auth", "Basis-URL und Authentifizierung", [
                "Die Basis-URL lautet https://portal.podfy.net/api/v1. Senden Sie Ihren Schlüssel bei jeder Anfrage als Bearer-Token im Authorization-Header mit. Ein Schlüssel funktioniert nie als Query-Parameter.",
                "Ein fehlender, fehlerhafter, unbekannter oder widerrufener Schlüssel erhält immer dieselbe Antwort: 401 invalid_key. Ein Schlüssel ohne den erforderlichen Scope erhält 403 insufficient_scope."], [], "auth"),
            ("environments", "Live- und Testschlüssel", [
                "Schlüssel mit dem Präfix pk_live_ sehen nur Produktivdatensätze. Schlüssel mit dem Präfix pk_test_ (nur QA-Datensätze) sehen nur Testdatensätze von qa.podfy.app, deren PODFY-IDs mit QA- beginnen. Die beiden Umgebungen vermischen sich nie.",
                "Das Referenzregister wird mit der Produktion geteilt, daher können Testschlüssel keine Referenzen anlegen oder ändern (403 read_only_key). Ein Datensatz oder eine Referenz einer anderen Marke oder ein Datensatz der anderen Umgebung ergibt 404 not_found, nie 403."], [], None),
            ("limits", "Rate Limit", [
                "Jeder Schlüssel darf 600 Anfragen pro Minute stellen, gezählt in festen Minutenfenstern. Jede Antwort für einen authentifizierten Schlüssel enthält X-RateLimit-Limit, X-RateLimit-Remaining und X-RateLimit-Reset (Unix-Sekunden, zu denen das Fenster endet).",
                "Noch bevor der Schlüssel nachgeschlagen wird, gilt ein zweites Limit von 1.200 Anfragen pro Minute pro IP-Adresse. Über einem der beiden Limits erhalten Sie 429 rate_limited mit einem Retry-After-Header (Sekunden). Warten Sie diese Zeit ab und versuchen Sie es erneut."], [], None),
            ("errors", "Fehler", [
                "Jeder Fehler ist JSON in derselben Form: {\"error\":{\"code\":\"…\",\"message\":\"…\",\"detail\":\"…\"}}. Der Code stammt aus einer festen Liste (die Fehlerform in der Referenz): Nutzen Sie ihn für Ihre Logik. Die Nachricht ist für Menschen. Das optionale detail nennt einen konkreten Grund hinter einem allgemeinen Code, zum Beispiel ref_exists oder invalid_transition. Es fehlt, wenn es nichts Genaueres gibt, und es können neue Werte hinzukommen, behandeln Sie ein unbekanntes detail daher wie keines. Antworten werden nie zwischengespeichert (Cache-Control: no-store). Die vollständige Liste der Codes finden Sie in der Referenz weiter unten."], [], None),
            ("paging", "Seitenweise Abfrage", [
                "Listen-Endpunkte liefern {\"data\": [...], \"next_cursor\": \"…\"}. Geben Sie next_cursor als Parameter cursor zurück, um die nächste Seite zu erhalten, bis er null ist. Cursor sind undurchsichtig: Bauen oder ändern Sie sie nicht. Datensätze werden neueste zuerst aufgelistet. Die Seitengröße legen Sie mit limit fest (1 bis 200, Standard 50)."], [], None),
            ("idempotency", "Idempotenz", ["Senden Sie bei POST und PATCH einen Idempotency-Key-Header (1 bis 255 sichtbare Zeichen) mit, damit eine Wiederholung sicher ist. Die erste Anfrage mit einem Schlüssel wird ausgeführt. Eine Wiederholung mit demselben Schlüssel, derselben Methode, demselben Pfad und demselben Body liefert die gespeicherte Antwort, markiert mit Idempotent-Replayed: true, und ändert nichts. Läuft die erste Anfrage noch, erhält eine Wiederholung 409 idempotency_in_progress. Derselbe Schlüssel mit einer anderen Anfrage ergibt 422 idempotency_key_reused. Schlüssel werden 24 Stunden pro API-Schlüssel aufbewahrt. Nach einer 5xx-Antwort wird der Schlüssel freigegeben, sodass Sie es erneut versuchen können."], [], None),
            ("conditional", "Bedingte Anfragen", ["Ein GET auf einen einzelnen Datensatz, eine Referenz oder eine Erstattung liefert ein ETag. Senden Sie es als If-None-Match zurück, um 304 Not Modified zu erhalten, wenn sich nichts geändert hat. Senden Sie es als If-Match bei einem PATCH, um die Ressource nur zu ändern, wenn sie noch der Version entspricht, die Sie gelesen haben, sonst erhalten Sie 412 precondition_failed und nichts wird geändert. If-Match ist optional."], [], None),
            ("webhooks", "Webhooks", ["PODFY kann Ereignisse auch selbst an Ihren Server senden, damit Sie die API nicht abfragen müssen. Die Ereignisse stehen in der Referenz weiter unten, und der Leitfaden erklärt, wie Sie sie empfangen und prüfen."], [], "webhooks"),
        ],
        "ref_eyebrow": "Referenz", "ref_title": "Operationen",
        "ref_note": "Die Referenz weiter unten wird aus der OpenAPI-Datei erzeugt und ist in jeder Sprache auf Englisch. Spezifikation herunterladen:",
        "ops_nav": "Operationen", "all_errors": "Fehlercodes", "scope": "Erforderlicher Scope",
    },
    "fr": {
        "title": "Référence de l'API ouverte | PODFY",
        "desc": "Référence de l'API ouverte PODFY : récupérez preuves de livraison et signalements QR, mettez à jour leur statut, gérez vos équipements. Dans Advanced.",
        "crumb_home": "Accueil", "crumb": "Référence API",
        "eyebrow": "Pour les développeurs", "h1": "API ouverte PODFY", "h1em": "référence",
        "sub": "Récupérez les enregistrements, mettez à jour leur statut et gérez votre registre de références depuis vos propres systèmes. Une API REST JSON, incluse dans PODFY Advanced.",
        "wh_link": "Lire le guide de réception des webhooks",
        "download": "Télécharger openapi.json", "contact": "Questions sur Advanced", "toc": "Sur cette page", "toc_ref": "Référence de l'API",
        "sections": [
            ("overview", "Ce qu'est l'API", [
                "L'API ouverte PODFY permet à vos propres systèmes de lire les enregistrements (preuves de livraison et signalements QR), de mettre à jour leur statut de traitement et de gérer le registre de références (équipements). C'est une API REST JSON pour un usage de serveur à serveur. Il n'y a pas de CORS : appelez l'API depuis votre backend, jamais depuis un navigateur.",
                "L'API ouverte est incluse dans PODFY Advanced. Si elle n'est pas active pour votre marque, chaque appel répond 403 feature_not_active. La spécification est au format OpenAPI 3.1 et la référence ci-dessous est générée à partir du même fichier."], [], None),
            ("keys", "Obtenir une clé API", [
                "Un administrateur de votre marque crée les clés dans le portail (en anglais), sous Settings → Integrations → API keys. Donnez un nom à la clé et choisissez ses scopes. La clé n'est affichée qu'une fois : conservez-la dans votre gestionnaire de secrets. Vous pouvez révoquer une clé à tout moment, et une clé révoquée cesse de fonctionner immédiatement."],
             ["records:read : lire les enregistrements", "records:write : mettre à jour les enregistrements (autorise aussi la lecture)", "references:read : lire le registre de références", "references:write : créer et modifier des références (autorise aussi la lecture)"], None),
            ("auth", "URL de base et authentification", [
                "L'URL de base est https://portal.podfy.net/api/v1. Envoyez votre clé comme jeton Bearer dans l'en-tête Authorization à chaque requête. Une clé ne fonctionne jamais comme paramètre de requête.",
                "Une clé absente, mal formée, inconnue ou révoquée reçoit toujours la même réponse : 401 invalid_key. Une clé sans le scope requis reçoit 403 insufficient_scope."], [], "auth"),
            ("environments", "Clés live et clés de test", [
                "Les clés qui commencent par pk_live_ ne voient que les enregistrements de production. Les clés qui commencent par pk_test_ (enregistrements QA uniquement) ne voient que les enregistrements de test de qa.podfy.app, dont les ID PODFY commencent par QA-. Les deux environnements ne se mélangent jamais.",
                "Le registre de références est partagé avec la production : les clés de test ne peuvent donc ni créer ni modifier de références (403 read_only_key). Un enregistrement ou une référence d'une autre marque, ou un enregistrement de l'autre environnement, répond 404 not_found, jamais 403."], [], None),
            ("limits", "Limite de débit", [
                "Chaque clé peut effectuer 600 requêtes par minute, comptées par fenêtres fixes d'une minute. Chaque réponse pour une clé authentifiée contient X-RateLimit-Limit, X-RateLimit-Remaining et X-RateLimit-Reset (secondes unix de la fin de la fenêtre).",
                "Avant même la recherche de la clé, une seconde limite de 1 200 requêtes par minute et par adresse IP s'applique. Au-delà de l'une ou l'autre limite, vous recevez 429 rate_limited avec un en-tête Retry-After (secondes). Attendez ce délai, puis réessayez."], [], None),
            ("errors", "Erreurs", [
                "Chaque erreur est un JSON de même forme : {\"error\":{\"code\":\"…\",\"message\":\"…\",\"detail\":\"…\"}}. Le code vient d'une liste fixe (la forme d'erreur de la référence) : utilisez-le pour votre logique. Le message s'adresse aux personnes. Le champ optionnel detail nomme une raison précise derrière un code général, par exemple ref_exists ou invalid_transition. Il est absent quand il n'y a rien de plus précis, et de nouvelles valeurs peuvent apparaître : traitez un detail inconnu comme une absence de detail. Les réponses ne sont jamais mises en cache (Cache-Control: no-store). La liste complète des codes figure dans la référence ci-dessous."], [], None),
            ("paging", "Pagination", [
                "Les points de terminaison de liste renvoient {\"data\": [...], \"next_cursor\": \"…\"}. Renvoyez next_cursor comme paramètre cursor pour obtenir la page suivante, jusqu'à ce qu'il soit null. Les curseurs sont opaques : ne les construisez pas et ne les modifiez pas. Les enregistrements sont listés du plus récent au plus ancien. La taille de page se règle avec limit (de 1 à 200, 50 par défaut)."], [], None),
            ("idempotency", "Idempotence", ["Envoyez un en-tête Idempotency-Key (1 à 255 caractères visibles) avec POST et PATCH pour rendre une nouvelle tentative sûre. La première requête avec une clé est exécutée. Une répétition avec la même clé, la même méthode, le même chemin et le même corps renvoie la réponse enregistrée, marquée Idempotent-Replayed: true, et ne modifie rien. Tant que la première requête est en cours, une répétition reçoit 409 idempotency_in_progress. La même clé avec une requête différente reçoit 422 idempotency_key_reused. Les clés sont conservées 24 heures par clé API. Après une réponse 5xx, la clé est libérée : vous pouvez réessayer."], [], None),
            ("conditional", "Requêtes conditionnelles", ["Un GET d'un seul enregistrement, d'une référence ou d'un remboursement renvoie un ETag. Renvoyez-le dans If-None-Match pour obtenir 304 Not Modified quand rien n'a changé. Envoyez-le dans If-Match avec un PATCH pour ne modifier la ressource que si elle est toujours dans la version que vous avez lue, sinon vous recevez 412 precondition_failed et rien ne change. If-Match est facultatif."], [], None),
            ("webhooks", "Webhooks", ["PODFY peut aussi envoyer lui-même des événements à votre serveur, sans que vous interrogiez l'API. Les événements sont listés dans la référence ci-dessous et le guide explique comment les recevoir et les vérifier."], [], "webhooks"),
        ],
        "ref_eyebrow": "Référence", "ref_title": "Opérations",
        "ref_note": "La référence ci-dessous est générée à partir du fichier OpenAPI et reste en anglais dans toutes les langues. Téléchargez la spécification :",
        "ops_nav": "Opérations", "all_errors": "Codes d'erreur", "scope": "Scope requis",
    },
}
# The generated reference is English whatever the page language: its labels stay English too.
REF_LABELS = {"scope": "Required scope", "params": "Parameters", "body": "Request body (JSON)", "response": "Response", "errors": "Errors", "example": "Example",
              "headers": "Response headers", "resp_example": "Example response", "webhooks": "Webhooks", "error_schema": "Error shape"}


TOKEN = re.compile(r"(\{&quot;error.*?\}\}|\{&quot;data.*?&quot;\}|https://portal\.podfy\.net/api/v1|\b\d{3} [a-z_]+_[a-z_]+\b|\bpk_(?:live|test)_|\bQA-(?=\W)|qa\.podfy\.app|\bX-RateLimit-\w+|\bRetry-After\b|\bAuthorization\b|\bnext_cursor\b|\bCache-Control: no-store|\b(?:records|references):(?:read|write)\b|\bcursor\b(?= parameter| param)|\bparameter cursor\b|\blimit\b(?= \()|\bBearer\b|\b(?:Idempotency-Key|Idempotent-Replayed|If-None-Match|If-Match|ETag)\b|\bread_only_key\b)")


def intro_inline(text):
    out = TOKEN.sub(lambda m: "<code>" + m.group(1).replace("parameter cursor", "cursor") + "</code>" if m.group(1) != "parameter cursor" else "parameter <code>cursor</code>", esc(clean(text)))
    return out


def intro_html(spec, t, prefix=""):
    out = []
    for sid, h, ps, bullets, code in t["sections"]:
        body = "".join(f"<p>{intro_inline(p)}</p>" for p in ps)
        if bullets:
            body += '<ul class="v2-check-list">' + "".join(f"<li>{intro_inline(b)}</li>" for b in bullets) + "</ul>"
        if code == "webhooks":
            body += f'<p><a class="v2-link" href="{esc(prefix)}/docs/webhooks/">{esc(t["wh_link"])} &rarr;</a></p>'
        if code == "auth":
            body += code_block(f'curl -H "Authorization: Bearer $PODFY_API_KEY" \\\n  "{server(spec)}/records?limit=10"')
        out.append(f'''    <section class="v2-section" id="{sid}" aria-labelledby="{sid}-h">
      <div class="container">
        <h2 class="v2-section-title" id="{sid}-h">{esc(h)}</h2>
        <div class="v2-prose api-intro">{body}</div>
      </div>
    </section>''')
    return "\n\n".join(out)
