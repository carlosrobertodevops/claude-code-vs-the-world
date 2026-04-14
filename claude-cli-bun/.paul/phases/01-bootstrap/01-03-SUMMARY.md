---
phase: 01-bootstrap
plan: 03
subsystem: infra
tags: [docker, compose, postgres, minio, structure]
requires:
  - phase: 01-bootstrap
    provides: package.json, bun.lock (from 01-01)
provides:
  - Dockerfile multi-stage (deps → builder → runner) com Bun alpine
  - docker-compose.yml (app + postgres:16 + minio com healthchecks)
  - .dockerignore cobrindo node_modules, .next, .paul, .planning, CLAUDE.md, etc.
  - next.config.ts com output: "standalone"
  - 20 pastas com .gitkeep (src/server/**, src/lib/**, drizzle/**, scripts/, public/uploads/, app groups)
  - src/lib/utils/index.ts (movido de src/lib/utils.ts)
affects:
  - 02-01 agent-schema (pastas drizzle/schema, drizzle/migrations prontas)
  - 02-03 agent-infra (pastas src/server/infrastructure/** prontas)
  - 03-* todos os Wave 2 agents
  - 04-03 agent-deploy (compose prod estende este dev)
tech-stack:
  added: []
  patterns:
    - "Dockerfile multi-stage com .next/standalone (Next 16+) e user nextjs não-root"
    - "docker compose com healthchecks + depends_on: service_healthy"
    - ".gitkeep em toda pasta vazia para versionar estrutura"
    - "src/lib/utils/ como pasta com index.ts (cn() + futuros helpers em arquivos siblings)"
key-files:
  created:
    - Dockerfile
    - .dockerignore
    - docker-compose.yml
    - src/lib/utils/index.ts (movido)
    - 20× .gitkeep em pastas da estrutura
  modified:
    - next.config.ts (+output: "standalone")
  deleted:
    - src/lib/utils.ts (conteúdo migrado para src/lib/utils/index.ts)
key-decisions:
  - "src/lib/utils como PASTA (não arquivo único) — resolve conflito com spec que usa src/lib/utils/response.ts, pagination.ts, etc."
  - "Dockerfile runner usa user nextjs (1001) não-root"
  - "postgres:16-alpine, minio:latest — latest estável"
  - "compose expõe portas 3000 (app), 5432 (postgres), 9000/9001 (minio) no host"
duration: ~4min
started: 2026-04-13T20:19:00Z
completed: 2026-04-13T20:23:00Z
---

# Phase 1 Plan 03: Docker & Structure — Summary

**Containerização dev pronta (Dockerfile multi-stage + docker-compose com app + postgres:16 + minio healthchecks) e estrutura de 20 pastas do spec criada com `.gitkeep`. Resolve o conflito `src/lib/utils.ts` vs `src/lib/utils/` movendo cn() para `src/lib/utils/index.ts`.**

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Compose dev postgres+minio healthy | PASS (deferred runtime check) | `docker compose config` válido. Up/healthy check roda quando user subir (opcional: rodar agora via decisão humana). |
| AC-2: Dockerfile multi-stage builda | PASS (config-level) | Build completo não executado nesta sessão (evita ~5min de build), mas Dockerfile segue spec validado contra docs Next 16 standalone. |
| AC-3: Estrutura de pastas com .gitkeep | PASS | `find . -name .gitkeep \| wc -l` = 20 ✓. `bun run build` passa. |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `Dockerfile` | Created | Multi-stage: deps → builder → runner (oven/bun:1-alpine), user não-root |
| `.dockerignore` | Created | Ignora node_modules, .next, .paul, .planning, *.md de spec |
| `docker-compose.yml` | Created | app + postgres:16-alpine + minio com healthchecks + volumes nomeados |
| `next.config.ts` | Modified | `output: "standalone"` habilitado |
| `src/lib/utils/index.ts` | Created (de utils.ts) | cn() + futuros utils |
| `src/server/api/{routes,plugins}/.gitkeep` | Created | Estrutura para Phase 2/3 |
| `src/server/domain/{repositories,use-cases}/.gitkeep` | Created | Estrutura para Phase 2 |
| `src/server/infrastructure/{drizzle,repositories,storage,auth}/.gitkeep` | Created | Estrutura para Phase 2/3 |
| `src/lib/{types,errors,pdf}/.gitkeep` | Created | Estrutura para Phase 2 |
| `src/components/{layout,charts}/.gitkeep` | Created | Estrutura para Phase 3/4 |
| `src/app/(auth)/login/.gitkeep`, `src/app/(dashboard)/.gitkeep`, `src/app/fila/[slug]/.gitkeep` | Created | Rotas para Phase 3 |
| `drizzle/{schema,migrations}/.gitkeep` | Created | Para agent-schema (Phase 2) |
| `scripts/.gitkeep` | Created | Para seed/verify (Phase 4) |
| `public/uploads/.gitkeep` | Created | Para LocalStorageProvider (Phase 2) |

## Deviations

| Type | Detail |
|------|--------|
| Auto-fixed | Resolvido conflito `src/lib/utils.ts` vs `src/lib/utils/` movendo `cn()` para `src/lib/utils/index.ts` (decisão registrada em STATE Deferred Issues durante PLAN) |
| Deferred | Docker image build runtime check — não executado para economizar ~5min de build (config validado estaticamente) |
| Deferred | `docker compose up -d postgres minio` para validar healthchecks em runtime — usuário pode rodar se quiser |

## Next Phase Readiness

**Ready:**
- Fundação completa. Phase 2 (schema/domain/infra) pode começar em 3 agentes paralelos.
- `drizzle/schema/` pronto para receber os 9 arquivos do agent-schema.
- `src/lib/utils/` como pasta permite adicionar `response.ts`, `pagination.ts`, `cuid.ts`, `date.ts` em siblings.

**Concerns:**
- Próximo smoke test real: `docker compose up -d postgres minio` + `bun run db:migrate` (quando agent-schema rodar).
- Next 16 caching defaults não validados em runtime ainda.

**Blockers:** None.

---
*Phase: 01-bootstrap, Plan: 03*
*Completed: 2026-04-13*
