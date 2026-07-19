from pathlib import Path
import re

p = Path("/etc/nginx/sites-available/merge-stars.conf")
text = p.read_text()
if "client_max_body_size" not in text:
    text = text.replace(
        "server_name mergestars.com www.mergestars.com;",
        "server_name mergestars.com www.mergestars.com;\n    client_max_body_size 100m;",
        1,
    )
else:
    text = re.sub(r"client_max_body_size\s+[^;]+;", "client_max_body_size 100m;", text)

text = text.replace(
    "proxy_read_timeout 60s;",
    "proxy_read_timeout 300s;\n        proxy_send_timeout 300s;",
)
p.write_text(text)
print("OK")
for line in text.splitlines():
    if "client_max_body_size" in line or "proxy_read_timeout 300" in line:
        print(line.strip())
