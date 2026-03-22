# AquaFlow - Sistema de Gestao para Lava-Jato

Sistema completo de gestao para lava-jato construido com Next.js 16, TypeScript, PostgreSQL e Prisma.

## Funcionalidades

- **Dashboard** com KPIs e graficos de faturamento
- **Ordens de Servico** com controle de status, itens e fila de atendimento
- **Clientes e Veiculos** com CRUD completo e integracao WhatsApp
- **Inventario** com controle de estoque, movimentacoes e alertas de estoque baixo
- **Orcamentos** com itens, descontos e geracao de PDF
- **Contratos** com assinatura digital e PDF
- **Funcionarios** com controle de acesso por perfil (Gerente/Funcionario)
- **Fila Publica** com atualizacao automatica a cada 30 segundos
- **Relatorios** com graficos (Recharts) e exportacao CSV
- **Modo Escuro** com alternancia no sidebar
- **Responsivo** com sidebar adaptativo para mobile

## Tecnologias

- Next.js 16 (App Router, Turbopack)
- TypeScript 5
- PostgreSQL 17
- Prisma ORM 7
- NextAuth v5 (JWT)
- Tailwind CSS 4 + shadcn/ui
- TanStack React Query 5
- React Hook Form + Zod
- Recharts
- @react-pdf/renderer
- Docker + Docker Compose

## Requisitos

- Node.js 20+
- Docker e Docker Compose
- npm

## Instalacao

```bash
# Clone o repositorio
git clone <repo-url>
cd aquaflow

# Instale as dependencias
npm install

# Copie o arquivo de ambiente
cp .env.example .env

# Suba o banco de dados
docker compose up -d db

# Execute as migracoes
npx prisma migrate dev

# Popule o banco com dados de exemplo
npm run db:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## Credenciais Padrao

| Email | Senha | Perfil |
|---|---|---|
| admin@aquaflow.com | admin123 | Gerente |
| carlos@aquaflow.com | func123 | Funcionario |
| maria@aquaflow.com | func123 | Funcionario |

## Scripts Disponiveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de producao
npm run start        # Servidor de producao
npm run db:migrate   # Executar migracoes
npm run db:seed      # Popular banco com dados
npm run db:reset     # Resetar banco
```

## Estrutura do Projeto

```
src/
  app/
    (auth)/login/          # Pagina de login
    (dashboard)/           # Layout com sidebar
      dashboard/           # KPIs e graficos
      servicos/            # Ordens de servico
      clientes/            # Clientes e veiculos
      inventario/          # Produtos e estoque
      orcamentos/          # Orcamentos
      contratos/           # Contratos
      funcionarios/        # Equipe
      fila/                # Fila interna
      relatorios/          # Relatorios e CSV
      configuracoes/       # Config do lava-jato
    fila/[slug]/           # Fila publica
    api/                   # API Routes
  components/
    ui/                    # shadcn/ui
    shared/                # Componentes compartilhados
    tables/                # DataTable reutilizavel
  hooks/                   # React Query hooks
  lib/                     # Utilidades, auth, validacoes, PDF
prisma/
  schema.prisma            # Schema do banco
  seed.ts                  # Dados de exemplo
```

## Variaveis de Ambiente

Veja `.env.example` para a lista completa de variaveis.
