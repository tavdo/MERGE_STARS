# MERGE Material Lab — delivery and activation

Added to the existing MERGE_STARS project on 2026-10-04. Existing authentication, catalog IDs, Brand Houses, Product Passport routes and QR implementation are retained. Material QR uses the existing `qrcode` dependency and points to an additive Material Passport route.

## Open

- `/material-lab`: 13-stage museum experience, formula chamber, fiber alignment, color concepts, sample distribution, four analysis stations, equipment studies, macro viewer, lineage, application concepts and version history.
- `/material-lab/passport/DEMO-MSY-2026-001`: clearly marked DEMO template.
- `/material-lab/demo-admin`: isolated local workbench. All values remain DEMO; uploads store file metadata/fingerprints locally, not file bytes. Demo history is **not immutable**. Creating another demo batch archives the previous browser record under `merge.material-lab.demo.archive.<batch-id>`.
- `/admin/material-lab`: existing authentication guard plus administrator role. Writes use the additive backend service.

## Composition truth

2 kg polymer + 1 kg Ag = 3 kg theoretical input. Input target is computed as 100 / 3, not accepted from the client. At the user's request the interface displays **≈33%**, rounded; the detailed field tooltip exposes 33.33 wt%. Verified composition starts null. The seeded XRF 33.18 wt% value is **synthetic DEMO**, never used as real evidence or as batch verification. Colors do not assign composition.

The process sequence is an R&D hypothesis, not a validated manufacturing recipe. Thermal settings, actual equipment, polymer selection, performance and real assay data are intentionally not invented. Equipment drawings and generated macro imagery are conceptual, not photos of installed equipment or measured microstructure.

## CORE extension / server

New module: `backend/src/modules/material-lab`. New migration: `1753600000000-MaterialLab.ts`. Adds only `material_lab_events` and `material_lab_files` tables and their append-only mutation-blocking triggers. No existing product table or ID is regenerated.

Administrative API:

- `GET /api/admin/material-lab/batches`
- `GET /api/admin/material-lab/batches/:batchId`
- `POST /api/admin/material-lab/batches/:batchId/events` with `{action, payload}`
- `POST /api/admin/material-lab/batches/:batchId/files` with multipart `file`, `kind`
- `GET /api/admin/material-lab/files/:id` (authenticated private evidence download)

Public API:

- `GET /api/material-lab/passports/:batchId` (current verified passport only; private files/operator data excluded)
- `GET /api/material-lab/products/:productId/sources` (active products in public CORE collections only)

Events are serialized with a per-batch PostgreSQL transaction advisory lock, assigned an incrementing revision and chained SHA-256 fingerprints. Original uploaded bytes and SHA-256 fingerprints are saved transactionally with the evidence event. PDF, PNG, JPEG and MP4 signatures are checked; max 20 MB. Documents remain private. This is application/database append-only protection, not independent external archival notarization.

Before production use: configure and start PostgreSQL, apply existing migrations including this migration, and use `DB_SYNC=false`. Database synchronization alone does not install the immutable triggers. Existing deployment settings and secrets were not changed. PostgreSQL integration and authenticated uploads could not be exercised on this machine because its backend database is unavailable.

## Evidence & lineage policy

- New results require an existing sample and an uploaded report.
- Results/corrections append; old test records remain.
- A correction returns the batch to TESTING and invalidates the current public passport until reviewed again.
- Approval requires measured production output/sample weights, all five sampling locations and their current quantitative results, a current ICP-OES reference result and review notes. Approved percentage must match the referenced assay.
- Sampling adequacy, uncertainty, report authenticity and acceptable distribution are reviewed by the authorized administrator; a software check cannot establish scientific validity.
- TGA residue is supporting analysis, not a silver-specific assay. Micro-XRF maps complement XRF/ICP-OES data.
- Real product links require an existing CORE catalog UUID and allocation within recorded output mass. The existing CORE has no separate persistent product-passport entity; its product UUID is preserved as the passport reference. This milestone does not create a replacement passport system.
- Allocated metal content is CALCULATED from yarn mass and source assay; it is never labeled a laboratory-verified finished-product quantity.
- Source metadata is an optional extension on existing catalog product cards. Private collections are excluded from the public source endpoint.

## Verification

Frontend/backend production compilation, focused Material Lab lint, domain tests and authorization metadata checks. Browser checks cover process selection, fiber stage, QR routing, admin demo PDF upload and rejection of unverified passport creation. Responsive views inspected; no camera, powder handling or physical equipment operated.

## Demo PDF and generated visuals

`frontend/public/material-lab/demo-reference-report.pdf` is a upload fixture labeled **DEMO — NOT A LAB CERTIFICATE**, with no measured values. Generated using ReportLab, extracted with pypdf and rendered with pypdfium2; preview inspected.

Built-in imagegen assets, saved in this project:

- `frontend/public/material-lab/material-journey-concept.png`
- `frontend/public/material-lab/silver-yarn-concept.png`

Final hero prompt: Wide cinematic museum still-life for MERGE Material Lab; black smoked-glass surface; left translucent polymer granules and sealed silver vial; center cotton-like silver-white polymer fiber enclosed in a glass capsule; right fine flexible silver/gold textile yarn on tall black spools; background black bag with a restrained gold mosaic corner; warm gold/cool silver reflections; no text, replacement logos, airborne powder, people or claims of real laboratory evidence.

Macro prompt: Editorial photograph-like concept of silver-gray twisted composite yarn with metallic micro glints on near-black laboratory surface, spool and clear glass capsule in background, grazing warm gold/cool silver lighting, tactile detail and black negative space; no text, logos, people, spraying powder or laboratory-evidence claim. The viewer explicitly labels illustrative crops and diagrams.

Method references in the page: Bruker Micro-XRF documentation, Agilent ICP-OES polymer analysis application note and Mettler Toledo thermal-analysis documentation. These support method descriptions, not MERGE manufacturing validation.
