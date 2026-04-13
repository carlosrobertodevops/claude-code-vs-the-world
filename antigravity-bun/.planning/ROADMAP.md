# Roadmap: LavaFlow

## Overview

A jornada para lançar o MVP do LavaFlow, um SaaS completo para gestão de lava-jatos com Drizzle, Next.js, Bun e Elysia. Começa com o bootstrap técnico (Phase 1), avança pelas bases de cadastro e autenticação, indo até ordens de serviço, finanças (orçamentos e contratos) e a cereja do bolo (Fila pública e relatórios).

## Phases

- [ ] **Phase 1: Bootstrap** - Configuração base, DB schema e app shell
- [ ] **Phase 2: Auth & Config** - NextAuth, upload setup e usuários
- [ ] **Phase 3: Inventário & Clientes** - Produtos, estoque, clientes e veículos
- [ ] **Phase 4: Ordens de Serviço** - OS, fluxos e fotos
- [ ] **Phase 5: Orçamentos & Contratos** - PDF export e assinatura
- [ ] **Phase 6: Fila Pública & Relatórios** - QR Code, dashboard e CSV export

## Phase Details

### Phase 1: Bootstrap
**Goal**: Subir a estrutura completa do repositório, docker-compose para PostgreSQL/MinIO, Next.js App Router e Elysia API. Layout base configurado.
**Depends on**: Nothing
**Requirements**: CORE-01
**Success Criteria**:
  1. O projeto roda localmente com docker compose up e bun run dev sem erros.
  2. A UI base carrega e responde a mudanças no dark mode.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Inicializar App Next.js e Bun + Elysia
- [ ] 01-02: Configurar Docker, PostgreSQL, Drizzle schema e migrations
- [ ] 01-03: Layout base com shadcn/ui e dark mode

### Phase 2: Auth & Config
**Goal**: Proteger o sistema. Login de MANAGER/EMPLOYEE e configuração do sistema de uploads local/S3.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, CORE-02
**Success Criteria**:
  1. Usuário pode fazer login válido e é barrado caso tente rotas não autorizadas.
  2. Upload de avatar de teste funciona validando MIME types e tamanho.
**Plans**: 2 plans

Plans:
- [ ] 02-01: NextAuth integração via Credentials, Middleware e Elysia Guard
- [ ] 02-02: Provider de storage MinIO/Local + limitador e testes

### Phase 3: Inventário & Clientes
**Goal**: Base de cadastros. O coração dos dados operacionais antes da execução de serviços.
**Depends on**: Phase 2
**Requirements**: INVN-01, INVN-02, CSTV-01, CSTV-02, CSTV-03
**Success Criteria**:
  1. Fluxo de cadastrar cliente, anexar veículo e foto completo.
  2. Criação de produtos e listagem funcionando.
**Plans**: 3 plans

Plans:
- [ ] 03-01: CRUD de Produtos e Movimentos de Estoque
- [ ] 03-02: CRUD de Clientes
- [ ] 03-03: Anexos e Veículos + Fotos de veículos

### Phase 4: Ordens de Serviço
**Goal**: A execução do negócio. Gerência das OS, amarração de serviços aos veículos.
**Depends on**: Phase 3
**Requirements**: SORD-01, SORD-02, SORD-03
**Success Criteria**:
  1. Funcionário pode criar OS e alterar seu estado até ser finalizada.
  2. OS permite anexar fotos do antes/depois.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Criação e fluxo de state de OS
- [ ] 04-02: Anexo de fotos de serviço

### Phase 5: Orçamentos & Contratos
**Goal**: O fluxo financeiro e jurídico básico para fechar grandes serviços.
**Depends on**: Phase 4
**Requirements**: QUOT-01, QUOT-02, CONT-01, CONT-02
**Success Criteria**:
  1. Ao gerar orçamento, sistema emite arquivo PDF válido com dados da OS e valores.
  2. Contrato é gerado e usuário final pode assinar/concordar logicamente.
**Plans**: 3 plans

Plans:
- [ ] 05-01: Rotas e CRUD de orçamentos
- [ ] 05-02: Export PDF usando react-pdf
- [ ] 05-03: Geração de modelo e log de assinatura de Contratos

### Phase 6: Fila Pública & Relatórios
**Goal**: A cereja do bolo. Dashboards internos e acompanhamento de tracking via display público para clientes.
**Depends on**: Phase 4
**Requirements**: QUEU-01, QUEU-02, QUEU-03, REPT-01, REPT-02
**Success Criteria**:
  1. Cliente acessa slug gerado no QR Code e visualiza o status carro.
  2. Manager visualiza dashboard e exporta arquivo CSV atualizado de lucros/OS.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Modelagem e views de Fila Pública
- [ ] 06-02: QR Code gerador
- [ ] 06-03: Dashboard internal com Recharts + ação de exportar CSV

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Bootstrap | 0/3 | Not started | - |
| 2. Auth & Config | 0/2 | Not started | - |
| 3. Inventário & Clientes | 0/3 | Not started | - |
| 4. Ordens de Serviço | 0/2 | Not started | - |
| 5. Orçamentos & Contratos | 0/3 | Not started | - |
| 6. Fila Pública & Relatórios | 0/3 | Not started | - |
