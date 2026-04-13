# CLAUDE.md — LavaFlow

> Guia de contexto e convenções para Claude Code.
> Leia este arquivo inteiro antes de qualquer ação no projeto.

---

## Visão Geral

**LavaFlow** é um micro-SaaS para gestão de lava-jatos.
Stack: Bun · Next.js (App Router) · Elysia API · Drizzle ORM · PostgreSQL · Docker.

Monolito com fronteiras claras entre UI, API e domínio.
Código-fonte em **inglês**. Interface do usuário em **português brasileiro**.

---

## Comandos Essenciais

```bash
# Instalar dependências
bun install

# Desenvolvimento
bun run dev

# Build de produção
bun run build

# Banco de dados
bun run db:generate      # gera migration com drizzle-kit
bun run db:migrate       # aplica migrations
bun run db:seed          # popula base com dados de demo
bun run db:studio        # abre Drizzle Studio

# Lint / Type-check
bun run lint
bun run typecheck

# Docker (dev completo)
docker compose up -d --build
docker compose exec app bun run db:migrate
docker compose exec app bun run db:seed   # opcional
```

> **Nunca use `npm`, `npx` ou `pnpm`.**
> O gerenciador de pacotes oficial do projeto é **Bun**.
> Para executar binários: `bunx <pacote>`.

---

## Estrutura do Projeto

```
projeto/
├── src/
│   ├── app/                          # Next.js App Router — páginas e layouts
│   │   ├── (auth)/                   # Grupo de rotas não autenticadas
│   │   ├── (dashboard)/              # Grupo de rotas autenticadas
│   │   └── fila/[slug]/              # Fila pública (sem autenticação)
│   ├── server/
│   │   ├── api/
│   │   │   ├── index.ts              # Entry-point do Elysia
│   │   │   ├── plugins/
│   │   │   │   ├── auth.ts           # Plugin de autenticação/guard de role
│   │   │   │   └── error-handler.ts  # Tratamento centralizado de erros
│   │   │   └── routes/               # Handlers Elysia por módulo
│   │   ├── domain/
│   │   │   ├── repositories/         # Contratos (interfaces) de persistência
│   │   │   └── use-cases/            # Regras de negócio — ÚNICA fonte de verdade
│   │   └── infrastructure/
│   │       ├── drizzle/              # Schema, migrations, cliente pg
│   │       ├── repositories/         # Implementações Drizzle dos contratos
│   │       └── storage/              # Local (dev) / MinIO (prod)
│   ├── lib/                          # Utilitários compartilhados (cn, formatters…)
│   └── middleware.ts                 # Proteção de rotas Next.js
├── drizzle/
│   ├── schema/                       # Definições de tabelas e relações
│   └── migrations/                   # Arquivos gerados pelo drizzle-kit
└── scripts/                          # seed.ts e outros scripts avulsos
```

---

## Arquitetura e Regras Críticas

### 1. Regras de negócio APENAS em Use Cases

```
Elysia Route → Use Case → Repository Interface → Drizzle Implementation
```

- Handlers do Elysia **validam input** (Zod) e **chamam use cases** — nada além.
- Use cases **orquestram fluxos** e dependem de interfaces de repositório.
- Repositórios Drizzle **implementam** essas interfaces.
- **Nunca coloque lógica de negócio em routes ou em repositórios.**

### 2. Padrão de resposta da API

```ts
// Sucesso
{ success: true, data: T, meta?: { page, limit, total, totalPages } }

// Erro
{ success: false, error: { code: string, message: string, details?: unknown } }
```

Toda rota Elysia deve retornar **exatamente** um destes formatos.

### 3. Versões: sempre latest estável

Não fixe versões antigas sem necessidade documentada.
Antes de atualizar em produção, revisar changelog de breaking changes.

### 4. TypeScript estrito

- `strict: true` no `tsconfig.json`.
- Sem `any` implícito — se necessário, explicitar e comentar o motivo.
- Tipos de domínio definidos em `domain/` — **não reutilizar tipos do Drizzle** diretamente na camada de domínio.

---

## Tecnologias e Versões (latest estável)

| Camada        | Tecnologia                               |
| ------------- | ---------------------------------------- |
| Runtime       | Bun (latest)                             |
| Framework     | Next.js (latest, App Router)             |
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

---

## Convenções de Código

### Nomenclatura

| Artefato         | Convenção                     | Exemplo                            |
| ---------------- | ----------------------------- | ---------------------------------- |
| Componente React | PascalCase                    | `ServiceOrderCard.tsx`             |
| Use Case         | kebab-case + `.use-case.ts`   | `create-service-order.use-case.ts` |
| Repository       | kebab-case + `.repository.ts` | `service-order.repository.ts`      |
| Route Elysia     | kebab-case + `.routes.ts`     | `services.routes.ts`               |
| Schema Drizzle   | kebab-case + `.schema.ts`     | `service-orders.schema.ts`         |
| Hook React       | camelCase com prefixo `use`   | `useServiceOrders.ts`              |
| Variável/Função  | camelCase                     | `createServiceOrder`               |
| Constante global | UPPER_SNAKE_CASE              | `MAX_UPLOAD_SIZE_MB`               |

### Imports

- Usar alias `@/` mapeado para `src/`.
- Imports de tipo com `import type { ... }`.
- Agrupar: (1) externos, (2) internos `@/`, (3) relativos `./`.

### Comentários

- Código em **inglês**.
- Comentários técnicos em inglês; comentários de domínio/negócio podem ser em português.
- JSDoc em funções públicas de use cases e repositórios.

---

