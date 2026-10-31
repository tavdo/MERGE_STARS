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

## Remaining runtime dependency

PostgreSQL rejects the currently configured local credentials. The owner chose to update backend/.env. DATABASE_URL takes precedence over the separate DB_PASSWORD setting. Login, database-backed catalog data, saved designs and database migration compatibility cannot be verified until that connection works.

No database migrations, database resets, deployment, email messages or payments were executed. Existing environment files and local data were preserved. Replaced originals are backed up in integration-backup.zip; legacy-source is now a historical backup, not the active feature implementation.
