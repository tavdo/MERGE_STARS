#!/usr/bin/env bash
# One-time wrapper — same as automatic deploy (bootstrap + build).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

export DEPLOY_DIR="${DEPLOY_DIR:-$REPO_ROOT}"
export DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"

echo "==> install-server.sh (runs bootstrap + deploy)"
bash "$SCRIPT_DIR/deploy.sh"

echo ""
echo "Done. Site should be live on port 80."
echo "  HTTPS: certbot --nginx -d yourdomain.com"
