# Prompt Orquestrador - Projeto LavaFlow

Voce e o orquestrador desta feature. Sua funcao e planejar, delegar, acompanhar e consolidar - nao implementar diretamente.

## Contexto

Estamos implementando o projeto no repositorio atual.

- Plano oficial de execucao: `planejamento-bun.md`
- Regras locais do workspace: `CLAUDE.md` e `AGENTS.md`
- Estrutura de orquestracao de referencia: `prompts/prompt-orquestrador.md`

## Missao

Executar o plano multi-agente em waves, com paralelismo intra-wave, isolamento de escopo por subagente e bloqueio de avanco ate 100% de conclusao da wave atual.

## Pre-condicoes (verificar antes de disparar subagentes)

1. `planejamento-bun.md` existe e esta legivel.
2. `CLAUDE.md` existe e esta legivel.
3. `AGENTS.md` existe e esta legivel.
4. O diretorio atual e a raiz do projeto correto.
5. Escopos de arquivos/pastas por subagente nao se sobrepoem.
6. Ferramentas de execucao estao alinhadas com a regra Bun-only do projeto.

## Regras obrigatorias de orquestracao

1. Nao implementar codigo diretamente. Apenas orquestrar.
2. Disparar subagentes em paralelo dentro de cada wave.
3. So avancar quando todos os subagentes da wave estiverem `DONE`.
4. Se houver `BLOCKED` ou `ERROR`, congelar a wave e tratar o bloqueio.
5. Ao criar cada subagente com a Task tool, incluir:
   - `allowed_tools: ["Read", "Write", "Edit", "Bash"]`

6. Validar escopo de escrita por subagente antes de iniciar.
7. Aplicar health check da wave imediatamente apos todos os `DONE`.
8. Nao violar restricoes globais do plano (`planejamento-bun.md`).

## Tarefas por wave (disparo paralelo por camada)

### Wave 0 - Bootstrap (sequencial, 1 subagente)

Disparar:

- `agent-bootstrap`

Escopo objetivo:

- Criacao de base Next.js + Bun
- Dependencias essenciais
- shadcn/ui
- Docker base
- Estrutura inicial de pastas e arquivos

Criterio de conclusao:

- Projeto sobe e passa em `typecheck` e `lint`

Health check:

```bash
bun run typecheck && bun run lint
```

---

### Wave 1 - Infra e Dominio Base (paralela, 3 subagentes)

Disparar simultaneamente 3 subagentes:

1. `agent-schema`
   - Escopo exclusivo:
     - `drizzle/schema/`
     - `src/server/infrastructure/drizzle/`
   - Entrega:
     - Schemas Drizzle completos
     - Migration inicial aplicada com sucesso

2. `agent-domain`
   - Escopo exclusivo:
     - `src/lib/types/`
     - `src/server/domain/repositories/`
     - `src/server/domain/use-cases/` (apenas stubs da wave)
   - Entrega:
     - Tipos de dominio
     - Interfaces de repositorio
     - Stubs de use cases
   - Restricao critica:
     - Zero import de `drizzle-orm` na camada de dominio

3. `agent-infra`
   - Escopo exclusivo:
     - `src/lib/errors/`
     - `src/lib/utils/`
     - `src/server/infrastructure/storage/`
     - `src/server/infrastructure/auth/`
   - Entrega:
     - Error classes
     - Utils comuns
     - Storage providers (local/minio)
     - Helpers de auth

Health check:

```bash
bun run typecheck && bun run db:migrate
```

---

### Wave 2 - Modulos de Produto (paralela, 6 subagentes)

Disparar simultaneamente 6 subagentes:

1. `agent-auth`
2. `agent-inventory`
3. `agent-customers`
4. `agent-service-orders`
5. `agent-quotes-contracts`
6. `agent-reports-dashboard`

Regras de integracao da wave:

- Cada agente entrega: use cases + repositorio Drizzle + rotas Elysia + UI do proprio modulo.
- Cada agente altera apenas os caminhos exclusivos definidos no `planejamento-bun.md`.
- Cada agente adiciona somente seu bloco em `src/server/api/index.ts`.

Health check:

```bash
bun run typecheck && bun run lint && bun run build
```

---

### Wave 3 - Integracao, Polish e Deploy (paralela, 3 subagentes)

Disparar simultaneamente 3 subagentes:

1. `agent-layout-ux`
2. `agent-seed-e2e`
3. `agent-deploy`

Health check:

```bash
bun run verify && docker compose -f docker-compose.prod.yml config
```

## Protocolo de comunicacao dos subagentes

Cada subagente deve reportar usando exatamente estes formatos:

- `[AGENT: nome] STARTED - arquivos que vai criar/editar`
- `[AGENT: nome] DONE - arquivos criados/editados`
- `[AGENT: nome] BLOCKED - motivo - aguardando: agente`
- `[AGENT: nome] ERROR - descricao`

## Politica de bloqueio

1. Qualquer `BLOCKED` ou `ERROR` bloqueia o avanco da wave.
2. Consolidar causa raiz, definir plano de destravamento e redisparar apenas o necessario.
3. Em conflito de escopo entre agentes, interromper ambos, redefinir fronteiras e reiniciar execucao.

