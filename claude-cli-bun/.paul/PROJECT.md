# LavaFlow

## What This Is

Micro-SaaS para lava-jatos que centraliza operações diárias: estoque, orçamentos, contratos, ordens de serviço, fila pública acompanhável por QR Code e relatórios. Web responsivo, com fila pública sem auth para o cliente final ver o status do próprio veículo.

## Core Value

Transformar o balcão de um lava-jato numa operação rastreável onde o cliente acompanha seu veículo sozinho — sem ligar para o estabelecimento.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 0.1.0-alpha |
| Status | Prototype (Phase 1 complete) |
| Last Updated | 2026-04-13 |

## Requirements

### Core Features

- Autenticação (Auth.js v5 + JWT stateless) com roles MANAGER/EMPLOYEE
- Gestão de clientes e veículos com upload de fotos
- Inventário (produtos, movimentação de estoque, tipos de serviço)
- Ordens de serviço com status rastreável + fila pública via slug + QR Code (polling 15s)
- Orçamentos e contratos com PDF (@react-pdf/renderer) e assinatura pública via token
- Relatórios de receita/serviços/estoque com exportação CSV
- Dashboard com KPIs + gráficos (Recharts)

### Validated (Shipped)

- [x] **Phase 1 — Bootstrap** (2026-04-13): Next.js 16 + Bun 1.3.11 + TypeScript strict + Tailwind 4 + shadcn/ui (12 components) + toda a stack LavaFlow instalada (Elysia, Drizzle 0.45, Auth.js v5 beta, Zod 4, TanStack Query, @react-pdf/renderer, Recharts) + Dockerfile multi-stage + docker-compose dev com postgres:16 + minio + estrutura de pastas completa + drizzle.config + .env/.env.example. Lint + typecheck + build limpos.
- [x] **Phase 2 — Infra & Domínio Base** (2026-04-13): 9 schemas Drizzle + migration inicial (16 tabelas no postgres:16), 11 tipos de domínio + 9 interfaces de repositório + 38 stubs de use case (zero imports de drizzle-orm em domain), AppError + 5 subclasses, utils (response/pagination/cuid/date), IStorageProvider + Local/MinIO + factory, auth helpers (bcrypt 12 rounds + jose HS256).
- [x] **Phase 3 — Módulos de Produto** (2026-04-13): Elysia app mounted em `/api/[[...slug]]` com 10 route groups (auth, employees, customers, inventory, services, queue, quotes, contracts, reports, upload), 9 Drizzle repos implementados, middleware Next protegendo /dashboard, 11 páginas (login + 9 dashboard + fila pública com QR + polling 15s), api-client com JWT em cookie. Build + lint + typecheck limpos.

### Active (In Progress)

None — Phase 4 ready to start.

### Planned (Next)

- Phase 4 — Wave 3: Layout/UX polish, Seed + verify, Deploy (compose prod + README)

### Out of Scope

- Multi-tenant — v1 single-tenant por instância
- Chat em tempo real com cliente — fila pública resolve
- Gateway de pagamento online — cobrança continua offline
- App nativo iOS/Android — web responsivo é suficiente
- Múltiplos SGBDs — só PostgreSQL
- OAuth social — email+senha suficiente
- Notificações push/email — deferido para v2
- i18n — pt-BR apenas

## Target Users

**Primary:** Gerente/proprietário de lava-jato
- Precisa de controle operacional e relatórios financeiros
- Usa desktop no balcão
- Toma decisões de estoque e contratação

**Secondary:** Funcionário de pista
- Atende cliente, registra OS, move veículo entre status
- Usa mobile/tablet na operação

**Tertiary:** Cliente final
- Só acessa `/fila/[slug]` para acompanhar seu veículo
- Sem login

## Context

**Business Context:**
Substituir planilhas/cadernos manuais em lava-jatos independentes. Mercado de SMB com baixa maturidade digital — UX simples e confiabilidade importam mais que features avançadas.

