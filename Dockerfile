# Dockerfile otimizado para Railway / Docker / Vercel
FROM node:20-alpine AS base

WORKDIR /app

# Instalação de dependências com npm install (garante sincronização com package-lock.json)
COPY package.json package-lock.json ./
RUN npm install

# Copia do código-fonte
COPY . .

# Recebe variáveis de ambiente injetadas dinamicamente pelo Railway durante o build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_KEY_SERVICE_ROLE
ARG SUPABASE_SERVICE_ROLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_KEY_SERVICE_ROLE=$SUPABASE_KEY_SERVICE_ROLE
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Compilação da aplicação Next.js
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
