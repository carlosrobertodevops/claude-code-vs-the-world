# Micro-SaaS para Lava-Jatos

## Tecnologias/stacks

- Bun + Next.js + Elysia + Drizzle Orm + Postgres + Docker

## Contexto

Aplicacao micro-SaaS para gestao de lava-jatos. O objetivo e criar uma plataforma completa para operacoes diarias:
controle de estoque, orcamentos, contratos, ordens de servico, fila publica e relatorios.
No Estilo dark mode (com seletor para lighht mode) com fundo #labada (linhas horizontas e verticais, no estilo grade com blur).

Tipografia Inter do Google Fonts. Totalmente responsivo.

Este documento e uma versao ajustada para:

- Pacote e runtime com **Bun** (sem npm)
- Frontend e app shell com **Next.js 16 (App Router)**
- Backend HTTP com **Elysia API**
- Persistencia com **Drizzle ORM + PostgreSQL**
- Regras de negocio organizadas por **Casos de Uso**

---

## Nome do Projeto

Nome sugerido: **LavaFlow**

Uso do nome:

- `package.json` (`name`)
- Titulo da aplicacao (header/login/browser tab)
- Seed data (lava-jato demo)
- Emails de seed (`admin@lavaflow.com`, etc.)
- Slug padrao da fila publica (`lavaflow-centro`)

---

## Features Extras (2-3)

Escolhas sugeridas:

1. **Dark mode** com `next-themes` + shadcn/ui
2. **Backgroyd com linhas finas vertiais e horizontais e blur**
3. **Exportacao de relatorios para CSV**
4. **QR Code da fila publica** para acesso rapido no balcao

Justificar no README:

- Dark mode melhora usabilidade em turnos noturnos
- CSV facilita repasse contabilidade/operacao
- QR Code reduz atrito para clientes acompanharem fila

---

## Tech Stack (ajustada - sempre latest estavel)

Regra geral de versao neste projeto:

- Sempre usar a versao **latest estavel** das ferramentas e bibliotecas
- Evitar fixar versoes antigas sem necessidade
- Revisar periodicamente mudancas breaking antes de atualizar em producao

| Camada          | Tecnologia                               | Justificativa                                               |
| --------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Runtime         | Bun (latest)                             | Performance, DX, package manager unico                      |
| Framework       | Next.js (latest estavel, App Router)     | Full-stack, SSR, rotas e UI em um projeto                   |
| API             | Elysia (latest)                          | API tipada, simples e performatica                          |
| Linguagem       | TypeScript (latest estavel)              | Type safety ponta a ponta                                   |
| Banco           | PostgreSQL (latest estavel suportado)    | Banco principal e oficial do projeto                        |
| ORM             | Drizzle ORM + Drizzle Kit (latest)       | Tipagem forte, SQL-first e excelente integracao com Bun     |
| Auth            | NextAuth/Auth.js (latest estavel)        | Integracao com Next.js                                      |
| Validacao       | Zod (latest)                             | Contratos de entrada/saida                                  |
| UI              | Tailwind CSS + shadcn/ui (latest)        | Produtividade e acessibilidade                              |
| Fonte/Tipologia | Inter                                    | Usar Inter para tudo em Negrito e normal dependendo da tela |
| Data Fetching   | TanStack React Query (latest)            | Cache e sincronizacao de estado servidor                    |
| Forms           | React Hook Form + Zod (latest)           | Formularios performaticos                                   |
| Upload          | Local (dev) / MinIO S3-compatible (prod) | Simples no dev, portavel em producao                        |
| PDF             | @react-pdf/renderer (latest)             | Orcamentos e contratos                                      |
| Graficos        | Recharts (latest)                        | Relatorios                                                  |
| Container       | Docker + Docker Compose                  | Deploy simplificado                                         |

**Decisoes chave**:

- Monolito com fronteira clara entre UI, API e dominio
- Codigo fonte em ingles; UI em portugues brasileiro
- Sem npm: comandos de setup/build/migrate/seed via Bun
- Drizzle ORM e compativel com Bun e integra de forma simples no Elysia via camada de repositorios
- Banco de dados padrao e unico: PostgreSQL

---

## Arquitetura de Regras de Negocio (Somente Casos de Uso)

Separacao principal:

- **Casos de Uso (domain/use-cases):** regras de negocio e orquestracao de fluxos
- **Repositorios (domain/repositories):** contratos de persistencia
- **Infra (infrastructure):** Drizzle, storage, providers
- **API (server/api):** Elysia valida, chama use case e retorna payload padrao

### Estrutura sugerida

```txt
projeto/
├── src/
│   ├── app/                        # Next.js App Router (UI)
│   ├── server/
│   │   ├── api/
│   │   │   ├── index.ts            # Elysia app
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
│   │   │   ├── repositories/
│   │   │   │   ├── service-order.repository.ts
│   │   │   │   └── queue.repository.ts
│   │   │   └── use-cases/
│   │   │       ├── create-service-order.use-case.ts
│   │   │       ├── validate-service-order.use-case.ts
│   │   │       ├── move-queue.use-case.ts
│   │   │       ├── create-quote.use-case.ts
│   │   │       ├── generate-quote-pdf.use-case.ts
│   │   │       └── sign-contract.use-case.ts
│   │   └── infrastructure/
│   │       ├── drizzle/
│   │       ├── repositories/
│   │       └── storage/
│   ├── lib/
│   └── middleware.ts
├── drizzle/
│   ├── schema/
│   └── migrations/
└── scripts/
```

