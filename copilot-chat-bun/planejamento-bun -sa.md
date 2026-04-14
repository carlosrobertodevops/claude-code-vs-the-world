# Micro-SaaS para Lava-Jatos — Plano Multi-Agente
## Bun + Next.js + Elysia + Drizzle ORM + PostgreSQL + Docker

> **Modo de execução:** `context-mode` ativado.
> Leia o `CLAUDE.md` antes de qualquer ação.
> Este documento substitui o plano de implementação linear por um plano
> de execução paralela com subagentes. Mínimo de 3 subagentes por camada.

---

## Nome do Projeto

**LavaFlow** — plataforma completa para operações diárias de lava-jatos:
controle de estoque, orçamentos, contratos, ordens de serviço, fila pública e relatórios.

| Uso do nome       | Valor                          |
|-------------------|-------------------------------|
| `package.json`    | `lavaflow`                    |
| Título da app     | LavaFlow                      |
| Admin seed        | `admin@lavaflow.com`          |
| Slug fila pública | `lavaflow-centro`             |

---

## Features Extras

| # | Feature | Justificativa |
|---|---------|---------------|
| 1 | **Dark mode** (`next-themes` + shadcn/ui) | Usabilidade em turnos noturnos |
| 2 | **Exportação CSV** nos relatórios | Repasse direto para contabilidade/operação |
| 3 | **QR Code da fila pública** | Reduz atrito para clientes acompanharem status |

---

## Tech Stack (sempre latest estável)

| Camada        | Tecnologia                               |
|---------------|------------------------------------------|
| Runtime       | Bun (latest)                             |
| Framework     | Next.js — latest estável, App Router     |
| API           | Elysia (latest)                          |
| Linguagem     | TypeScript (latest estável)              |
| Banco         | PostgreSQL (latest estável suportado)    |
| ORM           | Drizzle ORM + Drizzle Kit (latest)       |
| Auth          | Auth.js / NextAuth v5 (latest estável)   |
| Validação     | Zod (latest)                             |
| UI            | Tailwind CSS + shadcn/ui (latest)        |
| Tipografia    | Inter (Google Fonts)                     |
| Data Fetching | TanStack React Query (latest)            |
| Forms         | React Hook Form + Zod (latest)           |
| Upload        | Local (dev) / MinIO S3-compatible (prod) |
| PDF           | @react-pdf/renderer (latest)             |
| Gráficos      | Recharts (latest)                        |
| Infra         | Docker + Docker Compose                  |

**Regra de versão:** sempre latest estável. Sem fixar versões antigas sem necessidade documentada.

---

## Arquitetura de Camadas

```
Elysia Route  →  Use Case  →  Repository Interface  →  Drizzle Implementation
     ↑               ↑                ↑                          ↑
  valida Zod    regra negócio    contrato puro            acessa PostgreSQL
```

- **Routes:** validam input e delegam. Zero lógica de negócio.
- **Use Cases:** única fonte de verdade para regras de negócio.
- **Repositories (interfaces):** contratos sem dependência de ORM.
- **Infrastructure:** implementações Drizzle, storage, auth helpers.

### Padrão de resposta da API

```ts
// Sucesso
{ success: true, data: T, meta?: { page, limit, total, totalPages } }

// Erro
{ success: false, error: { code: string, message: string, details?: unknown } }
```

---

## Estrutura de Pastas

```
projeto/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   └── fila/[slug]/              # Fila pública (sem auth)
│   ├── server/
│   │   ├── api/
│   │   │   ├── index.ts              # Entry-point Elysia
│   │   │   ├── plugins/
│   │   │   │   ├── auth.ts
│   │   │   │   └── error-handler.ts
│   │   │   └── routes/
│   │   │       ├── inventory.routes.ts
│   │   │       ├── quotes.routes.ts
│   │   │       ├── contracts.routes.ts
│   │   │       ├── services.routes.ts
│   │   │       ├── queue.routes.ts
│   │   │       ├── customers.routes.ts
│   │   │       ├── employees.routes.ts
│   │   │       └── reports.routes.ts
│   │   ├── domain/
│   │   │   ├── repositories/         # Contratos (interfaces)
│   │   │   └── use-cases/            # Regras de negócio
│   │   └── infrastructure/
│   │       ├── drizzle/
│   │       ├── repositories/         # Implementações Drizzle
│   │       └── storage/
│   ├── lib/
│   └── middleware.ts
├── drizzle/
│   ├── schema/
│   └── migrations/
└── scripts/
```