## Modelos de Domínio (Drizzle + PostgreSQL)

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

- Chaves primárias: **CUID** (via `@paralleldrive/cuid2` ou equivalente).
- Timestamps: `created_at` e `updated_at` em todas as tabelas.
- Soft delete com `deleted_at` onde aplicável.
- Índices e constraints conforme documento de modelagem base.

---

## Autenticação e Autorização

- **Auth.js v5** com `CredentialsProvider`.
- JWT stateless; sem sessão em banco.
- Hashing: `bcryptjs` com **12 rounds**.
- Roles: `MANAGER` | `EMPLOYEE`.
- Middleware Next.js (`src/middleware.ts`) protege rotas do dashboard.
- Plugin Elysia (`plugins/auth.ts`) valida JWT e role em rotas da API.

### Mapa de permissões

| Rota                              | Acesso             |
| --------------------------------- | ------------------ |
| `GET /api/fila/publica/:slug`     | Público            |
| `POST /api/contratos/:id/assinar` | Público            |
| `/api/inventario`                 | EMPLOYEE + MANAGER |
| `/api/orcamentos`                 | EMPLOYEE + MANAGER |
| `/api/servicos`                   | EMPLOYEE + MANAGER |
| `/api/fila`                       | EMPLOYEE + MANAGER |
| `/api/clientes`                   | EMPLOYEE + MANAGER |
| `/api/upload`                     | EMPLOYEE + MANAGER |
| `/api/funcionarios`               | MANAGER only       |
| `/api/contratos`                  | MANAGER only       |
| `/api/relatorios/*`               | MANAGER only       |
| `/api/configuracoes`              | MANAGER only       |

---

## Upload de Arquivos

- `StorageProvider` interface com duas implementações: `LocalStorage` e `MinIOStorage`.
- MIME aceitos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Tamanho máximo: **10 MB**.
- Nome do arquivo gerado com CUID (nunca usar nome original do cliente).
- Variável de ambiente `STORAGE_PROVIDER=local|minio` controla qual implementação é injetada.

---

## UI / Frontend

- **Dark mode por padrão** via `next-themes` + shadcn/ui.
- Seletor de tema (dark/light) no header.
- Cor de fundo dark: `#1a1a1a` (ajustar conforme token `--background`).
- Tipografia: **Inter** (Google Fonts) — bold em headings, regular em corpo.
- Totalmente responsivo (mobile-first).
- Toasts via `sonner` (shadcn/ui).
- Confirmações destrutivas via `AlertDialog` do shadcn/ui.
- Loading states com `Skeleton` do shadcn/ui.
- Estados vazios com componente `EmptyState` customizado.

### Features extras implementadas

1. **Dark mode** — `next-themes` + variáveis CSS do shadcn/ui.
2. **Exportação CSV** — disponível nos módulos de relatórios.
3. **QR Code da fila pública** — gerado no balcão para acesso rápido pelo cliente.

---

## Variáveis de Ambiente

Arquivo `.env.example` deve sempre estar atualizado. Nunca commitar `.env`.

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
AUTH_SECRET=                     # openssl rand -base64 32

# Database
DATABASE_URL=postgresql://lavaflow:lavaflow@localhost:5432/lavaflow

# Storage
STORAGE_PROVIDER=local           # local | minio
MINIO_ENDPOINT=
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=lavaflow
```

---

## Docker Compose (dev / prod)

Três serviços: `app`, `postgres`, `minio`.

```yaml
# resumo — ver docker-compose.yml completo
services:
  app: # Next.js + Elysia via Bun
  postgres: # PostgreSQL latest estável
  minio: # MinIO S3-compatible
```

### Setup inicial

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app bun run db:migrate
docker compose exec app bun run db:seed   # opcional
```

---

## Seed Data

| Credencial           | Role     | Senha       |
| -------------------- | -------- | ----------- |
| `admin@lavaflow.com` | MANAGER  | password123 |
| `joao@lavaflow.com`  | EMPLOYEE | password123 |
| `maria@lavaflow.com` | EMPLOYEE | password123 |

Slug padrão da fila pública: `lavaflow-centro`.

---

## Plano de Fases

| Fase | Foco                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| 0    | Bootstrap: Next, Bun, Drizzle, Docker, shadcn/ui                                           |
| 1    | Módulos em paralelo (auth, inventário, clientes, OS, orçamentos, fila, relatórios, upload) |
| 2    | Integração E2E, estados de loading/erro/vazio, responsividade, toasts                      |

Cada módulo entrega: **use case + repository contract + Drizzle implementation + Elysia route + UI**.

---

## Checklist de Verificação (pré-PR)

- [ ] `bun run typecheck` sem erros
- [ ] `bun run lint` sem erros
- [ ] Nenhuma regra de negócio fora de use cases
- [ ] Resposta da API no padrão `{ success, data/error }`
- [ ] `.env.example` atualizado se novas variáveis foram adicionadas
- [ ] Migration gerada para alterações no schema
- [ ] Componentes testados em mobile (375px) e desktop (1280px)
- [ ] Sem `console.log` em código de produção

---

## O que NÃO Fazer

- ❌ Usar `npm`, `npx` ou `pnpm` — **sempre Bun**.
- ❌ Lógica de negócio em routes ou em repositórios.
- ❌ Tipos do Drizzle vazando para a camada de domínio.
- ❌ Commitar `.env` ou segredos.
- ❌ Fixar versões antigas sem justificativa documentada.
- ❌ Importações circulares entre camadas.
- ❌ Múltiplos bancos de dados — **PostgreSQL é o único suportado**.
