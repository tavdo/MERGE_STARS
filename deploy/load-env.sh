#!/usr/bin/env bash
# Load .env without bash treating # as a comment inside values.
load_env_file() {
  local file="${1:-.env}"
  [ -f "$file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" != *=* ]] && continue

    local key="${line%%=*}"
    local val="${line#*=}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    # common typo: BREVO_API-KEY → BREVO_API_KEY (bash keys cannot contain -)
    key="${key//BREVO_API-KEY/BREVO_API_KEY}"

    if [[ "$key" =~ - ]]; then
      echo "WARNING: skipping invalid .env key (use underscores not hyphens): $key" >&2
      continue
    fi

    if [[ "$val" =~ ^\"(.*)\"$ ]]; then
      val="${BASH_REMATCH[1]}"
    elif [[ "$val" =~ ^\'(.*)\'$ ]]; then
      val="${BASH_REMATCH[1]}"
    fi

    export "$key=$val"
  done < "$file"
}