---

## Plano Multi-Agente

O projeto é dividido em **4 waves sequenciais**.
Dentro de cada wave, os subagentes rodam **em paralelo**.
O orquestrador só avança quando todos os agentes da wave reportam `DONE`.

```
Wave 0          Wave 1                    Wave 2                         Wave 3
(1 agente)      (3 agentes)               (6 agentes)                    (3 agentes)
────────────    ──────────────────────    ──────────────────────────     ──────────────────
bootstrap  ──►  agent-schema         ►   agent-auth               ►     agent-layout-ux
                agent-domain         ►   agent-inventory           ►     agent-seed-e2e
                agent-infra          ►   agent-customers           ►     agent-deploy
                                         agent-service-orders
                                         agent-quotes-contracts
                                         agent-reports-dashboard
```

---

## Wave 0 — Bootstrap (sequencial, 1 agente)

> Pré-requisito absoluto. Nenhuma outra wave começa antes desta terminar.

### `agent-bootstrap`

**Responsabilidade:** criar a fundação do projeto do zero.

**Execução (em ordem):**

```bash
# 1. Criar app
bunx create-next-app@latest . --ts --tailwind --app --eslint --use-bun

# 2. Dependências de produção
bun add elysia @elysiajs/jwt @elysiajs/cors zod \
  @tanstack/react-query next-auth drizzle-orm postgres \
  bcryptjs @paralleldrive/cuid2 next-themes sonner \
  react-hook-form @hookform/resolvers \
  @react-pdf/renderer recharts qrcode.react

# 3. Dependências de desenvolvimento
bun add -d drizzle-kit tsx @types/bcryptjs @types/node

# 4. Inicializar shadcn/ui
bunx shadcn@latest init
# Instalar: button card input label select table dialog
#           alert-dialog skeleton sonner badge separator

# 5. Subir infra
docker compose up -d postgres minio
```

**Arquivos criados:**
- `package.json`
- `tsconfig.json` — `strict: true`, alias `@/` → `src/`
- `drizzle.config.ts`
- `.env` + `.env.example`
- `docker-compose.yml` — serviços: `app`, `postgres`, `minio`
- `Dockerfile` — multi-stage com Bun
- Estrutura de pastas completa (com `.gitkeep`)

**Critério de conclusão:** `bun run typecheck && bun run lint` sem erros.

---

## Wave 1 — Infra & Domínio Base (3 agentes em paralelo)

> Roda após Wave 0. Nenhum agente toca em `src/app/` nesta wave.

---

### `agent-schema`

**Responsabilidade:** schema Drizzle completo + migration inicial.

**Pastas exclusivas:**
```
drizzle/schema/
src/server/infrastructure/drizzle/
```

**Schemas a criar** (um arquivo por grupo):

| Arquivo | Tabelas |
|---------|---------|
| `users.schema.ts` | `users` — id CUID, name, email, password_hash, role enum |
| `customers.schema.ts` | `customers`, `vehicles`, `vehicle_photos` |
| `inventory.schema.ts` | `products`, `stock_movements`, `service_types` |
| `quotes.schema.ts` | `quotes`, `quote_items` |
| `contracts.schema.ts` | `contracts` |
| `service-orders.schema.ts` | `service_orders`, `service_order_items`, `service_photos` |
| `queue.schema.ts` | `queue_entries` |
| `config.schema.ts` | `car_wash_config` |
| `uploads.schema.ts` | `file_uploads` |
| `index.ts` | re-exporta tudo |

**Regras:**
- PKs: CUID (`@paralleldrive/cuid2`)
- `created_at` + `updated_at` em todas as tabelas
- `deleted_at` (nullable) em: `users`, `customers`, `vehicles`, `products`, `service_orders`, `contracts`
- Enums PostgreSQL: `role`, `order_status`, `queue_status`, `contract_status`

```bash
bun run db:generate
bun run db:migrate
```

