# External Integrations

**Analysis Date:** 2026-04-13

## APIs & External Services

**Authentication:**
- NextAuth Credentials - session and route protection.
  - SDK/Client: `next-auth` (`src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`)
  - Auth: `AUTH_SECRET`, `AUTH_URL` (documented in `.env.example`, `DEPLOY.md`, and injected in `docker-compose.yml`).

**Document Generation:**
- React PDF renderer - quote PDF generation endpoint.
  - SDK/Client: `@react-pdf/renderer` (`src/app/api/orcamentos/[id]/pdf/route.ts`, `src/app/api/orcamentos/[id]/pdf/pdf-document.tsx`)
  - Auth: Uses app session auth via `auth()` in `src/app/api/orcamentos/[id]/pdf/route.ts`.

## Data Storage

**Databases:**
- PostgreSQL (self-hosted container or external Postgres-compatible instance).
  - Connection: `DATABASE_URL` (`src/lib/prisma.ts`, `prisma.config.ts`, `prisma/seed.ts`)
  - Client: Prisma Client with `@prisma/adapter-pg` (`src/lib/prisma.ts`).

**File Storage:**
- Local filesystem only in current implementation (`src/lib/storage.ts` writes to `public/uploads`).
- MinIO service is provisioned in `docker-compose.yml` and env vars exist in `.env.example`, but no MinIO/S3 SDK usage is present in `src/**`.

**Caching:**
- Browser/client cache via React Query in `src/components/providers.tsx` and `src/hooks/use-*.ts`.
- No external cache service (Redis/Memcached) detected.

## Authentication & Identity

**Auth Provider:**
- NextAuth (Credentials provider).
  - Implementation: Email/password verified against `User` records through Prisma + `bcryptjs` in `src/lib/auth.ts`; JWT session callbacks and route authorization rules in `src/lib/auth.config.ts`.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/Bugsnag SDK integration in `src/**` or `package.json`).

**Logs:**
- Application logging uses `console.error(...)` in API route handlers such as `src/app/api/upload/route.ts`, `src/app/api/relatorios/route.ts`, and `src/app/api/contratos/[id]/assinar/route.ts`.

## CI/CD & Deployment

**Hosting:**
- Dockerized Next.js standalone Node deployment (`Dockerfile`, `docker-compose.yml`, `DEPLOY.md`).

**CI Pipeline:**
- None detected (`.github/workflows/` not present).

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` (runtime DB connection; `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/seed.ts`)
- `AUTH_SECRET` and `AUTH_URL` (auth runtime; `.env.example`, `DEPLOY.md`, `docker-compose.yml`)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` (containerized DB setup; `.env.example`, `docker-compose.yml`)
- `STORAGE_MODE`, `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_USE_SSL` (documented infra vars; `.env.example`, `docker-compose.yml`)
- `NEXT_PUBLIC_APP_URL` (client-facing app URL; `.env.example`)

**Secrets location:**
- Local/dev secrets are expected in `.env` (file present).
- Container runtime variables are injected via `env_file` and `environment` in `docker-compose.yml`.

## Webhooks & Callbacks

**Incoming:**
- None detected (no dedicated webhook receiver endpoints under `src/app/api/**`).

**Outgoing:**
- None detected (no third-party webhook/callback dispatch logic in `src/**`).

---

*Integration audit: 2026-04-13*
