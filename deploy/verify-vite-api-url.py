from pathlib import Path
files = list(Path("/var/www/html/frontend/dist/assets").glob("index-*.js"))
print("files", [f.name for f in files])
for f in files:
    t = f.read_text(encoding="utf-8", errors="ignore")
    print("localhost:3000 count", t.count("localhost:3000"))
    i = t.find("baseURL")
    print("snippet", repr(t[i:i+120]) if i >= 0 else "none")
