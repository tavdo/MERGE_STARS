# MERGE STARS developer handoff

Prepared: 1 November 2026.
Repository: https://github.com/mergestars01/mergestars

## What this contains

The current local MERGE_STARS application, including uncommitted source work:
- `frontend/`: React, Vite, TypeScript, museum experience, category navigation,
  design briefs, Renaissance/Wedding/Family experiences and approved/concept media.
- `backend/`: NestJS, PostgreSQL/TypeORM, authentication, catalog, orders,
  material lab, experience records, migrations and tests.
- `deploy/`: existing Linux/nginx/systemd setup and operational scripts.
- `.env.example`, OpenAPI and architecture/build documentation.

This is a clean initial snapshot, not the original repository's Git history.
The separate ChatGPT-hosted Museum project and its temporary checkouts are not
the deployable server application and are intentionally not copied here.
Browser-local drafts remain in the owner's browser; Git does not transfer them.

## Install and build

Use Node 22.12+ (or Node 24 LTS) and npm. The Vite 8 frontend needs a newer Node
than some older deployment documents suggest. Confirm versions before deployment.

```sh
git clone https://github.com/mergestars01/mergestars.git
cd mergestars
cd backend
npm ci
npm run build
cd ../frontend
npm ci
npm run build
```

Local frontend: `npm run dev -- --host 127.0.0.1 --port 5198 --strictPort` from
`frontend/`. Backend: `npm run start:dev` from `backend/`, with a configured
development PostgreSQL database and environment. Check Vite proxy/API settings.

## Server and domain checklist

1. Review `BUILD_DETAILS.md`, `deploy/` and `.env.example` before running scripts.
2. Back up the existing database and uploads, and test a restore. Do not initialize
   or replace the live CORE database from this snapshot.
3. Provision PostgreSQL, nginx, Node, service user and persistent uploads.
4. Create `.env` on the server. Supply real database/JWT/mail/provider credentials
   securely, never through Git. Templates contain placeholders, not working keys.
5. Keep DB_SYNC=false. Review and test migrations against a staging copy first.
6. Review deploy scripts before execution: some existing scripts clean untracked
   files or reset source. Never run them in a directory holding unbacked-up data.
7. Configure frontend /api and WebSocket routing, backend allowed origin, nginx,
   DNS and HTTPS. Existing configs may contain old domain/path assumptions.
8. Smoke-test registration, sign-in, ownership isolation, upload, catalog, saved
   designs and restore. Verify payment/provider callbacks in their test modes.
9. Deploy only after owner approval. The deploy Action is workflow_dispatch only;
   publishing source to main does not intentionally deploy to the server.

The optional legacy MySQL user dump is excluded. Do not import users or reset
passwords automatically; any data migration requires a separate approved plan.

## Verification and honest limits

- Backend production build: PASS on 1 November 2026.
- Frontend production build: PASS on 1 November 2026; run again on Linux.
- Builds are not proof of production readiness or database/provider E2E.
- Real Meshy generation, protected CORE design saving, payment confirmation and
  physical production need integration verification. No working provider secret
  is included. A UI or concept model is not proof a provider generated it.
- The Meshy panel fails closed when no real handler/model is available; simulated
  completion was removed. Patent/material claims require documentary evidence.
- Run the backend tests, migration checks, frontend checks and browser/mobile
  workflows before launch. Existing conceptual features are not certified results.

## Intentionally excluded

Real `.env` files, private keys, databases, SQL user dumps, KYC/customer uploads,
recipient lists, logs, node_modules, compiled output, local screenshots, temporary
Sites checkouts, internal prompt archives and private runtime state.
