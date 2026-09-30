#!/bin/bash
# deploy.sh — stage only the public site into dist/ and deploy it.
# Deploying the repo root (".") published .claude/settings.local.json (Cloudflare API token),
# wrangler.toml and the internal docs. Pages Functions still come from ./functions.
set -e
cd "$(dirname "$0")"
# Tests first (skipped for ./deploy.sh build)
if [ "$1" != "build" ]; then node --test tests/*.test.mjs >/dev/null 2>&1 || { echo "tests failed — run: npm test"; exit 1; }; fi
PROJECT=$(sed -n 's/^name *= *"\(.*\)"/\1/p' wrangler.toml | head -1)

rm -rf dist && mkdir dist
rsync -a --include '/SECURITY.md' \
  --exclude '.claude' --exclude '.git' --exclude '.wrangler' --exclude 'dist' --exclude 'node_modules' \
  --exclude 'functions' --exclude 'migrations' --exclude 'scripts' --exclude 'tests' \
  --exclude 'wrangler.toml' --exclude '.gitignore' --exclude '.DS_Store' --exclude '.dev.vars*' --exclude '.env*' \
  --exclude 'CLAUDE.md' --exclude 'README.md' --exclude 'README.MD' --exclude 'SECURITY.md' --exclude '*.md' \
  --exclude 'package.json' --exclude 'package-lock.json' --exclude 'deploy.sh' \
  ./ dist/

# Guard: never publish secrets or config, whatever the exclude list says
if find dist -name 'settings.local.json' -o -name 'wrangler.toml' -o -name '.dev.vars' -o -name 'CLAUDE.md' | grep -q .; then
  echo "refusing to deploy: secret/config file in dist/"; exit 1
fi

if [ "$1" = "build" ]; then echo "✓ dist/ staged"; exit 0; fi

wrangler pages deploy dist --project-name "$PROJECT" --branch main --commit-dirty=true "$@"
echo "✓ deployed dist/ to $PROJECT"
