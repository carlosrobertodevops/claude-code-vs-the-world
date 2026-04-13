# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** App Router modular monolith (Next.js full-stack app with server-rendered pages + route handlers + shared Prisma access).

**Key Characteristics:**
- Single repository owns UI, API, auth, and persistence layers (`src/app/**`, `src/app/api/**`, `src/lib/**`, `prisma/**`).
- API endpoints are thin handlers that apply auth + validation + Prisma operations (`src/app/api/**/route.ts`).
- Shared utility layer centralizes response shape, constants, storage, and validation (`src/lib/utils.ts`, `src/lib/constants.ts`, `src/lib/storage.ts`, `src/lib/validations/index.ts`).

## Layers

**Presentation Layer (Pages + Components):**
- Purpose: Render dashboards/forms and trigger data operations.
- Location: `src/app/(dashboard)/**`, `src/app/(auth)/**`, `src/components/**`.
- Contains: Server components (e.g., `src/app/(dashboard)/dashboard/page.tsx`) and client components (e.g., `src/app/(dashboard)/clientes/page.tsx`).
- Depends on: API routes via `fetch`, auth/session context via NextAuth providers, helper formatters from `src/lib/utils.ts`.
- Used by: Browser clients.

**API Layer (Route Handlers):**
- Purpose: Handle CRUD/business operations and return consistent JSON envelope.
- Location: `src/app/api/**/route.ts`.
- Contains: Domain-specific endpoints (customers, service orders, inventory, reports, contracts, upload, queue).
- Depends on: `auth()` from `src/lib/auth.ts`, Zod schemas from `src/lib/validations/index.ts`, Prisma client from `src/lib/prisma.ts`, response helpers from `src/lib/utils.ts`.
- Used by: Client pages (e.g., `src/app/(dashboard)/servicos/page.tsx`, `src/app/(dashboard)/relatorios/page.tsx`) and public queue page `src/app/fila/[slug]/page.tsx`.

**Security & Session Layer:**
- Purpose: Authenticate users and enforce route-level authorization.
- Location: `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`.
- Contains: Credentials provider, JWT/session callbacks, public/private route checks.
- Depends on: Prisma user records (`prisma/schema.prisma` model `User`), bcrypt (`src/lib/auth.ts`).
- Used by: Middleware and all protected endpoints/pages.

**Persistence Layer:**
- Purpose: Define and access relational data.
- Location: `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/prisma.ts`.
- Contains: Prisma models/enums and DB client singleton.
- Depends on: PostgreSQL via `DATABASE_URL` and `pg` adapter in `src/lib/prisma.ts`.
- Used by: API handlers and server-side dashboard page.

## Data Flow

**Flow 1: Client Dashboard Action → API → DB → UI Refresh**

1. Client page dispatches request (`fetch("/api/...")`) from files like `src/app/(dashboard)/clientes/page.tsx` and `src/app/(dashboard)/servicos/page.tsx`.
2. API handler authenticates with `auth()` and validates payload with Zod schema (e.g., `src/app/api/clientes/route.ts`, `src/app/api/servicos/route.ts`).
3. Prisma query/mutation executes in `src/app/api/**/route.ts` using `src/lib/prisma.ts` and schema from `prisma/schema.prisma`.
4. Handler returns standardized envelope via `successResponse`/`errorResponse` from `src/lib/utils.ts`; page updates local state.

**Flow 2: Server-rendered Dashboard Metrics**

1. `src/app/(dashboard)/dashboard/page.tsx` runs on server and calls `auth()`.
2. Page issues parallel Prisma reads and raw SQL aggregations.
3. JSX renders metrics/charts without intermediate API call.

**Flow 3: Public Queue View**

1. Public page `src/app/fila/[slug]/page.tsx` polls `/api/fila/publica/[slug]` every 30s.
2. Endpoint `src/app/api/fila/publica/[slug]/route.ts` joins queue/service/vehicle data and computes estimated wait.
3. Response returns masked plates and status summary for public display.

**State Management:**
- Local component state via React hooks in client pages/components.
- Session state via `SessionProvider` in `src/components/providers.tsx`.
- Query client configured in `src/components/providers.tsx` (default stale time), but most page data fetching uses direct `fetch` + component state.

## Key Abstractions

**Standard API Response Envelope:**
- Purpose: Uniform success/error payload contract.
- Examples: `src/lib/utils.ts`, consumed by `src/app/(dashboard)/*/page.tsx` fetch handlers.
- Pattern: `successResponse(data, meta?)` and `errorResponse(code, message, status, details?)`.

**Schema-first Input Validation:**
- Purpose: Validate and coerce HTTP payloads before DB writes.
- Examples: `src/lib/validations/index.ts`, used in routes like `src/app/api/inventario/movimentacao/route.ts`.
- Pattern: `schema.safeParse(body)` with flattened errors in response.

**Prisma Singleton with PG Adapter:**
- Purpose: Central DB client reuse and environment-safe singleton behavior.
- Examples: `src/lib/prisma.ts`, imported by all route handlers and server pages.
- Pattern: global singleton cache in non-production + adapter-backed Prisma client.

## Entry Points

**Root App Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every route render.
- Responsibilities: global CSS, font include, provider tree mounting.

**Root Route Redirector:**
- Location: `src/app/page.tsx`
- Triggers: GET `/`.
- Responsibilities: redirect authenticated users to `/dashboard`, otherwise `/login`.

**Auth Route Entry:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth callback/session/login endpoints.
- Responsibilities: expose NextAuth GET/POST handlers from `src/lib/auth.ts`.

**Request Gate Middleware:**
- Location: `src/middleware.ts`
- Triggers: matched routes outside excluded static/upload paths.
- Responsibilities: apply NextAuth authorization checks globally.

## Error Handling

**Strategy:** Return structured JSON error payloads from API layer and handle UI fallback/loading states in pages.

**Patterns:**
- API handlers wrap logic in `try/catch` and use `errorResponse(...)` with explicit HTTP codes (`src/app/api/**/route.ts`).
- Validation failures return `VALIDATION` code with Zod details (`src/app/api/clientes/route.ts`, `src/app/api/servicos/route.ts`).

## Cross-Cutting Concerns

**Logging:** Minimal runtime logging; mostly absent in app routes, with console logs in `prisma/seed.ts`.
**Validation:** Centralized Zod schemas in `src/lib/validations/index.ts`.
**Authentication:** NextAuth credentials + middleware gating + role checks in route handlers (`src/lib/auth.config.ts`, `src/middleware.ts`, `src/app/api/**/route.ts`).

---

*Architecture analysis: 2026-04-12*
