# SDD - LavaFlow

## 1. Escopo tecnico

Este documento descreve o desenho tecnico atual do projeto LavaFlow no estado presente do repositorio, incluindo arquitetura, modulos, modelo de dados, APIs, deploy e lacunas conhecidas.

## 2. Stack

- Runtime: Bun
- Frontend: Next.js 16 (App Router), React 19
- API: Elysia
- Banco: PostgreSQL 16
- ORM: Drizzle ORM + Drizzle Kit
- UI: Tailwind + componentes shadcn/base-ui
- Auth: JWT HS256 com `jose` + middleware de aplicacao
- Infra local: Docker Compose (`app`, `postgres`, `minio`)

## 3. Arquitetura

### 3.1 Topologia de runtime

- Next.js serve frontend e tambem roteia API via `src/app/api/[[...slug]]/route.ts`.
- A rota catch-all repassa requests para `app.handle(req)` da instancia Elysia em `src/server/api/index.ts`.
- Camadas:
  - `src/server/api/*`: transporte HTTP, validacao de payload, autorizacao de rota.
  - `src/server/domain/repositories/*`: contratos de repositorio (interfaces).
  - `src/server/infrastructure/*`: implementacoes Drizzle, auth infra, storage.
  - `drizzle/schema/*`: definicao fisica do banco.

### 3.2 Padrao de resposta API

- Sucesso: `{ success: true, data, meta? }`
- Erro: `{ success: false, error: { code, message, details? } }`

`error-handler` centraliza serializacao de erros de dominio e validacao.

## 4. Estrutura principal

- `src/app/(auth)/login/page.tsx`: tela de login.
- `src/app/(dashboard)/*`: paginas internas (clientes, inventario, fila, contratos, relatorios etc.).
- `src/app/fila/[slug]/page.tsx`: pagina publica da fila.
- `src/server/api/routes/*.ts`: grupos de endpoint por dominio.
- `src/server/infrastructure/repositories/*.ts`: persistencia concreta.
- `src/lib/types/*.ts`: tipos de dominio e contratos de payload.
- `drizzle/schema/*.ts`: schema SQL com enums e relacoes.

## 5. Modelo de dados

## 5.1 Tabelas

- `users` (role, credenciais, soft delete)
- `customers`, `vehicles`, `vehicle_photos`
- `products`, `stock_movements`, `service_types`
- `quotes`, `quote_items`
- `contracts`
- `service_orders`, `service_order_items`, `service_photos`
- `queue_entries`
- `car_wash_config`
- `file_uploads`

## 5.2 Convencoes

- PK textual com CUID (`createId`).
- `created_at` e `updated_at` em entidades principais.
- Soft delete em tabelas de negocio chave (`deleted_at`).
- Enums postgres:
  - `role` = `MANAGER | EMPLOYEE`
  - `order_status` = `PENDING | IN_PROGRESS | DONE | DELIVERED | CANCELLED`
  - `queue_status` = `WAITING | IN_SERVICE | DONE`
  - `contract_status` = `PENDING | SIGNED | CANCELLED`
  - `quote_status` = `DRAFT | SENT | ACCEPTED | REJECTED`

## 6. API por modulo

## 6.1 Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

Implementacao atual:
- Valida email/senha contra `UserRepository` + bcrypt.
- Emite JWT via `signJwt`.

## 6.2 Funcionarios (manager)

- `GET /api/funcionarios`
- `POST /api/funcionarios`
- `PATCH /api/funcionarios/:id`
- `DELETE /api/funcionarios/:id`

