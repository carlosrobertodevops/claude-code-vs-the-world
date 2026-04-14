# Prompt Orquestrador - projeto

Você é o orquestrador desta feature. Sua função é planejar, de legar e consolidar - não implementar diretamente.

## Contexto

Estamos implementando autenticação Auth no projeto em `projeto-oauth/`.
contrato da API já está definido em `projeto-oauth/docs/api/auth.md`.
O mapa de território e as regras estão em `projeto-oauth/CLAUDE.md`.

## Pré-condições (verificar antes de disparar subagentes)

1. O arquivo `docs/api/auth.md` existe e está legível
2. O arquivo `src/types/OAuthProvider.ts` existe (tipo compartilhado)
3. Os escopos abaixo não se sobrepõem - confirmar antes de prosseguir

## Tarefas paralelas - use a Task tool para criar 3 subagentes simultaneamente

> Ao criar cada subagente com a Task tool, passar `allowed_tools: ["Read", "Write", "Edit", "Bash"]`
> para garantir que eles possam ler e escrever arquivos de forma autônoma.

### Subagente 1 - Backend

**Escopo exclusivo**: `src/api/auth.ts` e `src/middleware/oauth.ts`

**Tarefa**:
Implemente o endpoint `POST /auth/oauth` no arquivo `src/api/auth.ts`, seguindo exatamente o contrato em `docs/api/auth.md`.
Implemente também o middleware em `src/middleware/oauth.ts` que:

- Valida o `code`
  OAuth com o provider (Google ou Github)
- Troca o code por um access token do provider
- Busca os dados do usuário no provider
- Retorna os dados no formato "User de `src/types/User.ts`

**Restrições**:

- Não modificar nenhum outro arquivo além dos dois do escopo
- Usar o tipo `AuthProvider` de `src/types/OAuthProvider.ts` - não recriar
- Usar as variáveis de ambiente de `src/config/env.ts` - não hardcodar credenciais
- Para o provider real, pode usar fetch nativo (sem dependências extras)

---

### Subagente 2 - Frontend

**Escopo exclusivo**: src/components/auth/ (apenas criar novos arquivos - não modificar 'LoginForm.tsx')

**Tarefa**:
Crie o componente `src/components/auth/0AuthButton.tsx` que:

- Recebe como props: `provider: OAuthProvider` e `onSuccess: (token: string) => void`
- Exibe um botão com o nome do provider ("Entrar com Google" / "Entrar com GitHub")
- Ao clicar, inicia o fluxo OAuth (redireciona para o endpoint de autorização do provider)
- Faz a chamada `POST /auth/oauth` com o `code` retornado
- Chama
  `onSuccess (token)` em caso de sucesso
- Exibe estado de loading e mensagem de erro em caso de falha

**Restrições**:

- Usar o contrato de `POST /auth/oauth` de `docs/api/auth.md` para a chamada
- Usar mock da resposta da API (não depender da implementação real do backend)
- Importar "AuthProvider' de `src/types/0AuthProvider.ts` - não redefinir
- Não modificar 'LoginForm. tsx'

---

### Subagente 3 - Testes

**Escopo exclusivo**: `tests/components/auth/`

**Tarefa**:
Crie testes unitários para `AuthButton` em `tests/components/auth/0AuthButton.test.tsx`.

Casos a cobrir:

1. Renderiza o botão com o nome correto do provider ("Entrar com Google")
2. Exibe estado de loading após o clique
3. Chama `onSuccess` com o token quando a API retorna sucesso (mock da API)
4. Exibe mensagem de erro quando a API retorna erro (mock da API)
5. Exibe mensagem de erro quando o provider está indisponível

**Restrições**:

- Apenas testes unitários - sem testes de integração real com a API
- Usar `@testing-library/react` e mocks do `fetch` nativo
- Basear os mocks no contrato de `docs/api/auth.md` - não assumir implementação interna
- Não criar testes para `LoginForm.tsx`

## Após os 3 subagentes

terminarem Apresente um **relatório estruturado** com:

```
## Relatório de Integração - Feature 0Auth

### 0 que foi implementado

**Backend**:
- [lista dos arquivos criados/modificados]
- [resumo do que foi implementado]

**Frontend**:
- [lista dos arquivos criados]
- [resumo do que foi implementado]

**Testes**:
- [lista dos arquivos criados]
- [casos de teste cobertos]

### Pontos de integração manual necessários

1. [descrição do ponto - por que precisa de atenção humana]
2. ...

### Decisões tomadas sem instrução explícita

```
