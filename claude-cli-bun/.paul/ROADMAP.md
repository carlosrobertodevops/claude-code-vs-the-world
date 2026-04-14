# Roadmap: LavaFlow

## Overview

Entrega em 4 waves sequenciais, cada uma com paralelismo interno via subagentes. Wave 0 faz bootstrap; Wave 1 entrega schema, domínio e infra; Wave 2 entrega os 6 módulos de produto; Wave 3 fecha UX global, seed e deploy.

## Current Milestone

**v0.1 Initial Release** (v0.1.0)
Status: In progress
Phases: 0 of 4 complete

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Waves planejadas
- Decimal phases (2.1, 2.2): Inserções urgentes (marcadas com [INSERTED])

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | Bootstrap (Wave 0) | 3 | ✅ Complete | 2026-04-13 |
| 2 | Infra & Domínio Base (Wave 1) | 3 | ✅ Complete | 2026-04-13 |
| 3 | Módulos de Produto (Wave 2) | 6 (bulk) | ✅ Complete | 2026-04-13 |
| 4 | Integração, Polish & Deploy (Wave 3) | 3 | Not started | - |

## Phase Details

### Phase 1: Bootstrap (Wave 0)

**Goal:** Fundação do projeto criada. Nenhuma outra wave começa antes desta fechar.
**Depends on:** Nothing (first phase)
**Research:** Unlikely (decisões de stack já fechadas)

**Scope:**
- `create-next-app` com TS, Tailwind, App Router, ESLint, Bun
- Dependências de runtime e dev (Elysia, Drizzle, Auth.js, shadcn, Recharts, PDF, sonner, etc.)
- shadcn/ui inicializado (componentes: button, card, input, label, select, table, dialog, alert-dialog, skeleton, sonner, badge, separator)
- `tsconfig.json` strict, alias `@/`
- `drizzle.config.ts`, `.env`/`.env.example`
- `Dockerfile` multi-stage + `docker-compose.yml` (app + postgres + minio)
- Estrutura de pastas completa

**Plans:**
- [x] 01-01: scaffold Next + Bun + deps de runtime/dev + shadcn/ui ✅
- [x] 01-02: drizzle.config + .env/.env.example + tsconfig/gitignore ✅
- [x] 01-03: Dockerfile + docker-compose dev + estrutura de pastas com .gitkeep ✅

### Phase 2: Infra & Domínio Base (Wave 1)

**Goal:** Contratos do domínio (zero Drizzle), tabelas no banco e primitivas compartilhadas (storage, auth, errors).
**Depends on:** Phase 1 (estrutura de pastas e deps instaladas)
**Research:** Unlikely

**Scope:**
- Schemas Drizzle (9 arquivos) + migration inicial
- Tipos de domínio + interfaces de repositório + stubs de use case
- Error classes, utils, `IStorageProvider` (Local + MinIO), auth helpers

**Plans:**
- [x] 02-01: agent-schema — drizzle/schema/* + migration inicial ✅
- [x] 02-02: agent-domain — types + repo interfaces + use case stubs ✅
- [x] 02-03: agent-infra — errors + utils + storage + auth helpers ✅

### Phase 3: Módulos de Produto (Wave 2)

**Goal:** 6 vertical slices entregues em paralelo (use case + Drizzle repo + Elysia route + UI). Cada agente isolado em suas pastas.
**Depends on:** Phase 2 (schema + domínio prontos)
**Research:** Unlikely (padrões já definidos em Wave 1)

**Scope:**
- Autenticação + Funcionários
- Inventário (produtos + tipos de serviço)
- Clientes + Veículos
- Ordens de Serviço + Fila (pública)
- Orçamentos + Contratos + PDFs
- Relatórios + Dashboard + Configurações

**Plans:**
- [ ] 03-01: agent-auth
- [ ] 03-02: agent-inventory
- [ ] 03-03: agent-customers
- [ ] 03-04: agent-service-orders
- [ ] 03-05: agent-quotes-contracts
- [ ] 03-06: agent-reports-dashboard

### Phase 4: Integração, Polish & Deploy (Wave 3)

**Goal:** Malha de UX fechada (sidebar, tema, background, 375px), banco populado com seed realista, stack pronta para produção.
**Depends on:** Phase 3
**Research:** Unlikely

**Scope:**
- Layout global + sidebar + header + tema + background + Inter + revisão mobile/dark
- Seed determinístico + `verify.ts` cobrindo fluxos críticos
- `Dockerfile` final + `docker-compose.prod.yml` + `.dockerignore` + `README.md`

**Plans:**
- [ ] 04-01: agent-layout-ux
- [ ] 04-02: agent-seed-e2e
- [ ] 04-03: agent-deploy

---
*Roadmap created: 2026-04-13*
*Last updated: 2026-04-13*
