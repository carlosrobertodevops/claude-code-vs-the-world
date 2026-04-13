# Architecture

**Analysis Date:** 2026-04-13

## System Overview

LavaFlow is a Micro-SaaS for Car Washes built as a monolith with clean boundaries between UI, API, and Domain. The application is served by a Next.js App Router acting as the UI shell, while backend logic is exposed via Elysia API and bounded by specific Use Cases.

## Core Components

- **Next.js App Shell:** Handles routing, rendering (SSR/CSR), responsive UI, and React Query data fetching.
- **Elysia API Server:** HTTP boundaries, validations using Zod, and routing to Use Cases.
- **Domain Layer:** Contains agnostic Rules, Entities, and Use Cases.
- **Infrastructure Layer:** Repositories built with Drizzle ORM to interface with PostgreSQL, and Storage providers for MinIO.

## Data Flow

1. **User Request:** UI components call Elysia API endpoints (via React Query).
2. **API Boundary:** Elysia routes parse/validate incoming data (payload/auth).
3. **Use Case Execution:** API invokes a specific Use Case (e.g., `create-service-order`).
4. **Persistence:** Use case interacts with Repositories.
5. **Database:** Drizzle translates those requests into SQL to PostgreSQL.
6. **Return:** Standardized response follows back up to the UI.

## Build/Deploy Architecture

Docker Compose orchestrates:
1. `app` (Bun Runtime for Next.js and Elysia)
2. `postgres` (Main Database)
3. `minio` (File Uploads)

---
*Architecture analysis: 2026-04-13*
*Update after significant architectural changes*
