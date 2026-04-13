# Technology Stack

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- TypeScript (latest) - All application code

## Runtime

**Environment:**
- Bun (latest)
- Browser

**Package Manager:**
- Bun
- Lockfile: `bun.lockb`

## Frameworks

**Core:**
- Next.js 16 (App Router) - UI Shell and Pages
- Elysia API (latest) - Backend HTTP

**Testing:**
- TBD

**Build/Dev:**
- Bun build/dev toolchain

## Key Dependencies

**Critical:**
- Drizzle ORM + Drizzle Kit - SQLite/PostgreSQL persistence
- NextAuth/Auth.js - Integrations for Auth
- Zod - Validation
- Tailwind CSS + shadcn/ui - UI components

**Infrastructure:**
- PostgreSQL
- MinIO (S3 compatible local/prod)

## Configuration

**Environment:**
- `.env` files

**Build:**
- TBD

## Platform Requirements

**Development:**
- Docker + Docker Compose

**Production:**
- Docker + Nginx/Caddy Reverse Proxy

---

*Stack analysis: 2026-04-13*
*Update after major dependency changes*
