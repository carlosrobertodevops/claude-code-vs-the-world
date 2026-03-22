# Deploy do JatoFlow

## Requisitos

- Node.js 22+
- PostgreSQL 17
- Bucket S3-compatible opcional para uploads em producao
- Variaveis de ambiente configuradas

## Variaveis importantes

Copie de `.env.example` e ajuste para seu ambiente:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `STORAGE_PROVIDER`
- `S3_*` se usar MinIO, Cloudflare R2, Wasabi ou compativel

## Deploy com Docker

1. Gere a imagem:

```bash
docker build -t jatoflow .
```

2. Rode a migration antes de subir a aplicacao:

```bash
npx prisma migrate deploy
npm run db:seed
```

3. Suba o container:

```bash
docker run --env-file .env -p 3000:3000 jatoflow
```

## Deploy sem Docker

1. Instale dependencias:

```bash
npm ci
```

2. Gere o Prisma Client:

```bash
npm run db:generate
```

3. Execute migrations:

```bash
npx prisma migrate deploy
```

4. Gere o build:

```bash
npm run build
```

5. Suba o servidor:

```bash
npm run start
```

## MinIO em producao/local homologacao

Se quiser simular storage S3 localmente:

```bash
docker compose up -d minio
```

Console do MinIO: `http://localhost:9001`

## Checklist recomendado

- Definir `AUTH_SECRET` forte
- Garantir backup do PostgreSQL
- Configurar bucket privado/publico conforme necessidade
- Revisar dominios em `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL`
- Aplicar `migrate deploy` a cada release
- Opcional: usar reverse proxy com HTTPS
