// tools/sync-openapi.mjs — refresh docs/api/openapi.json (served at /docs/api/openapi.json and the source of
// the generated API reference) from the portal's file, then rebuild the pages:
//   node tools/sync-openapi.mjs && python3 scripts/qr-pages/build.py
// Override the source with PODFY_PORTAL_OPENAPI=/path/to/openapi.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROOT = new URL("../", import.meta.url).pathname;
const SRC = process.env.PODFY_PORTAL_OPENAPI || new URL("../../podfy-portal/public/openapi.json", import.meta.url).pathname;
const DST = `${ROOT}docs/api/openapi.json`;
if (!existsSync(SRC)) { console.error(`source not found: ${SRC}`); process.exit(1); }
const body = readFileSync(SRC, "utf8");
JSON.parse(body); // refuse to copy a broken file
const same = existsSync(DST) && readFileSync(DST, "utf8") === body;
if (!same) writeFileSync(DST, body);
console.log(same ? "openapi.json already up to date" : "openapi.json updated; now run: python3 scripts/qr-pages/build.py");
