# System Design Document (SDD) - Micro-SaaS para Lava-Jatos

## 1. Arquitetura do Sistema
O sistema adota uma arquitetura desacoplada composta por:
- **Frontend:** Next.js (App Router) para interface administrativa e pública.
- **Backend:** API REST construída com Bun e ElysiaJS para máxima performance e tipagem forte.
- **Banco de Dados:** PostgreSQL para persistência relacional.
- **ORM:** Drizzle ORM para migrações e queries type-safe.
- **Infraestrutura:** Containerização via Docker e Docker Compose.

## 2. Modelo de Dados (Schema)
A persistência baseia-se nos seguintes modelos principais:
- **Users:** Armazena credenciais e roles (`MANAGER`, `EMPLOYEE`).
- **Customers:** Dados de contato e histórico de veículos.
- **Vehicles:** Vínculo entre cliente, placa e modelo.
- **Services:** Catálogo de serviços oferecidos e preços.
- **ServiceOrders (OS):** Documento central que vincula veículo, serviços, funcionário e status.
- **QueueEntries:** Gerenciamento da fila de espera com timestamps de entrada e saída.
- **Payments:** Registro de transações financeiras vinculadas às OS.

## 3. Design da API (ElysiaJS)
A API segue o padrão REST com respostas tipadas:
- **Sucesso:** `{ success: true, data: T, meta?: { ... } }`
- **Erro:** `{ success: false, error: { code, message, details? } }`

### Categorias de Endpoints
- **Public:** `/api/queue` (Acompanhamento de fila).
- **Auth:** `/api/auth/*` (Login/JWT).
- **Staff:** `/api/orders`, `/api/queue/manage` (Operação diária).
- **Manager:** `/api/employees`, `/api/reports`, `/api/config` (Administração).

## 4. Estratégia de Autenticação e Autorização
- **Autenticação:** JWT (JSON Web Tokens) emitidos no login.
- **Autorização:** Middleware de RBAC (Role-Based Access Control) validando as permissões do token antes de processar requisições em rotas protegidas.

## 5. Fluxo de Dados: Fila em Tempo Real
1. O veículo é registrado $\rightarrow$ Cria-se um `QueueEntry` com status `waiting`.
2. O cliente acessa a URL pública $\rightarrow$ Consulta `/api/queue` $\rightarrow$ Retorna posição baseada na ordem de criação.
3. Funcionário inicia serviço $\rightarrow$ Atualiza `QueueEntry` para `processing` $\rightarrow$ Atualiza `ServiceOrder` para `In Progress`.
4. Conclusão $\rightarrow$ `QueueEntry` é removido/marcado como `completed` $\rightarrow$ OS marcada como `Finished`.
