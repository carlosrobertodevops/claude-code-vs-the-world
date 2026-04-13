# Codebase Concerns

**Analysis Date:** 2026-04-13

## Tech Debt

**Large route handlers with mixed responsibilities:**
- Issue: API handlers combine validation, authorization, business rules, persistence, and response mapping in single files.
- Files: `src/app/api/orcamentos/[id]/route.ts`, `src/app/api/orcamentos/route.ts`, `src/app/api/servicos/route.ts`, `src/app/api/contratos/[id]/route.ts`, `src/app/api/relatorios/route.ts`
- Impact: Small changes create regression risk across unrelated logic paths; onboarding and refactoring cost is high.
- Fix approach: Extract shared service modules under `src/lib/` (number generation, status transitions, total calculations, response helpers) and keep route files focused on request/response orchestration.

**Large client components with dense UI + state + mutation logic:**
- Issue: Page/form components hold table definitions, modal state, mutation handlers, and presentation in one file.
- Files: `src/app/(dashboard)/orcamentos/page.tsx`, `src/components/forms/service-order-form.tsx`, `src/components/forms/quote-form.tsx`
- Impact: UI changes can break submission flows or mutation side effects; reuse is limited.
- Fix approach: Split container logic (hooks/actions), table columns, and form sections into dedicated modules under `src/components/` and `src/hooks/`.

**Authorization strategy duplicated between middleware and route-level checks:**
- Issue: Some endpoints rely on middleware-only authorization while others also call `auth()` inside handlers.
- Files: `src/middleware.ts`, `src/lib/auth.config.ts`, `src/app/api/clientes/route.ts`, `src/app/api/clientes/[id]/route.ts`, `src/app/api/servicos/route.ts`, `src/app/api/upload/route.ts`
- Impact: Security behavior depends on matcher/config coupling; future matcher changes can unintentionally expose endpoints.
- Fix approach: Enforce explicit `auth()`/role checks in every non-public route handler and keep middleware as a first gate.

## Known Bugs

**Quote status filter sends invalid enum value `ALL`:**
- Symptoms: Selecting “Todos” can trigger server error when filtering quotes.
- Files: `src/app/(dashboard)/orcamentos/page.tsx`, `src/hooks/use-quotes.ts`, `src/app/api/orcamentos/route.ts`
- Trigger: UI sets `statusFilter` to `"ALL"`; hook forwards `status=ALL`; API applies `where.status = "ALL"`.
- Workaround: Keep status filter empty (`""`) instead of selecting `"ALL"`.

**Customer-specific service-order query parameter is ignored:**
- Symptoms: Customer detail views can receive unfiltered service orders.
- Files: `src/hooks/use-service-orders.ts`, `src/app/api/servicos/route.ts`
- Trigger: Hook requests `/api/servicos?customerId=...`, but API route only reads `status`, `page`, and `limit`.
- Workaround: Filter client-side after fetch.

## Security Considerations

**Public contract-signing endpoint exposes contract content by raw ID:**
- Risk: Anyone with a valid contract ID can read contract content and submit a signature.
- Files: `src/app/api/contratos/[id]/assinar/route.ts`, `src/app/contratos/[id]/assinar/page.tsx`, `src/lib/auth.config.ts`
- Current mitigation: Route is intentionally public and checks signed/cancelled state before updates.
- Recommendations: Add signed, expiring tokenized links and verify token in both GET/POST handlers.

**Upload validation trusts MIME type and lacks abuse controls:**
- Risk: Malicious files and high-volume upload abuse are not blocked by content inspection/rate limits.
- Files: `src/app/api/upload/route.ts`, `src/lib/storage.ts`
- Current mitigation: Extension-independent filename generation, size limit (10MB), allowlist by `file.type`.
- Recommendations: Add server-side file signature checks, per-user/IP rate limiting, and malware scanning workflow.

**Seed includes static credentials in source code:**
- Risk: Reused seed credentials can leak into non-dev environments.
- Files: `prisma/seed.ts`
- Current mitigation: Password is hashed before persistence.
- Recommendations: Gate seed execution by environment and read seed password from environment variables.

