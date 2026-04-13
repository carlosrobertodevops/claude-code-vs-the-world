# Directory Structure

**Analysis Date:** 2026-04-13

## High-Level Organization

```text
projeto/
├── src/
│   ├── app/                        # Next.js App Router (UI)
│   ├── server/                     # Backend Logic
│   │   ├── api/                    # Elysia app & routes
│   │   ├── domain/                 # Entidades, repositórios (contratos) e use-cases
│   │   └── infrastructure/         # Drizzle + Storage
│   └── lib/                        # Utils
├── drizzle/                        # Drizzle Schema e Migrations
└── docker-compose.yml              # Serviços locais
```

## Key Directories

- `src/server/domain/`: The core business logic organized by Use Cases and Entities invariant rules.
- `src/server/api/`: Elysia plugins, error handlers, and endpoint exposing.
- `src/app/`: The Next.js frontend pages.

---
*Structure analysis: 2026-04-13*
*Update after refactoring major directories*
