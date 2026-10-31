# Combined MERGE STARS application

Incoming source: https://github.com/mergestars01/mergestars
Incoming commit: db360884f88555887f6132b2e9e72c9b3842dc6b

The original application features are restored in the active source tree alongside the incoming museum, experience, and Material Lab modules. The earlier inactive-source approach has been replaced with compatibility changes.

## Available routes

- `/`: incoming museum and city experience, with a link to the original website.
- `/classic`: original homepage and product showcase.
- `/brand-room`, `/collections`, `/merge-coin`, `/filament`, `/how-it-works`: original public navigation.
- `/museum/classic`: original museum page; `/museum` and `/living-museum`: incoming museum.
- `/fill-coin`, `/dashboard/fill-coin`: original configurator, protected by sign-in.
- `/dashboard/master-catalog`, `/dashboard/wallet`: restored account features.
- `/admin/master-catalog`, `/admin/coin-configurator`, `/admin/ai-training`: restored admin features.
- `/passport/:publicId`: original saved product passport.
- Incoming `/material-lab`, `/create`, `/my-museum`, fit-profile and experience routes remain available.

## Compatibility work

Registered both sets of backend modules and database entities. Combined original catalog/master-house/Meshy routes with the incoming paginated museum endpoint. Retained incoming upload cleanup and transaction-based wallet operations. Restored profile nickname and social-link handling, original catalog and brand UI, navigation, missing style rules, and translation keys. Expanded catalog categories use matching frontend/backend types and labels.

Finalized configurator sessions can be included in Brand House production requests; ownership/finalization is checked and the server saves the design snapshot. Client-supplied prices are not treated as verified quotes. Payment remains subject to the incoming requirement for a verified fulfillment offer. External provider features still require configured providers and runtime verification.

## Validation

- Backend production build: passed.
- Existing backend tests: 15 suites, 74 tests passed.
- New configurator handoff tests: 2 passed.
- New catalog HTTP route integration tests: 2 passed with local loopback access.
- Frontend production build: passed, including final profile/category-label updates (large bundle warning).
- Browser: original homepage and brand-room category page render; signed-out configurator navigation redirects to login.

## Local development dependency

PostgreSQL rejects the currently configured local credentials. The owner chose to update backend/.env. DATABASE_URL takes precedence over the separate DB_PASSWORD setting. That local connection still requires correction. Production uses its existing working database settings; see the deployment verification below.

During local integration, no production changes were made. The subsequent authorized server deployment is recorded below. No database resets, test emails or payments were executed. Existing environment files and local data were preserved. Replaced originals are backed up in integration-backup.zip; legacy-source is now a historical backup, not the active feature implementation.

## Production deployment — 1 November 2026 (Asia/Tbilisi)

Release d1c0f96e2b114aad15f51e1ee7b9d7081a964b40 is live at https://mergestars.com/.

- Isolated Linux release built with Node v24.22.2; official runtime download checksum verified.
- Both production builds and all 78 backend tests passed on the server.
- Production database backed up and restored to a separate staging database. All pending migrations applied successfully there, with a repeat run applying none; every mapped entity column was checked.
- Staging HTTP checks passed for login, protected endpoints, wallet activation, saved catalogs, configurator sessions, personal museum, and saved fit measurements.
- The five verified additive migrations were then applied to production. All existing 32 users and 40 catalog items were retained; existing uploads and credentials remain in place.
- The first switch automatically rolled back because the immediate nginx response still came from an old worker. The retry waited for the new workers and passed exact-build verification.
- Public HTTPS homepage serves the new build. Health reports database up. Public museum, master-house and configurator endpoints return HTTP 200. Browser verification found no console errors on the live homepage.
- Server release: /var/www/releases/merge-stars-d1c0f96. Service configuration points to that release and the isolated Node runtime. Automatic schema synchronization and migration-on-start are disabled for this release.
- Backups and rollback script: /var/backups/merge-stars/pre-d1c0f96/. rollback.sh restores the previous application; additive migrations are retained.

The deployment does not merge the integration branch into main. External AI generation, live pricing, payments and physical fulfillment require their configured providers and separate end-to-end verification; this deployment does not certify those services.
