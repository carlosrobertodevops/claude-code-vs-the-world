# Architecture

**Analysis Date:** 2026-04-13

## Pattern Overview

**Overall:** Next.js App Router layered monolith (UI + API in one repository)

**Key Characteristics:**
- Use `src/app/` for both page routes and API handlers.
- Use `src/hooks/*.ts` as the client-side data-access boundary.
- Use `src/app/api/**/route.ts` for domain operations with Prisma and Zod.

## Layers

**Routing & Composition Layer:**
- Purpose: Map URL paths to pages/layouts and API endpoints.
- Location: `src/app/`
- Contains: `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/app/api/**/route.ts`
- Depends on: `src/components/**`, `src/hooks/**`, `src/lib/**`
- Used by: Browser requests and all `/api/*` calls

**UI Layer:**
- Purpose: Render screens, forms, tables, navigation shell, and shared primitives.
- Location: `src/components/` and client pages under `src/app/(dashboard)/**`
- Contains: `src/components/forms/*`, `src/components/tables/data-table.tsx`, `src/components/layout/app-sidebar.tsx`, `src/components/ui/*`
- Depends on: `src/hooks/**`, `src/lib/constants.ts`
- Used by: Dashboard and public pages

**Client Data Layer:**
- Purpose: Centralize fetch, mutation, error mapping, and cache invalidation.
- Location: `src/hooks/*.ts`
- Contains: `src/hooks/use-service-orders.ts`, `src/hooks/use-customers.ts`, `src/hooks/use-queue.ts`
- Depends on: API routes in `src/app/api/**/route.ts`, provider wiring in `src/components/providers.tsx`
- Used by: Client components and pages

**API/Application Layer:**
- Purpose: Validate requests, authorize users, execute business rules, and return API envelope.
- Location: `src/app/api/**/route.ts`
- Contains: CRUD handlers, queue reorder, report aggregation, upload and signing endpoints
- Depends on: `src/lib/prisma.ts`, `src/lib/auth.ts`, `src/lib/validations/*.ts`, `src/types/index.ts`
- Used by: Hooks and direct `fetch(...)` calls from pages

**Domain & Shared Infra Layer:**
- Purpose: Hold cross-cutting rules and adapters.
- Location: `src/lib/`
- Contains: auth (`src/lib/auth.ts`, `src/lib/auth.config.ts`), constants (`src/lib/constants.ts`), validation schemas (`src/lib/validations/*.ts`), storage adapter (`src/lib/storage.ts`)
- Depends on: NextAuth, Zod, Prisma, filesystem APIs
- Used by: API routes and forms

**Persistence Layer:**
- Purpose: Define schema and provide DB access.
- Location: `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/prisma.ts`
- Contains: Postgres models (users, customers, service orders, queue entries, contracts, inventory)
- Depends on: Prisma adapter/client (`@prisma/adapter-pg`, `@/generated/prisma/client`)
- Used by: API handlers and auth provider

## Data Flow

**Authenticated dashboard flow:**

1. Request enters a protected dashboard route in `src/app/(dashboard)/**`; middleware `src/middleware.ts` enforces authorization rules from `src/lib/auth.config.ts`.
2. Page component calls a hook (example `useServiceOrders` in `src/hooks/use-service-orders.ts`).
3. Hook requests an endpoint (example `src/app/api/servicos/route.ts`).
4. Route validates with Zod (`src/lib/validations/service.ts`), runs Prisma queries through `src/lib/prisma.ts`, and returns `{ success, data, meta }`.
5. Hook selects response data and React Query updates or invalidates cache keys.

**Public flow (queue/signature):**

1. Public pages (`src/app/fila/[slug]/page.tsx`, `src/app/contratos/[id]/assinar/page.tsx`) call public endpoints.
2. Endpoints (`src/app/api/fila/publica/[slug]/route.ts`, `src/app/api/contratos/[id]/assinar/route.ts`) apply domain-specific rules (mask plate/signature state) and return normalized envelope.

**State Management:**
- Server state: React Query in `src/components/providers.tsx`
- Auth/session: NextAuth `SessionProvider` + middleware (`src/components/providers.tsx`, `src/middleware.ts`)
- Forms: React Hook Form + Zod resolver (example `src/components/forms/service-order-form.tsx`)

## Key Abstractions

**Domain hook abstraction:**
- Purpose: Keep endpoint path + cache behavior together.
- Examples: `src/hooks/use-service-orders.ts`, `src/hooks/use-customers.ts`, `src/hooks/use-queue.ts`
- Pattern: `useQuery` for reads, `useMutation` for writes, `invalidateQueries` on success

**API response envelope abstraction:**
- Purpose: Keep endpoint response shape consistent.
- Examples: `src/types/index.ts`, `src/app/api/funcionarios/route.ts`
- Pattern: `{ success: true, data, meta? }` or `{ success: false, error }`

**Validation boundary abstraction:**
- Purpose: Validate all external input at API/form boundaries.
- Examples: `src/lib/validations/service.ts`, `src/lib/validations/customer.ts`, `src/lib/validations/contract.ts`
- Pattern: `safeParse` in routes and `zodResolver` in forms

## Entry Points

**Global app layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Global styling/fonts, provider tree, toast UI

**Dashboard shell:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Dashboard routes
- Responsibilities: Sidebar/header and dashboard frame

**Auth API entry:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth GET/POST endpoints
- Responsibilities: Expose handlers from `src/lib/auth.ts`

**Route guard middleware:**
- Location: `src/middleware.ts`
- Triggers: Matched app/API requests excluding static assets/uploads
- Responsibilities: Enforce public/manager-only route rules

## Error Handling

**Strategy:** Use per-route `try/catch` with standardized JSON error envelopes.

**Patterns:**
- Return `400` with field errors on Zod validation failure (example `src/app/api/clientes/route.ts`).
- Return `401/403/404/409` for auth, role, missing resource, and conflict branches (examples `src/app/api/fila/route.ts`, `src/app/api/funcionarios/route.ts`, `src/app/api/contratos/[id]/assinar/route.ts`).
- Log unexpected failures with `console.error` and return `500 INTERNAL_ERROR`.

## Cross-Cutting Concerns

**Logging:** API route-level `console.error` (example `src/app/api/relatorios/route.ts`)
**Validation:** Shared Zod schemas in `src/lib/validations/*.ts`
**Authentication:** NextAuth credentials in `src/lib/auth.ts` + route authorization in `src/lib/auth.config.ts`

---

*Architecture analysis: 2026-04-13*
