# Coding Conventions

**Analysis Date:** 2026-04-13

## Naming Patterns

**Files:**
- Route handlers use `route.ts` under `src/app/api/**` (example: `src/app/api/clientes/route.ts`).
- App Router pages and layouts use `page.tsx` and `layout.tsx` (examples: `src/app/(dashboard)/clientes/page.tsx`, `src/app/layout.tsx`).
- Shared components use kebab-case file names (examples: `src/components/shared/page-header.tsx`, `src/components/shared/status-badge.tsx`).
- Validation modules use lowercase domain names (examples: `src/lib/validations/customer.ts`, `src/lib/validations/service.ts`).

**Functions:**
- Functions use camelCase (examples: `formatCurrency`, `parseDecimal` in `src/lib/utils.ts`; `recalculateQueue` in `src/lib/queue.ts`).
- React components use PascalCase function names (examples: `LoginPage` in `src/app/(auth)/login/page.tsx`, `PublicQueueBoard` in `src/components/queue/public-queue-board.tsx`).

**Variables:**
- Local variables use camelCase (examples: `queryClient` in `src/components/shared/providers.tsx`, `signatureData` in `src/components/shared/signature-pad.tsx`).

**Types:**
- Type aliases and interfaces use PascalCase (examples: `LoginFormValues` in `src/app/(auth)/login/page.tsx`, `StoredFile` in `src/lib/storage.ts`, `ButtonProps` in `src/components/ui/button.tsx`).

## Code Style

**Formatting:**
- Dedicated formatter config not detected (`.prettierrc*` and `prettier.config.*` are not present at repo root).
- Source files consistently use semicolons, double quotes, and trailing commas (examples: `src/lib/utils.ts`, `src/lib/storage.ts`, `src/app/layout.tsx`).

**Linting:**
- ESLint flat config is used in `eslint.config.mjs`.
- `next/core-web-vitals` and `next/typescript` rulesets are extended in `eslint.config.mjs`.
- `npm run lint` maps to `eslint .` in `package.json`.

## Import Organization

**Order:**
1. External/Node imports first (examples: `src/lib/storage.ts`, `src/app/layout.tsx`).
2. Blank line separator.
3. Internal `@/` imports (examples: `src/app/api/servicos/route.ts`, `src/components/ui/button.tsx`).
4. Side-effect stylesheet imports placed after module imports where used (`src/app/layout.tsx`).

**Path Aliases:**
- `@/* -> ./src/*` configured in `tsconfig.json`.
- Internal modules should be imported with `@/` alias (examples across `src/app/**` and `src/components/**`).

## Error Handling

**Patterns:**
- API routes return standardized JSON envelopes through `apiError` and `apiSuccess` from `src/lib/utils.ts` (examples: `src/app/api/clientes/route.ts`, `src/app/api/funcionarios/route.ts`).
- Validation uses Zod `safeParse` with early return on failure (examples: `src/app/api/servicos/route.ts`, `src/app/(dashboard)/clientes/page.tsx`).
- Guard clauses are preferred for auth/authorization checks (examples: `src/app/api/relatorios/export/route.ts`, `src/app/api/funcionarios/route.ts`).

## Logging

**Framework:** None detected in `src/**` (`console.*` usage not detected in source files).

**Patterns:**
- Runtime errors are surfaced via structured API responses (`apiError` in `src/lib/utils.ts`) or UI toasts (`src/components/shared/signature-pad.tsx`, `src/app/(auth)/login/page.tsx`).

## Comments

**When to Comment:**
- Inline comments and explanatory comment blocks are not a regular pattern in `src/**`.

**JSDoc/TSDoc:**
- JSDoc/TSDoc blocks are not detected in `src/**`.

## Function Design

**Size:**
- Utility and validation functions are short and single-purpose (examples: `src/lib/utils.ts`, `src/lib/validations/*.ts`).
- Route handlers and dashboard pages keep orchestration inline with early returns (examples: `src/app/api/servicos/route.ts`, `src/app/(dashboard)/clientes/page.tsx`).

**Parameters:**
- API handlers use Web standard signatures (`GET()`, `POST(request: Request)`) in `src/app/api/**/route.ts`.
- Server actions accept `FormData` in dashboard pages (examples: `createCustomer(formData: FormData)` in `src/app/(dashboard)/clientes/page.tsx`).

**Return Values:**
- API handlers return `Response` via `Response.json`, `apiSuccess`, `apiError`, or direct `new Response(...)` (examples: `src/lib/utils.ts`, `src/app/api/relatorios/export/route.ts`).

## Module Design

**Exports:**
- Named exports are preferred for shared modules (`src/lib/utils.ts`, `src/lib/validations/customer.ts`, `src/components/ui/button.tsx`).
- Default exports are used for App Router page/layout entry points and middleware (`src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/middleware.ts`).

**Barrel Files:**
- Barrel files (`index.ts`) are not detected under `src/components/**` or `src/lib/**`.

---

*Convention analysis: 2026-04-13*