**Technical Context:**
Execução multi-agente em 4 waves paralelas (13 subagentes no total, pastas exclusivas). Arquitetura em camadas: Elysia Route → Use Case → Repository Interface → Drizzle Impl. Domínio puro sem imports de Drizzle.

## Constraints

### Technical Constraints

- Stack fechada: Bun + Next.js (App Router) + Elysia + Drizzle + PostgreSQL + Docker
- Runtime `bun` apenas — `npm`/`npx`/`pnpm` proibidos
- Zero imports de `drizzle-orm` em `src/lib/types/` e `src/server/domain/`
- PKs CUID (`@paralleldrive/cuid2`), timestamps obrigatórios, soft-delete onde aplicável
- Upload: JPEG/PNG/WebP/PDF, máx 10MB, nome gerado via CUID
- TypeScript estrito; sem `any` implícito; sem `console.log` em prod
- Cada agente edita apenas suas pastas exclusivas — zero colisão

### Business Constraints

- v1 deploy em Docker Compose (single-host) — sem K8s
- Sem orçamento para serviços SaaS pagos — MinIO local substitui S3
- Pt-BR único idioma em v1

### Compliance Constraints

- Dados pessoais de cliente (nome, CPF, placa) exigem tratamento LGPD-friendly
- `.env` e segredos nunca commitados
- bcryptjs 12 rounds para senhas

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Elysia atrás de Next (App Router) | Separa API stateless de SSR/UI sem sacrificar deploy único | 2026-04-13 | Active |
| Auth.js v5 + JWT stateless | Sem sessão em banco; suficiente para single-tenant | 2026-04-13 | Active |
| Drizzle ORM + migrations | Tipos fortes, SQL-first, baixa magia | 2026-04-13 | Active |
| `IStorageProvider` (local/MinIO) | Paridade dev/prod sem depender de S3 externo | 2026-04-13 | Active |
| CUID em vez de UUID/integer | Ordenação estável, URLs curtas | 2026-04-13 | Active |
| 4 waves multi-agente | Paraleliza execução com isolamento por pastas | 2026-04-13 | Active |
| Polling 15s na fila pública (não WebSocket) | Custo/complexidade vs valor real | 2026-04-13 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| `bun run verify` passa sem exceções | 100% | - | Not started |
| Dark mode + responsividade 375px verificados | Todas as páginas | - | Not started |
| Fila pública carrega em < 1s | p95 | - | Not started |
| Geração de PDF de orçamento sem erro | 100% | - | Not started |
| Build Docker multi-stage produz imagem < 300MB | <300MB | - | Not started |

## Tech Stack / Tools

| Layer | Technology | Notes |
|-------|------------|-------|
| Runtime | Bun (latest) | Único runtime permitido |
| Framework | Next.js (latest estável) | App Router |
| API | Elysia (latest) | Montado dentro do Next |
| Language | TypeScript strict | Sem `any` implícito |
| DB | PostgreSQL | Único SGBD suportado |
| ORM | Drizzle ORM + Drizzle Kit | SQL-first |
| Auth | Auth.js / NextAuth v5 | CredentialsProvider + JWT |
| Validation | Zod | Em todas as rotas |
| UI | Tailwind + shadcn/ui | + next-themes para dark mode |
| Font | Inter | Google Fonts |
| Data Fetching | TanStack React Query | Polling na fila pública |
| Forms | React Hook Form + Zod | Resolvers |
| Upload | Local (dev) / MinIO (prod) | Via `IStorageProvider` |
| PDF | @react-pdf/renderer | Orçamentos e contratos |
| Charts | Recharts | Dashboard e relatórios |
| Infra | Docker + Docker Compose | dev + prod compose |

## Links

| Resource | URL |
|----------|-----|
| Repository | (local) |
| Production | - |
| Documentation | `./README.md` (criado em Phase 4) |
| GSD Planning | `./.planning/` |
| Original Spec | `./planejamento-bun.md` |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-04-13*
