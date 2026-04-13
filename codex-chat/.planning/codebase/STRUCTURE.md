# Codebase Structure

**Analysis Date:** 2026-04-13

## Directory Layout

```text
codex-chat/
├── src/                    # Application source
│   ├── app/                # App Router pages, layouts, and API route handlers
│   ├── components/         # Reusable UI, layout, chart, and shared components
│   ├── hooks/              # Client hooks (React Query wrappers)
│   ├── lib/                # Domain services, auth, prisma, utils, validations
│   ├── types/              # Ambient/shared type augmentation
│   └── middleware.ts       # Route protection and pathname header injection
├── prisma/                 # Prisma schema, migrations, and seed script
├── public/                 # Static assets and local upload target base
├── scripts/                # Auxiliary scripts (`scripts/seed.ts`)
├── .planning/codebase/     # Mapper outputs consumed by GSD planning/execution
├── package.json            # Scripts and dependencies
├── prisma.config.ts        # Prisma 7 config (schema, migrations, datasource)
├── next.config.ts          # Next.js runtime/build config
└── tsconfig.json           # TypeScript compiler and path aliases
```

## Directory Purposes

**`src/app`:**
- Purpose: Route tree and request entrypoints.
- Contains: `layout.tsx`, `page.tsx`, route groups `(auth)` and `(dashboard)`, API handlers in `api/**/route.ts`.
- Key files: `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/api/servicos/route.ts`.

**`src/components`:**
- Purpose: UI composition.
- Contains: `ui/` primitives, `layout/` chrome, `charts/`, and `shared/` components/providers.
- Key files: `src/components/shared/providers.tsx`, `src/components/layout/sidebar.tsx`, `src/components/queue/public-queue-board.tsx`.

**`src/lib`:**
- Purpose: Server-side/core logic reused across routes/pages.
- Contains: Auth (`auth.ts`), DB client (`prisma.ts`), permissions, domain modules, utils, validations.
- Key files: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/queue.ts`, `src/lib/reports.ts`, `src/lib/validations/*.ts`.

**`prisma`:**
- Purpose: Data model and lifecycle.
- Contains: `schema.prisma`, migration SQL, and seed.
- Key files: `prisma/schema.prisma`, `prisma/migrations/202603222330_init/migration.sql`, `prisma/seed.ts`.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Global app shell and providers.
- `src/app/page.tsx`: Root auth-aware redirect.
- `src/middleware.ts`: Runtime route guard for public/protected paths.
- `src/app/api/**/route.ts`: HTTP API entry surface.

**Configuration:**
- `package.json`: Runtime scripts and dependency graph.
- `tsconfig.json`: `@/*` alias to `src/*`.
- `next.config.ts`: standalone output mode.
- `prisma.config.ts`: Prisma schema/migration/seed wiring.

**Core Logic:**
- `src/lib/dashboard.ts`: Dashboard aggregations.
- `src/lib/queue.ts`: Queue recomputation/public queue payload.
- `src/lib/reports.ts`: Report aggregations + CSV conversion.
- `src/lib/storage.ts`: Local/S3 upload strategy.

**Testing:**
- Not detected: no `*.test.*`, `*.spec.*`, `jest.config.*`, or `vitest.config.*` found in repository paths inspected.

## Naming Conventions

**Files:**
- kebab-case for most modules: `page-header.tsx`, `public-queue-board.tsx`.
- Framework-reserved names for routing: `page.tsx`, `layout.tsx`, `route.ts`.
- Lowercase domain route segments in Portuguese: `src/app/(dashboard)/clientes/page.tsx`, `src/app/api/inventario/route.ts`.

**Directories:**
- Feature-oriented route directories under `src/app` (e.g., `clientes`, `servicos`, `orcamentos`).
- Concern-oriented directories under `src/components` (`ui`, `layout`, `shared`, `charts`).

## Where to Add New Code

**New Feature:**
- Primary code: add route segment in `src/app/(dashboard)/<feature>/page.tsx` (or `src/app/<public-feature>/page.tsx` for public pages).
- API endpoint: add `src/app/api/<resource>/route.ts` (and nested `[id]/route.ts` for item operations).
- Domain logic: add reusable services/helpers in `src/lib/<feature>.ts`.
- Validation: add schema in `src/lib/validations/<feature>.ts`.
- Tests: repository currently has no test location; establish one before adding automated tests.

**New Component/Module:**
- Implementation: `src/components/<group>/<component>.tsx`.
- Shared providers/wrappers: `src/components/shared/`.
- Primitive reusable controls: `src/components/ui/`.

**Utilities:**
- Shared helpers: `src/lib/utils.ts` for cross-feature utility functions.
- Feature-specific helpers: dedicated `src/lib/<feature>.ts` module.

## Special Directories

**`.planning/codebase/`:**
- Purpose: Architecture/stack/convention mapping outputs for GSD workflows.
- Generated: Yes (by mapping agents/commands).
- Committed: Yes (tracked documentation directory present in repo).

**`prisma/migrations/`:**
- Purpose: Database schema evolution SQL.
- Generated: Yes (Prisma migration output).
- Committed: Yes.

**`public/uploads/` (runtime target via `src/lib/storage.ts`):**
- Purpose: Local file uploads when `STORAGE_PROVIDER` is local.
- Generated: Yes (at runtime by `mkdir` + file writes).
- Committed: Not required by source structure; treat as runtime artifact.

---

*Structure analysis: 2026-04-13*
