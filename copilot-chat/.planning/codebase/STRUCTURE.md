# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```text
copilot-chat/
├── src/                 # Application source (App Router, API, components, hooks, libs)
├── prisma/              # Data schema, migrations, and seed
├── public/              # Static assets and runtime uploads directory root
├── .planning/codebase/  # Generated mapping docs
├── package.json         # Scripts and dependencies
├── next.config.ts       # Next.js build/runtime config
├── tsconfig.json        # TypeScript config and aliases
├── docker-compose.yml   # Local multi-service runtime
└── Dockerfile           # Production container build
```

## Directory Purposes

**`src/app/`:**
- Purpose: routing, layouts, pages, API route handlers
- Contains: route groups `(auth)`, `(dashboard)`, public routes (`fila`, `contratos`), and `api/`
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/**/route.ts*`

**`src/components/`:**
- Purpose: reusable UI building blocks
- Contains: `ui/` primitives, feature-shared pieces, data table wrapper
- Key files: `src/components/providers.tsx`, `src/components/tables/data-table.tsx`, `src/components/ui/*.tsx`

**`src/hooks/`:**
- Purpose: server-state hooks and mutations by resource
- Contains: hooks for services/customers/queue/contracts/inventory/etc.
- Key files: `src/hooks/use-services.ts`, `src/hooks/use-customers.ts`, `src/hooks/use-queue.ts`

**`src/lib/`:**
- Purpose: framework-agnostic shared logic
- Contains: auth, API helpers, fetch wrapper, storage, validation schemas, constants, Prisma singleton
- Key files: `src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/validations/*.ts`

**`prisma/`:**
- Purpose: relational model and lifecycle scripts
- Contains: schema, migrations, seed script
- Key files: `prisma/schema.prisma`, `prisma/migrations/20260322224157_init/migration.sql`, `prisma/seed.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: global app shell and providers
- `src/app/page.tsx`: root redirect to dashboard
- `src/middleware.ts`: auth/public route gating

**Configuration:**
- `package.json`: scripts (`dev`, `build`, `db:*`)
- `next.config.ts`: standalone output + external package allowlist
- `tsconfig.json`: strict TS + alias `@/*`
- `prisma.config.ts`: Prisma schema/migration/seed and DB URL binding

**Core Logic:**
- `src/app/api/**/route.ts*`: feature APIs
- `src/hooks/*.ts`: client API orchestration
- `src/lib/*.ts*`: cross-feature helpers

**Testing:**
- Not detected (no test directory or `*.test.*` / `*.spec.*` files)

## Naming Conventions

**Files:**
- Route handler convention: `route.ts` or `route.tsx` under resource directories (example: `src/app/api/servicos/[id]/status/route.ts`)
- Hook convention: `use-<resource>.ts` (example: `src/hooks/use-customers.ts`)

**Directories:**
- App Router groups in parentheses for layout scoping (example: `src/app/(dashboard)/`)
- Dynamic route params in brackets (example: `src/app/api/clientes/[id]/route.ts`)

## Where to Add New Code

**New Feature:**
- Primary code: page in `src/app/(dashboard)/<feature>/page.tsx` and API in `src/app/api/<feature>/route.ts`
- Tests: not standardized; establish alongside new feature (recommended future path: `src/**/__tests__/`)

**New Component/Module:**
- Implementation: feature component in `src/components/shared/` or primitive in `src/components/ui/`

**Utilities:**
- Shared helpers: `src/lib/`
- API client/server state hooks: `src/hooks/`
- Input schemas: `src/lib/validations/`

## Special Directories

**`.next/`:**
- Purpose: Next build output
- Generated: Yes
- Committed: No

**`.planning/codebase/`:**
- Purpose: mapper output consumed by GSD planning/execution
- Generated: Yes
- Committed: Yes (intended documentation artifact)

**`public/uploads/` (runtime path):**
- Purpose: local uploaded files created by `src/lib/storage.ts`
- Generated: Yes (at runtime)
- Committed: No (runtime content)

---

*Structure analysis: 2026-04-12*
