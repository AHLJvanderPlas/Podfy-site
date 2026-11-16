# Rollback runbook: podfy-site

Cloudflare Pages project `podfy-site` (podfy.net). Deploys are manual (`./deploy.sh`); GitHub CI never deploys.
This file is not published: deploy.sh excludes /docs/* except docs/api/index.html and docs/api/openapi.json, and all *.md.

## 1. Decide
- Roll back when the live build is broken and a fix forward is not faster than ~15 minutes.
- Check first: is the fault in this build or in data/config (D1 row, secret, DNS)? A rollback does not undo those.
- The sitemap lastmod step (tools/sitemap-lastmod.mjs) rewrites sitemap.xml during deploy: after a rollback checkout, re-check `git status`.

## 2. Roll back the code
Option A, dashboard (fastest): Cloudflare dashboard > Workers & Pages > `podfy-site` > Deployments >
pick the last good Production deployment > Rollback to this deployment.

Option B, from the terminal (needs the Cloudflare env of the repo, see the repo CLAUDE.md; never paste tokens here):
```
npx wrangler pages deployment list --project-name podfy-site
git log --oneline -10                 # find the last good commit
git switch --detach <good-sha>        # clean tree, tests must pass
./deploy.sh
git switch -                          # back to your branch
```
The deploy script runs the tests first; a red suite blocks the redeploy (fix the test setup, do not bypass the guard).

## 3. Migrations
- Additive migrations (new table/column/index) are NOT reversed: older code ignores them. Roll the code back first, leave the schema.
- Destructive migrations (DROP, column rename/type change, data rewrite) need an explicit plan written before they ship:
  a restore point (D1 Time Travel bookmark: `wrangler d1 time-travel info <db>`; nightly R2 backup from podfy-cron),
  the reverse SQL, and the order (code that tolerates both schemas first).
- The D1 databases are shared between repos: check the other repos' CLAUDE.md before reversing anything.

## 4. Verify the rollback live
- `curl -sI https://podfy.net/` returns 200 and the cache-busted asset URLs (`?v=`) match the redeployed build (the deployment list shows the new deployment id at the top).
- Open the key flow in a browser (hard reload) and check the console for CSP/JS errors.
- Open /, /pricing, /docs/api and one localized page (nl/de/fr).
- Do not trust the deploy command's success message: confirm the served artifact changed.

## 5. Notify
- The owner (push notification via the Homey webhook, then a short message with cause, time window, rollback commit).
- The coordinator session, so the fix-forward branch is not merged on top of the bad build.
- Record it in the changelog / `plans/reports`.
