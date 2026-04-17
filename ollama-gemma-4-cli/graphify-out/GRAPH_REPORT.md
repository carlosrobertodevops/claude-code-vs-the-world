# Graph Report - .  (2026-04-17)

## Corpus Check
- Corpus is ~4,574 words - fits in a single context window. You may not need a graph.

## Summary
- 26 nodes · 12 edges · 14 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Specifications|Project Specifications]]
- [[_COMMUNITY_UI Table Components|UI Table Components]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_UI Button Component|UI Button Component]]
- [[_COMMUNITY_Utilities|Utilities]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_TS Env Definitions|TS Env Definitions]]
- [[_COMMUNITY_Drizzle Config|Drizzle Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_Home Page|Home Page]]
- [[_COMMUNITY_Data Table Component|Data Table Component]]
- [[_COMMUNITY_DB Connection|DB Connection]]
- [[_COMMUNITY_DB Schema|DB Schema]]

## God Nodes (most connected - your core abstractions)
1. `Micro-SaaS para Lava-Jatos` - 5 edges
2. `Next.js Project` - 1 edges
3. `Tech Stack` - 1 edges
4. `Database Schema` - 1 edges
5. `API Design` - 1 edges
6. `Implementation Plan` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Project` --semantically_similar_to--> `Micro-SaaS para Lava-Jatos`  [INFERRED] [semantically similar]
  README.md → plan-bun-elysia.md

## Hyperedges (group relationships)
- **Project Specification** — plan_bun_elysia_tech_stack, plan_bun_elysia_db_schema, plan_bun_elysia_api_design, plan_bun_elysia_implementation_plan [EXTRACTED 1.00]

## Communities

### Community 0 - "Project Specifications"
Cohesion: 0.33
Nodes (6): API Design, Database Schema, Implementation Plan, Micro-SaaS para Lava-Jatos, Tech Stack, Next.js Project

### Community 1 - "UI Table Components"
Cohesion: 0.4
Nodes (0): 

### Community 2 - "Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 3 - "UI Button Component"
Cohesion: 1.0
Nodes (0): 

### Community 4 - "Utilities"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "TS Env Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Drizzle Config"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Next Config"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Data Table Component"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "DB Connection"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "DB Schema"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **5 isolated node(s):** `Next.js Project`, `Tech Stack`, `Database Schema`, `API Design`, `Implementation Plan`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Root Layout`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Button Component`** (2 nodes): `cn()`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utilities`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TS Env Definitions`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drizzle Config`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Table Component`** (1 nodes): `data-table.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB Connection`** (1 nodes): `db.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB Schema`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Next.js Project`, `Tech Stack`, `Database Schema` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._