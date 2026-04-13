# Technology Stack

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- TypeScript (strict mode) - frontend, backend routes, hooks, and shared types in `src/**/*.ts` and `src/**/*.tsx`.

**Secondary:**
- CSS - global styling and design tokens in `src/app/globals.css`.
- SQL - Prisma migration DDL in `prisma/migrations/20260322201542_init/migration.sql`.

## Runtime

**Environment:**
- Node.js 24 (container runtime) defined in `Dockerfile`.

**Package Manager:**
- npm (script + lockfile workflow in `package.json` and `package-lock.json`).
- Lockfile: present (`package-lock.json`, lockfileVersion 3).

## Frameworks

**Core:**
- Next.js `16.2.1` - App Router pages and API routes in `src/app/**`.
- React `19.2.4` + React DOM `19.2.4` - UI layer in `src/components/**` and `src/app/**`.
- Prisma `7.5.0` - ORM client generation and DB access in `prisma/schema.prisma` and `src/lib/prisma.ts`.

**Testing:**
- Not detected (no `test` script in `package.json`; no Jest/Vitest config files).

**Build/Dev:**
- TypeScript `^5` - compile-time type checking via `tsconfig.json`.
- Tailwind CSS `^4` + `@tailwindcss/postcss` - styling pipeline in `src/app/globals.css` and `postcss.config.mjs`.
- ESLint `^9` + `eslint-config-next` `16.2.1` - linting via `eslint.config.mjs` and `npm run lint`.
- Prisma CLI `^7.5.0` + `tsx` `^4.21.0` - schema/migrations/seed flows in `prisma.config.ts` and `package.json`.

## Key Dependencies

**Critical:**
- `next-auth` `^5.0.0-beta.30` - authentication/session middleware in `src/lib/auth.ts`, `src/lib/auth.config.ts`, and `src/middleware.ts`.
- `@prisma/client` `^7.5.0` + `@prisma/adapter-pg` `^7.5.0` + `pg` `^8.20.0` - PostgreSQL access in `src/lib/prisma.ts` and `prisma/seed.ts`.
- `@tanstack/react-query` `^5.95.0` - client-side data fetching/caching orchestration in `src/components/providers.tsx` and `src/hooks/use-*.ts`.
- `zod` `^4.3.6` - payload validation in `src/lib/validations/*.ts` and API routes.

**Infrastructure:**
- `bcryptjs` `^3.0.3` - password hashing/verification in `src/lib/auth.ts`, `src/app/api/funcionarios/*.ts`, and `prisma/seed.ts`.
- `@react-pdf/renderer` `^4.3.2` - PDF generation in `src/app/api/orcamentos/[id]/pdf/route.ts`.
- `next-themes` `^0.4.6` - theme switching in `src/components/providers.tsx` and `src/components/layout/header.tsx`.
- `shadcn` `^4.1.0` + `@base-ui/react` `^1.3.0` - component foundation configured in `components.json` and used in `src/components/ui/**`.

## Configuration

**Environment:**
- Environment-driven runtime config via `.env`/`.env.example`, `docker-compose.yml`, and `prisma.config.ts`.
- Database URL read from `DATABASE_URL` in `src/lib/prisma.ts`, `prisma.config.ts`, and `prisma/seed.ts`.
- Auth configuration requires `AUTH_SECRET` and `AUTH_URL` (documented in `.env.example` and `DEPLOY.md`).
- Optional object storage-related variables are documented in `.env.example` and `docker-compose.yml` (`STORAGE_MODE`, `MINIO_*`).

**Build:**
- Next build config: `next.config.ts`.
- TypeScript config: `tsconfig.json`.
- PostCSS/Tailwind config: `postcss.config.mjs` and `src/app/globals.css`.
- ESLint config: `eslint.config.mjs`.
- Containerized build/deploy: `Dockerfile` and `docker-compose.yml`.

## Platform Requirements

**Development:**
- Node.js + npm for local dev scripts in `package.json`.
- PostgreSQL-compatible database reachable via `DATABASE_URL` (`prisma.config.ts`).
- Optional Docker-based local stack with Postgres + MinIO + app via `docker-compose.yml`.

**Production:**
- Next.js standalone Node server container (`Dockerfile`, `CMD ["node", "server.js"]`).
- Reverse proxy/HTTPS expected at deployment edge (`DEPLOY.md`).

---

*Stack analysis: 2026-04-13*
