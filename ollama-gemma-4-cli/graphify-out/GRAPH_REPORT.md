# Graph Report - .  (2026-04-17)

## Corpus Check
- Corpus is ~8,294 words - fits in a single context window. You may not need a graph.

## Summary
- 60 nodes · 35 edges · 26 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Form UI Components|Form UI Components]]
- [[_COMMUNITY_Project Planning & Specs|Project Planning & Specs]]
- [[_COMMUNITY_Technical Strategy|Technical Strategy]]
- [[_COMMUNITY_Table UI Components|Table UI Components]]
- [[_COMMUNITY_Product Vision & Personas|Product Vision & Personas]]
- [[_COMMUNITY_Login Flow|Login Flow]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Main Page|Main Page]]
- [[_COMMUNITY_Dashboard Page|Dashboard Page]]
- [[_COMMUNITY_Card UI|Card UI]]
- [[_COMMUNITY_Button UI|Button UI]]
- [[_COMMUNITY_Sidebar Layout|Sidebar Layout]]
- [[_COMMUNITY_Utility Functions|Utility Functions]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Drizzle Config|Drizzle Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_Dashboard Layout|Dashboard Layout]]
- [[_COMMUNITY_Auth API Route|Auth API Route]]
- [[_COMMUNITY_Server Index|Server Index]]
- [[_COMMUNITY_Input UI|Input UI]]
- [[_COMMUNITY_Data Table Component|Data Table Component]]
- [[_COMMUNITY_Database Library|Database Library]]
- [[_COMMUNITY_Auth Library|Auth Library]]
- [[_COMMUNITY_Database Schema|Database Schema]]

## God Nodes (most connected - your core abstractions)
1. `Micro-SaaS para Lava-Jatos` - 5 edges
2. `Tech Stack` - 3 edges
3. `Core Features` - 3 edges
4. `Detailed Tech Stack` - 3 edges
5. `onSubmit()` - 2 edges
6. `Database Schema` - 2 edges
7. `API Design` - 2 edges
8. `Implementation Plan` - 2 edges
9. `Next.js Project` - 1 edges
10. `Implementation Plan` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Project` --semantically_similar_to--> `Micro-SaaS para Lava-Jatos`  [INFERRED] [semantically similar]
  README.md → plan-bun-elysia.md
- `Tech Stack` --semantically_similar_to--> `Detailed Tech Stack`  [INFERRED] [semantically similar]
  plan-bun-elysia.md → docs/spec.md
- `Data Model` --semantically_similar_to--> `Database Schema`  [INFERRED] [semantically similar]
  docs/SDD.md → plan-bun-elysia.md
- `API Response Format` --semantically_similar_to--> `API Design`  [INFERRED] [semantically similar]
  docs/spec.md → plan-bun-elysia.md
- `Project Guidelines` --conceptually_related_to--> `Implementation Plan`  [INFERRED]
  CLAUDE.md → plan-bun-elysia.md

## Hyperedges (group relationships)
- **Project Specification** — plan_bun_elysia_tech_stack, plan_bun_elysia_db_schema, plan_bun_elysia_api_design, plan_bun_elysia_implementation_plan [EXTRACTED 1.00]
- **Project Definition Core** — prd_vision, spec_tech_stack, sdd_architecture [INFERRED 0.90]
- **Technical Blueprint** — spec_tech_stack, spec_api_format, sdd_data_model [INFERRED 0.85]

## Communities

### Community 0 - "Form UI Components"
Cohesion: 0.29
Nodes (0): 

### Community 1 - "Project Planning & Specs"
Cohesion: 0.29
Nodes (7): API Design, Database Schema, Implementation Plan, Micro-SaaS para Lava-Jatos, Next.js Project, Data Model, API Response Format

### Community 2 - "Technical Strategy"
Cohesion: 0.33
Nodes (6): Project Guidelines, Implementation Plan, Tech Stack, System Architecture, Auth Strategy, Detailed Tech Stack

### Community 3 - "Table UI Components"
Cohesion: 0.4
Nodes (0): 

### Community 4 - "Product Vision & Personas"
Cohesion: 0.5
Nodes (4): Core Features, User Personas, Project Vision, Real-time Queue Flow

### Community 5 - "Login Flow"
Cohesion: 0.67
Nodes (1): onSubmit()

### Community 6 - "Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Main Page"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Dashboard Page"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Card UI"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Button UI"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Sidebar Layout"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Utility Functions"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Drizzle Config"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Next Config"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Dashboard Layout"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Auth API Route"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Server Index"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Input UI"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Data Table Component"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Database Library"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Auth Library"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Database Schema"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **10 isolated node(s):** `Next.js Project`, `Implementation Plan`, `Project Vision`, `User Personas`, `API Response Format` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Middleware`** (2 nodes): `middleware()`, `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Root Layout`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Page`** (2 nodes): `Page()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Page`** (2 nodes): `DashboardPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Card UI`** (2 nodes): `cn()`, `card.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button UI`** (2 nodes): `cn()`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sidebar Layout`** (2 nodes): `Sidebar()`, `sidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utility Functions`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drizzle Config`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Layout`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth API Route`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Server Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Input UI`** (1 nodes): `input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Table Component`** (1 nodes): `data-table.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Library`** (1 nodes): `db.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Library`** (1 nodes): `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Schema`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Micro-SaaS para Lava-Jatos` connect `Project Planning & Specs` to `Technical Strategy`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Tech Stack` connect `Technical Strategy` to `Project Planning & Specs`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Core Features` (e.g. with `User Personas` and `Real-time Queue Flow`) actually correct?**
  _`Core Features` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Next.js Project`, `Implementation Plan`, `Project Vision` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._