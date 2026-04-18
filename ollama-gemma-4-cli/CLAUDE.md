# Project Instructions

## Project Overview
Micro-SaaS for car washes focusing on real-time queue management and financial control.
Stack: Next.js 15+, Bun, ElysiaJS, Drizzle ORM, PostgreSQL.

## Development Guidelines
- **Simplicity First**: Minimum code to solve the problem. No speculative abstractions.
- **Surgical Changes**: Touch only what is necessary. Match existing style.
- **Goal-Driven**: Define success criteria (e.g., test cases) before implementing.
- **Language**: Source code in English, UI in Portuguese (BR).

## Tech Stack & Patterns
- **Runtime**: Bun
- **Backend**: ElysiaJS (REST API)
- **Frontend**: Next.js (App Router, Tailwind CSS, Shadcn UI)
- **DB**: PostgreSQL via Drizzle ORM
- **Auth**: JWT with HTTP-only cookies, RBAC (MANAGER, EMPLOYEE)

## Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Bun build $\rightarrow$ Drizzle migration $\rightarrow$ Docker Compose
