# Phase 1: Bootstrap - Technical Research

## Architecture & Implementation Patterns

**Environment:** Bun runtime ONLY (no npm/yarn/pnpm).
- Use `bunx create-next-app@latest . --ts --tailwind --app --eslint --use-bun`
- Add Elysia, Drizzle ORM, Zod, and Postgres drivers using `bun add ...`
- Local infrastructure depends heavily on `docker-compose.yml`. PostgreSQL and MinIO are explicitly listed in requirements.

## Schema Push Requirements

- Project utilizes **Drizzle ORM**.
- Required schema push command for migrations should be executed using `bun run drizzle-kit push`.
- Mandatory migration files should be placed inside `drizzle/schema/` and `drizzle/migrations/`.

## Layout & Setup Needs
- **Next.js App Router**: `src/app/` will contain `layout.tsx` where Shadcn/UI root and basic setup is formed.
- **shadcn/ui**: Initializing needs `bunx --bun shadcn-ui@latest init` configuration.
- **Dark Mode**: Utilizando `next-themes` com integration wrapper for Tailwind classes logic.
- **Elysia API Server**: A custom node/bun http handler that bridges Next.js server capability or stands alone in `src/server/api/index.ts`.

## Watch Out For:
- Next.js needs to correctly export standard Next configurations alongside Elysia. Often Next.js routing intercepts API routes unless you explicitly delegate `/api/*` to Elysia handler within `src/app/api/[[...slug]]/route.ts`.
- Make sure `docker-compose.yml` uses modern Postgres version (e.g. 15+) and standard MinIO settings so Elysia and Next.js can connect immediately.

---
*Research completed: 2026-04-13*
