# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**Authentication:**
- NextAuth Credentials - session/authentication for users
  - SDK/Client: `next-auth` (`src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/app/api/auth/[...nextauth]/route.ts`)
  - Auth: `AUTH_SECRET`, `AUTH_URL` (`.env.example`)

**PDF Rendering:**
- React PDF renderer - server-side PDF generation for quotes/contracts
  - SDK/Client: `@react-pdf/renderer` (`src/lib/pdf.tsx`, `src/app/api/orcamentos/[id]/pdf/route.tsx`, `src/app/api/contratos/[id]/pdf/route.tsx`)
  - Auth: protected by app session in PDF routes via `requireAuth`

**Customer Messaging Link-Out:**
- WhatsApp deep-link generation from UI
  - SDK/Client: native URL build (`https://wa.me/...`) in `src/app/(dashboard)/clientes/page.tsx`
  - Auth: app session required to reach page (`src/middleware.ts`)

## Data Storage

**Databases:**
- PostgreSQL (primary transactional store)
  - Connection: `DATABASE_URL` (`prisma.config.ts`, `src/lib/prisma.ts`, `.env.example`)
  - Client: Prisma ORM + PG adapter (`@prisma/client`, `@prisma/adapter-pg`)

**File Storage:**
- Local filesystem currently active in code (`public/uploads`) via `src/lib/storage.ts`
- MinIO is provisioned at infra level in `docker-compose.yml`, but S3 provider code is not implemented in `src/lib/storage.ts`

**Caching:**
- Client-side query cache via React Query `QueryClient` (`src/components/providers.tsx`)
- No separate Redis/Memcached service detected

## Authentication & Identity

**Auth Provider:**
- NextAuth (Credentials + JWT/session callbacks)
  - Implementation: credential verification against Prisma `User` with `bcrypt.compare` in `src/lib/auth.ts`; role/id attached in `src/lib/auth.config.ts`; route guards in `src/lib/api.ts` and `src/middleware.ts`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Bugsnag/DataDog SDK imports)

**Logs:**
- Basic `console.error` in API error paths (`src/lib/api.ts`, multiple `src/app/api/**/route.ts`)

## CI/CD & Deployment

**Hosting:**
- Docker-based deployment with Next standalone runtime (`Dockerfile`, `DEPLOY.md`)

**CI Pipeline:**
- Not detected (no `.github/workflows/*` or CI config found in project root)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `STORAGE_MODE`
- `MINIO_ENDPOINT`
- `MINIO_PORT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_USE_SSL`

**Secrets location:**
- Runtime secrets loaded from `.env` (present) with variable contract documented in `.env.example`

## Webhooks & Callbacks

**Incoming:**
- Browser/client callback for public contract signing: `POST /api/contratos/[id]/assinar` (`src/app/api/contratos/[id]/assinar/route.ts`)
- No third-party webhook receivers detected

**Outgoing:**
- No server-side outbound webhook delivery detected
- Client opens external WhatsApp links from `src/app/(dashboard)/clientes/page.tsx`

---

*Integration audit: 2026-04-12*
