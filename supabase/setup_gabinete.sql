-- Script SQL para criar tabelas do Gabinete Parlamentar
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Criar tabela de logs_auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_deputado UUID,
  usuario_id UUID,
  usuario_nome VARCHAR(255) NOT NULL,
  usuario_email VARCHAR(255) NOT NULL,
  usuario_cargo VARCHAR(100),
  acao VARCHAR(50) NOT NULL,
  entidade VARCHAR(50) NOT NULL,
  entidade_id VARCHAR(255),
  descricao TEXT NOT NULL,
  detalhes JSONB,
  severidade VARCHAR(20) DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_deputado ON logs_auditoria(id_deputado);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_entidade ON logs_auditoria(entidade);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_acao ON logs_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_created_at ON logs_auditoria(created_at DESC);

-- Desabilitar RLS temporariamente para testes
ALTER TABLE logs_auditoria DISABLE ROW LEVEL SECURITY;

-- 2. Criar tabela de gabinete_pessoas
CREATE TABLE IF NOT EXISTS gabinete_pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  nome VARCHAR(255) NOT NULL,
  apelido VARCHAR(100),
  cpf VARCHAR(20),
  rg VARCHAR(20),
  data_nascimento VARCHAR(20),
  profissao VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'ELEITOR',
  celular1 VARCHAR(30),
  celular2 VARCHAR(30),
  telefone_res VARCHAR(30),
  telefone_com VARCHAR(30),
  whatsapp BOOLEAN DEFAULT true,
  email VARCHAR(255),
  cep VARCHAR(20),
  logradouro VARCHAR(255),
  numero VARCHAR(30),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100) DEFAULT 'São Paulo',
  uf VARCHAR(2) DEFAULT 'SP',
  votos_estimados INTEGER DEFAULT 0,
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  observacoes TEXT,
  cadastrado_por VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_pessoas DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_gabinete_pessoas_deputado ON gabinete_pessoas(id_deputado);
CREATE INDEX IF NOT EXISTS idx_gabinete_pessoas_categoria ON gabinete_pessoas(categoria);

-- 3. Criar tabela de gabinete_agendas
CREATE TABLE IF NOT EXISTS gabinete_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  compromisso TEXT NOT NULL,
  pauta_descritivo TEXT,
  local TEXT,
  link_maps TEXT,
  visibilidade VARCHAR(20) DEFAULT 'PUBLICO',
  status VARCHAR(20) DEFAULT 'CONFIRMADO',
  cor_destaque VARCHAR(20) DEFAULT '#005baa',
  assessor_responsavel VARCHAR(100),
  solicitado_por VARCHAR(100),
  alerta_sms BOOLEAN DEFAULT false,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  previsao_tempo JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_agendas DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_gabinete_agendas_data ON gabinete_agendas(data_inicio);
CREATE INDEX IF NOT EXISTS idx_gabinete_agendas_geolocation ON gabinete_agendas(latitude, longitude);

-- 4. Criar tabela de gabinete_audiencias
CREATE TABLE IF NOT EXISTS gabinete_audiencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  personalidade VARCHAR(255) NOT NULL,
  pauta TEXT NOT NULL,
  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
  assessor_responsavel VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Solicitada',
  cadastrado_por VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_audiencias DISABLE ROW LEVEL SECURITY;

-- 5. Criar tabela de gabinete_demandas
CREATE TABLE IF NOT EXISTS gabinete_demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  processo VARCHAR(100) NOT NULL,
  prioridade VARCHAR(50) DEFAULT 'Normal',
  id_pessoa UUID,
  id_entidade UUID,
  interessado_nome VARCHAR(255) NOT NULL,
  assunto TEXT NOT NULL,
  tipo_atendimento VARCHAR(100),
  destinatario_orgao VARCHAR(255),
  status VARCHAR(50) DEFAULT 'CADASTRADO',
  valor_estimado NUMERIC(15, 2) DEFAULT 0,
  assessor_responsavel VARCHAR(100),
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_demandas DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_gabinete_demandas_status ON gabinete_demandas(status);