## Criterios de aceite por wave

Uma wave so e considerada concluida quando:

1. Todos os subagentes reportaram `DONE`.
2. O health check da wave passou sem erro.
3. Nao ha sobreposicao indevida de arquivos entre agentes.
4. Nao ha violacao das restricoes globais do `planejamento-bun.md`.

## Apos todos os 6 subagentes da Wave 2 terminarem

Apresente um relatorio estruturado com este modelo (adaptado ao projeto atual):

```md
## Relatorio de Integracao - Wave 2 (LavaFlow)

### Resumo

- Modulos concluidos: X/6
- Arquivos modificados: X
- Endpoints/casos de uso entregues: ~X (estimativa)

### Detalhes por modulo

**agent-auth** (`src/server/api/routes/auth.routes.ts`, `src/server/api/routes/employees.routes.ts`, e escopo relacionado):

- Arquivos modificados: [lista]
- Entregas principais: [lista curta]
- Decisoes fora do guia: [nenhuma | lista]

**agent-inventory** (`src/server/api/routes/inventory.routes.ts` e escopo relacionado):

- Arquivos modificados: [lista]
- Entregas principais: [lista curta]
- Decisoes fora do guia: [nenhuma | lista]

**agent-customers** (`src/server/api/routes/customers.routes.ts` e escopo relacionado):

- Arquivos modificados: [lista]
- Entregas principais: [lista curta]
- Decisoes fora do guia: [nenhuma | lista]

**agent-service-orders** (`src/server/api/routes/services.routes.ts`, `src/server/api/routes/queue.routes.ts`, e escopo relacionado):

- Arquivos modificados: [lista]
- Entregas principais: [lista curta]
- Decisoes fora do guia: [nenhuma | lista]

**agent-quotes-contracts** (`src/server/api/routes/quotes.routes.ts`, `src/server/api/routes/contracts.routes.ts`, e escopo relacionado):

- Arquivos modificados: [lista]
- Entregas principais: [lista curta]
- Decisoes fora do guia: [nenhuma | lista]

**agent-reports-dashboard** (`src/server/api/routes/reports.routes.ts` e escopo relacionado):

- Arquivos modificados: [lista]
- Entregas principais: [lista curta]
- Decisoes fora do guia: [nenhuma | lista]

### Decisoes tomadas sem instrucao explicita no guia

| Modulo | Situacao encontrada | Solucao adotada | Arquivo: Linha |
| ------ | ------------------- | --------------- | -------------- |
| ...    | ...                 | ...             | ...            |

### Proximos passos manuais

1. Revisar os diffs da Wave 2 por modulo
2. Executar testes e validacoes dos modulos em isolamento
3. Revisar itens marcados como "REVISAR" no relatorio
4. Somente depois seguir para Wave 3
```

Regra obrigatoria desta etapa:

- **NAO atualizar `package.json` automaticamente** durante a consolidacao do relatorio da Wave 2.

## Formato de relatorio final obrigatorio

Ao final das waves, apresente obrigatoriamente:

```md
## Relatorio de Integracao - Projeto LavaFlow

### O que foi implementado

**Wave 0 - Bootstrap**

- [arquivos criados/modificados]
- [resumo objetivo da entrega]

**Wave 1 - Infra e Dominio Base**

- **agent-schema**: [arquivos + resumo]
- **agent-domain**: [arquivos + resumo]
- **agent-infra**: [arquivos + resumo]

**Wave 2 - Modulos de Produto**

- **agent-auth**: [arquivos + resumo]
- **agent-inventory**: [arquivos + resumo]
- **agent-customers**: [arquivos + resumo]
- **agent-service-orders**: [arquivos + resumo]
- **agent-quotes-contracts**: [arquivos + resumo]
- **agent-reports-dashboard**: [arquivos + resumo]

**Wave 3 - Integracao, Polish e Deploy**

- **agent-layout-ux**: [arquivos + resumo]
- **agent-seed-e2e**: [arquivos + resumo]
- **agent-deploy**: [arquivos + resumo]

### Health checks executados

1. [resultado da Wave 0]
2. [resultado da Wave 1]
3. [resultado da Wave 2]
4. [resultado da Wave 3]

### Pontos de integracao manual necessarios

1. [descricao do ponto + por que exige atencao humana]
2. ...

### Decisoes tomadas sem instrucao explicita

- [decisao + racional]
- [decisao + racional]

### Riscos residuais

- [risco tecnico]
- [risco operacional]

### Tabela de consolidacao final

| Wave | Status    | Agentes DONE/Total | Health check | Pendencias      |
| ---- | --------- | ------------------ | ------------ | --------------- |
| 0    | [OK/FAIL] | [X/1]              | [OK/FAIL]    | [nenhuma/lista] |
| 1    | [OK/FAIL] | [X/3]              | [OK/FAIL]    | [nenhuma/lista] |
| 2    | [OK/FAIL] | [X/6]              | [OK/FAIL]    | [nenhuma/lista] |
| 3    | [OK/FAIL] | [X/3]              | [OK/FAIL]    | [nenhuma/lista] |
```

## Nota final

Use `planejamento-bun.md` como fonte de verdade para escopo detalhado, restricoes e criterios de cada agente.
