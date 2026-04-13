# Architecture

**Analysis Date:** 2026-04-13

## Pattern Overview

**Overall:** Next.js App Router modular monolith (server-first pages + Route Handlers + shared domain utilities).

**Key Characteristics:**
- Route-segmented application structure in `src/app` with route groups `(auth)` and `(dashboard)`.
- Business logic centralized in `src/lib` and reused by both pages and API handlers.
- Prisma-backed persistence with typed models from `prisma/schema.prisma` and singleton client in `src/lib/prisma.ts`.

## Layers

**UI/Page Layer:**
- Purpose: Render HTML, bind forms, and compose UI components.
- Location: `src/app/**/*.tsx`, `src/components/**/*.tsx`.
- Contains: Server Components, Client Components, and server actions inside pages (example in `src/app/(dashboard)/clientes/page.tsx`).
- Depends on: `src/lib/*`, `src/components/*`.
- Used by: Browser requests to page routes.

**API Layer:**
- Purpose: HTTP JSON/CSV/PDF endpoints for CRUD, reports, uploads, and public queue.
- Location: `src/app/api/**/route.ts`.
- Contains: Auth checks (`auth()`), validation (`zod` schemas), Prisma reads/writes, standardized API responses.
- Depends on: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/validations/*`, `src/lib/utils.ts`.
- Used by: Client fetches (example `src/hooks/use-public-queue.ts`) and external callers.

**Domain/Service Layer:**
- Purpose: Encapsulate reusable business operations.
- Location: `src/lib/dashboard.ts`, `src/lib/queue.ts`, `src/lib/reports.ts`, `src/lib/storage.ts`, `src/lib/pdf.tsx`, `src/lib/numbering.ts`.
- Contains: Queue recalculation, dashboard aggregations, report shaping, storage provider routing, PDF generation.
- Depends on: Prisma client and framework-independent utilities.
- Used by: Pages and API handlers.

**Data Layer:**
- Purpose: Typed data model and database access.
- Location: `prisma/schema.prisma`, `prisma/migrations/202603222330_init/migration.sql`, `src/lib/prisma.ts`.
- Contains: Domain models (customers, vehicles, service orders, queue, contracts, quotes, inventory).
- Depends on: PostgreSQL datasource configured via `prisma.config.ts`.
- Used by: All server-side domain and API modules.

## Data Flow

**Dashboard SSR flow:**

1. Request hits `src/app/(dashboard)/dashboard/page.tsx`.
2. Page calls `getDashboardData()` from `src/lib/dashboard.ts`.
3. Service performs parallel Prisma queries and computes aggregates.
4. Page renders cards/lists with formatted values via `src/lib/utils.ts`.

**Public queue flow:**

1. Browser loads `src/app/fila/[slug]/page.tsx` and mounts `PublicQueueBoard` from `src/components/queue/public-queue-board.tsx`.
2. Client hook `src/hooks/use-public-queue.ts` polls `/api/fila/publica/[slug]`.
3. Route handler `src/app/api/fila/publica/[slug]/route.ts` calls `getPublicQueue()` in `src/lib/queue.ts`.
4. Queue service recalculates queue entries and returns masked/public payload.

**State Management:**
- Server state is sourced from Prisma per request in server components and route handlers.
- Client-side async state uses React Query provider from `src/components/shared/providers.tsx`.
- Auth/session state uses Auth.js `SessionProvider` in `src/components/shared/providers.tsx` plus `auth()` on server.

## Key Abstractions

**Auth abstraction:**
- Purpose: Single auth definition and session/token shaping.
- Examples: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/permissions.ts`.
- Pattern: Centralized NextAuth config exported as `handlers`, `auth`, `signIn`, `signOut`.

**API response abstraction:**
- Purpose: Keep consistent JSON envelope.
- Examples: `src/lib/utils.ts`, used by `src/app/api/clientes/route.ts` and `src/app/api/servicos/route.ts`.
- Pattern: `apiSuccess(data, meta?)` and `apiError(code, message, details?, status?)`.

**Validation abstraction:**
- Purpose: Validate input boundary before writes.
- Examples: `src/lib/validations/customer.ts`, `src/lib/validations/service.ts`, `src/lib/validations/contract.ts`.
- Pattern: `schema.safeParse(...)` inside page server actions and API handlers.

## Entry Points

**Root app shell:**
- Location: `src/app/layout.tsx`
- Triggers: Every app request.
- Responsibilities: Global metadata, fonts, CSS, and provider composition.

**Root redirect page:**
- Location: `src/app/page.tsx`
- Triggers: `/` route.
- Responsibilities: Redirect to `/dashboard` or `/login` based on session.

**Dashboard shell:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Routes under `(dashboard)`.
- Responsibilities: Require session, resolve pathname header, mount sidebar/header chrome.

**Global middleware:**
- Location: `src/middleware.ts`
- Triggers: All non-static routes by matcher.
- Responsibilities: Public/private route gating and pathname header injection (`x-pathname`).

**HTTP API surface:**
- Location: `src/app/api/**/route.ts`
- Triggers: `/api/*` requests.
- Responsibilities: CRUD/report/upload/public endpoints.

## Error Handling

**Strategy:** Guard clauses at boundaries, structured API errors for handlers, framework redirects for page auth.

**Patterns:**
- Unauthorized/forbidden checks early in handlers (example `src/app/api/funcionarios/route.ts`).
- Validation errors mapped to `422` via `apiError` (example `src/app/api/clientes/route.ts`).
- Session-required pages redirect via `requireSession()` (`src/lib/permissions.ts`).

## Cross-Cutting Concerns

**Logging:** No dedicated logging layer detected; runtime logging relies on Prisma client log config in `src/lib/prisma.ts`.
**Validation:** Zod schemas in `src/lib/validations/*` applied in server actions and API handlers.
**Authentication:** Middleware gate in `src/middleware.ts` plus server-side auth checks using `auth()` from `src/lib/auth.ts`.

---

*Architecture analysis: 2026-04-13*
