# PRD - LavaFlow

## 1. Visao do produto

LavaFlow e um micro-SaaS para operacao de lava-jatos, focado em centralizar rotinas de atendimento, execucao de servicos e acompanhamento financeiro em uma unica plataforma web.

## 2. Problema

Lava-jatos pequenos e medios costumam operar com planilhas, cadernos e mensagens dispersas. Isso causa:
- perda de controle de estoque e consumo de insumos;
- baixa rastreabilidade de ordens de servico;
- demora para gerar orcamentos/contratos;
- pouca visibilidade de fila e previsao para clientes;
- dificuldade para consolidar relatorios de receita e produtividade.

## 3. Publico-alvo

- Gestores de lava-jato (role `MANAGER`)
- Equipe operacional (role `EMPLOYEE`)
- Cliente final (somente fila publica e assinatura por token)

## 4. Objetivos de negocio

- Reduzir tempo operacional diario com fluxos padronizados.
- Melhorar previsibilidade de atendimento com fila publica.
- Aumentar controle de margem com estoque + servicos + relatorios.
- Criar base para produto SaaS multi-tenant no futuro.

## 5. Escopo funcional (MVP atual)

### 5.1 Autenticacao e autorizacao
- Login por email/senha via `POST /api/auth/login`.
- Emissao de JWT stateless.
- Controle de acesso por perfil (`MANAGER`, `EMPLOYEE`).
- Protecao de paginas via middleware e protecao de rotas API via plugin.

### 5.2 Funcionarios
- Listagem de funcionarios.
- Criacao de funcionario por gestor.
- Atualizacao e desativacao (soft delete).

### 5.3 Clientes e veiculos
- CRUD de clientes.
- Busca por termo (nome/documento/email).
- Cadastro e listagem de veiculos por cliente.

### 5.4 Inventario
- CRUD de produtos.
- Controle de movimentacao de estoque.
- Lista de baixo estoque.
- CRUD de tipos de servico.

### 5.5 Ordens de servico
- Criacao de ordem com itens (servicos/produtos).
- Listagem com filtros basicos.
- Transicao de status (ex.: `PENDING`, `IN_PROGRESS`, `DONE`, `DELIVERED`, `CANCELLED`).

### 5.6 Fila
- Gestao interna da fila por slug.
- Endpoint publico da fila (`/api/fila/publica/:slug`).
- Pagina publica `/fila/[slug]` com atualizacao periodica e QR Code.

### 5.7 Orcamentos
- Criacao e atualizacao de orcamentos.
- Listagem e consulta por id.
- Endpoint de PDF com placeholder tecnico para evolucao futura.

### 5.8 Contratos
- Criacao e listagem de contratos (gestor).
- Assinatura por token publico (`POST /api/contratos/:id/assinar`).

### 5.9 Relatorios
- Receita por periodo.
- Resumo de servicos.
- Relatorio de estoque.
- Exportacao CSV.

### 5.10 Uploads
- Upload com validacao de MIME e tamanho maximo (10 MB).
- Persistencia de metadados de arquivo.
- Storage local funcionando para dev.

## 6. Requisitos nao funcionais

- Runtime e package manager: Bun.
- Frontend: Next.js App Router.
- API: Elysia integrado em rota catch-all do Next.
- Banco unico: PostgreSQL.
- ORM: Drizzle.
- Seguranca basica: JWT, hash de senha com bcrypt (12 rounds), controle por role.
- Observabilidade inicial: tratamento padrao de erro na API.
- Deploy: Docker multi-stage com imagem standalone.

## 7. Integracoes e dependencias externas

- PostgreSQL (dados transacionais).
- MinIO (planejado para storage S3-compat; implementacao atual ainda placeholder).
- Browser local storage + cookie para sessao cliente.

## 8. Criterios de sucesso (produto)

- Operador consegue executar fluxo completo: login -> cliente -> ordem -> fila.
- Gestor consegue acompanhar receita e estoque no dashboard.
- Cliente final consegue acompanhar fila publica sem login.
- Operacoes principais executam sem erro em ambiente docker local.

## 9. Fora do escopo atual

- Pagamentos online.
- Notificacoes push/SMS/WhatsApp.
- Multi-filial e multi-tenant real.
- Assinatura digital com provedor juridico externo.
- MinIO em producao com upload/delete implementados.

## 10. Riscos e lacunas atuais

- `MinIOStorageProvider` ainda nao implementa upload/delete.
- Endpoint de PDF esta com placeholder (nao gera documento completo).
- Pagina de configuracoes ainda sem formulario funcional.
- Ainda nao ha scripts de seed/verify implementados em `scripts/`.

## 11. Proximas entregas recomendadas

1. Concluir modulo de configuracoes (`CarWashConfig` + endpoint).
2. Implementar provider MinIO completo.
3. Implementar geracao real de PDF de orcamento.
4. Adicionar seed + verify automatizado.
5. Evoluir autenticacao para fluxo completo do NextAuth v5 se necessario.
