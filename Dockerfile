# 1. Base image usando Node 22 (Debian Slim)
FROM node:22-slim AS base

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 2. Dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

# Usa npm install para aceitar as alterações do package.json e instala os binários ARM64
RUN npm install --include=optional
RUN npm install lightningcss-linux-arm64-gnu @tailwindcss/oxide-linux-arm64-gnu --no-save

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Garante que a pasta public exista para a etapa final
RUN mkdir -p public

ENV TAILWIND_DISABLE_LIGHTNINGCSS=1
ENV NEXT_TELEMETRY_DISABLED=1

# Gera o Prisma Client se o arquivo schema existir
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Compila o Next.js
RUN npm run build

# 4. Runner (Imagem de execucao)
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
