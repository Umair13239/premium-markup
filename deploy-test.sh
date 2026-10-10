#!/usr/bin/env bash
# Push the current website to https://test.premiummarkup.com (Oracle VM, service pm-test).
# Builds ON the server (ARM Linux). Never ships .env, node_modules, .git or big media.
set -euo pipefail
cd "$(dirname "$0")"
KEY="$HOME/.ssh/oracle_leads"; HOST=ubuntu@140.238.225.216; TGZ="$(mktemp -u).tgz"
tar --exclude=./node_modules --exclude=./.next --exclude=./.env --exclude=./.git --exclude=./wa-checker \
    --exclude=./data --exclude="./public/portfolio/assets/portfolio/*.mp4" --exclude="./Leads data .xlsx" --exclude="./docs/UI Design ideas" \
    --exclude=./docs/legacy --exclude="./*.log" -czf "$TGZ" .
scp -i "$KEY" "$TGZ" "$HOST:/tmp/web.tgz" && rm -f "$TGZ"
ssh -i "$KEY" "$HOST" 'set -e; cd /opt/pm-test/src && find . -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .env ! -name .next ! -name .lock.prev -exec rm -rf {} + && tar xzf /tmp/web.tgz \
  && (cmp -s package-lock.json .lock.prev || (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 PUPPETEER_SKIP_DOWNLOAD=1 npm ci --no-audit --no-fund >/opt/pm-test/install.log 2>&1 && cp package-lock.json .lock.prev)) \
  && (npm run build >/opt/pm-test/build.log 2>&1 || { tail -30 /opt/pm-test/build.log; exit 1; }) \
  && cp -r public .next/standalone/ && mkdir -p .next/standalone/.next && rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/ \
  && sudo systemctl restart pm-test && sleep 3 && curl -s -o /dev/null -w "test site: %{http_code}\n" http://127.0.0.1:3101/'
