# 1. Base image usando Node 22 (Debian Slim)
FROM node:22-slim AS base

RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# 2. Dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa telemetria e otimizações nativas
ENV TAILWIND_DISABLE_LIGHTNINGCSS=1
ENV NEXT_TELEMETRY_DISABLED=1

# 🛠️ FIX DEFINITIVO PARA ARM64:
# Baixa diretamente o binario nativo linux-arm64-gnu do lightningcss para dentro da pasta node_modules
RUN mkdir -p node_modules/lightningcss/node && \
    curl -fL https://unpkg.com/lightningcss-linux-arm64-gnu@1.29.1/lightningcss.linux-arm64-gnu.node \
    -o node_modules/lightningcss/node/lightningcss.linux-arm64-gnu.node || true

# Gera o Prisma Client
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Compila o Next.js
RUN npm run build

# 4. Runner (Imagem final de produção)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]