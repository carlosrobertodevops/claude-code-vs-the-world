# Codebase Structure

**Analysis Date:** 2026-04-13

## Directory Layout

```text
claude-cli/
├── src/                    # Application code (App Router, components, hooks, lib)
│   ├── app/                # Next.js routes (pages, layouts, API handlers)
│   ├── components/         # UI primitives, forms, layout, shared/table components
│   ├── hooks/              # React Query hooks per domain
│   ├── lib/                # Auth, Prisma, validations, constants, utilities
│   ├── middleware.ts       # Request authorization guard
│   └── types/              # Shared API/auth TypeScript types
├── prisma/                 # Database schema, migrations, seed script
├── public/                 # Static assets and runtime upload target (`public/uploads`)
├── .planning/codebase/     # Generated mapping docs for planning/execution
├── package.json            # Scripts and dependency graph
├── tsconfig.json           # TypeScript config and `@/*` alias
└── next.config.ts          # Next.js config entry
```

## Directory Purposes

**`src/app/`:**
- Purpose: Host route tree for UI and API.
- Contains: Route groups `(auth)`, `(dashboard)`, public routes (`fila`, `contratos/[id]/assinar`), API routes under `api/**/route.ts`.
- Key files: `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/api/servicos/route.ts`

**`src/components/`:**
- Purpose: Reusable UI building blocks and feature forms.
- Contains: `ui/` primitives, `forms/` domain forms, `layout/` shell components, `tables/` generic table.
- Key files: `src/components/providers.tsx`, `src/components/layout/app-sidebar.tsx`, `src/components/forms/service-order-form.tsx`, `src/components/tables/data-table.tsx`

**`src/hooks/`:**
- Purpose: Data-fetching and mutation boundary for client screens.
- Contains: Hook modules by domain (`use-customers`, `use-service-orders`, `use-queue`, etc.).
- Key files: `src/hooks/use-customers.ts`, `src/hooks/use-service-orders.ts`, `src/hooks/use-queue.ts`

**`src/lib/`:**
- Purpose: Shared business rules and infrastructure adapters.
- Contains: Auth (`auth.ts`, `auth.config.ts`), Prisma client (`prisma.ts`), validators (`validations/*.ts`), constants (`constants.ts`), storage adapter (`storage.ts`).
- Key files: `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/lib/prisma.ts`, `src/lib/validations/service.ts`

**`prisma/`:**
- Purpose: Database source-of-truth and seed data.
- Contains: `schema.prisma`, SQL migration folders, `seed.ts`.
- Key files: `prisma/schema.prisma`, `prisma/migrations/20260322201542_init/`, `prisma/seed.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root provider/layout composition.
- `src/app/(dashboard)/layout.tsx`: Authenticated shell composition.
- `src/middleware.ts`: Request auth gate for routes and APIs.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth handler entry.

**Configuration:**
- `package.json`: npm scripts and dependencies.
- `tsconfig.json`: strict TS + path alias (`@/*`).
- `next.config.ts`: Next.js config object.
- `components.json`: shadcn aliases and CSS location.

**Core Logic:**
- `src/app/api/**/route.ts`: Domain endpoints and business rules.
- `src/hooks/*.ts`: Client request/caching logic.
- `src/lib/validations/*.ts`: Input contracts for routes/forms.
- `src/lib/prisma.ts`: Database client initialization.

**Testing:**
- `Not detected` for dedicated test directories or `*.test.*`/`*.spec.*` files in current tree.

## Naming Conventions

**Files:**
- Route handlers use `route.ts`: `src/app/api/clientes/route.ts`.
- Route pages use `page.tsx`: `src/app/(dashboard)/clientes/page.tsx`.
- Route layouts use `layout.tsx`: `src/app/(auth)/layout.tsx`.
- Hooks use `use-*.ts`: `src/hooks/use-service-orders.ts`.
- Forms use `*-form.tsx`: `src/components/forms/customer-form.tsx`.

**Directories:**
- Route groups use parentheses: `src/app/(dashboard)/`, `src/app/(auth)/`.
- API dynamic segments use brackets: `src/app/api/servicos/[id]/route.ts`, `src/app/api/fila/publica/[slug]/route.ts`.

## Where to Add New Code

**New Feature:**
- Primary UI page: `src/app/(dashboard)/<feature>/page.tsx` (or `src/app/<public-feature>/page.tsx` for public routes).
- API endpoints: `src/app/api/<resource>/route.ts` and `src/app/api/<resource>/[id]/route.ts`.
- Client data hook: `src/hooks/use-<resource>.ts`.
- Validation schema: `src/lib/validations/<resource>.ts`.
- Tests: add a new `tests/` folder or co-located `*.test.ts(x)` near feature files.

**New Component/Module:**
- Domain form/dialog: `src/components/forms/`.
- Reusable business UI: `src/components/shared/`.
- Shell/navigation changes: `src/components/layout/`.
- Generic primitive only: `src/components/ui/`.

**Utilities:**
- Domain constants and helpers: `src/lib/`.
- Shared TypeScript contracts: `src/types/`.

## Special Directories

**`src/app/api/`:**
- Purpose: Server route handlers used by client hooks and public pages.
- Generated: No
- Committed: Yes

**`prisma/migrations/`:**
- Purpose: Database migration history.
- Generated: Yes (via Prisma migrate tooling)
- Committed: Yes

**`src/generated/prisma/`:**
- Purpose: Prisma generated client output path declared in `prisma/schema.prisma`.
- Generated: Yes
- Committed: Not detected in current tree

**`.planning/codebase/`:**
- Purpose: Agent-readable repository mapping docs.
- Generated: Yes
- Committed: Yes

---

*Structure analysis: 2026-04-13*
