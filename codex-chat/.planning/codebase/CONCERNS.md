# Codebase Concerns

**Analysis Date:** 2026-04-13

## Tech Debt

**Duplicated business logic across Server Actions and API routes:**
- Issue: Core flows are implemented twice (page-level Server Actions and `/api` handlers), creating drift risk.
- Files: `src/app/(dashboard)/servicos/page.tsx`, `src/app/api/servicos/route.ts`, `src/app/(dashboard)/orcamentos/page.tsx`, `src/app/api/orcamentos/route.ts`, `src/app/(dashboard)/contratos/page.tsx`, `src/app/api/contratos/route.ts`, `src/app/(dashboard)/inventario/page.tsx`, `src/app/api/inventario/route.ts`
- Impact: Behavior diverges over time (validation, side effects, permission checks), making fixes incomplete.
- Fix approach: Consolidate business operations into service-layer functions in `src/lib/*` and call from both Server Actions and API handlers.

**No transactional boundaries for multi-write operations:**
- Issue: Related writes run as separate queries instead of atomic transactions.
- Files: `src/app/api/inventario/movimentacoes/route.ts`, `src/app/(dashboard)/inventario/page.tsx`, `src/app/(dashboard)/servicos/page.tsx`
- Impact: Partial writes can leave inconsistent state (movement created without stock update, loyalty write without customer points update).
- Fix approach: Wrap dependent writes in `prisma.$transaction` and add explicit rollback/error handling paths.

## Known Bugs

**Public queue page can crash on fetch errors:**
- Symptoms: Runtime error when public queue request fails and `payload` is undefined.
- Files: `src/hooks/use-public-queue.ts`, `src/components/queue/public-queue-board.tsx`
- Trigger: Open `/fila/[slug]` and force `/api/fila/publica/[slug]` to return non-2xx.
- Workaround: Reload and retry; no in-component fallback UI for error state.

**Order cancellation does not reverse awarded loyalty points:**
- Symptoms: Customer keeps points after service order status changes from `COMPLETED` to `CANCELLED`.
- Files: `src/app/(dashboard)/servicos/page.tsx`
- Trigger: Complete an order (awards points), then cancel the same order.
- Workaround: Manual database correction in `Customer.loyaltyPoints` and `LoyaltyTransaction`.

## Security Considerations

**Public contract signing endpoint has no anti-replay or signer verification controls:**
- Risk: Anyone with a contract URL can submit signatures repeatedly.
- Files: `src/middleware.ts`, `src/app/api/contratos/[id]/assinar/route.ts`, `src/app/contratos/[id]/page.tsx`
- Current mitigation: Contract IDs are opaque and status is shown in UI.
- Recommendations: Add signed one-time tokens, expiry window, status transition guard, and IP/user-agent audit trail.

**Default seed credentials are exposed in UI copy and repository docs:**
- Risk: Weak default passwords are discoverable and reusable in non-dev deployments.
- Files: `src/app/(auth)/login/page.tsx`, `prisma/seed.ts`, `README.md`
- Current mitigation: None detected in code.
- Recommendations: Remove credential hints from UI, enforce bootstrap password rotation, and gate seed credentials to local/dev only.

## Performance Bottlenecks

**Queue recalculation does full rebuild on every public read:**
- Problem: Public queue read path performs `deleteMany` + `createMany` for all waiting entries.
- Files: `src/lib/queue.ts`, `src/app/api/fila/publica/[slug]/route.ts`, `src/hooks/use-public-queue.ts`
- Cause: `getPublicQueue()` always calls `recalculateQueue()`, while clients poll every 30 seconds.
- Improvement path: Recalculate on write-side events (order create/status change) and serve cached queue snapshots for reads.

**CSV export loads full datasets into memory before response:**
- Problem: Export endpoints fetch all rows and build full CSV string in-process.
- Files: `src/app/api/relatorios/export/route.ts`, `src/lib/reports.ts`
- Cause: No pagination or streaming for `findMany()` results.
- Improvement path: Use paginated/streamed export and selective time filtering.

## Fragile Areas