**Critério:** tabelas visíveis no Drizzle Studio sem erros.

---

### `agent-domain`

**Responsabilidade:** tipos de domínio e contratos de repositório. Zero Drizzle.

**Pastas exclusivas:**
```
src/lib/types/
src/server/domain/repositories/
src/server/domain/use-cases/     ← apenas stubs
```

**Tipos de domínio** (`src/lib/types/`):
```
user.types.ts · customer.types.ts · vehicle.types.ts
product.types.ts · stock.types.ts · service-type.types.ts
quote.types.ts · contract.types.ts
service-order.types.ts · queue.types.ts
common.types.ts   ← PaginatedResult<T>, ApiResponse<T>, Role, OrderStatus…
```

**Contratos de repositório** (`src/server/domain/repositories/`):
```
IUserRepository.ts · ICustomerRepository.ts · IVehicleRepository.ts
IProductRepository.ts · IServiceOrderRepository.ts · IQueueRepository.ts
IQuoteRepository.ts · IContractRepository.ts · IUploadRepository.ts
```

**Stubs de use cases** — arquivo com assinatura + `throw new Error('not implemented')`:
```
login · get-current-user · create-employee · list-employees
create-product · update-stock · list-products
create-customer · list-customers
create-service-order · update-service-order-status · list-service-orders
add-to-queue · move-queue · get-public-queue
create-quote · generate-quote-pdf
create-contract · sign-contract
get-revenue-report · export-report-csv
```

**Regra crítica:** zero imports de `drizzle-orm` em qualquer arquivo desta pasta.

**Critério:** `bun run typecheck` sem erros; grep por `drizzle-orm` retorna vazio nestes arquivos.

---

### `agent-infra`

**Responsabilidade:** storage, auth helpers, error classes, utilitários.

**Pastas exclusivas:**
```
src/lib/errors/
src/lib/utils/
src/server/infrastructure/storage/
src/server/infrastructure/auth/
```

**Error classes** (`src/lib/errors/`):
```
AppError.ts          ← base: code, message, statusCode
NotFoundError.ts
UnauthorizedError.ts
ForbiddenError.ts
ValidationError.ts
ConflictError.ts
```

**Utils** (`src/lib/utils/`):
```
response.ts    ← helpers success(data, meta?) e error(code, message, details?)
pagination.ts  ← paginate(page, limit)
cuid.ts        ← wrapper @paralleldrive/cuid2
date.ts        ← formatadores pt-BR
```

**StorageProvider** (`src/server/infrastructure/storage/`):
```
IStorageProvider.ts        ← interface: upload(file, path), delete(path)
LocalStorageProvider.ts    ← salva em public/uploads/ (dev)
MinIOStorageProvider.ts    ← integração MinIO (prod)
storage.factory.ts         ← retorna provider conforme STORAGE_PROVIDER env
```

**Auth helpers** (`src/server/infrastructure/auth/`):
```
password.ts    ← hash(plain) e verify(plain, hash) — bcryptjs 12 rounds
jwt.ts         ← sign/verify alinhados com Auth.js v5
```

**Critério:** factory de storage retorna provider correto conforme env; `bun run typecheck` limpo.

---

## Wave 2 — Módulos de Produto (6 agentes em paralelo)

> Roda após Wave 1. Cada agente entrega: use case + repositório Drizzle + rota Elysia + UI.
> Agentes não editam arquivos de outros agentes.
> Cada agente adiciona apenas seu bloco em `src/server/api/index.ts`.

---

### `agent-auth`

**Módulo:** Autenticação + Gestão de Funcionários

**Pastas exclusivas:**
```
src/server/infrastructure/repositories/user.repository.ts
src/server/domain/use-cases/  ← auth e employees
src/server/api/routes/auth.routes.ts
src/server/api/routes/employees.routes.ts
src/server/api/plugins/auth.ts
src/server/api/plugins/error-handler.ts
src/app/(auth)/login/
src/app/(dashboard)/funcionarios/
src/middleware.ts
src/app/api/auth/[...nextauth]/route.ts
```

