# phpMyAdmin MySQL user import

Source dump: `users.mysql.sql` (from phpMyAdmin / Laravel `mergestars` database).

## What gets imported

| MySQL column | PostgreSQL `users` |
|--------------|-------------------|
| `id` | `merge_id` → `MERGE-000001` … `MERGE-000025` |
| `name` | `first_name` + `last_name` |
| `email` | `email` |
| `personal_id` | `personal_id` |
| `password` (`$2y$…`) | `password_hash` (Laravel bcrypt → Node `$2a$`) |
| `role` 0 / 1 | `roles`: 0 = admin+manager+user, 1 = user |
| `email_verified_at` | `kyc_status`: verified / pending |
| `created_at` / `updated_at` | preserved |

**25 users** in the current dump. Existing emails are **updated** (password + profile), not duplicated.

## Run manually

```bash
cd backend
DATABASE_URL='postgresql://merge_stars:PASSWORD@127.0.0.1:5432/merge_stars' npm run import:users
```

Custom file:

```bash
DATABASE_URL='...' node scripts/import-users-sql.js "data/users (1).sql"
```

## Deploy

`deploy/deploy.sh` runs import automatically after backend restart when:

- `backend/data/users.mysql.sql` exists
- `DATABASE_URL` is set in `.env`

## Login after import

Users keep their **original Laravel passwords** (e.g. `mergestars01@gmail.com`, `temotavdgiridze1226@gmail.com`, etc.).

Role `0` accounts (e.g. `mergestars01@gmail.com`, `anrivarshanidze2407@gmail.com`) can access **Admin Panel**.
