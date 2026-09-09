# Configuração do Supabase

Este app usa Supabase com RLS ativado e funciona em dois ambientes: **Vercel** e **Docker**.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave anon para uso no frontend (pública, pode ser exposta)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Service role key para uso no backend (APENAS server-side)
# Pode ser substituída por SUPABASE_API_SECRET para uma senha única
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# OU use uma senha única para o backend (recomendado)
SUPABASE_API_SECRET=secret
```

## Como Funciona

### Frontend (Cliente Anon)
- Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Acesso público, sujeito a RLS
- Usado para leituras e operações permitidas pelas policies

### Backend (Service Role)
- Usa `SUPABASE_API_SECRET` ou `SUPABASE_SERVICE_ROLE_KEY`
- Acesso administrativo, bypassa RLS
- Usado apenas em API Routes (server-side)
- **Nunca exponha essas chaves no frontend**

## Ambientes

### Vercel
Configure as variáveis de ambiente no dashboard da Vercel:
1. Vá em Settings > Environment Variables
2. Adicione todas as variáveis listadas acima
3. Deploy

### Docker
Use variáveis de ambiente no docker-compose ou docker run:

```bash
docker run -e NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key \
  -e SUPABASE_API_SECRET=secret \
  seu-app
```

Ou no docker-compose.yml:
```yaml
services:
  app:
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_API_SECRET=${SUPABASE_API_SECRET}
```

## RLS (Row Level Security)

O banco de dados está com RLS ativado em todas as tabelas do módulo Gabinete.

**Políticas configuradas:**
- Usuários autenticados podem ver, criar, atualizar e excluir registros
- Service role bypassa todas as policies (uso em API Routes)

**Para adicionar novas tabelas ao RLS:**
Execute o script SQL em `supabase/rls_policies.sql` no Supabase Dashboard.

## API Routes

As operações de escrita (CREATE, UPDATE, DELETE) usam API Routes que chamam o `supabaseAdmin`:

- `POST /api/gabinete/agendas` - Criar agenda
- `PATCH /api/gabinete/agendas/[id]` - Atualizar agenda
- `DELETE /api/gabinete/agendas/[id]` - Excluir agenda

Isso garante que:
1. RLS permanece ativado
2. Service role key não é exposta no frontend
3. Funciona em Vercel e Docker

## Segurança

- **NUNCA** commite o arquivo `.env.local`
- **NUNCA** exponha `SUPABASE_SERVICE_ROLE_KEY` ou `SUPABASE_API_SECRET` no frontend
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` apenas para dados públicos
- Use API Routes para operações sensíveis
