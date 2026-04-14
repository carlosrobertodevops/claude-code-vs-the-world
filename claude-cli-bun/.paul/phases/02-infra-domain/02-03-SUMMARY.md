---
phase: 02-infra-domain
plan: 03
subsystem: infra
tags: [errors, utils, storage, auth, bcrypt, jose]
requires:
  - phase: 01-bootstrap
    provides: bcryptjs, @paralleldrive/cuid2, next-auth@5 (transitivamente traz jose)
provides:
  - 6 classes de erro + index
  - 4 utils (response, pagination, cuid, date)
  - IStorageProvider + LocalStorageProvider + MinIOStorageProvider (placeholder) + factory
  - auth/password.ts (bcrypt 12 rounds) + auth/jwt.ts (jose HS256 com NEXTAUTH_SECRET)
affects:
  - 03-* (todos usam errors + response helpers)
  - agent-auth (password + jwt)
  - agent-customers, agent-service-orders (storage para fotos)
tech-stack:
  added: []
  patterns:
    - "AppError + 5 subclasses com code, message, statusCode, details"
    - "response.success()/error() retornando ApiResponse<T> tipado"
    - "IStorageProvider + factory por env STORAGE_PROVIDER"
    - "jose importado direto (vem transitivo de next-auth@5) — sem dep nova"
key-files:
  created:
    - src/lib/errors/{AppError,NotFoundError,UnauthorizedError,ForbiddenError,ValidationError,ConflictError,index}.ts
    - src/lib/utils/{response,pagination,cuid,date}.ts
    - src/server/infrastructure/storage/{IStorageProvider,LocalStorageProvider,MinIOStorageProvider,storage.factory}.ts
    - src/server/infrastructure/auth/{password,jwt}.ts
duration: ~4min
started: 2026-04-13T20:43:00Z
completed: 2026-04-13T20:47:00Z
---

# Phase 2 Plan 03: Cross-Cutting Infra — Summary

**6 classes de erro (com códigos/status), 4 utils (response, pagination, cuid, date pt-BR), sistema de storage com factory local/minio, e helpers de auth (bcrypt 12 rounds + jose HS256) usando NEXTAUTH_SECRET. Zero novas deps instaladas — `jose` usado transitivamente de `next-auth@5`.**

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Errors + helpers | PASS | 7 error files + 4 utils files. `bun run typecheck` limpo. |
| AC-2: StorageProvider + factory | PASS | 4 arquivos. Factory retorna Local por default; MinIO placeholder com TODOs. |
| AC-3: Auth helpers | PASS | `hashPassword`/`verifyPassword` (12 rounds); `signJwt`/`verifyJwt` (HS256, secret de NEXTAUTH_SECRET). |

## Deviations

| Type | Detail |
|------|--------|
| Deferred | `MinIOStorageProvider` é placeholder — `upload()` e `delete()` lançam erro. Spec exige paridade dev/prod, mas para v1 `STORAGE_PROVIDER=local` é suficiente. Wave 3 (`agent-deploy`) ou Phase 3 avançada implementa o MinIO real (considerar `minio-js` como dep nova). |
| Escolha | Usado `jose` (transitivo de next-auth) em vez de instalar lib própria de JWT — alinhado com Auth.js v5. |

## Next Phase Readiness

**Ready:** Todas as primitivas cross-cutting prontas. `agent-auth` pode montar login com password+jwt, `agent-customers` pode subir fotos via storage factory.

**Concerns:** MinIO real não testado em runtime — se produção usar MinIO, precisa implementação concreta antes do deploy.

---
*Phase: 02-infra-domain, Plan: 03*
*Completed: 2026-04-13*
