# External Integrations

**Analysis Date:** 2026-04-13

## APIs & External Services

**Cloud Storage (optional):**
- S3-compatible object storage - File upload backend selected when `STORAGE_PROVIDER=s3`
  - SDK/Client: `@aws-sdk/client-s3` in `src/lib/storage.ts`
  - Auth: `S3_ACCESS_KEY`, `S3_SECRET_KEY`, plus `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`

**Authentication Runtime:**
- Auth.js (NextAuth v5 credentials provider) - User login/session/JWT strategy
  - SDK/Client: `next-auth` in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`
  - Auth: `AUTH_SECRET` consumed in `src/middleware.ts` via `getToken`

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DATABASE_URL`
  - Client: Prisma Client + PG adapter (`src/lib/prisma.ts`, `prisma/schema.prisma`, `prisma.config.ts`)

**File Storage:**
- Local filesystem by default (`public/uploads`) in `src/lib/storage.ts`
- S3-compatible providers supported via env-based switch in `src/lib/storage.ts`

**Caching:**
- In-memory browser cache/query cache through TanStack React Query on client pages (`src/components/shared/providers.tsx`, `src/hooks/use-public-queue.ts`)
- No Redis/Memcached/remote cache integration detected

## Authentication & Identity

**Auth Provider:**
- Auth.js/NextAuth credentials-based auth in `src/lib/auth.ts`
  - Implementation: Email+password credential lookup against `User` table with bcrypt verification; JWT session enrichment with role in `src/types/next-auth.d.ts`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Bugsnag/etc imports or config files)

**Logs:**
- Prisma client logging for `warn/error` in development and `error` in production (`src/lib/prisma.ts`)
- No centralized structured logging pipeline detected

## CI/CD & Deployment

**Hosting:**
- Node container or Node host running built Next standalone app (`next.config.ts`, `Dockerfile`, `DEPLOY.md`)

**CI Pipeline:**
- None detected (no workflow files in `.github/workflows/` and no CI config files detected)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` (`src/lib/prisma.ts`, `prisma.config.ts`)
- `AUTH_SECRET` (`src/middleware.ts`)
- `NEXTAUTH_URL` and/or `NEXT_PUBLIC_APP_URL` (`src/app/(dashboard)/fila/page.tsx`, `src/app/(dashboard)/configuracoes/page.tsx`)
- `STORAGE_PROVIDER` (`src/lib/storage.ts`)
- `MAX_UPLOAD_SIZE_MB`, `UPLOAD_DIR` (`src/lib/storage.ts`)
- S3 mode keys: `S3_ENDPOINT`, `S3_REGION`, `S3_FORCE_PATH_STYLE`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` (`src/lib/storage.ts`)

**Secrets location:**
- Runtime environment variables injected into process environment (`DEPLOY.md` recommends `--env-file .env`)
- `.env` and `.env.example` files are present at repository root (existence noted only; contents intentionally not read)

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook receiver signatures/verification flow outside normal app API routes)

**Outgoing:**
- None detected (no outbound webhook dispatch or third-party callback calls)

---

*Integration audit: 2026-04-13*