-- 6. Criar tabela de gabinete_oficios
CREATE TABLE IF NOT EXISTS gabinete_oficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  numero_oficio VARCHAR(100) NOT NULL,
  data_emissao DATE NOT NULL,
  interessado VARCHAR(255) NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  assunto TEXT NOT NULL,
  assessor_responsavel VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Enviado',
  arquivo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_oficios DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_gabinete_oficios_numero ON gabinete_oficios(numero_oficio);

-- 7. Criar tabela de gabinete_ligacoes
CREATE TABLE IF NOT EXISTS gabinete_ligacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  data_hora TIMESTAMPTZ DEFAULT NOW(),
  ficha INTEGER,
  nome_solicitante VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  pessoa_procurada VARCHAR(255),
  assunto TEXT NOT NULL,
  atendido_por VARCHAR(100),
  retorno_necessario BOOLEAN DEFAULT false,
  status_retorno VARCHAR(50) DEFAULT 'Sem retorno',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_ligacoes DISABLE ROW LEVEL SECURITY;

-- 8. Criar tabela de gabinete_visitas
CREATE TABLE IF NOT EXISTS gabinete_visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  ficha INTEGER,
  data_horario TIMESTAMPTZ DEFAULT NOW(),
  tipo_visita VARCHAR(50) DEFAULT 'Recebida',
  lugar VARCHAR(255),
  id_pessoa UUID,
  pessoa_entidade VARCHAR(255) NOT NULL,
  atendido_por VARCHAR(100),
  assessor VARCHAR(100),
  motivo VARCHAR(255),
  resumo_visita TEXT,
  status VARCHAR(50) DEFAULT 'Atendido',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_visitas DISABLE ROW LEVEL SECURITY;

-- 9. Criar tabela de gabinete_recados
CREATE TABLE IF NOT EXISTS gabinete_recados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  data_recado TIMESTAMPTZ DEFAULT NOW(),
  de_quem VARCHAR(255) NOT NULL,
  para_quem VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  lido BOOLEAN DEFAULT false,
  prioridade VARCHAR(50) DEFAULT 'Normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_recados DISABLE ROW LEVEL SECURITY;

-- 10. Criar tabela de gabinete_entidades
CREATE TABLE IF NOT EXISTS gabinete_entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(30),
  tipo VARCHAR(100),
  responsavel VARCHAR(255),
  cargo_resp VARCHAR(100),
  telefone VARCHAR(30),
  email VARCHAR(255),
  cidade VARCHAR(100) DEFAULT 'São Paulo',
  uf VARCHAR(2) DEFAULT 'SP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_entidades DISABLE ROW LEVEL SECURITY;

-- 11. Criar tabela de gabinete_eventos
CREATE TABLE IF NOT EXISTS gabinete_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  data VARCHAR(20) NOT NULL,
  descricao TEXT,
  local_ou_estado VARCHAR(255),
  celular VARCHAR(30),
  nome_pessoa VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gabinete_eventos DISABLE ROW LEVEL SECURITY;

-- Inserir alguns assessores de exemplo
INSERT INTO gabinete_pessoas (id, id_deputado, nome, categoria, celular1, cidade, uf) VALUES
  (gen_random_uuid(), 'default', 'Marcelo Guaraldo', 'ASSESSOR', '41 99999-0001', 'Curitiba', 'PR'),
  (gen_random_uuid(), 'default', 'Nathalia Carvalho', 'ASSESSOR', '41 99999-0002', 'Curitiba', 'PR'),
  (gen_random_uuid(), 'default', 'Saulo Vieira', 'ASSESSOR', '41 99999-0003', 'Curitiba', 'PR')
ON CONFLICT DO NOTHING;

SELECT 'Tabelas criadas com sucesso!' as status;
