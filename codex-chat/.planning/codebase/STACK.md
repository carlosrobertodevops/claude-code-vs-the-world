# Technology Stack

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- TypeScript 5.9.x - Application and API code in `src/app/**/*.ts(x)`, `src/lib/**/*.ts(x)`, and `prisma/seed.ts`

**Secondary:**
- SQL (Prisma migrations) - Schema evolution in `prisma/migrations/202603222330_init/migration.sql`
- CSS (Tailwind-driven) - Global styles in `src/app/globals.css`

## Runtime

**Environment:**
- Node.js 22+ for local/prod runtime (`DEPLOY.md`, `Dockerfile`)

**Package Manager:**
- npm (scripts and lockfile in `package.json` + `package-lock.json`)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 15.5.x (`next`) - App Router web app + route handlers (`src/app/**/page.tsx`, `src/app/api/**/route.ts`)
- React 19.1.x (`react`, `react-dom`) - UI component runtime (`src/components/**/*.tsx`)
- Prisma 7 (`@prisma/client`, `prisma`) - ORM/data access (`src/lib/prisma.ts`, `prisma/schema.prisma`)

**Testing:**
- Not detected (no Jest/Vitest config and no `*.test.*` / `*.spec.*` files detected in repository)

**Build/Dev:**
- TypeScript 5.9.x (`typescript`) - Type checking/transpile metadata (`tsconfig.json`)
- ESLint 9 (`eslint`, `eslint-config-next`) - Linting (`eslint.config.mjs`)
- Tailwind CSS 4 + PostCSS plugin (`tailwindcss`, `@tailwindcss/postcss`) - Styling pipeline (`postcss.config.mjs`, `src/app/globals.css`)
- tsx (`tsx`) - Prisma seed execution (`package.json`, `prisma.config.ts`)

## Key Dependencies

**Critical:**
- `next-auth@5.0.0-beta.29` - Authentication/session handling in `src/lib/auth.ts`, middleware gate in `src/middleware.ts`
- `@prisma/client@7.0.0` + `@prisma/adapter-pg@7.5.0` + `pg@8.20.0` - PostgreSQL access in `src/lib/prisma.ts`
- `zod@4.1.11` - Request/form validation in `src/lib/validations/*.ts`

**Infrastructure:**
- `@aws-sdk/client-s3@3.909.0` - Optional S3-compatible upload backend in `src/lib/storage.ts`
- `@tanstack/react-query@5.90.5` - Client data polling/cache in `src/hooks/use-public-queue.ts`
- `@react-pdf/renderer@4.3.1` - PDF generation for quotes/contracts in `src/lib/pdf.tsx` and API routes under `src/app/api/**/pdf/route.ts`
- `qrcode@1.5.4` - Queue QR generation in `src/app/(dashboard)/fila/page.tsx`
- `recharts@3.2.1` - Reporting charts in `src/components/charts/*.tsx`

## Configuration

**Environment:**
- Runtime environment variables are consumed directly via `process.env` in `src/lib/prisma.ts`, `src/lib/storage.ts`, `src/middleware.ts`, and dashboard queue/config pages.
- Critical config keys used in code/docs: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `STORAGE_PROVIDER`, `MAX_UPLOAD_SIZE_MB`, `UPLOAD_DIR`, `S3_ENDPOINT`, `S3_REGION`, `S3_FORCE_PATH_STYLE`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`.
- `.env` and `.env.example` files are present at repository root (existence noted only; contents intentionally not read).

**Build:**
- Next build/runtime config: `next.config.ts`
- TypeScript config/path alias: `tsconfig.json` (`@/* -> ./src/*`)
- ESLint config: `eslint.config.mjs`
- Prisma runtime config: `prisma.config.ts`
- Container build config: `Dockerfile`

## Platform Requirements

**Development:**
- Node.js 22+, npm, PostgreSQL 17 (`DEPLOY.md`)
- Optional S3-compatible object storage for uploads (`DEPLOY.md`, `src/lib/storage.ts`)
- Optional Docker Compose stack (repo includes `docker-compose.yml`)

**Production:**
- Next.js standalone Node process (`next.config.ts` uses `output: "standalone"`)
- Deploy target can be Dockerized Node service (`Dockerfile`) with external PostgreSQL and optional S3-compatible bucket (`DEPLOY.md`)

---

*Stack analysis: 2026-04-13*
