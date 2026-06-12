#!/usr/bin/env bash
# Ask users without a phone number to add it on their profile.
#
# Usage:
#   bash deploy/request-phone.sh --dry-run
#   bash deploy/request-phone.sh --test you@mail.com
#   bash deploy/request-phone.sh --yes
#   bash deploy/request-phone.sh --yes --skip-sent
#   bash deploy/request-phone.sh --yes --limit 50
#
# Only active users with empty phone are selected.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=load-env.sh
source "$SCRIPT_DIR/load-env.sh"

if [ -f "$REPO_ROOT/.env" ]; then
  load_env_file "$REPO_ROOT/.env"
fi

KEY="${BREVO_API_KEY:-}"
if [ -z "$KEY" ]; then
  echo "FAIL: BREVO_API_KEY not set in .env"
  exit 1
fi

echo "==> Brevo account check"
ACCOUNT_HTTP="$(curl -s -o /tmp/brevo-account.json -w '%{http_code}' \
  -H "api-key: $KEY" https://api.brevo.com/v3/account)"
if [ "$ACCOUNT_HTTP" != "200" ]; then
  echo "FAIL: Brevo HTTP $ACCOUNT_HTTP"
  cat /tmp/brevo-account.json 2>/dev/null || true
  exit 1
fi
echo "    Brevo OK"

mkdir -p "$REPO_ROOT/deploy/data"

LIMIT=0
TEST_MODE=0
for ((i = 1; i <= $#; i++)); do
  arg="${!i}"
  case "$arg" in
    --test) TEST_MODE=1 ;;
    --limit)
      next=$((i + 1))
      LIMIT="${!next:-0}"
      ;;
  esac
done

USERS_FILE="$REPO_ROOT/deploy/data/.request-phone-recipients.json"
export REQUEST_PHONE_USERS_FILE="$USERS_FILE"

if [ "$TEST_MODE" -eq 0 ]; then
  DB_URL="${DATABASE_URL:-}"
  if [ -z "$DB_URL" ]; then
    echo "FAIL: DATABASE_URL not set in .env"
    exit 1
  fi
  if ! command -v psql >/dev/null 2>&1; then
    echo "FAIL: psql not found — install postgresql-client"
    exit 1
  fi

  LIMIT_SQL=""
  if [ "$LIMIT" -gt 0 ] 2>/dev/null; then
    LIMIT_SQL="LIMIT $LIMIT"
  fi

  echo "==> Loading users without phone"
  psql "$DB_URL" -q -t -A -c \
    "SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
       SELECT email, first_name, last_name
       FROM users
       WHERE status = 'active'
         AND email IS NOT NULL
         AND (phone IS NULL OR TRIM(phone) = '')
       ORDER BY created_at
       $LIMIT_SQL
     ) t" > "$USERS_FILE"
fi

node "$REPO_ROOT/deploy/scripts/request-phone.mjs" "$@"
