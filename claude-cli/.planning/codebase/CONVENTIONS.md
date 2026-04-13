# Coding Conventions

**Analysis Date:** 2026-04-13

## Naming Patterns

**Files:**
- Route handlers use file-based Next App Router naming: `src/app/api/**/route.ts`.
- React page/layout files use framework names: `src/app/**/page.tsx`, `src/app/**/layout.tsx`.
- Hooks use `use-*.ts` naming: `src/hooks/use-customers.ts`, `src/hooks/use-service-orders.ts`.
- Validation modules are domain-based: `src/lib/validations/customer.ts`, `src/lib/validations/service.ts`.
- UI primitives use kebab-case in `src/components/ui/*.tsx` (for example `src/components/ui/button.tsx`).

**Functions:**
- General functions use `camelCase`: `fetchJson` in `src/hooks/use-customers.ts`, `createPrismaClient` in `src/lib/prisma.ts`.
- React components use `PascalCase`: `CustomerForm` in `src/components/forms/customer-form.tsx`, `ServiceOrdersPage` in `src/app/(dashboard)/servicos/page.tsx`.
- API handlers use uppercase HTTP verb exports: `GET`, `POST`, `PUT`, `DELETE` in `src/app/api/**/route.ts`.

**Variables:**
- Runtime variables use `camelCase`: `queryClient`, `statusFilter`, `isLoading`.
- Constants use `UPPER_SNAKE_CASE`: `ALLOWED_TYPES`, `MAX_SIZE` in `src/app/api/upload/route.ts`.

**Types:**
- Domain types/interfaces use `PascalCase`: `ApiResponse` in `src/types/index.ts`, `CustomerWithCount` in `src/hooks/use-customers.ts`.
- Input DTO types follow `CreateXInput`/`UpdateXInput` pattern from Zod schemas in `src/lib/validations/*.ts`.

## Code Style

**Formatting:**
- Tool used: no dedicated formatter config detected (`.prettierrc*` not present at project root).
- Current style is split by module origin:
  - Semicolon-heavy style in API/hooks/forms (for example `src/app/api/clientes/route.ts`, `src/hooks/use-inventory.ts`, `src/components/forms/customer-form.tsx`).
  - Semicolon-light style in many UI primitives (for example `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/lib/utils.ts`).

**Linting:**
- Tool used: ESLint flat config at `eslint.config.mjs`.
- Ruleset base: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` in `eslint.config.mjs`.
- Project lint command: `npm run lint` from `package.json`.

## Import Organization

**Order:**
1. External packages first (for example `react`, `@tanstack/react-query`, `next/server`) in `src/components/forms/customer-form.tsx` and `src/app/api/funcionarios/route.ts`.
2. Internal absolute imports via alias `@/` second (for example `@/lib/prisma`, `@/components/ui/button`).
3. Type imports are explicitly marked with `import type` where used (for example `src/hooks/use-inventory.ts`, `src/components/forms/customer-form.tsx`).

**Path Aliases:**
- `@/*` → `src/*` configured in `tsconfig.json`.

## Error Handling

**Patterns:**
- API routes wrap handlers in `try/catch` and return structured JSON errors with `success: false` and `error.code`/`error.message` (for example `src/app/api/clientes/route.ts`, `src/app/api/funcionarios/route.ts`).
- Input validation uses `safeParse` and returns HTTP 400 with flattened field errors (for example `src/app/api/clientes/route.ts`, `src/app/api/clientes/[id]/route.ts`).
- Client-side async actions throw `Error` from fetch helpers and surface user feedback in UI (for example `fetchJson` in `src/hooks/use-customers.ts`, `toast.error` in `src/app/(dashboard)/servicos/page.tsx`).

## Logging

**Framework:** console

**Patterns:**
- Server/API errors are logged with `console.error` including endpoint context (for example `src/app/api/funcionarios/route.ts`, `src/app/api/orcamentos/[id]/route.ts`, `src/app/api/upload/route.ts`).
- Frontend components generally do not log; they use toast notifications for user-facing feedback (for example `src/app/(dashboard)/servicos/page.tsx`).

## Comments

**When to Comment:**
- Short section-divider comments are used to organize hook modules (for example `// Customers list`, `// Types` in `src/hooks/use-customers.ts`; `// ---- Products ----` in `src/hooks/use-inventory.ts`).
- Inline comments appear mainly for constants/units (for example `// 10MB` in `src/app/api/upload/route.ts`, `src/lib/constants.ts`).

**JSDoc/TSDoc:**
- Not detected in `src/` modules reviewed.

## Function Design

**Size:**
- Utility functions are small and focused (`cn` in `src/lib/utils.ts`, `createPrismaClient` in `src/lib/prisma.ts`).
- Route handlers can be large and multi-step (for example `POST` in `src/app/api/funcionarios/route.ts`, `src/app/api/orcamentos/route.ts`).

**Parameters:**
- Typed request/params signatures are used in route handlers (for example `RouteParams` in `src/app/api/clientes/[id]/route.ts`).
- Form components receive typed props interfaces (for example `CustomerFormProps` in `src/components/forms/customer-form.tsx`).

**Return Values:**
- API handlers return `NextResponse.json(...)` with consistent `success` envelope.
- Hooks return React Query objects directly from `useQuery`/`useMutation`.

## Module Design

**Exports:**
- Prefer named exports for hooks, schemas, types, and components (for example `src/hooks/use-customers.ts`, `src/lib/validations/customer.ts`, `src/components/ui/button.tsx`).
- Default exports are primarily reserved for Next.js route-bound modules (`src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/middleware.ts`).

**Barrel Files:**
- Minimal barrel usage detected: `src/types/index.ts` as a shared type entrypoint.
- Broad component/hook barrel files are not detected.

---

*Convention analysis: 2026-04-13*
