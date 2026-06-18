#!/usr/bin/env bash
# Remove .env flags that overwrite user passwords on every deploy / backend restart.
# Source from deploy.sh — do not run standalone unless you know what you are doing.
harden_production_env() {
  local env_file="${1:-.env}"
  [ -f "$env_file" ] || return 0

  sed -i '/^SEED_ADMIN_SYNC=true/d' "$env_file" 2>/dev/null || true

  for key in IMPORT_USERS_SYNC_PASSWORDS IMPORT_USERS_UPDATE_EXISTING; do
    if grep -q "^${key}=" "$env_file" 2>/dev/null; then
      sed -i "s/^${key}=.*/${key}=false/" "$env_file"
    else
      echo "${key}=false" >> "$env_file"
    fi
  done

  if grep -q '^DB_SYNC=' "$env_file" 2>/dev/null; then
    sed -i 's/^DB_SYNC=.*/DB_SYNC=false/' "$env_file"
  else
    echo 'DB_SYNC=false' >> "$env_file"
  fi

  if grep -q '^DB_MIGRATE=' "$env_file" 2>/dev/null; then
    sed -i 's/^DB_MIGRATE=.*/DB_MIGRATE=true/' "$env_file"
  else
    echo 'DB_MIGRATE=true' >> "$env_file"
  fi

  echo "    .env hardened: passwords will not be reset on deploy/restart"
}
