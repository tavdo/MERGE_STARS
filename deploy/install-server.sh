#!/usr/bin/env bash
# One-time Linux server setup for MERGE STARS (Node + systemd + nginx)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEPLOY_DIR="${DEPLOY_DIR:-$REPO_ROOT}"
DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"
DOMAIN="${DOMAIN:-_}"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required (v20+). Install it first, e.g.:"
  echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "  sudo apt-get install -y nodejs"
  exit 1
fi

echo "==> Install MERGE STARS server components"
echo "    Deploy dir:  $DEPLOY_DIR"
echo "    Run as user: $DEPLOY_USER"
echo "    Domain:      $DOMAIN"

if [ ! -f "$DEPLOY_DIR/.env" ]; then
  echo "==> Creating .env from .env.example"
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
  echo "    Edit $DEPLOY_DIR/.env — set FRONTEND_URL to your real domain."
fi

echo "==> Install systemd unit: merge-stars-backend"
sudo sed \
  -e "s|__DEPLOY_DIR__|$DEPLOY_DIR|g" \
  -e "s|__DEPLOY_USER__|$DEPLOY_USER|g" \
  "$SCRIPT_DIR/systemd/merge-stars-backend.service" \
  | sudo tee /etc/systemd/system/merge-stars-backend.service >/dev/null

sudo systemctl daemon-reload
sudo systemctl enable merge-stars-backend

echo "==> Install nginx site: merge-stars"
sudo sed \
  -e "s|__DEPLOY_DIR__|$DEPLOY_DIR|g" \
  -e "s|__DOMAIN__|$DOMAIN|g" \
  "$SCRIPT_DIR/nginx/merge-stars.conf" \
  | sudo tee /etc/nginx/sites-available/merge-stars.conf >/dev/null

sudo ln -sf /etc/nginx/sites-available/merge-stars.conf /etc/nginx/sites-enabled/merge-stars.conf
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

echo "==> First deploy (build apps)"
bash "$SCRIPT_DIR/deploy.sh"

sudo systemctl start merge-stars-backend
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx

echo ""
echo "Done. Site should be live on port 80."
echo "  Backend:  systemctl status merge-stars-backend"
echo "  Nginx:    systemctl status nginx"
echo "  Re-deploy after git pull: $DEPLOY_DIR/deploy/deploy.sh"
echo ""
echo "HTTPS (recommended): sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com"
