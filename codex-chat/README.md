# JatoFlow

Micro-SaaS para gestao de lava-jatos com foco em operacao diaria, fila publica, controle comercial e visao gerencial.

## O que foi implementado

- Auth com Auth.js v5, login por credenciais e roles `MANAGER` / `EMPLOYEE`
- Dashboard com KPIs operacionais, servicos recentes e alerta de estoque
- Clientes e veiculos com historico de fidelidade e atalho para WhatsApp
- Inventario com produtos e movimentacoes de estoque
- Ordens de servico com mudanca de status e sincronizacao da fila
- Fila publica em `/fila/[slug]` com polling automatico
- Orcamentos com itens, status e exportacao em PDF
- Contratos com pagina publica de assinatura digital e PDF
- Funcionarios com controle de papeis
- Relatorios com Recharts e exportacao CSV
- Configuracoes do lava-jato com QR Code da fila publica
- Upload de arquivos com storage local ou S3-compatible
- Docker Compose para Postgres 17 e MinIO
- Schema Prisma completo, migration SQL inicial e seed realista

## Features extras escolhidas

1. Dark mode
Justificativa: operadores passam longos periodos no painel; oferecer alternancia de tema melhora conforto visual no uso continuo.

2. Programa de fidelidade
Justificativa: recorrencia e recompra sao centrais para um lava-jato. Pontos por OS concluida ajudam a transformar clientes ocasionais em frequentes.

3. Exportacao de dados em CSV
Justificativa: pequenos negocios costumam precisar levar dados para planilhas, contabilidade ou auditorias rapidas sem depender de BI externo.

## Stack

- Next.js 15 + App Router
- TypeScript 5
- Prisma 7
- PostgreSQL 17
- Auth.js v5
- Tailwind CSS 4
- React Hook Form
- TanStack React Query 5
- Recharts
- @react-pdf/renderer

## Credenciais seed

- `admin@jatoflow.com` / `password123`
- `joao@jatoflow.com` / `password123`
- `maria@jatoflow.com` / `password123`

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Suba a infraestrutura local:

```bash
docker compose up -d
```

3. Copie as variaveis de ambiente:

```bash
cp .env.example .env
```

4. Aplique a migration e rode o seed:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

5. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Aplicacao: `http://localhost:3000`
Fila publica demo: `http://localhost:3000/fila/jatoflow-centro`
PostgreSQL do projeto via Docker: `localhost:55432`

## Scripts uteis

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

## Estrutura principal

- `src/app`: paginas, layouts e APIs
- `src/components`: UI, layout, charts e assinatura
- `src/lib`: auth, prisma, pdf, fila, storage e validacoes
- `prisma/schema.prisma`: schema principal
- `prisma/seed.ts`: base demonstrativa
- `prisma/migrations/202603222330_init/migration.sql`: migration inicial

## Observacoes de implementacao

- O codigo fonte esta em ingles; a UI esta em portugues brasileiro.
- As paginas ligadas ao banco foram marcadas como dinamicas para evitar acesso a dados na etapa de build.
- O middleware usa JWT do Auth.js para proteger rotas sem puxar Prisma para o runtime Edge.
- O Prisma 7 foi configurado com `prisma.config.ts` e adapter PostgreSQL.

## Validacao executada

- `npx prisma validate`
- `npm run db:generate`
- `npm run lint`
- `npm run build`
