# LavaFlow

## What This Is

Micro-SaaS para gestão de lava-jatos. Uma plataforma completa para operações diárias: controle de estoque, orçamentos, contratos, ordens de serviço, fila pública e relatórios.

## Core Value

Tornar a gestão de lava-jatos eficiente com controle total de fluxo, do balcão à fila de atendimento, com máxima performance e DX moderna.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Autenticação com perfis de MANAGER e EMPLOYEE (NextAuth)
- [ ] Gestão de Inventário (produtos, movimentação)
- [ ] Gestão de Clientes, Veículos e Fotos de Veículos
- [ ] Criação e gerenciamento de Ordens de Serviço (com fotos e serviços executados)
- [ ] Geração de Orçamentos com exportação para PDF (@react-pdf/renderer)
- [ ] Geração e Assinatura de Contratos
- [ ] Fila Pública via QR Code com URL customizada (e exibiçao local no balcão)
- [ ] Relatórios com visualização gráfica (Recharts) e exportação para CSV
- [ ] UI corporativa com suporte a Dark Mode para turnos noturnos
- [ ] Upload de arquivos usando Local Storage no desenvolvimento e MinIO (compatível com S3) na produção

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Multi-banco de dados] — O projeto é unicamente suportado por PostgreSQL para manter a integração do Drizzle sólida.
- [npm/yarn/pnpm] — O tooling e o gerenciador de pacotes oficiais são estritamente o Bun.

## Context

- **Projeto Reestruturado**: Código fonte em inglês, UI em português brasileiro.
- **Tech Stack**: Bun, Next.js (App Router), Elysia API, Drizzle ORM, PostgreSQL, Tailwind, shadcn/ui.
- **Arquitetura de Regras de Negócio**: Entidades (regras invariantes do negócio), Casos de Uso (orquestração de fluxos), Repositórios (contratos de persistência), Infraestrutura (Drizzle, Storage) e API (Elysia como fronteira HTTP).
- **Sem npm**: Comandos de setup, build, migrate e seed executados todos via Bun.
- **Deploy**: Docker + Docker Compose, proxy reverso via Nginx/Caddy.

## Constraints

- **Tech Stack**: Bun + Next.js + Elysia + Drizzle + PostgreSQL — Performance, type-safety e um ecossistema nativo moderno. Tudo usando versões mais recentes (latest).
- **Integração Backend/Frontend**: Front-end com Next.js servirá como UI app shell, enquanto o backend consumirá arquivos HTTP com Elysia API. Drizzle ORM tratará a persistência.
- **Estruturação Funcional**: Entidades devem ser agnósticas de framework; Regras orquestradas via "Casos de Uso"; Repositórios devem desacoplar banco do domínio.
- **Responsividade e Usabilidade**: Foco forte em acessibilidade com shadcn/ui, validação com Zod e estado assíncrono com React Query.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monolith com divisões limpas | Facilita a compilação full-stack com Bun, mantendo desacoplamento do domínio, API e App Router | — Pending |
| Uso Exclusivo Bun | Uma única toolchain para packager manager, testes e runtime | — Pending |
| Dark Mode p/ Sistema | Previne fadiga visual em turnos noturnos da operação de Lava Jato | — Pending |

---
*Last updated: 2026-04-13 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
