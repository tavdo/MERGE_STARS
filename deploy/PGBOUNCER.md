# pgBouncer on MERGE STARS VPS

Use pgBouncer when PostgreSQL connection count grows (many backend workers, admin tools, imports).

## Install (Ubuntu/Debian)

```bash
sudo apt install pgbouncer
```

## Configure

Copy `deploy/pgbouncer.ini` to `/etc/pgbouncer/pgbouncer.ini` and set:

- `auth_file` — `userlist.txt` with `merge_stars` password hash
- `[databases]` — `merge_stars = host=127.0.0.1 port=5432 dbname=merge_stars`

Point the app at the pooler:

```env
# .env — use pooler port 6432 instead of direct 5432
DATABASE_URL=postgresql://merge_stars:PASSWORD@127.0.0.1:6432/merge_stars
```

## Pool mode

- **transaction** (recommended for NestJS / TypeORM)
- `max_client_conn = 200`
- `default_pool_size = 25`

## systemd

```bash
sudo systemctl enable pgbouncer
sudo systemctl restart pgbouncer
```

## Health check

`GET /api/health` reports `db: up` through whatever `DATABASE_URL` points to (direct or pooler).
