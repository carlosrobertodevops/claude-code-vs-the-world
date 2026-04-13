# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- TypeScript (strict mode) - Application code in `src/**/*.ts` and `src/**/*.tsx`, API handlers in `src/app/api/**/route.ts`, schema validation in `src/lib/validations/index.ts`.

**Secondary:**
- SQL (via Prisma and raw SQL) - Prisma schema in `prisma/schema.prisma`; raw queries in `src/app/api/relatorios/route.ts` and `src/app/(dashboard)/dashboard/page.tsx`.
- CSS (Tailwind + custom variables) - Global styling in `src/app/globals.css`.

## Runtime

**Environment:**
- Node.js runtime for Next.js app (`next`), Prisma, and scripts.
- Container runtime pinned in `Dockerfile` (`node:24-alpine`).

**Package Manager:**
- npm (scripts and lockfile-driven installs from `package.json` and `package-lock.json`).
- Lockfile: present (`package-lock.json`).

## Frameworks

**Core:**
- Next.js `^16.2.3` - App Router app structure and API route handlers (`src/app/**`, `src/app/api/**`).
- React `19.2.4` / React DOM `19.2.4` - UI rendering in page and component files under `src/app/**` and `src/components/**`.
- NextAuth `^5.0.0-beta.30` - Auth/session in `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/middleware.ts`.
- Prisma `^7.5.0` + `@prisma/client` `^7.5.0` - Data modeling and DB access (`prisma/schema.prisma`, `src/lib/prisma.ts`).

**Testing:**
- Not detected (no `jest.config.*`, `vitest.config.*`, `*.test.*`, or `*.spec.*` files).

**Build/Dev:**
- TypeScript `^5` - Type-checking config in `tsconfig.json`.
- ESLint `^9` + `eslint-config-next` - linting config in `eslint.config.mjs`.
- Tailwind CSS `^4` + `@tailwindcss/postcss` - styling and PostCSS integration in `src/app/globals.css` and `postcss.config.mjs`.
- `tsx` `^4.21.0` - TS runtime for seed script (`prisma/seed.ts`) via package script.

## Key Dependencies

**Critical:**
- `next` / `react` / `react-dom` - full web app runtime (`src/app/layout.tsx`, `src/app/page.tsx`).
- `next-auth` + `bcryptjs` - credentials auth and password hashing (`src/lib/auth.ts`, `src/app/api/funcionarios/route.ts`).
- `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg` - PostgreSQL connectivity and ORM (`src/lib/prisma.ts`, `prisma/schema.prisma`).
- `zod` - request validation schemas (`src/lib/validations/index.ts`).

**Infrastructure:**
- `next-themes` - theme switching in `src/components/providers.tsx` and `src/components/layout/header.tsx`.
- `@tanstack/react-query` - query client provider setup in `src/components/providers.tsx`.
- `recharts` - charts in `src/app/(dashboard)/relatorios/page.tsx` and `src/components/charts/dashboard-charts.tsx`.
- `lucide-react` - icon system across `src/components/**` and `src/app/**` pages.

## Configuration

**Environment:**
- Runtime env access is implemented via `process.env.DATABASE_URL` in `src/lib/prisma.ts`, `prisma/seed.ts`, and `prisma.config.ts`.
- Deployment guide requires `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (documented in `DEPLOY.md`).
- `.env` file is present at repo root (environment configuration file present; contents intentionally not read).

**Build:**
- Next config: `next.config.ts`.
- TS config with `@/*` path alias: `tsconfig.json`.
- ESLint config: `eslint.config.mjs`.
- PostCSS/Tailwind config: `postcss.config.mjs`.
- Prisma config: `prisma.config.ts`.

## Platform Requirements

**Development:**
- Node.js + npm.
- PostgreSQL service (local setup via `docker-compose.yml`, DB operations from `prisma/schema.prisma` and `prisma/migrations/`).

**Production:**
- Containerized Next.js standalone output as configured in `Dockerfile`.
- Reverse proxy + TLS expected by deployment guide in `DEPLOY.md`.

---

*Stack analysis: 2026-04-12*
