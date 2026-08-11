# Dockerfile otimizado para Railway / Docker
FROM node:20-alpine AS base

WORKDIR /app

# Instalação de dependências com npm install para garantir sincronização
COPY package.json package-lock.json ./
RUN npm install

# Copia do código-fonte
COPY . .

# Variáveis de ambiente como NEXT_PUBLIC_SUPABASE_URL, SUPABASE_KEY_SERVICE_ROLE e SUPABASE_SERVICE_ROLE_KEY
# são injetadas dinamicamente pelo ambiente de hospedagem (Railway / Cloud Run) no build/runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Compilação da aplicação
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