**Implementações:**
- `UserRepository` (Drizzle)
- Use cases: `login`, `get-current-user`, `create-employee`, `update-employee`, `deactivate-employee`, `list-employees`
- Auth.js v5 com `CredentialsProvider` + JWT stateless
- Plugin Elysia de auth: extrai `Authorization: Bearer`, valida, injeta `ctx.user`
- Plugin Elysia de error-handler: captura `AppError` → `{ success: false, error }`
- Rotas: `POST /api/auth/login`, CRUD `/api/funcionarios` (MANAGER only)
- Página `/login`: form com email/senha — React Hook Form + Zod
- Página `/dashboard/funcionarios`: tabela com CRUD (MANAGER only)
- `middleware.ts`: redireciona `/` → `/dashboard` se autenticado, `/login` se não

---

### `agent-inventory`

**Módulo:** Inventário — Produtos e Tipos de Serviço

**Pastas exclusivas:**
```
src/server/infrastructure/repositories/product.repository.ts
src/server/domain/use-cases/  ← inventory
src/server/api/routes/inventory.routes.ts
src/app/(dashboard)/inventario/
```

**Implementações:**
- `ProductRepository` (Drizzle) com soft delete
- Use cases: `create-product`, `update-product`, `delete-product`, `list-products`, `update-stock`, `list-service-types`, `create-service-type`
- Rotas CRUD em `/api/inventario` + movimentações de estoque + tipos de serviço
- `/dashboard/inventario/produtos`: tabela + modal criação/edição, badge estoque baixo (< 5)
- `/dashboard/inventario/servicos`: CRUD de tipos de serviço com preço base
- Botão de exportação CSV na listagem

---

### `agent-customers`

**Módulo:** Clientes e Veículos

**Pastas exclusivas:**
```
src/server/infrastructure/repositories/customer.repository.ts
src/server/infrastructure/repositories/vehicle.repository.ts
src/server/domain/use-cases/  ← customers e vehicles
src/server/api/routes/customers.routes.ts
src/app/(dashboard)/clientes/
```

**Implementações:**
- `CustomerRepository` + `VehicleRepository` (Drizzle)
- Use cases: `create-customer`, `update-customer`, `list-customers`, `get-customer`, `add-vehicle`, `list-vehicles-by-customer`, `upload-vehicle-photo`
- Rotas CRUD em `/api/clientes` + veículos aninhados
- `/dashboard/clientes`: tabela com busca por nome/CPF/placa
- `/dashboard/clientes/[id]`: perfil com veículos e histórico de OS
- Modal de criação/edição de veículo com upload de foto

---

### `agent-service-orders`

**Módulo:** Ordens de Serviço + Fila Pública

**Pastas exclusivas:**
```
src/server/infrastructure/repositories/service-order.repository.ts
src/server/infrastructure/repositories/queue.repository.ts
src/server/domain/use-cases/  ← service orders e queue
src/server/api/routes/services.routes.ts
src/server/api/routes/queue.routes.ts
src/app/(dashboard)/servicos/
src/app/(dashboard)/fila/
src/app/fila/[slug]/
```

**Implementações:**
- `ServiceOrderRepository` + `QueueRepository` (Drizzle)
- Use cases: `create-service-order`, `update-service-order-status`, `list-service-orders`, `add-to-queue`, `move-queue`, `remove-from-queue`, `get-public-queue`
- `GET /api/fila/publica/:slug` — rota pública, sem auth
- `/dashboard/servicos`: tabela/kanban de OS por status
- `/dashboard/servicos/nova`: formulário de criação
- `/dashboard/fila`: painel de gestão com botões de mover
- `/fila/[slug]`: **página pública** sem layout de dashboard — polling TanStack Query (15s) + QR Code da URL

---

### `agent-quotes-contracts`

**Módulo:** Orçamentos, Contratos e PDFs

**Pastas exclusivas:**
```
src/server/infrastructure/repositories/quote.repository.ts
src/server/infrastructure/repositories/contract.repository.ts
src/server/domain/use-cases/  ← quotes e contracts
src/server/api/routes/quotes.routes.ts
src/server/api/routes/contracts.routes.ts
src/app/(dashboard)/orcamentos/
src/app/(dashboard)/contratos/
src/lib/pdf/
```

