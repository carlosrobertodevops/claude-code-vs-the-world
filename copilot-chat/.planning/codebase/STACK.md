# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- TypeScript 5.x - App Router pages, API routes, hooks, and shared libs in `src/**/*.ts` and `src/**/*.tsx`

**Secondary:**
- SQL (PostgreSQL dialect) - Prisma migrations in `prisma/migrations/20260322224157_init/migration.sql`
- CSS (Tailwind-driven) - global styles in `src/app/globals.css`

## Runtime

**Environment:**
- Node.js 20+ for local and container runtime (`README.md`, `Dockerfile`)

**Package Manager:**
- npm (scripts in `package.json`)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.2.x (`next`) - fullstack web app with App Router (`src/app/**`)
- React 19.2.x (`react`, `react-dom`) - client UI and hooks (`src/app/(dashboard)/**`, `src/components/**`)
- Prisma 7.5.0 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`) - data access layer (`src/lib/prisma.ts`, `prisma/schema.prisma`)

**Testing:**
- Not detected (no `jest.config.*`, `vitest.config.*`, or test files found)

**Build/Dev:**
- TypeScript compiler (`tsconfig.json`) - strict type checking
- ESLint 9 + `eslint-config-next` (`eslint.config.mjs`) - linting
- Tailwind CSS 4 + PostCSS (`postcss.config.mjs`, `src/app/globals.css`) - styling pipeline

## Key Dependencies

**Critical:**
- `next-auth@5.0.0-beta.30` + `@auth/prisma-adapter` - credential auth/session flow (`src/lib/auth.ts`, `src/middleware.ts`)
- `@tanstack/react-query@5.x` - data fetching/cache on client (`src/components/providers.tsx`, `src/hooks/*.ts`)
- `zod@4.x` - API input validation (`src/lib/validations/*.ts`)

**Infrastructure:**
- `pg@8.20.0` - PostgreSQL driver used by Prisma adapter (`src/lib/prisma.ts`)
- `bcryptjs@3.x` - password hashing/verification (`src/lib/auth.ts`, `src/app/api/funcionarios/route.ts`)
- `@react-pdf/renderer@4.x` - PDF generation endpoints (`src/app/api/orcamentos/[id]/pdf/route.tsx`, `src/app/api/contratos/[id]/pdf/route.tsx`)

## Configuration

**Environment:**
- Runtime config is env-driven via `.env` (present) and `.env.example` (template)
- Prisma URL is required by `prisma.config.ts` and `src/lib/prisma.ts` via `DATABASE_URL`
- Auth requires `AUTH_SECRET` and `AUTH_URL` (`.env.example`, `src/lib/auth.ts`, `src/middleware.ts`)

**Build:**
- Next.js build/runtime config in `next.config.ts`
- TS path alias `@/* -> src/*` in `tsconfig.json`
- Docker standalone build in `Dockerfile` using `next build` and Prisma generate

## Platform Requirements

**Development:**
- Node.js 20+, npm, Docker Compose for local PostgreSQL/MinIO (`README.md`, `docker-compose.yml`)

**Production:**
- Containerized deployment via Next standalone output + Node server (`next.config.ts`, `Dockerfile`, `DEPLOY.md`)
- PostgreSQL-backed runtime (`prisma/schema.prisma`, `docker-compose.yml`)

---

*Stack analysis: 2026-04-12*
