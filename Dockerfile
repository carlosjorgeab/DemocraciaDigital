# 1. Base image usando Node 22 (exigido pelo Prisma 7 e Supabase v2)
FROM node:22-slim AS base

# Instala OpenSSL exigido pelo engine do Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

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

# Desativa o LightningCSS e envia flags de build do Next
ENV TAILWIND_DISABLE_LIGHTNINGCSS=1
ENV NEXT_TELEMETRY_DISABLED=1

# Gera o Prisma Client se o schema existir
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

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]