## Performance Bottlenecks

**Queue wait-time computation is quadratic:**
- Problem: Public queue response calculates `itemsAhead` and re-reduces for each entry.
- Files: `src/app/api/fila/publica/[slug]/route.ts`
- Cause: Nested aggregation (`map` + `slice` + `reduce`) over active entries.
- Improvement path: Replace with one running cumulative total pass to compute estimated waits in O(n).

**Report endpoints load full datasets and aggregate in application memory:**
- Problem: Large tables increase response time and memory usage.
- Files: `src/app/api/relatorios/route.ts`
- Cause: `findMany` queries fetch broad result sets, then group/sort/filter in JavaScript.
- Improvement path: Push aggregation to SQL/Prisma group operations and bound query windows.

## Fragile Areas

**Sequential number generation for quotes and service orders:**
- Files: `src/app/api/orcamentos/route.ts`, `src/app/api/servicos/route.ts`
- Why fragile: Both read last record then increment; concurrent requests can generate duplicate numbers.
- Safe modification: Replace with database-backed sequence/counter table inside a transaction.
- Test coverage: Gaps in concurrent create-flow tests.

**Quote update mutates child items in multi-step flow without transaction:**
- Files: `src/app/api/orcamentos/[id]/route.ts`
- Why fragile: `deleteMany` runs before `update`; partial failure can leave quotes without items.
- Safe modification: Wrap delete + recreate + parent update in one transaction and validate item count post-write.
- Test coverage: Gaps in failure-path tests for partial updates.

## Scaling Limits

**Local disk storage for uploads:**
- Current capacity: Single-instance `public/uploads` storage via local filesystem.
- Limit: Multi-instance deployments cannot share files; container restarts can lose local state.
- Scaling path: Move `src/lib/storage.ts` to object storage backend (S3-compatible) with signed URLs.

**High-frequency public queue polling with uncached DB reads:**
- Current capacity: Default 30s polling per client (`src/hooks/use-queue.ts`) and full queue query each request.
- Limit: Public traffic growth increases read load linearly with active viewers.
- Scaling path: Add response caching/materialized queue projection and conditional revalidation.

## Dependencies at Risk

**`next-auth` beta in production dependency set:**
- Risk: Beta API surface can change and break auth behavior unexpectedly.
- Impact: Login/session flow and middleware authorization can fail.
- Migration plan: Pin to a stable major release once available and verify callback/middleware compatibility.

## Missing Critical Features

**No automated test pipeline:**
- Problem: Repository has no test runner scripts or test files.
- Blocks: Safe refactoring of API routes, auth rules, queue calculations, and financial totals.

**No centralized audit/event logging for critical actions:**
- Problem: State-changing actions rely on request-local responses and console error logging only.
- Blocks: Reliable forensics for contract signing, queue reorder operations, and inventory mutations.

## Test Coverage Gaps

**API contract and authorization paths are untested:**
- What's not tested: Role gating, public-vs-private endpoints, error payload consistency.
- Files: `src/app/api/**/route.ts`, `src/lib/auth.config.ts`, `src/middleware.ts`
- Risk: Silent security regressions and inconsistent client behavior.
- Priority: High

**Business-critical calculations are untested:**
- What's not tested: Quote totals/discount calculations, queue ETA calculations, stock movement balance updates.
- Files: `src/app/api/orcamentos/route.ts`, `src/app/api/orcamentos/[id]/route.ts`, `src/app/api/fila/publica/[slug]/route.ts`, `src/app/api/inventario/movimentacoes/route.ts`
- Risk: Financial and operational inaccuracies reaching production.
- Priority: High

**Concurrency-sensitive flows are untested:**
- What's not tested: Simultaneous quote/service-order creation number generation and multi-write transactional integrity.
- Files: `src/app/api/orcamentos/route.ts`, `src/app/api/servicos/route.ts`, `src/app/api/orcamentos/[id]/route.ts`
- Risk: Duplicate identifiers and partial writes under load.
- Priority: High

---

*Concerns audit: 2026-04-13*