**Update/delete handlers rely on ORM exceptions for control flow:**
- Files: `src/app/api/clientes/[id]/route.ts`, `src/app/api/orcamentos/[id]/route.ts`, `src/app/api/contratos/[id]/route.ts`, `src/app/api/inventario/[id]/route.ts`, `src/app/api/funcionarios/[id]/route.ts`
- Why fragile: Missing `try/catch` and explicit not-found mapping means invalid IDs become generic 500s.
- Safe modification: Add centralized Prisma error mapping (`P2025`, unique violations) and consistent `apiError` responses.
- Test coverage: No API regression tests detected for not-found and conflict branches.

**Large page files mix data access, mutations, and UI rendering:**
- Files: `src/app/(dashboard)/servicos/page.tsx`, `src/app/(dashboard)/inventario/page.tsx`, `src/app/(dashboard)/clientes/page.tsx`
- Why fragile: High-coupling components are harder to refactor safely; changes can break both UX and domain logic.
- Safe modification: Extract server actions and query logic into `src/lib/*` modules and keep pages focused on composition.
- Test coverage: No component or integration tests detected for these flows.

## Scaling Limits

**Sequence generation is race-prone under concurrent writes:**
- Current capacity: Works in low-concurrency environments.
- Limit: Concurrent creates can derive identical values from `findFirst` + `nextSequence`, causing unique key collisions.
- Scaling path: Replace with database-backed sequence/counter table or collision-safe retry strategy.
- Files: `src/lib/numbering.ts`, `src/app/api/servicos/route.ts`, `src/app/api/orcamentos/route.ts`, `src/app/api/contratos/route.ts`

**Public queue polling scales linearly with active viewers:**
- Current capacity: Functional for small audience.
- Limit: Each viewer triggers recurring DB-heavy queue recomputation via `/api/fila/publica/[slug]`.
- Scaling path: Switch to incremental queue updates, cache layer, and adaptive polling/WebSocket strategy.
- Files: `src/hooks/use-public-queue.ts`, `src/lib/queue.ts`, `src/app/api/fila/publica/[slug]/route.ts`

## Dependencies at Risk

**`next-auth` beta usage in production path:**
- Risk: Beta APIs may change and create upgrade/behavior instability.
- Impact: Authentication/session flows may break during dependency upgrades.
- Migration plan: Track stable Auth.js release and pin/validate migration in `src/lib/auth.ts`.
- Files: `package.json`, `src/lib/auth.ts`

**`react-signature-canvas` alpha usage for contract signing:**
- Risk: Alpha package can have breaking changes or unpatched issues.
- Impact: Signature capture can regress and block contract finalization.
- Migration plan: Move to a stable signature component or pin strict version with targeted regression tests.
- Files: `package.json`, `src/components/shared/signature-pad.tsx`

## Missing Critical Features

**No automated test suite configured:**
- Problem: Critical flows ship without executable regression safety net.
- Blocks: Safe refactoring of API routes, queue logic, and status transition flows.
- Files: `package.json` (no `test`/`coverage` scripts), repository-wide (`**/*.test.*` and `**/*.spec.*` not detected)

**No rate limiting or abuse control on public contract signing flow:**
- Problem: Public signing endpoint accepts repeated submissions without throttling.
- Blocks: Reliable legal/compliance posture for signature events.
- Files: `src/app/api/contratos/[id]/assinar/route.ts`, `src/middleware.ts`

## Test Coverage Gaps

**Core domain flows are untested:**
- What's not tested: Order lifecycle transitions, queue recalculation, loyalty point side effects, inventory movement side effects, public signing flow.
- Files: `src/app/(dashboard)/servicos/page.tsx`, `src/lib/queue.ts`, `src/app/api/inventario/movimentacoes/route.ts`, `src/app/api/contratos/[id]/assinar/route.ts`
- Risk: Regressions in financial/operational workflows can reach production unnoticed.
- Priority: High

**Error-path handling is untested:**
- What's not tested: Prisma not-found/conflict mapping, failed upstream fetch behavior in queue UI, invalid payload branches for mutable endpoints.
- Files: `src/components/queue/public-queue-board.tsx`, `src/app/api/*/route.ts`, `src/lib/utils.ts`
- Risk: Users receive 500s or broken screens instead of actionable errors.
- Priority: High

---

*Concerns audit: 2026-04-13*
