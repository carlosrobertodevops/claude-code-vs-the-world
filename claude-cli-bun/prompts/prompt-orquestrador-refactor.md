# Prompt Orquestrador - Migração Winston → Pino

Você é o orquestrador desta migração.
Sua função é coordenar e consolidar - não implementar diretamente.

## Contexto

Estamos migrando de `winston` para `pino` em todos os módulos do projeto em `projeto-refatoracao/`.
O guia de migração está em `projeto-refatoracao/docs/migration/winston-to-pino.md`.
O mapa de território e as regras estão em `projeto-refatoracao/CLAUDE.md`.

Cada módulo em `src/modules/` é independente dos outros para esta migração - nenhum módulo importa logger de outro módulo.

## Pré-condições (verificar antes de disparar subagentes)

1. O arquivo `docs/migration/winston-to-pino.md` existe e está legível
2. Os 6 módulos existem em `src/modules/`
3. Confirmar que nenhum módulo importa logger de outro (independência garantida)

## Tarefas paralelas - use a Task tool para criar 6 subagentes simultaneamente

> Ao criar cada subagente com a Task tool, passar `allowed_tools: ['Read", "Write", "Edit", "Bash"]`
> para garantir que eles possam ler e escrever arquivos de forma autônoma.

### Subagente 1 - Módulo auth

**Escopo exclusivo**: `src/modules/auth/`

**Tarefa**:
Migre todas as ocorrências de `winston` para `pino` nos arquivos do módulo.
Siga o guia em `docs/migration/winston-to-pino.md` para todos os padrões.

**Restrições**:

- Operar apenas nos arquivos de `src/modules/auth/`
- Não modificar `package.json`
- Se encontrar padrão não coberto pelo guia: adaptar, adicionar comentário `// REVISAO: padrão adaptado de winston` e registrar no relatorio

---

### Subagente 2 - Módulo users

**Escopo exclusivo**: `src/modules/users/`

**Tarefa**:
Migre todas as ocorrêfcias de 'winston" para 'pino' nos arquivos
do módulo. Siga o guia em `docs/migration/winston-to-pino.md`

**Restrições**: mesmas do Subagente 1, aplicadas a `src/modules/users/`

---

### Subagente 3 - Módulo products

**Escopo exclusivo**: `src/modules/products/`

**Tarefa**: Migre todas as ocorrências de `winston` para `pino` nos arquivos do módulo.
Siga o guia em `docs/migration/winston-to-pino.md`.

**Restrições**: mesmas do Subagente 1, aplicadas a `src/modules/products/`

---

### Subagente 4 - Módulo orders

**Escopo exclusivo**: `src/modules/orders/`

**Tarefa**:
Migre todas as ocorrências de `winston` para `pino` nos arquivos do módulo.
Siga o guia em `docs/migration/winston-to-pino.md`.

**Restrições**: mesmas do Subagente 1, aplicadas a `src/modules/orders/`

---

### Subagente 5 - Módulo payments

**Escopo exclusivo**: `src/modules/payments/`

**Tarefa**:
Migre todas as ocorrências de 'winston" para "pino" nos arquivos do módulo.
Siga o guia em `docs/migration/winston-to-pino.md`.

**Restrições**: mesmas do Subagente 1, aplicadas a "src/modules/payments/'

--

### Subagente 6 - Módulo notifications

**Escopo exclusivo**: `src/modules/notifications`

**Tarefa**:
Migre todas as ocorrências de `winston` para `pino` nos arquivos do módulo.
Siga o guia em `docs/migration/winston-to-pino.md`.

**Restrições**: mesmas do Subagente 1, aplicadas a `src/modules/notifications`

---

## Após todos os 6 subagentes terminarem

Apresente um **relatório estruturado** com:

```md
## Relatório de Migração - Winston → Pino

### Resumo

- Módulos migrados: X/6
- Arquivos modificados: X
- Chamadas de log migradas: ~X (estimativa)

### Detalhes por módulo

**auth** (src/modules/auth/\*):

- Arquivos modificados: [lista]
- Padrões migrados: info(X) warn(X) error(X) debug (X)
- Decisões fora do guia: [nenhuma | lista]

**users** (`src/modules/users/`):
[idem]
[... repete para todos os 6 módulos ...]

### Decisões tomadas sem instrução explícita no guia

| Módulo | Padrão Winston | Solução adotada | Arquivo: Linha |
| ------ | -------------- | --------------- | -------------- |
| ...    | ...            | ...             | ...            |

### Próximos passos manuais

1. Atualizar `package. json`: remover `winston`, adicionar `pino` e `pino-pretty`
2. Rodar `npm install`
3. Testar cada módulo individualmente
4. Revisar os casos marcados como "REVISAR" (listados acima)
```

**NÃO atualizar `package.json`** - isso deve ser feito manualmente após revisar o relatório.
