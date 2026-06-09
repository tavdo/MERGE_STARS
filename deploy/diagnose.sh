#!/usr/bin/env bash
# Full server diagnose — run on VPS: bash deploy/diagnose.sh
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== MERGE STARS server diagnose ==="
echo "Repo: $REPO_ROOT"
echo "Time: $(date -Iseconds 2>/dev/null || date)"
echo ""

fail=0
warn() { echo "  [!] $1"; }
ok() { echo "  [OK] $1"; }
err() { echo "  [FAIL] $1"; fail=1; }

echo "-- Public IP --"
PUB_IP="$(curl -4 -s --max-time 3 ifconfig.me 2>/dev/null || curl -4 -s --max-time 3 icanhazip.com 2>/dev/null || echo unknown)"
echo "  Server IP: $PUB_IP"
echo ""

echo "-- Tools --"
command -v node >/dev/null && ok "Node $(node -v)" || err "Node.js not installed"
command -v npm >/dev/null && ok "npm $(npm -v)" || err "npm not installed"
command -v nginx >/dev/null && ok "nginx installed" || err "nginx not installed"
echo ""

echo "-- Build output --"
[ -f "$REPO_ROOT/frontend/dist/index.html" ] && ok "frontend/dist/index.html" || err "frontend/dist missing — bash deploy/deploy.sh"
[ -f "$REPO_ROOT/backend/dist/main.js" ] && ok "backend/dist/main.js" || err "backend/dist missing — bash deploy/deploy.sh"
echo ""

echo "-- Backend service --"
if systemctl is-active merge-stars-backend &>/dev/null; then
  ok "merge-stars-backend running"
else
  err "merge-stars-backend NOT running — bash deploy/go-live.sh"
  journalctl -u merge-stars-backend -n 5 --no-pager 2>/dev/null || true
fi
if curl -sf --max-time 2 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
  ok "backend responds on :3000/api/health"
else
  warn "backend not responding on http://127.0.0.1:3000/api/health"
fi
echo ""

echo "-- Nginx --"
if systemctl is-active nginx &>/dev/null; then
  ok "nginx running"
else
  err "nginx NOT running — systemctl start nginx"
fi
if [ -f /etc/nginx/sites-enabled/merge-stars.conf ]; then
  ok "merge-stars.conf enabled"
  echo "  root: $(grep -E '^\s*root\s' /etc/nginx/sites-enabled/merge-stars.conf 2>/dev/null | head -1)"
else
  err "merge-stars.conf missing — bash deploy/go-live.sh"
fi
if curl -sf --max-time 2 -o /dev/null -w "%{http_code}" http://127.0.0.1/ | grep -qE '200|304'; then
  ok "localhost:80 returns 200 (frontend)"
else
  HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://127.0.0.1/ 2>/dev/null || echo fail)"
  err "localhost:80 returned $HTTP_CODE (expected 200)"
fi
echo ""

echo "-- Ports listening --"
if command -v ss >/dev/null; then
  ss -tlnp 2>/dev/null | grep -E ':80 |:443 |:3000 ' || warn "ports 80/443/3000 not all listening"
elif command -v netstat >/dev/null; then
  netstat -tlnp 2>/dev/null | grep -E ':80 |:443 |:3000 ' || true
fi
echo ""

echo "-- Firewall (ufw) --"
if command -v ufw >/dev/null; then
  UFW_STATUS="$(ufw status 2>/dev/null || echo inactive)"
  echo "  $UFW_STATUS" | head -5
  if echo "$UFW_STATUS" | grep -q "Status: active"; then
    echo "$UFW_STATUS" | grep -qE '80|443' || err "ufw active but 80/443 may be blocked — run: ufw allow 80 && ufw allow 443"
  else
    ok "ufw inactive (ports open)"
  fi
else
  warn "ufw not installed — check cloud firewall (AWS Security Group / Hetzner / etc.)"
fi
echo ""

echo "-- .env --"
if [ -f "$REPO_ROOT/.env" ]; then
  grep -E "^FRONTEND_URL=|^PORT=|^EMAIL_VERIFY=" "$REPO_ROOT/.env" 2>/dev/null || warn "check .env FRONTEND_URL"
  if grep -qE '^SMTP_USER=.+@' "$REPO_ROOT/.env" 2>/dev/null; then
    SMTP_USER_SHOW="$(grep '^SMTP_USER=' "$REPO_ROOT/.env" | cut -d= -f2-)"
    ok "SMTP_USER set ($SMTP_USER_SHOW)"
  else
    err "SMTP_USER missing — verification emails will fail"
  fi
  HEALTH_JSON="$(curl -sf --max-time 3 http://127.0.0.1:3000/api/health 2>/dev/null || true)"
  if echo "$HEALTH_JSON" | grep -q '"mail":"smtp"'; then
    ok "health reports mail=smtp"
  elif echo "$HEALTH_JSON" | grep -q '"mail":"dev-log"'; then
    err "health reports mail=dev-log — set SMTP_* in .env"
  fi
else
  warn ".env missing"
fi
echo ""

echo "-- DNS (if domain set) --"
if [ -f "$REPO_ROOT/.env" ]; then
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env" 2>/dev/null || true
  DOMAIN="${FRONTEND_URL#https://}"
  DOMAIN="${DOMAIN#http://}"
  DOMAIN="${DOMAIN%%/*}"
  if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "yourdomain.com" ]; then
    DNS_IP="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || dig +short "$DOMAIN" 2>/dev/null | head -1)"
    echo "  Domain: $DOMAIN"
    echo "  DNS points to: ${DNS_IP:-unknown}"
    if [ "$DNS_IP" = "$PUB_IP" ]; then
      ok "DNS matches server IP"
    else
      err "DNS ($DNS_IP) != server IP ($PUB_IP) — fix A record at domain registrar"
    fi
  fi
fi
echo ""

echo "=== Summary ==="
if [ "$fail" -eq 0 ]; then
  echo "Local stack looks OK. If still unreachable from internet:"
  echo "  1. Cloud panel: open inbound TCP 80 and 443"
  echo "  2. DNS A record -> $PUB_IP"
  echo "  3. Try: http://$PUB_IP/"
else
  echo "Fix [FAIL] items above, then run:"
  echo "  cd $REPO_ROOT && bash deploy/go-live.sh"
fi
exit "$fail"
