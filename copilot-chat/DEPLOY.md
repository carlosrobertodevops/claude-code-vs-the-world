# Deploy - AquaFlow

## Deploy com Docker Compose (Recomendado)

### 1. Preparar ambiente

```bash
cp .env.example .env
```

Edite o `.env` com as configuracoes de producao:

```env
DATABASE_URL="postgresql://aquaflow:SENHA_SEGURA@db:5432/aquaflow?schema=public"
NEXTAUTH_SECRET="gere-uma-chave-com-openssl-rand-base64-32"
NEXTAUTH_URL="https://seudominio.com"
```

### 2. Subir todos os servicos

```bash
docker compose up -d --build
```

Isso vai iniciar:

- **db**: PostgreSQL 17 (porta 5435)
- **minio**: MinIO para armazenamento de arquivos (portas 9000/9001)
- **app**: Aplicacao Next.js (porta 3000)

### 3. Executar migracoes

```bash
docker compose exec app npx prisma migrate deploy
```

### 4. Popular banco (opcional)

```bash
docker compose exec app npx tsx prisma/seed.ts
```

## Deploy Manual (VPS/Servidor)

### 1. Instalar dependencias

```bash
npm ci
```

### 2. Configurar banco de dados

Instale PostgreSQL 17 e crie o banco:

```sql
CREATE USER aquaflow WITH PASSWORD 'sua_senha';
CREATE DATABASE aquaflow OWNER aquaflow;
```

### 3. Migrar banco

```bash
npx prisma migrate deploy
```

### 4. Build de producao

```bash
npm run build
```

### 5. Iniciar servidor

```bash
npm run start
```

Use um process manager como PM2:

```bash
pm2 start npm --name "aquaflow" -- start
```

### 6. Proxy reverso (Nginx)

```nginx
server {
    listen 80;
    server_name seudominio.com;

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
    }
}
```

## Variaveis de Ambiente

| Variavel         | Descricao                 | Exemplo                             |
| ---------------- | ------------------------- | ----------------------------------- |
| DATABASE_URL     | URL de conexao PostgreSQL | postgresql://user:pass@host:5432/db |
| NEXTAUTH_SECRET  | Chave secreta para JWT    | (gere com openssl rand -base64 32)  |
| NEXTAUTH_URL     | URL publica da aplicacao  | https://seudominio.com              |
| MINIO_ENDPOINT   | Endereco do MinIO         | localhost                           |
| MINIO_PORT       | Porta do MinIO            | 9000                                |
| MINIO_ACCESS_KEY | Chave de acesso MinIO     | minioadmin                          |
| MINIO_SECRET_KEY | Chave secreta MinIO       | minioadmin                          |

## Checklist de Producao

- [ ] Alterar senhas padrao do banco e MinIO
- [ ] Gerar NEXTAUTH_SECRET seguro
- [ ] Configurar HTTPS (Let's Encrypt / Certbot)
- [ ] Configurar backups do PostgreSQL
- [ ] Configurar firewall (apenas portas 80/443 expostas)
- [ ] Remover dados de seed ou criar usuario administrador real
