# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Next.js App Router monolith (UI + API + DB access in one repo)

**Key Characteristics:**
- File-based routing for pages and API endpoints in `src/app/**`
- Thin route handlers orchestrating auth + validation + Prisma operations (example: `src/app/api/clientes/route.ts`)
- Client-side data access centralized through React Query hooks (`src/hooks/*.ts`) and `src/lib/fetch.ts`

## Layers

**Presentation Layer (Pages + UI):**
- Purpose: render authenticated dashboard and public pages
- Location: `src/app/(dashboard)/**`, `src/app/(auth)/**`, `src/app/fila/[slug]/page.tsx`, `src/app/contratos/[id]/assinar/page.tsx`, `src/components/**`
- Contains: route pages, layouts, table/form components, shadcn/ui wrappers
- Depends on: hooks (`src/hooks/*.ts`), constants (`src/lib/constants.ts`), UI primitives (`src/components/ui/**`)
- Used by: browser routes handled by Next.js App Router

**Application/API Layer:**
- Purpose: implement HTTP API contract and enforce access rules
- Location: `src/app/api/**/route.ts*`
- Contains: REST-like route handlers (`GET/POST/PUT/PATCH/DELETE`), query param handling, response shaping
- Depends on: auth helpers (`src/lib/api.ts`), Prisma client (`src/lib/prisma.ts`), validators (`src/lib/validations/*.ts`)
- Used by: React Query hooks and public pages

**Domain/Utility Layer:**
- Purpose: shared logic for auth, API responses, fetching, storage, PDF rendering, constants
- Location: `src/lib/**`
- Contains: `requireAuth/requireRole` (`src/lib/api.ts`), NextAuth setup (`src/lib/auth.ts`), storage provider (`src/lib/storage.ts`), PDF templates (`src/lib/pdf.tsx`)
- Depends on: NextAuth, Prisma, filesystem, React PDF
- Used by: API routes and app-wide providers

**Data Layer:**
- Purpose: relational persistence and schema evolution
- Location: `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`
- Contains: models/enums, migration SQL, seed generation
- Depends on: PostgreSQL (`datasource db`), Prisma runtime
- Used by: all API handlers via `prisma`

## Data Flow

**Authenticated CRUD flow (dashboard):**

1. Client page calls hook (e.g. `useCustomers` in `src/hooks/use-customers.ts`)
2. Hook calls `apiGet/apiPost/...` in `src/lib/fetch.ts` against `/api/*`
3. Route enforces `requireAuth`/`requireRole` and validates payload with Zod (`src/lib/validations/*.ts`)
4. Route executes Prisma query/mutation (`src/lib/prisma.ts`) and returns `success(...)` envelope (`src/lib/api.ts`)

**Public flow (queue/signature):**

1. Public pages `src/app/fila/[slug]/page.tsx` and `src/app/contratos/[id]/assinar/page.tsx` call public endpoints
2. Public routes (`src/app/api/fila/publica/[slug]/route.ts`, `src/app/api/contratos/[id]/publico/route.ts`) skip auth
3. Signing endpoint stores signature payload and metadata (`src/app/api/contratos/[id]/assinar/route.ts`)

**State Management:**
- Server state managed with React Query (`src/components/providers.tsx`, `src/hooks/*.ts`)
- Local UI state handled with React `useState` inside page components

## Key Abstractions

**API Response Contract:**
- Purpose: uniform success/error envelope
- Examples: `src/lib/api.ts`, consumed by `src/lib/fetch.ts`
- Pattern: `{ success: true, data }` / `{ success: false, error }`

**Auth Guards:**
- Purpose: centralized authorization checks
- Examples: `requireAuth`, `requireRole` in `src/lib/api.ts`; middleware gate in `src/middleware.ts`
- Pattern: throw `AuthError` in helper, map to JSON response in `handleApiError`

**Resource Hooks:**
- Purpose: co-locate query keys + mutations by domain resource
- Examples: `src/hooks/use-services.ts`, `src/hooks/use-customers.ts`, `src/hooks/use-contracts.ts`
- Pattern: query + mutation hooks with cache invalidation per feature key

## Entry Points

**Web app root:**
- Location: `src/app/layout.tsx`
- Triggers: every route render
- Responsibilities: global HTML/body, fonts, provider composition

**Dashboard shell:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: any route in `(dashboard)` group
- Responsibilities: navigation, role-filtered menu, theme toggle, sign-out

**API root endpoints:**
- Location: `src/app/api/**/route.ts*`
- Triggers: client/server HTTP requests to `/api/*`
- Responsibilities: business operations across customers, services, queue, inventory, quotes, contracts, reports, uploads

## Error Handling

**Strategy:** centralized helper mapping for expected auth errors + generic 500 fallback

**Patterns:**
- Route-level `try/catch` + `return handleApiError(err)` (`src/app/api/*`)
- Explicit 404/400 early returns via `error(...)` helper in `src/lib/api.ts`

## Cross-Cutting Concerns

**Logging:** basic `console.error` in API helper and selected routes (`src/lib/api.ts`)
**Validation:** Zod schemas under `src/lib/validations/*.ts` parsed in route handlers
**Authentication:** NextAuth credential session + middleware route gating (`src/lib/auth.ts`, `src/middleware.ts`)

---

*Architecture analysis: 2026-04-12*