### Padrao de resposta da API (Elysia)

```ts
// sucesso
{ success: true, data: T, meta?: { page, limit, total, totalPages } }

// erro
{ success: false, error: { code, message, details?: unknown } }
```

---

## Dominio e Modelagem (Drizzle + PostgreSQL)

Manter os mesmos modelos principais do plano original:

- User, Customer, Vehicle, VehiclePhoto
- Product, StockMovement, ServiceType
- Quote, QuoteItem
- Contract
- ServiceOrder, ServiceOrderItem, ServicePhoto
- QueueEntry
- CarWashConfig
- FileUpload

Com os mesmos indices e constraints definidos no documento base, modelados em `drizzle/schema` para PostgreSQL.

### Compatibilidade: Drizzle + Bun + Elysia

- **Bun + Drizzle:** Drizzle funciona de forma nativa com Bun e toolchain simples (`bun run` + drizzle-kit)
- **Elysia + Drizzle:** handlers do Elysia chamam casos de uso, que dependem de repositorios implementados com Drizzle
- **PostgreSQL:** driver e dialeto principal do projeto; sem suporte multi-banco neste escopo
- **Arquitetura limpa:** dominio nao depende do ORM, facilitando testes e manutencao

---

## API Design com Elysia

### Rotas publicas

- `POST /api/auth/[...nextauth]`
- `GET /api/fila/publica/:slug`
- `POST /api/contratos/:id/assinar`
- `GET /fila/[slug]` (pagina Next.js)

### Rotas autenticadas (EMPLOYEE + MANAGER)

- `/api/inventario`
- `/api/orcamentos`
- `/api/servicos`
- `/api/fila`
- `/api/clientes`
- `/api/upload`

### Rotas somente MANAGER

- `/api/funcionarios`
- `/api/contratos`
- `/api/relatorios/*`
- `/api/configuracoes`

---

## Auth e Autorizacao

- NextAuth v5 com CredentialsProvider
- JWT stateless
- `bcryptjs` com 12 rounds
- Middleware no Next para proteger paginas
- Guard de role no backend Elysia (plugin/hook)

---

## Upload de Arquivos

- `StorageProvider` com implementacoes Local e MinIO
- Validacao de MIME: jpg, png, webp, pdf
- Limite: 10MB
- Nome unico com CUID

---

## Seed Data

Manter volume do plano original com adaptacao de dominio:

- Manager: `admin@lavaflow.com / password123`
- Employees: `joao@lavaflow.com`, `maria@lavaflow.com`
- Produtos, servicos, clientes, veiculos, orcamentos, contratos e ordens conforme plano base

---

## Plano de Implementacao

### Fase 0 - Bootstrap (sequencial)

1. Criar app Next com Bun:
   - `bunx create-next-app@latest . --ts --tailwind --app --eslint --use-bun`
2. Instalar dependencias com Bun:
   - `bun add elysia@latest zod@latest @tanstack/react-query@latest next-auth@latest drizzle-orm@latest postgres@latest bcryptjs@latest`
   - `bun add -d drizzle-kit@latest tsx@latest @types/bcryptjs@latest`
3. Configurar schema Drizzle (PostgreSQL) e migration inicial
4. Subir `docker-compose` (postgres + minio)
5. Criar base de arquitetura: use-cases, repositorios e adapters de infraestrutura
6. Inicializar shadcn/ui
7. Layout base (auth + dashboard)

### Fase 1 - Modulos em paralelo

- Auth + funcionarios
- Inventario
- Clientes + veiculos + ordens de servico
- Orcamentos + contratos + PDF
- Fila + relatorios + dashboard
- Upload + seed + deploy

Cada modulo deve expor use-cases no dominio e adapters Elysia nas rotas.

### Fase 2 - Integracao

1. Navegacao e consistencia de estados
2. Fluxos E2E
3. Ajustes de loading/erro/empty
4. Responsividade mobile
5. Toasts e confirmacoes

---

## Deploy (ajustado para Bun)

Docker Compose com 3 servicos: `app`, `postgres`, `minio`.

Passos:

1. Clonar repositorio
2. Copiar `.env.example` para `.env`
3. `docker compose up -d --build`
4. `docker compose exec app bun run db:migrate`
5. `docker compose exec app bun run db:seed` (opcional)
6. Configurar reverse proxy com SSL (Nginx/Caddy)
7. Apontar dominio

---

## Verificacao (ajustada)

1. `docker compose up -d` sobe servicos
2. `bun run db:seed` popula base
3. Login em `http://localhost:3000/login`
4. CRUD basico em inventario/clientes/servicos
5. Gerar PDF de orcamento
6. Mover OS na fila e validar pagina publica
7. Testar upload
8. Testar assinatura de contrato

---

## Diferencas em relacao ao planejamento base

- Substitui comandos `npx`/`npm` por `bunx`/`bun`
- Define backend explicitamente com **Elysia API**
- Define o ORM oficial como **Drizzle ORM** com foco em PostgreSQL
- Padroniza ferramentas em **latest** (Next.js, Elysia, Bun, Drizzle e ecossistema)
- Introduz arquitetura de dominio com regra de negocio **apenas em Casos de Uso**
- Ajusta bloco de deploy para fluxo Bun em Docker