**Implementações:**
- `QuoteRepository` + `ContractRepository` (Drizzle)
- Use cases: `create-quote`, `update-quote`, `list-quotes`, `generate-quote-pdf`, `create-contract`, `list-contracts`, `sign-contract`
- `POST /api/contratos/:id/assinar` — rota pública, valida token de assinatura
- Templates PDF: `QuotePDF.tsx` + `ContractPDF.tsx` com `@react-pdf/renderer`
- `/dashboard/orcamentos`: lista + botão gerar/baixar PDF
- `/dashboard/contratos`: lista com status de assinatura + link para envio ao cliente

---

### `agent-reports-dashboard`

**Módulo:** Relatórios, Dashboard Home e Configurações

**Pastas exclusivas:**
```
src/server/domain/use-cases/  ← reports
src/server/api/routes/reports.routes.ts
src/app/(dashboard)/page.tsx
src/app/(dashboard)/relatorios/
src/app/(dashboard)/configuracoes/
src/components/charts/
```

**Implementações:**
- Use cases: `get-revenue-report`, `get-services-summary`, `get-stock-report`, `export-report-csv`
- Rotas `/api/relatorios/*` — MANAGER only
- `/dashboard` (home): cards de KPIs + Recharts LineChart de receita do mês
- `/dashboard/relatorios`: filtros de data, gráficos por tipo de serviço, export CSV
- `/dashboard/configuracoes`: form `CarWashConfig` (nome, slug, horários)

---

## Wave 3 — Integração, Polish e Deploy (3 agentes em paralelo)

> Roda após Wave 2. Foco em UX global, seed e preparação para produção.

---

### `agent-layout-ux`

**Responsabilidade:** layout global, navegação, consistência visual, responsividade.

**Pastas exclusivas:**
```
src/app/(dashboard)/layout.tsx
src/app/(auth)/layout.tsx
src/app/layout.tsx
src/components/layout/
src/components/ui/  ← apenas componentes genéricos ausentes
```

**Tarefas:**
- Sidebar com navegação completa, header com user menu e seletor dark/light
- Sidebar responsiva (drawer mobile, fixa desktop)
- Componente `EmptyState` genérico
- Componente `PageHeader` (título + breadcrumb + ação primária)
- `Toaster` do Sonner no root layout
- `ThemeProvider` do `next-themes` no root layout
- Revisão de breakpoints mobile (375px) em todas as páginas da Wave 2
- Verificar dark mode em todas as páginas

---

### `agent-seed-e2e`

**Responsabilidade:** seed completo e scripts de verificação.

**Pastas exclusivas:**
```
scripts/seed.ts
scripts/verify.ts
```

**Seed (`scripts/seed.ts`):**
- 3 usuários: `admin@lavaflow.com` (MANAGER), `joao@lavaflow.com`, `maria@lavaflow.com` (EMPLOYEE) — senhas com bcryptjs 12 rounds
- 10 clientes com 1–3 veículos cada
- 20 produtos com variação de estoque
- 5 tipos de serviço
- 5 orçamentos (mix de status)
- 3 contratos (1 assinado, 2 pendentes)
- 8 ordens de serviço em status variados
- 3 entradas na fila pública (`lavaflow-centro`)
- `CarWashConfig` para o slug padrão

**Verify (`scripts/verify.ts`):**
- Login retorna JWT válido
- CRUD de produto sem erro
- Criação de OS vincula cliente e veículo
- Fila pública retorna dados sem auth
- Geração de PDF de orçamento não lança exceção

```json
"db:seed": "bun run scripts/seed.ts",
"verify":  "bun run scripts/verify.ts"
```

---

### `agent-deploy`

**Responsabilidade:** Dockerfile, docker-compose de produção, README.

**Pastas exclusivas:**
```
Dockerfile
docker-compose.yml
docker-compose.prod.yml
.dockerignore
README.md
```

**Dockerfile** (multi-stage):
```
stage deps     → bun install --frozen-lockfile
stage builder  → bun run build
stage runner   → imagem mínima, .next/standalone, porta 3000
```

**`docker-compose.yml`** (dev): `app` + `postgres` + `minio` com volumes e healthchecks.

**`docker-compose.prod.yml`** (prod): sem MinIO local, `restart: unless-stopped`, sem bind mounts.

