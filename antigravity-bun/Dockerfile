# Usar a imagem oficial do Bun
FROM oven/bun:latest as base

WORKDIR /app

# Instalar dependências
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copiar resto do código
COPY . .

# Construir a aplicação Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Expor porta
EXPOSE 3000

# Iniciar servidor
CMD ["bun", "run", "start"]
