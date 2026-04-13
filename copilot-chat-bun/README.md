# LavaFlow

Micro-SaaS para gestao de lava-jatos com **Bun + Next.js 16 + Elysia + Drizzle ORM + PostgreSQL + Docker**.

## Destaques

- **Dark mode + light mode**: melhor usabilidade em turnos noturnos e alternancia rapida por preferencia do operador.
- **Exportacao CSV**: facilita repasse de relatorios para contabilidade e operacao.
- **QR Code da fila publica**: reduz atrito no balcao para o cliente acompanhar o andamento da lavagem.

## Stack

- Bun
- Next.js 16 App Router
- Elysia API
- NextAuth com Credentials Provider
- Drizzle ORM + PostgreSQL
- Tailwind CSS
- React Hook Form + Zod
- Recharts
- @react-pdf/renderer
- Docker Compose

## Credenciais demo

- **Gerente**: `admin@lavaflow.com / password123`
- **Colaboradores**: `joao@lavaflow.com / password123`, `maria@lavaflow.com / password123`

## Fluxo local

1. Copie o ambiente:

```bash
cp .env.example .env
```

2. Suba os servicos:

```bash
docker compose up -d --build
```

3. Gere as migrations:

```bash
bun run db:generate
```

4. Rode as migrations:

```bash
docker compose exec app bun run db:migrate
```

5. Popule a base:

```bash
docker compose exec app bun run db:seed
```

6. Acesse:

- App: `http://localhost:3000/login`
- Fila publica: `http://localhost:3000/fila/lavaflow-centro`
- MinIO Console: `http://localhost:9001`

## Scripts

```bash
bun run dev
bun run lint
bun run build
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:seed
```

## Estrutura

```txt
src/
  app/              # UI e route handlers do Next
  components/       # Blocos reutilizaveis de interface
  lib/              # Utils, env e dados demo
  server/
    api/            # App Elysia e rotas
    domain/         # Repositorios e casos de uso
    infrastructure/ # Drizzle e adapters
drizzle/
  schema/           # Schema PostgreSQL
scripts/
  seed.ts
```

## Modulos implementados

- Login com NextAuth
- Dashboard operacional
- Inventario
- Clientes e veiculos
- Ordens de servico
- Orcamentos
- Contratos
- Fila interna e fila publica
- Relatorios com grafico e exportacao CSV
- Configuracoes e equipe

## Observacao atual

A UI e a API estao prontas com dados demo integrados. O schema Drizzle, o seed e o deploy Docker estao configurados para evoluir a persistencia em PostgreSQL.
