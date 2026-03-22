# AquaWash - Guia de Deploy

## Pré-requisitos

- Docker e Docker Compose instalados
- Domínio configurado (opcional, mas recomendado)

## Passos

### 1. Clone o repositório

```bash
git clone <repo-url>
cd aquawash
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
- `DATABASE_URL` - URL do PostgreSQL
- `NEXTAUTH_SECRET` - Gere com `openssl rand -base64 32`
- `NEXTAUTH_URL` - URL pública da aplicação

### 3. Inicie os serviços

```bash
docker compose up -d
```

### 4. Execute as migrations

```bash
docker compose exec app npx prisma migrate deploy
```

### 5. (Opcional) Carregue dados de teste

```bash
docker compose exec app npx prisma db seed
```

### 6. Acesse a aplicação

Abra `http://localhost:3000` no navegador.

**Credenciais padrão (seed):**
- Admin: `admin@aquawash.com` / `password123`
- Funcionário 1: `joao@aquawash.com` / `password123`
- Funcionário 2: `maria@aquawash.com` / `password123`

### 7. Configure reverse proxy (produção)

Configure Nginx ou Caddy com SSL apontando para `localhost:3000`.

Exemplo com Caddy:
```
aquawash.seudominio.com {
  reverse_proxy localhost:3000
}
```

## Healthcheck

```bash
curl http://localhost:3000/api/auth/session
```
