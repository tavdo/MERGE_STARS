#!/usr/bin/env bash
# Start site after build — no npm rebuild. Run on server once (or after reboot).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-$REPO_ROOT}"

cd "$DEPLOY_DIR"

echo "==> MERGE STARS go-live from $DEPLOY_DIR"

if [ ! -f frontend/dist/index.html ]; then
  echo "ERROR: frontend/dist/index.html missing — run: bash deploy/deploy.sh"
  exit 1
fi
if [ ! -f backend/dist/main.js ]; then
  echo "ERROR: backend/dist/main.js missing — run: bash deploy/deploy.sh"
  exit 1
fi

export DEPLOY_DIR
export DEPLOY_USER="$(whoami)"
bash "$SCRIPT_DIR/bootstrap.sh"

echo "==> Start backend (production)"
systemctl restart merge-stars-backend
systemctl enable merge-stars-backend
sleep 1
systemctl is-active merge-stars-backend && echo "    backend: running on port ${PORT:-3000}" || {
  echo "    backend FAILED — logs:"
  journalctl -u merge-stars-backend -n 20 --no-pager
  exit 1
}

echo "==> Reload nginx (serves frontend/dist on port 80)"
nginx -t
systemctl reload nginx
systemctl enable nginx

echo "==> Firewall (allow HTTP/HTTPS if ufw active)"
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw reload
  echo "    ufw: ports 80, 443 open"
else
  echo "    ufw inactive — ensure cloud firewall allows 80/443"
fi

PUB_IP="$(curl -4 -s --max-time 3 ifconfig.me 2>/dev/null || echo YOUR_SERVER_IP)"
echo ""
echo "==> Site should be live"
echo "    Try in browser: http://${PUB_IP}/"
echo "    API test: curl -s http://127.0.0.1:3000/"
echo ""
echo "    Do NOT use: npm start (dev only)"
echo "    Production backend: systemctl status merge-stars-backend"
echo "    Frontend is static files — nginx serves frontend/dist (no npm run for frontend)"
