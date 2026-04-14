---
phase: 01-bootstrap
plan: 01
subsystem: infra
tags: [next, bun, tailwind, shadcn, next-auth, drizzle, typescript]

# Dependency graph
requires: []
provides:
  - package.json with all LavaFlow runtime + dev dependencies
  - scaffolded Next 16 App Router project with TypeScript strict
  - 12 shadcn/ui base components
  - src/lib/utils.ts with cn() helper
  - drizzle-kit binary available via npm scripts
affects:
  - 01-02 (needs package.json and tsconfig to extend)
  - 01-03 (needs package.json and node_modules for Docker build)
  - 02-01 agent-schema (needs drizzle-kit)
  - 02-03 agent-infra (needs bcryptjs, @paralleldrive/cuid2)
  - 03-* all Wave 2 agents (need full dep tree)

# Tech tracking
tech-stack:
  added:
    - next@16.2.3
    - react@19.2.4
    - typescript@^5 (strict)
    - tailwindcss@^4 (via @tailwindcss/postcss)
    - elysia@1.4.28 + @elysiajs/jwt@1.4.1 + @elysiajs/cors@1.4.1
    - drizzle-orm@0.45.2 + drizzle-kit@0.31.10
    - next-auth@5.0.0-beta.30 (Auth.js v5)
    - zod@4.3.6
    - @tanstack/react-query@5.99.0
    - bcryptjs@3.0.3 + @paralleldrive/cuid2@3.3.0
    - react-hook-form@7.72.1 + @hookform/resolvers@5.2.2
    - @react-pdf/renderer@4.4.1 + recharts@3.8.1 + qrcode.react@4.2.0
    - next-themes@0.4.6 + sonner@2.0.7
    - shadcn@4.2.0 (+ @base-ui/react, clsx, class-variance-authority, tailwind-merge, tw-animate-css, lucide-react)
    - tsx@4.21.0 + @types/bcryptjs@3.0.0 + @types/node@25.6.0
  patterns:
    - "TypeScript strict mode obrigatório (tsconfig.json herdado do scaffold)"
    - "Alias @/* → ./src/* para todo o código"
    - "Scripts npm: dev/build/start/lint/typecheck/db:generate/db:migrate/db:studio"
    - "shadcn base = @base-ui/react (não Radix) — mudança silenciosa de default"

key-files:
  created:
    - package.json
    - bun.lock
    - tsconfig.json
    - next.config.ts
    - components.json
    - src/lib/utils.ts
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
    - src/components/ui/{alert-dialog,badge,button,card,dialog,input,label,select,separator,skeleton,sonner,table}.tsx
    - AGENTS.md
    - README.md
    - .gitignore
    - eslint.config.mjs
    - postcss.config.mjs
  modified: []

key-decisions:
  - "next-auth v4 → v5 beta (next-auth@beta) — spec requer Auth.js v5, bun resolveu v4 como latest por default"
  - "shadcn --defaults --force — flag --base-color não existe na v4.2.0; usado preset base-nova com neutral"
  - "Next 16 adotado como 'latest estável' — spec não fixou versão"

patterns-established:
  - "Sempre bun/bunx — nunca npm/npx/pnpm"
  - "Commits atômicos por task (ainda não ativados — deferido para pós-unify)"
  - "Frontmatter YAML em todo SUMMARY.md para contexto automático"

# Metrics
duration: ~15min
started: 2026-04-13T20:00:00Z
completed: 2026-04-13T20:15:00Z
---

# Phase 1 Plan 01: Bootstrap scaffold + deps + shadcn — Summary

**Projeto Next.js 16 com Bun 1.3.11, TypeScript strict, Tailwind 4, 12 componentes shadcn/ui e toda a árvore de dependências LavaFlow (Elysia, Drizzle, Auth.js v5, Zod, TanStack Query, @react-pdf/renderer, Recharts, etc.) instalada e validada via `bun run lint && typecheck && build`.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15min |
| Started | 2026-04-13T20:00:00Z |
| Completed | 2026-04-13T20:15:00Z |
| Tasks | 3/3 completed |
| Files modified | ~45 (scaffold + 12 shadcn + configs) |
| Qualify passes | 3/3 (lint, typecheck, build) |
| Drifts corrected mid-apply | 1 (next-auth v4 → v5) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Projeto Next.js funcional rodando em Bun | PASS | tsconfig strict, alias `@/*`, layout/page criados. Lint + typecheck limpos. |
| AC-2: Dependências de runtime e dev instaladas | PASS | Todas as 22 deps + 5 dev deps. bun.lock consistente. Scripts db:* adicionados. |
| AC-3: shadcn/ui inicializado com 12 componentes | PASS | `ls src/components/ui \| wc -l` = 12. `bun run build` compila em 2.4s. |

## Accomplishments

- Projeto Next 16 + React 19 + TypeScript strict scaffoldado em diretório inicialmente não-vazio (usando preservação temporária de arquivos em `/tmp/lavaflow_preserve/`).
- Toda a stack LavaFlow (22 deps de runtime + 5 de dev) instalada em 3 comandos `bun add`, com bun.lock versionado (formato texto Bun 1.3+).
- 12 componentes shadcn/ui disponíveis e testados via `bun run build`.
- Scripts npm para Drizzle (`db:generate`, `db:migrate`, `db:studio`) e TypeScript (`typecheck`) adicionados — prontos para 01-02/03 e Phase 2.
- DRIFT auto-detectado e corrigido mid-apply (next-auth v4 → v5 beta) em vez de ignorado.

