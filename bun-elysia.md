# Bun e Elysia

## Pergunta:

Revise todo projeto. com base no codebase em ./.planning/codebase/\*.md, e quais as sujetões para mudar as stacks atuais no projeto como:
`prisma orm` e `npm`, para as stackes `bun`, `drizzle orm` e `elysia api`.
E se caso eu aprove vc já faz todo mundança n projeto.

## Respostas:

Perfeito — revisei o projeto com base nos docs em .planning/codebase/\*.md e no código atual.

- O backend hoje está fortemente acoplado ao Next App Router + Route Handlers (src/app/api/\*\*/route.ts) com Prisma direto em 28 arquivos (ex.: src/app/api/contratos/route.ts, src/app/api/orcamentos/route.ts, src/lib/auth.ts).
- A autenticação usa NextAuth + Prisma Adapter (@auth/prisma-adapter) em src/lib/auth.ts, então trocar ORM impacta auth.
- Build/deploy atual assume npm + Prisma CLI (package.json scripts db:\*) e Dockerfile com npx prisma generate.
- Segundo docs do Next 16, custom server não combina com standalone output; isso afeta uma migração “total” para Elysia no mesmo processo do Next.
  Sugestões de migração (Bun + Drizzle + Elysia)

1. Incremental (recomendado)

- Fase 1: npm -> bun (gerenciador de pacotes e scripts), sem trocar arquitetura HTTP.
- Fase 2: Prisma -> Drizzle dentro do Next (Route Handlers continuam), com adapter de auth para Drizzle (@auth/drizzle-adapter).
- Fase 3: extrair APIs estratégicas para Elysia (ex.: relatórios/serviços mais quentes), mantendo Next como BFF/UI.
- Vantagem: menor risco, rollback simples, entrega contínua.

2. Migração completa direta (alto risco)

- Remover Route Handlers do Next e mover tudo para Elysia de uma vez.
- Reescrever camada de dados inteira para Drizzle.
- Ajustar auth, upload, PDF e deploy no mesmo ciclo.
- Vantagem: chega no alvo final rápido; desvantagem: risco alto de regressão e parada longa.

3. Híbrido por domínio

- Elysia primeiro para domínios isolados (ex.: inventário/relatórios), Next API restante continua temporariamente.
- Drizzle já nasce no Elysia; depois converte restante do Next.
- Vantagem: valida Elysia cedo com menos impacto.
  Recomendação prática para este projeto
- Seguir opção 1 (incremental), porque:
- há muito acoplamento atual em src/app/api/\*\* + src/lib/prisma.ts;
- auth depende de adapter de ORM;
- deploy usa standalone de Next (next.config.ts + Dockerfile), que conflita com custom server total.
  Se você aprovar, eu já executo a mudança completa em fases no projeto, começando por Bun + Drizzle mantendo Next API, e depois parto para Elysia com corte controlado.
  Escolha uma opção para eu iniciar:

1. Incremental (recomendada)
2. Completa direta
3. Híbrida por domínio
