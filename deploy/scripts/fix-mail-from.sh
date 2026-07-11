#!/usr/bin/env bash
# Fix MAIL_FROM to Brevo-verified sender on production
set -euo pipefail
ENV_FILE="${1:-/var/www/html/.env}"
NEW_FROM='MAIL_FROM="MERGE STARS <mergestars01@gmail.com>"'

python3 - "$ENV_FILE" "$NEW_FROM" <<'PY'
import pathlib, re, sys
path = pathlib.Path(sys.argv[1])
new_line = sys.argv[2]
text = path.read_text()
if re.search(r'^MAIL_FROM=', text, re.M):
    text = re.sub(r'^MAIL_FROM=.*$', new_line, text, count=0, flags=re.M)
else:
    text = text.rstrip() + '\n' + new_line + '\n'
# Remove duplicate MAIL_FROM lines, keep last
lines = text.splitlines()
seen = False
out = []
for line in reversed(lines):
    if line.startswith('MAIL_FROM='):
        if seen:
            continue
        line = new_line
        seen = True
    out.append(line)
path.write_text('\n'.join(reversed(out)) + '\n')
print('MAIL_FROM updated to mergestars01@gmail.com')
PY

systemctl restart merge-stars-backend
sleep 2
echo "Backend restarted"
