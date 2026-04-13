# Testing Patterns

**Analysis Date:** 2026-04-13

## Test Framework

**Runner:**
- Not configured in project scripts (`package.json` has no `test` script).
- Test config files not detected at repo root (`jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`).

**Assertion Library:**
- Not detected in runtime or dev dependencies in `package.json`.

**Run Commands:**
```bash
# No test command configured in package.json
npm run lint          # Current automated quality gate
npm run build         # Build-time validation used by project
```

## Test File Organization

**Location:**
- Automated test files are not detected (`**/*.test.*`, `**/*.spec.*`, `**/__tests__/**` returned no matches).

**Naming:**
- Not applicable (no test files detected).

**Structure:**
```
No test directory pattern detected.
```

## Test Structure

**Suite Organization:**
```typescript
// Not detected: no describe()/it()/test() usage in src/**
```

**Patterns:**
- Setup pattern: Not detected.
- Teardown pattern: Not detected.
- Assertion pattern: Not detected.

## Mocking

**Framework:**
- Not detected.

**Patterns:**
```typescript
// Not detected: no mocking utilities found in source or config files.
```

**What to Mock:**
- No repository-level mocking guideline detected.

**What NOT to Mock:**
- No repository-level rule detected.

## Fixtures and Factories

**Test Data:**
```typescript
// Automated test fixtures/factories not detected.
```

**Location:**
- Dedicated test fixture directories are not detected.
- Seed data exists for development database bootstrap in `prisma/seed.ts` and is wired via `package.json` (`prisma.seed`).

## Coverage

**Requirements:**
- No coverage thresholds or coverage script detected in `package.json`.

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not detected.

**Integration Tests:**
- Not detected.

**E2E Tests:**
- Not used as a configured project workflow.
- `@playwright/test` appears only as a transitive entry in `package-lock.json`; no Playwright project config file is present.

## Common Patterns

**Async Testing:**
```typescript
// Not detected in automated tests.
```

**Error Testing:**
```typescript
// Not detected in automated tests.
```

---

*Testing analysis: 2026-04-13*
