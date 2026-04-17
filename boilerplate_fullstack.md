# 🚀 Fullstack Boilerplate Moderno

## Stack
- Next.js
- Bun
- Elysia
- Drizzle ORM
- PostgreSQL (db)
- MinIO
- Docker

## Estrutura
```
apps/
  web/
  api/
packages/
  db/
  shared/
docker-compose.yml
.env
```

## .env
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/app
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio123
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=app-bucket
API_PORT=3333
```

## docker-compose.yml
```yaml
version: "3.9"
services:
  app:
    build: .
    depends_on:
      - db
      - minio
    ports:
      - "3000:3000"
      - "3333:3333"
    env_file:
      - .env

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9000:9000"
      - "9001:9001"
```

## Backend (Elysia)
```ts
import { Elysia } from 'elysia'

new Elysia()
  .get('/', () => 'API OK')
  .listen(3333)
```

## ORM (Drizzle)
```ts
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(client)
```

## Frontend (Next.js)
```tsx
export default function Home() {
  return <h1>App 🚀</h1>
}
```

## Rodar
```
bun install
docker-compose up -d
bun run dev
```
