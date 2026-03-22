# AquaWash - Guia de Deploy

## Pre-requisitos

- Docker (v24+)
- Docker Compose (v2+)
- Git

## 1. Clonar o repositorio

```bash
git clone <url-do-repositorio> aquawash
cd aquawash
```

## 2. Configurar variaveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` com os valores de producao:

```env
# Banco de dados (usado pelo app dentro do Docker)
DATABASE_URL="postgresql://aquawash:SUA_SENHA_SEGURA@postgres:5432/aquawash?schema=public"

# Autenticacao
AUTH_SECRET="gere-uma-string-aleatoria-de-32-caracteres"
AUTH_URL="https://seu-dominio.com.br"

# Postgres (usado pelo container)
POSTGRES_USER=aquawash
POSTGRES_PASSWORD=SUA_SENHA_SEGURA
POSTGRES_DB=aquawash
```

Para gerar o AUTH_SECRET:

```bash
openssl rand -base64 32
```

## 3. Iniciar os servicos

```bash
docker compose up -d
```

Isso vai iniciar:

- **postgres**: Banco de dados PostgreSQL 17
- **minio**: Armazenamento de objetos (opcional, para uploads)
- **app**: Aplicacao Next.js na porta 3000

Verifique se todos os containers estao rodando:

```bash
docker compose ps
```

## 4. Executar as migrations

```bash
docker compose exec app npx prisma migrate deploy
```

## 5. Executar o seed (opcional)

O seed popula o banco com dados iniciais para demonstracao:

```bash
docker compose exec app npx tsx prisma/seed.ts
```

Credenciais criadas pelo seed:

| Usuario | Email | Senha |
|---------|-------|-------|
| Admin | admin@aquawash.com | password123 |
| Joao | joao@aquawash.com | password123 |
| Maria | maria@aquawash.com | password123 |

**Importante:** troque as senhas apos o primeiro login em producao.

## 6. Configurar reverse proxy (producao)

Para producao, configure um reverse proxy (Nginx, Caddy ou Traefik) com HTTPS.

### Exemplo com Nginx

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
```

### Exemplo com Caddy (alternativa mais simples)

```
seu-dominio.com.br {
    reverse_proxy localhost:3000
}
```

O Caddy gerencia certificados SSL automaticamente.

## 7. Acessar a aplicacao

- **Desenvolvimento:** http://localhost:3000
- **Producao:** https://seu-dominio.com.br

## Comandos uteis

```bash
# Ver logs da aplicacao
docker compose logs -f app

# Ver logs do banco
docker compose logs -f postgres

# Reiniciar a aplicacao
docker compose restart app

# Parar tudo
docker compose down

# Parar e remover volumes (apaga dados)
docker compose down -v

# Rebuild apos mudancas no codigo
docker compose up -d --build app
```

## Atualizacao

Para atualizar a aplicacao com novas versoes:

```bash
git pull
docker compose up -d --build app
docker compose exec app npx prisma migrate deploy
```

## Troubleshooting

**Container app nao inicia:**
Verifique se o Postgres esta acessivel e se o DATABASE_URL esta correto.

```bash
docker compose logs app
```

**Erro de conexao com o banco:**
Certifique-se de que o container do Postgres iniciou antes do app.

```bash
docker compose restart app
```

**Uploads nao funcionam:**
Verifique se o diretorio `public/uploads` existe e tem permissao de escrita.

```bash
docker compose exec app ls -la public/uploads
```