## Task Commits

Commits atômicos ainda não feitos (config.md preferences `auto_commit: false`). Quando rodar `/paul:apply` para 01-02 e 01-03 estiver tudo aplicado, um único commit de Phase 1 cobrirá tudo via transition-phase.

| Task | Status | Commit |
|------|--------|--------|
| Task 1: Scaffoldar Next.js com Bun | DONE | (deferred to phase commit) |
| Task 2: Instalar dependências | DONE_WITH_CONCERNS→DONE | (deferred) |
| Task 3: Init shadcn/ui + 12 componentes | DONE | (deferred) |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `package.json` | Created + extended | Deps + scripts (dev/build/start/lint/typecheck/db:*) |
| `bun.lock` | Created | Lockfile (text format) |
| `tsconfig.json` | Created (strict: true) | TS strict, alias @/* |
| `next.config.ts` | Created (minimal) | Next config placeholder — `output: "standalone"` será adicionado em 01-03 |
| `src/app/layout.tsx` | Created | Root layout do Next |
| `src/app/page.tsx` | Created → Simplified | `<h1>LavaFlow</h1>` placeholder (removido boilerplate) |
| `src/app/globals.css` | Updated by shadcn | CSS variables para tema |
| `components.json` | Created by shadcn init | Config de componentes |
| `src/lib/utils.ts` | Created by shadcn | `cn()` helper |
| `src/components/ui/*.tsx` (12 files) | Created by shadcn add | Base UI components |
| `.gitignore` | Created by scaffold | Ignora node_modules, .next, etc. |
| `AGENTS.md`, `README.md` | Created by scaffold | Gerados pelo Next 16 template |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| next-auth@beta (v5) em vez de @latest (v4) | Spec requer Auth.js v5 | `agent-auth` (Phase 3) precisa escrever com API v5 (não v4) |
| shadcn `--defaults --force` | Flag `--base-color` não existe na v4.2.0 | Componentes gerados com Base UI (não Radix); revisitar em Wave 3 |
| Next 16 em vez de Next 15 | "latest estável" hoje é 16.2.3 | Pode haver breakings vs spec (que assume Next 15) — mitigar em 01-03 |
| Manter `bun.lock` versionado | Lockfile é fonte de verdade | `.gitignore` não pode ignorar `bun.lock` |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Drift de versão corrigido sem retrabalho |
| Scope additions | 0 | - |
| Deferred | 4 | Logged em STATE.md Deferred Issues |

**Total impact:** Baixo — correção de drift inline + 4 itens para revisitar, nenhum blocker.

### Auto-fixed Issues

**1. next-auth versão errada**
- **Found during:** Task 2 (install runtime deps)
- **Issue:** `bun add next-auth` resolveu para `4.24.13` (tag `latest`); spec pede Auth.js v5
- **Fix:** `bun add next-auth@beta` → `5.0.0-beta.30`
- **Files:** `package.json`, `bun.lock`
- **Verification:** `grep '"next-auth": "\^5' package.json` match
- **Commit:** deferred

### Deferred Items

Logged em STATE.md > Deferred Issues:

- **DI-01**: Renomear `public/backgroud.png` → `public/background.png` (typo no nome original vs spec) — pré Wave 3
- **DI-02**: `shadcn` aparece em `dependencies` (auto-adicionado pelo init) — avaliar mover para devDependencies pós 01-02/03
- **DI-03**: shadcn novo default = `@base-ui/react` (não Radix) — decidir em Wave 3 antes de `agent-layout-ux`
- **DI-04**: Next 16 vs Next 15 do spec — validar compatibilidade de `output: "standalone"` e caching defaults no 01-03

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `create-next-app` abortou por `.paul/`, `CLAUDE.md`, `planejamento-bun.md` serem conflitantes | Movidos para `/tmp/lavaflow_preserve/`, scaffoldado, restaurados. Zero perda de dados. |
| `public/` já existia com `backgroud.png` (typo) | Asset temporariamente movido para `/tmp/`, restaurado após scaffold. Mantido nome original. |
| `shadcn init` não aceita `--base-color` na v4.2.0 | Usado `--defaults --force` (preset `base-nova`, neutral). |

## Next Phase Readiness

**Ready:**
- `package.json` + `bun.lock` estáveis e tipecheck-verified.
- `tsconfig.json` com strict + alias `@/*` — base para 01-02 estender.
- `drizzle-kit` no PATH via `bunx` — 01-02 pode criar `drizzle.config.ts` e validar imediatamente.
- `src/app/` + `src/components/ui/` prontos — 01-03 só precisa criar pastas vazias com `.gitkeep`.
- shadcn/utils em `src/lib/utils.ts` — 01-03 precisa decidir política de `src/lib/utils/` (pasta) ou manter arquivo + pasta coexistindo.

**Concerns:**
- Next 16 behavior pode diferir do spec (assumiu Next 15). Caching e `output: "standalone"` ainda não validados em produção.
- next-auth v5 tem API bem diferente de v4 — `agent-auth` (Phase 3) precisa consultar docs atuais (Context7) antes de implementar.
- shadcn default mudou para Base UI — componentes gerados não são Radix. `agent-layout-ux` precisa confirmar que atende necessidades visuais.

**Blockers:** None.

---
*Phase: 01-bootstrap, Plan: 01*
*Completed: 2026-04-13*
