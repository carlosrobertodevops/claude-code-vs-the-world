# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**Communication:**
- WhatsApp deep-link endpoint (`wa.me`) - customer contact links generated in `src/lib/utils.ts` and consumed in `src/app/(dashboard)/clientes/page.tsx`.
  - SDK/Client: None (URL generation only).
  - Auth: Not applicable.

**Platform services:**
- Google Fonts CDN - Inter font loaded in `src/app/layout.tsx`.
  - SDK/Client: Native `<link>` tag.
  - Auth: Not applicable.

## Data Storage

**Databases:**
- PostgreSQL (self-hosted/containerized) with Prisma ORM.
  - Connection: `DATABASE_URL` (used in `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/seed.ts`).
  - Client: Prisma Client (`src/lib/prisma.ts`, models in `prisma/schema.prisma`).

**File Storage:**
- Local filesystem only.
  - Provider: `LocalStorageProvider` in `src/lib/storage.ts`.
  - Upload path: `public/uploads` (created at runtime by `src/lib/storage.ts`).
  - API endpoint: `src/app/api/upload/route.ts`.

**Caching:**
- Client-side request caching via React Query defaults (`src/components/providers.tsx`).
- No dedicated external cache service detected.

## Authentication & Identity

**Auth Provider:**
- NextAuth credentials provider (`src/lib/auth.ts`, `src/lib/auth.config.ts`).
  - Implementation: Local users table (`prisma/schema.prisma` model `User`) + bcrypt password verification in `src/lib/auth.ts`.
  - Route endpoint: `src/app/api/auth/[...nextauth]/route.ts`.
  - Request gating: middleware in `src/middleware.ts`.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Bugsnag/NewRelic SDK imports).

**Logs:**
- Minimal console logging only in seed script `prisma/seed.ts`.
- Application routes return structured error payloads via `errorResponse` in `src/lib/utils.ts`.

## CI/CD & Deployment

**Hosting:**
- Docker-based deployment (`Dockerfile`, `docker-compose.yml`).
- Next.js standalone runtime in container (`Dockerfile` copy of `.next/standalone`).

**CI Pipeline:**
- None detected (`.github/workflows/` not present).

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` (DB connection for Prisma and seed) - referenced in `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/seed.ts`.
- `NEXTAUTH_SECRET` (documented requirement) - in `DEPLOY.md`.
- `NEXTAUTH_URL` (documented requirement) - in `DEPLOY.md`.

**Secrets location:**
- `.env` at repository root (present; values intentionally not read).

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook receiver patterns outside regular app API routes).

**Outgoing:**
- Browser URL callback to WhatsApp (`https://wa.me/...`) generated in `src/lib/utils.ts`.

---

*Integration audit: 2026-04-12*
