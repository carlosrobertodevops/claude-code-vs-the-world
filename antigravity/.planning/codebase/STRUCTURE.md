# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```text
antigravity/
├── src/                    # Next.js application source
│   ├── app/                # App Router pages, layouts, and API routes
│   ├── components/         # Reusable UI components
│   ├── lib/                # Shared auth, db, validation, utils, constants
│   ├── types/              # Type augmentation (NextAuth)
│   └── middleware.ts       # Global route authorization middleware
├── prisma/                 # Prisma schema, migrations, seed script
├── public/                 # Static assets + runtime uploads directory root
├── .planning/codebase/     # Generated mapping docs for GSD planning
├── package.json            # Scripts and dependency manifest
├── tsconfig.json           # TS compiler + path alias config
├── eslint.config.mjs       # Lint config
├── next.config.ts          # Next.js config
├── postcss.config.mjs      # Tailwind PostCSS plugin config
└── Dockerfile              # Production container build
```

## Directory Purposes

**`src/app/`:**
- Purpose: Route tree for UI and backend handlers.
- Contains: Route groups (`(auth)`, `(dashboard)`), API handlers (`api/**/route.ts`), public queue page (`fila/[slug]/page.tsx`), root layout/page.
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/servicos/route.ts`, `src/app/(dashboard)/dashboard/page.tsx`.

**`src/components/`:**
- Purpose: Shared UI building blocks.
- Contains: Layout components (`layout/`), data display (`tables/`, `charts/`), shared controls (`shared/`), providers wrapper.
- Key files: `src/components/providers.tsx`, `src/components/tables/data-table.tsx`, `src/components/layout/sidebar.tsx`.

**`src/lib/`:**
- Purpose: Shared non-UI logic and cross-cutting helpers.
- Contains: Auth config, Prisma client, storage provider, constants, utility functions, Zod schemas.
- Key files: `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/lib/prisma.ts`, `src/lib/validations/index.ts`, `src/lib/utils.ts`.

**`prisma/`:**
- Purpose: Database model and migration layer.
- Contains: `schema.prisma`, `migrations/`, seed script.
- Key files: `prisma/schema.prisma`, `prisma/seed.ts`.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: root application shell and providers.
- `src/app/page.tsx`: root route auth-aware redirect.
- `src/middleware.ts`: auth gating for matched routes.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth handler export.

**Configuration:**
- `package.json`: scripts (`dev`, `build`, `start`, `lint`) and dependency versions.
- `tsconfig.json`: strict TS config and `@/*` alias.
- `eslint.config.mjs`: Next core-web-vitals + TS lint rules.
- `prisma.config.ts`: Prisma datasource/migration config.
- `next.config.ts`: Next runtime/build options.

**Core Logic:**
- `src/lib/validations/index.ts`: request schemas/types.
- `src/app/api/**/route.ts`: CRUD/business logic endpoints.
- `src/lib/prisma.ts`: DB client singleton and adapter wiring.
- `src/lib/storage.ts`: file upload provider.

**Testing:**
- Not detected (no test directories/files).

## Naming Conventions

**Files:**
- App Router route files: `page.tsx`, `layout.tsx`, `route.ts` (example: `src/app/api/clientes/route.ts`).
- Shared module files: kebab-case for component files (example: `src/components/shared/file-upload.tsx`), lowercase utility files (example: `src/lib/utils.ts`).

**Directories:**
- Feature/resource grouping by route segment (example: `src/app/api/inventario/`, `src/app/(dashboard)/inventario/`).
- Route groups in parentheses for layout separation (example: `src/app/(auth)/`, `src/app/(dashboard)/`).

## Where to Add New Code

**New Feature:**
- Primary code:
  - Page/UI route: `src/app/(dashboard)/<feature>/page.tsx`.
  - API endpoint: `src/app/api/<feature>/route.ts`.
  - Shared validation/constants: `src/lib/validations/index.ts` and/or `src/lib/constants.ts`.
- Tests: add under a new dedicated test tree (recommended: `src/**/__tests__/` or co-located `*.test.ts[x]` pattern).

**New Component/Module:**
- Implementation:
  - Reusable UI: `src/components/<category>/<component-name>.tsx`.
  - Domain helper: `src/lib/<module>.ts`.

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (general-purpose) or a new focused module in `src/lib/` when utility scope grows.

## Special Directories

**`.next/`:**
- Purpose: Next.js build output.
- Generated: Yes.
- Committed: No (ignored build artifact).

**`prisma/migrations/`:**
- Purpose: Versioned DB schema changes.
- Generated: Yes (Prisma migration tooling).
- Committed: Yes (should be versioned with code).

**`public/uploads/`:**
- Purpose: runtime local file storage target from `src/lib/storage.ts`.
- Generated: Yes (created on first upload).
- Committed: No (runtime-generated content).

---

*Structure analysis: 2026-04-12*