## 6.3 Clientes e veiculos

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PATCH /api/clientes/:id`
- `DELETE /api/clientes/:id`
- `POST /api/clientes/:id/veiculos`
- `GET /api/clientes/:id/veiculos`

## 6.4 Inventario

- Produtos:
  - `GET /api/inventario/produtos`
  - `GET /api/inventario/produtos/baixo-estoque`
  - `POST /api/inventario/produtos`
  - `PATCH /api/inventario/produtos/:id`
  - `DELETE /api/inventario/produtos/:id`
  - `POST /api/inventario/produtos/:id/estoque`
- Tipos de servico:
  - `GET /api/inventario/servicos`
  - `POST /api/inventario/servicos`
  - `PATCH /api/inventario/servicos/:id`
  - `DELETE /api/inventario/servicos/:id`

## 6.5 Ordens de servico

- `GET /api/servicos`
- `POST /api/servicos`
- `PATCH /api/servicos/:id/status`

## 6.6 Fila

- Publico: `GET /api/fila/publica/:slug`
- Interno:
  - `GET /api/fila/:slug`
  - `POST /api/fila`
  - `PATCH /api/fila/:id`
  - `DELETE /api/fila/:id`

## 6.7 Orcamentos

- `GET /api/orcamentos`
- `GET /api/orcamentos/:id`
- `POST /api/orcamentos`
- `PATCH /api/orcamentos/:id`
- `GET /api/orcamentos/:id/pdf` (placeholder tecnico atual)

## 6.8 Contratos

- `GET /api/contratos` (manager)
- `POST /api/contratos` (manager)
- `POST /api/contratos/:id/assinar` (publico via token)

## 6.9 Relatorios

- `GET /api/relatorios/receita`
- `GET /api/relatorios/servicos-resumo`
- `GET /api/relatorios/estoque`
- `GET /api/relatorios/export-csv`

## 6.10 Upload

- `POST /api/upload`

Regras:
- MIME permitido: JPEG/PNG/WEBP/PDF.
- Tamanho maximo: 10MB.
- Persistencia de metadata em `file_uploads`.

## 7. Frontend

## 7.1 Fluxo de sessao

- Login salva token no `localStorage` e cookie (`lavaflow_token`).
- `src/middleware.ts` protege dashboard e redireciona `/` para `/dashboard` ou `/login`.
- `api-client.ts` injeta `Authorization: Bearer <token>`.

## 7.2 Modulos UI ativos

- Dashboard home com KPIs de receita.
- CRUDs basicos para funcionarios, clientes, produtos e tipos de servico.
- Tela de ordens, fila interna, orcamentos, contratos e relatorios.
- Fila publica com atualizacao a cada 15s e QR code.

## 7.3 Lacunas UI conhecidas

- `dashboard/configuracoes` esta em TODO e depende de endpoint dedicado.
- UX ainda em nivel funcional (sem camada forte de estados de erro/carregamento unificada).

## 8. Seguranca

- Hash de senha: bcrypt 12 rounds.
- JWT HS256 com segredo em env (`NEXTAUTH_SECRET`/`JWT_SECRET`).
- Controle por role em rotas criticas (`requireManager`).
- Assinatura de contrato por token unico persistido.

Observacao atual: o middleware web verifica presenca de cookie, nao validade criptografica do token.

## 9. Storage de arquivos

- `LocalStorageProvider`: implementado, grava em `public/uploads`.
- `MinIOStorageProvider`: classe presente, mas `upload/delete` ainda nao implementados (placeholder).
- Factory `getStorage()` seleciona provider por `STORAGE_PROVIDER`.

## 10. Configuracao e ambientes

Variaveis usadas pela aplicacao:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `NEXTAUTH_URL`
- `STORAGE_PROVIDER`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `NODE_ENV`

## 11. Build e deploy

- Dockerfile multi-stage com Bun.
- Next em `output: "standalone"`.
- Compose dev com servicos: app, postgres, minio.
- Healthchecks para postgres e minio no compose.

## 12. Testes e qualidade

Estado atual no repositorio:
- Scripts existentes: `lint`, `typecheck`, `db:generate`, `db:migrate`, `db:studio`.
- Nao ha suite de testes automatizada versionada no estado atual.
- Nao ha script de `seed`/`verify` implementado ainda.

## 13. Divida tecnica e evolucoes priorizadas

1. Completar provider MinIO real.
2. Implementar endpoint e tela de configuracoes (`car_wash_config`).
3. Trocar placeholder de PDF por renderizacao real com `@react-pdf/renderer`.
4. Adicionar seeds, testes e pipeline de verificacao.
5. Endurecer validacao de token no middleware edge (alem da presenca do cookie).