**README.md:** visão geral, pré-requisitos, setup dev/prod, tabela de envs, credenciais seed, justificativa das 3 features extras, estrutura do projeto.

---

## Protocolo de Comunicação entre Agentes

Cada subagente reporta ao orquestrador:

| Status | Formato |
|--------|---------|
| Iniciando | `[AGENT: nome] STARTED — arquivos que vai criar/editar` |
| Concluído | `[AGENT: nome] DONE — arquivos criados/editados` |
| Bloqueado | `[AGENT: nome] BLOCKED — motivo — aguardando: agente` |
| Erro | `[AGENT: nome] ERROR — descrição` |

O orquestrador **não avança** para a próxima wave com qualquer agente em status diferente de `DONE`.

---

## Health Checks por Wave

```bash
# Após Wave 0
bun run typecheck && bun run lint

# Após Wave 1
bun run typecheck && bun run db:migrate

# Após Wave 2
bun run typecheck && bun run lint && bun run build

# Após Wave 3
bun run verify && docker compose -f docker-compose.prod.yml config
```

---

## Rotas da API — Mapa Completo

### Públicas (sem auth)
```
POST  /api/auth/login
GET   /api/fila/publica/:slug
POST  /api/contratos/:id/assinar
GET   /fila/[slug]              ← página Next.js
```

### Autenticadas — EMPLOYEE + MANAGER
```
/api/inventario
/api/orcamentos
/api/servicos
/api/fila
/api/clientes
/api/upload
```

### Autenticadas — MANAGER only
```
/api/funcionarios
/api/contratos
/api/relatorios/*
/api/configuracoes
```

---

## Domínio e Modelagem

Tabelas principais (definidas em `drizzle/schema/`):

```
User · Customer · Vehicle · VehiclePhoto
Product · StockMovement · ServiceType
Quote · QuoteItem
Contract
ServiceOrder · ServiceOrderItem · ServicePhoto
QueueEntry
CarWashConfig
FileUpload
```

- PKs: **CUID** (`@paralleldrive/cuid2`)
- Timestamps: `created_at`, `updated_at` em todas
- Soft delete: `deleted_at` onde aplicável
- Enums PostgreSQL: `role`, `order_status`, `queue_status`, `contract_status`
- Banco único: **PostgreSQL** — sem suporte multi-banco

---

## Auth e Autorização

- Auth.js v5 com `CredentialsProvider`
- JWT stateless — sem sessão em banco
- `bcryptjs` com **12 rounds**
- Roles: `MANAGER` | `EMPLOYEE`
- Middleware Next.js (`src/middleware.ts`) — protege páginas do dashboard
- Plugin Elysia (`plugins/auth.ts`) — valida JWT e role nas rotas da API

---

## Upload de Arquivos

- Interface `IStorageProvider` com implementações `LocalStorageProvider` e `MinIOStorageProvider`
- MIME aceitos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Tamanho máximo: **10 MB**
- Nome gerado com CUID — nunca usar nome original do cliente
- `STORAGE_PROVIDER=local|minio` controla qual implementação é injetada

---

## Restrições Globais (todos os agentes)

- ❌ `npm`, `npx`, `pnpm` — **sempre Bun**
- ❌ Lógica de negócio fora de use cases
- ❌ Tipos Drizzle na camada de domínio
- ❌ `.env` ou segredos commitados
- ❌ Versões antigas sem justificativa documentada
- ❌ Importações circulares entre camadas
- ❌ Múltiplos bancos — PostgreSQL é o único suportado
- ❌ `console.log` em código de produção
- ❌ `any` implícito — TypeScript estrito em tudo
- ❌ PKs integer — sempre CUID
- ❌ Agente editando arquivos de outro agente

---

## Verificação Final (pós Wave 3)

```
1. docker compose up -d
2. bun run db:seed
3. Login em http://localhost:3000/login
4. CRUD básico: inventário, clientes, serviços
5. Gerar PDF de orçamento
6. Mover OS na fila e validar página pública
7. Testar upload de foto de veículo
8. Testar assinatura de contrato via link público
9. Validar dark mode em todas as páginas
10. Validar responsividade mobile (375px)
```
