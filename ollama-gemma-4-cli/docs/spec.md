# Technical Specification (Spec) - Micro-SaaS para Lava-Jatos

## 1. Stack Tecnológica Detalhada
- **Runtime:** Bun v1.x
- **Backend Framework:** ElysiaJS (Fast, TypeScript-first)
- **Frontend Framework:** Next.js 15+ (App Router, Tailwind CSS, Shadcn UI)
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM (Schema-first)
- **Auth:** JWT com cookies HTTP-only
- **Containerization:** Docker & Docker Compose

## 2. Definição de Tipos e Interfaces (Core)

### 2.1 User Roles
```typescript
type UserRole = 'MANAGER' | 'EMPLOYEE';
```

### 2.2 Service Order Status
```typescript
type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
```

### 2.3 API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 3. Contrato de Endpoints (Resumo)

### 3.1 Rotas Públicas
| Endpoint | Método | Descrição | Autenticação |
| :--- | :---: | :--- | :---: |
| `/api/queue` | GET | Lista posição atual da fila | Nenhuma |
| `/api/auth/login` | POST | Autentica usuário e retorna token | Nenhuma |

### 3.2 Rotas de Operação (Staff)
| Endpoint | Método | Descrição | Permissão |
| :--- | :---: | :--- | :---: |
| `/api/orders` | POST | Cria nova Ordem de Serviço | STAFF |
| `/api/orders/:id` | PATCH | Atualiza status da OS | STAFF |
| `/api/queue/update` | PATCH | Move veículo na fila | STAFF |

### 3.3 Rotas Administrativas (Manager)
| Endpoint | Método | Descrição | Permissão |
| :--- | :---: | :--- | :---: |
| `/api/employees` | GET/POST/DELETE | Gestão de funcionários | MANAGER |
| `/api/reports/revenue` | GET | Relatório de faturamento | MANAGER |
| `/api/config` | PATCH | Configurações do lava-jato | MANAGER |

## 4. Estrutura de Diretórios Sugerida
```text
/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/      # Shadcn UI & Custom Components
│   ├── lib/              # Shared utilities (db, auth, etc)
│   ├── services/         # Business logic & API clients
│   └── types/            # TypeScript definitions
├── backend/              # ElysiaJS Server
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── routes/       # Route definitions
│   │   ├── controllers/  # Request handlers
│   │   └── db/           # Drizzle schema & config
│   └── package.json
├── docker-compose.yml    # Infrastructure
└── drizzle.config.ts      # DB migrations config
```

## 5. Fluxo de Deploy (CI/CD)
1. **Build:** Bun build frontend e backend.
2. **Migration:** Execução de `drizzle-kit push` para atualizar schema.
3. **Deploy:** Containerização via Docker Compose em VPS Linux.
