---
phase: 03-product
plan: bulk
type: execute
wave: 1
depends_on: ["02-01", "02-02", "02-03"]
autonomous: true
---

# Phase 3: Product Modules — Bulk Plan

**Deviation from PLANs 03-01..03-06 individuais:** dado escopo (~60 arquivos / 6 slices), consolidado em um único plano com granularidade por slice. Cada slice ainda tem AC próprio.

## Slices

| Slice | Módulo | Entregáveis |
|-------|--------|-------------|
| 03-01 | Auth + Funcionários | UserRepository, login usecase, middleware, /login page, /funcionarios CRUD |
| 03-02 | Clientes + Veículos | CustomerRepository, VehicleRepository, CRUD routes, /clientes pages |
| 03-03 | Inventário | ProductRepository, stock movements, /inventario/{produtos,servicos} |
| 03-04 | Service Orders + Queue | ServiceOrderRepository, QueueRepository, /servicos, /fila, /fila/[slug] público |
| 03-05 | Quotes + Contracts | QuoteRepository, ContractRepository, /orcamentos, /contratos, assinatura pública |
| 03-06 | Reports + Dashboard | Endpoints reports, home KPIs, /relatorios, /configuracoes |

## Setup comum

- Elysia mounted em `src/app/api/[[...slug]]/route.ts` via handler Next.js
- Auth.js v5 em `src/app/api/auth/[...nextauth]/route.ts`
- Plugins Elysia: auth (decorate ctx.user), error-handler
- Middleware Next redireciona `/` → `/dashboard` / `/login`

## Acceptance Criteria

### AC-01 (Auth):
```gherkin
Given user com email+password em users
When POST /api/auth/login
Then retorna {success, data: {user, token}}
  And GET /api/auth/me com Authorization: Bearer retorna user
```

### AC-02 (CRUD genérico):
```gherkin
Given repo Drizzle real contra postgres
When chamadas CRUD (POST/GET/PATCH/DELETE) batem o endpoint
Then persistem em DB e retornam {success, data}
```

### AC-03 (Fila pública):
```gherkin
Given carWashConfig com slug lavaflow-centro
When GET /api/fila/publica/lavaflow-centro sem auth
Then retorna fila ordenada por position
```

### AC-04 (UI mínima funcional):
```gherkin
Given APIs funcionando
When usuário acessa /dashboard/clientes
Then vê tabela com dados reais do banco
  And consegue criar via modal/form
```

## Success Criteria

- `bun run build` passa
- `bun run typecheck` passa
- `bun run lint` sem errors
- Login end-to-end com postgres real
- Fila pública acessível sem auth

## Deferred / Stubs

- PDFs reais (@react-pdf/renderer) — componentes básicos, sem polish
- CSV export — endpoint mínimo
- Upload de fotos UI — endpoint + placeholder
- Assinatura de contrato UI — apenas endpoint público funcional
- Reports charts — 1 LineChart de receita do mês
- Página home dashboard — KPIs simples
